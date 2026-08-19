import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(request: Request) {
  try {
    const subscription = await request.json()

    const { error } = await supabaseAdmin
      .from("push_subscriptions")
      .upsert(
        {
          endpoint: subscription.endpoint,
          subscription: subscription,
        },
        { onConflict: "endpoint" }
      )

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    )
  }
}
