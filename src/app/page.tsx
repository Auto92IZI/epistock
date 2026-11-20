import Link from "next/link"
import { SITE, UNIVERS } from "@/content/site"
import IosInstallBanner from "@/components/IosInstallBanner"

export default function Accueil() {
  return (
    <main>
      <section
        className="flex min-h-[78vh] items-center justify-center px-6 py-16 text-center text-white"
        style={{ backgroundImage: "linear-gradient(rgba(30,28,20,.45),rgba(30,28,20,.65)), url(/images/accueil.jpg), linear-gradient(135deg,#4F5D2A,#B7791F 55%,#6E1B38)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="max-w-3xl">
          <img src="/logo.webp" alt={SITE.nom} width={220} height={220} className="mx-auto mb-6 h-40 w-40 drop-shadow-2xl md:h-56 md:w-56" />
          <h1 className="sr-only">{SITE.nom}</h1>
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#F2D98A]">Bio · Artisanal · Portugal</p>
          <p className="mx-auto max-w-xl text-lg text-white/90">{SITE.accroche}</p>
          <Link href="#univers" className="mt-8 inline-block rounded-full bg-[#F2D98A] px-7 py-3 font-medium text-[#2B2A26]">Découvrir nos produits</Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2">
        <div
          className="aspect-[4/3] rounded-2xl bg-cover bg-center shadow-lg"
          style={{ backgroundImage: "url(/images/Nord-Portugal.jpg), linear-gradient(135deg,#4F5D2A,#B7791F)" }}
        />
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#B7791F]">Notre histoire</p>
          <h2 className="serif mt-3 text-4xl font-semibold text-[#4F5D2A]">L'âme du Portugal, dans votre assiette</h2>
          <p className="mt-4 leading-relaxed text-[#3b3a35]">
            Huile d'olive, miel, porto et eau-de-vie : des produits de petits producteurs, du nord du Portugal à l'Alentejo, bio et artisanaux, fidèles aux recettes et aux gestes transmis de génération en génération.
          </p>
        </div>
      </section>

      <section id="univers" className="mx-auto grid max-w-6xl gap-5 px-5 pb-20 sm:grid-cols-2">
        {Object.entries(UNIVERS).map(([slug, u]) => (
          <Link
            key={slug}
            href={`/univers/${slug}`}
            className="group flex min-h-[260px] flex-col justify-end rounded-2xl p-7 text-white"
            style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,.6), rgba(0,0,0,.05)), url(${u.hero}), linear-gradient(135deg,${u.couleur},${u.accent})`, backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <p className="text-xs uppercase tracking-[0.25em]" style={{ color: "#F2D98A" }}>{u.mot}</p>
            <h2 className="serif mt-1 text-3xl font-semibold">{u.nom}</h2>
            <p className="mt-1 text-white/85">{u.accroche}</p>
            <span className="mt-3 text-sm group-hover:underline">Entrer dans l'univers →</span>
          </Link>
        ))}
      </section>
      <IosInstallBanner />
    </main>
  )
}
