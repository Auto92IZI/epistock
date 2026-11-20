"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { UNIVERS } from "@/content/site"

type Produit = {
  id: number
  univers: string
  gamme: string
  format: string
  prix: number | null
  disponible: boolean
  lien_carrefour: string | null
  lien_auchan: string | null
  lien_leclerc: string | null
}

const MARQUES = [
  { champ: "lien_carrefour", nom: "Carrefour" },
  { champ: "lien_auchan", nom: "Auchan" },
  { champ: "lien_leclerc", nom: "Leclerc" },
] as const

function eur(n: number | null) {
  return n && Number(n) > 0 ? `${Number(n).toFixed(2).replace(".", ",")} €` : "Prix à définir"
}

function lirePrix(s: string) {
  const n = parseFloat(s.replace(",", "."))
  return isNaN(n) ? null : n
}

export default function ProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [chargement, setChargement] = useState(true)

  const [univers, setUnivers] = useState("huile-d-olive")
  const [gamme, setGamme] = useState("")
  const [format, setFormat] = useState("")
  const [prix, setPrix] = useState("")
  const [ajout, setAjout] = useState(false)

  const [enEdition, setEnEdition] = useState<number | null>(null)
  const [eGamme, setEGamme] = useState("")
  const [eFormat, setEFormat] = useState("")
  const [ePrix, setEPrix] = useState("")
  const [eCarrefour, setECarrefour] = useState("")
  const [eAuchan, setEAuchan] = useState("")
  const [eLeclerc, setELeclerc] = useState("")
  const [enregistrement, setEnregistrement] = useState(false)

  useEffect(() => {
    supabase
      .from("Produits")
      .select("id, univers, gamme, format, prix, disponible, lien_carrefour, lien_auchan, lien_leclerc")
      .not("univers", "is", null)
      .order("gamme")
      .order("prix")
      .then(({ data }) => {
        setProduits((data as Produit[]) || [])
        setChargement(false)
      })
  }, [])

  async function ajouter(e: React.FormEvent) {
    e.preventDefault()
    const p = lirePrix(prix)

    if (!gamme.trim() || !format.trim() || p === null || p <= 0) {
      alert("Renseignez le nom du produit, le format et un prix supérieur à 0.")
      return
    }

    setAjout(true)

    const res = await fetch("/api/produits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ univers, gamme: gamme.trim(), format: format.trim(), prix: p }),
    })

    const data = await res.json()
    setAjout(false)

    if (data.success) {
      setProduits((anciens) => [...anciens, data.produit])
      setFormat("")
      setPrix("")
    } else {
      alert(data.message || "Erreur lors de l'ajout")
    }
  }

  function ouvrirEdition(p: Produit) {
    setEnEdition(p.id)
    setEGamme(p.gamme)
    setEFormat(p.format)
    setEPrix(p.prix ? String(p.prix).replace(".", ",") : "")
    setECarrefour(p.lien_carrefour || "")
    setEAuchan(p.lien_auchan || "")
    setELeclerc(p.lien_leclerc || "")
  }

  async function enregistrer(p: Produit) {
    const nouveauPrix = lirePrix(ePrix)

    if (!eGamme.trim() || !eFormat.trim() || nouveauPrix === null || nouveauPrix < 0) {
      alert("Renseignez le nom, le format et un prix valide.")
      return
    }

    setEnregistrement(true)

    const res = await fetch(`/api/produits/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gamme: eGamme.trim(),
        format: eFormat.trim(),
        prix: nouveauPrix,
        liens: { carrefour: eCarrefour, auchan: eAuchan, leclerc: eLeclerc },
      }),
    })

    const data = await res.json()
    setEnregistrement(false)

    if (data.success) {
      setProduits((anciens) =>
        anciens.map((x) =>
          x.id === p.id
            ? {
                ...x,
                gamme: eGamme.trim(),
                format: eFormat.trim(),
                prix: nouveauPrix,
                lien_carrefour: eCarrefour.trim() || null,
                lien_auchan: eAuchan.trim() || null,
                lien_leclerc: eLeclerc.trim() || null,
              }
            : x
        )
      )
      setEnEdition(null)
    } else {
      alert(data.message || "Erreur lors de la modification")
    }
  }

  async function basculer(p: Produit) {
    const res = await fetch(`/api/produits/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponible: !p.disponible }),
    })

    const data = await res.json()

    if (data.success) {
      setProduits((anciens) => anciens.map((x) => (x.id === p.id ? { ...x, disponible: !p.disponible } : x)))
    } else {
      alert(data.message || "Erreur lors de la mise à jour")
    }
  }

  async function supprimer(p: Produit) {
    if (!window.confirm(`Supprimer définitivement « ${p.gamme} — ${p.format} » ?`)) return

    const res = await fetch(`/api/produits/${p.id}`, { method: "DELETE" })
    const data = await res.json()

    if (data.success) {
      setProduits((anciens) => anciens.filter((x) => x.id !== p.id))
    } else {
      alert(data.message || "Erreur lors de la suppression")
    }
  }

  if (chargement) {
    return <div className="p-8">Chargement du catalogue...</div>
  }

  const gammesExistantes = Array.from(new Set(produits.filter((p) => p.univers === univers).map((p) => p.gamme)))

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Catalogue produits</h1>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-600 underline">Voir la boutique</Link>
          <Link href="/admin" className="text-sm text-blue-600 underline">Retour aux commandes</Link>
        </div>
      </div>

      <form onSubmit={ajouter} className="space-y-3 rounded-xl border p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Ajouter un produit</h2>
        <p className="text-sm text-gray-500">
          Un produit correspond à un format. Pour proposer 3 formats d'une même huile, ajoutez-en 3 avec le même nom. Les liens de comparaison se renseignent ensuite avec « Modifier ».
        </p>

        <div className="flex flex-wrap gap-3">
          <select value={univers} onChange={(e) => setUnivers(e.target.value)} className="rounded border p-2">
            {Object.entries(UNIVERS).map(([cle, u]) => (
              <option key={cle} value={cle}>{u.nom}</option>
            ))}
          </select>

          <input
            list="gammes"
            value={gamme}
            onChange={(e) => setGamme(e.target.value)}
            placeholder="Nom du produit"
            className="min-w-[200px] flex-1 rounded border p-2"
          />
          <datalist id="gammes">
            {gammesExistantes.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>

          <input value={format} onChange={(e) => setFormat(e.target.value)} placeholder="Format (ex. 750 ml)" className="w-40 rounded border p-2" />
          <input value={prix} onChange={(e) => setPrix(e.target.value)} inputMode="decimal" placeholder="Prix (€)" className="w-28 rounded border p-2" />

          <button type="submit" disabled={ajout} className="rounded bg-blue-600 px-4 py-2 text-white">
            {ajout ? "Ajout..." : "Ajouter"}
          </button>
        </div>
      </form>

      {Object.entries(UNIVERS).map(([cle, u]) => {
        const duUnivers = produits.filter((p) => p.univers === cle)
        const gammes = Array.from(new Set(duUnivers.map((p) => p.gamme)))

        return (
          <section key={cle} className="space-y-3">
            <h2 className="text-xl font-semibold" style={{ color: u.couleur }}>
              {u.nom} <span className="text-sm font-normal text-gray-400">({duUnivers.length})</span>
            </h2>

            {gammes.length === 0 && <p className="text-sm text-gray-500">Aucun produit pour le moment.</p>}

            {gammes.map((g) => (
              <div key={g} className="overflow-hidden rounded-xl border shadow-sm">
                <p className="bg-gray-50 px-4 py-2 font-medium">{g}</p>

                {duUnivers
                  .filter((p) => p.gamme === g)
                  .map((p) => (
                    <div key={p.id} className={`border-t px-4 py-3 ${!p.disponible ? "bg-gray-50 opacity-70" : ""}`}>
                      {enEdition === p.id ? (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <input value={eGamme} onChange={(e) => setEGamme(e.target.value)} className="min-w-[180px] flex-1 rounded border p-2" />
                            <input value={eFormat} onChange={(e) => setEFormat(e.target.value)} className="w-32 rounded border p-2" />
                            <input value={ePrix} onChange={(e) => setEPrix(e.target.value)} inputMode="decimal" className="w-24 rounded border p-2" />
                          </div>

                          <input value={eCarrefour} onChange={(e) => setECarrefour(e.target.value)} placeholder="Lien Carrefour (https://...)" className="w-full rounded border p-2 text-sm" />
                          <input value={eAuchan} onChange={(e) => setEAuchan(e.target.value)} placeholder="Lien Auchan (https://...)" className="w-full rounded border p-2 text-sm" />
                          <input value={eLeclerc} onChange={(e) => setELeclerc(e.target.value)} placeholder="Lien Leclerc (https://...)" className="w-full rounded border p-2 text-sm" />
                          <p className="text-xs text-gray-500">
                            Collez l'adresse de la fiche produit. Laissez un champ vide pour retirer le lien.
                          </p>

                          <div className="flex gap-2">
                            <button onClick={() => enregistrer(p)} disabled={enregistrement} className="rounded bg-blue-600 px-3 py-2 text-sm text-white">
                              {enregistrement ? "..." : "Enregistrer"}
                            </button>
                            <button onClick={() => setEnEdition(null)} className="rounded bg-gray-200 px-3 py-2 text-sm">Annuler</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="font-medium">{p.format}</span>
                            <span className={`ml-3 ${p.prix && Number(p.prix) > 0 ? "" : "font-semibold text-red-600"}`}>{eur(p.prix)}</span>
                            {!p.disponible && <span className="ml-3 text-xs text-orange-600">(masqué)</span>}

                            <p className="mt-1 text-xs text-gray-500">
                              Comparatif :{" "}
                              {MARQUES.map((m, i) => (
                                <span key={m.champ}>
                                  {i > 0 && " · "}
                                  {p[m.champ] ? (
                                    <Link href={p[m.champ] as string} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                      {m.nom} ↗
                                    </Link>
                                  ) : (
                                    <span className="text-gray-400">{m.nom} —</span>
                                  )}
                                </span>
                              ))}
                            </p>
                          </div>
                          <div className="flex gap-3 text-sm">
                            <button onClick={() => ouvrirEdition(p)} className="text-blue-600 underline">Modifier</button>
                            <button onClick={() => basculer(p)} className="text-orange-600 underline">{p.disponible ? "Masquer" : "Afficher"}</button>
                            <button onClick={() => supprimer(p)} className="text-red-600 underline">Supprimer</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ))}
          </section>
        )
      })}
    </main>
  )
}
