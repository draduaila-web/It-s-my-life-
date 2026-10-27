const H=require('../helper-client-rc393.js');
const events=new EventTarget();globalThis.addEventListener=events.addEventListener.bind(events);globalThis.removeEventListener=events.removeEventListener.bind(events);globalThis.dispatchEvent=events.dispatchEvent.bind(events);
const path=require('node:path'),fs=require('node:fs');
const previous=process.env.SESSION_CASES||path.join(__dirname,'../audit-satellite-auth-20261026');
const {serialLocks}=require(path.join(previous,'session-cases.js'));
(async()=>{let results=[];for(const file of ['session-cases.js','session-r2-cases.js','session-r3-cases.js','session-r4-cases.js'])results.push(...await require(path.join(previous,file)).run(H,serialLocks()));const summary={type:'PR66 session regression on invite client, synthetic transport/storage',passed:results.filter(r=>r.ok).length,failed:results.filter(r=>!r.ok).length,results};fs.writeFileSync(__dirname+'/session-results.json',JSON.stringify(summary,null,2));console.log(JSON.stringify({passed:summary.passed,failed:summary.failed}));if(summary.failed)process.exitCode=1;})();
