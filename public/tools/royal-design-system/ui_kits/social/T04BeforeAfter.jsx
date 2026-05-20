/* global React, CM_LOGOS */
function T04BeforeAfter({ data = T04BeforeAfter.defaults }) {
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

  const panelStyle = {
    flex: 1, borderRadius: 20, overflow: 'hidden',
    position: 'relative', background: 'var(--t-panel-bg,#1a1a1a)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  };

  return (
    <div style={{
      width: 1080, height: 1080,
      fontFamily: "var(--t-font-body,Manrope,sans-serif)",
      overflow: 'hidden',
      background: 'var(--t-bg,#2b2b2b)',
      display: 'flex', flexDirection: 'column',
      ...cv
    }}>
      <div style={{ padding: '40px 48px 24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          fontFamily: "var(--t-font-display,'Bebas Neue',cursive)",
          fontSize: 42, color: 'var(--t-title-fg,#ffffff)', letterSpacing: 2, textTransform: 'uppercase'
        }}>
          {data.titreHeader}
        </div>
        {logoSrc && <img src={logoSrc} alt="Logo" style={{ height: 40 }} />}
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 12, padding: '0 48px' }}>
        <div style={panelStyle}>
          {data.before
            ? <img src={data.before} alt="Avant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: '#444', fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>[ Avant ]</span>
          }
          <div style={{
            position: 'absolute', top: 20, left: 20,
            fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase',
            padding: '8px 16px', borderRadius: 100,
            background: 'rgba(154,148,144,0.3)', color: '#ffffff', backdropFilter: 'blur(8px)'
          }}>Avant</div>
        </div>

        <div style={panelStyle}>
          {data.after
            ? <img src={data.after} alt="Après" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: '#444', fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>[ Après ]</span>
          }
          <div style={{
            position: 'absolute', top: 20, left: 20,
            fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase',
            padding: '8px 16px', borderRadius: 100,
            background: 'var(--t-accent,#e83b14)', color: '#ffffff'
          }}>Après</div>
        </div>
      </div>

      <div style={{ padding: '28px 48px 36px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{
            fontFamily: "var(--t-font-display,'Bebas Neue',cursive)",
            fontSize: 32, color: 'var(--t-title-fg,#ffffff)', letterSpacing: 1, textTransform: 'uppercase'
          }}>
            {data.nomProjet}
          </div>
          <div style={{ fontSize: 14, color: 'var(--t-muted-fg,#9a9490)' }}>{data.description}</div>
        </div>
        <div style={{
          fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase',
          color: 'var(--t-title-fg,#ffffff)', background: 'var(--t-accent,#e83b14)',
          padding: '12px 28px', borderRadius: 100
        }}>
          {data.ctaLabel || 'Voir le projet'}
        </div>
      </div>
    </div>
  );
}

T04BeforeAfter.defaults = {
  titreHeader: 'TRANSFORMATION',
  before: '',
  after: '',
  nomProjet: 'IDENTITÉ VISUELLE — CLIENT',
  description: 'Logo, palette de couleurs et guide de marque complet.',
  ctaLabel: 'Voir le projet',
  logo: 'LOGO_CM_ICON_WHITE',
  colors: {},
  fonts: {}
};

window.T04BeforeAfter = T04BeforeAfter;
