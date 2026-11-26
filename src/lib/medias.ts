import fs from "node:fs"
import path from "node:path"

export function slugMedia(nom: string) {
  return nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Retrouve la vidéo d'une scène à partir du nom de sa photo :
// /images/Fut%20Porto.jpg -> public/videos/fut-porto.mp4 (et fut-porto-portrait.mp4 pour les téléphones)
export function videosDe(urlImage?: string): { video?: string; videoPortrait?: string } {
  if (!urlImage) return {}

  const fichier = decodeURIComponent(urlImage.split("/").pop() || "")
  const slug = slugMedia(fichier.replace(/\.[^.]+$/, ""))
  if (!slug) return {}

  const dossier = path.join(process.cwd(), "public", "videos")
  const existe = (nom: string) => {
    try {
      return fs.existsSync(path.join(dossier, nom))
    } catch {
      return false
    }
  }

  const res: { video?: string; videoPortrait?: string } = {}
  if (existe(`${slug}.mp4`)) res.video = `/videos/${slug}.mp4`
  if (existe(`${slug}-portrait.mp4`)) res.videoPortrait = `/videos/${slug}-portrait.mp4`
  return res
}
