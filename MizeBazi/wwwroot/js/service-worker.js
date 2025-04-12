
//if ('serviceWorker' in navigator) {
//    navigator.serviceWorker.register('/js/service-worker.js')
//        .then((registration) => {
//            console.log('Service Worker ثبت شد:', registration);
//        })
//        .catch((error) => {
//            console.log('خطا در ثبت Service Worker:', error);
//        });
//}

const CACHE_NAME = 'my-app-cache-v1';
const ASSETS_TO_CACHE = [
    '/',

    '/lib/jalaali.min.js',
    '/lib/signalr.min.js',
    '/lib/msgpack.min.js"></script>',
    '/lib/signalr-protocol-msgpack.min.js',
    '/lib/jquery/dist/jquery.min.js',

    '/js/site.js',
    '/js/room.js',
    '/js/webHome.js',
    '/js/webMain.js',

    '/css/site.css',
    '/css/room.css',
    '/css/webHome.css',
    '/css/webMain.css',


    '/img/room.png',
    '/img/1.png',
    '/img/2.png',
    '/img/3.png',
    '/img/4.png',
    '/img/WheelFortune.jpg',


];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});