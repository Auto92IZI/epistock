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
  image_url: string | null
}

type Groupe = { motCle: string; titre: string }

const eur = (n: number) => `${Number(n).toFixed(2).replace(".", ",")} €`
const normaliser = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

export default function BoutiqueUnivers({
  slug,
  couleur,
  titre = "Commander",
  groupes,
}: {
  slug: string
  couleur: string
  titre?: string
  groupes?: Groupe[]
}) {
  const [produits, setProduits] = useState<P[]>([])
  const [choix, setChoix] = useState<Record<string, number>>({})
  const [qte, setQte] = useState<Record<string, number>>({})
  const [ouverts, setOuverts] = useState<Record<string, boolean>>({})
  const [ok, setOk] = useState("")

  useEffect(() => {
    supabase
      .from("Produits")
      .select("id,gamme,format,prix,mis_en_avant,lien_comparaison,image_url")
      .eq("univers", slug)
      .eq("disponible", true)
      .gt("prix", 0)
      .order("prix")
      .then(({ data }) => setProduits((data as P[]) || []))
  }, [slug])

  const gammes = Array.from(new Set(produits.map((p) => p.gamme)))

  // Regroupement par mot-clé (ex. « rouge » / « blanc ») ; ce qui ne correspond à rien reste affiché
  const blocs: { titre: string | null; gammes: string[] }[] = []
  if (groupes && groupes.length > 0) {
    const restantes = new Set(gammes)
    for (const gr of groupes) {
      const trouvees = gammes
        .filter((g) => restantes.has(g) && normaliser(g).includes(normaliser(gr.motCle)))
        .sort((a, b) => a.localeCompare(b, "fr"))
      trouvees.forEach((g) => restantes.delete(g))
      if (trouvees.length > 0) blocs.push({ titre: gr.titre, gammes: trouvees })
    }
    if (restantes.size > 0) {
      blocs.push({ titre: blocs.length > 0 ? "Autres" : null, gammes: Array.from(restantes) })
    }
  } else {
    blocs.push({ titre: null, gammes })
  }

  function carte(g: string, groupee: boolean) {
    const TitreCarte = groupee ? "h4" : "h3"

    // Formats mis en avant d'abord, puis les autres, chacun trié par prix
    const f = produits
      .filter((p) => p.gamme === g)
      .sort((a, b) => Number(!!b.mis_en_avant) - Number(!!a.mis_en_avant) || a.prix - b.prix)
    const enAvant = f.filter((p) => p.mis_en_avant)
    const autresFormats = enAvant.length > 0 ? f.filter((p) => !p.mis_en_avant) : []

    const sel = f.find((p) => p.id === choix[g]) || f[0]
    const deplie = !!ouverts[g] || (autresFormats.length > 0 && !sel.mis_en_avant)
    const visibles = autresFormats.length > 0 && !deplie ? enAvant : f

    const q = qte[g] || 1
    const unitaire = prixAuLitreOuKilo(sel.format, Number(sel.prix))
    const photo = sel.image_url || f.find((p) => p.image_url)?.image_url || null

    return (
      <div key={g} className="overflow-hidden rounded-2xl border shadow-sm">
        {photo && (
          <div className="flex h-60 items-center justify-center bg-[#F6F2E8] p-4">
            <img src={photo} alt={g} loading="lazy" decoding="async" className="h-full w-full object-contain" />
          </div>
        )}

        <div className="p-6">
          <TitreCarte className="serif text-2xl font-semibold">{g}</TitreCarte>

          <div className="mt-4 flex flex-wrap gap-2">
            {visibles.map((p) => {
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

          {autresFormats.length > 0 && (
            <button
              onClick={() => {
                if (deplie) {
                  setOuverts({ ...ouverts, [g]: false })
                  if (!sel.mis_en_avant) setChoix({ ...choix, [g]: enAvant[0].id })
                } else {
                  setOuverts({ ...ouverts, [g]: true })
                }
              }}
              className="mt-2 text-xs underline"
              style={{ color: couleur }}
            >
              {deplie ? "Masquer les autres formats" : `Autres formats (${autresFormats.length})`}
            </button>
          )}

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
      </div>
    )
  }

  return (
    <section id={`commander-${slug}`} className="scroll-mt-32 bg-white px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="serif text-4xl font-semibold" style={{ color: couleur }}>{titre}</h2>
        <p className="mt-2 text-sm text-[#5b5a53]">Nous vous préviendrons dès que votre commande sera prête.</p>
        {gammes.length === 0 && <p className="mt-8 text-[#5b5a53]">Les produits arrivent bientôt.</p>}

        <div className="mt-8 space-y-10">
          {blocs.map((b, i) => (
            <div key={i}>
              {b.titre && (
                <h3 className="serif mb-4 text-2xl font-semibold" style={{ color: couleur }}>{b.titre}</h3>
              )}
              <div className="grid gap-6 md:grid-cols-2">
                {b.gammes.map((g) => carte(g, !!b.titre))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
