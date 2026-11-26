"use client"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

type Props = {
  image?: string
  video?: string
  videoPortrait?: string
  degrade: string
  actif?: boolean
  proche?: boolean
  priorite?: boolean
}

export default function MediaFond({ image, video, videoPortrait, degrade, actif = true, proche = true, priorite = false }: Props) {
  const conteneur = useRef<HTMLDivElement | null>(null)
  const lecteur = useRef<HTMLVideoElement | null>(null)
  const [pret, setPret] = useState(false)
  const [autorise, setAutorise] = useState(false)
  const [portrait, setPortrait] = useState(false)
  const [visible, setVisible] = useState(false)
  const [dejaVu, setDejaVu] = useState(false)
  const [joue, setJoue] = useState(false)

  // Vidéos autorisées ? (pas si animations réduites ou économie de données) + orientation de l'écran
  useEffect(() => {
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const econome = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true
    setAutorise(!reduit && !econome)

    const mq = window.matchMedia("(orientation: portrait)")
    const maj = () => setPortrait(mq.matches)
    maj()
    mq.addEventListener("change", maj)
    setPret(true)

    return () => mq.removeEventListener("change", maj)
  }, [])

  // La scène est-elle à l'écran ? On ne charge la vidéo qu'une fois qu'on s'en approche
  useEffect(() => {
    const el = conteneur.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entree]) => {
        setVisible(entree.isIntersecting)
        if (entree.isIntersecting) setDejaVu(true)
      },
      { rootMargin: "200px 0px", threshold: 0 }
    )
    obs.observe(el)

    return () => obs.disconnect()
  }, [])

  const source = autorise && pret && dejaVu && proche ? (portrait && videoPortrait ? videoPortrait : video) : undefined

  useEffect(() => {
    const v = lecteur.current
    if (!v) return

    if (!source) {
      v.pause()
      if (v.currentSrc) {
        v.removeAttribute("src")
        v.load()
      }
      setJoue(false)
      return
    }

    v.muted = true
    if (actif && visible) {
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [source, actif, visible])

  return (
    <div ref={conteneur} className="absolute inset-0 overflow-hidden" style={{ backgroundImage: degrade }}>
      {image && <Image src={image} alt="" fill sizes="100vw" priority={priorite} className="object-cover" />}
      {(video || videoPortrait) && (
        <video ref={lecteur} src={source} muted loop playsInline preload="auto" aria-hidden="true" onPlaying={() => setJoue(true)} onLoadStart={() => setJoue(false)} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${joue ? "opacity-100" : "opacity-0"}`} />
      )}
    </div>
  )
}
