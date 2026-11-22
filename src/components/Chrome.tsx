"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { SITE, UNIVERS } from "@/content/site"
import { lirePanier } from "@/lib/panier"
import BulleEnvies from "@/components/BulleEnvies"

export function Entete() {
  const p = usePathname()
  const [n, setN] = useState(0)

  useEffect(() => {
    const maj = () => setN(lirePanier().reduce((t, l) => t + l.quantite, 0))
    maj()
    window.addEventListener("panier", maj)
    return () => window.removeEventListener("panier", maj)
  }, [])

  if (p?.startsWith("/admin")) return null

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[#FAF6EE]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.webp" alt="" width={48} height={48} className="h-12 w-12" />
          <span className="serif text-2xl font-semibold">{SITE.nom}</span>
        </Link>
        <nav className="hidden gap-5 text-sm md:flex">
          {Object.entries(UNIVERS).map(([s, u]) => (
            <Link key={s} href={`/univers/${s}`} className="hover:underline" style={{ color: u.couleur }}>{u.nom}</Link>
          ))}
        </nav>
        <Link href="/commander" className="rounded-full bg-[#2B2A26] px-4 py-2 text-sm font-medium text-white">
          Ma commande{n > 0 && ` (${n})`}
        </Link>
      </div>
    </header>
  )
}

export function Pied() {
  const p = usePathname()
  if (p?.startsWith("/admin")) return null

  return (
    <>
      <footer className="border-t border-black/5 px-5 py-10 text-center text-xs text-[#6b6a62]">
        <img src="/logo.webp" alt={SITE.nom} width={72} height={72} className="mx-auto mb-3 h-[72px] w-[72px]" />
        <p className="serif text-lg text-[#2B2A26]">{SITE.nom}</p>
        <p className="mt-2">L'abus d'alcool est dangereux pour la santé. À consommer avec modération.</p>
        <Link href="/admin" aria-label="Administration" className="mt-4 inline-block opacity-30 hover:opacity-70">🔒</Link>
      </footer>
      <BulleEnvies />
    </>
  )
}
