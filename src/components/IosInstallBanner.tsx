"use client"

import { useEffect, useState } from "react"

export default function IosInstallBanner() {
  const [afficher, setAfficher] = useState(false)

  useEffect(() => {
    const estIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
    const estSafari =
      /safari/.test(window.navigator.userAgent.toLowerCase()) &&
      !/crios|fxios|edgios/.test(window.navigator.userAgent.toLowerCase())
    const dejaInstalle = (window.navigator as any).standalone === true
    const dejaFerme = localStorage.getItem("ios-install-banner-ferme") === "true"

    if (estIOS && estSafari && !dejaInstalle && !dejaFerme) {
      setAfficher(true)
    }
  }, [])

  function fermer() {
    setAfficher(false)
    localStorage.setItem("ios-install-banner-ferme", "true")
  }

  if (!afficher) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-xl bg-white border shadow-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">📲 Installez DI Shop sur votre iPhone</p>
          <p className="text-sm text-gray-600 mt-1">
            Appuyez sur{" "}
            <span className="inline-block align-middle">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="inline"
              >
                <path d="M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>{" "}
            (Partager) en bas de Safari, puis <strong>"Sur l'écran d'accueil"</strong>.
          </p>
        </div>

        <button
          onClick={fermer}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
