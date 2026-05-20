/* global */
// Each template defines:
//   - id, label, description
//   - default doc data (object)
//   - pages: function(doc, variant, logoSrc) → array of React elements
//   - formSections: which form sections to show

window.TEMPLATES = {

  // ============== PLAN D'AFFAIRES ==============
  business: {
    id: 'business',
    label: 'Plan d\'affaires',
    description: 'Document complet : couverture, histoire, mission, équipe, services, prix, timeline, marché, projections financières.',
    defaultDoc: () => window.DEFAULT_DOC,
    formSections: ['meta', 'toc', 'divider1', 'story', 'mission', 'team', 'divider2', 'servicesPage', 'services', 'pricesPage', 'prices', 'timeline', 'divider3', 'market', 'divider4', 'finance', 'closing'],
    buildPages: (doc, v, logoSrc, branding = {}) => [
      <window.CoverPage data={doc.meta} variant={v} logoSrc={logoSrc} branding={branding} />,
      <window.TocPage items={doc.toc} variant={v} branding={branding} />,
      <window.DividerPage num="01" title={doc.dividers?.[0]?.title || 'Sommaire du projet'} accent={doc.dividers?.[0]?.accent || 'Sommaire'} subtitle={doc.dividers?.[0]?.subtitle || 'une agence créative pas comme les autres'} titleFont={doc.dividers?.[0]?.titleFont} variant={v} label="03 Section 01" />,
      <window.ContentPage num={doc.story?.num || 1} title={doc.story?.title} accent={doc.story?.accent} subtitle={doc.story?.subtitle} body={doc.story?.body} titleFont={doc.story?.titleFont} variant={v} label="04 Histoire" pageNum="5" branding={branding} />,
      <window.ContentPage num={doc.mission?.num || 2} title={doc.mission?.title} accent={doc.mission?.accent} subtitle={doc.mission?.subtitle} body={doc.mission?.body} titleFont={doc.mission?.titleFont} variant={v} label="05 Mission" pageNum="6" branding={branding} />,
      <window.BioPage name={doc.team?.name} role={doc.team?.role} story={doc.team?.story} pageTitle={doc.team?.title} pageAccent={doc.team?.accent} pageTitleFont={doc.team?.titleFont} variant={v} label="06 Équipe" pageNum="7" branding={branding} />,
      <window.DividerPage num="02" title={doc.dividers?.[1]?.title || 'Concept et services'} accent={doc.dividers?.[1]?.accent || 'services'} subtitle={doc.dividers?.[1]?.subtitle || 'Comme au resto, à la carte.'} titleFont={doc.dividers?.[1]?.titleFont} variant={v} label="07 Section 02" />,
      <window.ServicesPage services={doc.services} pageTitle={doc.servicesPage?.title} pageAccent={doc.servicesPage?.accent} pageSubtitle={doc.servicesPage?.subtitle} pageTitleFont={doc.servicesPage?.titleFont} variant={v} label="08 Services" pageNum="9" branding={branding} />,
      ...window.buildPricePages(doc.prices, v, branding, 10, doc.pricesPage),
      <window.TimelinePage num={doc.timeline?.num} title={doc.timeline?.title} accent={doc.timeline?.accent} subtitle={doc.timeline?.subtitle} phases={doc.timeline?.phases} titleFont={doc.timeline?.titleFont} variant={v} label="Timeline" pageNum="11+" branding={branding} />,
      <window.DividerPage num="03" title={doc.dividers?.[2]?.title || 'Analyse de marché'} accent={doc.dividers?.[2]?.accent || 'marché'} subtitle={doc.dividers?.[2]?.subtitle || "L'industrie & les PME"} titleFont={doc.dividers?.[2]?.titleFont} variant={v} label="11 Section 03" />,
      <window.ContentPage num={doc.market?.num} title={doc.market?.title} accent={doc.market?.accent} subtitle={doc.market?.subtitle} body={doc.market?.body} titleFont={doc.market?.titleFont} variant={v} label="12 Marché" pageNum="13" branding={branding} />,
      <window.DividerPage num="04" title={doc.dividers?.[3]?.title || 'Projections financières'} accent={doc.dividers?.[3]?.accent || 'Projections'} subtitle={doc.dividers?.[3]?.subtitle || 'Notre vision sur 3 ans'} titleFont={doc.dividers?.[3]?.titleFont} variant={v} label="13 Section 04" />,
      <window.MetricsPage title={doc.finance?.title} accent={doc.finance?.accent} subtitle={doc.finance?.subtitle} metrics={doc.finance?.metrics} body={doc.finance?.body} titleFont={doc.finance?.titleFont} variant={v} label="14 Finance" pageNum="15" branding={branding} />,
      <window.ClosingPage message={doc.closing?.message} variant={v} branding={branding} />,
    ],
  },

  // ============== PROGRAMME PIGISTE ==============
  pigiste: {
    id: 'pigiste',
    label: 'Programme pigiste',
    description: 'Document onboarding pigiste 9 sections : programme, outils, mandats, validation, facturation, attentes, partenaire, modalités légales, signature.',
    defaultDoc: () => window.PIGISTE_DOC,
    formSections: ['meta', 'toc', 'divider1', 'intro', 'divider2', 'toolsPage', 'tools', 'access', 'divider3', 'mandatesPage', 'mandates', 'pricesPage', 'prices', 'validation', 'billing', 'paymentTimeline', 'expectations', 'divider4', 'referencement', 'conditionsPartenaire', 'comparatif', 'modalites', 'modalitesSuite', 'signature', 'closing'],
    buildPages: (doc, v, logoSrc, branding = {}) => [
      <window.CoverPage data={doc.meta} variant={v} logoSrc={logoSrc} branding={branding} />,
      <window.TocPage items={doc.toc} variant={v} branding={branding} />,
      <window.DividerPage num="01" title={doc.dividers?.[0]?.title || 'Le programme pigiste.'} accent={doc.dividers?.[0]?.accent || 'pigiste.'} subtitle={doc.dividers?.[0]?.subtitle || 'Bienvenue chez Cocktail Média.'} titleFont={doc.dividers?.[0]?.titleFont} variant={v} label="03 Section 01" />,
      <window.ContentPage num={doc.intro?.num} title={doc.intro?.title} accent={doc.intro?.accent} subtitle={doc.intro?.subtitle} body={doc.intro?.body} titleFont={doc.intro?.titleFont} variant={v} label="04 Programme" pageNum="4" branding={branding} />,
      <window.DividerPage num="02" title={doc.dividers?.[1]?.title || 'Outils & organisation.'} accent={doc.dividers?.[1]?.accent || 'organisation.'} subtitle={doc.dividers?.[1]?.subtitle || 'Chaque outil a un rôle précis.'} titleFont={doc.dividers?.[1]?.titleFont} variant={v} label="05 Section 02" />,
      <window.ServicesPage services={doc.tools} pageTitle={doc.toolsPage?.title} pageAccent={doc.toolsPage?.accent} pageSubtitle={doc.toolsPage?.subtitle} pageTitleFont={doc.toolsPage?.titleFont} variant={v} label="06 Outils" pageNum="6" branding={branding} />,
      <window.ContentPage num={doc.access?.num} title={doc.access?.title} accent={doc.access?.accent} subtitle={doc.access?.subtitle} body={doc.access?.body} titleFont={doc.access?.titleFont} variant={v} label="07 Accès" pageNum="7" branding={branding} />,
      <window.DividerPage num="03" title={doc.dividers?.[2]?.title || 'Mandats & tarifs.'} accent={doc.dividers?.[2]?.accent || 'tarifs.'} subtitle={doc.dividers?.[2]?.subtitle || 'Rémunération au livrable validé.'} titleFont={doc.dividers?.[2]?.titleFont} variant={v} label="08 Section 03" />,
      <window.ServicesPage services={doc.mandates} pageTitle={doc.mandatesPage?.title} pageAccent={doc.mandatesPage?.accent} pageSubtitle={doc.mandatesPage?.subtitle} pageTitleFont={doc.mandatesPage?.titleFont} variant={v} label="09 Mandats" pageNum="9" branding={branding} />,
      ...window.buildPricePages(doc.prices, v, branding, 10, doc.pricesPage),
      <window.ContentPage num={doc.validation?.num} title={doc.validation?.title} accent={doc.validation?.accent} subtitle={doc.validation?.subtitle} body={doc.validation?.body} titleFont={doc.validation?.titleFont} variant={v} label="11 Validation" pageNum="12" branding={branding} />,
      <window.ContentPage num={doc.billing?.num} title={doc.billing?.title} accent={doc.billing?.accent} subtitle={doc.billing?.subtitle} body={doc.billing?.body} titleFont={doc.billing?.titleFont} variant={v} label="12 Facturation" pageNum="13" branding={branding} />,
      <window.TimelinePage num={doc.paymentTimeline?.num} title={doc.paymentTimeline?.title} accent={doc.paymentTimeline?.accent} subtitle={doc.paymentTimeline?.subtitle} phases={doc.paymentTimeline?.phases} titleFont={doc.paymentTimeline?.titleFont} variant={v} label="13 Cycle paiement" pageNum="14" branding={branding} />,
      <window.ContentPage num={doc.expectations?.num} title={doc.expectations?.title} accent={doc.expectations?.accent} subtitle={doc.expectations?.subtitle} body={doc.expectations?.body} titleFont={doc.expectations?.titleFont} variant={v} label="14 Attentes" pageNum="15" branding={branding} />,
      <window.DividerPage num="07" title={doc.dividers?.[3]?.title || 'Programme partenaire.'} accent={doc.dividers?.[3]?.accent || 'partenaire.'} subtitle={doc.dividers?.[3]?.subtitle || 'Pour les pigistes qui apportent leurs propres clients.'} titleFont={doc.dividers?.[3]?.titleFont} variant={v} label="15 Section 07" />,
      <window.ContentPage num={doc.referencement?.num} title={doc.referencement?.title} accent={doc.referencement?.accent} subtitle={doc.referencement?.subtitle} body={doc.referencement?.body} titleFont={doc.referencement?.titleFont} variant={v} label="16 Référencement" pageNum="16" branding={branding} />,
      <window.ContentPage num={doc.conditionsPartenaire?.num} title={doc.conditionsPartenaire?.title} accent={doc.conditionsPartenaire?.accent} subtitle={doc.conditionsPartenaire?.subtitle} body={doc.conditionsPartenaire?.body} titleFont={doc.conditionsPartenaire?.titleFont} variant={v} label="17 Conditions" pageNum="17" branding={branding} />,
      <window.ContentPage num={doc.comparatif?.num} title={doc.comparatif?.title} accent={doc.comparatif?.accent} subtitle={doc.comparatif?.subtitle} body={doc.comparatif?.body} titleFont={doc.comparatif?.titleFont} variant={v} label="18 Comparatif" pageNum="18" branding={branding} />,
      <window.ContentPage num={doc.modalites?.num} title={doc.modalites?.title} accent={doc.modalites?.accent} subtitle={doc.modalites?.subtitle} body={doc.modalites?.body} titleFont={doc.modalites?.titleFont} variant={v} label="19 Modalités" pageNum="19" branding={branding} />,
      <window.ContentPage num={doc.modalitesSuite?.num} title={doc.modalitesSuite?.title} accent={doc.modalitesSuite?.accent} subtitle={doc.modalitesSuite?.subtitle} body={doc.modalitesSuite?.body} titleFont={doc.modalitesSuite?.titleFont} variant={v} label="20 Modalités suite" pageNum="20" branding={branding} />,
      <window.ContentPage num={doc.signature?.num} title={doc.signature?.title} accent={doc.signature?.accent} subtitle={doc.signature?.subtitle} body={doc.signature?.body} titleFont={doc.signature?.titleFont} variant={v} label="21 Signature" pageNum="21" branding={branding} />,
      <window.ClosingPage message={doc.closing?.message} variant={v} branding={branding} />,
    ],
  },
};

// Form sections registry — what to render in the form for each section key
window.FORM_REGISTRY = {
  meta: { title: 'Couverture', kind: 'meta' },
  toc: { title: 'Table des matières', kind: 'toc' },
  divider1: { title: 'Séparateur 1', kind: 'divider', dividerIndex: 0 },
  divider2: { title: 'Séparateur 2', kind: 'divider', dividerIndex: 1 },
  divider3: { title: 'Séparateur 3', kind: 'divider', dividerIndex: 2 },
  divider4: { title: 'Séparateur 4', kind: 'divider', dividerIndex: 3 },
  story: { title: 'Histoire', kind: 'content' },
  mission: { title: 'Mission', kind: 'content' },
  intro: { title: 'Introduction / programme', kind: 'content' },
  access: { title: 'Accès aux fichiers', kind: 'content' },
  validation: { title: 'Validation & corrections', kind: 'content' },
  billing: { title: 'Facturation', kind: 'content' },
  expectations: { title: 'Communication & attentes', kind: 'content' },
  market: { title: 'Analyse de marché', kind: 'content' },
  team: { title: 'Équipe / bio', kind: 'team' },
  servicesPage: { title: 'Services — titre de page', kind: 'pageHeader', hasSubtitle: true },
  toolsPage:    { title: 'Outils — titre de page',   kind: 'pageHeader', hasSubtitle: true },
  mandatesPage: { title: 'Mandats — titre de page',  kind: 'pageHeader', hasSubtitle: true },
  pricesPage:   { title: 'Prix — titre de page',     kind: 'pageHeader', hasSubtitle: false },
  services: { title: 'Services à la carte', kind: 'services' },
  tools: { title: 'Outils & organisation', kind: 'services', servicesLabel: 'Outils' },
  mandates: { title: 'Types de mandats', kind: 'services', servicesLabel: 'Mandats' },
  prices: { title: 'Liste de prix / tarifs', kind: 'prices' },
  timeline: { title: 'Timeline / phases', kind: 'timeline' },
  paymentTimeline: { title: 'Cycle de paiement', kind: 'timeline' },
  finance: { title: 'Projections / métriques', kind: 'finance' },
  referencement:       { title: 'Référencement de clients',          kind: 'content' },
  conditionsPartenaire:{ title: 'Conditions programme partenaire',   kind: 'content' },
  comparatif:          { title: 'Comparatif pigiste / partenaire',   kind: 'content' },
  modalites:           { title: 'Modalités légales (1–5)',           kind: 'content' },
  modalitesSuite:      { title: 'Modalités légales (6–11)',          kind: 'content' },
  signature:           { title: 'Acceptation & signature',           kind: 'content' },
  closing: { title: 'Conclusion', kind: 'closing' },
};
