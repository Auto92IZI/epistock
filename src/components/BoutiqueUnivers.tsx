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
  lien_carrefour: string | null
  lien_auchan: string | null
  lien_leclerc: string | null
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
      .select("id,gamme,format,prix,lien_carrefour,lien_auchan,lien_leclerc")
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
            const f = produits.filter((p) => p.gamme === g)
            const sel = f.find((p) => p.id === choix[g]) || f[0]
            const q = qte[g] || 1
            const unitaire = prixAuLitreOuKilo(sel.format, Number(sel.prix))
            const comparatif = [
              { nom: "Carrefour", lien: sel.lien_carrefour },
              { nom: "Auchan", lien: sel.lien_auchan },
              { nom: "E.Leclerc", lien: sel.lien_leclerc },
            ].filter((x) => x.lien)

            return (
              <div key={g} className="rounded-2xl border p-6 shadow-sm">
                <h3 className="serif text-2xl font-semibold">{g}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {f.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setChoix({ ...choix, [g]: p.id })}
                      className="rounded-full border px-4 py-2 text-sm"
                      style={p.id === sel.id ? { background: couleur, color: "#fff", borderColor: couleur } : {}}
                    >
                      {p.format}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-2xl font-semibold" style={{ color: couleur }}>{eur(sel.prix)}</p>
                {unitaire && <p className="text-xs text-[#6b6a62]">{unitaire}</p>}

                {comparatif.length > 0 && (
                  <p className="mt-3 text-xs text-[#6b6a62]">
                    Comparer avec la grande distribution :{" "}
                    {comparatif.map((x, i) => (
                      <span key={x.nom}>
                        {i > 0 && " · "}
                        <Link
                          href={x.lien as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                          style={{ color: couleur }}
                        >
                          {x.nom} ↗
                        </Link>
                      </span>
                    ))}
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
