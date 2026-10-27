# Real PostgreSQL connections; no HTTP/modelled transactions. Synthetic local DB only.
import subprocess,concurrent.futures,json,uuid,sys,time,hashlib,select
from pathlib import Path
r=Path(sys.argv[1]).resolve();psql=[str(r/'pg17/bin/psql'),'-X','-qAt','-v','ON_ERROR_STOP=1','-h',str(r/'socket'),'-p','55467','-d',(r/'database-name.txt').read_text().strip()]
def q(s):return "'"+str(s).replace("'","''")+"'"
def sql(s):
 p=subprocess.run(psql,input=s,text=True,capture_output=True,timeout=30)
 if p.returncode:raise RuntimeError(p.stderr[:300])
 return p.stdout.strip()
def rpc(op,arg,delay=0):
 s="BEGIN;SET LOCAL ROLE service_role;SET LOCAL request.jwt.claims='{\"role\":\"service_role\"}';SELECT public.bertha_hml_code_service("+q(op)+','+q(json.dumps(arg))+"::jsonb);"
 if delay:s+='SELECT pg_sleep('+str(delay)+');'
 s+='COMMIT;'
 return json.loads(sql(s).splitlines()[0])
owner=str(uuid.uuid4());base={'owner_id':owner,'kind':'kids','key_id':'a'*64};results=[]
sql("INSERT INTO auth.users(id,email,email_confirmed_at) VALUES("+q(owner)+','+q(owner+'@example.invalid')+",now());")
m=json.loads(sql("BEGIN;SET LOCAL ROLE authenticated;SET LOCAL request.jwt.claims="+q(json.dumps({'role':'authenticated','sub':owner}))+";SELECT public.bertha_hml_invite_prepare("+q(json.dumps({'local_id':'concurrency-'+owner,'name':'Fictitious concurrency','kind':'kids'}))+"::jsonb);COMMIT;"));base['member_id']=m['id']
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:rows=list(pool.map(lambda _:rpc('reserve',base,.05),range(24)))
assert len({x['id'] for x in rows})==1 and len({x['user_id'] for x in rows})==1;results.append('24 concurrent reserves produce one operation and reserved Auth UUID')
op=rows[0];uid=op['user_id'];sql('INSERT INTO auth.users(id,email,email_confirmed_at,raw_app_meta_data) VALUES('+q(uid)+','+q(uid+'@example.invalid')+',now(),'+q(json.dumps({'bertha_code_member':m['id']}))+'::jsonb);')
finish={**base,'operation_id':op['id'],'user_id':uid,'code_hash':hashlib.sha256(owner.encode()).hexdigest()}
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:rows=list(pool.map(lambda _:rpc('finish',finish,.03),range(24)))
assert len({x['id'] for x in rows})==1 and all(x['state']=='ready' for x in rows);assert sql('SELECT count(*) FROM private.bertha_hml_codes WHERE member_id='+q(m['id']))=='1';results.append('24 concurrent finalizations produce one code, one account binding')
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:rows=list(pool.map(lambda _:rpc('reserve',{**base,'previous_operation':op['id']},.03),range(16)))
assert len({x['id'] for x in rows})==1 and rows[0]['id']!=op['id'];results.append('16 replacements with same predecessor converge')
new=rows[0]
for action in ['finish','revoke']:
 try:rpc(action,finish)
 except RuntimeError:pass
 else:raise AssertionError('stale '+action+' accepted')
results.append('stale completion and cancellation rejected')
# Disconnect a transaction after reserve but before COMMIT: the reservation cannot survive rollback.
next_arg={**base,'previous_operation':new['id']}
p=subprocess.Popen(psql,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,bufsize=1)
p.stdin.write("BEGIN;SET LOCAL ROLE service_role;SET LOCAL request.jwt.claims='{\"role\":\"service_role\"}';SELECT public.bertha_hml_code_service('reserve',"+q(json.dumps(next_arg))+"::jsonb);\n");p.stdin.flush();ready=select.select([p.stdout],[],[],15)[0];assert ready,'reservation did not return';interrupted=json.loads(p.stdout.readline());p.terminate();p.wait(timeout=10)
recovered=rpc('reserve',base);assert recovered['id']==new['id'];assert interrupted['id']!=new['id'];results.append('terminated connection rolls back uncommitted replacement')
# Committed result deliberately discarded, fresh connection recovers identical operation.
committed=rpc('reserve',next_arg);assert rpc('reserve',base)['id']==committed['id'];results.append('lost committed reserve response recovered on fresh connection')
out={'type':'Real PostgreSQL connections; manually seeded synthetic auth.users, not Auth HTTP creation','passed':len(results),'failed':0,'results':results};(r/'logs/concurrency-results.json').write_text(json.dumps(out,indent=2));print(json.dumps(out,indent=2))
