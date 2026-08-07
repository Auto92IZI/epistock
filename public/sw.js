// Service worker minimal, juste nécessaire pour que le téléphone
// propose l'installation de l'application
self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", () => {
  self.clients.claim()
})

self.addEventListener("fetch", () => {
  // Pas de mise en cache pour l'instant, on laisse passer les requêtes normalement
})
