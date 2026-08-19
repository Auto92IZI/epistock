"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

type LigneCommande = {
  produit_id: number
  quantite: number
  prix_unitaire: number
  Produits: { nom: string } | null
}

type Commande = {
  id: number
  total: number
  statut: string
  created_at: string
  client_nom: string
  client_telephone: string
  Lignes_Commande: LigneCommande[]
}

type Produit = {
  id: number
  nom: string
  disponible: boolean
  prix: number
  stock: number
}

function normaliserTelephone(tel: string) {
  return (tel || "").replace(/\s/g, "")
}

function moisKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function moisLabel(key: string) {
  const [annee, mois] = key.split("-")
  const date = new Date(Number(annee), Number(mois) - 1, 1)
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
}

export default function DashboardPage() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [produits, setProduits] = useState<Produit[]>([])
  const [chargement, setChargement] = useState(true)
  const [periode, setPeriode] = useState<7 | 30>(7)

  useEffect(() => {
    chargerDonnees()
  }, [])

  async function chargerDonnees() {
    setChargement(true)

    const [resCommandes, resProduits] = await Promise.all([
      supabase
        .from("Commandes")
        .select(`
          id,
          total,
          statut,
          created_at,
          client_nom,
          client_telephone,
          Lignes_Commande (
            produit_id,
            quantite,
            prix_unitaire,
            Produits ( nom )
          )
        `)
        .order("created_at", { ascending: true }),
      supabase
        .from("Produits")
        .select("id, nom, disponible, prix, stock"),
    ])

    if (resCommandes.error) {
      console.error("Erreur chargement dashboard :", resCommandes.error)
      setChargement(false)
      return
    }

    setCommandes(resCommandes.data as any)
    setProduits((resProduits.data as Produit[]) || [])
    setChargement(false)
  }

  if (chargement) {
    return <div className="p-8">Chargement du tableau de bord...</div>
  }

  const maintenant = new Date()
  const dateLimite = new Date()
  dateLimite.setDate(maintenant.getDate() - periode)

  const commandesPeriode = commandes.filter(
    (c) => new Date(c.created_at) >= dateLimite
  )

  // --- Indicateurs généraux ---
  const caTotal = commandesPeriode.reduce((total, c) => total + Number(c.total), 0)
  const nombreCommandes = commandesPeriode.length
  const panierMoyen = nombreCommandes > 0 ? caTotal / nombreCommandes : 0

  const valeurStock = produits.reduce(
    (total, p) => total + (p.prix || 0) * (p.stock || 0),
    0
  )

  const clientsPeriode = new Set(
    commandesPeriode.map((c) => normaliserTelephone(c.client_telephone))
  )
  const nombreClients = clientsPeriode.size

  // --- Graphique évolution du CA ---
  const joursData: { date: string; ca: number }[] = []

  for (let i = periode - 1; i >= 0; i--) {
    const jour = new Date()
    jour.setDate(maintenant.getDate() - i)
    const jourStr = jour.toISOString().split("T")[0]

    const caJour = commandesPeriode
      .filter((c) => c.created_at.startsWith(jourStr))
      .reduce((total, c) => total + Number(c.total), 0)

    joursData.push({
      date: jour.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      ca: Math.round(caJour * 100) / 100,
    })
  }

  // --- Produits les plus vendus ---
  const ventesParProduit: { [id: number]: { nom: string; quantite: number } } = {}

  commandesPeriode.forEach((commande) => {
    commande.Lignes_Commande?.forEach((ligne) => {
      const nom = ligne.Produits?.nom || "Produit inconnu"
      if (!ventesParProduit[ligne.produit_id]) {
        ventesParProduit[ligne.produit_id] = { nom, quantite: 0 }
      }
      ventesParProduit[ligne.produit_id].quantite += ligne.quantite
    })
  })

  const topProduits = Object.values(ventesParProduit)
    .sort((a, b) => b.quantite - a.quantite)
    .slice(0, 5)

  // --- Produits les moins vendus (parmi les produits actifs) ---
  const produitsMoinsVendus = produits
    .filter((p) => p.disponible)
    .map((p) => ({
      nom: p.nom,
      quantite: ventesParProduit[p.id]?.quantite || 0,
    }))
    .sort((a, b) => a.quantite - b.quantite)
    .slice(0, 5)

  // --- Top clients sur la période ---
  const statsParClient: {
    [telephone: string]: { nom: string; total: number; commandes: number }
  } = {}

  commandesPeriode.forEach((commande) => {
    const tel = normaliserTelephone(commande.client_telephone)

    if (!statsParClient[tel]) {
      statsParClient[tel] = { nom: commande.client_nom, total: 0, commandes: 0 }
    }

    statsParClient[tel].total += Number(commande.total)
    statsParClient[tel].commandes += 1
  })

  const topClients = Object.values(statsParClient)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)

  // --- Évolution mensuelle des clients (6 derniers mois, sur tout l'historique) ---
  const actifsParMois: { [mois: string]: Set<string> } = {}
  const premierMoisParClient: { [telephone: string]: string } = {}

  commandes.forEach((commande) => {
    const tel = normaliserTelephone(commande.client_telephone)
    const cle = moisKey(new Date(commande.created_at))

    if (!actifsParMois[cle]) {
      actifsParMois[cle] = new Set()
    }
    actifsParMois[cle].add(tel)

    if (!premierMoisParClient[tel] || cle < premierMoisParClient[tel]) {
      premierMoisParClient[tel] = cle
    }
  })

  const moisAffiches: string[] = []
  for (let i = 0; i < 6; i++) {
    const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1)
    moisAffiches.push(moisKey(date))
  }

  const evolutionClients = moisAffiches.map((cle, index) => {
    const dateMois = new Date(
      maintenant.getFullYear(),
      maintenant.getMonth() - index - 1,
      1
    )
    const cleMoisPrecedent = moisKey(dateMois)

    const actifsCeMois = actifsParMois[cle] || new Set()
    const actifsMoisPrecedent = actifsParMois[cleMoisPrecedent] || new Set()

    const nouveaux = Array.from(actifsCeMois).filter(
      (tel) => premierMoisParClient[tel] === cle
    ).length

    const perdus = Array.from(actifsMoisPrecedent).filter(
      (tel) => !actifsCeMois.has(tel)
    ).length

    return {
      mois: moisLabel(cle),
      nouveaux,
      perdus,
      actifs: actifsCeMois.size,
    }
  })

  return (
    <main className="p-8 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>

        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm text-blue-600 underline">
            Retour aux commandes
          </Link>
          <Link href="/admin/stock" className="text-sm text-blue-600 underline">
            Gérer le stock
          </Link>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setPeriode(7)}
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            periode === 7 ? "bg-black text-white" : "bg-white border text-gray-700"
          }`}
        >
          7 derniers jours
        </button>
        <button
          onClick={() => setPeriode(30)}
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            periode === 30 ? "bg-black text-white" : "bg-white border text-gray-700"
          }`}
        >
          30 derniers jours
        </button>
      </div>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div className="border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Chiffre d'affaires</p>
          <p className="text-3xl font-bold mt-1">{caTotal.toFixed(2)} €</p>
        </div>

        <div className="border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Nombre de commandes</p>
          <p className="text-3xl font-bold mt-1">{nombreCommandes}</p>
        </div>

        <div className="border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Panier moyen</p>
          <p className="text-3xl font-bold mt-1">{panierMoyen.toFixed(2)} €</p>
        </div>

        <div className="border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Clients (période)</p>
          <p className="text-3xl font-bold mt-1">{nombreClients}</p>
        </div>

        <div className="border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Valeur du stock</p>
          <p className="text-3xl font-bold mt-1">{valeurStock.toFixed(2)} €</p>
        </div>
      </div>

      {/* Graphique évolution du CA */}
      <div className="border rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Évolution du chiffre d'affaires</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={joursData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value) => `${value} €`} />
            <Line
              type="monotone"
              dataKey="ca"
              stroke="#1E7A3C"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top produits */}
        <div className="border rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Produits les plus vendus</h2>

          {topProduits.length === 0 ? (
            <p className="text-gray-500">Aucune vente sur cette période.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProduits} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} allowDecimals={false} />
                <YAxis dataKey="nom" type="category" width={120} fontSize={12} />
                <Tooltip />
                <Bar dataKey="quantite" fill="#1E7A3C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Produits les moins vendus */}
        <div className="border rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-1">Produits les moins vendus</h2>
          <p className="text-xs text-gray-400 mb-4">
            Parmi les produits actifs, sur la période sélectionnée
          </p>

          {produitsMoinsVendus.length === 0 ? (
            <p className="text-gray-500">Aucun produit actif.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={produitsMoinsVendus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} allowDecimals={false} />
                <YAxis dataKey="nom" type="category" width={120} fontSize={12} />
                <Tooltip />
                <Bar dataKey="quantite" fill="#dc2626" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top clients */}
        <div className="border rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Top 3 des meilleurs clients</h2>

          {topClients.length === 0 ? (
            <p className="text-gray-500">Aucune commande sur cette période.</p>
          ) : (
            <div className="space-y-3">
              {topClients.map((client, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-2 last:border-b-0"
                >
                  <div>
                    <p className="font-medium">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"} {client.nom}
                    </p>
                    <p className="text-xs text-gray-500">
                      {client.commandes} commande{client.commandes > 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="font-bold">{client.total.toFixed(2)} €</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Évolution mensuelle des clients */}
        <div className="border rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-1">Évolution mensuelle des clients</h2>
          <p className="text-xs text-gray-400 mb-4">
            Nouveau = 1ère commande ce mois · Perdu = commandait le mois précédent, plus ce mois-ci
          </p>

          <div className="space-y-2">
            {evolutionClients.map((ligne, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm border-b pb-2 last:border-b-0"
              >
                <span className="capitalize font-medium">{ligne.mois}</span>
                <span className="text-green-600">+{ligne.nouveaux} nouveaux</span>
                <span className="text-red-600">-{ligne.perdus} perdus</span>
                <span className="text-gray-500">{ligne.actifs} actifs</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
