"use client"

import { useEffect, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"

type Props = {
  onScan: (code: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const idScanner = "zone-scanner"
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    const scanner = new Html5Qrcode(idScanner)
    scannerRef.current = scanner

    let dejaLu = false

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (codeDecode) => {
          if (dejaLu) return
          dejaLu = true
          onScan(codeDecode)
        },
        () => {
          // erreurs de lecture image par image, ignorées volontairement
        }
      )
      .catch((err) => {
        console.error("Erreur démarrage caméra :", err)
      })

    return () => {
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {})
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Scanner un code-barres</h3>
          <button
            onClick={onClose}
            className="text-xl font-bold text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        <div id={idScanner} className="w-full" />

        <p className="mt-3 text-xs text-gray-500 text-center">
          Placez le code-barres bien centré face à la caméra
        </p>
      </div>
    </div>
  )
}
