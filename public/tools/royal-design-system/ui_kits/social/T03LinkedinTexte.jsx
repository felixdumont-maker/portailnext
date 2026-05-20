/* global React, CM_LOGOS */
function T03LinkedinTexte({ data = T03LinkedinTexte.defaults }) {
  const colors = data.colors || {};
  const fonts  = data.fonts  || {};
  const cv = {};
  if (colors.bg)      cv['--t-bg']       = colors.bg;
  if (colors.accent)  cv['--t-accent']   = colors.accent;
  if (colors.titleFg) cv['--t-title-fg'] = colors.titleFg;
  if (colors.textFg)  cv['--t-text-fg']  = colors.textFg;
  if (colors.mutedFg) cv['--t-muted-fg'] = colors.mutedFg;
  if (fonts.display) { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.display); cv['--t-font-display'] = `'${fonts.display}','Bebas Neue',cursive`; }
  if (fonts.body)    { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.body);    cv['--t-font-body']    = `'${fonts.body}',Manrope,sans-serif`; }

  const logoSrc = (typeof CM_LOGOS !== 'undefined' && CM_LOGOS[data.logo]) || '';

  function renderCitation(text, highlight) {
    if (!highlight || !highlight.trim()) return <span style={{ whiteSpace: 'pre-line' }}>{text}</span>;
    const h = highlight.trim();
    const idx = text.toUpperCase().indexOf(h.toUpperCase());
    if (idx === -1) return <span style={{ whiteSpace: 'pre-line' }}>{text}</span>;
    return (
      <span style={{ whiteSpace: 'pre-line' }}>
        {text.slice(0, idx)}
        <span style={{ color: 'var(--t-accent,#e83b14)' }}>{text.slice(idx, idx + h.length)}</span>
        {text.slice(idx + h.length)}
      </span>
    );
  }

  return (
    <div style={{
      width: 1080, height: 1080,
      fontFamily: "var(--t-font-body,Manrope,sans-serif)",
      overflow: 'hidden',
      background: 'var(--t-bg,#FAF7F3)',
      display: 'flex', flexDirection: 'column',
      padding: 72, justifyContent: 'space-between', boxSizing: 'border-box',
      ...cv
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 60, height: 5, background: 'var(--t-accent,#e83b14)', borderRadius: 3 }} />
        {logoSrc && <img src={logoSrc} alt="Logo" style={{ height: 40 }} />}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: 40 }}>
        <div style={{
          fontFamily: "var(--t-font-display,'Bebas Neue',cursive)",
          fontSize: 64, lineHeight: 1.05,
          color: 'var(--t-title-fg,#2b2b2b)', letterSpacing: 1,
          marginBottom: 32, textTransform: 'uppercase'
        }}>
          {renderCitation(data.citation, data.highlightMot)}
        </div>
        <div style={{ fontSize: 20, color: 'var(--t-text-fg,var(--t-muted-fg,#9a9490))', lineHeight: 1.6, maxWidth: 700 }}>
          {data.texte}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t-title-fg,#2b2b2b)' }}>{data.auteur}</div>
          <div style={{ fontSize: 14, color: 'var(--t-muted-fg,#9a9490)', fontWeight: 500 }}>{data.titreAuteur}</div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--t-accent,#e83b14)', fontWeight: 600 }}>{data.hashtag}</div>
      </div>
    </div>
  );
}

T03LinkedinTexte.defaults = {
  citation: "LE CONTENU RÉGULIER,\nC'EST UN ACTIF.\nLA PUB SANS CONTENU,\nC'EST UNE DÉPENSE.",
  highlightMot: 'ACTIF.',
  texte: "Avant d'investir en publicité, bâtis l'habitude de créer du contenu. La fondation avant la maison.",
  auteur: 'Félix Dumont',
  titreAuteur: 'Fondateur, Cocktail Média',
  hashtag: '#marketingaccessible',
  logo: 'LOGO_COS_ICONE_NOIR',
  colors: {},
  fonts: {}
};

window.T03LinkedinTexte = T03LinkedinTexte;
