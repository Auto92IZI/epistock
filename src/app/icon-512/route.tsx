import { ImageResponse } from "next/og"
import { iconeJSX } from "@/lib/icone"

export function GET() {
  return new ImageResponse(iconeJSX(512), { width: 512, height: 512 })
}
