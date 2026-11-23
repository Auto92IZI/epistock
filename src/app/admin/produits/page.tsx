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
  mis_en_avant: boolean | null
  lien_comparaison: string | null
  image_url: string | null
}

function eur(n: number | null) {
  return n && Number(n) > 0 ? `${Number(n).toFixed(2).replace(".", ",")} €` : "Prix à définir"
}

function lirePrix(s: string) {
  const n = parseFloat(s.replace(",", "."))
  return isNaN(n) ? null : n
}

// Réduit la photo (1600 px max, JPEG) avant l'envoi : une photo de téléphone est trop lourde
function compresser(fichier: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fichier)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      const max = 1600
      let { width, height } = img

      if (width > max || height > max) {
        const ratio = Math.min(max / width, max / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        reject(new Error("Compression impossible"))
        return
      }

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Compression impossible"))
            return
          }
          resolve(new File([blob], "photo.jpg", { type: "image/jpeg" }))
        },
        "image/jpeg",
        0.85
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Image illisible : essayez avec une photo au format JPEG ou PNG."))
    }

    img.src = url
  })
}

export default function ProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [chargement, setChargement] = useState(true)

  const [famille, setFamille] = useState("huile-d-olive")
  const [gamme, setGamme] = useState("")
  const [format, setFormat] = useState("")
  const [prix, setPrix] = useState("")
  const [ajout, setAjout] = useState(false)

  const [enEdition, setEnEdition] = useState<number | null>(null)
  const [eGamme, setEGamme] = useState("")
  const [eFormat, setEFormat] = useState("")
  const [ePrix, setEPrix] = useState("")
  const [eLien, setELien] = useState("")
  const [eAvant, setEAvant] = useState(false)
  const [enregistrement, setEnregistrement] = useState(false)

  const [photoEnCours, setPhotoEnCours] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from("Produits")
      .select("id, univers, gamme, format, prix, disponible, mis_en_avant, lien_comparaison, image_url")
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
      body: JSON.stringify({ univers: famille, gamme: gamme.trim(), format: format.trim(), prix: p }),
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
    setELien(p.lien_comparaison || "")
    setEAvant(!!p.mis_en_avant)
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
        lienComparaison: eLien,
        misEnAvant: eAvant,
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
                lien_comparaison: eLien.trim() || null,
                mis_en_avant: eAvant,
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

  async function basculerAvant(p: Produit) {
    const res = await fetch(`/api/produits/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ misEnAvant: !p.mis_en_avant }),
    })

    const data = await res.json()

    if (data.success) {
      setProduits((anciens) => anciens.map((x) => (x.id === p.id ? { ...x, mis_en_avant: !p.mis_en_avant } : x)))
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

  async function enregistrerPhoto(universProduit: string, gammeProduit: string, imageUrl: string | null) {
    const res = await fetch("/api/produits/photo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ univers: universProduit, gamme: gammeProduit, imageUrl }),
    })

    const data = await res.json()
    if (!data.success) throw new Error(data.message || "Enregistrement impossible")

    setProduits((anciens) =>
      anciens.map((x) =>
        x.univers === universProduit && x.gamme === gammeProduit ? { ...x, image_url: imageUrl } : x
      )
    )
  }

  async function changerPhoto(universProduit: string, gammeProduit: string, fichier: File) {
    setPhotoEnCours(`${universProduit}|${gammeProduit}`)

    try {
      const reduite = await compresser(fichier)

      const formData = new FormData()
      formData.append("fichier", reduite)

      const envoi = await fetch("/api/upload", { method: "POST", body: formData })
      const retour = await envoi.json().catch(() => null)

      if (!envoi.ok || !retour?.success) {
        throw new Error(retour?.message || `Envoi impossible (code ${envoi.status})`)
      }

      await enregistrerPhoto(universProduit, gammeProduit, retour.imageUrl)
    } catch (erreur) {
      alert(erreur instanceof Error ? erreur.message : "Erreur lors de l'envoi de la photo")
    } finally {
      setPhotoEnCours(null)
    }
  }

  async function retirerPhoto(universProduit: string, gammeProduit: string) {
    if (!window.confirm(`Retirer la photo de « ${gammeProduit} » ?`)) return

    try {
      await enregistrerPhoto(universProduit, gammeProduit, null)
    } catch (erreur) {
      alert(erreur instanceof Error ? erreur.message : "Erreur lors du retrait de la photo")
    }
  }

  function ligneProduit(p: Produit) {
    return (
      <div key={p.id} className={`border-t px-4 py-3 ${!p.disponible ? "bg-gray-50 opacity-70" : ""}`}>
        {enEdition === p.id ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <input value={eGamme} onChange={(e) => setEGamme(e.target.value)} className="min-w-[180px] flex-1 rounded border p-2" />
              <input value={eFormat} onChange={(e) => setEFormat(e.target.value)} className="w-32 rounded border p-2" />
              <input value={ePrix} onChange={(e) => setEPrix(e.target.value)} inputMode="decimal" className="w-24 rounded border p-2" />
            </div>

            <input
              value={eLien}
              onChange={(e) => setELien(e.target.value)}
              placeholder="Lien « Comparez » vers le produit d'un concurrent (https://...)"
              className="w-full rounded border p-2 text-sm"
            />
            <p className="text-xs text-gray-500">Collez l'adresse de la fiche produit. Laissez vide pour retirer le lien.</p>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={eAvant} onChange={(e) => setEAvant(e.target.checked)} />
              ★ Mettre ce format en avant (affiché en premier et présélectionné)
            </label>

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
              <span className="font-medium">
                {p.mis_en_avant && <span className="mr-1 text-amber-500">★</span>}
                {p.format}
              </span>
              <span className={`ml-3 ${p.prix && Number(p.prix) > 0 ? "" : "font-semibold text-red-600"}`}>{eur(p.prix)}</span>
              {!p.disponible && <span className="ml-3 text-xs text-orange-600">(masqué)</span>}

              <p className="mt-1 text-xs text-gray-500">
                {p.lien_comparaison ? (
                  <Link href={p.lien_comparaison} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Comparez ↗
                  </Link>
                ) : (
                  <span className="text-gray-400">Pas de lien « Comparez »</span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <button onClick={() => basculerAvant(p)} className="text-amber-600 underline">
                {p.mis_en_avant ? "Retirer ★" : "Mettre en ★"}
              </button>
              <button onClick={() => ouvrirEdition(p)} className="text-blue-600 underline">Modifier</button>
              <button onClick={() => basculer(p)} className="text-orange-600 underline">{p.disponible ? "Masquer" : "Afficher"}</button>
              <button onClick={() => supprimer(p)} className="text-red-600 underline">Supprimer</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  function blocsDeGammes(liste: Produit[]) {
    const cles = Array.from(new Set(liste.map((p) => `${p.univers}|${p.gamme}`)))

    return cles.map((cle) => {
      const lignes = liste.filter((p) => `${p.univers}|${p.gamme}` === cle)
      const { univers: universGamme, gamme: nomGamme } = lignes[0]
      const photo = lignes.find((p) => p.image_url)?.image_url || null
      const enCours = photoEnCours === cle

      return (
        <div key={cle} className="overflow-hidden rounded-xl border shadow-sm">
          <div className="flex flex-wrap items-center gap-3 bg-gray-50 px-4 py-2">
            {photo ? (
              <img src={photo} alt={nomGamme} className="h-14 w-14 rounded border bg-white object-contain" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded border border-dashed text-center text-[10px] text-gray-400">
                Pas de photo
              </div>
            )}

            <p className="min-w-[120px] flex-1 font-medium">{nomGamme}</p>

            <div className="flex items-center gap-3 text-sm">
              <label className={`cursor-pointer text-blue-600 underline ${enCours ? "pointer-events-none opacity-50" : ""}`}>
                {enCours ? "Envoi en cours..." : photo ? "📷 Changer la photo" : "📷 Ajouter une photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={enCours}
                  onChange={(e) => {
                    const fichier = e.target.files?.[0]
                    e.target.value = ""
                    if (fichier) changerPhoto(universGamme, nomGamme, fichier)
                  }}
                />
              </label>

              {photo && !enCours && (
                <button onClick={() => retirerPhoto(universGamme, nomGamme)} className="text-red-600 underline">
                  Retirer
                </button>
              )}
            </div>
          </div>

          {lignes.map(ligneProduit)}
        </div>
      )
    })
  }

  if (chargement) {
    return <div className="p-8">Chargement du catalogue...</div>
  }

  const gammesExistantes = Array.from(new Set(produits.filter((p) => p.univers === famille).map((p) => p.gamme)))

  const famillesConnues = new Set(Object.values(UNIVERS).flatMap((u) => Object.keys(u.familles)))
  const orphelins = produits.filter((p) => !famillesConnues.has(p.univers))

  return (
    <main className="mx-auto max-w-4xl space-y-10 p-6">
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
          Un produit correspond à un format. Pour proposer 3 formats d'une même huile, ajoutez-en 3 avec le même nom. La photo se règle ensuite sur l'en-tête du produit, et elle vaut pour tous ses formats.
        </p>

        <div className="flex flex-wrap gap-3">
          <select value={famille} onChange={(e) => setFamille(e.target.value)} className="rounded border p-2" aria-label="Famille de produits">
            {Object.entries(UNIVERS).map(([us, u]) => (
              <optgroup key={us} label={u.nom}>
                {Object.entries(u.familles).map(([fs, f]) => (
                  <option key={fs} value={fs}>{f.nom}</option>
                ))}
              </optgroup>
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

          <input value={format} onChange={(e) => setFormat(e.target.value)} placeholder="Format (ex. 250 g)" className="w-40 rounded border p-2" />
          <input value={prix} onChange={(e) => setPrix(e.target.value)} inputMode="decimal" placeholder="Prix (€)" className="w-28 rounded border p-2" />

          <button type="submit" disabled={ajout} className="rounded bg-blue-600 px-4 py-2 text-white">
            {ajout ? "Ajout..." : "Ajouter"}
          </button>
        </div>
      </form>

      {Object.entries(UNIVERS).map(([us, u]) => (
        <section key={us} className="space-y-4">
          <h2 className="border-b pb-1 text-2xl font-bold" style={{ color: u.couleur }}>{u.nom}</h2>

          {Object.entries(u.familles).map(([fs, f]) => {
            const dela = produits.filter((p) => p.univers === fs)

            return (
              <div key={fs} className="space-y-3">
                <h3 className="text-lg font-semibold" style={{ color: f.couleur ?? u.couleur }}>
                  {f.nom} <span className="text-sm font-normal text-gray-400">({dela.length})</span>
                </h3>

                {dela.length === 0 ? (
                  <p className="text-sm text-gray-500">Aucun produit pour le moment.</p>
                ) : (
                  blocsDeGammes(dela)
                )}
              </div>
            )
          })}
        </section>
      ))}

      {orphelins.length > 0 && (
        <section className="space-y-3">
          <h2 className="border-b pb-1 text-2xl font-bold text-gray-500">Sans univers reconnu</h2>
          <p className="text-sm text-gray-500">Ces produits ne s'affichent sur aucune page de la boutique.</p>
          {blocsDeGammes(orphelins)}
        </section>
      )}
    </main>
  )
}
