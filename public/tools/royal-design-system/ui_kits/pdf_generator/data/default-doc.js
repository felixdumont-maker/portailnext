/* global */
// Default content seeded from the original plan d'affaires
window.DEFAULT_DOC = {
  meta: {
    year: '2025',
    docType: 'Plan d\'affaires',
    title: "PROFIL DE\nL'ENTREPRISE",
    titleFont: '',
    subtitle: '',
    tagline: 'accessibilité. créativité. simplicité.',
    author: 'Félix Dumont',
    date: '09.07.2025',
    coverLogo: '',
    artStyle: 'angular',
    coverBg: '',
  },
  dividers: [
    { title: 'Sommaire du projet',    accent: 'Sommaire',     subtitle: 'une agence créative pas comme les autres', titleFont: '' },
    { title: 'Concept et services',   accent: 'services',     subtitle: 'Comme au resto, à la carte.',             titleFont: '' },
    { title: 'Analyse de marché',     accent: 'marché',       subtitle: "L'industrie & les PME",                   titleFont: '' },
    { title: 'Projections financières', accent: 'Projections', subtitle: 'Notre vision sur 3 ans',                 titleFont: '' },
  ],
  toc: [
    { label: 'Sommaire du projet', page: 4 },
    { label: 'Concept et services', page: 16 },
    { label: 'Analyse de marché', page: 21 },
    { label: 'Projections financières', page: 24 },
  ],
  story: {
    num: 1,
    title: 'notre histoire',
    accent: 'histoire',
    titleFont: '',
    subtitle: 'une agence créative pas comme les autres',
    body: `Tout est parti d'un constat sur le terrain. En côtoyant des entrepreneurs, des travailleurs autonomes et des petites entreprises, nous avons réalisé à quel point il leur était difficile d'accéder à des services marketing de qualité. Entre des agences traditionnelles aux processus complexes et des plateformes peu adaptées à leurs réalités, beaucoup abandonnaient leurs projets par manque de temps, de ressources ou simplement parce qu'ils ne savaient pas par où commencer.

De cette réalité est née une idée : et si nous pouvions **simplifier les choses**? Et si créer une identité visuelle, commander une vidéo ou lancer un site web devenait aussi simple et intuitif qu'acheter un produit en ligne?

Cocktail Média a vu le jour pour répondre à ce besoin. Nous avons imaginé un espace où la créativité serait à portée de clic, sans complications, sans jargon inutile.

Aujourd'hui, Cocktail Média incarne cette volonté de rendre la créativité accessible, efficace et adaptée à une nouvelle génération d'entrepreneurs.`,
  },
  mission: {
    num: 2,
    title: 'la mission',
    accent: 'mission',
    titleFont: '',
    subtitle: 'rendre la créativité accessible à tous',
    body: `Chez Cocktail Média, notre mission est de rendre les services multimédias **accessibles et abordables** pour les PME et les entrepreneurs. Nous vous offrons des solutions sur mesure, sans paperasse inutile ni coûts cachés.

Notre approche est simple et flexible — vous permettant de commander des services créatifs de manière transparente et efficace tout en répondant à vos besoins spécifiques. Nous nous engageons à vous fournir une expérience intuitive et personnalisée pour que vous puissiez concrétiser vos idées, vous démarquer et maximiser votre impact.`,
  },
  team: {
    title: 'notre',
    accent: 'équipe',
    titleFont: '',
    name: 'Félix Dumont',
    role: 'Shaker en chef',
    story: `Photographe depuis plus de 10 ans, j'ai découvert ma passion pour l'image dès ma première caméra. Mon parcours m'a amené à explorer de nombreux domaines : portraits, mariages, bars, spectacles, immobilier et, plus récemment, les événements sportifs.

En parallèle, ma carrière en vente m'a permis de développer une compréhension unique du monde des affaires. En tant que directeur des ventes chez Grote Industries, j'ai eu l'occasion de parcourir le Canada pour rencontrer des centaines d'entreprises et de PME.

Cette **double expertise**, créative et commerciale, se reflète aujourd'hui dans ma vision pour Cocktail Média.`,
  },
  servicesPage: { title: 'nos services', accent: 'services', subtitle: 'Comme au resto, à la carte.', titleFont: '' },
  pricesPage:   { title: 'liste de prix', accent: 'prix', titleFont: '' },
  services: [
    { category: "L'Apéro", name: 'Infographie d\'entreprise', description: 'Mise en page de documents corporatifs, présentations professionnelles et rapports visuels.' },
    { category: 'Les Rosés', name: 'Graphisme', description: 'Création d\'identités visuelles, logos, affiches promotionnelles et visuels numériques.' },
    { category: 'Les Blancs', name: 'Vidéographie', description: 'Production de contenus vidéo : publicités, capsules promotionnelles, couvertures d\'événements.' },
    { category: 'Les Rouges', name: 'Photographie', description: 'Shooting photo professionnel pour vos produits, portraits corporatifs et contenus marketing.' },
    { category: 'Les Digestifs', name: 'Sites web simples', description: 'Développement de sites vitrines simples et intuitifs pour présenter vos services.' },
    { category: 'Les Extras', name: 'Services additionnels', description: 'Livraisons express, revisites supplémentaires, séances prolongées, ajouts photo.' },
  ],
  prices: [
    {
      category: "L'Apéro", subtitle: 'Infographie',
      items: [
        { name: 'Présentation PowerPoint', price: '100,00 $' },
        { name: 'Création de plan d\'affaires', price: '200,00 $' },
      ],
    },
    {
      category: 'Les Rosés', subtitle: 'Graphisme',
      items: [
        { name: 'Création d\'un logo personnalisé', price: '200,00 $' },
        { name: 'Refonte d\'identité visuelle', price: '150,00 $' },
        { name: 'Supports imprimables', price: '75 $ / visuel · 200 $ / 4 visuels' },
        { name: 'Supports numériques', price: '75 $ / visuel · 200 $ / 4 visuels' },
      ],
    },
    {
      category: 'Les Blancs', subtitle: 'Vidéographie',
      items: [
        { name: 'Vidéo corporatif', price: '300,00 $' },
        { name: 'Couverture d\'évènement / 3 H', price: '300,00 $' },
        { name: 'Vidéos immobiliers', price: '200,00 $' },
        { name: 'Vidéos aériens', price: '200,00 $' },
        { name: 'Forfait Short / Reel', price: '330,00 $' },
      ],
    },
    {
      category: 'Les Rouges', subtitle: 'Photographie',
      items: [
        { name: 'Photos de produits', price: '175,00 $' },
        { name: 'Photos en actions', price: '250,00 $' },
        { name: 'Couverture d\'évènement / 3 H', price: '250,00 $' },
        { name: 'Portraits professionnels / 3 personnes', price: '100,00 $' },
        { name: 'Photographies immobilières (drone inclus)', price: '150,00 $' },
        { name: 'Photographies par drone', price: '200,00 $' },
      ],
    },
    {
      category: 'Les Digestifs', subtitle: 'Sites web simples',
      note: 'Les prix excluent les frais d\'hébergement',
      items: [
        { name: 'Création de site web simple', price: '500,00 $' },
        { name: 'Création d\'une boutique en ligne', price: '1 000,00 $' },
        { name: 'Refonte de site web', price: '150,00 $' },
      ],
    },
  ],
  timeline: {
    num: 3,
    title: 'mise en œuvre',
    accent: 'œuvre',
    titleFont: '',
    subtitle: 'phase 1 — le lancement (0-12 mois)',
    phases: [
      { date: '0-3 MOIS', title: 'Pré-lancement', text: 'Mise en ligne du site, ajustements techniques, fondations en place pour amorcer l\'activité.' },
      { date: '4-6 MOIS', title: 'Acquisition', text: 'Lancement des campagnes numériques ciblées, premiers projets clients, présence en milieu d\'affaires local.' },
      { date: '7-12 MOIS', title: 'Consolidation', text: 'Intensification publicitaire, partenariats stratégiques, préparation de la phase 2 (CocktailOS).' },
    ],
  },
  market: {
    num: 4,
    title: 'analyse de marché',
    accent: 'marché',
    titleFont: '',
    subtitle: 'L\'industrie & les PME',
    body: `L'industrie du marketing multimédia est en pleine effervescence, portée par la transformation numérique des entreprises. En 2024, le marché du design graphique au Canada représente plus de **2,36 milliards de dollars**, avec une croissance annuelle moyenne de +2,4 %.

Du côté de la photographie, l'industrie canadienne pèse environ **1,7 milliard de dollars**, portée par la demande en contenu professionnel pour le web et les réseaux sociaux. La vidéographie suit la même tendance, alimentée par l'explosion des formats courts.

En 2023, on dénombrait plus de **326 000 travailleurs autonomes** au Québec, et plus de **233 000 PME** — qui représentent plus de 98 % des entreprises employeuses de la province. Cocktail Média s'inscrit au cœur de cette dynamique.`,
  },
  finance: {
    num: 5,
    title: 'projections financières',
    accent: 'financières',
    titleFont: '',
    subtitle: 'notre vision sur 3 ans',
    metrics: [
      { label: 'Année 1', value: '58 500 $' },
      { label: 'Année 2', value: '84-102 K$' },
      { label: 'Année 3', value: '90-96 K$' },
    ],
    body: `L'Année 1 représente une période charnière, combinant le pré-lancement et la montée en puissance vers un rythme d'affaires stable. Après des revenus initiaux estimés à **8 500 $** sur les 3 premiers mois, l'entreprise prévoit une accélération notable à partir du quatrième mois.

L'Année 2 marque un tournant stratégique avec l'arrivée des premiers abonnements à **CocktailOS**. Les projections se basent sur l'acquisition réaliste de 10 à 20 clients SaaS, en plus des revenus créatifs stabilisés.

L'Année 3 marque une phase de **maturité et d'expansion**. Avec 30 à 40 clients SaaS, Cocktail Média consolide son positionnement comme solution locale complète combinant créativité et technologie.`,
  },
  closing: {
    message: 'Cocktail Média est bien plus qu\'une simple agence : c\'est une **réponse concrète** aux besoins des petites entreprises et des travailleurs autonomes qui cherchent des solutions marketing rapides, simples et abordables.',
  },
};
