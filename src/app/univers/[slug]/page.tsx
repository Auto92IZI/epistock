import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import { UNIVERS, universDeFamille, type Famille } from "@/content/site"
import { videosDe } from "@/lib/medias"
import BoutiqueUnivers from "@/components/BoutiqueUnivers"
import MediaFond from "@/components/MediaFond"
import Parcours, { type Calque, type Etape } from "@/components/Parcours"

export function generateStaticParams() {
  return Object.keys(UNIVERS).map((slug) => ({ slug }))
}

// Une étape sans photo garde le décor de l'étape précédente
function construireParcours(f: Famille, imageParDefaut?: string) {
  const calques: Calque[] = []
  const etapes: Etape[] = []
  let derniere: string | undefined

  for (const ch of f.chapitres) {
    const image = ch.image ?? derniere
    if (image && image !== derniere) {
      calques.push({ image, ...videosDe(image) })
      derniere = image
    }
    etapes.push({
      calque: Math.max(calques.length - 1, 0),
      label: ch.label,
      titre: ch.titre,
      texte: ch.texte,
      points: ch.points,
      note: ch.note,
    })
  }

  if (calques.length === 0) calques.push({ image: imageParDefaut })
  return { calques, etapes }
}

export default async function PageUnivers({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const u = UNIVERS[slug]

  if (!u) {
    // Anciennes adresses : /univers/miel, /univers/porto, etc.
    const cible = universDeFamille(slug)
    if (cible) permanentRedirect(`/univers/${cible}#${slug}`)
    notFound()
  }

  const familles = Object.entries(u.familles)
  const multi = familles.length > 1
  const degradeUnivers = `linear-gradient(135deg,${u.couleur},${u.accent})`

  return (
    <main style={{ background: u.fond }}>
      <nav aria-label="Aller à la commande" className="sticky top-[65px] z-30 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-2">
          {multi && <span className="shrink-0 text-sm text-[#6b6a62]">Commander :</span>}
          {familles.map(([fs, f]) => (
            <Link key={fs} href={`#commander-${fs}`} className="shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold text-white" style={{ background: f.couleur ?? u.couleur }}>
              {multi ? f.nom : "Commander"} ↓
            </Link>
          ))}
        </div>
      </nav>

      <section className="relative flex min-h-[100svh] items-end overflow-hidden px-6 pb-20 text-white">
        <div className="kenburns absolute inset-0">
          <MediaFond image={u.hero} {...videosDe(u.hero)} degrade={degradeUnivers} priorite />
        </div>
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(to top, rgba(20,18,12,.75), rgba(20,18,12,.1) 55%, rgba(20,18,12,.25))" }} />
        <div className="relative mx-auto w-full max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: u.accent }}>{u.mot}</p>
          <h1 className="serif mt-3 text-5xl font-semibold md:text-7xl">{u.nom}</h1>
          <p className="mt-4 max-w-xl text-lg text-white/85">{u.accroche}</p>
        </div>
        <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-white/80" aria-hidden="true">Faire défiler ↓</p>
      </section>

      <section className="mx-auto max-w-3xl px-5 pt-16 text-center">
        <p className="serif text-2xl leading-relaxed md:text-3xl" style={{ color: u.couleur }}>{u.intro}</p>
      </section>

      {multi && (
        <nav aria-label="Produits de cet univers" className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-3 px-5">
          {familles.map(([fs, f]) => (
            <Link key={fs} href={`#${fs}`} className="rounded-full border px-5 py-2 text-sm font-medium" style={{ borderColor: f.couleur ?? u.couleur, color: f.couleur ?? u.couleur }}>
              {f.nom}
            </Link>
          ))}
        </nav>
      )}

      {familles.map(([fs, f]) => {
        const c = f.couleur ?? u.couleur
        const a = f.accent ?? u.accent
        const { calques, etapes } = construireParcours(f, u.hero)

        return (
          <div key={fs} id={fs} className="scroll-mt-32">
            {multi && (
              <section className="px-5 pb-12 pt-20 text-center">
                <p className="text-xs uppercase tracking-[0.3em]" style={{ color: a }}>{f.mot}</p>
                <h2 className="serif mt-2 text-5xl font-semibold" style={{ color: c }}>{f.titre}</h2>
                <div className="mx-auto mt-5 h-px w-24" style={{ background: a }} />
                {f.intro && <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-[#3b3a35]">{f.intro}</p>}
              </section>
            )}

            <Parcours calques={calques} etapes={etapes} couleur={c} accent={a} niveau={multi ? 3 : 2} />

            <BoutiqueUnivers slug={fs} couleur={c} titre={f.commander} groupes={f.groupes} />
          </div>
        )
      })}
    </main>
  )
}
