// No network. The original client is supplied via BERTHA_CLIENT to reproduce regressions.
const H=require(process.env.BERTHA_CLIENT||'../helper-client-rc393.js');
const {run,serialLocks}=require('./session-cases.js');
run(H,serialLocks()).then(results=>{for(const r of results)console.log(r.ok?'PASS '+r.name:'FAIL '+r.name+' (assertion failed)');console.log(JSON.stringify({passed:results.filter(r=>r.ok).length,failed:results.filter(r=>!r.ok).length}));if(results.some(r=>!r.ok))process.exitCode=1;});
