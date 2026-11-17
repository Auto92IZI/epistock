export type Ligne = { id: number; nom: string; format: string; prix: number; quantite: number }
const K = "panier"

export function lirePanier(): Ligne[] {
  try { return JSON.parse(localStorage.getItem(K) || "[]") } catch { return [] }
}
export function ecrirePanier(p: Ligne[]) {
  localStorage.setItem(K, JSON.stringify(p))
  window.dispatchEvent(new Event("panier"))
}
export function ajouter(l: Ligne) {
  const p = lirePanier()
  const e = p.find((x) => x.id === l.id)
  if (e) e.quantite += l.quantite
  else p.push(l)
  ecrirePanier(p)
}
