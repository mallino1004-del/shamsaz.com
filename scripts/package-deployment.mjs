import {execFileSync} from 'node:child_process';
import {existsSync,mkdirSync,statSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';

const entries=['src','public','shared','server','database','scripts','data','docs','index.html','server.ts','package.json','package-lock.json','tsconfig.json','vite.config.ts','render.yaml','README.md','.gitignore','.env.example'];
for(const entry of entries)assert.ok(existsSync(entry),`Missing deployment input: ${entry}`);
mkdirSync('.local/deployment',{recursive:true});
const archive=resolve('.local/deployment/shamsaz-source.tar.gz');
execFileSync('tar.exe',['-czf',archive,...entries],{windowsHide:true});
const files=execFileSync('tar.exe',['-tzf',archive],{encoding:'utf8',windowsHide:true}).trim().split(/\r?\n/);
for(const file of files){
 const components=file.replaceAll('\\','/').split('/');
 assert.ok(!components.some(p=>['.git','.local','node_modules'].includes(p)),`Unexpected private/runtime directory: ${file}`);
 assert.ok(!components.some(p=>p.startsWith('.env')&&p!=='.env.example'),`Environment secret file in package: ${file}`);
 assert.ok(!/\.(dump|backup|log)$/i.test(file),`Unexpected runtime file: ${file}`);
}
const report={archive,bytes:statSync(archive).size,files:files.length,checks:['explicit source allowlist','no .env secrets','no .local runtime data','no Git credentials','no node_modules'],published:false};
writeFileSync('.local/deployment/package-report.json',JSON.stringify(report,null,2)+'\n');
console.log(`Deployment source packaged: ${files.length} entries; ${(report.bytes/1048576).toFixed(1)} MB. No cloud deployment occurred.`);
