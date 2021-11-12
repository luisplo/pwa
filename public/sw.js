const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';

const APP_SHELL = [
	'static/js/main.chunk.js',
	'static/js/bundle.js',
	'static/js/vendors~main.chunk.js',
	'index.html',
	'/',
];

const self = this

self.addEventListener('install', e => {
	const cacheStatic = caches.open(STATIC_CACHE).then(cache => {
		cache.addAll(APP_SHELL);
	});
	e.waitUntil(Promise.all([cacheStatic]));
})

self.addEventListener('activate', e => {
	const response = caches.keys().then(keys => {
		keys.forEach(key => {
			if (key !== STATIC_CACHE && key.includes('static')) {
				return caches.delete(key)
			}
		})
	})
	e.waitUntil(response);
})

self.addEventListener('fetch', e => {
	const response = caches.match(e.request).then(res => {
		if (res) {
			return res;
		} else {
			return fetch(e.request).then(newRes => {
				return updateCacheDynamic(DYNAMIC_CACHE, e.request, newRes);
			})
		}
	})
	e.respondWith(response);
})

function updateCacheDynamic(dynamicCache, req, res) {
	if (res.ok) {
		return caches.open(dynamicCache).then(cache => {
			cache.put(req, res.clone());
			return res.clone();
		})
	} else {
		return res;
	}
}