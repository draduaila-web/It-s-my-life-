# Kill the actual Deno process after committed RPC/Auth stages, restart unchanged handler.
from pathlib import Path
import os,time,socket,threading
exec(Path(__file__).with_name('integration.py').read_text().split('auth=owner();other=owner()')[0])
auth=owner();env=os.environ.copy();env.update({'SUPABASE_URL':'http://127.0.0.1:8872','SUPABASE_SERVICE_ROLE_KEY':cfg['service'],'DENO_DIR':str(r/'deno-cache')})
cmd=[str(r/'deno-2.9.8/deno'),'run','--no-prompt','--allow-env=SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY','--allow-net=127.0.0.1:8872,127.0.0.1:8873',str(Path(__file__).with_name('edge-runtime.ts').resolve())]
log=open(r/'logs/edge-crash-runtime.log','a');p=None;results=[]
def start():
 p=subprocess.Popen(cmd,env=env,stdout=log,stderr=log)
 for _ in range(100):
  try:
   with socket.create_connection(('127.0.0.1',8873),timeout=.2):return p
  except OSError:time.sleep(.05)
 raise RuntimeError('Edge did not start')
def issue(local):return request('/functions/v1/bertha-code-access',{'op':'issue','member':{'local_id':local,'kind':'kids','name':'Fictitious Edge crash'}},auth,8873)
try:
 p=start()
 for stage in ['prepare','reserve','create','finish']:
  marker=r/'hold-marker.txt';marker.write_text('');local='edge-crash-'+str(uuid.uuid4());request('/__fault',{'stage':stage+'-hold'},cfg['service']);out=[]
  def run():
   try:out.append(issue(local))
   except Exception:out.append('connection interrupted')
  t=threading.Thread(target=run);t.start()
  for _ in range(300):
   if marker.read_text()==stage:break
   time.sleep(.05)
  else:raise AssertionError('stage not reached: '+stage)
  p.kill();p.wait(timeout=10);request('/__release',{},cfg['service']);t.join(10);assert not t.is_alive()
  p=start();status,result=issue(local);assert status==200 and result.get('code'),(stage,status)
  mid=result['member_id'];assert str(uuid.UUID(mid))==mid
  assert sql("SELECT count(*) FROM auth.users WHERE raw_app_meta_data->>'bertha_code_member'='"+mid+"'")=='1'
  assert sql("SELECT count(*) FROM private.bertha_hml_codes WHERE member_id='"+mid+"'")=='1'
  status,again=issue(local);assert status==200 and again['operation_id']==result['operation_id'] and again['code']==result['code']
  results.append({'stage':stage,'status':'passed','actual_deno_process_killed':True,'accounts':1,'codes':1});print('PASS actual Edge crash after '+stage,flush=True)
finally:
 request('/__release',{},cfg['service'])
 if p and p.poll() is None:p.terminate();p.wait(timeout=10)
 log.close()
out={'passed':len(results),'failed':0,'transport':'real Auth/PostgreSQL through local fault adapter, not PostgREST','results':results};(r/'logs/edge-crash-results.json').write_text(json.dumps(out,indent=2))
