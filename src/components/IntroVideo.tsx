"use client"
import { useCallback, useEffect, useRef, useState } from "react"

const FONDU = 900 // durée du fondu vers l'accueil (ms)
const CONSERVATION = 30 * 60 // l'intro ne se rejoue pas pendant 30 minutes (secondes)

export default function IntroVideo() {
  const [etat, setEtat] = useState<"actif" | "fondu" | "fini">("actif")
  const video = useRef<HTMLVideoElement | null>(null)
  const termine = useRef(false)

  const terminer = useCallback(() => {
    if (termine.current) return
    termine.current = true
    setEtat("fondu")
    window.setTimeout(() => setEtat("fini"), FONDU)
  }, [])

  useEffect(() => {
    try {
      document.cookie = `intro-vu=1; path=/; max-age=${CONSERVATION}; SameSite=Lax`
    } catch {}

    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const econome = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true
    const v = video.current

    // Pas d'animation pour les personnes qui l'ont désactivée ou qui économisent leurs données
    if (reduit || econome || !v) {
      termine.current = true
      setEtat("fini")
      return
    }

    const portrait = window.matchMedia("(orientation: portrait)").matches
    v.muted = true
    v.src = portrait ? "/intro/intro-portrait.mp4" : "/intro/intro-paysage.mp4"

    const attente = window.setTimeout(() => terminer(), 4000) // la vidéo ne démarre pas (réseau lent)
    const limite = window.setTimeout(() => terminer(), 7000) // sécurité
    const demarree = () => window.clearTimeout(attente)
    v.addEventListener("playing", demarree, { once: true })

    // Si le navigateur refuse le lancement automatique, on passe directement à l'accueil
    v.play().catch(() => terminer())

    const touche = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") terminer()
    }
    window.addEventListener("keydown", touche)

    return () => {
      window.clearTimeout(attente)
      window.clearTimeout(limite)
      v.removeEventListener("playing", demarree)
      window.removeEventListener("keydown", touche)
    }
  }, [terminer])

  const fini = etat === "fini"

  // Bloque le défilement pendant l'intro
  useEffect(() => {
    if (fini) return
    const html = document.documentElement
    const avant = html.style.overflow
    html.style.overflow = "hidden"
    return () => { html.style.overflow = avant }
  }, [fini])

  if (fini) return null

  return (
    <div
      aria-label="Animation d'introduction"
      className={`intro-overlay fixed inset-0 z-[100] overflow-hidden transition-opacity ease-out ${etat === "fondu" ? "pointer-events-none opacity-0" : "opacity-100"}`}
      style={{ transitionDuration: `${FONDU}ms` }}
    >
      <video ref={video} muted playsInline preload="auto" aria-hidden="true" onEnded={() => terminer()} onError={() => terminer()} className="h-full w-full object-cover" style={{ transform: etat === "fondu" ? "scale(1.06)" : "scale(1)", transition: `transform ${FONDU}ms ease-out` }} />
      <button
        onClick={() => terminer()}
        className="absolute left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-sm text-[#4F5D2A] underline"
        style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        Passer l'intro
      </button>
    </div>
  )
}
