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
  quantite: number
  prix_unitaire: number
  Produits: { nom: string } | null
}

type Commande = {
  id: number
  total: number
  statut: string
  created_at: string
  Lignes_Commande: LigneCommande[]
}

export default function DashboardPage() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [chargement, setChargement] = useState(true)
  const [periode, setPeriode] = useState<7 | 30>(7)

  useEffect(() => {
    chargerDonnees()
  }, [])

  async function chargerDonnees() {
    setChargement(true)

    const { data, error } = await supabase
      .from("Commandes")
      .select(`
        id,
        total,
        statut,
        created_at,
        Lignes_Commande (
          quantite,
          prix_unitaire,
          Produits ( nom )
        )
      `)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Erreur chargement dashboard :", error)
      setChargement(false)
      return
    }

    setCommandes(data as any)
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

  const caTotal = commandesPeriode.reduce((total, c) => total + Number(c.total), 0)
  const nombreCommandes = commandesPeriode.length
  const panierMoyen = nombreCommandes > 0 ? caTotal / nombreCommandes : 0

  // Construction des données jour par jour pour le graphique
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

  // Calcul des produits les plus vendus sur la période
  const ventesParProduit: { [nom: string]: number } = {}

  commandesPeriode.forEach((commande) => {
    commande.Lignes_Commande?.forEach((ligne) => {
      const nom = ligne.Produits?.nom || "Produit inconnu"
      ventesParProduit[nom] = (ventesParProduit[nom] || 0) + ligne.quantite
    })
  })

  const topProduits = Object.entries(ventesParProduit)
    .map(([nom, quantite]) => ({ nom, quantite }))
    .sort((a, b) => b.quantite - a.quantite)
    .slice(0, 5)

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Top produits */}
      <div className="border rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Produits les plus vendus</h2>

        {topProduits.length === 0 ? (
          <p className="text-gray-500">Aucune vente sur cette période.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProduits} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" fontSize={12} />
              <YAxis dataKey="nom" type="category" width={120} fontSize={12} />
              <Tooltip />
              <Bar dataKey="quantite" fill="#1E7A3C" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </main>
  )
}
