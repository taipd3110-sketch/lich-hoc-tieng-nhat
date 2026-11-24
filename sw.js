/* Service worker: mở nhanh và vẫn xem được khi mất mạng.
   Trang chính: lấy bản mới từ mạng trước, mất mạng thì dùng bản đã lưu.
   Icon, âm thanh, font: dùng bản đã lưu, cập nhật ngầm. Dữ liệu Firebase không đi qua đây. */
const CACHE="tai-nihongo-v46";
const SHELL=["./","./index.html","./manifest.webmanifest","./firebase-config.txt","./icons/icon-192.png","./icons/icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);
  if(/\.(mp4|webm)$/i.test(u.pathname))return; /* video: để trình duyệt tự xử lý Range */
  if(/firestore|googleapis\.com\/(identitytoolkit|securetoken)|firebaseapp|gstatic\.com\/firebasejs/.test(u.href)&&!/fonts/.test(u.href))return;
  if(r.mode==="navigate"||(u.origin===location.origin&&/\/(index\.html)?$|firebase-config\.txt$/.test(u.pathname))){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match("./"))));return;
  }
  if(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com/.test(u.host)){
    e.respondWith(caches.match(r).then(m=>{const net=fetch(r).then(res=>{if(res.ok||res.type==="opaque"){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>m);return m||net}));
  }
});
