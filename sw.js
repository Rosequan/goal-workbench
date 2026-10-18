// 离线缓存：打开过一次以后，没网也能打开页面。改了 index.html 记得把版本号 +1。
// 只缓存这个网站自己的文件；发给 GitHub 的同步请求（带令牌、带私有数据）一律不碰。
const CACHE = "goal-workbench-v8";
const FILES = ["./", "index.html", "manifest.json", "icon-180.png", "icon-192.png", "icon-512.png", "bg.jpg"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  // 先用网络（拿到最新版），没网再用缓存
  e.respondWith(fetch(e.request).then((r) => {
    const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request)));
});
