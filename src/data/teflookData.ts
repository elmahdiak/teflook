export const AGE_BRACKETS = [
  "5 - 6 ans",
  "7 - 10 ans",
  "11 - 12 ans",
  "13 - 15 ans",
] as const;

export type AgeBracket = (typeof AGE_BRACKETS)[number];

export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  itemCount: number;
  highlight: string;
  color?: string;
}

export interface WorkshopStep {
  step: string;
  title: string;
  description: string;
  artisanRole: string;
  image: string;
}

export interface ProductItem {
  id: string;
  name: string;
  nameAr?: string;
  categorySlug: string;
  categoryName: string;
  ageBracket: AgeBracket;
  priceMad: number;
  priceEur: number;
  oldPriceMad?: number;
  oldPriceEur?: number;
  discountPercentage?: number;
  brand?: string;
  description: string;
  material: string;
  origin: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  sizes: number[];
  inStock: boolean;
  isFeatured: boolean;
  badge?: string;
  features: string[];
}

export interface ReviewItem {
  id: string;
  authorName: string;
  city: string;
  rating: number;
  comment: string;
  productName: string;
  productImage: string;
  verified: boolean;
  date: string;
}

export interface DepartmentItem {
  label: string;
  slug: string;
  href: string;
  badge?: string;
  isSpecial?: boolean;
}

/* ========================================================================= */
/* THE 6 OFFICIAL EDUCATIONAL & DEVELOPMENTAL CATEGORIES                     */
/* ========================================================================= */

export const CATEGORIES: CategoryItem[] = [
  {
    id: "cat-1",
    slug: "discipline-maitrise-de-soi",
    name: "Discipline et maîtrise de soi",
    nameAr: "الانضباط والتحكم في الذات",
    subtitle: "Concentration, gestion du temps & rituels positifs",
    description:
      "Outils pédagogiques, minuteurs visuels, routines quotidiennes et jeux de patience pour développer la persévérance et le contrôle de soi.",
    imageUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop",
    itemCount: 6,
    highlight: "Essentiel",
    color: "#4C9A9C",
  },
  {
    id: "cat-2",
    slug: "intelligence-emotionnelle",
    name: "Intelligence émotionnelle",
    nameAr: "الذكاء العاطفي والتواصل",
    subtitle: "Identification des émotions, empathie & apaisement",
    description:
      "Jeux des émotions, roues des sentiments, rituels de pleine conscience et cartes de dialogue pour cultiver la sérénité et l'écoute active.",
    imageUrl:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000&auto=format&fit=crop",
    itemCount: 6,
    highlight: "Coup de Cœur",
    color: "#FE7C58",
  },
  {
    id: "cat-3",
    slug: "autonomie-competences-de-vie",
    name: "Autonomie et compétences de vie",
    nameAr: "الاستقلالية والمهارات الحياتية",
    subtitle: "Responsabilisation, organisation & vie pratique",
    description:
      "Tableaux d'organisation magnétique, kits de cuisine sécurisés et accessoires d'apprentissage pour développer l'indépendance avec fierté.",
    imageUrl:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop",
    itemCount: 6,
    highlight: "Pratique",
    color: "#4C9A9C",
  },
  {
    id: "cat-4",
    slug: "confiance-en-soi-competences-sociales",
    name: "Confiance en soi et compétences sociales",
    nameAr: "الثقة في النفس والمهارات الاجتماعية",
    subtitle: "Prise de parole, coopération & esprit d'équipe",
    description:
      "Jeux coopératifs sans perdant, cartes d'affirmations positives, défis d'éloquence et théâtre d'improvisation pour s'épanouir en société.",
    imageUrl:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1000&auto=format&fit=crop",
    itemCount: 6,
    highlight: "Recommandé",
    color: "#FE7C58",
  },
  {
    id: "cat-5",
    slug: "creativite-imagination",
    name: "Créativité et imagination",
    nameAr: "الإبداع والخيال الخصب",
    subtitle: "Expression artistique, écriture & exploration libre",
    description:
      "Boîtes d'expérimentation d'arts plastiques, chevalets d'écriture, kits de modelage écologique et dés à histoires pour libérer le génie créatif.",
    imageUrl:
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1000&auto=format&fit=crop",
    itemCount: 6,
    highlight: "Créatif",
    color: "#4C9A9C",
  },
  {
    id: "cat-6",
    slug: "esprit-critique-resolution-problemes",
    name: "Esprit critique et résolution de problèmes",
    nameAr: "التفكير النقدي وحل المشكلات",
    subtitle: "Logique, énigmes mathématiques, sciences & déduction",
    description:
      "Casse-têtes en bois certifié, kits d'enquête scientifique, jeux de stratégie et défis algorithmiques sans écran pour aiguiser l'esprit.",
    imageUrl:
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=1000&auto=format&fit=crop",
    itemCount: 6,
    highlight: "Challenge",
    color: "#FE7C58",
  },
];

/* Horizontal navigation sub-header departments mapping exclusively to the 6 categories */
export const MARKETPLACE_DEPARTMENTS: DepartmentItem[] = CATEGORIES.map(
  (cat, index) => ({
    label: cat.name,
    slug: cat.slug,
    href: `#${cat.slug}`,
    badge: index === 0 ? "POPULAIRE" : index === 1 ? "COUP DE CŒUR" : undefined,
    isSpecial: index % 2 === 1,
  })
);

/* ========================================================================= */
/* PRODUCTS DATASET: 24+ CURATED ITEMS WITH CATEGORIES & AGE BRACKETS       */
/* ========================================================================= */

export const PRODUCTS: ProductItem[] = [
  /* ------------------------------------------------------------------------- */
  /* 1. DISCIPLINE ET MAÎTRISE DE SOI                                         */
  /* ------------------------------------------------------------------------- */
  {
    id: "prod-disc-1",
    name: "Horloge Minuteur Visuel 'Focus & Rituels' Silencieux",
    categorySlug: "discipline-maitrise-de-soi",
    categoryName: "Discipline et maîtrise de soi",
    ageBracket: "5 - 6 ans",
    priceMad: 199,
    priceEur: 19.99,
    oldPriceMad: 260,
    oldPriceEur: 26.0,
    discountPercentage: 23,
    brand: "TefLook Focus",
    rating: 4.9,
    reviewsCount: 114,
    images: [
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Minuteur à disque coloré régressif qui permet à l'enfant de matérialiser le temps restant sans stress. Idéal pour structurer les devoirs, les temps d'écran et le coucher.",
    material: "Coque ABS antichoc & mécanisme à quartz silencieux",
    origin: "Conception certifiée psychopédagogie",
    sizes: [1],
    inStock: true,
    isFeatured: true,
    badge: "TOP VENTE",
    features: [
      "Disque visuel à dégradé progressif",
      "Sonnerie douce ou mode discret sans tic-tac",
      "Autonomie sur pile longue durée",
    ],
  },
  {
    id: "prod-disc-2",
    name: "Tour de Concentration & Équilibre Zen en Bois Massif",
    categorySlug: "discipline-maitrise-de-soi",
    categoryName: "Discipline et maîtrise de soi",
    ageBracket: "7 - 10 ans",
    priceMad: 249,
    priceEur: 24.99,
    oldPriceMad: 320,
    oldPriceEur: 32.0,
    discountPercentage: 22,
    brand: "TefLook Woodcraft",
    rating: 4.8,
    reviewsCount: 88,
    images: [
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Jeu de pierres et blocs polygonaux en bois naturel équilibrés manuellement pour canaliser l'agitation, apaiser l'esprit et développer la patience.",
    material: "Bois de hêtre naturel poli sans bavure",
    origin: "Fabrication artisanale soignée",
    sizes: [1],
    inStock: true,
    isFeatured: true,
    badge: "CALME & FOCUS",
    features: [
      "Développe le self-control et la motricité fine",
      "Finitions satinées non toxiques à l'huile végétale",
      "Poêle de rangement en lin naturel incluse",
    ],
  },
  {
    id: "prod-disc-3",
    name: "Organiseur Journalier 'Master Routine' et Objectifs Hebdo",
    categorySlug: "discipline-maitrise-de-soi",
    categoryName: "Discipline et maîtrise de soi",
    ageBracket: "11 - 12 ans",
    priceMad: 179,
    priceEur: 17.99,
    oldPriceMad: 230,
    oldPriceEur: 23.0,
    discountPercentage: 22,
    brand: "TefLook Focus",
    rating: 4.8,
    reviewsCount: 72,
    images: [
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Planche métallique effaçable avec jetons de réussite pour responsabiliser les pré-ados dans l'organisation autonome de leur travail scolaire et de leur hygiène de vie.",
    material: "Support métallique laqué & aimants pelliculés",
    origin: "Conçu pour collégiens",
    sizes: [1],
    inStock: true,
    isFeatured: false,
    badge: "AUTO-ORGANISATION",
    features: [
      "40 magnets d'actions et devoirs",
      "Marqueur effaçable pointe fine inclus",
      "Système de récompense par objectifs",
    ],
  },
  {
    id: "prod-disc-4",
    name: "Boîte Anti-Distraction & Coffre d'Autodiscipline Numérique",
    categorySlug: "discipline-maitrise-de-soi",
    categoryName: "Discipline et maîtrise de soi",
    ageBracket: "13 - 15 ans",
    priceMad: 299,
    priceEur: 29.99,
    oldPriceMad: 390,
    oldPriceEur: 39.0,
    discountPercentage: 23,
    brand: "TefLook Focus",
    rating: 4.7,
    reviewsCount: 65,
    images: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Coffret programmable à verrouillage temporisé pour sécuriser smartphones et tablettes pendant les révisions d'examens ou la nuit.",
    material: "Polycarbonate haute résistance sans BPA",
    origin: "Technologie de verrouillage certifiée",
    sizes: [1],
    inStock: true,
    isFeatured: true,
    badge: "RÉVISIONS ZEN",
    features: [
      "Minuteur réglable de 1 minute à 10 jours",
      "Fentes de chargeur intégrées",
      "Affichage digital du temps restant",
    ],
  },

  /* ------------------------------------------------------------------------- */
  /* 2. INTELLIGENCE ÉMOTIONNELLE                                             */
  /* ------------------------------------------------------------------------- */
  {
    id: "prod-emo-1",
    name: "La Météo des Émotions : Roue & Cartes d'Apaisement",
    categorySlug: "intelligence-emotionnelle",
    categoryName: "Intelligence émotionnelle",
    ageBracket: "5 - 6 ans",
    priceMad: 189,
    priceEur: 18.99,
    oldPriceMad: 249,
    oldPriceEur: 24.99,
    discountPercentage: 24,
    brand: "TefLook Émotions",
    rating: 4.9,
    reviewsCount: 162,
    images: [
      "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Guide visuel interactif pour aider le jeune enfant à mettre des mots sur la colère, la tristesse, la peur ou la joie débordante sans faire de crise.",
    material: "Cartes rigides douces au toucher & roue tournante en bois",
    origin: "Méthode validée par des pédopsychologues",
    sizes: [1],
    inStock: true,
    isFeatured: true,
    badge: "COUP DE CŒUR",
    features: [
      "32 cartes d'exercices de respiration",
      "Roue magnétique facile à manipuler",
      "Livret explicatif parents-enfants",
    ],
  },
  {
    id: "prod-emo-2",
    name: "Jeu de Cartes 'Les Mystères du Cœur' & Empathie Active",
    categorySlug: "intelligence-emotionnelle",
    categoryName: "Intelligence émotionnelle",
    ageBracket: "7 - 10 ans",
    priceMad: 219,
    priceEur: 21.99,
    oldPriceMad: 280,
    oldPriceEur: 28.0,
    discountPercentage: 21,
    brand: "TefLook Émotions",
    rating: 4.8,
    reviewsCount: 98,
    images: [
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "120 situations illustrées de la vie d'école et de famille pour apprendre à décoder les sentiments d'autrui et réagir avec bienveillance.",
    material: "Cartes grand format à vernis protecteur écologique",
    origin: "Édition bilingue Français / Arabe",
    sizes: [1],
    inStock: true,
    isFeatured: true,
    badge: "EMPATHIE & LIEN",
    features: [
      "Scénarios réels d'école et de cour de récréation",
      "Favorise l'écoute sans jugement",
      "Idéal en famille ou en classe",
    ],
  },
  {
    id: "prod-emo-3",
    name: "Journal Intime Guidé de Pleine Conscience & Gratitude",
    categorySlug: "intelligence-emotionnelle",
    categoryName: "Intelligence émotionnelle",
    ageBracket: "11 - 12 ans",
    priceMad: 169,
    priceEur: 16.99,
    oldPriceMad: 220,
    oldPriceEur: 22.0,
    discountPercentage: 23,
    brand: "TefLook Émotions",
    rating: 4.8,
    reviewsCount: 84,
    images: [
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Un carnet structuré de 90 jours avec prompts guidés pour décharger les tensions de la journée, célébrer ses réussites et bâtir un mental serein.",
    material: "Papier recyclé 120g reliure cousue à plat",
    origin: "Créé avec des spécialistes de l'adolescence",
    sizes: [1],
    inStock: true,
    isFeatured: false,
    badge: "BIEN-ÊTRE",
    features: [
      "Exercices quotidiens de 5 minutes",
      "Trackers d'humeur et d'énergie",
      "Citations inspirantes hebdomadaires",
    ],
  },
  {
    id: "prod-emo-4",
    name: "Coffret Maîtrise du Stress & Cartes Décodage Relationnel",
    categorySlug: "intelligence-emotionnelle",
    categoryName: "Intelligence émotionnelle",
    ageBracket: "13 - 15 ans",
    priceMad: 239,
    priceEur: 23.99,
    oldPriceMad: 310,
    oldPriceEur: 31.0,
    discountPercentage: 22,
    brand: "TefLook Émotions",
    rating: 4.9,
    reviewsCount: 76,
    images: [
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Outil psychoéducatif pour adolescents confrontés à la pression scolaire, aux relations amicales complexes et à la gestion de l'anxiété.",
    material: "Cartes plastifiées & galet sensoriel antistress en quartz poli",
    origin: "Protocoles de thérapie cognitive comportementale",
    sizes: [1],
    inStock: true,
    isFeatured: true,
    badge: "SÉRÉNITÉ ADO",
    features: [
      "Techniques de respiration 4-7-8",
      "Désamorçage des pensées automatiques négatives",
      "Galet tactile de retour au calme inclus",
    ],
  },

  /* ------------------------------------------------------------------------- */
  /* 3. AUTONOMIE ET COMPÉTENCES DE VIE                                       */
  /* ------------------------------------------------------------------------- */
  {
    id: "prod-auto-1",
    name: "Set d'Apprentissage Culinaire Sécurisé 'Petit Chef'",
    categorySlug: "autonomie-competences-de-vie",
    categoryName: "Autonomie et compétences de vie",
    ageBracket: "5 - 6 ans",
    priceMad: 229,
    priceEur: 22.99,
    oldPriceMad: 299,
    oldPriceEur: 29.99,
    discountPercentage: 23,
    brand: "TefLook Autonomie",
    rating: 4.9,
    reviewsCount: 145,
    images: [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Couteaux à dents non coupantes pour la peau, protège-doigts ergonomique et éplucheur sécurisé pour cuisiner de vrais repas en toute autonomie.",
    material: "Inox alimentaire & polymère antibactérien sans BPA",
    origin: "Conforme normes européennes de puériculture",
    sizes: [1],
    inStock: true,
    isFeatured: true,
    badge: "100% SÛR",
    features: [
      "Coupe les carottes et fruits sans couper les doigts",
      "Poignées ergonomiques pour petites mains",
      "Livret de 15 recettes illustrées pas à pas",
    ],
  },
  {
    id: "prod-auto-2",
    name: "Tableau Magnétique d'Autonomie & Responsabilités Familiales",
    categorySlug: "autonomie-competences-de-vie",
    categoryName: "Autonomie et compétences de vie",
    ageBracket: "7 - 10 ans",
    priceMad: 199,
    priceEur: 19.99,
    oldPriceMad: 250,
    oldPriceEur: 25.0,
    discountPercentage: 20,
    brand: "TefLook Autonomie",
    rating: 4.8,
    reviewsCount: 94,
    images: [
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Transforme le rangement de la chambre, la préparation du cartable et l'aide aux tâches quotidiennes en fierté personnelle valorisée.",
    material: "Plaque aimantée bois & 60 magnets illustrés",
    origin: "Conception Montessori bienveillante",
    sizes: [1],
    inStock: true,
    isFeatured: true,
    badge: "ESSENTIEL MAISON",
    features: [
      "Colonnes 'À faire' et 'Accompli avec succès'",
      "Magnets personnalisables avec feutre effaçable",
      "Évite les rappels incessants des parents",
    ],
  },
  {
    id: "prod-auto-3",
    name: "Kit d'Initiation au Bricolage Pratique & Réparations du Quotidien",
    categorySlug: "autonomie-competences-de-vie",
    categoryName: "Autonomie et compétences de vie",
    ageBracket: "11 - 12 ans",
    priceMad: 329,
    priceEur: 32.99,
    oldPriceMad: 420,
    oldPriceEur: 42.0,
    discountPercentage: 21,
    brand: "TefLook Autonomie",
    rating: 4.8,
    reviewsCount: 68,
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Véritables outils adaptés aux mains des jeunes : tournevis ergonomiques, niveau à bulle, pince et guide de réparation d'objets du quotidien.",
    material: "Acier trempé chromé & trousse de rangement zippée",
    origin: "Outils de qualité professionnelle certifiés",
    sizes: [1],
    inStock: true,
    isFeatured: false,
    badge: "SAVOIR-FAIRE",
    features: [
      "12 outils d'atelier indispensables",
      "Guide pratique des 10 réparations maison",
      "Gants de protection anti-coupure inclus",
    ],
  },
  {
    id: "prod-auto-4",
    name: "Jeu de Stratégie Budgétaire & Éducation Financière 'Capitole'",
    categorySlug: "autonomie-competences-de-vie",
    categoryName: "Autonomie et compétences de vie",
    ageBracket: "13 - 15 ans",
    priceMad: 269,
    priceEur: 26.99,
    oldPriceMad: 340,
    oldPriceEur: 34.0,
    discountPercentage: 20,
    brand: "TefLook Autonomie",
    rating: 4.9,
    reviewsCount: 82,
    images: [
      "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Jeu de simulation réaliste pour apprendre à gérer un budget mensuel, épargner, investir et faire face aux imprévus de la vraie vie.",
    material: "Plateau de jeu cartonné 2mm & billets de banque réalistes",
    origin: "Développé avec des éducateurs financiers",
    sizes: [1],
    inStock: true,
    isFeatured: true,
    badge: "AVENIR & BUDGET",
    features: [
      "Gestion d'un salaire, loyer et dépenses réelles",
      "Défis de négociation et d'investissement",
      "De 2 à 6 joueurs",
    ],
  },

  /* ------------------------------------------------------------------------- */
  /* 4. CONFIANCE EN SOI ET COMPÉTENCES SOCIALES                              */
  /* ------------------------------------------------------------------------- */
  {
    id: "prod-conf-1",
    name: "Jeu Coopératif 'La Forêt Solidaire' (Tous Gagnants)",
    categorySlug: "confiance-en-soi-competences-sociales",
    categoryName: "Confiance en soi et compétences sociales",
    ageBracket: "5 - 6 ans",
    priceMad: 219,
    priceEur: 21.99,
    oldPriceMad: 280,
    oldPriceEur: 28.0,
    discountPercentage: 21,
    brand: "TefLook Social",
    rating: 4.9,
    reviewsCount: 130,
    images: [
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Un jeu d'aventure où les enfants s'entraident pour sauver les animaux avant la nuit. Zéro compétition frustrante, 100% collaboration solidaire.",
    material: "Pions en bois d'érable et plateau illustré en grand format",
    origin: "Pédagogie non-violente",
    sizes: [1],
    inStock: true,
    isFeatured: true,
    badge: "COOPÉRATION N°1",
    features: [
      "Renforce l'esprit d'équipe dès 5 ans",
      "Règles simples comprises en 3 minutes",
      "Parties palpitantes de 20 minutes",
    ],
  },
  {
    id: "prod-conf-2",
    name: "Boîte de 100 Cartes d'Affirmation de Soi & Courage 'SuperMoi'",
    categorySlug: "confiance-en-soi-competences-sociales",
    categoryName: "Confiance en soi et compétences sociales",
    ageBracket: "7 - 10 ans",
    priceMad: 169,
    priceEur: 16.99,
    oldPriceMad: 220,
    oldPriceEur: 22.0,
    discountPercentage: 23,
    brand: "TefLook Social",
    rating: 4.8,
    reviewsCount: 105,
    images: [
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Défis doux, mantras valorisants et amorces de conversation pour chasser la timidité paralysante et prendre la parole avec fierté.",
    material: "Cartes rigides illustrées avec dorures douces",
    origin: "Créé avec des enseignants de primaire",
    sizes: [1],
    inStock: true,
    isFeatured: true,
    badge: "CONFIANCE EN SOI",
    features: [
      "Rituel d'une carte tirée chaque matin",
      "Renforce l'estime personnelle face aux moqueries",
      "Format poche à emporter partout",
    ],
  },
  {
    id: "prod-conf-3",
    name: "Théâtre d'Improvisation & Cartes de Joutes Verbales Bienveillantes",
    categorySlug: "confiance-en-soi-competences-sociales",
    categoryName: "Confiance en soi et compétences sociales",
    ageBracket: "11 - 12 ans",
    priceMad: 249,
    priceEur: 24.99,
    oldPriceMad: 320,
    oldPriceEur: 32.0,
    discountPercentage: 22,
    brand: "TefLook Social",
    rating: 4.8,
    reviewsCount: 78,
    images: [
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Jeu dynamique d'expression orale pour apprendre à argumenter avec aisance, vaincre la peur du regard des autres et écouter l'adversaire avec respect.",
    material: "150 cartes défis, sablier de parole & sonnette métallique",
    origin: "Méthode des clubs d'éloquence",
    sizes: [1],
    inStock: true,
    isFeatured: false,
    badge: "ÉLOQUENCE",
    features: [
      "Développe le charisme et la répartie positive",
      "Désamorce le trac des exposés scolaires",
      "Fous rires garantis en groupe",
    ],
  },
  {
    id: "prod-conf-4",
    name: "Jeu de Négociation & Résolution de Conflits 'Tribunal des Idées'",
    categorySlug: "confiance-en-soi-competences-sociales",
    categoryName: "Confiance en soi et compétences sociales",
    ageBracket: "13 - 15 ans",
    priceMad: 279,
    priceEur: 27.99,
    oldPriceMad: 360,
    oldPriceEur: 36.0,
    discountPercentage: 22,
    brand: "TefLook Social",
    rating: 4.9,
    reviewsCount: 89,
    images: [
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Les ados endossent les rôles de médiateurs, avocats et parties pour résoudre des dilemmes éthiques et relationnels sans agressivité.",
    material: "Cartes de cas juridiques vulgarisés & marteau de juge en bois",
    origin: "Inspiré des joutes citoyennes",
    sizes: [1],
    inStock: true,
    isFeatured: true,
    badge: "LEADERSHIP",
    features: [
      "Maîtrise de la communication non-violente",
      "Préparation aux débats et examens oraux",
      "Développe l'intelligence collective",
    ],
  },

  /* ------------------------------------------------------------------------- */
  /* 5. CRÉATIVITÉ ET IMAGINATION                                             */
  /* ------------------------------------------------------------------------- */
  {
    id: "prod-creat-1",
    name: "Mallette d'Artiste 'Grand Atelier des Couleurs Naturelles'",
    categorySlug: "creativite-imagination",
    categoryName: "Créativité et imagination",
    ageBracket: "5 - 6 ans",
    priceMad: 269,
    priceEur: 26.99,
    oldPriceMad: 350,
    oldPriceEur: 35.0,
    discountPercentage: 23,
    brand: "TefLook Créatif",
    rating: 4.9,
    reviewsCount: 154,
    images: [
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Coffret d'art complet avec peintures gouaches lavables à l'eau végétale, craies grasses extra-douces et pinceaux ergonomiques pour les jeunes artistes.",
    material: "Pigments naturels non toxiques & coffret bois de pin",
    origin: "Conforme normes EN71-3 sécurité enfant",
    sizes: [1],
    inStock: true,
    isFeatured: true,
    badge: "100% NATUREL",
    features: [
      "Ultra-lavable sur la peau et les vêtements",
      "Palette de 24 nuances éclatantes",
      "Pinceaux anti-goutte conçus pour petites mains",
    ],
  },
  {
    id: "prod-creat-2",
    name: "Dés à Histoires Infinies 'StoryCubes Fantastiques' en Bois",
    categorySlug: "creativite-imagination",
    categoryName: "Créativité et imagination",
    ageBracket: "7 - 10 ans",
    priceMad: 159,
    priceEur: 15.99,
    oldPriceMad: 210,
    oldPriceEur: 21.0,
    discountPercentage: 24,
    brand: "TefLook Créatif",
    rating: 4.8,
    reviewsCount: 92,
    images: [
      "https://images.unsplash.com/photo-1512418490979-92798cec1380?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "9 dés gravés de 54 pictogrammes féeriques. Lancez les dés et tissez des récits rocambolesques pour stimuler l'imagination et l'aisance narrative.",
    material: "Bois massif gravé au laser & boîte métallique protectrice",
    origin: "Outil recommandé par les professeurs de lettres",
    sizes: [1],
    inStock: true,
    isFeatured: true,
    badge: "IMAGINATION PURE",
    features: [
      "Plus de 10 millions de combinaisons d'histoires",
      "Aide précieuse pour la rédaction scolaire",
      "Format voyage ultra-compact",
    ],
  },
  {
    id: "prod-creat-3",
    name: "Kit d'Animation Stop-Motion & Cinéma Créatif avec Studio Mobile",
    categorySlug: "creativite-imagination",
    categoryName: "Créativité et imagination",
    ageBracket: "11 - 12 ans",
    priceMad: 349,
    priceEur: 34.95,
    oldPriceMad: 450,
    oldPriceEur: 45.0,
    discountPercentage: 22,
    brand: "TefLook Créatif",
    rating: 4.9,
    reviewsCount: 88,
    images: [
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Permet de réaliser de vrais courts-métrages d'animation image par image : support caméra stable, pâte à modeler pro et décors interchangeables.",
    material: "Trépied flexible aluminium & pâte à modeler qui ne sèche pas",
    origin: "Compatible avec smartphones et tablettes",
    sizes: [1],
    inStock: true,
    isFeatured: true,
    badge: "STUDIO CRÉATIF",
    features: [
      "Apprentissage des techniques du cinéma d'animation",
      "Éclairage LED orientable inclus",
      "Guide des effets spéciaux faciles",
    ],
  },
  {
    id: "prod-creat-4",
    name: "Carnet de Design Graphique & Calligraphie Artistique Deluxe",
    categorySlug: "creativite-imagination",
    categoryName: "Créativité et imagination",
    ageBracket: "13 - 15 ans",
    priceMad: 229,
    priceEur: 22.99,
    oldPriceMad: 299,
    oldPriceEur: 29.99,
    discountPercentage: 23,
    brand: "TefLook Créatif",
    rating: 4.8,
    reviewsCount: 67,
    images: [
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Feutres pinceaux double pointe, plumes d'écriture, encres végétales et papier grain fin pour s'initier au lettering moderne et au graphisme.",
    material: "Encres à base d'eau sans odeur & papier Beaux-Arts 180g",
    origin: "Qualité artistique supérieure",
    sizes: [1],
    inStock: true,
    isFeatured: false,
    badge: "DESIGN & ART",
    features: [
      "18 feutres aquarellables à double embout",
      "Guides de lettrage et de composition visuelle",
      "Pochette de transport élégante en toile",
    ],
  },

  /* ------------------------------------------------------------------------- */
  /* 6. ESPRIT CRITIQUE ET RÉSOLUTION DE PROBLÈMES                             */
  /* ------------------------------------------------------------------------- */
  {
    id: "prod-crit-1",
    name: "Casse-Tête Labyrinthe Gravitationnel en Bois Écologique",
    categorySlug: "esprit-critique-resolution-problemes",
    categoryName: "Esprit critique et résolution de problèmes",
    ageBracket: "5 - 6 ans",
    priceMad: 189,
    priceEur: 18.99,
    oldPriceMad: 240,
    oldPriceEur: 24.0,
    discountPercentage: 21,
    brand: "TefLook Logique",
    rating: 4.8,
    reviewsCount: 110,
    images: [
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Guidez la bille à travers des parcours modulables en anticipant la trajectoire. Stimule la logique spatiale et la capacité d'essai-erreur sans découragement.",
    material: "Bois de hêtre naturel & bille en acier poli sécurisée",
    origin: "Fabrication robuste sans plastique",
    sizes: [1],
    inStock: true,
    isFeatured: true,
    badge: "LOGIQUE SPATIALE",
    features: [
      "30 cartes de défis à difficulté croissante",
      "Développe la persévérance face à l'obstacle",
      "Bords arrondis 100% sécurisés",
    ],
  },
  {
    id: "prod-crit-2",
    name: "Escape Game à la Maison 'Le Secret des Pyramides' (Énigmes)",
    categorySlug: "esprit-critique-resolution-problemes",
    categoryName: "Esprit critique et résolution de problèmes",
    ageBracket: "7 - 10 ans",
    priceMad: 219,
    priceEur: 21.99,
    oldPriceMad: 280,
    oldPriceEur: 28.0,
    discountPercentage: 21,
    brand: "TefLook Logique",
    rating: 4.9,
    reviewsCount: 138,
    images: [
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Transformez votre salon en véritable salle d'évasion : codes secrets à déchiffrer, filtres optiques, cadenas cryptés et déductions logiques coopératives.",
    material: "Indices imprimés sur parchemin, loupe & miroir décodeur",
    origin: "Conçu par des créateurs d'escape games",
    sizes: [1],
    inStock: true,
    isFeatured: true,
    badge: "BEST-SELLER ÉNIGMES",
    features: [
      "60 minutes d'immersion totale en famille",
      "Indices progressifs si blocage",
      "Bande sonore d'ambiance immersive à télécharger",
    ],
  },
  {
    id: "prod-crit-3",
    name: "Jeu de Stratégie Déductive & Échecs Évolutifs 'Stratégos'",
    categorySlug: "esprit-critique-resolution-problemes",
    categoryName: "Esprit critique et résolution de problèmes",
    ageBracket: "11 - 12 ans",
    priceMad: 289,
    priceEur: 28.99,
    oldPriceMad: 370,
    oldPriceEur: 37.0,
    discountPercentage: 22,
    brand: "TefLook Logique",
    rating: 4.9,
    reviewsCount: 95,
    images: [
      "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Plateau d'échecs magnétique en bois avec cartes de missions tactiques pour apprendre à prévoir 3 coups d'avance et adapter sa stratégie en temps réel.",
    material: "Bois de noyer et érable massif sculpté avec finition feutrine",
    origin: "Homologué compétitions jeunes",
    sizes: [1],
    inStock: true,
    isFeatured: true,
    badge: "TACTIQUE & CERVEAU",
    features: [
      "Pièces plombées grand confort de jeu",
      "Guide tactique des ouvertures classiques",
      "Coffret pliable avec rangement individuel",
    ],
  },
  {
    id: "prod-crit-4",
    name: "Laboratoire d'Enquête Scientifique & Détection de Fausses Nouvelles",
    categorySlug: "esprit-critique-resolution-problemes",
    categoryName: "Esprit critique et résolution de problèmes",
    ageBracket: "13 - 15 ans",
    priceMad: 339,
    priceEur: 33.99,
    oldPriceMad: 440,
    oldPriceEur: 44.0,
    discountPercentage: 23,
    brand: "TefLook Logique",
    rating: 4.9,
    reviewsCount: 81,
    images: [
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1000&auto=format&fit=crop",
    ],
    description:
      "Jeu d'investigation moderne où l'adolescent analyse des sources, croise des données scientifiques et débusque les pièges cognitifs et biais médiatiques.",
    material: "Dossiers d'enquête réalistes, réactifs chimiques sûrs & loupe",
    origin: "Développé avec des chercheurs en sciences cognitives",
    sizes: [1],
    inStock: true,
    isFeatured: true,
    badge: "ESPRIT SCIENTIFIQUE",
    features: [
      "Apprentissage de la méthode scientifique rigoureuse",
      "Développe le discernement face aux réseaux sociaux",
      "5 grandes affaires d'enquête passionnantes",
    ],
  },
];

export const ALL_PRODUCTS = PRODUCTS;

/* ========================================================================= */
/* CLIENT REVIEWS TESTIMONIALS (FOCUSED ON EDUCATIONAL & PARENTING BENEFITS) */
/* ========================================================================= */

export const REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    authorName: "Salma Bencherif",
    city: "Casablanca, Maroc",
    rating: 5,
    comment:
      "Le minuteur visuel de concentration a radicalement changé l'heure des devoirs pour mon fils de 8 ans. Fini les disputes et la procrastination ! Livraison très rapide à Casa.",
    productName: "Horloge Minuteur Visuel 'Focus & Rituels'",
    productImage:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=200&auto=format&fit=crop",
    verified: true,
    date: "Il y a 3 jours",
  },
  {
    id: "rev-2",
    authorName: "Karim Alami",
    city: "Rabat, Maroc",
    rating: 5,
    comment:
      "Le jeu des Mystères du Cœur a permis à nos deux filles d'apprendre à exprimer leurs colères calmement au lieu de crier. Un outil indispensable pour tous les parents !",
    productName: "Jeu de Cartes 'Les Mystères du Cœur'",
    productImage:
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=200&auto=format&fit=crop",
    verified: true,
    date: "Il y a 1 semaine",
  },
  {
    id: "rev-3",
    authorName: "Nadia Tazi",
    city: "Fès, Maroc",
    rating: 5,
    comment:
      "Le set de cuisine autonome Petit Chef est d'une sécurité exemplaire. Ma fille de 6 ans prépare désormais ses salades elle-même avec une fierté immense. Merci TefLook !",
    productName: "Set d'Apprentissage Culinaire 'Petit Chef'",
    productImage:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=200&auto=format&fit=crop",
    verified: true,
    date: "Il y a 2 semaines",
  },
  {
    id: "rev-4",
    authorName: "Mehdi Mansouri",
    city: "Marrakech, Maroc",
    rating: 5,
    comment:
      "L'Escape Game à la maison a captivé toute la famille pendant plus d'une heure. Les énigmes demandent une vraie logique et renforcent l'esprit d'équipe. 10/10 !",
    productName: "Escape Game 'Le Secret des Pyramides'",
    productImage:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=200&auto=format&fit=crop",
    verified: true,
    date: "Il y a 3 semaines",
  },
];

export const WORKSHOP_STEPS: WorkshopStep[] = [
  {
    step: "01",
    title: "Le Tri & la Sélection des Bois",
    description: "Sélection de bois certifié FSC (hêtre, érable) poncé avec soin sans échardes.",
    artisanRole: "Maâlem Driss — Maître Ébéniste",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop",
  },
  {
    step: "02",
    title: "La Découpe & le Polissage",
    description: "Finitions manuelles avec angles adoucis pour une manipulation 100% sécurisée dès 5 ans.",
    artisanRole: "Atelier Menuiserie Fine",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=1000&auto=format&fit=crop",
  },
  {
    step: "03",
    title: "Teintures Végétales & Finitions",
    description: "Pigments écologiques à l'eau et huiles végétales pures respectueuses de la santé des enfants.",
    artisanRole: "Lalla Fatima — Finitions Pédagogiques",
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1000&auto=format&fit=crop",
  },
  {
    step: "04",
    title: "Validation Pédagogique & Contrôle Qualité",
    description: "Chaque coffret est rigoureusement testé selon les normes européennes de sécurité enfant (EN71).",
    artisanRole: "Contrôle Qualité & Certification TefLook",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop",
  },
];
