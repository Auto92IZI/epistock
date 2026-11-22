import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import { UNIVERS, universDeFamille } from "@/content/site"
import BoutiqueUnivers from "@/components/BoutiqueUnivers"

export function generateStaticParams() {
  return Object.keys(UNIVERS).map((slug) => ({ slug }))
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
  const Titre = multi ? "h3" : "h2"
  const degradeUnivers = `linear-gradient(135deg,${u.couleur},${u.accent})`

  return (
    <main style={{ background: u.fond }}>
      <section
        className="flex min-h-[70vh] items-end px-6 pb-16 text-white"
        style={{ backgroundImage: `linear-gradient(to top, rgba(20,18,12,.7), rgba(20,18,12,.15)), url(${u.hero}), ${degradeUnivers}`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: u.accent }}>{u.mot}</p>
          <h1 className="serif mt-3 text-5xl font-semibold md:text-7xl">{u.nom}</h1>
          <p className="mt-4 max-w-xl text-lg text-white/85">{u.accroche}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pt-16 text-center">
        <p className="serif text-2xl leading-relaxed md:text-3xl" style={{ color: u.couleur }}>{u.intro}</p>
      </section>

      {multi && (
        <nav aria-label="Produits de cet univers" className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-3 px-5">
          {familles.map(([fs, f]) => (
            <Link
              key={fs}
              href={`#${fs}`}
              className="rounded-full border px-5 py-2 text-sm font-medium"
              style={{ borderColor: f.couleur ?? u.couleur, color: f.couleur ?? u.couleur }}
            >
              {f.nom}
            </Link>
          ))}
        </nav>
      )}

      {familles.map(([fs, f]) => {
        const c = f.couleur ?? u.couleur
        const a = f.accent ?? u.accent
        const degrade = `linear-gradient(135deg,${c},${a})`

        return (
          <div key={fs} id={fs} className="scroll-mt-20">
            {multi && (
              <section className="px-5 pt-20 text-center">
                <p className="text-xs uppercase tracking-[0.3em]" style={{ color: a }}>{f.mot}</p>
                <h2 className="serif mt-2 text-5xl font-semibold" style={{ color: c }}>{f.titre}</h2>
                <div className="mx-auto mt-5 h-px w-24" style={{ background: a }} />
                {f.intro && <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-[#3b3a35]">{f.intro}</p>}
              </section>
            )}

            {f.chapitres.map((ch, i) => {
              const contenu = (
                <div>
                  <p className="text-xs uppercase tracking-[0.25em]" style={{ color: a }}>{String(i + 1).padStart(2, "0")} — {ch.label}</p>
                  <Titre className="serif mt-3 text-4xl font-semibold" style={{ color: c }}>{ch.titre}</Titre>
                  <p className="mt-4 whitespace-pre-line leading-relaxed text-[#3b3a35]">{ch.texte}</p>
                  {ch.points && (
                    <div className={`mt-6 grid gap-4 ${ch.image ? "" : "sm:grid-cols-2"}`}>
                      {ch.points.map((p) => (
                        <div key={p.titre} className="overflow-hidden rounded-xl bg-white/70 shadow-sm">
                          {p.image && (
                            <div className="aspect-[16/10] bg-cover bg-center" style={{ backgroundImage: `url(${p.image}), ${degrade}` }} />
                          )}
                          <div className="p-4">
                            <h4 className="serif text-xl font-semibold" style={{ color: c }}>{p.titre}</h4>
                            <p className="mt-1 text-sm leading-relaxed text-[#3b3a35]">{p.texte}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {ch.note && <p className="mt-4 text-xs italic text-[#6b6a62]">{ch.note}</p>}
                </div>
              )

              if (!ch.image) {
                return <section key={ch.titre} className="mx-auto max-w-3xl px-5 py-12">{contenu}</section>
              }

              return (
                <section key={ch.titre} className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2">
                  <div className={i % 2 ? "md:order-2" : ""}>{contenu}</div>
                  <div
                    className="aspect-[4/3] rounded-2xl bg-cover bg-center shadow-lg"
                    style={{ backgroundImage: `url(${ch.image}), ${degrade}` }}
                  />
                </section>
              )
            })}

            <BoutiqueUnivers slug={fs} couleur={c} titre={f.commander} />
          </div>
        )
      })}
    </main>
  )
}
