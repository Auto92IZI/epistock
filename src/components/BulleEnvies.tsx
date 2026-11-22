"use client"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

const TITRE = "Des envies particulières ?"
const TEXTE =
  "Du pollen, de la propolis, du chorizo, des pastels… Nous pouvons peut-être vous les trouver. Faites votre demande et nous reviendrons vers vous dès que nous aurons la réponse à votre besoin."

export default function BulleEnvies() {
  const p = usePathname()
  const [ouvert, setOuvert] = useState(false)
  const [nom, setNom] = useState("")
  const [tel, setTel] = useState("")
  const [message, setMessage] = useState("")
  const [piege, setPiege] = useState("")
  const [envoi, setEnvoi] = useState(false)
  const [err, setErr] = useState("")
  const [envoye, setEnvoye] = useState(false)

  useEffect(() => {
    if (!ouvert) return
    const fermer = (e: KeyboardEvent) => { if (e.key === "Escape") setOuvert(false) }
    window.addEventListener("keydown", fermer)
    return () => window.removeEventListener("keydown", fermer)
  }, [ouvert])

  if (p?.startsWith("/admin") || p === "/commander") return null

  async function envoyer(e: React.FormEvent) {
    e.preventDefault()
    setErr("")

    if (!nom.trim() || !tel.trim() || !message.trim()) {
      setErr("Merci de remplir les trois champs.")
      return
    }

    setEnvoi(true)
    try {
      const r = await fetch("/api/demande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, telephone: tel, message, site: piege }),
      })
      const d = await r.json()
      if (!r.ok || !d.success) throw new Error(d.message || "Une erreur est survenue.")
      setEnvoye(true)
      setNom("")
      setTel("")
      setMessage("")
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Une erreur est survenue.")
    } finally {
      setEnvoi(false)
    }
  }

  if (!ouvert) {
    return (
      <button
        onClick={() => { setOuvert(true); setEnvoye(false); setErr("") }}
        aria-expanded={false}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full bg-[#4F5D2A] px-3.5 py-2 text-xs font-medium sm:gap-2 sm:px-5 sm:py-3 sm:text-sm text-[#F4E9C8] shadow-lg ring-2 ring-[#C9A227]/70 transition hover:scale-105"
      >
        <span aria-hidden="true">✨</span>
        {TITRE}
      </button>
    )
  }

  return (
    <div
      role="dialog"
      aria-label={TITRE}
      className="bulle-ouvre fixed bottom-4 right-4 z-40 max-h-[85vh] w-[min(88vw,20rem)] overflow-y-auto rounded-3xl border border-[#C9A227]/50 bg-[#FBF7EC] p-5 shadow-2xl"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="serif text-2xl font-semibold text-[#4F5D2A]">{TITRE}</h2>
        <button onClick={() => setOuvert(false)} aria-label="Fermer" className="text-xl leading-none text-[#6b6a62] hover:text-[#2B2A26]">✕</button>
      </div>

      {envoye ? (
        <div className="mt-3 space-y-4">
          <p className="text-sm leading-relaxed text-[#3b3a35]">
            Merci ! Votre demande est bien arrivée. Nous revenons vers vous dès que nous avons la réponse à votre besoin.
          </p>
          <button onClick={() => setOuvert(false)} className="w-full rounded-full bg-[#4F5D2A] px-5 py-2.5 text-sm font-medium text-[#F4E9C8]">
            Fermer
          </button>
        </div>
      ) : (
        <form onSubmit={envoyer} className="mt-3 space-y-3">
          <p className="text-sm leading-relaxed text-[#3b3a35]">{TEXTE}</p>

          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Votre prénom"
            aria-label="Votre prénom"
            autoComplete="name"
            maxLength={100}
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
          />
          <input
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            placeholder="Votre téléphone"
            aria-label="Votre téléphone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Que recherchez-vous ?"
            aria-label="Votre demande"
            rows={3}
            maxLength={1000}
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
          />

          <input
            type="text"
            name="site"
            value={piege}
            onChange={(e) => setPiege(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />

          {err && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{err}</p>}

          <button type="submit" disabled={envoi} className="w-full rounded-full bg-[#4F5D2A] px-5 py-2.5 text-sm font-medium text-[#F4E9C8] disabled:opacity-50">
            {envoi ? "Envoi..." : "Envoyer ma demande"}
          </button>
          <p className="text-xs text-[#6b6a62]">Vos coordonnées servent uniquement à vous répondre.</p>
        </form>
      )}
    </div>
  )
}
