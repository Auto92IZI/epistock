"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { chiffresTelephone, ouvrirLien } from "@/lib/contact"

type Demande = {
  id: number
  nom: string
  telephone: string
  message: string
  statut: string
  created_at: string
}

export default function DemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    fetch("/api/admin/demandes")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setDemandes(d.demandes)
        setChargement(false)
      })
      .catch(() => setChargement(false))
  }, [])

  function texteContact(d: Demande) {
    return `Bonjour ${d.nom}, c'est Alma Lusa, au sujet de votre demande : « ${d.message.slice(0, 80)} ».`
  }

  function whatsapp(d: Demande) {
    ouvrirLien(`https://wa.me/${chiffresTelephone(d.telephone)}?text=${encodeURIComponent(texteContact(d))}`, true)
  }

  function sms(d: Demande) {
    const separateur = /iPhone|iPad|iPod/.test(navigator.userAgent) ? "&" : "?"
    ouvrirLien(`sms:+${chiffresTelephone(d.telephone)}${separateur}body=${encodeURIComponent(texteContact(d))}`, false)
  }

  async function changerStatut(d: Demande, statut: string) {
    const res = await fetch(`/api/admin/demandes/${d.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    })
    const data = await res.json()

    if (data.success) {
      setDemandes((anciennes) => anciennes.map((x) => (x.id === d.id ? { ...x, statut } : x)))
    } else {
      alert("Erreur lors de la mise à jour")
    }
  }

  async function supprimer(d: Demande) {
    if (!window.confirm(`Supprimer la demande de ${d.nom} ?`)) return

    const res = await fetch(`/api/admin/demandes/${d.id}`, { method: "DELETE" })
    const data = await res.json()

    if (data.success) {
      setDemandes((anciennes) => anciennes.filter((x) => x.id !== d.id))
    } else {
      alert("Erreur lors de la suppression")
    }
  }

  if (chargement) {
    return <div className="p-8">Chargement des demandes...</div>
  }

  const nouvelles = demandes.filter((d) => d.statut !== "Traitée")
  const traitees = demandes.filter((d) => d.statut === "Traitée")

  const carte = (d: Demande) => (
    <div key={d.id} className={`space-y-3 rounded-xl border p-4 shadow-sm ${d.statut === "Traitée" ? "bg-gray-50 opacity-70" : ""}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold">{d.nom} · {d.telephone}</p>
        <p className="text-xs text-gray-500">
          {new Date(d.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
        </p>
      </div>
      <p className="whitespace-pre-line text-sm">{d.message}</p>
      <div className="flex flex-wrap gap-2 text-sm">
        <button onClick={() => whatsapp(d)} className="rounded bg-green-600 px-3 py-1.5 text-white">WhatsApp</button>
        <button onClick={() => sms(d)} className="rounded bg-purple-600 px-3 py-1.5 text-white">💬 SMS</button>
        {d.statut === "Traitée" ? (
          <button onClick={() => changerStatut(d, "Nouvelle")} className="rounded bg-gray-200 px-3 py-1.5">Rouvrir</button>
        ) : (
          <button onClick={() => changerStatut(d, "Traitée")} className="rounded bg-gray-700 px-3 py-1.5 text-white">✅ Marquer comme traitée</button>
        )}
        <button onClick={() => supprimer(d)} className="px-2 py-1.5 text-red-600 underline">Supprimer</button>
      </div>
    </div>
  )

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Demandes particulières</h1>
        <Link href="/admin" className="text-sm text-blue-600 underline">Retour aux commandes</Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">À traiter ({nouvelles.length})</h2>
        {nouvelles.length === 0 && <p className="text-sm text-gray-500">Aucune demande en attente.</p>}
        {nouvelles.map(carte)}
      </section>

      {traitees.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-500">Traitées ({traitees.length})</h2>
          {traitees.map(carte)}
        </section>
      )}
    </main>
  )
}
