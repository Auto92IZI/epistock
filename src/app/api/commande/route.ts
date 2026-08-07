import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      clientNom,
      clientTelephone,
      dateRetrait,
      clientRemarque,
      total,
      lignes,
    } = body;


    // Création de la commande
    const { data: commande, error: erreurCommande } =
      await supabaseAdmin
        .from("Commandes")
        .insert({
          client_nom: clientNom,
          client_telephone: clientTelephone,
          date_retrait: dateRetrait,
          client_remarque: clientRemarque || null,
          total: total,
          statut: "En attente",
        })
        .select()
        .single();


    if (erreurCommande) {
  console.log("ERREUR SUPABASE COMMANDE :", erreurCommande);
  throw new Error(erreurCommande.message);
}


    // Création des lignes de commande
    const lignesAvecCommande = lignes.map((ligne: any) => ({
      commande_id: commande.id,
      produit_id: ligne.produit_id,
      quantite: ligne.quantite,
      prix_unitaire: ligne.prix_unitaire,
    }));


    const { error: erreurLignes } =
      await supabaseAdmin
        .from("Lignes_Commande")
        .insert(lignesAvecCommande);


    if (erreurLignes) {
      throw new Error(erreurLignes.message);
    }


    // Décrément du stock pour chaque produit commandé
    for (const ligne of lignes) {
      const { error: erreurStock } = await supabaseAdmin.rpc(
        "ajuster_stock",
        {
          produit_id_input: ligne.produit_id,
          delta: -ligne.quantite,
        }
      );

      if (erreurStock) {
        console.log("ERREUR AJUSTEMENT STOCK :", erreurStock);
      }
    }


    // Envoi de l'email de notification
    try {
      const listeProduits = lignes
        .map(
          (ligne: any) =>
            `- ${ligne.quantite} x produit #${ligne.produit_id} (${ligne.prix_unitaire} € / unité)`
        )
        .join("\n");

      await resend.emails.send({
        from: "EpiStock <onboarding@resend.dev>",
        to: "epistockbox@gmail.com",
        subject: `Nouvelle commande #${commande.id} - ${clientNom}`,
        text: `Nouvelle commande reçue !

Numéro : #${commande.id}
Client : ${clientNom}
Téléphone : ${clientTelephone}
Date de retrait : ${dateRetrait}
Remarque : ${clientRemarque || "aucune"}

Produits commandés :
${listeProduits}

Total : ${total} €

Rendez-vous sur la page d'administration pour préparer la commande.`,
      });
    } catch (erreurEmail) {
      console.log("ERREUR ENVOI EMAIL :", erreurEmail);
      // On ne bloque pas la commande si l'email échoue
    }


    return NextResponse.json({
      success: true,
      commandeId: commande.id,
    });


  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Erreur inconnue",
      },
      {
        status: 500,
      }
    );
    
  }
}
