import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { Resend } from "resend"
import webpush from "@/lib/webpush"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Champ piège : un humain ne le remplit jamais
    if (body.site) return NextResponse.json({ success: true })

    const nom = String(body.nom || "").trim().slice(0, 100)
    const telephone = String(body.telephone || "").trim().slice(0, 30)
    const message = String(body.message || "").trim().slice(0, 1000)

    if (!nom || !telephone || !message) {
      return NextResponse.json({ success: false, message: "Merci de remplir les trois champs." }, { status: 400 })
    }

    const chiffres = telephone.replace(/\D/g, "")
    if (chiffres.length < 8 || chiffres.length > 15) {
      return NextResponse.json({ success: false, message: "Le numéro de téléphone n'a pas l'air valide." }, { status: 400 })
    }

    const uneHeure = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: memeNumero } = await supabaseAdmin
      .from("Demandes")
      .select("id", { count: "exact", head: true })
      .eq("telephone", telephone)
      .gte("created_at", uneHeure)

    const dixMinutes = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { count: recentes } = await supabaseAdmin
      .from("Demandes")
      .select("id", { count: "exact", head: true })
      .gte("created_at", dixMinutes)

    if ((memeNumero || 0) >= 5 || (recentes || 0) >= 30) {
      return NextResponse.json({ success: false, message: "Trop de demandes pour le moment, réessayez un peu plus tard." }, { status: 429 })
    }

    const { error } = await supabaseAdmin.from("Demandes").insert({ nom, telephone, message })
    if (error) throw new Error(error.message)

    try {
      await resend.emails.send({
        from: "Alma Lusa <onboarding@resend.dev>",
        to: "epistockbox@gmail.com",
        subject: `Demande particulière - ${nom}`,
        text: `Nouvelle demande particulière !\n\nDe : ${nom}\nTéléphone : ${telephone}\n\nDemande :\n${message}\n\nRetrouvez-la dans l'administration, rubrique Demandes.`,
      })
    } catch (erreurEmail) {
      console.log("ERREUR ENVOI EMAIL DEMANDE :", erreurEmail)
    }

    try {
      const { data: abonnements } = await supabaseAdmin.from("push_subscriptions").select("*")

      const payload = JSON.stringify({
        title: "Nouvelle demande particulière",
        body: `${nom} : ${message.slice(0, 80)}`,
        url: "/admin/demandes",
      })

      for (const abonnement of abonnements || []) {
        try {
          await webpush.sendNotification(abonnement.subscription, payload)
        } catch (erreurEnvoi: any) {
          if (erreurEnvoi.statusCode === 410 || erreurEnvoi.statusCode === 404) {
            await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", abonnement.endpoint)
          }
        }
      }
    } catch (erreurPush) {
      console.log("ERREUR PUSH DEMANDE :", erreurPush)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Une erreur est survenue, réessayez." }, { status: 500 })
  }
}
