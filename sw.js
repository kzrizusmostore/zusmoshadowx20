
const CACHE_NAME = 'kzr-media-cache-v1';

// Ekstensi file yang dianggap "media" dan bakal di-cache
const MEDIA_EXT_RE = /\.(jpe?g|png|gif|webp|svg|avif|bmp|mp4|webm|mov|mp3|wav|ogg|m4a|aac)(\?.*)?$/i;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Cuma tangani request GET
  if (req.method !== 'GET') return;

  // Cuma tangani file media (berdasarkan ekstensi di URL)
  if (!MEDIA_EXT_RE.test(req.url)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(req).then((cachedResponse) => {
        const networkFetch = fetch(req)
          .then((networkResponse) => {
            // Simpan hasil terbaru ke cache buat next load
            // (ok untuk response normal, dan tetap disimpan untuk opaque
            // response cross-origin biar tetap kepakai walau gak kebaca isinya)
            if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
              cache.put(req, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse); // offline/gagal -> fallback ke cache lama kalau ada

        // Kalau udah ada di cache, langsung balikin (INSTAN),
        // update cache tetap jalan di belakang layar.
        return cachedResponse || networkFetch;
      })
    )
  );
});
uat next load
            // (ok untuk response normal, dan tetap disimpan untuk opaque
            // response cross-origin biar tetap kepakai walau gak kebaca isinya)
            if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
              cache.put(req, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse); // offline/gagal -> fallback ke cache lama kalau ada

        // Kalau udah ada di cache, langsung balikin (INSTAN),
        // update cache tetap jalan di belakang layar.
        return cachedResponse || networkFetch;
      })
    )
  );
});
