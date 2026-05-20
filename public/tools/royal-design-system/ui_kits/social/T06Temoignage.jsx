/* global React, CM_LOGOS */
function T06Temoignage({ data = T06Temoignage.defaults }) {
  const colors = data.colors || {};
  const fonts  = data.fonts  || {};
  const cv = {};
  if (colors.bg)      cv['--t-bg']       = colors.bg;
  if (colors.accent)  cv['--t-accent']   = colors.accent;
  if (colors.titleFg) cv['--t-title-fg'] = colors.titleFg;
  if (colors.mutedFg) cv['--t-muted-fg'] = colors.mutedFg;
  if (colors.tagBg)   cv['--t-tag-bg']   = colors.tagBg;
  if (fonts.display) { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.display); cv['--t-font-display'] = `'${fonts.display}','Bebas Neue',cursive`; }
  if (fonts.body)    { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.body);    cv['--t-font-body']    = `'${fonts.body}','Manrope',sans-serif`; }

  const logoSrc = (typeof CM_LOGOS !== 'undefined' && CM_LOGOS[data.logo]) || '';

  return (
    <div style={{
      width: 1080, height: 1080,
      fontFamily: "var(--t-font-body,'Manrope',sans-serif)",
      overflow: 'hidden',
      background: 'var(--t-bg,#FAF7F3)',
      display: 'flex', flexDirection: 'column',
      padding: 72, justifyContent: 'space-between', boxSizing: 'border-box',
      ...cv
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 36, color: 'var(--t-accent,#e83b14)', letterSpacing: 4 }}>★★★★★</div>
        {logoSrc && <img src={logoSrc} alt="Logo" style={{ height: 40 }} />}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          fontFamily: "var(--t-font-display,'Bebas Neue',cursive)",
          fontSize: 160, color: 'var(--t-accent,#e83b14)', opacity: 0.15,
          lineHeight: 0.6, marginBottom: -20
        }}>
          "
        </div>
        <div style={{
          fontSize: 32, fontWeight: 600, color: 'var(--t-title-fg,#2b2b2b)',
          lineHeight: 1.5, maxWidth: 800, marginBottom: 40
        }}>
          {data.citation}
        </div>
        <div style={{ width: 60, height: 4, background: 'var(--t-accent,#e83b14)', borderRadius: 2, marginBottom: 24 }} />
        <div style={{
          fontFamily: "var(--t-font-display,'Bebas Neue',cursive)",
          fontSize: 28, color: 'var(--t-title-fg,#2b2b2b)', letterSpacing: 1, textTransform: 'uppercase'
        }}>
          {data.nomClient}
        </div>
        <div style={{ fontSize: 15, color: 'var(--t-muted-fg,#9a9490)', fontWeight: 500, marginTop: 4 }}>
          {data.entreprise}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{
          fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase',
          color: 'var(--t-muted-fg,#9a9490)',
          background: 'var(--t-tag-bg,#e0d9d3)',
          padding: '10px 20px', borderRadius: 100
        }}>
          {data.serviceTag}
        </div>
        <div style={{ fontSize: 14, color: 'var(--t-muted-fg,#9a9490)', fontWeight: 500 }}>cocktailmedia.ca</div>
      </div>
    </div>
  );
}

T06Temoignage.defaults = {
  citation: "Félix a compris notre vision dès le premier appel. Les photos sont exactement ce qu'on cherchait, professionnelles mais naturelles.",
  nomClient: 'MARIE-ÈVE TREMBLAY',
  entreprise: 'Propriétaire, Salon Beauté Zen · Trois-Rivières',
  serviceTag: 'Photo corporative',
  logo: 'LOGO_COS_ICONE_NOIR',
  colors: {},
  fonts: {}
};

window.T06Temoignage = T06Temoignage;
