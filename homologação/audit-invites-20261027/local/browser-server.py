# Isolated UI transport: real Auth/Edge APIs; no fabricated API responses.
from pathlib import Path
exec(Path(__file__).with_name('integration.py').read_text().split('auth=owner();other=owner()')[0])
from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
uid=str(uuid.uuid4());email='browser-'+uid+'@example.invalid';pw=secrets.token_urlsafe(30)
s,a=request('/auth/v1/admin/users',{'id':uid,'email':email,'password':pw,'email_confirm':True},cfg['service']);assert s==200
s,session=request('/auth/v1/token?grant_type=password',{'email':email,'password':pw});assert s==200
member={'id':'browser-'+str(uuid.uuid4()),'name':'Pessoa fictícia QA','role':'kids','permissions':{'tasks':True}}
source=Path(__file__).parents[2]
class Handler(BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def do_GET(self):self.route(None)
 def do_POST(self):self.route(self.rfile.read(min(int(self.headers.get('Content-Length','0')),10000)))
 def route(self,body):
  try:
   if self.path=='/bootstrap':self.reply(200,json.dumps({'session':session,'member':member}).encode());return
   if self.path=='/counts':
    counts=sql("SELECT json_build_object('accounts',(SELECT count(*) FROM auth.users WHERE raw_app_meta_data->>'bertha_code_member'=m.id::text),'codes',(SELECT count(*) FROM private.bertha_hml_codes WHERE member_id=m.id),'operations',(SELECT count(*) FROM private.bertha_hml_invite_operations WHERE member_id=m.id)) FROM public.bertha_hml_members m WHERE local_id='"+member['id']+"'")
    self.reply(200,(counts or '{}').encode());return
   if self.path=='/fault':
    request('/__fault',{'stage':'finish'},cfg['service']);self.reply(200,b'{}');return
   if self.path.startswith('/api/'):
    path=self.path[4:];port=8873 if path.startswith('/functions/v1/') else 8872
    if not (path.startswith('/auth/v1/') or path.startswith('/rest/v1/') or path.startswith('/functions/v1/')):raise ValueError()
    token=self.headers.get('Authorization','').removeprefix('Bearer ');status,result=request(path,json.loads(body) if body else None,token,port);self.reply(status,json.dumps(result).encode());return
   paths={'/':'browser-real.html','/browser-real.js':'browser-real.js','/helper-client-rc393.js':'../../helper-client-rc393.js','/satellite-invites-rc369.js':'../../satellite-invites-rc369.js'}
   if self.path not in paths:self.reply(404,b'{}');return
   p=Path(__file__).parent/paths[self.path];self.reply(200,p.read_bytes(),'text/html' if self.path=='/' else 'text/javascript')
  except Exception:self.reply(500,b'{"message":"Local QA transport failure"}')
 def reply(self,status,data,ctype='application/json'):
  self.send_response(status);self.send_header('Content-Type',ctype);self.send_header('Cache-Control','no-store');self.send_header('Content-Security-Policy',"default-src 'self'; connect-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
print('Real Auth browser fixture 127.0.0.1:8875, synthetic identity only',flush=True)
ThreadingHTTPServer(('127.0.0.1',8875),Handler).serve_forever()
