# Actual Auth account committed by a worker killed before binding/finalization.
# Uses real APIs/SQL, not a full Edge-process kill injection.
import os,hashlib
from pathlib import Path
exec(Path(__file__).with_name('integration.py').read_text().split('auth=owner();other=owner()')[0])
auth=owner();local='crash-'+str(uuid.uuid4())
status,m=request('/rest/v1/rpc/bertha_hml_invite_prepare',{'arg':{'local_id':local,'name':'Fictitious interrupted worker','kind':'kids'}},auth);assert status==200
status,u=request('/auth/v1/user',token=auth);assert status==200
key=hashlib.sha256(('bertha-hml-invite-key-v1:'+cfg['service']).encode()).hexdigest()
status,o=request('/rest/v1/rpc/bertha_hml_code_service',{'op':'reserve','arg':{'owner_id':u['id'],'member_id':m['id'],'kind':'kids','key_id':key}},cfg['service']);assert status==200
worker="""import json,sys,urllib.request,os
p=json.load(sys.stdin)
r=urllib.request.Request('http://127.0.0.1:8872/auth/v1/admin/users',data=json.dumps(p['body']).encode(),headers={'Content-Type':'application/json','Authorization':'Bearer '+p['token']})
with urllib.request.urlopen(r,timeout=30) as response: status=response.status
os._exit(9 if status==200 else 10)
"""
payload={'token':cfg['service'],'body':{'id':o['user_id'],'email':'satellite-'+o['user_id']+'@bertha.example.invalid','password':secrets.token_urlsafe(30),'email_confirm':True,'app_metadata':{'bertha_code_member':m['id']}}}
p=subprocess.run([sys.executable,'-c',worker],input=json.dumps(payload),text=True,capture_output=True,timeout=40);assert p.returncode==9
assert sql("SELECT count(*) FROM auth.users WHERE id='"+o['user_id']+"'")=='1'
assert sql("SELECT user_id IS NULL FROM public.bertha_hml_members WHERE id='"+m['id']+"'")=='t'
status,result=request('/functions/v1/bertha-code-access',{'op':'issue','member':{'local_id':local,'kind':'kids','name':'Fictitious interrupted worker'}},auth,8873)
assert status==200 and result.get('code'),('resume status',status,'state',result.get('state'))
assert sql("SELECT count(*) FROM auth.users WHERE raw_app_meta_data->>'bertha_code_member'='"+m['id']+"'")=='1'
assert sql("SELECT user_id::text FROM public.bertha_hml_members WHERE id='"+m['id']+"'")==o['user_id']
out={'passed':1,'failed':0,'scenario':'Real Auth creation worker exits after commit before binding; unchanged Edge resumes reserved UUID without duplicate account','limit':'Worker-stage interruption, not kill of Edge runtime process'}
(r/'logs/orphan-recovery.json').write_text(json.dumps(out,indent=2));print(json.dumps(out))
