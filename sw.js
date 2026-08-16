const CACHE='sala-jogos-offline-v3';
const FILES=['./index.html','./jogo-da-velha.html','./ludo.html','./paciencia-trilha.html','./hunt.html','./occult-trail.html','./v4-enhance.css','./v4-enhance.js','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
async function withV4(response,url){
  if(!response)return response;
  const path=url.pathname;
  if(!path.endsWith('/hunt.html')&&!path.endsWith('/occult-trail.html'))return response;
  let html=await response.text();
  if(!html.includes('v4-enhance.css'))html=html.replace('</head>','<link rel="stylesheet" href="./v4-enhance.css"></head>');
  if(!html.includes('v4-enhance.js'))html=html.replace('</body>','<script src="./v4-enhance.js"></script></body>');
  const headers=new Headers(response.headers);headers.set('content-type','text/html; charset=utf-8');
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(e.request.mode==='navigate'){
    e.respondWith((async()=>{
      let r;
      try{r=await fetch(e.request);if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}}
      catch(err){r=await caches.match(e.request)||await caches.match('./index.html')}
      return withV4(r,url);
    })());
    return;
  }
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{let x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x));return r})));
});
