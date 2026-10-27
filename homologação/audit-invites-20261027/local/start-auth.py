# Local disposable test infrastructure. Never points at the hosted project.
import os,json,secrets,base64,hmac,hashlib,time,subprocess,sys
from pathlib import Path
r=Path(sys.argv[1]).resolve()
p=r/'private.json'
if not p.exists():
 secret=secrets.token_hex(32)
 def enc(v):return base64.urlsafe_b64encode(json.dumps(v,separators=(',',':')).encode()).decode().rstrip('=')
 raw=enc({'alg':'HS256','typ':'JWT'})+'.'+enc({'role':'service_role','iss':'supabase','iat':int(time.time()),'exp':int(time.time())+86400})
 token=raw+'.'+base64.urlsafe_b64encode(hmac.new(secret.encode(),raw.encode(),hashlib.sha256).digest()).decode().rstrip('=')
 p.write_text(json.dumps({'jwt_secret':secret,'service':token}));p.chmod(0o600)
config=json.loads(p.read_text());env=os.environ.copy();env.update({'GOTRUE_API_HOST':'127.0.0.1','PORT':'8871','API_EXTERNAL_URL':'http://127.0.0.1:8871','GOTRUE_SITE_URL':'http://127.0.0.1:8873','GOTRUE_DB_DRIVER':'postgres','DATABASE_URL':'postgres://duaila@/'+(r/'database-name.txt').read_text().strip()+'?host='+str(r/'socket')+'&port=55467&sslmode=disable&options=-csearch_path%3Dauth','GOTRUE_DB_NAMESPACE':'auth','GOTRUE_DB_MAX_POOL_SIZE':'6','GOTRUE_JWT_SECRET':config['jwt_secret'],'GOTRUE_JWT_AUD':'authenticated','GOTRUE_JWT_ADMIN_ROLES':'service_role','GOTRUE_JWT_DEFAULT_GROUP_NAME':'authenticated','GOTRUE_EXTERNAL_EMAIL_ENABLED':'true','GOTRUE_MAILER_AUTOCONFIRM':'true','GOTRUE_DISABLE_SIGNUP':'true','LOG_LEVEL':'error'})
# No SMTP, telemetry exporter, external OAuth, callbacks or mail delivery configured.
print('Starting official Auth on 127.0.0.1:8871 with disposable local DB',flush=True)
subprocess.run([str(r/'auth-local')]+sys.argv[2:],env=env,check=True)
