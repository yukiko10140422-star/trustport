// Service Worker for Company 秘書室 PWA
const CACHE_VERSION = 'v1';
const CACHE_NAME = `company-chat-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// App Shell - キャッシュ対象
const PRECACHE_URLS = [
  OFFLINE_URL,
];

// インストール: プリキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// アクティベート: 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// フェッチ: ネットワーク優先、失敗時にオフラインページ
self.addEventListener('fetch', (event) => {
  // API, SSE, 認証系はキャッシュしない
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('/auth/') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        // HTMLリクエストならオフラインページを返す
        if (event.request.headers.get('Accept')?.includes('text/html')) {
          return caches.match(OFFLINE_URL);
        }
        return new Response('Offline', { status: 503 });
      })
    )
  );
});
