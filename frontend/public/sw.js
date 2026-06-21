// public/sw.js — runs in the background, separate from the page.
// When the server sends a push message, this is what actually shows
// the notification, even if the app tab is closed.
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Progress Tracker', body: 'You have an update.' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.png',
      badge: '/icon.png',
    })
  );
});

// Clicking the notification focuses (or opens) the app tab.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientsArr) => {
      if (clientsArr.length > 0) return clientsArr[0].focus();
      return self.clients.openWindow('/');
    })
  );
});
