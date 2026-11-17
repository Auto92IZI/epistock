import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Inter } from "next/font/google"
import "./globals.css"
import RegisterSW from "@/components/RegisterSW"
import { Entete, Pied } from "@/components/Chrome"
import { SITE } from "@/content/site"

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-serif" })
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: SITE.nom,
  description: SITE.accroche,
  manifest: "/manifest.json",
  icons: { apple: "/logo.png" },
  appleWebApp: { capable: true, statusBarStyle: "default", title: SITE.nom },
}

export const viewport: Viewport = { themeColor: "#4F5D2A", colorScheme: "light" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable} antialiased`}>
      <body style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}>
        <RegisterSW />
        <Entete />
        {children}
        <Pied />
      </body>
    </html>
  )
}
