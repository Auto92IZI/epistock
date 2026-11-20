"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { urlBase64ToUint8Array } from "@/lib/pushClient"

type LigneCommande = {
  id: number
  produit_id: number
  quantite: number
  prix_unitaire: number
  libelle: string
  preparee: boolean
}

type Commande = {
  id: number
  client_nom: string
  client_telephone: string
  total: number
  statut: string
  created_at: string
  lignes: LigneCommande[]
}

function chiffresTelephone(tel: string) {
  let t = tel.replace(/[\s.\-()]/g, "")
  if (t.startsWith("+")) t = t.slice(1)
  else if (t.startsWith("00")) t = t.slice(2)
  else if (t.startsWith("0")) t = "33" + t.slice(1)
  else if (/^[67]\d{8}$/.test(t)) t = "33" + t
  return t
}

function messageClient(commande: Commande) {
  return `Bonjour ${commande.client_nom},\n\nVotre commande Alma Lusa est prête. Vous pouvez venir la récupérer.\n\nMerci et à bientôt !`
}

function ouvrirLien(url: string, nouvelOnglet: boolean) {
  const lien = document.createElement("a")
  lien.href = url
  if (nouvelOnglet) {
    lien.target = "_blank"
    lien.rel = "noopener noreferrer"
  }
  document.body.appendChild(lien)
  lien.click()
  document.body.removeChild(lien)
}

export default function AdminPage() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [chargement, setChargement] = useState(true)
  const [commandeSurlignee, setCommandeSurlignee] = useState<number | null>(null)
  const [commandeEnEdition, setCommandeEnEdition] = useState<number | null>(null)
  const [editClientNom, setEditClientNom] = useState("")
  const [editClientTelephone, setEditClientTelephone] = useState("")
  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false)
  const [statutNotifs, setStatutNotifs] = useState<"inactif" | "actif" | "refuse" | "non_supporte">("inactif")

  useEffect(() => {
    chargerCommandes()
    verifierStatutNotifications()
  }, [])

  useEffect(() => {
    if (commandes.length === 0) return

    const idParam = new URLSearchParams(window.location.search).get("commande")

    if (idParam) {
      const id = Number(idParam)
      setCommandeSurlignee(id)

      setTimeout(() => {
        document.getElementById(`commande-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 150)

      setTimeout(() => setCommandeSurlignee(null), 5000)
    }
  }, [commandes])

  async function verifierStatutNotifications() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatutNotifs("non_supporte")
      return
    }

    if (Notification.permission === "denied") {
      setStatutNotifs("refuse")
      return
    }

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    setStatutNotifs(subscription ? "actif" : "inactif")
  }

  async function activerNotifications() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Les notifications ne sont pas prises en charge par ce navigateur.")
      return
    }

    const permission = await Notification.requestPermission()

    if (permission !== "granted") {
      setStatutNotifs("refuse")
      return
    }

    const registration = await navigator.serviceWorker.ready

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string),
    })

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    })

    const data = await res.json()

    if (data.success) {
      setStatutNotifs("actif")
    } else {
      alert("Erreur lors de l'activation des notifications")
    }
  }

  async function chargerCommandes() {
    setChargement(true)

    const { data, error } = await supabase
      .from("Commandes")
      .select(`
        id,
        client_nom,
        client_telephone,
        total,
        statut,
        created_at,
        Lignes_Commande (
          id,
          produit_id,
          quantite,
          prix_unitaire,
          preparee,
          Produits ( nom, gamme, format )
        )
      `)
      .not("statut", "in", '("Récupérée","Annulée")')
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Erreur chargement commandes :", error)
      setChargement(false)
      return
    }

    const liste: Commande[] = (data || []).map((c: any) => ({
      id: c.id,
      client_nom: c.client_nom,
      client_telephone: c.client_telephone,
      total: Number(c.total),
      statut: c.statut,
      created_at: c.created_at,
      lignes: (c.Lignes_Commande || [])
        .map((l: any) => ({
          id: l.id,
          produit_id: l.produit_id,
          quantite: l.quantite,
          prix_unitaire: Number(l.prix_unitaire),
          libelle: l.Produits?.gamme
            ? `${l.Produits.gamme} — ${l.Produits.format}`
            : l.Produits?.nom || "Produit",
          preparee: !!l.preparee,
        }))
        .sort((a: LigneCommande, b: LigneCommande) => a.id - b.id),
    }))

    setCommandes(liste)
    setChargement(false)

    if ("setAppBadge" in navigator) {
      try {
        if (liste.length > 0) {
          ;(navigator as any).setAppBadge(liste.length)
        } else {
          ;(navigator as any).clearAppBadge()
        }
      } catch (e) {
        // non supporté, on ignore
      }
    }
  }

  async function togglePreparation(commandeId: number, ligneId: number) {
    const commandeActuelle = commandes.find((c) => c.id === commandeId)
    const ligneActuelle = commandeActuelle?.lignes.find((l) => l.id === ligneId)
    const nouvelEtat = !ligneActuelle?.preparee

    setCommandes((anciennes) =>
      anciennes.map((c) =>
        c.id !== commandeId
          ? c
          : { ...c, lignes: c.lignes.map((l) => (l.id !== ligneId ? l : { ...l, preparee: nouvelEtat })) }
      )
    )

    const { error } = await supabase
      .from("Lignes_Commande")
      .update({ preparee: nouvelEtat })
      .eq("id", ligneId)

    if (error) {
      console.error("Erreur sauvegarde préparation :", error)
    }
  }

  function progressionCommande(commande: Commande) {
    if (commande.lignes.length === 0) return 0
    const preparees = commande.lignes.filter((l) => l.preparee).length
    return Math.round((preparees / commande.lignes.length) * 100)
  }

  async function changerStatut(commandeId: number, statut: string) {
    const res = await fetch(`/api/commandes/${commandeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    })

    const data = await res.json()
    return data.success as boolean
  }

  async function mettreCommandePrete(commandeId: number) {
    const ok = await changerStatut(commandeId, "Prête")

    if (ok) {
      setCommandes((anciennes) => anciennes.map((c) => (c.id === commandeId ? { ...c, statut: "Prête" } : c)))
    } else {
      alert("Erreur lors du changement de statut")
    }
  }

  function prevenirParWhatsApp(commande: Commande) {
    const chiffres = chiffresTelephone(commande.client_telephone)
    ouvrirLien(`https://wa.me/${chiffres}?text=${encodeURIComponent(messageClient(commande))}`, true)
  }

  function prevenirParSMS(commande: Commande) {
    const chiffres = chiffresTelephone(commande.client_telephone)
    const separateur = /iPhone|iPad|iPod/.test(navigator.userAgent) ? "&" : "?"
    ouvrirLien(`sms:+${chiffres}${separateur}body=${encodeURIComponent(messageClient(commande))}`, false)
  }

  function validerEtPrevenir(commande: Commande) {
    // WhatsApp s'ouvre tout de suite, avant tout "await", pour ne pas être bloqué sur mobile
    prevenirParWhatsApp(commande)
    mettreCommandePrete(commande.id)
  }

  async function marquerRecuperee(commandeId: number) {
    if (!window.confirm("Confirmer que cette commande a été récupérée ? Elle sera archivée.")) return

    if (await changerStatut(commandeId, "Récupérée")) {
      setCommandes((anciennes) => anciennes.filter((c) => c.id !== commandeId))
    } else {
      alert("Erreur lors de l'archivage de la commande")
    }
  }

  async function annulerCommande(commandeId: number) {
    if (!window.confirm("Annuler cette commande ?")) return

    if (await changerStatut(commandeId, "Annulée")) {
      setCommandes((anciennes) => anciennes.filter((c) => c.id !== commandeId))
    } else {
      alert("Erreur lors de l'annulation de la commande")
    }
  }

  function ouvrirEditionClient(commande: Commande) {
    setCommandeEnEdition(commande.id)
    setEditClientNom(commande.client_nom)
    setEditClientTelephone(commande.client_telephone)
  }

  async function enregistrerEditionClient(commandeId: number) {
    if (!editClientNom.trim() || !editClientTelephone.trim()) return

    setEnregistrementEnCours(true)

    const res = await fetch(`/api/commandes/${commandeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientNom: editClientNom.trim(), clientTelephone: editClientTelephone.trim() }),
    })

    const data = await res.json()
    setEnregistrementEnCours(false)

    if (data.success) {
      setCommandes((anciennes) =>
        anciennes.map((c) =>
          c.id === commandeId
            ? { ...c, client_nom: editClientNom.trim(), client_telephone: editClientTelephone.trim() }
            : c
        )
      )
      setCommandeEnEdition(null)
    } else {
      alert("Erreur lors de la modification des informations client")
    }
  }

  async function supprimerLigneCommande(commandeId: number, ligneId: number) {
    if (!window.confirm("Retirer ce produit de la commande ? Le total sera recalculé.")) return

    const res = await fetch(`/api/commandes/${commandeId}/lignes/${ligneId}`, { method: "DELETE" })
    const data = await res.json()

    if (data.success) {
      setCommandes((anciennes) =>
        anciennes.map((c) =>
          c.id === commandeId
            ? { ...c, lignes: c.lignes.filter((l) => l.id !== ligneId), total: data.nouveauTotal }
            : c
        )
      )
    } else {
      alert("Erreur lors de la suppression du produit")
    }
  }

  async function deconnexion() {
    await fetch("/api/logout", { method: "POST" })
    window.location.href = "/admin/login"
  }

  if (chargement) {
    return <div className="p-8">Chargement des commandes...</div>
  }

  return (
    <main className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Administration Alma Lusa</h1>

        <div className="flex flex-wrap items-center gap-4">
          {statutNotifs === "inactif" && (
            <button onClick={activerNotifications} className="rounded-full bg-blue-600 px-3 py-1.5 text-sm text-white">
              🔔 Activer les notifications
            </button>
          )}
          {statutNotifs === "actif" && <span className="text-sm text-green-700">🔔 Notifications actives</span>}
          {statutNotifs === "refuse" && <span className="text-sm text-gray-400">🔕 Notifications refusées</span>}

          <Link href="/" className="text-sm text-gray-600 underline">Voir la boutique</Link>
          <Link href="/admin/dashboard" className="text-sm text-blue-600 underline">Tableau de bord</Link>
          <Link href="/admin/produits" className="text-sm text-blue-600 underline">Produits</Link>
          <button onClick={deconnexion} className="text-sm text-gray-500 underline">Se déconnecter</button>
        </div>
      </div>

      {commandes.length === 0 && <p>Aucune commande en cours.</p>}

      {commandes.map((commande) => (
        <section
          key={commande.id}
          id={`commande-${commande.id}`}
          className={`space-y-4 rounded-xl border p-5 shadow-sm transition ${
            commandeSurlignee === commande.id ? "ring-4 ring-blue-400" : ""
          }`}
        >
          <div className="flex justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Commande #{commande.id}</h2>
              <p className="text-xs text-gray-500">
                Reçue le {new Date(commande.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
              </p>

              {commandeEnEdition === commande.id ? (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    value={editClientNom}
                    onChange={(e) => setEditClientNom(e.target.value)}
                    placeholder="Nom du client"
                    className="w-full max-w-xs rounded border p-2"
                  />
                  <input
                    type="text"
                    value={editClientTelephone}
                    onChange={(e) => setEditClientTelephone(e.target.value)}
                    placeholder="Téléphone"
                    className="w-full max-w-xs rounded border p-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => enregistrerEditionClient(commande.id)}
                      disabled={enregistrementEnCours}
                      className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white"
                    >
                      {enregistrementEnCours ? "Enregistrement..." : "Enregistrer"}
                    </button>
                    <button onClick={() => setCommandeEnEdition(null)} className="rounded bg-gray-200 px-3 py-1.5 text-sm">
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-1">Client : {commande.client_nom}</p>
                  <p>Téléphone : {commande.client_telephone}</p>
                  <button onClick={() => ouvrirEditionClient(commande)} className="mt-1 text-xs text-blue-600 underline">
                    Modifier les infos client
                  </button>
                </>
              )}

              <p className="mt-2 text-lg font-semibold">Total : {commande.total.toFixed(2)} €</p>
            </div>

            <div className="text-right">
              <span className="font-semibold">Statut :</span> {commande.statut}
            </div>
          </div>

          <div className="space-y-3">
            {commande.lignes.map((ligne) => (
              <div key={ligne.id} className="flex items-center gap-3 rounded border p-3">
                <input
                  type="checkbox"
                  checked={ligne.preparee}
                  onChange={() => togglePreparation(commande.id, ligne.id)}
                  className="h-5 w-5"
                />
                <div className="flex-1">
                  <p className="font-medium">{ligne.libelle}</p>
                  <p className="text-sm text-gray-600">
                    Quantité : <strong>{ligne.quantite}</strong> · {ligne.prix_unitaire.toFixed(2)} € l'unité ·{" "}
                    {(ligne.quantite * ligne.prix_unitaire).toFixed(2)} €
                  </p>
                </div>
                <button
                  onClick={() => supprimerLigneCommande(commande.id, ligne.id)}
                  className="text-xs text-red-600 underline"
                >
                  Retirer
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression préparation</span>
              <span>{progressionCommande(commande)} %</span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-200">
              <div className="h-3 rounded-full bg-green-500" style={{ width: `${progressionCommande(commande)}%` }} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {progressionCommande(commande) === 100 && commande.statut !== "Prête" && (
              <button onClick={() => validerEtPrevenir(commande)} className="rounded bg-blue-600 px-4 py-2 text-white">
                Marquer comme prête et prévenir le client
              </button>
            )}

            {commande.statut === "Prête" && (
              <>
                <button onClick={() => prevenirParWhatsApp(commande)} className="rounded bg-green-600 px-4 py-2 text-white">
                  Renvoyer le message (WhatsApp)
                </button>
                <button onClick={() => prevenirParSMS(commande)} className="rounded bg-purple-600 px-4 py-2 text-white">
                  💬 Envoyer par SMS
                </button>
                <button onClick={() => marquerRecuperee(commande.id)} className="rounded bg-gray-700 px-4 py-2 text-white">
                  ✅ Marquer comme récupérée
                </button>
              </>
            )}

            <button onClick={() => annulerCommande(commande.id)} className="rounded bg-red-100 px-4 py-2 text-red-700">
              ❌ Annuler la commande
            </button>
          </div>
        </section>
      ))}
    </main>
  )
}
