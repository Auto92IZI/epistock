import Image from "next/image"
import Link from "next/link"
import { Poppins, Inter } from "next/font/google"
import IosInstallBanner from "@/components/IosInstallBanner"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-poppins",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export default function HomePage() {
  return (
    <main
      className={`${poppins.variable} ${inter.variable} min-h-screen flex flex-col items-center justify-between px-6 py-10 relative overflow-hidden`}
      style={{ backgroundColor: "#FAFAF8" }}
    >
      {/* Lueur douce derrière le logo */}
      <div
        aria-hidden
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(30,122,60,0.10) 0%, rgba(240,149,31,0.06) 45%, transparent 70%)",
        }}
      />

      <div className="flex-1" />

      <div className="flex flex-col items-center text-center relative z-10 max-w-md">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mb-6">
          <Image
            src="/logo.png"
            alt="DI Shop - Épicerie mini prix"
            fill
            priority
            className="object-contain"
          />
        </div>

        <p
          className="text-lg sm:text-xl mb-10"
          style={{ color: "#4B5563", fontFamily: "var(--font-inter)" }}
        >
          Vos courses préparées, prêtes à récupérer.
        </p>

        <Link
          href="/commander"
          className="font-semibold text-white text-lg px-10 py-4 rounded-full shadow-sm transition-transform active:scale-95"
          style={{ backgroundColor: "#1E7A3C", fontFamily: "var(--font-poppins)" }}
        >
          Commander
        </Link>
      </div>

      <div className="flex-1" />

      {/* Accès admin discret */}
      <Link
        href="/admin"
        aria-label="Administration"
        className="relative z-10 opacity-70 hover:opacity-100 transition-opacity p-3"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </Link>
      <IosInstallBanner />
    </main>
  )
}
