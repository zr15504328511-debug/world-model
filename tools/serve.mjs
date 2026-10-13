import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const port=Number(process.env.PORT||3190);
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.glb':'model/gltf-binary','.zip':'application/zip','.txt':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost');let f=path.resolve(root,'.'+decodeURIComponent(u.pathname));if(f!==root&&!f.startsWith(root+path.sep))throw Error('path');if((await fs.stat(f)).isDirectory())f=path.join(f,'index.html');const b=await fs.readFile(f);res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(b);}catch{res.writeHead(404);res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:'+port));
