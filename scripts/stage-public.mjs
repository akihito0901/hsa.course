import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root=process.cwd(),out=path.resolve(root,'public');
for(const api of ['checkout','webhook','admin-students']){
 const file=path.join(root,'api',api+'.js');
 if(!fs.existsSync(file)||spawnSync(process.execPath,['--check',file]).status!==0)throw Error('Missing or invalid API: '+api);
}
const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
if(!config.functions?.['api/*.js'])throw Error('API function configuration required');
if(path.dirname(out)!==root||path.basename(out)!=='public')throw Error('Invalid output directory');
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
for(const file of ['index.html','login.html','admin.html'])fs.copyFileSync(file,path.join(out,file));
for(const dir of ['assets','lessons','images'])fs.cpSync(dir,path.join(out,dir),{recursive:true});
console.log('Staged public pages and assets. Source materials and QA reports are excluded.');
