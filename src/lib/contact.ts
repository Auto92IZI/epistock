export function chiffresTelephone(tel: string) {
  let t = tel.replace(/[\s.\-()]/g, "")
  if (t.startsWith("+")) t = t.slice(1)
  else if (t.startsWith("00")) t = t.slice(2)
  else if (t.startsWith("0")) t = "33" + t.slice(1)
  else if (/^[67]\d{8}$/.test(t)) t = "33" + t
  return t
}

export function ouvrirLien(url: string, nouvelOnglet: boolean) {
  const lien = document.createElement("a")
  lien.href = url
  if (nouvelOnglet) {
    lien.target = "_blank"
    lien.rel = "noopener noreferrer"
  }
  document.body.appendChild(lien)
  lien.click()
  document.body.removeChild(lien)
}
