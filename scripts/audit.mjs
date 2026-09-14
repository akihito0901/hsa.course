import fs from 'node:fs';
import vm from 'node:vm';
const cats = vm.runInNewContext(fs.readFileSync('assets/data.js','utf8')+';CATEGORIES');
const rows = cats.flatMap(c=>c.lessons.map(l=>{
 const s=fs.readFileSync(l.url,'utf8');
 const a=s.match(/<article[^>]*>([\s\S]*?)<\/article>/)[1];
 const text=a.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
 return {file:l.url,chars:text.length,text};
}));
if(!fs.existsSync('content-audit.before.json'))fs.writeFileSync('content-audit.before.json',JSON.stringify(rows,null,2));
console.log('TOTAL',rows.length,rows.reduce((n,r)=>n+r.chars,0));
for(const r of rows.filter(r=>!process.argv[2]||new RegExp(process.argv[2]).test(r.file)))console.log('\n'+r.file+' ['+r.chars+'] '+r.text);
