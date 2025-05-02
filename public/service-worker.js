self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  const title = data.title || 'Tìm Phòng Trọ';
  const options = {
    body: data.body || 'Có thông báo mới',
    icon: data.icon || '/images/logo.png',
    badge: data.badge || '/images/badge.png',
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const url = event.notification.data.url;
  
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(function(windowClients) {
      // Kiểm tra xem có cửa sổ nào đang mở không
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // Nếu có cửa sổ đang mở, focus vào nó
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      
      // Nếu không có cửa sổ nào đang mở, mở một cửa sổ mới
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
