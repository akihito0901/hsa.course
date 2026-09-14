import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
const cats=vm.runInNewContext(fs.readFileSync('assets/data.js','utf8')+';CATEGORIES');
const problems=[];let internalLinks=0;
const files=['index.html',...cats.flatMap(c=>c.lessons.map(l=>l.url))];
for(const file of files){
 const s=fs.readFileSync(file,'utf8');
 const ids=[...s.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 if(new Set(ids).size!==ids.length)problems.push(file+': duplicate IDs');
 if((s.match(/<h1\b/g)||[]).length!==1)problems.push(file+': H1 count');
 if(s.includes('\uFFFD'))problems.push(file+': invalid text encoding');
 for(const m of s.matchAll(/\b(?:href|src)="([^"]+)"/g)){
  const raw=m[1];if(/^(https?:|data:|mailto:|tel:)/.test(raw))continue;
  const [p,h]=raw.split('#');const target=p?path.normalize(path.join(path.dirname(file),p.split('?')[0])):file;
  internalLinks++;
  if(!fs.existsSync(target)){problems.push(file+': missing '+target);continue;}
  if(h&&!fs.readFileSync(target,'utf8').includes('id="'+h+'"'))problems.push(file+': missing anchor '+raw);
 }
 if(file.startsWith('lessons/')){
  const slug=file.replace('lessons/','').replace('.html',''),[cat,num]=slug.split('-');
  if(!s.includes('data-lesson="'+cat+'-'+(Number(num)-1)+'"'))problems.push(file+': incompatible saved ID');
  for(const cls of ['lesson-objective','practice-steps','worked-example','worksheet','checklist','quiz-question','notes-section','video-status','lesson-guard.js'])if(!s.includes(cls))problems.push(file+': missing '+cls);
  const headings=[...s.matchAll(/<h([23])\b/g)].map(m=>Number(m[1]));if(headings[0]!==2)problems.push(file+': heading hierarchy');
 }
}
for(const file of [...fs.readdirSync('assets').filter(x=>x.endsWith('.js')).map(x=>'assets/'+x),...fs.readdirSync('scripts').filter(x=>x.endsWith('.mjs')).map(x=>'scripts/'+x)]){
 const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status)problems.push(file+': '+r.stderr);
}
const count=cats.reduce((n,c)=>n+c.lessons.length,0);if(count!==71||cats.length!==7)problems.push('Course/lesson count changed');
const banned=['好きな言葉＋誕生月日','著作権を気にせず使える','有料版のほうが圧倒的に賢い','ファーストビューで9割','AIは8割、自分は2割','一度上位に入れば、その後もずっと'];
for(const file of files)for(const t of banned)if(fs.readFileSync(file,'utf8').includes(t))problems.push(file+': stale claim '+t);
const result={pages:files.length,courses:cats.length,lessons:count,internalLinks,problems};fs.writeFileSync('docs/structural-check.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));if(problems.length)process.exit(1);
