# Two actual PostgreSQL transactions: replacement versus claim. Synthetic only.
import subprocess,json,uuid,sys,time,select,hashlib
from pathlib import Path
r=Path(sys.argv[1]).resolve(); mode=sys.argv[2]; psql=[str(r/'pg17/bin/psql'),'-X','-qAt','-v','ON_ERROR_STOP=1','-h',str(r/'socket'),'-p','55467','-d',(r/'database-name.txt').read_text().strip()]
def q(v):return "'"+str(v).replace("'","''")+"'"
def sql(s):
 p=subprocess.run(psql,input=s,text=True,capture_output=True,timeout=20)
 if p.returncode:raise RuntimeError(p.stderr[:150])
 return p.stdout.strip()
def expr(op,arg):return 'public.bertha_hml_code_service('+q(op)+','+q(json.dumps(arg))+'::jsonb)'
def rpc(op,arg):return json.loads(sql("BEGIN;SET LOCAL request.jwt.claims='{\"role\":\"service_role\"}';SELECT "+expr(op,arg)+';COMMIT;'))
owner=str(uuid.uuid4());h=hashlib.sha256(owner.encode()).hexdigest();base={'owner_id':owner,'kind':'kids','key_id':'a'*64}
sql('INSERT INTO auth.users(id,email,email_confirmed_at) VALUES('+q(owner)+','+q(owner+'@example.invalid')+',now());')
m=json.loads(sql('BEGIN;SET LOCAL request.jwt.claims='+q(json.dumps({'role':'authenticated','sub':owner}))+';SELECT public.bertha_hml_invite_prepare('+q(json.dumps({'local_id':owner,'name':'Fictitious race','kind':'kids'}))+'::jsonb);COMMIT;'));base['member_id']=m['id'];op=rpc('reserve',base);uid=op['user_id']
sql('INSERT INTO auth.users(id,email,email_confirmed_at,raw_app_meta_data) VALUES('+q(uid)+','+q(uid+'@example.invalid')+',now(),'+q(json.dumps({'bertha_code_member':m['id']}))+'::jsonb);')
rpc('finish',{**base,'operation_id':op['id'],'user_id':uid,'code_hash':h});new=rpc('reserve',{**base,'previous_operation':op['id']})
a=subprocess.Popen(psql,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,bufsize=1)
a.stdin.write("BEGIN;SET LOCAL deadlock_timeout='200ms';SET LOCAL request.jwt.claims='{\"role\":\"service_role\"}';SELECT id FROM public.bertha_hml_members WHERE id="+q(m['id'])+" FOR UPDATE;\n");a.stdin.flush();assert select.select([a.stdout],[],[],10)[0];a.stdout.readline()
claim={'kind':'kids','code_hash':h,'nonce_hash':h,'ip_hash':h}
b=subprocess.Popen(psql,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
b.stdin.write("BEGIN;SET LOCAL application_name='bertha-claim-race';SET LOCAL request.jwt.claims='{\"role\":\"service_role\"}';SELECT "+expr('claim',claim)+";COMMIT;\n");b.stdin.close();b.stdin=None
for _ in range(100):
 if sql("SELECT count(*) FROM pg_stat_activity WHERE application_name='bertha-claim-race' AND wait_event_type='Lock'")=='1':break
 time.sleep(.05)
else:raise AssertionError('claim did not wait')
finish={**base,'operation_id':new['id'],'user_id':uid,'code_hash':hashlib.sha256((h+'new').encode()).hexdigest()}
aout,aerr=a.communicate('SELECT '+expr('finish',finish)+';COMMIT;\n',timeout=15);bout,berr=b.communicate(timeout=15)
deadlock='deadlock detected' in aerr+berr
if mode=='before':assert deadlock,'expected lock inversion not reproduced'
else:assert not deadlock and a.returncode==0 and b.returncode==0 and not bout.strip(),'replacement must revoke old claim without deadlock'
# A deadlock rolls back safely; same durable intent must remain recoverable.
assert rpc('finish',finish)['state']=='ready'
out={'mode':mode,'deadlock_reproduced':deadlock,'recovery_same_operation':'passed','passed':True,'real_postgresql':True};(r/'logs'/('claim-race-'+mode+'.json')).write_text(json.dumps(out,indent=2));print(json.dumps(out))
