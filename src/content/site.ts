import { SITE } from "./marque"
export { SITE }

export type Point = { titre: string; texte: string; image?: string }
export type Chapitre = { label: string; titre: string; texte: string; image?: string; points?: Point[]; note?: string }

// Une famille = un type de produit (huile, miel, pollen, porto…).
// Sa clé est celle de la colonne « univers » de la table Produits.
export type Famille = {
  nom: string
  mot: string
  titre: string
  intro?: string
  commander: string
  couleur?: string
  accent?: string
  chapitres: Chapitre[]
}

// Un univers regroupe plusieurs familles sur une même page.
export type Univers = {
  nom: string
  mot: string
  accroche: string
  intro: string
  couleur: string
  accent: string
  fond: string
  hero: string
  familles: Record<string, Famille>
}

const img = (f: string) => `/images/${encodeURIComponent(f)}`

export const UNIVERS: Record<string, Univers> = {
  olivier: {
    nom: "L'Olivier", mot: "Oliveira",
    accroche: "Cueillie à la main, pressée à froid",
    intro: "Dans le nord du Portugal, l'olivier fait partie du paysage depuis des générations. Ici, ce sont de petits producteurs qui connaissent leurs arbres un à un, et qui perpétuent les gestes de leurs aînés.",
    couleur: "#4F5D2A", accent: "#C9A227", fond: "#F4F2E6", hero: img("huile-d-olive.jpg"),
    familles: {
      "huile-d-olive": {
        nom: "Huile d'olive", mot: "Azeite", titre: "Huile d'olive extra vierge", commander: "Commander nos huiles",
        chapitres: [
          { label: "La récolte", titre: "Cueillie à la main", image: img("huile-d-olive1.jpg"),
            texte: "À l'automne, les olives sont cueillies à la main pour ne pas abîmer le fruit. Un geste lent, hérité des anciens, qui préserve la qualité de ce qui deviendra l'huile." },
          { label: "Le moulin", titre: "Un pressage artisanal", image: img("huile-d-olive2.jpg"),
            texte: "Les olives sont ensuite portées au moulin, puis pressées à froid par des procédés uniquement mécaniques, sans raffinage. On obtient une huile extra vierge qui garde les arômes du fruit." },
          { label: "À table", titre: "Pourquoi l'extra vierge ?", image: img("huile-d-olive3.jpg"),
            texte: "Une huile vierge extra est obtenue sans traitement chimique, ce qui la distingue des huiles raffinées. Elle conserve les arômes et les composés naturels de l'olive, et elle est riche en acide oléique, un acide gras mono-insaturé. En bouche : fruitée, parfois herbacée, avec une pointe d'amertume et de piquant, signe de fraîcheur. À cru sur une salade, un poisson grillé, une soupe ou simplement du pain, elle fait toute la différence." },
        ],
      },
    },
  },

  ruche: {
    nom: "La Ruche", mot: "Colmeia",
    accroche: "Miel et pollen, le goût des fleurs du Portugal",
    intro: "Au Portugal, les abeilles butinent des paysages très différents, et chaque produit de la ruche en garde l'empreinte : du miel de montagne de Chaves au miel clair de l'Alentejo, jusqu'au pollen récolté sur les fleurs.",
    couleur: "#B7791F", accent: "#E0A526", fond: "#FBF3DC", hero: img("miel.jpg"),
    familles: {
      miel: {
        nom: "Miel", mot: "Mel", titre: "Miel artisanal", commander: "Commander nos miels",
        intro: "Nos deux miels artisanaux racontent chacun une région : les montagnes sauvages de Chaves, au nord, et la région ensoleillée de l'Alentejo, au sud.",
        chapitres: [
          { label: "L'apiculteur", titre: "Veiller sur les ruches", image: img("miel2.jpg"),
            texte: "Derrière chaque pot, il y a un apiculteur qui veille sur ses ruches toute l'année. Il récolte les rayons avec patience, en petites quantités." },
          { label: "Du rayon au pot", titre: "Un miel qui garde son caractère", image: img("miel1.jpg"),
            texte: "Le miel est extrait du rayon puis mis en pot, sans en changer le caractère. Sa couleur, son parfum et sa texture varient d'une récolte à l'autre, selon les fleurs butinées : c'est la marque d'un produit authentique." },
          { label: "Le miel foncé", titre: "Les montagnes de Chaves", image: img("montagnechaves.jpg"),
            texte: "Dans les montagnes de Chaves, au nord du Portugal, les abeilles butinent le nectar de fleurs sauvages variées. C'est un miel multifloral : il ne vient pas d'une seule fleur, mais de toute la diversité d'une nature préservée, qui change d'une saison à l'autre.\n\nRécolté avec soin, il reflète la richesse de ce paysage de montagne et le savoir-faire traditionnel des producteurs locaux." },
          { label: "Le miel foncé", titre: "Miel multifloral de Chaves", image: img("Mielfoncé.jpg"),
            texte: "Un miel de caractère, à la couleur presque sombre, qui se reconnaît au premier coup d'œil.",
            points: [
              { titre: "Couleur", texte: "Brun très foncé." },
              { titre: "Goût", texte: "Naturellement doux, avec des notes florales et boisées." },
              { titre: "Texture", texte: "Naturellement onctueuse, avec une cristallisation possible." },
            ] },
          { label: "Le miel clair", titre: "Le soleil de l'Alentejo", image: img("Alentejo.jpg"),
            texte: "L'Alentejo, au sud du Portugal, est une vaste région ensoleillée. C'est de là que vient notre miel clair : un miel multifloral artisanal, issu du nectar de fleurs variées.\n\nSa particularité : sa couleur claire et lumineuse, qui lui donne un aspect délicat et gourmand." },
          { label: "Le miel clair", titre: "Miel multifloral de l'Alentejo", image: img("MielClair.jpg"),
            texte: "Un miel lumineux, tout en finesse.",
            points: [
              { titre: "Couleur", texte: "Jaune clair à doré." },
              { titre: "Goût", texte: "Doux et délicat, avec des notes florales." },
              { titre: "Texture", texte: "Fluide et onctueuse, pouvant cristalliser naturellement." },
            ] },
          { label: "Bon à savoir", titre: "Cristallisation, conservation, dégustation",
            texte: "Un miel authentique évolue avec le temps. Quelques repères pour en profiter pleinement.",
            points: [
              { titre: "Il a cristallisé ? C'est normal", texte: "Avec le temps, un miel peut s'épaissir, voire cristalliser : c'est un phénomène naturel qui n'altère pas sa qualité. Pour lui redonner de la fluidité, plongez le pot fermé dans un bain-marie tiède, sans dépasser environ 40 °C, afin de préserver ses arômes." },
              { titre: "Conservation", texte: "À température ambiante, à l'abri de la lumière et de l'humidité, le pot bien fermé. Le réfrigérateur accélère la cristallisation." },
              { titre: "À table", texte: "Le miel foncé de Chaves, de caractère, se marie avec les fromages affirmés, le pain de campagne ou une infusion. Le miel clair de l'Alentejo, plus délicat, est parfait avec un yaourt, des tartines ou un thé." },
            ],
            note: "Le miel ne convient pas aux enfants de moins d'un an." },
        ],
      },

      pollen: {
        nom: "Pollen", mot: "Pólen", titre: "Pollen comestible", commander: "Commander notre pollen",
        intro: "Après le miel, l'autre trésor de la ruche : le pollen, récolté par les abeilles sur les fleurs.",
        chapitres: [
          { label: "L'origine", titre: "Récolté par les abeilles", image: img("pollen.jpg"),
            texte: "Pour nourrir la ruche, les abeilles butinent le pollen des fleurs et le rapportent en petites pelotes sur leurs pattes. À l'entrée de la ruche, l'apiculteur peut en prélever une partie grâce à un dispositif prévu à cet effet, avant de le conditionner.\n\nChaque grain a la couleur des fleurs butinées : jaune, orangé, brun… Un pot de pollen est donc, lui aussi, le reflet d'un paysage et d'une saison." },
          { label: "À déguster", titre: "Comment le consommer",
            texte: "Le pollen comestible a une saveur florale, légèrement sucrée, parfois un peu amère selon les fleurs. On le croque tel quel ou on le parsème sur ses plats pour le parfum et le croquant.",
            points: [
              { titre: "Au petit-déjeuner", texte: "Une cuillère à café sur un yaourt, un fromage blanc ou des céréales." },
              { titre: "En salade", texte: "Parsemé sur une salade de fruits ou une salade de chèvre chaud." },
              { titre: "En smoothie", texte: "Mixé avec des fruits, ou simplement saupoudré sur le dessus." },
              { titre: "Conservation", texte: "En pot bien fermé, au sec et à l'abri de la lumière. Au réfrigérateur ou au congélateur, il se conserve plus longtemps." },
            ],
            note: "Déconseillé aux personnes allergiques aux pollens ou aux produits de la ruche, et aux jeunes enfants. En cas de doute, demandez conseil à un professionnel de santé." },
        ],
      },
    },
  },

  spiritueux: {
    nom: "Vins & spiritueux", mot: "Adega",
    accroche: "Porto et eau-de-vie, à déguster avec patience",
    intro: "Le Douro donne le porto, l'alambic donne l'aguardente : deux traditions portugaises où le temps compte plus que la vitesse. À déguster lentement, en petite quantité, et avec modération.",
    couleur: "#6E1B38", accent: "#D08A3C", fond: "#F8EFEA", hero: img("porto.jpg"),
    familles: {
      porto: {
        nom: "Porto", mot: "Vinho do Porto", titre: "Porto rouge et blanc", commander: "Commander nos portos",
        couleur: "#6E1B38", accent: "#C0506A",
        intro: "Le porto vient de la vallée du Douro, dans le nord du Portugal, l'une des plus anciennes régions viticoles délimitées au monde. Ses vignes en terrasses, plantées sur des coteaux de schiste, dessinent un paysage unique.",
        chapitres: [
          { label: "L'origine", titre: "La vallée du Douro", image: img("porto1.jpg"),
            texte: "Le Douro est l'une des plus anciennes régions viticoles au monde à avoir été officiellement délimitées, dès le XVIIIe siècle. Pour cultiver la vigne sur ces coteaux escarpés, les hommes ont construit, génération après génération, des terrasses de schiste soutenues par des murets de pierre.\n\nLes étés y sont chauds et secs, les hivers froids : la vigne y pousse lentement et donne de petits raisins très concentrés. Le vin tire son nom de la ville de Porto, d'où il était autrefois expédié vers le reste de l'Europe." },
          { label: "La vendange", titre: "De la vigne à la cuve", image: img("Vin Porto.jpg"),
            texte: "Les vendanges ont lieu à la fin de l'été, et sur ces pentes elles se font encore souvent à la main. Traditionnellement, les raisins sont foulés au pied dans de grands bassins de pierre appelés lagares, un geste que certains producteurs perpétuent encore aujourd'hui. La fermentation démarre alors, transformant peu à peu le sucre en alcool.\n\nAu bout de quelques jours, alors que le vin est encore très sucré, on y ajoute de l'eau-de-vie de raisin. L'alcool arrête la fermentation : les sucres naturels du raisin sont préservés et le vin atteint environ 20 % d'alcool. Cette étape, appelée le mutage, fait du porto un vin à part." },
          { label: "Le vieillissement", titre: "Le temps passé en fût", image: img("Fut Porto.jpg"),
            texte: "Après l'hiver, le vin quitte la vallée pour vieillir en fût de chêne, historiquement dans les caves de Vila Nova de Gaia, face à la ville de Porto. Le bois respire : au fil des mois et des années, le vin s'oxyde lentement, une petite partie s'évapore, et ses arômes se transforment. Le maître d'assemblage compose ensuite le vin final en mélangeant des fûts d'âges différents, pour obtenir un style régulier.\n\nSelon la durée en fût, le caractère change. Un porto rouge peu vieilli reste fruité et d'un rouge profond, avec des arômes de fruits rouges et noirs. Un porto élevé longtemps prend une teinte plus ambrée et des notes de fruits secs, de noix, de caramel et d'épices. Le temps passé en fût peut aller de quelques années à plusieurs décennies." },
          { label: "À déguster", titre: "Rouge ou blanc : comment le servir",
            texte: "Le porto est un vin fortifié : on le sert en petite quantité, dans un verre à pied qui concentre les arômes.",
            points: [
              { titre: "Le porto rouge", image: img("PortoRouge.jpg"), texte: "Servi légèrement frais, entre 12 et 16 °C selon le style. Il accompagne le chocolat noir, les fromages à pâte persillée, les fruits secs et les noix, ou se déguste simplement seul en fin de repas." },
              { titre: "Le porto blanc", image: img("PortoBlanc.jpg"), texte: "Servi très frais, autour de 6 à 8 °C. Excellent à l'apéritif avec des amandes ou des olives, ou en « porto tonic » : porto blanc, tonic, glaçons et un zeste de citron ou une feuille de menthe." },
            ] },
        ],
      },

      "eau-de-vie": {
        nom: "Eau-de-vie", mot: "Aguardente", titre: "Eau-de-vie", commander: "Commander notre eau-de-vie",
        couleur: "#8A4B1F", accent: "#D08A3C",
        intro: "En portugais, on l'appelle aguardente, littéralement « eau ardente ». La distillation est une tradition rurale ancienne, où le temps et le savoir-faire comptent plus que la vitesse.",
        chapitres: [
          { label: "L'origine", titre: "Aguardente : l'eau ardente", image: img("eau-de-vie2.jpg"),
            texte: "Dans le nord du Portugal, la distillation fait partie de la vie rurale depuis longtemps. Une fois les vendanges et la vinification terminées, rien ne se perd : l'eau-de-vie peut être tirée du vin, ou du marc, c'est-à-dire des peaux, des pépins et des rafles de raisin qui restent après le pressage du jus. L'eau-de-vie de marc se dit bagaceira, une spécialité typique du Portugal." },
          { label: "La distillation", titre: "L'art de l'alambic", image: img("eau-de-vie.jpg"),
            texte: `La matière fermentée est chauffée dans un alambic, traditionnellement en cuivre. Les vapeurs d'alcool montent, se refroidissent dans un serpentin et retombent en gouttes d'un liquide limpide.

Le distillateur doit alors faire un choix précis : il écarte les premières gouttes (les têtes) et les dernières (les queues), et ne conserve que le cœur de la distillation, le plus pur et le plus aromatique. Ce geste, qui demande de l'expérience, fait toute la différence entre une eau-de-vie fine et une eau-de-vie brutale.

Après la distillation, l'eau-de-vie se repose. Elle peut rester claire, ou vieillir en fût de bois, où elle prend une teinte dorée et gagne en rondeur.` },
          { label: "En cuisine", titre: "Quelques idées de recettes",
            texte: "L'eau-de-vie ne sert pas qu'à la dégustation : en cuisine, elle relève les plats et apporte du parfum à la cuisson, surtout lorsqu'on la flambe.",
            points: [
              { titre: "Chorizo flambé", image: img("Chorizo.jpg"), texte: "Une grande classique portugaise. Coupez un chorizo en deux dans la longueur et posez-le dans un plat résistant à la chaleur (traditionnellement en terre cuite). Arrosez de 2 à 3 cuillères à soupe d'eau-de-vie, flambez, laissez les flammes s'éteindre, puis servez chaud avec du pain." },
              { titre: "Fruits à l'eau-de-vie", image: img("fruit eau de vie.jpg"), texte: "Laissez macérer des cerises, des raisins ou des figues dans un bocal avec un peu de sucre et d'eau-de-vie, pendant au moins quelques semaines. À servir en dessert, avec une glace ou un fromage frais." },
              { titre: "Gambas à l'ail flambées", texte: "Faites revenir des crevettes dans de l'huile d'olive avec de l'ail. Ajoutez un petit verre d'eau-de-vie, flambez, puis terminez avec du persil et un filet de citron." },
              { titre: "Sauce déglacée", texte: "Après avoir saisi un filet de porc ou une volaille, déglacez la poêle avec un trait d'eau-de-vie, flambez, puis ajoutez de la crème ou le jus de cuisson pour obtenir une sauce courte et parfumée." },
            ],
            note: "Pour flamber en sécurité : travaillez loin de tout objet inflammable, retirez la poêle du feu avant d'ajouter l'alcool, ne versez jamais directement depuis la bouteille sur la flamme et gardez un couvercle à portée de main pour étouffer le feu." },
          { label: "À déguster", titre: "Un digestif à la portugaise",
            texte: "On la sert en petite quantité, à température ambiante, après le repas, dans un petit verre à pied ou un verre tulipe qui concentre les arômes. Au Portugal, on en verse aussi un trait dans un café, une habitude appelée « café com cheirinho ». À déguster avec modération." },
        ],
      },
    },
  },
}

// Retrouve l'univers d'une famille (sert aux anciennes adresses, ex. /univers/miel)
export function universDeFamille(slugFamille: string): string | null {
  for (const [slugUnivers, u] of Object.entries(UNIVERS)) {
    if (slugFamille in u.familles) return slugUnivers
  }
  return null
}
