import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("Demandes")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, demandes: data })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    )
  }
}
