# HTTP adapter for real Auth and real PostgreSQL RPC. NOT PostgREST.
# Faults drop actual completed responses; no replacement Auth or SQL behavior.
from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from pathlib import Path
import urllib.request,urllib.error,json,subprocess,sys,threading
r=Path(sys.argv[1]).resolve();cfg=json.loads((r/'private.json').read_text());fault=None;lock=threading.Lock();release=threading.Event()
def sql(query):
 p=subprocess.run([str(r/'pg17/bin/psql'),'-X','-qAt','-v','ON_ERROR_STOP=1','-h',str(r/'socket'),'-p','55467','-d',(r/'database-name.txt').read_text().strip()],input=query,text=True,capture_output=True)
 if p.returncode:raise RuntimeError('Local SQL operation failed: '+p.stderr.splitlines()[0][:180])
 return p.stdout.strip()
def quote(s):return "'"+str(s).replace("'","''")+"'"
def auth(path,body=None,headers=None):
 req=urllib.request.Request('http://127.0.0.1:8871'+path,data=body,headers=headers or {},method='POST' if body is not None else 'GET')
 try:
  with urllib.request.urlopen(req,timeout=30) as res:return res.status,res.read()
 except urllib.error.HTTPError as e:return e.code,e.read()
class Handler(BaseHTTPRequestHandler):
 def log_message(self,*args):pass # No tokens, body, codes or names in logs.
 def do_GET(self):self.handle_request(None)
 def do_POST(self):self.handle_request(self.rfile.read(min(int(self.headers.get('Content-Length','0')),10000)))
 def handle_request(self,body):
  global fault
  try:
   token=self.headers.get('Authorization','')
   if self.path=='/__release':
    if token!='Bearer '+cfg['service']:self.reply(403,b'{}');return
    release.set();self.reply(200,b'{}');return
   if self.path=='/__fault':
    if token!='Bearer '+cfg['service']:self.reply(403,b'{}');return
    with lock:fault=json.loads(body)['stage'];release.clear()
    self.reply(200,b'{}');return
   stage=''
   if self.path.startswith('/auth/v1/'):
    stage='create' if self.path=='/auth/v1/admin/users' and body else 'auth'
    status,result=auth(self.path[len('/auth/v1'):],body,{'Authorization':token,'Content-Type':'application/json'})
   elif self.path=='/rest/v1/rpc/bertha_hml_invite_prepare':
    status,user=auth('/user',headers={'Authorization':token});u=json.loads(user)
    if status!=200:self.reply(status,user);return
    arg=json.loads(body)['arg'];stage='prepare';claims=json.dumps({'role':'authenticated','sub':u['id']})
    result=sql('BEGIN; SET LOCAL ROLE authenticated; SET LOCAL request.jwt.claims='+quote(claims)+'; SELECT public.bertha_hml_invite_prepare('+quote(json.dumps(arg))+'::jsonb); COMMIT;').encode();status=200
   elif self.path=='/rest/v1/rpc/bertha_hml_code_service':
    if token!='Bearer '+cfg['service']:self.reply(403,b'{}');return
    data=json.loads(body);stage=data['op']
    result=sql('BEGIN; SET LOCAL ROLE service_role; SET LOCAL request.jwt.claims=\'{"role":"service_role"}\'; SELECT public.bertha_hml_code_service('+quote(data['op'])+','+quote(json.dumps(data['arg']))+'::jsonb); COMMIT;').encode();status=200
   else:self.reply(404,b'{}');return
   with lock:
    drop=status==200 and fault==stage
    hold=status==200 and fault==stage+'-hold'
    if drop or hold:fault=None
   if hold:
    (r/'hold-marker.txt').write_text(stage)
    release.wait(60)
   if drop:self.connection.shutdown(2);self.connection.close();return
   self.reply(status,result or b'null')
  except Exception:self.reply(500,b'{"message":"Local test adapter error"}')
 def reply(self,status,data):
  self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
print('Local HTTP adapter 127.0.0.1:8872; real Auth and SQL, no external network',flush=True)
ThreadingHTTPServer(('127.0.0.1',8872),Handler).serve_forever()
