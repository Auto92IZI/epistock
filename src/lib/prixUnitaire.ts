const FACTEURS: Record<string, number> = { ml: 0.001, cl: 0.01, l: 1, g: 0.001, kg: 1 }

export function prixAuLitreOuKilo(format: string, prix: number): string | null {
  const f = format.toLowerCase().replace(",", ".")
  const multi = f.match(/(\d+)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(ml|cl|l|g|kg)\b/)
  const simple = f.match(/(\d+(?:\.\d+)?)\s*(ml|cl|l|g|kg)\b/)

  let nombre = 1
  let taille = 0
  let unite = ""

  if (multi) {
    nombre = parseInt(multi[1], 10)
    taille = parseFloat(multi[2])
    unite = multi[3]
  } else if (simple) {
    const lot = f.match(/lot de\s*(\d+)/)
    nombre = lot ? parseInt(lot[1], 10) : 1
    taille = parseFloat(simple[1])
    unite = simple[2]
  } else {
    return null
  }

  const quantite = nombre * taille * FACTEURS[unite]
  if (!(quantite > 0) || !(prix > 0)) return null

  const suffixe = unite === "g" || unite === "kg" ? "kg" : "L"
  return `${(prix / quantite).toFixed(2).replace(".", ",")} € / ${suffixe}`
}
