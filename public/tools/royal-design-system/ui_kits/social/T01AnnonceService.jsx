/* global React, CM_LOGOS */
function T01AnnonceService({ data = T01AnnonceService.defaults }) {
  const colors = data.colors || {};
  const fonts  = data.fonts  || {};
  const cv = {};
  if (colors.bg)      cv['--t-bg']       = colors.bg;
  if (colors.accent)  cv['--t-accent']   = colors.accent;
  if (colors.panelBg) cv['--t-panel-bg'] = colors.panelBg;
  if (colors.titleFg) cv['--t-title-fg'] = colors.titleFg;
  if (colors.mutedFg) cv['--t-muted-fg'] = colors.mutedFg;
  if (colors.imageBg) cv['--t-image-bg'] = colors.imageBg;
  if (fonts.display) { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.display); cv['--t-font-display'] = `'${fonts.display}','Bebas Neue',cursive`; }
  if (fonts.body)    { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.body);    cv['--t-font-body']    = `'${fonts.body}',Manrope,sans-serif`; }

  const logoSrc = (typeof CM_LOGOS !== 'undefined' && CM_LOGOS[data.logo]) || '';

  return (
    <div style={{
      width: 1080, height: 1080,
      fontFamily: "var(--t-font-body,Manrope,sans-serif)",
      overflow: 'hidden',
      background: 'var(--t-bg,#FAF7F3)',
      display: 'flex', flexDirection: 'column',
      ...cv
    }}>
      <div style={{ width: '100%', height: 6, background: 'var(--t-accent,#e83b14)', flexShrink: 0 }} />

      <div style={{ flex: 1, padding: '40px 40px 20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '100%', height: '100%',
          background: 'var(--t-image-bg,#ffffff)', borderRadius: 24,
          boxShadow: '0 40px 60px rgba(43,43,43,0.06)',
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {data.image
            ? <img src={data.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: '#e0d9d3', fontSize: 16, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase' }}>[ Image / Screenshot ]</span>
          }
        </div>
      </div>

      <div style={{
        background: 'var(--t-panel-bg,#2b2b2b)',
        padding: '36px 48px 40px 48px',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        minHeight: 260, flexShrink: 0, borderRadius: '32px 32px 0 0'
      }}>
        <div style={{ flex: 1, paddingRight: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--t-accent,#e83b14)', marginBottom: 10 }}>
            {data.tag}
          </div>
          <div style={{
            fontFamily: "var(--t-font-display,'Bebas Neue',cursive)",
            fontSize: 68, lineHeight: 0.95, color: 'var(--t-title-fg,#ffffff)',
            letterSpacing: 1, marginBottom: 14, textTransform: 'uppercase'
          }}>
            {data.titre}
          </div>
          <div style={{ fontSize: 17, color: 'var(--t-muted-fg,#9a9490)', fontWeight: 400, lineHeight: 1.5 }}>
            {data.sousTitre}
          </div>
        </div>
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-end' }}>
          {logoSrc && <img src={logoSrc} alt="Logo" style={{ height: 80 }} />}
        </div>
      </div>
    </div>
  );
}

T01AnnonceService.defaults = {
  tag: 'Cocktail Média',
  titre: 'PHOTO CORPORATIVE',
  sousTitre: 'Des portraits professionnels qui reflètent votre image.',
  logo: 'LOGO_CM_ICON_WHITE',
  image: '',
  colors: {},
  fonts: {}
};

window.T01AnnonceService = T01AnnonceService;
