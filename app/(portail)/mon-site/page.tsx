'use client';

import { useEffect, useState } from 'react';
import { ImagePicker, type SanityImageRef } from './ImagePicker';
import { CollectionEditor, type CollectionFieldConfig } from './CollectionEditor';

const API = process.env.NEXT_PUBLIC_API_URL || '';

/* ─── Configuration par gabarit ──────────────────────────────
 * Les deux gabarits (vitrine, sante) réutilisent les mêmes noms de type de document
 * Sanity (pageAccueil, siteSettings, service, membre, faq...) mais avec des champs
 * différents — toute la UI est donc pilotée par ces tables, jamais câblée en dur pour
 * un seul gabarit. Miroir de MON_SITE_PAGE_FIELDS / MON_SITE_COLLECTION_FIELDS (app.py).
 */
interface FlatFieldConfig { key: string; label: string; textarea?: boolean; type?: string; image?: boolean }
interface FlatPageConfig { key: string; label: string; endpoint: string; fields: FlatFieldConfig[] }
interface CollectionConfig { title: string; titleField: string; fields: CollectionFieldConfig[] }

const FLAT_PAGES_BY_TEMPLATE: Record<string, FlatPageConfig[]> = {
  vitrine: [
    { key: 'accueil', label: 'Accueil', endpoint: 'pageAccueil', fields: [
      { key: 'heroEyebrow', label: 'Étiquette (hero)' },
      { key: 'heroTitre', label: 'Titre principal' },
      { key: 'heroSousTitre', label: 'Sous-titre', textarea: true },
      { key: 'servicesEyebrow', label: 'Étiquette — section services' },
      { key: 'servicesTitre', label: 'Titre — section services' },
      { key: 'equipeTitle', label: 'Titre — aperçu équipe' },
      { key: 'faqTitle', label: 'Étiquette — FAQ' },
      { key: 'ctaTitre', label: 'CTA final — titre' },
      { key: 'ctaSousTitre', label: 'CTA final — sous-titre', textarea: true },
    ] },
    { key: 'services', label: 'Page Services', endpoint: 'pageServices', fields: [
      { key: 'heroEyebrow', label: 'Étiquette (hero)' },
      { key: 'heroTitre', label: 'Titre principal' },
      { key: 'heroSousTitre', label: 'Sous-titre', textarea: true },
      { key: 'ctaTitre', label: 'CTA final — titre' },
    ] },
    { key: 'equipe', label: 'Équipe / À propos', endpoint: 'pageEquipe', fields: [
      { key: 'heroEyebrow', label: 'Étiquette (hero)' },
      { key: 'heroTitre', label: 'Titre principal' },
      { key: 'heroSousTitre', label: 'Sous-titre', textarea: true },
      { key: 'missionTexte', label: 'Mission', textarea: true },
      { key: 'visionTexte', label: 'Vision', textarea: true },
      { key: 'valeursTexte', label: 'Valeurs', textarea: true },
      { key: 'ctaTitre', label: 'CTA final — titre' },
    ] },
    { key: 'contact', label: 'Contact', endpoint: 'pageContact', fields: [
      { key: 'heroTitre', label: 'Titre principal' },
      { key: 'heroSousTitre', label: 'Sous-titre', textarea: true },
    ] },
    { key: 'coordonnees', label: 'Coordonnées', endpoint: 'siteSettings', fields: [
      { key: 'adresse', label: 'Adresse' },
      { key: 'telephone', label: 'Téléphone', type: 'tel' },
      { key: 'courriel', label: 'Courriel', type: 'email' },
      { key: 'instagram', label: 'Instagram', type: 'url' },
      { key: 'facebook', label: 'Facebook', type: 'url' },
      { key: 'linkedin', label: 'LinkedIn', type: 'url' },
    ] },
  ],
  sante: [
    { key: 'accueil', label: 'Accueil', endpoint: 'pageAccueil', fields: [
      { key: 'heroEyebrow', label: 'Étiquette (hero)' },
      { key: 'heroTitre', label: 'Titre principal (1re ligne)' },
      { key: 'heroTitre2', label: 'Titre principal (2e ligne)' },
      { key: 'heroSousTitre', label: 'Sous-titre', textarea: true },
      { key: 'traitementEyebrow', label: 'Étiquette — section traitement' },
      { key: 'traitementTitre', label: 'Titre — section traitement' },
      { key: 'traitementTexte1', label: 'Paragraphe 1 — traitement', textarea: true },
      { key: 'traitementTexte2', label: 'Paragraphe 2 — traitement', textarea: true },
      { key: 'traitementTexte3', label: 'Paragraphe 3 — traitement', textarea: true },
      { key: 'servicesEyebrow', label: 'Étiquette — section services' },
      { key: 'servicesTitre', label: 'Titre — section services' },
      { key: 'approcheTitre', label: 'Titre — section approche' },
      { key: 'approcheTexte1', label: 'Paragraphe 1 — approche', textarea: true },
      { key: 'approcheTexte2', label: 'Paragraphe 2 — approche', textarea: true },
      { key: 'approcheImage', label: 'Image — section approche', image: true },
      { key: 'faqEyebrow', label: 'Étiquette — section FAQ' },
      { key: 'faqTitre', label: 'Titre — section FAQ' },
      { key: 'faqTexte', label: "Texte d'intro — section FAQ", textarea: true },
    ] },
    { key: 'apropos', label: 'À propos', endpoint: 'pageAPropos', fields: [
      { key: 'heroTitre', label: 'Titre principal' },
      { key: 'heroSousTitre', label: 'Sous-titre', textarea: true },
      { key: 'bioImage', label: 'Image — biographie', image: true },
      { key: 'bioTexte1', label: 'Paragraphe 1 — biographie', textarea: true },
      { key: 'bioTexte2', label: 'Paragraphe 2 — biographie', textarea: true },
      { key: 'missionTexte', label: 'Texte — mission', textarea: true },
      { key: 'formationTitre', label: 'Titre — formations' },
      { key: 'formationTexte1', label: 'Texte — formations', textarea: true },
    ] },
    { key: 'contact', label: 'Contact', endpoint: 'pageContact', fields: [
      { key: 'heroTitre', label: 'Titre principal' },
      { key: 'heroSousTitre', label: 'Sous-titre', textarea: true },
    ] },
    { key: 'coordonnees', label: 'Coordonnées', endpoint: 'siteSettings', fields: [
      { key: 'adresse', label: 'Adresse' },
      { key: 'telephone', label: 'Téléphone', type: 'tel' },
      { key: 'cellulaire', label: 'Cellulaire', type: 'tel' },
      { key: 'courriel', label: 'Courriel', type: 'email' },
      { key: 'instagram', label: 'Instagram', type: 'url' },
      { key: 'facebook', label: 'Facebook', type: 'url' },
      { key: 'linkedin', label: 'LinkedIn', type: 'url' },
      { key: 'assurances', label: 'Assurances acceptées' },
    ] },
  ],
};

const COLLECTIONS_BY_TEMPLATE: Record<string, Record<string, CollectionConfig>> = {
  vitrine: {
    service: { title: 'Services', titleField: 'titre', fields: [
      { key: 'numero', label: 'Numéro (ex: 01)', kind: 'text' },
      { key: 'eyebrow', label: 'Étiquette (ex: Consultation, Traitement)', kind: 'text' },
      { key: 'titre', label: 'Titre', kind: 'text' },
      { key: 'description', label: 'Description', kind: 'textarea' },
      { key: 'image', label: 'Image', kind: 'image' },
      { key: 'inclus', label: 'Ce qui est inclus', kind: 'list' },
      { key: 'variations', label: 'Formules et tarifs', kind: 'repeater', subFields: [
        { key: 'nom', label: 'Nom de la formule', kind: 'text' },
        { key: 'duree', label: 'Durée (ex: 45 min)', kind: 'text' },
        { key: 'prix', label: 'Prix (ex: 60 $)', kind: 'text' },
        { key: 'detail', label: 'Description courte', kind: 'textarea' },
        { key: 'vedette', label: 'Formule populaire', kind: 'boolean' },
      ] },
      { key: 'featured', label: "En vedette sur l'accueil", kind: 'boolean' },
    ] },
    membre: { title: 'Équipe', titleField: 'prenom', fields: [
      { key: 'prenom', label: 'Prénom', kind: 'text' },
      { key: 'nom', label: 'Nom', kind: 'text' },
      { key: 'titre', label: 'Titre / Rôle', kind: 'text' },
      { key: 'photo', label: 'Photo', kind: 'image' },
      { key: 'bio', label: 'Biographie courte', kind: 'textarea' },
      { key: 'histoire', label: 'Histoire complète', kind: 'textarea' },
      { key: 'visible', label: 'Visible sur le site', kind: 'boolean' },
    ] },
    faq: { title: 'Questions fréquentes', titleField: 'question', fields: [
      { key: 'question', label: 'Question', kind: 'text' },
      { key: 'reponse', label: 'Réponse', kind: 'textarea' },
    ] },
  },
  sante: {
    service: { title: 'Services', titleField: 'titre', fields: [
      { key: 'numero', label: 'Numéro (ex: 01)', kind: 'text' },
      { key: 'eyebrow', label: 'Étiquette (ex: Consultation, Traitement)', kind: 'text' },
      { key: 'titre', label: 'Titre', kind: 'text' },
      { key: 'description', label: 'Description', kind: 'textarea' },
      { key: 'image', label: 'Image', kind: 'image' },
      { key: 'inclus', label: 'Ce qui est inclus', kind: 'list' },
      { key: 'variations', label: 'Formules et tarifs', kind: 'repeater', subFields: [
        { key: 'nom', label: 'Nom de la formule', kind: 'text' },
        { key: 'duree', label: 'Durée (ex: 15 min)', kind: 'text' },
        { key: 'prix', label: 'Prix (ex: 60 $)', kind: 'text' },
        { key: 'detail', label: 'Description courte', kind: 'textarea' },
        { key: 'vedette', label: 'Formule populaire', kind: 'boolean' },
      ] },
      { key: 'requiresRx', label: 'Prescription médicale obligatoire', kind: 'boolean' },
      { key: 'featured', label: "En vedette sur l'accueil", kind: 'boolean' },
    ] },
    membre: { title: 'Équipe', titleField: 'prenom', fields: [
      { key: 'prenom', label: 'Prénom', kind: 'text' },
      { key: 'nom', label: 'Nom', kind: 'text' },
      { key: 'titre', label: 'Titre / Spécialité', kind: 'text' },
      { key: 'photo', label: 'Photo', kind: 'image' },
      { key: 'bio', label: 'Biographie courte', kind: 'textarea' },
      { key: 'ordreProf', label: 'N° membre ordre professionnel', kind: 'text' },
      { key: 'langues', label: 'Langues parlées', kind: 'tags' },
      { key: 'visible', label: 'Visible sur le site', kind: 'boolean' },
    ] },
    faq: { title: 'FAQ', titleField: 'question', fields: [
      { key: 'question', label: 'Question', kind: 'text' },
      { key: 'reponse', label: 'Réponse', kind: 'textarea' },
      { key: 'visible', label: 'Visible sur le site', kind: 'boolean' },
    ] },
    temoignage: { title: 'Témoignages', titleField: 'nom', fields: [
      { key: 'nom', label: 'Prénom du patient', kind: 'text' },
      { key: 'texte', label: 'Témoignage', kind: 'textarea' },
      { key: 'service', label: 'Service consulté', kind: 'text' },
      { key: 'note', label: 'Note (1–5)', kind: 'number' },
      { key: 'visible', label: 'Visible sur le site', kind: 'boolean' },
    ] },
    statistique: { title: 'Statistiques', titleField: 'stat', fields: [
      { key: 'stat', label: 'Chiffre (ex: 75 % à 98 %)', kind: 'text' },
      { key: 'texte', label: 'Description', kind: 'textarea' },
      { key: 'source', label: 'Source', kind: 'text' },
    ] },
    reference: { title: 'Références', titleField: 'texte', fields: [
      { key: 'texte', label: 'Citation complète', kind: 'textarea' },
    ] },
  },
};

type SaveMessage = { ok: boolean; text: string } | null;
type PageData = Record<string, unknown>;

const inputStyle: React.CSSProperties = {
  flex: 1, fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
  color: 'var(--color-light-text)', background: 'transparent', border: 'none',
  outline: 'none', resize: 'none', width: '100%', padding: 0,
};

function Field({
  label, value, onChange, textarea = false, type = 'text',
}: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; type?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      <label style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-light-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      <div style={{
        display: 'flex', alignItems: textarea ? 'flex-start' : 'center',
        padding: 'var(--space-3) var(--space-4)', background: 'var(--color-light-0)',
        borderRadius: 'var(--radius-md)', border: '1px solid var(--color-light-border)',
        minHeight: textarea ? '80px' : '44px',
      }}>
        {textarea ? (
          <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} style={{ ...inputStyle, paddingTop: 'var(--space-1)' }} />
        ) : (
          <input type={type} value={value} onChange={e => onChange(e.target.value)} style={inputStyle} />
        )}
      </div>
    </div>
  );
}

function SaveBar({ saving, message, onSave }: { saving: boolean; message: SaveMessage; onSave: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
      {message && (
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 600,
          color: message.ok ? 'var(--color-success)' : 'var(--color-error)',
          display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
        }}>
          <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            {message.ok ? 'check_circle' : 'error'}
          </span>
          {message.text}
        </span>
      )}
      <button
        onClick={onSave}
        disabled={saving}
        style={{
          padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-full)', border: 'none',
          minHeight: '44px', cursor: saving ? 'default' : 'pointer',
          background: 'var(--color-brand)', color: 'white',
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 800,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? (
          <>
            <span aria-hidden="true" className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
            Enregistrement…
          </>
        ) : 'Enregistrer'}
      </button>
    </div>
  );
}

export default function MonSitePage() {
  const [loading, setLoading] = useState(true);
  const [noSite, setNoSite] = useState(false);
  const [sites, setSites] = useState<{ id: number; business_name: string; slug: string; template: string }[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [template, setTemplate] = useState<string>('');
  const [sanityProjectId, setSanityProjectId] = useState('');
  const [collections, setCollections] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');

  const [pageData, setPageData] = useState<Record<string, PageData>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<Record<string, SaveMessage>>({});

  const flatPages = FLAT_PAGES_BY_TEMPLATE[template] || [];
  const collectionConfigs = COLLECTIONS_BY_TEMPLATE[template] || {};

  async function loadSiteContent(siteId: number) {
    setLoading(true);
    try {
      const infoRes = await fetch(`${API}/api/v1/mon-site/info?site_id=${siteId}`, { credentials: 'include' });
      if (!infoRes.ok) { setNoSite(true); setLoading(false); return; }
      const info = await infoRes.json();
      setTemplate(info.template);
      setSanityProjectId(info.sanity_project_id);
      setCollections(info.collections || []);

      const pages: FlatPageConfig[] = FLAT_PAGES_BY_TEMPLATE[info.template] || [];
      setActiveTab(pages[0]?.key || (info.collections?.[0] ?? ''));

      const results = await Promise.all(
        pages.map(p => fetch(`${API}/api/v1/mon-site/contenu/${p.endpoint}?site_id=${siteId}`, { credentials: 'include' }).then(r => r.ok ? r.json() : {}))
      );
      setPageData(Object.fromEntries(pages.map((p, i) => [p.key, results[i] || {}])));
    } catch {
      setNoSite(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const sitesRes = await fetch(`${API}/api/v1/mon-site/sites`, { credentials: 'include' });
        if (!sitesRes.ok) { setNoSite(true); setLoading(false); return; }
        const siteList = await sitesRes.json();
        if (!siteList.length) { setNoSite(true); setLoading(false); return; }
        setSites(siteList);
        setSelectedSiteId(siteList[0].id);
        await loadSiteContent(siteList[0].id);
      } catch {
        setNoSite(true);
        setLoading(false);
      }
    }
    init();
  }, []);

  function switchSite(siteId: number) {
    setSelectedSiteId(siteId);
    loadSiteContent(siteId);
  }

  async function saveFlatPage(page: FlatPageConfig) {
    if (!selectedSiteId) return;
    setSaving(p => ({ ...p, [page.key]: true }));
    setMessages(p => ({ ...p, [page.key]: null }));
    try {
      const res = await fetch(`${API}/api/v1/mon-site/contenu/${page.endpoint}?site_id=${selectedSiteId}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData[page.key] || {}),
      });
      setMessages(p => ({ ...p, [page.key]: res.ok ? { ok: true, text: 'Enregistré.' } : { ok: false, text: "Erreur lors de l'enregistrement." } }));
      if (res.ok) setTimeout(() => setMessages(p => ({ ...p, [page.key]: null })), 3000);
    } catch {
      setMessages(p => ({ ...p, [page.key]: { ok: false, text: 'Erreur de connexion.' } }));
    } finally {
      setSaving(p => ({ ...p, [page.key]: false }));
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--color-dark-text-2)', letterSpacing: '0.1em' }}>CHARGEMENT...</div>
    </div>
  );

  if (noSite) return (
    <main style={{ maxWidth: '600px', margin: '0 auto', paddingTop: 'var(--space-12)', paddingLeft: '1.5rem', paddingRight: '1.5rem', textAlign: 'center' }}>
      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-dark-text-2)' }}>web_asset_off</span>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '36px',
        lineHeight: 1, letterSpacing: '-0.03em',
        color: 'var(--color-light-text)', marginTop: 'var(--space-4)',
      }}>
        Aucun site pour l&apos;instant
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)', marginTop: 'var(--space-2)' }}>
        Votre site web n&apos;a pas encore été créé. Contactez votre gestionnaire de compte pour démarrer ce projet.
      </p>
    </main>
  );

  const allTabs = [
    ...flatPages.map(p => ({ key: p.key, label: p.label })),
    ...collections.map(c => ({ key: c, label: collectionConfigs[c]?.title || c })),
  ];

  const activeFlatPage = flatPages.find(p => p.key === activeTab);
  const activeCollection = collectionConfigs[activeTab];

  return (
    <main style={{ maxWidth: '760px', margin: '0 auto', paddingTop: 'var(--space-12)', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>

      <header style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '36px',
          lineHeight: 1, letterSpacing: '-0.03em',
          color: 'var(--color-light-text)', marginBottom: 'var(--space-2)',
        }}>
          Mon site
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-dark-text-2)' }}>
          Modifiez le contenu de votre site web. Les changements sont visibles après quelques instants.
        </p>
      </header>

      {sites.length > 1 && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-light-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
            Site à modifier
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {sites.map(s => (
              <button
                key={s.id}
                onClick={() => switchSite(s.id)}
                style={{
                  padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-full)',
                  border: `1px solid ${selectedSiteId === s.id ? 'var(--color-brand)' : 'var(--color-light-border)'}`,
                  cursor: 'pointer', background: selectedSiteId === s.id ? 'var(--color-brand)' : 'var(--color-light-2)',
                  color: selectedSiteId === s.id ? 'white' : 'var(--color-light-text)',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 700,
                }}
              >
                {s.business_name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{
        display: 'flex', gap: 'var(--space-2)', padding: 'var(--space-4) var(--space-5)',
        background: 'var(--color-light-2)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        border: '1px solid var(--color-light-border)', borderBottom: 'none', flexWrap: 'wrap',
      }}>
        {allTabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)', border: 'none',
              cursor: 'pointer', minHeight: '36px',
              background: activeTab === t.key ? 'var(--color-brand)' : 'transparent',
              color: activeTab === t.key ? 'white' : 'var(--color-light-text-3)',
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeFlatPage && (
        <section style={{
          background: 'var(--color-light-2)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
          border: '1px solid var(--color-light-border)', padding: 'var(--space-6)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
        }}>
          {activeFlatPage.fields.map(f => f.image ? (
            <ImagePicker
              key={f.key}
              label={f.label}
              projectId={sanityProjectId}
              siteId={selectedSiteId as number}
              value={pageData[activeFlatPage.key]?.[f.key] as SanityImageRef | undefined}
              onChange={v => setPageData(p => ({ ...p, [activeFlatPage.key]: { ...p[activeFlatPage.key], [f.key]: v } }))}
            />
          ) : (
            <Field
              key={f.key}
              label={f.label}
              type={f.type}
              textarea={f.textarea}
              value={(pageData[activeFlatPage.key]?.[f.key] as string) || ''}
              onChange={v => setPageData(p => ({ ...p, [activeFlatPage.key]: { ...p[activeFlatPage.key], [f.key]: v } }))}
            />
          ))}
          <SaveBar
            saving={Boolean(saving[activeFlatPage.key])}
            message={messages[activeFlatPage.key] || null}
            onSave={() => saveFlatPage(activeFlatPage)}
          />
        </section>
      )}

      {activeCollection && (
        <CollectionEditor
          docType={activeTab}
          title={activeCollection.title}
          fields={activeCollection.fields}
          titleField={activeCollection.titleField}
          sanityProjectId={sanityProjectId}
          siteId={selectedSiteId as number}
        />
      )}

    </main>
  );
}
