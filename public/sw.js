self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", () => {
  self.clients.claim()
})

self.addEventListener("fetch", () => {
  // Pas de mise en cache, on laisse passer les requêtes normalement
})

self.addEventListener("push", (event) => {
  if (!event.data) return

  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/logo.png",
      badge: "/logo.png",
      data: { url: data.url || "/admin" },
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const url = event.notification.data?.url || "/admin"

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})
