import { ImageResponse } from "next/og"
import { iconeJSX } from "@/lib/icone"

export const size = { width: 64, height: 64 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(iconeJSX(64), size)
}
