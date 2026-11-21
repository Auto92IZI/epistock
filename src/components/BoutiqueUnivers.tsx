"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { ajouter } from "@/lib/panier"
import { prixAuLitreOuKilo } from "@/lib/prixUnitaire"

type P = {
  id: number
  gamme: string
  format: string
  prix: number
  mis_en_avant: boolean | null
  lien_comparaison: string | null
}

const eur = (n: number) => `${Number(n).toFixed(2).replace(".", ",")} €`

export default function BoutiqueUnivers({ slug, couleur }: { slug: string; couleur: string }) {
  const [produits, setProduits] = useState<P[]>([])
  const [choix, setChoix] = useState<Record<string, number>>({})
  const [qte, setQte] = useState<Record<string, number>>({})
  const [ok, setOk] = useState("")

  useEffect(() => {
    supabase
      .from("Produits")
      .select("id,gamme,format,prix,mis_en_avant,lien_comparaison")
      .eq("univers", slug)
      .eq("disponible", true)
      .gt("prix", 0)
      .order("prix")
      .then(({ data }) => setProduits((data as P[]) || []))
  }, [slug])

  const gammes = Array.from(new Set(produits.map((p) => p.gamme)))

  return (
    <section id="commander" className="bg-white px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="serif text-4xl font-semibold" style={{ color: couleur }}>Commander</h2>
        <p className="mt-2 text-sm text-[#5b5a53]">Sur commande, à retirer sur place. Nous vous prévenons dès que c'est prêt.</p>
        {gammes.length === 0 && <p className="mt-8 text-[#5b5a53]">Les produits arrivent bientôt.</p>}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {gammes.map((g) => {
            // Formats mis en avant d'abord, puis les autres, chacun trié par prix
            const f = produits
              .filter((p) => p.gamme === g)
              .sort((a, b) => Number(!!b.mis_en_avant) - Number(!!a.mis_en_avant) || a.prix - b.prix)
            const sel = f.find((p) => p.id === choix[g]) || f[0]
            const q = qte[g] || 1
            const unitaire = prixAuLitreOuKilo(sel.format, Number(sel.prix))

            return (
              <div key={g} className="rounded-2xl border p-6 shadow-sm">
                <h3 className="serif text-2xl font-semibold">{g}</h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  {f.map((p) => {
                    const actif = p.id === sel.id
                    const avant = !!p.mis_en_avant
                    return (
                      <button
                        key={p.id}
                        onClick={() => setChoix({ ...choix, [g]: p.id })}
                        className={`rounded-full border px-4 py-2 text-sm ${avant ? "font-semibold" : "text-[#6b6a62]"}`}
                        style={
                          actif
                            ? { background: couleur, color: "#fff", borderColor: couleur }
                            : avant
                            ? { borderColor: couleur, color: couleur }
                            : {}
                        }
                      >
                        {avant && "★ "}
                        {p.format}
                      </button>
                    )
                  })}
                </div>

                {sel.mis_en_avant && (
                  <p className="mt-3 text-xs font-medium" style={{ color: couleur }}>★ Notre sélection</p>
                )}

                <p className="mt-3 text-2xl font-semibold" style={{ color: couleur }}>{eur(sel.prix)}</p>

                {(unitaire || sel.lien_comparaison) && (
                  <p className="text-xs text-[#6b6a62]">
                    {unitaire}
                    {unitaire && sel.lien_comparaison && " · "}
                    {sel.lien_comparaison && (
                      <Link
                        href={sel.lien_comparaison}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                        style={{ color: couleur }}
                      >
                        Comparez ↗
                      </Link>
                    )}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center rounded-full border">
                    <button className="h-10 w-10 text-lg" onClick={() => setQte({ ...qte, [g]: Math.max(1, q - 1) })}>−</button>
                    <input
                      type="number"
                      min={1}
                      value={q}
                      onChange={(e) => setQte({ ...qte, [g]: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-14 bg-transparent text-center outline-none"
                    />
                    <button className="h-10 w-10 text-lg" onClick={() => setQte({ ...qte, [g]: q + 1 })}>+</button>
                  </div>
                  <button
                    onClick={() => {
                      ajouter({ id: sel.id, nom: g, format: sel.format, prix: Number(sel.prix), quantite: q })
                      setOk(g)
                      setTimeout(() => setOk(""), 1800)
                    }}
                    className="flex-1 rounded-full px-5 py-3 font-medium text-white"
                    style={{ background: couleur }}
                  >
                    {ok === g ? "Ajouté ✓" : "Ajouter à ma commande"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
