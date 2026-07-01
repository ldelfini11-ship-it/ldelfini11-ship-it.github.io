// firebase-messaging-sw.js
// Service Worker do Firebase Cloud Messaging — precisa ficar na RAIZ do site
// (mesmo nível do index.html), pois o escopo do SW é baseado na pasta onde ele está.

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCBi2uXgOcCYmBBoacBm9mrFKG7oqEQPqE",
  authDomain: "habitos-luca.firebaseapp.com",
  projectId: "habitos-luca",
  storageBucket: "habitos-luca.firebasestorage.app",
  messagingSenderId: "947907360103",
  appId: "1:947907360103:web:766cf8234aa41c9523ebc2"
});

const messaging = firebase.messaging();

// Quando o app está FECHADO ou em background, o FCM entrega aqui.
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'Hábitos — Luca';
  const body  = (payload.notification && payload.notification.body)  || '';
  const tag   = (payload.data && payload.data.tag) || 'habitos-' + Date.now();

  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag,
    renotify: true,
    vibrate: [200, 100, 200],
    requireInteraction: false
  });
});

// Clique na notificação → abre/foca o app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (clients.openWindow) return clients.openWindow('/Luca/');
    })
  );
});
