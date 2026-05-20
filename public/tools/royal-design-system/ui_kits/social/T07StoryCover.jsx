/* global React, CM_LOGOS */
function T07StoryCover({ data = T07StoryCover.defaults }) {
  const colors = data.colors || {};
  const fonts  = data.fonts  || {};
  const cv = {};
  if (colors.bg)      cv['--t-bg']       = colors.bg;
  if (colors.accent)  cv['--t-accent']   = colors.accent;
  if (colors.panelBg) cv['--t-panel-bg'] = colors.panelBg;
  if (colors.titleFg) cv['--t-title-fg'] = colors.titleFg;
  if (colors.mutedFg) cv['--t-muted-fg'] = colors.mutedFg;
  if (fonts.display) { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.display); cv['--t-font-display'] = `'${fonts.display}','Bebas Neue',cursive`; }
  if (fonts.body)    { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.body);    cv['--t-font-body']    = `'${fonts.body}',Manrope,sans-serif`; }

  const logoSrc = (typeof CM_LOGOS !== 'undefined' && CM_LOGOS[data.logo]) || '';

  return (
    <div style={{
      width: 1080, height: 1920,
      fontFamily: "var(--t-font-body,Manrope,sans-serif)",
      overflow: 'hidden',
      background: 'var(--t-bg,#2b2b2b)',
      display: 'flex', flexDirection: 'column',
      ...cv
    }}>
      <div style={{ padding: '60px 56px 0 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        {logoSrc && <img src={logoSrc} alt="Logo" style={{ height: 44 }} />}
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase',
          color: 'var(--t-accent,#e83b14)',
          border: '2px solid rgba(232,59,20,0.3)',
          padding: '8px 20px', borderRadius: 100
        }}>
          {data.tagHaut}
        </div>
      </div>

      <div style={{ flex: 1, padding: '40px 56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '100%', height: '100%',
          borderRadius: 28, overflow: 'hidden',
          background: 'var(--t-panel-bg,#1a1a1a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {data.image
            ? <img src={data.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: '#444', fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>[ Image / Vidéo ]</span>
          }
        </div>
      </div>

      <div style={{ padding: '0 56px 72px 56px', flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--t-accent,#e83b14)', marginBottom: 12 }}>
          {data.tagBas}
        </div>
        <div style={{
          fontFamily: "var(--t-font-display,'Bebas Neue',cursive)",
          fontSize: 72, color: 'var(--t-title-fg,#ffffff)', letterSpacing: 2,
          lineHeight: 0.92, marginBottom: 16,
          textTransform: 'uppercase', whiteSpace: 'pre-line'
        }}>
          {data.titre}
        </div>
        <div style={{ fontSize: 18, color: 'var(--t-muted-fg,#9a9490)', lineHeight: 1.5, maxWidth: 700 }}>
          {data.sousTitre}
        </div>
      </div>

      <div style={{ width: '100%', height: 6, background: 'var(--t-accent,#e83b14)', flexShrink: 0 }} />
    </div>
  );
}

T07StoryCover.defaults = {
  tagHaut: 'Nouveau',
  tagBas: 'Cocktail Média',
  titre: 'VOTRE IMAGE\nMÉRITE MIEUX',
  sousTitre: 'Photo · Vidéo · Web · Design',
  image: '',
  logo: 'LOGO_CM_ICON_WHITE',
  colors: {},
  fonts: {}
};

window.T07StoryCover = T07StoryCover;
