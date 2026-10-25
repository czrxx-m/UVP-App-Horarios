/* Service worker para GitHub Pages: caché versionada, actualización de archivos y respaldo sin conexión. */
const CACHE_PREFIX = "mi-horario-uvp-";
const CACHE_NAME = `${CACHE_PREFIX}v3`;
const OLD_CACHE_PREFIXES = ["mi-horario-agronomia-"];
const LOCAL_FILES = [
  "./", "index.html", "manifest.json", "data/horario.js",
  "js/utils.js", "js/schedule.js", "js/render.js", "js/app.js",
  "styles/tokens.css", "styles/base.css", "styles/layout.css", "styles/components.css", "styles/v2.css",
  "assets/agronomy-doodles.svg", "assets/agronomy-doodles.png", "assets/field-horizon.svg", "assets/app-mark.svg", "assets/app-mark-maskable.svg",
  "assets/uvp-symbol.png", "assets/uvp-logo-light.png", "assets/uvp-lockup.png", "assets/field-orbit.svg", "assets/soil-profile.svg", "assets/seedling-loader.svg",
  "icons/favicon.svg", "icons/favicon-32.png", "icons/apple-touch-icon.png",
  "icons/app-icon-192.png", "icons/app-icon-512.png", "icons/app-icon-maskable-512.png"
];
const NETWORK_TIMEOUT_MS = 3200;

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(LOCAL_FILES.map(path => new Request(path, { cache: "reload" })));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name =>
      ((name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME) || OLD_CACHE_PREFIXES.some(prefix => name.startsWith(prefix)))
    ).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

function withTimeout(promise, milliseconds) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("network timeout")), milliseconds))]);
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;

  const cacheUrl = new URL(request.url);
  cacheUrl.search = "";
  cacheUrl.hash = "";
  const cachePromise = caches.open(CACHE_NAME);
  const networkPromise = (async () => {
    const response = await fetch(request);
    if (!response || !response.ok) throw new Error(`HTTP ${response ? response.status : "sin respuesta"}`);
    const cache = await cachePromise;
    await cache.put(cacheUrl.href, response.clone()).catch(() => {});
    return response;
  })();
  // Mantiene viva la descarga cuando se devuelve enseguida una copia en caché.
  event.waitUntil(networkPromise.then(() => undefined).catch(() => undefined));

  event.respondWith((async () => {
    const cache = await cachePromise;
    const cached = await cache.match(cacheUrl.href);
    if (!cached) {
      try { return await networkPromise; }
      catch (_) {
        if (request.mode === "navigate") {
          const startPage = await cache.match(new URL("index.html", self.registration.scope).href);
          if (startPage) return startPage;
        }
        return new Response("Sin conexión.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    }
    try { return await withTimeout(networkPromise, NETWORK_TIMEOUT_MS); }
    catch (_) { return cached; }
  })());
});
