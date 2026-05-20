/* global React, ReactDOM, CoverPage, TocPage, DividerPage, ContentPage, BioPage, ServicesPage, PricelistPage, TimelinePage, MetricsPage, ClosingPage, DEFAULT_DOC, PIGISTE_DOC, TEMPLATES, FORM_REGISTRY */
const { useState, useEffect, useRef, useMemo } = React;

// ============== STYLE CONSTANTS ==============
const FONT_COMBOS = [
  { id: 'cocktail',  label: 'Cocktail Média (défaut)',       display: 'Bebas Neue',       heading: 'Poppins',          body: 'Montserrat',   url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@300;400;500;600;700;800;900&family=Montserrat:wght@300;400;500;600;700;800&display=swap' },
  { id: 'elegant',  label: 'Élégant — Playfair + Lato',     display: 'Playfair Display', heading: 'Playfair Display', body: 'Lato',         url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;0,900;1,400&family=Lato:wght@300;400;700&display=swap' },
  { id: 'moderne',  label: 'Moderne — Oswald + Inter',      display: 'Oswald',           heading: 'Oswald',           body: 'Inter',        url: 'https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap' },
  { id: 'tech',     label: 'Tech — Space Grotesk + DM Sans',display: 'Space Grotesk',    heading: 'Space Grotesk',    body: 'DM Sans',      url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap' },
  { id: 'editorial',label: 'Éditorial — DM Serif + DM Sans',display: 'DM Serif Display', heading: 'DM Serif Display', body: 'DM Sans',      url: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap' },
  { id: 'classic',  label: 'Classique — Raleway + Open Sans',display: 'Raleway',         heading: 'Raleway',          body: 'Open Sans',    url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600;700;800;900&family=Open+Sans:wght@300;400;600;700&display=swap' },
];

const PALETTES = [
  { id: 'cocktail', label: 'Cocktail Média',  dark: '#2B2B2B', accent: '#E83B14', cream: '#EFE9DC' },
  { id: 'ocean',    label: 'Océan profond',   dark: '#0A2540', accent: '#0E7EC4', cream: '#EFF6FF' },
  { id: 'forest',   label: 'Forêt',           dark: '#1A3A2A', accent: '#2D7A47', cream: '#F0F7F2' },
  { id: 'luxe',     label: 'Luxe doré',       dark: '#1C1510', accent: '#C89B3C', cream: '#FDF8EF' },
  { id: 'violet',   label: 'Violet nuit',     dark: '#1E0A3C', accent: '#7C3AED', cream: '#F5F0FF' },
  { id: 'slate',    label: 'Ardoise bleue',   dark: '#1E2A3A', accent: '#3B82F6', cream: '#F0F4F8' },
  { id: 'rose',     label: 'Bordeaux',        dark: '#2A0E1A', accent: '#BE185D', cream: '#FFF0F5' },
  { id: 'carbon',   label: 'Carbon',          dark: '#111111', accent: '#E0E0E0', cream: '#F5F5F5' },
];

const TITLE_FONTS = [
  { value: '',                  label: 'Défaut (combo global)' },
  { value: 'Bebas Neue',        label: 'Bebas Neue — Condensé impact' },
  { value: 'Oswald',            label: 'Oswald — Condensé' },
  { value: 'Montserrat',        label: 'Montserrat — Géométrique' },
  { value: 'Poppins',           label: 'Poppins — Rond moderne' },
  { value: 'Raleway',           label: 'Raleway — Élégant fin' },
  { value: 'Playfair Display',  label: 'Playfair Display — Serif élégant' },
  { value: 'DM Serif Display',  label: 'DM Serif Display — Serif éditorial' },
  { value: 'Space Grotesk',     label: 'Space Grotesk — Tech' },
  { value: 'DM Sans',           label: 'DM Sans — Neutre moderne' },
  { value: 'Inter',             label: 'Inter — Lisible' },
  { value: 'Lato',              label: 'Lato — Humaniste' },
  { value: 'Open Sans',         label: 'Open Sans — Classique web' },
];

function darkenHex(hex, pct) {
  const n = parseInt((hex || '#000').replace('#', ''), 16);
  if (isNaN(n)) return hex;
  const f = 1 - pct / 100;
  const r = Math.max(0, Math.round(((n >> 16) & 255) * f));
  const g = Math.max(0, Math.round(((n >> 8) & 255) * f));
  const b = Math.max(0, Math.round((n & 255) * f));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// ============== APP ==============
function App() {
  const [allowedPdf, setAllowedPdf] = useState(null); // null = tous les templates visibles

  // Charger la config d'accès dès le montage
  useEffect(() => {
    fetch('/api/v1/tools/config', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(cfg => { if (cfg && cfg.pdf) setAllowedPdf(cfg.pdf); })
      .catch(() => {});
  }, []);

  // Templates disponibles selon les droits
  const availableTemplates = allowedPdf
    ? Object.fromEntries(Object.entries(TEMPLATES).filter(([k]) => allowedPdf.includes(k)))
    : TEMPLATES;

  const firstTemplateId = Object.keys(availableTemplates)[0] || 'business';

  const [templateId, setTemplateId] = useState('business');
  const [doc, setDoc] = useState(() => TEMPLATES.business.defaultDoc());
  const [variant, setVariant] = useState('default');
  const [mode, setMode] = useState('preview');
  const [currentDocId, setCurrentDocId] = useState(null);
  const [zoom, setZoom] = useState(0.7);
  const [style, setStyle] = useState({
    template:    'bold',
    palette:     'cocktail',
    colorDark:   '#2B2B2B',
    colorAccent: '#E83B14',
    colorLight:  '#EFE9DC',
    fontCombo:   'cocktail',
    capsLock:    false,
    website:     'COCKTAILMEDIA.CA',
    companyName: 'COCKTAIL\nMÉDIA',
  });
  const logoSrc = 'assets/logo-cocktail-media.png';

  // Si le template actif n'est plus dans les droits, passer au premier disponible
  useEffect(() => {
    if (allowedPdf && !allowedPdf.includes(templateId)) {
      const first = Object.keys(availableTemplates)[0];
      if (first) { setTemplateId(first); setDoc(availableTemplates[first].defaultDoc()); }
    }
  }, [allowedPdf]);

  const template = availableTemplates[templateId] || availableTemplates[firstTemplateId];

  // Apply CSS vars + theme class whenever style changes
  // On utilise une balise <style> dans <head> plutôt que element.style.setProperty
  // afin que les variables soient incluses dans le rendu print du navigateur.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('layout-clean', 'layout-sombre');
    if (style.template === 'clean')  root.classList.add('layout-clean');
    if (style.template === 'sombre') root.classList.add('layout-sombre');

    const combo = FONT_COMBOS.find(c => c.id === style.fontCombo) || FONT_COMBOS[0];

    let tag = document.getElementById('cm-theme-vars');
    if (!tag) {
      tag = document.createElement('style');
      tag.id = 'cm-theme-vars';
      document.head.appendChild(tag);
    }
    tag.textContent = `:root {
  --cm-black:       ${style.colorDark};
  --cm-orange:      ${style.colorAccent};
  --cm-orange-deep: ${darkenHex(style.colorAccent, 20)};
  --cm-cream:       ${style.colorLight};
  --cm-cream-dim:   ${darkenHex(style.colorLight, 12)};
  --cm-caps:        ${style.capsLock ? 'uppercase' : 'none'};
  --cm-font-display:'${combo.display}', 'Helvetica Neue', sans-serif;
  --cm-font-heading:'${combo.heading}', 'Helvetica Neue', sans-serif;
  --cm-font-body:   '${combo.body}', 'Helvetica Neue', sans-serif;
}`;

    let link = document.getElementById('cm-gfont');
    if (!link) {
      link = document.createElement('link');
      link.id = 'cm-gfont';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = combo.url;
  }, [style.template, style.colorDark, style.colorAccent, style.colorLight, style.capsLock, style.fontCombo]);

  // Switch template — load its default doc
  const switchTemplate = (id) => {
    if (id === templateId) return;
    if (!confirm('Changer de gabarit remplacera le contenu actuel par le contenu par défaut du nouveau gabarit. Continuer ?')) return;
    setTemplateId(id);
    setDoc(TEMPLATES[id].defaultDoc());
  };

  const updatePath = (path, value) => {
    setDoc(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (cur[keys[i]] == null) cur[keys[i]] = {};
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handlePrint = () => { setMode('preview'); setTimeout(() => window.print(), 400); };

  const branding = { website: style.website, companyName: style.companyName };
  const pages = useMemo(
    () => template.buildPages(doc, variant, logoSrc, branding),
    [doc, variant, templateId, style.website, style.companyName]
  );

  // CSS custom properties injectées en inline style sur le conteneur des pages.
  // C'est la seule méthode garantie d'être incluse dans le rendu print de Chrome/Edge/Safari.
  const combo = FONT_COMBOS.find(c => c.id === style.fontCombo) || FONT_COMBOS[0];
  const themeVars = {
    '--cm-black':       style.colorDark,
    '--cm-orange':      style.colorAccent,
    '--cm-orange-deep': darkenHex(style.colorAccent, 20),
    '--cm-cream':       style.colorLight,
    '--cm-cream-dim':   darkenHex(style.colorLight, 12),
    '--cm-caps':        style.capsLock ? 'uppercase' : 'none',
    '--cm-font-display':`'${combo.display}', 'Helvetica Neue', sans-serif`,
    '--cm-font-heading':`'${combo.heading}', 'Helvetica Neue', sans-serif`,
    '--cm-font-body':   `'${combo.body}', 'Helvetica Neue', sans-serif`,
  };

  return (
    <div className="cm-app">
      <Toolbar
        mode={mode} setMode={setMode}
        variant={variant} setVariant={setVariant}
        zoom={zoom} setZoom={setZoom}
        templateId={templateId} switchTemplate={switchTemplate}
        onPrint={handlePrint}
        currentDocId={currentDocId}
        availableTemplates={availableTemplates}
      />
      <div className="cm-app-body">
        {mode === 'style' && <StylePanel style={style} setStyle={setStyle} />}
        {mode === 'form' && <FormPanel doc={doc} updatePath={updatePath} setDoc={setDoc} template={template} />}
        {mode === 'docs' && <DocumentsPanel
          doc={doc} setDoc={setDoc}
          templateId={templateId} setTemplateId={setTemplateId}
          variant={variant} setVariant={setVariant}
          style={style} setStyle={setStyle}
          currentDocId={currentDocId} setCurrentDocId={setCurrentDocId}
        />}
        <div className="cm-canvas-wrap">
          <div className={`cm-canvas ${mode === 'live' ? 'cm-canvas-live' : ''}`}>
            <div className="cm-pages-stack" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', ...themeVars }}>
              {pages.map((page, i) => (
                <div key={i} className={`cm-page-wrap${mode === 'live' ? ' cm-live-page' : ''}`}>
                  {mode === 'live' ? <LiveWrapper>{page}</LiveWrapper> : page}
                </div>
              ))}
            </div>
          </div>
          <div className="cm-canvas-hud">
            <span className="cm-chud-cell">{pages.length} page{pages.length !== 1 ? 's' : ''}</span>
            <span className="cm-chud-div" />
            <button className="cm-chud-btn" onClick={() => setZoom(z => Math.max(0.3, Math.round((z - 0.05) * 20) / 20))}>−</button>
            <span className="cm-chud-zoom">{Math.round(zoom * 100)}%</span>
            <button className="cm-chud-btn" onClick={() => setZoom(z => Math.min(1.5, Math.round((z + 0.05) * 20) / 20))}>+</button>
            <span className="cm-chud-div" />
            <button className="cm-chud-btn cm-chud-fit" onClick={() => setZoom(0.7)}>Ajuster</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== TOOLBAR ==============
function Toolbar({ mode, setMode, variant, setVariant, zoom, setZoom, templateId, switchTemplate, onPrint, currentDocId, availableTemplates }) {
  return (
    <div className="cm-toolbar">
      <div className="cm-tb-brand">
        <div>
          <div className="cm-tb-brand-title">Générateur de documents</div>
          <div className="cm-tb-brand-sub">Cocktail Média</div>
        </div>
      </div>

      <div className="cm-tb-center">
        <div className="cm-tb-template">
          <span className="cm-tb-template-label">Gabarit</span>
          <select className="cm-tb-select cm-tb-template-select" value={templateId} onChange={e => switchTemplate(e.target.value)}>
            {Object.values(availableTemplates).map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="cm-tb-sep" />
        <div className="cm-tb-modes">
          {[
            { k: 'preview', l: 'Aperçu' },
            { k: 'form',    l: 'Formulaire' },
            { k: 'live',    l: 'Édition live' },
            { k: 'style',   l: 'Style' },
            { k: 'docs',    l: 'Documents' },
          ].map(m => (
            <button key={m.k} className={`cm-tb-mode ${mode === m.k ? 'active' : ''}`} onClick={() => setMode(m.k)}>{m.l}</button>
          ))}
        </div>
      </div>

      <div className="cm-tb-right">
        <label className="cm-tb-zoom">
          <span>Zoom</span>
          <input type="range" min="0.4" max="1.2" step="0.05" value={zoom} onChange={e => setZoom(+e.target.value)} />
          <span className="cm-tb-zoom-val">{Math.round(zoom * 100)}%</span>
        </label>
        <select className="cm-tb-select" value={variant} onChange={e => setVariant(e.target.value)}>
          <option value="default">Classique</option>
          <option value="editorial">Éditoriale</option>
          <option value="bold">Bold</option>
        </select>
        <button className="cm-tb-export" onClick={onPrint}>↓ &nbsp;Exporter PDF</button>
      </div>
    </div>
  );
}

// ============== FORM PANEL (dynamic per template) ==============
function FormPanel({ doc, updatePath, setDoc, template }) {
  const [open, setOpen] = useState({ meta: true });
  const toggle = k => setOpen(prev => ({ ...prev, [k]: !prev[k] }));

  return (
    <div className="cm-form-panel">
      <div className="cm-form-header">
        <h2>Remplir le document</h2>
        <p>Gabarit actif : <strong>{template.label}</strong></p>
        <p className="cm-form-tip">Astuce : entourez un mot de <code>**doubles astérisques**</code> pour le mettre en orange.</p>
      </div>

      {template.formSections.map(key => {
        const reg = FORM_REGISTRY[key];
        if (!reg) return null;
        return (
          <Section key={key} title={reg.title} open={!!open[key]} onToggle={() => toggle(key)}>
            {renderFormFor(key, reg, doc, updatePath)}
          </Section>
        );
      })}
    </div>
  );
}

function renderFormFor(key, reg, doc, updatePath) {
  const node = doc[key] || {};
  switch (reg.kind) {
    case 'meta':
      return <>
        <Field label="Année" value={doc.meta?.year} onChange={v => updatePath('meta.year', v)} />
        <Field label="Type de document" value={doc.meta?.docType} onChange={v => updatePath('meta.docType', v)} />
        <FieldArea label="Titre principal (\\n = saut de ligne)" value={doc.meta?.title} onChange={v => updatePath('meta.title', v)} rows={2} />
        <FieldSelect label="Police du titre de couverture" value={doc.meta?.titleFont || ''} onChange={v => updatePath('meta.titleFont', v)} options={TITLE_FONTS} />
        <Field label="Sous-titre de couverture" value={doc.meta?.subtitle} onChange={v => updatePath('meta.subtitle', v)} />
        <Field label="Tagline" value={doc.meta?.tagline} onChange={v => updatePath('meta.tagline', v)} />
        <Field label="Auteur" value={doc.meta?.author} onChange={v => updatePath('meta.author', v)} />
        <Field label="Date" value={doc.meta?.date} onChange={v => updatePath('meta.date', v)} />
        <FieldImageUpload label="Logo de couverture" value={doc.meta?.coverLogo || ''} onChange={v => updatePath('meta.coverLogo', v)} />
        <FieldSelect label="Forme décorative" value={doc.meta?.artStyle || 'angular'} onChange={v => updatePath('meta.artStyle', v)} options={[
          { value: 'angular',   label: 'Angulaire (défaut)' },
          { value: 'circle',    label: 'Cercle' },
          { value: 'diagonal',  label: 'Diagonale' },
          { value: 'minimal',   label: 'Minimaliste' },
          { value: 'aucune',    label: 'Aucune' },
        ]} />
        <FieldImageUpload label="Image de fond (couverture)" value={doc.meta?.coverBg || ''} onChange={v => updatePath('meta.coverBg', v)} />
      </>;
    case 'toc':
      return <ListEditor
        items={doc.toc || []}
        onChange={items => updatePath('toc', items)}
        template={{ label: 'Section', page: 4 }}
        fields={[
          { key: 'label', label: 'Libellé' },
          { key: 'page', label: 'Page' },
        ]}
      />;
    case 'content':
      return <>
        <Field label="Titre" value={node.title} onChange={v => updatePath(`${key}.title`, v)} />
        <Field label="Mot accentué (orange)" value={node.accent} onChange={v => updatePath(`${key}.accent`, v)} />
        <FieldSelect label="Police du titre" value={node.titleFont || ''} onChange={v => updatePath(`${key}.titleFont`, v)} options={TITLE_FONTS} />
        <Field label="Sous-titre" value={node.subtitle} onChange={v => updatePath(`${key}.subtitle`, v)} />
        <FieldArea label="Corps du texte (utilisez **gras**)" value={node.body} onChange={v => updatePath(`${key}.body`, v)} rows={8} />
      </>;
    case 'team':
      return <>
        <Field label="Titre de la page" value={node.title || 'notre'} onChange={v => updatePath(`${key}.title`, v)} />
        <Field label="Mot accentué (orange)" value={node.accent || 'équipe'} onChange={v => updatePath(`${key}.accent`, v)} />
        <FieldSelect label="Police du titre" value={node.titleFont || ''} onChange={v => updatePath(`${key}.titleFont`, v)} options={TITLE_FONTS} />
        <Field label="Nom" value={node.name} onChange={v => updatePath(`${key}.name`, v)} />
        <Field label="Rôle" value={node.role} onChange={v => updatePath(`${key}.role`, v)} />
        <FieldArea label="Bio" value={node.story} onChange={v => updatePath(`${key}.story`, v)} rows={6} />
      </>;
    case 'services':
      return <ListEditor
        items={doc[key] || []}
        onChange={items => updatePath(key, items)}
        template={{ category: 'CATÉGORIE', name: 'Nom', description: 'Description.' }}
        fields={[
          { key: 'category', label: 'Catégorie' },
          { key: 'name', label: 'Nom' },
          { key: 'description', label: 'Description', area: true },
        ]}
      />;
    case 'prices':
      return <PriceEditor sections={doc.prices || []} onChange={v => updatePath('prices', v)} />;
    case 'timeline':
      return <>
        <Field label="Titre" value={node.title} onChange={v => updatePath(`${key}.title`, v)} />
        <Field label="Mot accentué" value={node.accent} onChange={v => updatePath(`${key}.accent`, v)} />
        <FieldSelect label="Police du titre" value={node.titleFont || ''} onChange={v => updatePath(`${key}.titleFont`, v)} options={TITLE_FONTS} />
        <Field label="Sous-titre" value={node.subtitle} onChange={v => updatePath(`${key}.subtitle`, v)} />
        <ListEditor
          items={node.phases || []}
          onChange={items => updatePath(`${key}.phases`, items)}
          template={{ date: '0-3 MOIS', title: 'Étape', text: 'Description.' }}
          fields={[
            { key: 'date', label: 'Période' },
            { key: 'title', label: 'Titre' },
            { key: 'text', label: 'Description', area: true },
          ]}
        />
      </>;
    case 'finance':
      return <>
        <Field label="Titre" value={node.title} onChange={v => updatePath(`${key}.title`, v)} />
        <Field label="Mot accentué" value={node.accent} onChange={v => updatePath(`${key}.accent`, v)} />
        <FieldSelect label="Police du titre" value={node.titleFont || ''} onChange={v => updatePath(`${key}.titleFont`, v)} options={TITLE_FONTS} />
        <Field label="Sous-titre" value={node.subtitle} onChange={v => updatePath(`${key}.subtitle`, v)} />
        <ListEditor
          items={node.metrics || []}
          onChange={items => updatePath(`${key}.metrics`, items)}
          template={{ label: 'LABEL', value: '0 $' }}
          fields={[
            { key: 'label', label: 'Étiquette' },
            { key: 'value', label: 'Valeur' },
          ]}
        />
        <FieldArea label="Corps" value={node.body} onChange={v => updatePath(`${key}.body`, v)} rows={6} />
      </>;
    case 'closing':
      return <FieldArea label="Message de fermeture (utilisez **gras**)" value={doc.closing?.message} onChange={v => updatePath('closing.message', v)} rows={4} />;
    case 'divider': {
      const idx = reg.dividerIndex;
      const divider = (doc.dividers || [])[idx] || {};
      return <>
        <Field label="Titre" value={divider.title} onChange={v => updatePath(`dividers.${idx}.title`, v)} />
        <Field label="Mot accentué (orange)" value={divider.accent} onChange={v => updatePath(`dividers.${idx}.accent`, v)} />
        <FieldSelect label="Police du titre" value={divider.titleFont || ''} onChange={v => updatePath(`dividers.${idx}.titleFont`, v)} options={TITLE_FONTS} />
        <Field label="Sous-titre" value={divider.subtitle} onChange={v => updatePath(`dividers.${idx}.subtitle`, v)} />
      </>;
    }
    case 'pageHeader':
      return <>
        <Field label="Titre" value={node.title} onChange={v => updatePath(`${key}.title`, v)} />
        <Field label="Mot accentué (orange)" value={node.accent} onChange={v => updatePath(`${key}.accent`, v)} />
        <FieldSelect label="Police du titre" value={node.titleFont || ''} onChange={v => updatePath(`${key}.titleFont`, v)} options={TITLE_FONTS} />
        {reg.hasSubtitle && <Field label="Sous-titre" value={node.subtitle} onChange={v => updatePath(`${key}.subtitle`, v)} />}
      </>;
    default:
      return <p className="cm-form-tip">Section non supportée: {reg.kind}</p>;
  }
}

function Section({ title, open, onToggle, children }) {
  return (
    <div className={`cm-form-section ${open ? 'open' : ''}`}>
      <button className="cm-form-section-head" onClick={onToggle}>
        <span>{title}</span>
        <span className="cm-form-section-chev">›</span>
      </button>
      {open && <div className="cm-form-section-body">{children}</div>}
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="cm-field">
      <span className="cm-field-label">{label}</span>
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} />
    </label>
  );
}
function FieldArea({ label, value, onChange, rows = 4 }) {
  return (
    <label className="cm-field">
      <span className="cm-field-label">{label}</span>
      <textarea rows={rows} value={value || ''} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

function FieldSelect({ label, value, onChange, options = [] }) {
  return (
    <label className="cm-field">
      <span className="cm-field-label">{label}</span>
      <select value={value || ''} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function FieldToggle({ label, value, onChange }) {
  return (
    <div className="cm-field cm-field-toggle">
      <span className="cm-field-label">{label}</span>
      <button
        className={`cm-toggle-btn ${value ? 'on' : ''}`}
        onClick={() => onChange(!value)}
        type="button"
      >
        <span className="cm-toggle-knob" />
        <span className="cm-toggle-txt">{value ? 'Oui' : 'Non'}</span>
      </button>
    </div>
  );
}

function FieldImageUpload({ label, value, onChange }) {
  const inputRef = useRef(null);
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  return (
    <div className="cm-field cm-field-imgupload">
      <span className="cm-field-label">{label}</span>
      {value && (
        <div className="cm-imgupload-preview">
          <img src={value} alt="" />
        </div>
      )}
      <div className="cm-imgupload-actions">
        <button type="button" className="cm-imgupload-btn" onClick={() => inputRef.current?.click()}>
          {value ? 'Changer' : 'Choisir une image'}
        </button>
        {value && (
          <button type="button" className="cm-danger cm-imgupload-remove" onClick={() => onChange('')}>
            ✕ Retirer
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      </div>
    </div>
  );
}

function ListEditor({ items, onChange, template, fields }) {
  const update = (i, k, v) => {
    const next = [...items];
    next[i] = { ...next[i], [k]: v };
    onChange(next);
  };
  const add = () => onChange([...items, { ...template }]);
  const remove = i => onChange(items.filter((_, j) => j !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="cm-list-editor">
      {items.map((it, i) => (
        <div className="cm-list-item" key={i}>
          <div className="cm-list-item-head">
            <span>#{i + 1}</span>
            <div className="cm-list-actions">
              <button onClick={() => move(i, -1)} title="Monter">↑</button>
              <button onClick={() => move(i, +1)} title="Descendre">↓</button>
              <button onClick={() => remove(i)} title="Supprimer" className="cm-danger">✕</button>
            </div>
          </div>
          {fields.map(f => (
            f.area
              ? <FieldArea key={f.key} label={f.label} value={it[f.key]} onChange={v => update(i, f.key, v)} rows={2} />
              : <Field key={f.key} label={f.label} value={it[f.key]} onChange={v => update(i, f.key, v)} />
          ))}
        </div>
      ))}
      <button className="cm-list-add" onClick={add}>+ Ajouter</button>
    </div>
  );
}

function PriceEditor({ sections, onChange }) {
  const updateSection = (i, key, value) => {
    const next = [...sections];
    next[i] = { ...next[i], [key]: value };
    onChange(next);
  };
  const updateItem = (si, ii, key, value) => {
    const next = [...sections];
    const items = [...next[si].items];
    items[ii] = { ...items[ii], [key]: value };
    next[si] = { ...next[si], items };
    onChange(next);
  };
  const addItem = (si) => {
    const next = [...sections];
    next[si] = { ...next[si], items: [...(next[si].items || []), { name: 'Service', price: '0,00 $' }] };
    onChange(next);
  };
  const removeItem = (si, ii) => {
    const next = [...sections];
    next[si] = { ...next[si], items: next[si].items.filter((_, j) => j !== ii) };
    onChange(next);
  };
  const addSection = () => onChange([...sections, { category: 'Nouvelle catégorie', subtitle: 'sous-titre', items: [{ name: 'Service', price: '0,00 $' }] }]);
  const removeSection = (i) => onChange(sections.filter((_, j) => j !== i));

  return (
    <div className="cm-price-editor">
      {sections.map((sec, si) => (
        <div className="cm-list-item" key={si}>
          <div className="cm-list-item-head">
            <span>{sec.category}</span>
            <button onClick={() => removeSection(si)} className="cm-danger">✕</button>
          </div>
          <Field label="Catégorie" value={sec.category} onChange={v => updateSection(si, 'category', v)} />
          <Field label="Sous-titre" value={sec.subtitle} onChange={v => updateSection(si, 'subtitle', v)} />
          <Field label="Note (optionnel)" value={sec.note || ''} onChange={v => updateSection(si, 'note', v)} />
          <div className="cm-price-items">
            {(sec.items || []).map((it, ii) => (
              <div className="cm-price-item-row" key={ii}>
                <input value={it.name} onChange={e => updateItem(si, ii, 'name', e.target.value)} placeholder="Service" />
                <input value={it.price} onChange={e => updateItem(si, ii, 'price', e.target.value)} placeholder="Prix" />
                <button onClick={() => removeItem(si, ii)} className="cm-danger">✕</button>
              </div>
            ))}
            <button className="cm-list-add cm-small" onClick={() => addItem(si)}>+ Ligne</button>
          </div>
        </div>
      ))}
      <button className="cm-list-add" onClick={addSection}>+ Nouvelle catégorie</button>
    </div>
  );
}

// ============== DOCUMENTS PANEL ==============
function DocumentsPanel({ doc, setDoc, templateId, setTemplateId, variant, setVariant, style, setStyle, currentDocId, setCurrentDocId }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch('/api/v1/documents', { credentials: 'include' });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErr(d.error || `Erreur ${res.status} — vérifiez que vous êtes connecté.`);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setDocs(data.documents || []);
    } catch { setErr('Erreur de connexion au serveur.'); }
    setLoading(false);
  };

  const saveDoc = async () => {
    const name = saveName.trim();
    if (!name) return;
    setSaving(true);
    setErr('');
    const payload = { name, templateId, variant, style, doc };
    try {
      let res;
      if (currentDocId) {
        res = await fetch(`/api/v1/documents/${currentDocId}`, {
          method: 'PUT', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setErr(d.error || `Erreur ${res.status} lors de la mise à jour.`);
          setSaving(false);
          return;
        }
      } else {
        res = await fetch('/api/v1/documents', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setErr(d.error || `Erreur ${res.status} lors de la sauvegarde.`);
          setSaving(false);
          return;
        }
        const data = await res.json();
        if (data.id) setCurrentDocId(data.id);
      }
      await fetchDocs();
    } catch (e) { setErr(`Erreur réseau : ${e.message}`); }
    setSaving(false);
  };

  const loadDoc = async (fileId, fileName) => {
    setErr('');
    try {
      const res = await fetch(`/api/v1/documents/${fileId}`, { credentials: 'include' });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErr(d.error || `Erreur ${res.status} lors du chargement.`);
        return;
      }
      const data = await res.json();
      if (data.doc) setDoc(data.doc);
      if (data.templateId) setTemplateId(data.templateId);
      if (data.variant) setVariant(data.variant);
      if (data.style) setStyle(data.style);
      setCurrentDocId(fileId);
      setSaveName(fileName.replace(/\.json$/, ''));
    } catch (e) { setErr(`Erreur réseau : ${e.message}`); }
  };

  const deleteDoc = async (fileId) => {
    if (!confirm('Supprimer ce document ?')) return;
    setErr('');
    try {
      const res = await fetch(`/api/v1/documents/${fileId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErr(d.error || `Erreur ${res.status} lors de la suppression.`);
        return;
      }
      if (currentDocId === fileId) { setCurrentDocId(null); setSaveName(''); }
      await fetchDocs();
    } catch (e) { setErr(`Erreur réseau : ${e.message}`); }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="cm-form-panel cm-panel-dark">
      <div className="cm-form-header">
        <h2>Documents</h2>
        <p>Sauvegardez vos documents sur Google Drive.</p>
      </div>

      {err && <div className="cm-docs-err">{err}</div>}

      <div className="cm-docs-save-row">
        <input
          className="cm-docs-name-input"
          type="text"
          placeholder="Nom du document…"
          value={saveName}
          onChange={e => setSaveName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && saveDoc()}
        />
        <button
          className={`cm-docs-save-btn ${currentDocId ? 'update' : ''}`}
          onClick={saveDoc}
          disabled={saving || !saveName.trim()}
        >
          {saving ? '…' : currentDocId ? 'Mettre à jour' : 'Sauvegarder'}
        </button>
      </div>

      <div className="cm-docs-list-wrap">
        {loading ? (
          <div className="cm-docs-state">Chargement…</div>
        ) : docs.length === 0 ? (
          <div className="cm-docs-state">Aucun document sauvegardé.</div>
        ) : docs.map(d => (
          <div key={d.id} className={`cm-docs-item ${currentDocId === d.id ? 'active' : ''}`}>
            <div className="cm-docs-item-info">
              <div className="cm-docs-item-name">{d.name.replace(/\.json$/, '')}</div>
              <div className="cm-docs-item-date">{formatDate(d.modifiedTime || d.createdTime)}</div>
            </div>
            <div className="cm-docs-item-actions">
              <button className="cm-docs-load-btn" onClick={() => loadDoc(d.id, d.name)}>Charger</button>
              <button className="cm-danger cm-docs-del-btn" onClick={() => deleteDoc(d.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============== LIVE EDIT WRAPPER ==============
function LiveWrapper({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const els = ref.current.querySelectorAll('h1, h2, h3, p, .cm-cover-tagline, .cm-divider-subtitle, .cm-content-subtitle, .cm-service-name, .cm-service-desc, .cm-tl-title, .cm-tl-text, .cm-bio-text');
    els.forEach(el => { el.contentEditable = 'true'; el.classList.add('cm-editable'); });
  }, [children]);
  return <div ref={ref}>{children}</div>;
}

// ============== STYLE PANEL ==============
function TemplateThumb({ tmpl, dark, accent, cream, active, onClick }) {
  const isSombre = tmpl === 'sombre';
  const isClean  = tmpl === 'clean';
  const coverBg  = isClean ? cream : dark;
  const pageBg   = isSombre ? dark : (isClean ? cream : '#ffffff');
  const textCol  = isSombre || !isClean ? (isClean ? dark : cream) : dark;
  return (
    <button onClick={onClick} title={tmpl} style={{
      width: 72, height: 92, borderRadius: 8, overflow: 'hidden',
      border: active ? `2.5px solid ${accent}` : '2px solid rgba(255,255,255,0.1)',
      cursor: 'pointer', padding: 0, background: coverBg,
      boxShadow: active ? `0 0 0 3px ${accent}40` : '0 2px 6px rgba(0,0,0,0.35)',
      display: 'flex', flexDirection: 'column', flexShrink: 0
    }}>
      {/* Cover section */}
      <div style={{ height: 34, background: coverBg, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        {!isClean && (
          <div style={{ position: 'absolute', right: -4, top: 0, width: 40, height: 34, background: accent, opacity: 0.6, transform: 'skewY(-10deg)', transformOrigin: 'top right' }} />
        )}
        {isClean && (
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: accent }} />
        )}
        <div style={{ position: 'absolute', left: 7, bottom: 8, width: 24, height: 4, background: isClean ? dark : cream, opacity: 0.9, borderRadius: 1 }} />
        <div style={{ position: 'absolute', left: 7, bottom: 14, width: 16, height: 3, background: accent, borderRadius: 1 }} />
      </div>
      {/* Pages section */}
      <div style={{ flex: 1, background: pageBg, padding: '5px 7px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ height: 3, width: 22, background: accent, borderRadius: 1 }} />
        {[32, 40, 28, 36].map((w, i) => (
          <div key={i} style={{ height: 2, width: w, borderRadius: 1, background: isSombre ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)' }} />
        ))}
        <div style={{ height: 2, width: 30, borderRadius: 1, background: accent, opacity: 0.5 }} />
      </div>
    </button>
  );
}

function StylePanel({ style, setStyle }) {
  const [open, setOpen] = useState({ template: true, palette: true, fonts: true, branding: false });
  const toggle = k => setOpen(prev => ({ ...prev, [k]: !prev[k] }));
  const set = (f, v) => setStyle(prev => ({ ...prev, [f]: v }));

  const applyPalette = (id) => {
    const p = PALETTES.find(x => x.id === id);
    if (!p) return;
    setStyle(prev => ({ ...prev, palette: id, colorDark: p.dark, colorAccent: p.accent, colorLight: p.cream }));
  };

  const setCustomColor = (field, value) => {
    setStyle(prev => ({ ...prev, palette: 'custom', [field]: value }));
  };

  const combo = FONT_COMBOS.find(c => c.id === style.fontCombo) || FONT_COMBOS[0];

  return (
    <div className="cm-form-panel cm-panel-dark">
      <div className="cm-form-header">
        <h2>Style du document</h2>
        <p className="cm-form-tip">Les changements sont instantanés dans l'aperçu.</p>
      </div>

      <Section title="Gabarit visuel" open={open.template} onToggle={() => toggle('template')}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
          {[
            { id: 'bold',   label: 'Sombre' },
            { id: 'clean',  label: 'Clair' },
            { id: 'sombre', label: 'Full dark' },
          ].map(t => (
            <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <TemplateThumb
                tmpl={t.id}
                dark={style.colorDark} accent={style.colorAccent} cream={style.colorLight}
                active={style.template === t.id}
                onClick={() => set('template', t.id)}
              />
              <span style={{ fontSize: 11, color: style.template === t.id ? '#fff' : 'rgba(255,255,255,0.45)', fontWeight: 700 }}>
                {t.label}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Palette de couleurs" open={open.palette} onToggle={() => toggle('palette')}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {PALETTES.map(p => (
            <button
              key={p.id}
              title={p.label}
              onClick={() => applyPalette(p.id)}
              style={{
                display: 'flex', overflow: 'hidden',
                width: 54, height: 22, borderRadius: 6, border: 'none', cursor: 'pointer',
                outline: style.palette === p.id ? '2.5px solid #fff' : 'none', outlineOffset: 2,
                boxShadow: '0 1px 4px rgba(0,0,0,0.4)'
              }}
            >
              <div style={{ flex: 1, background: p.dark }} />
              <div style={{ flex: 1, background: p.accent }} />
              <div style={{ flex: 1, background: p.cream }} />
            </button>
          ))}
        </div>
        {style.palette !== 'custom' && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>
            {PALETTES.find(p => p.id === style.palette)?.label}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { field: 'colorDark',   label: 'Fond sombre' },
            { field: 'colorAccent', label: 'Accent' },
            { field: 'colorLight',  label: 'Fond clair' },
          ].map(({ field, label }) => (
            <label key={field} className="cm-field" style={{ gap: 6 }}>
              <span className="cm-field-label">{label}</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="color"
                  value={style[field]}
                  onChange={e => setCustomColor(field, e.target.value)}
                  style={{ width: 28, height: 28, padding: 1, borderRadius: 5, border: '1px solid rgba(255,255,255,.15)', cursor: 'pointer', background: 'none', flexShrink: 0 }}
                />
                <input
                  type="text"
                  value={style[field]}
                  onChange={e => setCustomColor(field, e.target.value)}
                  style={{ flex: 1, fontSize: 12, padding: '4px 6px' }}
                />
              </div>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Typographie" open={open.fonts} onToggle={() => toggle('fonts')}>
        <label className="cm-field">
          <span className="cm-field-label">Combo de polices</span>
          <select value={style.fontCombo} onChange={e => set('fontCombo', e.target.value)}>
            {FONT_COMBOS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 4, lineHeight: 1.5 }}>
          Titres : {combo.display} · Corps : {combo.body}
        </div>
        <label className="cm-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 10 }}>
          <input type="checkbox" checked={style.capsLock} onChange={e => set('capsLock', e.target.checked)} style={{ width: 'auto', margin: 0 }} />
          <span className="cm-field-label" style={{ margin: 0 }}>Titres et libellés en MAJUSCULES</span>
        </label>
      </Section>

      <Section title="Branding" open={open.branding} onToggle={() => toggle('branding')}>
        <label className="cm-field">
          <span className="cm-field-label">Nom de l'entreprise (↵ saut de ligne)</span>
          <textarea rows={2} value={style.companyName} onChange={e => set('companyName', e.target.value)} />
        </label>
        <label className="cm-field">
          <span className="cm-field-label">Site web / entête de page</span>
          <input type="text" value={style.website} onChange={e => set('website', e.target.value)} />
        </label>
        <button
          className="cm-list-add"
          style={{ marginTop: 12 }}
          onClick={() => setStyle({ template: 'bold', palette: 'cocktail', colorDark: '#2B2B2B', colorAccent: '#E83B14', colorLight: '#EFE9DC', fontCombo: 'cocktail', capsLock: false, website: 'COCKTAILMEDIA.CA', companyName: 'COCKTAIL\nMÉDIA' })}
        >
          Réinitialiser le style
        </button>
      </Section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
