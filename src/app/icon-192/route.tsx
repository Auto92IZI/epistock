import { ImageResponse } from "next/og"
import { iconeJSX } from "@/lib/icone"

export function GET() {
  return new ImageResponse(iconeJSX(192), { width: 192, height: 192 })
}
