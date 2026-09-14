import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(),port=Number(process.env.HSA_PORT||4317);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon'};
http.createServer((req,res)=>{try{const url=new URL(req.url,'http://localhost');let p=decodeURIComponent(url.pathname);if(p==='/')p='/index.html';const target=path.resolve(root,'.'+p);const ext=path.extname(target);if(!target.startsWith(root+path.sep)||!mime[ext]||!/^\/(index\.html|login\.html|admin\.html|assets\/[^/]+|lessons\/[^/]+|images\/[^/]+)$/.test(p)){res.writeHead(404);res.end('Not found');return;}const data=fs.readFileSync(target);res.writeHead(200,{'Content-Type':mime[ext],'Cache-Control':'no-store'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log('HSA preview: http://127.0.0.1:'+port));
