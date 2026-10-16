(function(root){'use strict';
// One pre-RC395 snapshot of functional HML data, kept outside its clear() namespace.
// Authentication and push credentials are deliberately excluded.
var key='bertha-hml-backup::before-audit395';
try{var storage=root.localStorage;if(storage.getItem(key)){root.BerthaAuditBackup395={ok:true,existing:true};return;}
var entries={},prefix='bertha-hml::';for(var i=0;i<storage.length;i++){var k=storage.key(i);if(k&&k.startsWith(prefix)&&!/(auth|token|push|__bertha)/i.test(k))entries[k]=storage.getItem(k);}
var payload=JSON.stringify({version:1,baseline:'f312d87cb10cc70e5c2052faaa6ed93839667881',createdAt:new Date().toISOString(),entries:entries});
storage.setItem(key,payload);if(storage.getItem(key)!==payload)throw Error('Snapshot verification failed');root.BerthaAuditBackup395={ok:true,count:Object.keys(entries).length};
}catch(e){root.BerthaAuditBackup395={ok:false};console.warn('[BERTH.A HML] O backup local não pôde ser salvo; os dados existentes foram preservados.');}
})(window);
