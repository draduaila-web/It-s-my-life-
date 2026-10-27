import os,json,subprocess,sys
from pathlib import Path
r=Path(sys.argv[1]).resolve();script=Path(__file__).with_name('edge-runtime.ts').resolve();c=json.loads((r/'private.json').read_text());env=os.environ.copy();env.update({'SUPABASE_URL':'http://127.0.0.1:8872','SUPABASE_SERVICE_ROLE_KEY':c['service'],'DENO_DIR':str(r/'deno-cache')})
subprocess.run([str(r/'deno-2.9.8/deno'),'run','--no-prompt','--allow-env=SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY','--allow-net=127.0.0.1:8872,127.0.0.1:8873',str(script)],env=env,check=True)
