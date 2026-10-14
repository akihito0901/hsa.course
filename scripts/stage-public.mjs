import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root=process.cwd(),out=path.resolve(root,'public');
// API は Cloudflare Pages Functions（functions/api/*.js）。wrangler がデプロイ時にまとめる
for(const api of ['checkout','webhook','admin-students']){
 const file=path.join(root,'functions','api',api+'.js');
 if(!fs.existsSync(file)||spawnSync(process.execPath,['--check',file]).status!==0)throw Error('Missing or invalid API: '+api);
}
if(path.dirname(out)!==root||path.basename(out)!=='public')throw Error('Invalid output directory');
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
for(const file of ['index.html','login.html','admin.html'])fs.copyFileSync(file,path.join(out,file));
// fs.cpSync は Windows（Node 24・日本語のパス）で落ちたので、1ファイルずつコピーする
const copyDir=(src,dst)=>{fs.mkdirSync(dst,{recursive:true});for(const e of fs.readdirSync(src,{withFileTypes:true})){const a=path.join(src,e.name),b=path.join(dst,e.name);e.isDirectory()?copyDir(a,b):fs.copyFileSync(a,b);}};
for(const dir of ['assets','lessons','images'])copyDir(dir,path.join(out,dir));
console.log('Staged public pages and assets. Source materials and QA reports are excluded.');
