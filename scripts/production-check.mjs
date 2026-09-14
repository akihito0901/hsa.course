import fs from 'node:fs';
import vm from 'node:vm';
const base='https://hsa-course.vercel.app';
const cats=vm.runInNewContext(fs.readFileSync('assets/data.js','utf8')+';CATEGORIES');
const paths=['index.html','login.html',...cats.flatMap(c=>c.lessons.map(l=>l.url)),...['campus.css','campus.js','reader.css','reader.js','auth.js','lesson-guard.js'].map(f=>'assets/'+f)];
const results=[];
let cursor=0;
await Promise.all(Array.from({length:6},async()=>{while(cursor<paths.length){const p=paths[cursor++];const r=await fetch(base+'/'+p,{signal:AbortSignal.timeout(30000)});const actual=await r.text();const expected=fs.readFileSync(p,'utf8');const match=actual.replace(/\r\n/g,'\n')===expected.replace(/\r\n/g,'\n');results.push({path:p,status:r.status,match});}}));
for(const p of ['content/base.json','docs/REVISION.md','content-audit.before.json']){const r=await fetch(base+'/'+p);results.push({path:p,status:r.status,match:r.status===404});}
for(const [p,method,status] of [['api/checkout','GET',405],['api/admin-students','GET',401],['api/webhook','POST',400]]){const r=await fetch(base+'/'+p,{method,signal:AbortSignal.timeout(30000)});results.push({path:p,status:r.status,match:r.status===status});}
const failures=results.filter(r=>!r.match);
fs.writeFileSync('docs/production-check.json',JSON.stringify({date:new Date().toISOString(),base,results,failures},null,2)+'\n');
console.log(JSON.stringify({checked:results.length,failures},null,2));if(failures.length)process.exitCode=1;
