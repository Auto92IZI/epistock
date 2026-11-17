export const SITE = {
  nom: "Alma Lusa",
  accroche: "Huile d'olive, miel, porto et eau-de-vie de petits producteurs du nord du Portugal. Bio, artisanaux, fidèles aux recettes ancestrales.",
}

export type Chapitre = { label: string; titre: string; texte: string; image?: string }
export type Univers = {
  nom: string; mot: string; titre: string; accroche: string; intro: string
  couleur: string; accent: string; fond: string; hero: string; chapitres: Chapitre[]
}

const img = (f: string) => `/images/${f}`

export const UNIVERS: Record<string, Univers> = {
  "huile-d-olive": {
    nom: "Huile d'olive", mot: "Azeite", titre: "Huile d'olive extra vierge",
    accroche: "Cueillie à la main, pressée à froid",
    intro: "Dans le nord du Portugal, l'olivier fait partie du paysage depuis des générations. Ici, ce sont de petits producteurs qui connaissent leurs arbres un à un, et qui perpétuent les gestes de leurs aînés.",
    couleur: "#4F5D2A", accent: "#C9A227", fond: "#F4F2E6", hero: img("huile-d-olive.jpg"),
    chapitres: [
      { label: "La récolte", titre: "Cueillie à la main", image: img("huile-d-olive1.jpg"),
        texte: "À l'automne, les olives sont cueillies à la main pour ne pas abîmer le fruit. Un geste lent, hérité des anciens, qui préserve la qualité de ce qui deviendra l'huile." },
      { label: "Le moulin", titre: "Un pressage artisanal", image: img("huile-d-olive2.jpg"),
        texte: "Les olives sont ensuite portées au moulin, puis pressées à froid par des procédés uniquement mécaniques, sans raffinage. On obtient une huile extra vierge qui garde les arômes du fruit." },
      { label: "À table", titre: "Pourquoi l'extra vierge ?", image: img("huile-d-olive3.jpg"),
        texte: "Une huile vierge extra est obtenue sans traitement chimique, ce qui la distingue des huiles raffinées. Elle conserve les arômes et les composés naturels de l'olive, et elle est riche en acide oléique, un acide gras mono-insaturé. En bouche : fruitée, parfois herbacée, avec une pointe d'amertume et de piquant, signe de fraîcheur. À cru sur une salade, un poisson grillé, une soupe ou simplement du pain, elle fait toute la différence." },
    ],
  },
  "miel": {
    nom: "Miel", mot: "Mel", titre: "Miel artisanal", accroche: "Le goût des fleurs et du terroir",
    intro: "Dans le nord du Portugal, les abeilles butinent les fleurs des collines et des vallées. Chaque miel garde l'empreinte de ces fleurs, de la saison et du lieu où sont posées les ruches.",
    couleur: "#B7791F", accent: "#E0A526", fond: "#FBF3DC", hero: img("miel.jpg"),
    chapitres: [
      { label: "L'apiculteur", titre: "Veiller sur les ruches", image: img("miel2.jpg"),
        texte: "Derrière chaque pot, il y a un apiculteur qui veille sur ses ruches toute l'année. Il récolte les rayons avec patience, en petites quantités." },
      { label: "Du rayon au pot", titre: "Un miel qui garde son caractère", image: img("miel1.jpg"),
        texte: "Le miel est extrait du rayon puis mis en pot, sans en changer le caractère. Texture, couleur et parfum varient d'une récolte à l'autre : c'est la marque d'un produit authentique. Sur du pain, dans un yaourt, avec un fromage ou dans une infusion." },
    ],
  },
  "porto": {
    nom: "Porto", mot: "Vinho do Porto", titre: "Porto rouge et blanc", accroche: "Né dans la vallée du Douro",
    intro: "Le porto vient de la vallée du Douro, dans le nord du Portugal, l'une des plus anciennes régions viticoles délimitées au monde. Ses vignes en terrasses, plantées sur des coteaux de schiste, dessinent un paysage unique.",
    couleur: "#6E1B38", accent: "#C0506A", fond: "#F8ECEE", hero: img("porto1.jpg"),
    chapitres: [
      { label: "Le savoir-faire", titre: "Rouge ou blanc", image: img("porto.jpg"),
        texte: "Le porto naît d'une eau-de-vie de raisin ajoutée en cours de fermentation : celle-ci s'arrête et une partie des sucres naturels du raisin est préservée. Le rouge est riche et fruité, parfait avec un dessert au chocolat ou un fromage bleu. Le blanc, plus frais, se sert bien froid, seul ou allongé de tonic en apéritif." },
    ],
  },
  "eau-de-vie": {
    nom: "Eau-de-vie", mot: "Aguardente", titre: "Eau-de-vie", accroche: "Distillée avec patience",
    intro: "En portugais, on l'appelle aguardente, littéralement « eau ardente ». La distillation est une tradition rurale ancienne, où le temps et le savoir-faire comptent plus que la vitesse.",
    couleur: "#8A4B1F", accent: "#D08A3C", fond: "#F7EDE0", hero: img("eau-de-vie.jpg"),
    chapitres: [
      { label: "À déguster", titre: "Une dégustation lente", image: img("eau-de-vie1.jpg"),
        texte: "Distillée à partir de vin ou de marc de raisin, l'eau-de-vie se déguste en petite quantité, à température ambiante, en digestif, dans un verre qui concentre les arômes." },
    ],
  },
}
