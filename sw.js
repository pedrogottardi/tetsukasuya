// Service Worker para CoffeeGen - Método 4:6 Tetsu Kasuya
// Versão 1.0 - Otimizado para performance

const CACHE_NAME = 'coffeegen-v1.0';
const STATIC_CACHE_NAME = 'coffeegen-static-v1.0';

// Recursos críticos para cache
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  'src/css/styles.min.css',
  'src/js/script.min.js',
  'assets/icons/favicon.ico'
];

// Recursos de imagens para cache
const IMAGE_RESOURCES = [
  'assets/images/webp/balance.webp',
  'assets/images/webp/lemon.webp',
  'assets/images/webp/honey.webp',
  'assets/images/webp/muscle.webp',
  'assets/images/webp/bone.webp',
  'assets/images/webp/arrows.webp',
  'assets/images/webp/dica.webp',
  'assets/images/webp/sun.webp',
  'assets/images/webp/moon.webp',
  'assets/images/webp/tetsu-kasuya.webp'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Cache recursos críticos
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return cache.addAll(CRITICAL_RESOURCES);
      }),
      // Cache imagens
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(IMAGE_RESOURCES);
      })
    ]).then(() => {
      return self.skipWaiting();
    })
  );
});

// Ativar Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Remove todos os caches antigos
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Ignorar requisições não-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Estratégia Cache First para recursos estáticos
  if (isStaticResource(url.pathname)) {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          return response;
        }
        
        return fetch(request).then(fetchResponse => {
          // Cachear apenas respostas válidas
          if (fetchResponse.status === 200) {
            const responseClone = fetchResponse.clone();
            const cacheName = isCriticalResource(url.pathname) ? STATIC_CACHE_NAME : CACHE_NAME;
            
            caches.open(cacheName).then(cache => {
              cache.put(request, responseClone);
            });
          }
          
          return fetchResponse;
        });
      }).catch(() => {
        // Fallback para página offline (se necessário)
        if (request.destination === 'document') {
          return caches.match('/');
        }
      })
    );
  }
  // Estratégia Network First para APIs e recursos dinâmicos
  else {
    event.respondWith(
      fetch(request).then(response => {
        return response;
      }).catch(() => {
        return caches.match(request);
      })
    );
  }
});

// Verificar se é recurso estático
function isStaticResource(pathname) {
  return pathname.endsWith('.css') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.webp') ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.jpg') ||
         pathname.endsWith('.ico') ||
         pathname === '/' ||
         pathname === '/index.html';
}

// Verificar se é recurso crítico
function isCriticalResource(pathname) {
  return CRITICAL_RESOURCES.includes(pathname);
}

// Limpar cache periodicamente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

