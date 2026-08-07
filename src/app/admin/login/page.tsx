"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [motDePasse, setMotDePasse] = useState("")
  const [erreur, setErreur] = useState("")
  const [chargement, setChargement] = useState(false)

  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErreur("")
    setChargement(true)

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motDePasse }),
    })

    const data = await res.json()

    setChargement(false)

    if (data.success) {
      router.push("/admin")
      router.refresh()
    } else {
      setErreur("Mot de passe incorrect")
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 border rounded-xl p-6 shadow-sm"
      >
        <h1 className="text-2xl font-bold text-center">
          Administration DI Shop
        </h1>

        <input
          type="password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          placeholder="Mot de passe"
          className="w-full border rounded p-3"
          autoFocus
        />

        {erreur && (
          <p className="text-red-600 text-sm">{erreur}</p>
        )}

        <button
          type="submit"
          disabled={chargement}
          className="w-full bg-blue-600 text-white py-3 rounded font-medium"
        >
          {chargement ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </main>
  )
}
