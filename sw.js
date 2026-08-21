const CACHE = "juance-ipad-v19";
const SHELL = ["/", "/manifest.webmanifest", "/favicon.svg"];

async function precacheApplication() {
  const cache = await caches.open(CACHE);
  const visited = new Set();
  async function cacheAndDiscover(url) {
    const absolute = new URL(url, self.location.origin);
    if (absolute.origin !== self.location.origin || visited.has(absolute.href)) return;
    visited.add(absolute.href);
    const response = await fetch(absolute.href, { cache: "no-cache" });
    if (!response.ok) throw new Error(`无法预缓存 ${absolute.pathname}`);
    await cache.put(absolute.href, response.clone());
    const type = response.headers.get("content-type") || "";
    if (!type.includes("text/html") && !type.includes("javascript")) return;
    const text = await response.text();
    const references = type.includes("text/html")
      ? [...text.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(match => match[1])
      : [...text.matchAll(/(?:from\s*|import\s*\()["']([^"']+)["']/g)].map(match => match[1]);
    await Promise.all(references.filter(reference => reference.startsWith("/") || reference.startsWith(".")).map(reference => cacheAndDiscover(new URL(reference, absolute.href).href)));
  }
  await Promise.all(SHELL.map(cacheAndDiscover));
}

self.addEventListener("install", event => {
  event.waitUntil(precacheApplication().then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE && key.startsWith("juance-")).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  const fetchAndCache = () => fetch(event.request).then(async response => {
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(event.request, response.clone());
    }
    return response;
  });
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetchAndCache()));
    return;
  }
  event.respondWith(fetchAndCache().catch(() => caches.match(event.request).then(cached => cached || caches.match("/"))));
});
