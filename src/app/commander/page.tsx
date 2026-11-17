"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Ligne, lirePanier, ecrirePanier } from "@/lib/panier"

export default function Commande() {
  const [p, setP] = useState<Ligne[]>([])
  const [nom, setNom] = useState("")
  const [tel, setTel] = useState("")
  const [age, setAge] = useState(false)
  const [err, setErr] = useState("")
  const [envoi, setEnvoi] = useState(false)
  const [num, setNum] = useState<number | null>(null)

  useEffect(() => { setP(lirePanier()) }, [])

  const maj = (l: Ligne[]) => { setP(l); ecrirePanier(l) }
  const total = p.reduce((t, l) => t + l.prix * l.quantite, 0)

  async function valider() {
    setErr("")
    if (!nom.trim() || !tel.trim()) { setErr("Merci d'indiquer votre nom et votre téléphone."); return }
    if (!age) { setErr("Merci de confirmer que vous avez 18 ans ou plus."); return }
    setEnvoi(true)
    try {
      const r = await fetch("/api/commande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientNom: nom.trim(), clientTelephone: tel.trim(),
          dateRetrait: new Date().toISOString().split("T")[0], total,
          lignes: p.map((l) => ({ produit_id: l.id, quantite: l.quantite, prix_unitaire: l.prix })),
        }),
      })
      const d = await r.json()
      if (!r.ok || !d.success) throw new Error(d.message || "Erreur lors de la commande.")
      ecrirePanier([]); setP([]); setNum(d.commandeId)
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur lors de la commande.")
    } finally {
      setEnvoi(false)
    }
  }

  if (num) return (
    <main className="mx-auto max-w-xl px-5 py-20 text-center">
      <h1 className="serif text-4xl font-semibold">Merci !</h1>
      <p className="mt-4">Commande n°{num} bien reçue. Elle sera généralement prête sous 24 à 48 h ; nous vous enverrons un message dès qu'elle le sera.</p>
      <Link href="/" className="mt-8 inline-block underline">Retour à l'accueil</Link>
    </main>
  )

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="serif text-4xl font-semibold">Ma commande</h1>
      {p.length === 0 ? (
        <p className="mt-6">Votre commande est vide. <Link href="/" className="underline">Découvrir nos produits</Link></p>
      ) : (
        <>
          <div className="mt-6 divide-y rounded-2xl border bg-white">
            {p.map((l) => (
              <div key={l.id} className="flex items-center gap-3 p-4">
                <div className="flex-1">
                  <p className="font-medium">{l.nom}</p>
                  <p className="text-sm text-[#6b6a62]">{l.format} · {l.prix.toFixed(2)} €</p>
                </div>
                <input type="number" min={1} value={l.quantite} className="w-16 rounded border p-1 text-center"
                  onChange={(e) => maj(p.map((x) => x.id === l.id ? { ...x, quantite: Math.max(1, parseInt(e.target.value) || 1) } : x))} />
                <p className="w-20 text-right font-semibold">{(l.prix * l.quantite).toFixed(2)} €</p>
                <button onClick={() => maj(p.filter((x) => x.id !== l.id))} className="text-sm text-red-600">✕</button>
              </div>
            ))}
          </div>
          <p className="mt-4 text-right text-xl font-semibold">Total : {total.toFixed(2)} €</p>

          <div className="mt-8 space-y-3">
            <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom et prénom" className="w-full rounded-lg border bg-white px-4 py-3" />
            <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="Téléphone" type="tel" className="w-full rounded-lg border bg-white px-4 py-3" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={age} onChange={(e) => setAge(e.target.checked)} /> Je confirme avoir 18 ans ou plus</label>
            <p className="rounded-lg border bg-white p-3 text-sm text-[#5b5a53]">Retrait uniquement. Votre commande sera généralement prête sous 24 à 48 h ; un message vous sera envoyé dès qu'elle sera disponible.</p>
            {err && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</p>}
            <button onClick={valider} disabled={envoi} className="w-full rounded-full bg-[#2B2A26] px-5 py-3 font-medium text-white disabled:opacity-50">
              {envoi ? "Envoi..." : "Valider ma commande"}
            </button>
          </div>
        </>
      )}
    </main>
  )
}
