// Service worker — notifications Web Push du Portail Cocktail Média
self.addEventListener('push', function (event) {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch (e) { data = {} }
  const title = data.title || 'Cocktail Média'
  const options = {
    body: data.body || '',
    icon: '/cos-icone-noir.png',
    badge: '/cos-icone-noir.png',
    data: { url: data.url || '/admin' },
    vibrate: [80, 40, 80],
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/admin'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (const client of list) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
