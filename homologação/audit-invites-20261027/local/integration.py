# Real Deno Edge + official local Supabase Auth + PostgreSQL. Loopback adapter is NOT PostgREST.
import json,urllib.request,urllib.error,uuid,secrets,sys,subprocess,concurrent.futures
from pathlib import Path
r=Path(sys.argv[1]).resolve();cfg=json.loads((r/'private.json').read_text());results=[]
def request(path,data=None,token=None,port=8872):
 body=json.dumps(data).encode() if data is not None else None;headers={'Content-Type':'application/json'}
 if token:headers['Authorization']='Bearer '+token
 req=urllib.request.Request('http://127.0.0.1:'+str(port)+path,data=body,headers=headers)
 try:
  with urllib.request.urlopen(req,timeout=45) as res:return res.status,json.loads(res.read())
 except urllib.error.HTTPError as e:return e.code,json.loads(e.read())
def sql(s):
 p=subprocess.run([str(r/'pg17/bin/psql'),'-X','-qAt','-v','ON_ERROR_STOP=1','-h',str(r/'socket'),'-p','55467','-d',(r/'database-name.txt').read_text().strip()],input=s,text=True,capture_output=True,timeout=20)
 if p.returncode:raise RuntimeError('Local verification SQL failed')
 return p.stdout.strip()
def owner():
 uid=str(uuid.uuid4());email='owner-'+uid+'@example.invalid';password=secrets.token_urlsafe(30)
 status,a=request('/auth/v1/admin/users',{'id':uid,'email':email,'password':password,'email_confirm':True},cfg['service']);assert status==200,('owner create status',status)
 status,s=request('/auth/v1/token?grant_type=password',{'email':email,'password':password});assert status==200,('owner login status',status)
 return s['access_token']
auth=owner();other=owner()
def issue(local,extra=None,token=None):return request('/functions/v1/bertha-code-access',{'op':'issue','member':{'local_id':local,'kind':'kids','name':'Pessoa fictícia','permissions':{'casa':True}},**(extra or {})},token or auth,8873)
def counts(member):
 assert str(uuid.UUID(member))==member
 return json.loads(sql("SELECT json_build_object('accounts',(SELECT count(*) FROM auth.users WHERE raw_app_meta_data->>'bertha_code_member'='"+member+"'),'codes',(SELECT count(*) FROM private.bertha_hml_codes WHERE member_id='"+member+"'),'reservations',(SELECT count(*) FROM private.bertha_hml_invite_accounts WHERE member_id='"+member+"'))"))
def passed(name):
 results.append({'name':name,'status':'passed'});(r/'logs/integration-progress.json').write_text(json.dumps({'completed':results,'status':'running'},indent=2))
for stage in ['prepare','reserve','create','finish']:
 local='lost-'+stage+'-'+str(uuid.uuid4());request('/__fault',{'stage':stage},cfg['service']);status,first=issue(local);status,second=issue(local);assert status==200 and second.get('state')=='ready',('retry',stage,status,second.get('state'));assert counts(second['member_id'])=={'accounts':1,'codes':1,'reservations':1};status,third=issue(local);assert third['code']==second['code'] and third['operation_id']==second['operation_id'];passed('lost real '+stage+' response, retry one account/code')
local='race-'+str(uuid.uuid4())
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:rows=list(pool.map(lambda _:issue(local),range(8)))
assert all(status==200 for status,_ in rows),('concurrent issue statuses',[status for status,_ in rows]);assert len({x['operation_id'] for _,x in rows})==1;assert len({x['code'] for _,x in rows})==1;current=rows[0][1];assert counts(current['member_id'])=={'accounts':1,'codes':1,'reservations':1};passed('8 concurrent real Auth/SQL emissions converge')
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:rows=list(pool.map(lambda _:issue(local,{'previous_operation':current['operation_id']}),range(8)))
assert all(status==200 for status,_ in rows);assert len({x['operation_id'] for _,x in rows})==1;new=rows[0][1];assert new['operation_id']!=current['operation_id'];assert counts(new['member_id'])['accounts']==1 and counts(new['member_id'])['codes']==2;passed('8 concurrent explicit replacements reuse Auth account')
status,_=issue(local,{'op':'revoke','previous_operation':current['operation_id']});assert status==400;status,recovered=issue(local);assert recovered['code']==new['code'];passed('stale revoke cannot cancel new real operation')
status,_=issue(local,{'previous_operation':new['operation_id']},other);assert status==400;passed('foreign Owner cannot resume another operation')
nonce=str(uuid.uuid4());status,_=request('/functions/v1/bertha-code-access',{'op':'claim','kind':'adult','nonce':nonce,'code':new['code']},port=8873);assert status==403;passed('wrong type rejected by real SQL')
status,claim=request('/functions/v1/bertha-code-access',{'op':'claim','kind':'kids','nonce':nonce,'code':new['code']},port=8873);assert status==200 and claim.get('session',{}).get('access_token');status,me=request('/auth/v1/user',token=claim['session']['access_token']);assert status==200 and me['id']==claim['member']['user_id'];passed('real Auth session from claimed code')
status,replay=request('/functions/v1/bertha-code-access',{'op':'claim','kind':'kids','nonce':nonce,'code':new['code']},port=8873);assert status==200 and replay['member']['user_id']==me['id'];passed('lost claim response same nonce recovers real Auth access')
status,_=request('/functions/v1/bertha-code-access',{'op':'claim','kind':'kids','nonce':str(uuid.uuid4()),'code':new['code']},port=8873);assert status==403;status,used=issue(local);assert used['state']=='used' and 'code' not in used;passed('different nonce rejected; used result never reissued')
# Confirm code principal cannot promote itself into an Owner.
status,_=issue('forbidden-'+str(uuid.uuid4()),token=claim['session']['access_token']);assert status==403;passed('code principal cannot issue as Owner')
report={'type':'Real Deno 2.9.8, Supabase Auth 2.197.0 and PostgreSQL 17.11 over loopback test adapter (not PostgREST)','passed':len(results),'failed':0,'results':results};(r/'logs/integration-results.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
