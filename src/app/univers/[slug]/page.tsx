import { notFound } from "next/navigation"
import { UNIVERS } from "@/content/site"
import BoutiqueUnivers from "@/components/BoutiqueUnivers"

export function generateStaticParams() {
  return Object.keys(UNIVERS).map((slug) => ({ slug }))
}

export default async function PageUnivers({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const u = UNIVERS[slug]
  if (!u) notFound()

  const degrade = `linear-gradient(135deg,${u.couleur},${u.accent})`

  return (
    <main style={{ background: u.fond }}>
      <section
        className="flex min-h-[70vh] items-end px-6 pb-16 text-white"
        style={{ backgroundImage: `linear-gradient(to top, rgba(20,18,12,.7), rgba(20,18,12,.15)), url(${u.hero}), ${degrade}`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: u.accent }}>{u.mot} · {u.nom}</p>
          <h1 className="serif mt-3 text-5xl font-semibold md:text-7xl">{u.titre}</h1>
          <p className="mt-4 max-w-xl text-lg text-white/85">{u.accroche}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pt-16 text-center">
        <p className="serif text-2xl leading-relaxed md:text-3xl" style={{ color: u.couleur }}>{u.intro}</p>
      </section>

      {u.chapitres.map((c, i) => {
        const contenu = (
          <div>
            <p className="text-xs uppercase tracking-[0.25em]" style={{ color: u.accent }}>{String(i + 1).padStart(2, "0")} — {c.label}</p>
            <h2 className="serif mt-3 text-4xl font-semibold" style={{ color: u.couleur }}>{c.titre}</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-[#3b3a35]">{c.texte}</p>
            {c.points && (
              <div className={`mt-6 grid gap-4 ${c.image ? "" : "sm:grid-cols-2"}`}>
                {c.points.map((p) => (
                  <div key={p.titre} className="overflow-hidden rounded-xl bg-white/70 shadow-sm">
                    {p.image && (
                      <div className="aspect-[16/10] bg-cover bg-center" style={{ backgroundImage: `url(${p.image}), ${degrade}` }} />
                    )}
                    <div className="p-4">
                      <h3 className="serif text-xl font-semibold" style={{ color: u.couleur }}>{p.titre}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#3b3a35]">{p.texte}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {c.note && <p className="mt-4 text-xs italic text-[#6b6a62]">{c.note}</p>}
          </div>
        )

        if (!c.image) {
          return <section key={c.titre} className="mx-auto max-w-3xl px-5 py-12">{contenu}</section>
        }

        return (
          <section key={c.titre} className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2">
            <div className={i % 2 ? "md:order-2" : ""}>{contenu}</div>
            <div
              className="aspect-[4/3] rounded-2xl bg-cover bg-center shadow-lg"
              style={{ backgroundImage: `url(${c.image}), ${degrade}` }}
            />
          </section>
        )
      })}

      <BoutiqueUnivers slug={slug} couleur={u.couleur} />
    </main>
  )
}
