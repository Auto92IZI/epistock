import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { Resend } from "resend"
import webpush from "@/lib/webpush"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const clientNom = String(body.clientNom || "").trim()
    const clientTelephone = String(body.clientTelephone || "").trim()
    const lignesRecues = Array.isArray(body.lignes) ? body.lignes : []

    if (!clientNom || !clientTelephone) {
      return NextResponse.json({ success: false, message: "Nom et téléphone requis." }, { status: 400 })
    }
    if (lignesRecues.length === 0) {
      return NextResponse.json({ success: false, message: "La commande est vide." }, { status: 400 })
    }

    const ids = lignesRecues.map((l: any) => Number(l.produit_id))

    const { data: produits, error: erreurProduits } = await supabaseAdmin
      .from("Produits")
      .select("id, nom, gamme, format, prix, disponible")
      .in("id", ids)

    if (erreurProduits) throw new Error(erreurProduits.message)

    const lignes: { produit_id: number; quantite: number; prix_unitaire: number; libelle: string }[] = []

    for (const l of lignesRecues) {
      const quantite = Math.floor(Number(l.quantite))
      const produit = (produits || []).find((p: any) => p.id === Number(l.produit_id))

      if (!produit || !produit.disponible || !(Number(produit.prix) > 0) || !(quantite >= 1)) {
        return NextResponse.json(
          { success: false, message: "Un des produits n'est plus disponible à la commande." },
          { status: 400 }
        )
      }

      lignes.push({
        produit_id: produit.id,
        quantite,
        prix_unitaire: Number(produit.prix),
        libelle: produit.gamme ? `${produit.gamme} (${produit.format})` : produit.nom,
      })
    }

    const total = Math.round(lignes.reduce((t, l) => t + l.quantite * l.prix_unitaire, 0) * 100) / 100

    const { data: commande, error: erreurCommande } = await supabaseAdmin
      .from("Commandes")
      .insert({
        client_nom: clientNom,
        client_telephone: clientTelephone,
        date_retrait: new Date().toISOString().split("T")[0],
        client_remarque: null,
        total,
        statut: "En attente",
        interne: false,
      })
      .select()
      .single()

    if (erreurCommande) throw new Error(erreurCommande.message)

    const { error: erreurLignes } = await supabaseAdmin
      .from("Lignes_Commande")
      .insert(
        lignes.map((l) => ({
          commande_id: commande.id,
          produit_id: l.produit_id,
          quantite: l.quantite,
          prix_unitaire: l.prix_unitaire,
        }))
      )

    if (erreurLignes) {
      await supabaseAdmin.from("Commandes").delete().eq("id", commande.id)
      throw new Error(erreurLignes.message)
    }

    try {
      const detail = lignes
        .map((l) => `- ${l.quantite} x ${l.libelle} : ${l.prix_unitaire.toFixed(2)} € l'unité`)
        .join("\n")

      await resend.emails.send({
        from: "Alma Lusa <onboarding@resend.dev>",
        to: "epistockbox@gmail.com",
        subject: `Nouvelle commande #${commande.id} - ${clientNom}`,
        text: `Nouvelle commande reçue !

Numéro : #${commande.id}
Client : ${clientNom}
Téléphone : ${clientTelephone}

Produits commandés :
${detail}

Total : ${total.toFixed(2)} €

Rendez-vous sur la page d'administration pour préparer la commande.`,
      })
    } catch (erreurEmail) {
      console.log("ERREUR ENVOI EMAIL :", erreurEmail)
    }

    try {
      const { data: abonnements } = await supabaseAdmin.from("push_subscriptions").select("*")

      const { count: nombreActives } = await supabaseAdmin
        .from("Commandes")
        .select("id", { count: "exact", head: true })
        .not("statut", "in", '("Récupérée","Annulée")')

      const payload = JSON.stringify({
        title: `Nouvelle commande #${commande.id}`,
        body: `${clientNom} - ${total.toFixed(2)} €`,
        url: `/admin?commande=${commande.id}`,
        badgeCount: nombreActives || 1,
      })

      for (const abonnement of abonnements || []) {
        try {
          await webpush.sendNotification(abonnement.subscription, payload)
        } catch (erreurEnvoi: any) {
          if (erreurEnvoi.statusCode === 410 || erreurEnvoi.statusCode === 404) {
            await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", abonnement.endpoint)
          } else {
            console.log("ERREUR ENVOI PUSH :", erreurEnvoi)
          }
        }
      }
    } catch (erreurPush) {
      console.log("ERREUR NOTIFICATIONS PUSH :", erreurPush)
    }

    return NextResponse.json({ success: true, commandeId: commande.id })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    )
  }
}
