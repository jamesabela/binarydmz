const CACHE_NAME = 'binary-dmz-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './icon.png',
    './src/main.js',
    './src/scenes/Boot.js',
    './src/scenes/Intro.js',
    './src/scenes/Menu.js',
    './src/scenes/Game.js',
    './assets/background.jpg',
    './assets/certificate_bg.png',
    './assets/intro_cartoon.png',
    './assets/ship_1.png',
    './assets/ship_2.png',
    './assets/ship_3.png',
    './assets/ship_4.png',
    './assets/ship_5.png',
    './assets/ship_6.png',
    './assets/explosion.png',
    './assets/success.wav',
    'https://cdnjs.cloudflare.com/ajax/libs/phaser/3.60.0/phaser.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});
