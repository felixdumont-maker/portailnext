'use client'

import { useState, useEffect } from 'react'
import { Bricolage_Grotesque, Atkinson_Hyperlegible } from 'next/font/google'

const bricolage = Bricolage_Grotesque({ subsets: ['latin'], weight: ['600', '700', '800'] })
const atkinson  = Atkinson_Hyperlegible({ subsets: ['latin'], weight: ['400', '700'] })

const A   = 'oklch(52% 0.21 32)'
const D   = 'oklch(18% 0.015 35)'
const TXT = 'oklch(22% 0.015 35)'
const MID = 'oklch(46% 0.015 55)'
const W   = 'oklch(97% 0.012 70)'
const S   = 'oklch(93% 0.018 65)'
const BR  = 'oklch(80% 0.015 70)'

const DOCS = [
  { id: 'conditions-generales',   num: '01', label: "Conditions d'utilisation" },
  { id: 'confidentialite',        num: '02', label: 'Politique de confidentialité' },
  { id: 'abonnement-facturation', num: '03', label: 'Abonnement et facturation' },
  { id: 'livraison-mandats',      num: '04', label: 'Livraison des mandats' },
  { id: 'politique-support',      num: '05', label: 'Politique de support' },
]

function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 36, marginBottom: 14 }}>
      <span style={{ width: 20, height: 2, background: A, flexShrink: 0, borderRadius: 1 }} />
      <div style={{ fontFamily: bricolage.style.fontFamily, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: MID }}>
        {children}
      </div>
    </div>
  )
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: '10px 0 6px', paddingLeft: 0, listStyle: 'none' }}>
      {items.map((it, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 7, lineHeight: 1.75, fontSize: 14, color: TXT, fontFamily: atkinson.style.fontFamily }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: A, flexShrink: 0, marginTop: 9 }} />
          {it}
        </li>
      ))}
    </ul>
  )
}

function Callout({ children, type }: { children: React.ReactNode; type?: 'warn' | 'ok' }) {
  const map = {
    warn: { bg: 'oklch(94% 0.035 50)',  bd: 'oklch(68% 0.12 45)', lbl: 'ATTENTION', lc: 'oklch(42% 0.18 38)' },
    ok:   { bg: 'oklch(94% 0.03 130)', bd: 'oklch(68% 0.1 130)', lbl: 'INCLUS',     lc: 'oklch(32% 0.12 140)' },
    info: { bg: S,                      bd: BR,                   lbl: 'À NOTER',   lc: MID },
  }
  const c = map[type ?? 'info']
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.bd}`, borderRadius: 6, padding: '14px 18px', margin: '16px 0' }}>
      <div style={{ fontFamily: bricolage.style.fontFamily, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: c.lc, marginBottom: 8 }}>{c.lbl}</div>
      <div style={{ fontSize: 13.5, lineHeight: 1.8, color: TXT, fontFamily: atkinson.style.fontFamily }}>{children}</div>
    </div>
  )
}

function Surface({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: S, borderRadius: 6, padding: '16px 20px', margin: '14px 0', fontSize: 13.5, lineHeight: 1.8, color: TXT, fontFamily: atkinson.style.fontFamily }}>
      {children}
    </div>
  )
}

function DataTable({ heads, rows }: { heads: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto', margin: '16px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${BR}` }}>
            {heads.map((h, i) => (
              <th key={i} style={{ textAlign: 'left', padding: '8px 14px', fontFamily: bricolage.style.fontFamily, fontWeight: 700, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: MID, whiteSpace: 'nowrap', background: S }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: `1px solid ${BR}` }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '10px 14px', color: TXT, fontFamily: atkinson.style.fontFamily, background: ri % 2 === 0 ? W : S, verticalAlign: 'top', lineHeight: 1.65 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DocSection({ id, num, title, subtitle, children }: { id: string; num: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 96, scrollMarginTop: 96 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <span style={{ fontFamily: bricolage.style.fontFamily, fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: A }}>Document {num}</span>
        <span style={{ flex: 1, height: 1, background: BR }} />
        <span style={{ background: A, color: W, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', padding: '3px 10px', borderRadius: 2, fontFamily: bricolage.style.fontFamily, textTransform: 'uppercase' }}>Mai 2026</span>
      </div>
      <h2 style={{ fontFamily: bricolage.style.fontFamily, fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', fontWeight: 800, color: D, textTransform: 'uppercase', letterSpacing: '-0.01em', margin: '0 0 8px', lineHeight: 1.05 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 12.5, color: MID, margin: '0 0 20px', fontStyle: 'italic', fontFamily: atkinson.style.fontFamily }}>{subtitle}</p>}
      <div style={{ height: 3, width: 48, background: A, borderRadius: 1, marginBottom: 30 }} />
      <div style={{ fontSize: 14, lineHeight: 1.85, color: TXT, fontFamily: atkinson.style.fontFamily }}>
        {children}
      </div>
    </section>
  )
}

export default function ConditionsPage() {
  const [active, setActive] = useState('conditions-generales')

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => { document.documentElement.style.scrollBehavior = '' }
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-15% 0px -55% 0px' }
    )
    DOCS.forEach(d => { const el = document.getElementById(d.id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div style={{ fontFamily: atkinson.style.fontFamily, background: W, minHeight: '100vh', color: TXT }}>

      {/* Hero */}
      <div style={{ background: D, padding: 'clamp(48px, 8vw, 80px) 24px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: A, fontFamily: bricolage.style.fontFamily, marginBottom: 20 }}>
            Cocktail Média — CocktailOS
          </div>
          <h1 style={{ fontFamily: bricolage.style.fontFamily, fontSize: 'clamp(2.4rem, 7vw, 5rem)', fontWeight: 800, color: W, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: '0 0 24px', lineHeight: 1.0 }}>
            Conditions<br />d&apos;utilisation<br /><span style={{ color: A }}>et politiques</span>
          </h1>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, color: 'oklch(62% 0.015 60)', fontFamily: atkinson.style.fontFamily }}>Dernière mise à jour : mai 2026</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'oklch(38% 0.01 50)', display: 'inline-block' }} />
            <span style={{ fontSize: 12.5, color: 'oklch(62% 0.015 60)', fontFamily: atkinson.style.fontFamily }}>Juridiction : Trois-Rivières, Québec, Canada</span>
          </div>
        </div>
      </div>

      {/* Mobile select */}
      <div className="lg:hidden" style={{ background: S, padding: '12px 16px', borderBottom: `1px solid ${BR}` }}>
        <select
          value={active}
          onChange={e => goTo(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: `1px solid ${BR}`, background: W, fontFamily: atkinson.style.fontFamily, fontSize: 14, color: TXT, outline: 'none' }}
        >
          {DOCS.map(d => (
            <option key={d.id} value={d.id}>Document {d.num} — {d.label}</option>
          ))}
        </select>
      </div>

      {/* Layout */}
      <div style={{ display: 'flex', maxWidth: 1180, margin: '0 auto', padding: '0 20px' }}>

        {/* Sidebar */}
        <aside className="hidden lg:block" style={{ width: 240, flexShrink: 0, paddingTop: 56 }}>
          <div style={{ position: 'sticky', top: 96 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: MID, marginBottom: 20, fontFamily: bricolage.style.fontFamily, paddingBottom: 12, borderBottom: `1px solid ${BR}` }}>
              Documents
            </div>
            {DOCS.map(d => (
              <button
                key={d.id}
                onClick={() => goTo(d.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  width: '100%', textAlign: 'left', padding: '10px 0',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: `1px solid ${BR}`,
                }}
              >
                <span style={{ fontFamily: bricolage.style.fontFamily, fontSize: 13, fontWeight: 800, color: active === d.id ? A : 'oklch(70% 0.015 65)', flexShrink: 0, paddingTop: 1, transition: 'color 0.15s' }}>
                  {d.num}
                </span>
                <span style={{ fontSize: 12.5, color: active === d.id ? TXT : MID, fontWeight: active === d.id ? 700 : 400, fontFamily: atkinson.style.fontFamily, lineHeight: 1.4, transition: 'color 0.15s' }}>
                  {d.label}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main style={{ flex: 1, minWidth: 0, paddingTop: 56 }} className="lg:pl-16">

          {/* DOC 1 */}
          <DocSection id="conditions-generales" num="01" title="Conditions générales d'utilisation">
            <p style={{ margin: '0 0 16px' }}>
              CocktailOS est une plateforme de gestion d&apos;entreprise développée et exploitée par Cocktail Média.
              En accédant à la plateforme ou en souscrivant à un abonnement, vous acceptez l&apos;ensemble des présentes conditions d&apos;utilisation.
            </p>

            <SubHead>Section 01 - Définitions</SubHead>
            <Surface>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                {[
                  ['"Cocktail Média"', "l'entreprise exploitant CocktailOS."],
                  ['"Abonné"', "toute personne ou entreprise ayant souscrit à un forfait CocktailOS."],
                  ['"Utilisateur final"', "les clients de l'abonné accédant au portail client."],
                  ['"Plateforme"', "l'ensemble des services CocktailOS."],
                  ['"Mandat"', "tout projet de développement ou de création confié à Cocktail Média."],
                  ['"Données"', "l'ensemble des informations saisies dans la plateforme par l'abonné ou ses utilisateurs finaux."],
                ].map(([term, def], i, arr) => (
                  <li key={i} style={{ padding: '7px 0', borderBottom: i < arr.length - 1 ? `1px solid ${BR}` : 'none', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <strong style={{ color: D, minWidth: 170, flexShrink: 0, fontFamily: bricolage.style.fontFamily }}>{term}</strong>
                    <span style={{ color: TXT }}>{def}</span>
                  </li>
                ))}
              </ul>
            </Surface>

            <SubHead>Section 02 - Accès et compte</SubHead>
            <Ul items={[
              "L'accès est réservé aux personnes majeures (18 ans et plus) ou aux représentants autorisés d'une entreprise.",
              "L'abonné est responsable de la confidentialité de ses identifiants de connexion.",
              "Toute utilisation non autorisée doit être signalée immédiatement à Cocktail Média.",
              "L'abonné est responsable de toutes les actions effectuées depuis son compte.",
              "Cocktail Média se réserve le droit de suspendre ou résilier tout compte en cas d'utilisation abusive.",
            ]} />

            <SubHead>Section 03 - Usage acceptable</SubHead>
            <p style={{ margin: '0 0 10px' }}>Sont strictement interdits :</p>
            <Ul items={[
              "La revente ou la sous-licence de l'accès à la plateforme",
              "L'utilisation à des fins frauduleuses ou illicites",
              "La tentative d'accès non autorisé aux données d'autres abonnés",
              "Le contournement des mesures de sécurité",
              "L'utilisation de robots ou de scripts automatisés non autorisés par Cocktail Média",
              "La publication de contenu diffamatoire, illégal ou portant atteinte aux droits de tiers",
            ]} />

            <SubHead>Section 04 - Propriété intellectuelle</SubHead>
            <Ul items={[
              "CocktailOS et l'ensemble de ses composantes (code source, interface, documentation, marques) sont la propriété exclusive de Cocktail Média.",
              "L'abonné conserve la propriété de l'ensemble des données qu'il saisit dans la plateforme.",
              "L'abonné accorde à Cocktail Média une licence limitée d'utilisation de ses données aux seules fins d'exploitation et d'amélioration de la plateforme.",
              "Aucun droit de propriété intellectuelle sur CocktailOS n'est transféré à l'abonné, sauf dans le cadre d'une option d'acquisition du code source expressément convenue par écrit.",
            ]} />

            <SubHead>Section 05 - Limitation de responsabilité</SubHead>
            <Callout type="warn">
              La responsabilité totale de Cocktail Média ne peut en aucun cas excéder le montant des abonnements payés au cours des <strong>3 derniers mois</strong> précédant l&apos;incident.
            </Callout>
            <Ul items={[
              "Cocktail Média s'engage à déployer tous les efforts raisonnables pour assurer la disponibilité et la fiabilité.",
              "Cocktail Média ne peut être tenu responsable des pertes de données causées par une utilisation incorrecte, des pannes hors de son contrôle, ou des actions de tiers.",
            ]} />

            <SubHead>Section 06 - Modifications des conditions</SubHead>
            <Ul items={["Cocktail Média se réserve le droit de modifier les présentes conditions en tout temps."]} />
            <Callout>
              L&apos;abonné sera avisé par courriel au moins <strong>30 jours</strong> avant l&apos;entrée en vigueur de toute modification substantielle.
            </Callout>
            <Ul items={[
              "La poursuite de l'utilisation vaut acceptation des nouvelles conditions.",
              "En cas de refus, l'abonné peut résilier son abonnement sans frais supplémentaires avant la date d'entrée en vigueur.",
            ]} />

            <SubHead>Section 07 - Résiliation</SubHead>
            <Ul items={[
              "L'abonné peut résilier son abonnement en tout temps conformément aux conditions du Document 03.",
              "Cocktail Média peut résilier en cas de non-paiement, d'utilisation abusive ou de violation des conditions, après en avoir avisé l'abonné.",
            ]} />

            <SubHead>Section 08 - Juridiction</SubHead>
            <Surface>
              Les présentes conditions sont régies par les lois du Québec et les lois fédérales du Canada applicables.
              Tout litige sera soumis à la compétence exclusive des tribunaux du district judiciaire de Trois-Rivières.
            </Surface>
          </DocSection>

          {/* DOC 2 */}
          <DocSection id="confidentialite" num="02" title="Politique de confidentialité" subtitle="Conformément à la Loi 25 (Québec) et à la LPRPDE">

            <SubHead>Section 01 - Renseignements collectés</SubHead>
            <DataTable
              heads={["Sur l'abonné", "Sur les utilisateurs finaux"]}
              rows={[
                ["Nom complet et nom d'entreprise", "Nom complet"],
                ["Adresse courriel", "Adresse courriel"],
                ["Numéro de téléphone", "Informations de projets et mandats"],
                ["Adresse de facturation", "Fichiers et documents déposés"],
                ["Informations de paiement (traitées par Stripe, non stockées par Cocktail Média)", "Progression dans les formations (si applicable)"],
                ["Historique de facturation et d'abonnement", "Historique de facturation"],
                ["Données d'utilisation de la plateforme", ""],
              ]}
            />

            <SubHead>Section 02 - Finalités de la collecte</SubHead>
            <p style={{ margin: '0 0 10px' }}>Les renseignements sont utilisés exclusivement pour :</p>
            <Ul items={[
              "Créer et gérer le compte de l'abonné",
              "Fournir les services CocktailOS souscrits",
              "Facturer et traiter les paiements",
              "Communiquer concernant le compte",
              "Améliorer la plateforme (données agrégées et anonymisées)",
              "Respecter les obligations légales applicables",
            ]} />
            <Callout type="ok">
              <strong>Aucune donnée n&apos;est vendue, louée ni partagée à des tiers à des fins commerciales.</strong>
            </Callout>

            <SubHead>Section 03 - Hébergement et transfert des données</SubHead>
            <DataTable
              heads={["Service", "Localisation", "Certification", "Statut Loi 25"]}
              rows={[
                ["Serveur CocktailOS principal", "Trois-Rivières, Québec, Canada", "Infrastructure Cocktail Média", "Données au Québec"],
                ["Plateformes sur mesure", "Union européenne (Hetzner)", "ISO 27001 / RGPD", "Protection adéquate reconnue"],
                ["Stockage de fichiers", "États-Unis et Canada (Google Drive)", "SOC 2 Type II / ISO 27001", "EFVP réalisée (Loi 25)"],
                ["Traitement des paiements", "États-Unis (Stripe)", "PCI DSS Level 1", "Aucune donnée carte stockée"],
              ]}
            />

            <SubHead>Section 04 - Durée de conservation</SubHead>
            <DataTable
              heads={["Type de données", "Durée de conservation"]}
              rows={[
                ["Données de compte actif", "Durée de l'abonnement"],
                ["Données après résiliation", "60 jours puis suppression"],
                ["Données de facturation", "7 ans (obligations fiscales)"],
              ]}
            />

            <SubHead>Section 05 - Sécurité</SubHead>
            <Ul items={[
              "Chiffrement des communications (HTTPS/TLS)",
              "Authentification sécurisée (bcrypt)",
              "Accès aux données restreint au personnel autorisé",
              "Sauvegardes quotidiennes automatisées",
              "Journalisation des accès et des modifications",
            ]} />

            <SubHead>Section 06 - Vos droits (Loi 25)</SubHead>
            <Ul items={[
              "Droit d'accès à vos renseignements",
              "Droit de rectification",
              "Droit à la suppression",
              "Droit à la portabilité",
              "Droit de retirer votre consentement",
            ]} />
            <Surface>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span className="material-symbols-outlined" style={{ color: A, fontSize: 20, flexShrink: 0 }}>mail</span>
                <div>
                  Pour exercer ces droits, adresser une demande écrite à :<br />
                  <a href="mailto:felix.dumont@cocktailmedia.ca" style={{ color: A, fontWeight: 700 }}>felix.dumont@cocktailmedia.ca</a>
                  <span style={{ display: 'block', fontSize: 11.5, color: MID, marginTop: 3 }}>Traitement dans un délai de 30 jours</span>
                </div>
              </div>
            </Surface>

            <SubHead>Section 07 - Témoins de connexion</SubHead>
            <Ul items={[
              "CocktailOS utilise uniquement les témoins strictement nécessaires au fonctionnement (gestion de session).",
              "Aucun témoin publicitaire ou de traçage tiers n'est utilisé.",
            ]} />

            <SubHead>Section 08 - Incidents de confidentialité</SubHead>
            <Callout type="warn">
              En cas d&apos;incident présentant un risque de préjudice sérieux, la Commission d&apos;accès à l&apos;information du Québec (CAI)
              et les personnes concernées seront avisées dans un délai maximum de <strong>72 heures</strong> suivant la découverte de l&apos;incident.
            </Callout>

            <SubHead>Section 09 - Responsable de la protection</SubHead>
            <Surface>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span className="material-symbols-outlined" style={{ color: A, fontSize: 24, flexShrink: 0 }}>person</span>
                <div>
                  <strong style={{ color: D, display: 'block', marginBottom: 2, fontFamily: bricolage.style.fontFamily }}>Félix Dumont</strong>
                  Responsable de la protection des renseignements personnels<br />
                  Cocktail Média, Trois-Rivières (Québec)<br />
                  <a href="mailto:felix.dumont@cocktailmedia.ca" style={{ color: A }}>felix.dumont@cocktailmedia.ca</a>
                </div>
              </div>
            </Surface>
          </DocSection>

          {/* DOC 3 */}
          <DocSection id="abonnement-facturation" num="03" title="Conditions d'abonnement et facturation">

            <SubHead>Section 01 - Les forfaits CocktailOS</SubHead>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: 14, margin: '16px 0' }}>
              {([
                { nom: 'Base',     prix: '40$/mois',  featured: false, inclus: ["CRM complet", "Facturation", "Gestion de projets", "Notifications automatiques", "Rappels de paiement", "Accès illimité", "Support courriel 48h"] },
                { nom: 'Base+',    prix: '75$/mois',  featured: false, inclus: ["Tout ce qui est inclus dans Base", "Gestion d'inventaire complète", "Produits et matières premières", "Recettes et assemblage", "Réception fournisseurs", "Alertes de stock", "Exportation CSV"] },
                { nom: 'Premium',  prix: '100$/mois', featured: false, inclus: ["Tout ce qui est inclus dans Base", "Portail client complet", "Suivi de projets en temps réel", "Dépôt de documents", "Consultation des factures", "Intégration Google Drive", "Intégration Google Calendar"] },
                { nom: 'Premium+', prix: '150$/mois', featured: true,  inclus: ["Tout ce qui est inclus dans Premium", "Portail 100% personnalisé", "Votre domaine, logo, couleurs", "Module formations en ligne", "Quiz et certifications", "Suivi de progression", "Assistant IA", "Recommandations IA"] },
              ] as const).map((f, i) => (
                <div key={i} style={{ background: f.featured ? D : W, border: `${f.featured ? 2 : 1}px solid ${f.featured ? A : BR}`, borderRadius: 12, padding: 20, position: 'relative' }}>
                  {f.featured && (
                    <span style={{ position: 'absolute', top: 12, right: 12, background: A, color: W, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 2, fontFamily: bricolage.style.fontFamily }}>COMPLET</span>
                  )}
                  <div style={{ fontFamily: bricolage.style.fontFamily, fontSize: 20, fontWeight: 800, color: f.featured ? W : D, textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: 2 }}>{f.nom}</div>
                  <div style={{ fontFamily: bricolage.style.fontFamily, fontSize: 26, fontWeight: 800, color: A, marginBottom: 2 }}>{f.prix}</div>
                  <div style={{ fontSize: 11, color: f.featured ? 'oklch(62% 0.01 60)' : MID, marginBottom: 14 }}>avant taxes</div>
                  <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                    {f.inclus.map((item, j) => (
                      <li key={j} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 5, fontSize: 12, color: f.featured ? 'oklch(78% 0.015 65)' : TXT, lineHeight: 1.5, fontFamily: atkinson.style.fontFamily }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13, color: f.featured ? A : 'oklch(52% 0.12 140)', flexShrink: 0, marginTop: 1, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Surface>
              <strong style={{ color: D, fontFamily: bricolage.style.fontFamily }}>Tous les forfaits incluent :</strong>
              <Ul items={[
                "Accès illimité (aucune limite de clients, projets ou stockage)",
                "Sauvegardes quotidiennes",
                "Mises à jour de sécurité",
                "Nouveaux modules au fil du temps",
              ]} />
            </Surface>

            <SubHead>Section 02 - Cycle de facturation</SubHead>
            <Ul items={["Facturation mensuelle à date fixe", "Débute à l'activation du compte", "Factures transmises par courriel"]} />

            <SubHead>Section 03 - Modes de paiement acceptés</SubHead>
            <Ul items={[
              "Carte de crédit via Stripe (Visa, Mastercard, Amex)",
              "Virement Interac",
              "Facture Net 15 jours",
            ]} />
            <Callout>
              Le délai <strong>Net 15</strong> signifie que le paiement est exigible dans les 15 jours suivant la date d&apos;émission de la facture.
            </Callout>

            <SubHead>Section 04 - Facturation des mandats de développement</SubHead>
            <DataTable
              heads={["Type de mandat", "Modalité de paiement"]}
              rows={[
                ["Sites web et plateformes sur mesure", "50% à mi-mandat + 50% à la livraison finale"],
                ["Plateforme CocktailOS (setup)", "100% à mi-mandat ou avant la livraison"],
                ["Plateforme Wix (setup)", "100% à mi-mandat ou avant la livraison"],
              ]}
            />
            <Callout>
              Aucun acompte n&apos;est exigé au démarrage, sauf entente écrite contraire.
            </Callout>

            <SubHead>Section 05 - Frais de retard</SubHead>
            <Callout type="warn">
              Tout solde impayé après le délai applicable est sujet à des frais de retard de <strong>2% par mois (24% annuellement)</strong> sur le solde en souffrance.
              Montant minimum : <strong>25$</strong> par période de retard.
            </Callout>

            <SubHead>Section 06 - Non-paiement et suspension</SubHead>
            <div style={{ position: 'relative', paddingLeft: 32, margin: '18px 0' }}>
              <div style={{ position: 'absolute', left: 13, top: 8, bottom: 8, width: 2, background: BR }} />
              {([
                { label: 'Jour 1 après échéance',        dot: 'oklch(52% 0.16 140)', desc: 'Premier avis de paiement par courriel' },
                { label: 'Jour 8 après échéance',        dot: 'oklch(62% 0.16 75)',  desc: 'Deuxième avis de paiement - dernier avis avant suspension' },
                { label: 'Après 2 avis sans retour',     dot: 'oklch(60% 0.18 50)',  desc: 'Suspension du compte. Accès suspendu, données conservées intégralement' },
                { label: '30 jours après la suspension', dot: 'oklch(52% 0.21 32)',  desc: 'Avis final de résiliation. Délai de 7 jours pour régulariser' },
                { label: 'Sans régularisation',          dot: 'oklch(30% 0.15 32)',  desc: 'Résiliation définitive. Données conservées 60 jours puis supprimées' },
              ] as const).map((s, i) => (
                <div key={i} style={{ marginBottom: 20, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -26, top: 5, width: 14, height: 14, borderRadius: '50%', background: s.dot, border: `3px solid ${W}` }} />
                  <div style={{ fontWeight: 700, fontSize: 13, color: D, fontFamily: bricolage.style.fontFamily }}>{s.label}</div>
                  <div style={{ fontSize: 13, color: MID, marginTop: 2, lineHeight: 1.6, fontFamily: atkinson.style.fontFamily }}>{s.desc}</div>
                </div>
              ))}
            </div>
            <Callout>
              <strong>Réactivation après suspension :</strong> paiement intégral du solde requis.
              Frais de réactivation : <strong>50$ + taxes</strong>. Réactivation dans les 24h ouvrables.
            </Callout>

            <SubHead>Section 07 - Résiliation volontaire</SubHead>
            <Ul items={[
              "Préavis requis : 30 jours calendrier",
              "Transmission par courriel à felix.dumont@cocktailmedia.ca",
            ]} />
            <Callout type="ok">
              Remboursement pro-rata des jours non utilisés par le même mode de paiement utilisé à la commande.
              Calculé sur la base de 30 jours par mois.
            </Callout>
            <p style={{ fontSize: 13, color: MID, margin: '8px 0 0' }}>
              Note : export des données possible avant résiliation. Assistance disponible au taux de 50$/h + taxes.
            </p>

            <SubHead>Section 08 - Cas particulier Forfait Premium+</SubHead>
            <Callout type="warn">
              La plateforme personnalisée (2 500$ de setup) représente un mandat distinct de l&apos;abonnement mensuel.
              <strong> Aucun remboursement du montant de setup après la livraison</strong>, quelle que soit la date de résiliation.
            </Callout>
            <Callout>
              Le code source appartient à l&apos;abonné dès la livraison et le paiement complet.
            </Callout>
            <div style={{ fontWeight: 700, fontSize: 13, color: D, margin: '20px 0 10px', fontFamily: bricolage.style.fontFamily, letterSpacing: '0.04em' }}>Résiliation Premium+ — Chronologie</div>
            <div style={{ position: 'relative', paddingLeft: 32, margin: '0 0 16px' }}>
              <div style={{ position: 'absolute', left: 13, top: 8, bottom: 8, width: 2, background: BR }} />
              {[
                { label: "Résiliation de l'abonnement mensuel", desc: "Pro-rata applicable. Code source conservé par l'abonné." },
                { label: "Compte maintenu en mode inactif 12 mois", desc: "Réactivation possible sans frais. Reprise exactement au point d'arrêt." },
                { label: "Après 12 mois sans réactivation", desc: "Préavis de 30 jours par courriel. Suppression définitive des données." },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: 18, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -26, top: 5, width: 14, height: 14, borderRadius: '50%', background: A, border: `3px solid ${W}` }} />
                  <div style={{ fontWeight: 700, fontSize: 13, color: D, fontFamily: bricolage.style.fontFamily }}>{s.label}</div>
                  <div style={{ fontSize: 13, color: MID, marginTop: 2, fontFamily: atkinson.style.fontFamily }}>{s.desc}</div>
                </div>
              ))}
            </div>
            <Surface>
              <strong style={{ color: D, display: 'block', marginBottom: 6, fontFamily: bricolage.style.fontFamily }}>Option d&apos;acquisition du code source</strong>
              Disponible en tout temps durant l&apos;abonnement actif<br />
              Montant : <strong style={{ color: A }}>9 000$ + taxes (10 349,25$ TTC)</strong><br />
              Inclut : code source complet, documentation technique, guide de déploiement, session de transfert (2h)<br />
              Met fin à l&apos;abonnement mensuel dès le mois suivant le paiement complet
            </Surface>

            <SubHead>Section 09 - Modification des tarifs</SubHead>
            <Callout>
              Préavis de <strong>60 jours</strong> par courriel avant toute augmentation tarifaire. L&apos;abonné peut résilier sans frais supplémentaires durant ce délai.
            </Callout>
          </DocSection>

          {/* DOC 4 */}
          <DocSection id="livraison-mandats" num="04" title="Conditions de livraison des mandats">

            <SubHead>Section 01 - Champ d&apos;application</SubHead>
            <p style={{ margin: '0 0 10px' }}>S&apos;applique à tous les mandats :</p>
            <Ul items={["Sites web (Next.js, Vercel)", "Plateformes Wix", "Plateformes CocktailOS personnalisées", "Applications web sur mesure", "Mandats créatifs"]} />

            <SubHead>Section 02 - Démarrage du mandat</SubHead>
            <p style={{ margin: '0 0 10px' }}>Le mandat débute dès :</p>
            <Ul items={["L'acceptation de la proposition", "ET la réception de tous les éléments requis"]} />
            <Callout type="warn">
              Si les éléments requis ne sont pas fournis dans les <strong>14 jours</strong> suivant l&apos;acceptation, Cocktail Média se réserve le droit de reporter la date de démarrage.
            </Callout>

            <SubHead>Section 03 - Délais de réalisation</SubHead>
            <DataTable
              heads={["Type de mandat", "Délai estimé"]}
              rows={[
                ["Site web Next.js (vitrine)", "4-6 semaines"],
                ["Plateforme Wix", "4-6 semaines"],
                ["Plateforme CocktailOS personnalisée", "4-6 semaines"],
                ["Application web sur mesure", "8-10 semaines"],
              ]}
            />
            <p style={{ fontSize: 12.5, color: MID, margin: '6px 0 0' }}>Note : ces délais débutent après réception de tous les éléments requis.</p>

            <SubHead>Section 04 - Livrables</SubHead>
            <Ul items={[
              "Les livrables sont ceux expressément convenus dans la proposition acceptée.",
              "Les fichiers sources sont inclus pour les mandats de développement web.",
              "Pour les mandats créatifs, les fichiers sources peuvent être ajoutés en extra.",
            ]} />

            <SubHead>Section 05 - Révisions</SubHead>
            <Callout>
              Chaque mandat inclut <strong>2 rondes de révisions</strong>. Une ronde = transmission des commentaires + ajustements correspondants. Une révision n&apos;est pas une refonte complète.
            </Callout>
            <p style={{ margin: '10px 0 6px' }}>Révisions supplémentaires :</p>
            <Ul items={["Développement : 85$/h + taxes", "Maintenance : 50$/h + taxes"]} />

            <SubHead>Section 06 - Responsabilité du client</SubHead>
            <p style={{ margin: '0 0 10px' }}>Le client est responsable de :</p>
            <Ul items={[
              "Fournir tous les éléments requis dans les délais",
              "Valider les livrables dans les 7 jours ouvrables",
              "Assurer l'exactitude et la légalité du contenu fourni",
              "Détenir les droits sur tous les éléments transmis",
            ]} />
            <Callout type="warn">
              En transmettant des éléments, le client confirme détenir tous les droits d&apos;utilisation nécessaires.
              Cocktail Média ne peut être tenu responsable de toute réclamation relative aux droits d&apos;auteur.
            </Callout>

            <SubHead>Section 07 - Abandon de mandat</SubHead>
            <Callout type="warn">
              Si le client ne répond pas aux communications pendant <strong>30 jours consécutifs</strong>, le mandat est considéré comme abandonné.
              Aucun remboursement n&apos;est offert pour les montants déjà payés.
            </Callout>

            <SubHead>Section 08 - Annulation</SubHead>
            <DataTable
              heads={["Moment de l'annulation", "Conditions"]}
              rows={[
                ["Avant le démarrage", "Annulation sans frais. Remboursement complet sous 10 jours ouvrables."],
                ["Après le démarrage", "Aucun remboursement pour les montants payés. Évaluation au cas par cas si circonstances exceptionnelles."],
                ["Après la livraison", "Aucun remboursement. Ajustements couverts par les rondes de révision incluses."],
              ]}
            />

            <SubHead>Section 09 - Propriété et droits</SubHead>
            <Ul items={[
              "Les livrables sont transférés à l'abonné dès le paiement complet du mandat.",
              "Avant paiement complet, les livrables restent la propriété de Cocktail Média.",
            ]} />
            <Callout>
              Cocktail Média se réserve le droit d&apos;inclure les réalisations dans son portfolio et sa promotion, sauf demande contraire écrite.
            </Callout>

            <SubHead>Section 10 - Retards de livraison</SubHead>
            <DataTable
              heads={["Durée du retard", "Compensation"]}
              rows={[
                ["Plus de 5 jours ouvrables", "Remise de 10% sur la prochaine facture ou extra gratuit au choix"],
                ["Plus de 15 jours ouvrables", "Remboursement partiel ou total à évaluer selon l'avancement des travaux"],
              ]}
            />
            <Callout>
              Aucune compensation si le retard est causé par l&apos;absence des éléments du client, des modifications demandées en cours de mandat, ou un cas de force majeure.
            </Callout>
          </DocSection>

          {/* DOC 5 */}
          <DocSection id="politique-support" num="05" title="Politique de support">

            <SubHead>Section 01 - Canal de support</SubHead>
            <Surface>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: A, fontSize: 22 }}>mail</span>
                <div>
                  <div style={{ fontWeight: 700, color: D, fontFamily: bricolage.style.fontFamily }}>Support CocktailOS exclusivement par courriel</div>
                  <a href="mailto:felix.dumont@cocktailmedia.ca" style={{ color: A, fontSize: 13 }}>felix.dumont@cocktailmedia.ca</a>
                </div>
              </div>
            </Surface>

            <SubHead>Section 02 - Heures de support</SubHead>
            <Surface>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: A, fontSize: 22 }}>schedule</span>
                <div>
                  <div style={{ fontWeight: 700, color: D, fontFamily: bricolage.style.fontFamily }}>Lundi au vendredi : 9h00 à 17h00 (HNE)</div>
                  <div style={{ fontSize: 12.5, color: MID, marginTop: 2 }}>Jours fériés québécois : non disponible</div>
                </div>
              </div>
            </Surface>

            <SubHead>Section 03 - Délai de réponse</SubHead>
            <Callout type="ok">
              Délai de réponse garanti : <strong>48 heures ouvrables</strong> calculées durant les heures de support.
              Les demandes reçues hors des heures de support sont traitées le prochain jour ouvrable.
            </Callout>

            <SubHead>Section 04 - Support inclus dans les forfaits</SubHead>
            <p style={{ margin: '0 0 10px' }}>Le support suivant est inclus dans tous les forfaits :</p>
            <Ul items={[
              "Questions d'utilisation de la plateforme",
              "Signalement de problèmes techniques",
              "Assistance à la configuration de base",
              "Suivi des incidents",
            ]} />

            <SubHead>Section 05 - Support facturable</SubHead>
            <Surface>
              <strong style={{ color: D, fontFamily: bricolage.style.fontFamily }}>Les interventions suivantes sont facturées au taux de 50$/h + taxes :</strong>
              <Ul items={[
                "Formation supplémentaire",
                "Développement de nouvelles fonctionnalités",
                "Personnalisations hors forfait",
                "Exportation assistée des données",
                "Support pour les produits tiers (Stripe, Google Drive, Bunny.net)",
              ]} />
            </Surface>

            <SubHead>Section 06 - Exclusions</SubHead>
            <p style={{ margin: '0 0 10px' }}>Le support ne couvre pas :</p>
            <Ul items={[
              "Les problèmes causés par une utilisation incorrecte",
              "Les problèmes liés aux appareils ou navigateurs des utilisateurs finaux de l'abonné",
              "Les interruptions des plateformes tierces (Google, Stripe, Vercel, Hetzner)",
              "Les mandats de développement actifs",
            ]} />

            <SubHead>Section 07 - Disponibilité de la plateforme</SubHead>
            <Ul items={["Cocktail Média déploie tous les efforts raisonnables pour maintenir la plateforme disponible en tout temps."]} />
            <Callout>
              Des interruptions planifiées peuvent survenir. L&apos;abonné sera avisé par courriel au moins <strong>24h à l&apos;avance</strong> pour toute maintenance planifiée.
            </Callout>
            <p style={{ fontSize: 13, color: MID, margin: '8px 0 0' }}>
              Cocktail Média ne peut garantir une disponibilité ininterrompue et ne peut être tenu responsable des interruptions hors de son contrôle.
            </p>

            <SubHead>Section 08 - Amélioration continue</SubHead>
            <Surface>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: A, flexShrink: 0 }}>rocket_launch</span>
                <div>
                  CocktailOS est en développement actif. De nouvelles fonctionnalités sont ajoutées régulièrement. Les abonnés sont informés par courriel.
                  Suggestions : <a href="mailto:felix.dumont@cocktailmedia.ca" style={{ color: A }}>felix.dumont@cocktailmedia.ca</a>
                </div>
              </div>
            </Surface>
          </DocSection>

          {/* Footer */}
          <div style={{ borderTop: `1px solid ${BR}`, paddingTop: 32, paddingBottom: 64, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: MID, maxWidth: 520, margin: '0 auto 12px', lineHeight: 1.75, fontFamily: atkinson.style.fontFamily }}>
              Ces documents ont été préparés par Cocktail Média et sont soumis à la juridiction des tribunaux
              du district judiciaire de Trois-Rivières, Québec.
              Pour toute question : <a href="mailto:felix.dumont@cocktailmedia.ca" style={{ color: A }}>felix.dumont@cocktailmedia.ca</a>
            </p>
            <div style={{ fontSize: 11, color: 'oklch(68% 0.015 65)', fontFamily: bricolage.style.fontFamily, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Dernière mise à jour : mai 2026
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
