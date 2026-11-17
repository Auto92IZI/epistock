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

  return (
    <main style={{ background: u.fond }}>
      <section
        className="flex min-h-[70vh] items-end px-6 pb-16 text-white"
        style={{ backgroundImage: `linear-gradient(to top, rgba(20,18,12,.7), rgba(20,18,12,.15)), url(${u.hero}), linear-gradient(135deg,${u.couleur},${u.accent})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: u.accent }}>{u.nom}</p>
          <h1 className="serif mt-3 text-5xl font-semibold md:text-7xl">{u.titre}</h1>
          <p className="mt-4 max-w-xl text-lg text-white/85">{u.accroche}</p>
        </div>
      </section>

      {u.chapitres.map((c, i) => (
        <section key={c.titre} className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2">
          <div className={i % 2 ? "md:order-2" : ""}>
            <p className="text-xs uppercase tracking-[0.25em]" style={{ color: u.accent }}>{String(i + 1).padStart(2, "0")} — {c.label}</p>
            <h2 className="serif mt-3 text-4xl font-semibold" style={{ color: u.couleur }}>{c.titre}</h2>
            <p className="mt-4 leading-relaxed text-[#3b3a35]">{c.texte}</p>
          </div>
          <div className="aspect-[4/3] rounded-2xl bg-cover bg-center shadow-lg" style={{ backgroundImage: `url(${c.image}), linear-gradient(135deg,${u.couleur},${u.accent})` }} />
        </section>
      ))}

      <BoutiqueUnivers slug={slug} couleur={u.couleur} />
    </main>
  )
}
