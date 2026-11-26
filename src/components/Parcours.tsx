"use client"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import MediaFond from "@/components/MediaFond"

export type PointP = { titre: string; texte: string; image?: string }
export type Calque = { image?: string; video?: string; videoPortrait?: string }
export type Etape = { calque: number; label: string; titre: string; texte: string; points?: PointP[]; note?: string }

export default function Parcours({ calques, etapes, couleur, accent, niveau }: { calques: Calque[]; etapes: Etape[]; couleur: string; accent: string; niveau: 2 | 3 }) {
  const [actif, setActif] = useState(0)
  const refs = useRef<(HTMLDivElement | null)[]>([])

  const degrade = `linear-gradient(135deg,${couleur},${accent})`
  const Titre = niveau === 2 ? "h2" : "h3"
  const SousTitre = niveau === 2 ? "h3" : "h4"
  const calqueActif = etapes[actif]?.calque ?? 0

  // L'étape qui croise le milieu de l'écran devient l'étape active
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) {
          if (e.isIntersecting) setActif(Number((e.target as HTMLElement).dataset.index))
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    )
    refs.current.forEach((el) => {
      if (el) obs.observe(el)
    })

    return () => obs.disconnect()
  }, [])

  return (
    <section className="relative">
      <div className="sticky top-0 h-[100svh] overflow-hidden" aria-hidden="true">
        {calques.map((c, i) => (
          <div key={i} className="calque absolute inset-0" data-etat={i === calqueActif ? "actif" : i < calqueActif ? "apres" : "avant"}>
            <div className={`absolute inset-0 ${i === calqueActif ? "kenburns" : ""}`}>
              <MediaFond image={c.image} video={c.video} videoPortrait={c.videoPortrait} degrade={degrade} actif={i === calqueActif} proche={Math.abs(i - calqueActif) <= 1} />
            </div>
          </div>
        ))}

        <div className="absolute inset-0 bg-black/20" />

        {etapes.length > 1 && (
          <ol className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2 md:right-6">
            {etapes.map((_, i) => (
              <li key={i} className="h-2.5 w-2.5 rounded-full shadow transition-all duration-500" style={{ background: i === actif ? accent : "rgba(255,255,255,.6)", transform: i === actif ? "scale(1.5)" : "scale(1)" }} />
            ))}
          </ol>
        )}
      </div>

      <div className="relative z-10" style={{ marginTop: "-100svh" }}>
        {etapes.map((e, i) => (
          <div
            key={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            data-index={i}
            className="flex min-h-[100svh] items-end px-4 pb-10 pt-36 md:items-center md:px-12 md:pb-16"
          >
            <div className="carte-scene w-full max-w-md rounded-2xl bg-[#FBF7EC]/95 p-6 shadow-2xl backdrop-blur-sm" data-actif={i === actif}>
              <p className="text-xs uppercase tracking-[0.25em]" style={{ color: accent }}>
                {String(i + 1).padStart(2, "0")} — {e.label}
              </p>
              <Titre className="serif mt-3 text-4xl font-semibold" style={{ color: couleur }}>{e.titre}</Titre>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-[#3b3a35]">{e.texte}</p>

              {e.points && (
                <div className="mt-5 space-y-3">
                  {e.points.map((p) => (
                    <div key={p.titre} className="overflow-hidden rounded-xl bg-white/80 shadow-sm">
                      {p.image && (
                        <div className="relative aspect-[16/10]" style={{ backgroundImage: degrade }}>
                          <Image src={p.image} alt={p.titre} fill sizes="(min-width: 768px) 28rem, 90vw" className="object-cover" />
                        </div>
                      )}
                      <div className="p-4">
                        <SousTitre className="serif text-xl font-semibold" style={{ color: couleur }}>{p.titre}</SousTitre>
                        <p className="mt-1 text-sm leading-relaxed text-[#3b3a35]">{p.texte}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {e.note && <p className="mt-4 text-xs italic text-[#6b6a62]">{e.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
