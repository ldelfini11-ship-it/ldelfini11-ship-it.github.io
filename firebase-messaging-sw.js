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
  const title   = (payload.notification && payload.notification.title) || 'Hábitos — Luca';
  const body    = (payload.notification && payload.notification.body)  || '';
  const tag     = (payload.data && payload.data.tag)     || 'habitos-' + Date.now();
  const habitId = (payload.data && payload.data.habitId) || '';
  const scriptUrl = (payload.data && payload.data.scriptUrl) || '';

  self.registration.showNotification(title, {
    body,
    icon:    '/icon-192.png',
    badge:   '/icon-192.png',
    tag,
    renotify: true,
    vibrate: [200, 100, 200],
    requireInteraction: false,
    data: { habitId, scriptUrl, tag },
    actions: [
      { action: 'complete', title: '✅ Concluído' },
      { action: 'snooze',   title: '⏰ +30 min'   }
    ]
  });
});

// Clique na notificação ou nos botões de ação
self.addEventListener('notificationclick', (event) => {
  const action    = event.action;
  const data      = event.notification.data || {};
  const habitId   = data.habitId   || '';
  const scriptUrl = data.scriptUrl || '';

  event.notification.close();

  if (action === 'complete' && habitId && scriptUrl) {
    // Marca o hábito como concluído via Apps Script (sem abrir o app)
    event.waitUntil(
      fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify({ _action: 'completeHabit', habitId: habitId })
      }).catch(() => {})
    );
    return;
  }

  if (action === 'snooze') {
    // Reagenda notificação pra daqui 30 minutos
    const notifTitle = event.notification.title;
    const notifBody  = event.notification.body;
    const notifTag   = data.tag || event.notification.tag;
    event.waitUntil(
      new Promise((resolve) => {
        setTimeout(() => {
          self.registration.showNotification(notifTitle, {
            body:    notifBody,
            icon:    '/icon-192.png',
            badge:   '/icon-192.png',
            tag:     notifTag + '_snooze',
            renotify: true,
            data:    data,
            actions: [
              { action: 'complete', title: '✅ Concluído' },
              { action: 'snooze',   title: '⏰ +30 min'   }
            ]
          });
          resolve();
        }, 30 * 60 * 1000); // 30 minutos
      })
    );
    return;
  }

  // Clique no corpo da notificação → abre/foca o app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
