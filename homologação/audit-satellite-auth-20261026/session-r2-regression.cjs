const H=require(process.env.BERTHA_CLIENT||'../helper-client-rc393.js');
const {serialLocks}=require('./session-cases.js');
require('./session-r2-cases.js').run(H,serialLocks()).then(results=>{for(const r of results)console.log((r.ok?'PASS ':'FAIL ')+r.name);console.log(JSON.stringify({passed:results.filter(r=>r.ok).length,failed:results.filter(r=>!r.ok).length}));if(results.some(r=>!r.ok))process.exitCode=1;});
