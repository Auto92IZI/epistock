"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import BarcodeScanner from "@/components/BarcodeScanner"

type Produit = {
  id: number
  nom: string
  categorie: string | null
  prix: number
  stock: number
  disponible: boolean
  image_url: string | null
  code_barre: string | null
}

export default function StockPage() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [chargement, setChargement] = useState(true)
  const [quantites, setQuantites] = useState<{ [id: number]: string }>({})
  const [messageStatut, setMessageStatut] = useState<{ [id: number]: string }>({})
  const [recherche, setRecherche] = useState("")

  const [nouveauNom, setNouveauNom] = useState("")
  const [nouvelleCategorie, setNouvelleCategorie] = useState("")
  const [nouveauPrix, setNouveauPrix] = useState("")
  const [nouveauStock, setNouveauStock] = useState("")
  const [nouveauCodeBarre, setNouveauCodeBarre] = useState("")
  const [nouvellePhoto, setNouvellePhoto] = useState<File | null>(null)
  const [ajoutEnCours, setAjoutEnCours] = useState(false)

  const [photoEnCours, setPhotoEnCours] = useState<{ [id: number]: boolean }>({})

  const [produitEnEdition, setProduitEnEdition] = useState<number | null>(null)
  const [editNom, setEditNom] = useState("")
  const [editCategorie, setEditCategorie] = useState("")
  const [editPrix, setEditPrix] = useState("")
  const [editCodeBarre, setEditCodeBarre] = useState("")
  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false)

  const [scannerOuvert, setScannerOuvert] = useState<"filtrer" | "nouveau" | "edition" | null>(null)

  const refsQuantite = useRef<{ [id: number]: HTMLInputElement | null }>({})

  useEffect(() => {
    chargerProduits()
  }, [])

  async function chargerProduits() {
    setChargement(true)

    const { data, error } = await supabase
      .from("Produits")
      .select("id, nom, categorie, prix, stock, disponible, image_url, code_barre")
      .order("nom", { ascending: true })

    if (error) {
      console.error("Erreur chargement produits :", error)
      setChargement(false)
      return
    }

    setProduits(data as Produit[])
    setChargement(false)
  }

  async function uploaderPhoto(fichier: File): Promise<string | null> {
    const formData = new FormData()
    formData.append("fichier", fichier)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    if (data.success) {
      return data.imageUrl as string
    }

    return null
  }

  function handleQuantiteChange(produitId: number, valeur: string) {
    setQuantites((anciennes) => ({
      ...anciennes,
      [produitId]: valeur,
    }))
  }

  async function ajouterStock(produitId: number) {
    const valeur = parseInt(quantites[produitId] || "0", 10)

    if (!valeur || valeur <= 0) {
      return
    }

    const res = await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produitId, quantiteRecue: valeur }),
    })

    const data = await res.json()

    if (data.success) {
      setProduits((anciens) =>
        anciens.map((p) =>
          p.id === produitId ? { ...p, stock: p.stock + valeur } : p
        )
      )
      setQuantites((anciennes) => ({ ...anciennes, [produitId]: "" }))
      setMessageStatut((anciens) => ({ ...anciens, [produitId]: "Ajouté !" }))
      setTimeout(() => {
        setMessageStatut((anciens) => ({ ...anciens, [produitId]: "" }))
      }, 2000)
    } else {
      setMessageStatut((anciens) => ({ ...anciens, [produitId]: "Erreur" }))
    }
  }

  async function togglePause(produit: Produit) {
    const nouvelleDisponibilite = !produit.disponible

    const res = await fetch(`/api/produits/${produit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponible: nouvelleDisponibilite }),
    })

    const data = await res.json()

    if (data.success) {
      setProduits((anciens) =>
        anciens.map((p) =>
          p.id === produit.id ? { ...p, disponible: nouvelleDisponibilite } : p
        )
      )
    } else {
      alert("Erreur lors de la mise à jour du produit")
    }
  }

  async function supprimerProduit(produit: Produit) {
    const confirmation = window.confirm(
      `Supprimer définitivement "${produit.nom}" ? Cette action est irréversible.`
    )

    if (!confirmation) {
      return
    }

    const res = await fetch(`/api/produits/${produit.id}`, {
      method: "DELETE",
    })

    const data = await res.json()

    if (data.success) {
      setProduits((anciens) => anciens.filter((p) => p.id !== produit.id))
    } else {
      alert("Erreur lors de la suppression du produit")
    }
  }

  async function changerPhoto(produitId: number, fichier: File) {
    setPhotoEnCours((anciens) => ({ ...anciens, [produitId]: true }))

    const imageUrl = await uploaderPhoto(fichier)

    if (!imageUrl) {
      alert("Erreur lors de l'envoi de la photo")
      setPhotoEnCours((anciens) => ({ ...anciens, [produitId]: false }))
      return
    }

    const res = await fetch(`/api/produits/${produitId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    })

    const data = await res.json()

    setPhotoEnCours((anciens) => ({ ...anciens, [produitId]: false }))

    if (data.success) {
      setProduits((anciens) =>
        anciens.map((p) =>
          p.id === produitId ? { ...p, image_url: imageUrl } : p
        )
      )
    } else {
      alert("Erreur lors de la mise à jour de la photo")
    }
  }

  function ouvrirEdition(produit: Produit) {
    setProduitEnEdition(produit.id)
    setEditNom(produit.nom)
    setEditCategorie(produit.categorie || "")
    setEditPrix(produit.prix.toString())
    setEditCodeBarre(produit.code_barre || "")
  }

  function annulerEdition() {
    setProduitEnEdition(null)
  }

  async function enregistrerEdition(produitId: number) {
    if (!editNom.trim() || !editPrix) {
      return
    }

    setEnregistrementEnCours(true)

    const res = await fetch(`/api/produits/${produitId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: editNom.trim(),
        categorie: editCategorie || null,
        prix: parseFloat(editPrix),
        codeBarre: editCodeBarre.trim() || null,
      }),
    })

    const data = await res.json()

    setEnregistrementEnCours(false)

    if (data.success) {
      setProduits((anciens) =>
        anciens.map((p) =>
          p.id === produitId
            ? {
                ...p,
                nom: editNom.trim(),
                categorie: editCategorie || null,
                prix: parseFloat(editPrix),
                code_barre: editCodeBarre.trim() || null,
              }
            : p
        )
      )
      setProduitEnEdition(null)
    } else {
      alert("Erreur lors de la modification du produit")
    }
  }

  async function ajouterProduit(e: React.FormEvent) {
    e.preventDefault()

    if (!nouveauNom || !nouveauPrix) {
      return
    }

    setAjoutEnCours(true)

    let imageUrl: string | null = null

    if (nouvellePhoto) {
      imageUrl = await uploaderPhoto(nouvellePhoto)
    }

    const res = await fetch("/api/produits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: nouveauNom,
        categorie: nouvelleCategorie || null,
        prix: parseFloat(nouveauPrix),
        stock: parseInt(nouveauStock || "0", 10),
        imageUrl,
        codeBarre: nouveauCodeBarre.trim() || null,
      }),
    })

    const data = await res.json()

    setAjoutEnCours(false)

    if (data.success) {
      setProduits((anciens) =>
        [...anciens, data.produit].sort((a, b) => a.nom.localeCompare(b.nom))
      )
      setNouveauNom("")
      setNouvelleCategorie("")
      setNouveauPrix("")
      setNouveauStock("")
      setNouveauCodeBarre("")
      setNouvellePhoto(null)
    } else {
      alert("Erreur lors de l'ajout du produit")
    }
  }

  function gererScan(code: string) {
    setScannerOuvert(null)

    if (scannerOuvert === "nouveau") {
      setNouveauCodeBarre(code)
      return
    }

    if (scannerOuvert === "edition") {
      setEditCodeBarre(code)
      return
    }

    // Mode "filtrer" : on cherche le produit correspondant
    const produitTrouve = produits.find((p) => p.code_barre === code)

    if (produitTrouve) {
      setRecherche(produitTrouve.nom)

      setTimeout(() => {
        refsQuantite.current[produitTrouve.id]?.focus()
        refsQuantite.current[produitTrouve.id]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }, 100)
    } else {
      alert(
        `Aucun produit ne correspond à ce code-barres (${code}).\n\nVous pouvez l'associer à un produit existant via "Modifier les infos".`
      )
    }
  }

  const produitsFiltres = produits.filter((p) =>
    recherche.trim() === ""
      ? true
      : p.nom.toLowerCase().includes(recherche.trim().toLowerCase())
  )

  if (chargement) {
    return <div className="p-8">Chargement des produits...</div>
  }

  return (
    <main className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion du stock</h1>

        <Link href="/admin" className="text-sm text-blue-600 underline">
          Retour aux commandes
        </Link>
      </div>

      <form
        onSubmit={ajouterProduit}
        className="border rounded-xl p-4 space-y-3 shadow-sm"
      >
        <h2 className="text-lg font-semibold">Ajouter un nouveau produit</h2>

        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Nom du produit"
            value={nouveauNom}
            onChange={(e) => setNouveauNom(e.target.value)}
            className="border rounded p-2 flex-1 min-w-[150px]"
            required
          />

          <input
            type="text"
            placeholder="Catégorie (optionnel)"
            value={nouvelleCategorie}
            onChange={(e) => setNouvelleCategorie(e.target.value)}
            className="border rounded p-2 flex-1 min-w-[150px]"
          />

          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Prix (€)"
            value={nouveauPrix}
            onChange={(e) => setNouveauPrix(e.target.value)}
            className="border rounded p-2 w-28"
            required
          />

          <input
            type="number"
            min="0"
            placeholder="Stock initial"
            value={nouveauStock}
            onChange={(e) => setNouveauStock(e.target.value)}
            className="border rounded p-2 w-32"
          />

          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder="Code-barres (optionnel)"
              value={nouveauCodeBarre}
              onChange={(e) => setNouveauCodeBarre(e.target.value)}
              className="border rounded p-2 w-40"
            />
            <button
              type="button"
              onClick={() => setScannerOuvert("nouveau")}
              className="border rounded p-2"
              title="Scanner le code-barres"
            >
              📷
            </button>
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNouvellePhoto(e.target.files?.[0] || null)}
            className="text-sm"
          />

          <button
            type="submit"
            disabled={ajoutEnCours}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {ajoutEnCours ? "Ajout..." : "Ajouter"}
          </button>
        </div>
      </form>

      <div className="flex gap-2">
        <input
          type="text"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="🔍 Rechercher un produit..."
          className="flex-1 border rounded-lg p-3 outline-none focus:ring-2"
        />

        <button
          onClick={() => setScannerOuvert("filtrer")}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          📷 Scanner
        </button>
      </div>

      {produitsFiltres.length === 0 && (
        <p className="text-gray-600">Aucun produit ne correspond à votre recherche.</p>
      )}

      <div className="space-y-3">
        {produitsFiltres.map((produit) => (
          <div
            key={produit.id}
            className={`border p-4 rounded-xl shadow-sm ${
              !produit.disponible ? "bg-gray-50 opacity-60" : ""
            }`}
          >
            {produitEnEdition === produit.id ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    value={editNom}
                    onChange={(e) => setEditNom(e.target.value)}
                    placeholder="Nom du produit"
                    className="border rounded p-2 flex-1 min-w-[150px]"
                  />

                  <input
                    type="text"
                    value={editCategorie}
                    onChange={(e) => setEditCategorie(e.target.value)}
                    placeholder="Catégorie"
                    className="border rounded p-2 flex-1 min-w-[150px]"
                  />

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editPrix}
                    onChange={(e) => setEditPrix(e.target.value)}
                    placeholder="Prix (€)"
                    className="border rounded p-2 w-28"
                  />

                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editCodeBarre}
                      onChange={(e) => setEditCodeBarre(e.target.value)}
                      placeholder="Code-barres"
                      className="border rounded p-2 w-40"
                    />
                    <button
                      type="button"
                      onClick={() => setScannerOuvert("edition")}
                      className="border rounded p-2"
                      title="Scanner le code-barres"
                    >
                      📷
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => enregistrerEdition(produit.id)}
                    disabled={enregistrementEnCours}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    {enregistrementEnCours ? "Enregistrement..." : "Enregistrer"}
                  </button>

                  <button
                    onClick={annulerEdition}
                    className="bg-gray-200 px-4 py-2 rounded"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {produit.image_url ? (
                    <img
                      src={produit.image_url}
                      alt={produit.nom}
                      className="w-16 h-16 object-contain border rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center border rounded text-xs text-gray-400">
                      Pas de photo
                    </div>
                  )}

                  <div>
                    <p className="font-medium">
                      {produit.nom}
                      {!produit.disponible && (
                        <span className="ml-2 text-xs text-orange-600 font-normal">
                          (en pause)
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      Stock actuel : {produit.stock} · Prix : {produit.prix != null ? produit.prix.toFixed(2) + " €" : "non défini"}
                    </p>
                    {produit.code_barre && (
                      <p className="text-xs text-gray-400">
                        Code-barres : {produit.code_barre}
                      </p>
                    )}

                    <div className="flex gap-3 mt-1">
                      <label className="text-xs text-blue-600 underline cursor-pointer">
                        {photoEnCours[produit.id]
                          ? "Envoi..."
                          : produit.image_url
                          ? "Changer la photo"
                          : "Ajouter une photo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={photoEnCours[produit.id]}
                          onChange={(e) => {
                            const fichier = e.target.files?.[0]
                            if (fichier) {
                              changerPhoto(produit.id, fichier)
                            }
                          }}
                        />
                      </label>

                      <button
                        onClick={() => ouvrirEdition(produit)}
                        className="text-xs text-blue-600 underline"
                      >
                        Modifier les infos
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <input
                    ref={(el) => { refsQuantite.current[produit.id] = el }}
                    type="number"
                    min="1"
                    placeholder="Quantité reçue"
                    value={quantites[produit.id] || ""}
                    onChange={(e) =>
                      handleQuantiteChange(produit.id, e.target.value)
                    }
                    className="border rounded p-2 w-32"
                  />

                  <button
                    onClick={() => ajouterStock(produit.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Ajouter
                  </button>

                  {messageStatut[produit.id] && (
                    <span className="text-sm text-gray-500">
                      {messageStatut[produit.id]}
                    </span>
                  )}

                  <button
                    onClick={() => togglePause(produit)}
                    className="bg-orange-500 text-white px-4 py-2 rounded"
                  >
                    {produit.disponible ? "Mettre en pause" : "Réactiver"}
                  </button>

                  <button
                    onClick={() => supprimerProduit(produit)}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {scannerOuvert && (
        <BarcodeScanner
          onScan={gererScan}
          onClose={() => setScannerOuvert(null)}
        />
      )}
    </main>
  )
}
