/* global React, CM_LOGOS */
function T05UpdateCocktailOS({ data = T05UpdateCocktailOS.defaults }) {
  const colors = data.colors || {};
  const fonts  = data.fonts  || {};
  const cv = {};
  if (colors.bg)       cv['--t-bg']        = colors.bg;
  if (colors.accent)   cv['--t-accent']    = colors.accent;
  if (colors.panelBg)  cv['--t-panel-bg']  = colors.panelBg;
  if (colors.titleFg)  cv['--t-title-fg']  = colors.titleFg;
  if (colors.mutedFg)  cv['--t-muted-fg']  = colors.mutedFg;
  if (fonts.display) { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.display); cv['--t-font-display'] = `'${fonts.display}','Bebas Neue',cursive`; }
  if (fonts.body)    { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.body);    cv['--t-font-body']    = `'${fonts.body}',Manrope,sans-serif`; }

  const logoSrc = (typeof CM_LOGOS !== 'undefined' && CM_LOGOS[data.logo]) || '';

  return (
    <div style={{
      width: 1080, height: 1080,
      fontFamily: "var(--t-font-body,Manrope,sans-serif)",
      overflow: 'hidden',
      background: 'var(--t-bg,#1a1a1a)',
      display: 'flex', flexDirection: 'column',
      ...cv
    }}>
      <div style={{ padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        {logoSrc && <img src={logoSrc} alt="CocktailOS" style={{ height: 36 }} />}
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase',
          color: 'var(--t-accent,#e83b14)',
          border: '2px solid rgba(232,59,20,0.3)',
          padding: '8px 20px', borderRadius: 100
        }}>
          {data.phaseBadge}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, padding: '0 48px', display: 'flex', alignItems: 'stretch' }}>
        <div style={{
          flex: 1,
          backgroundColor: 'var(--t-panel-bg,#222)',
          backgroundImage: data.screenshot ? `url("${data.screenshot}")` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {!data.screenshot && (
            <span style={{ color: '#444', fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>[ Screenshot ]</span>
          )}
        </div>
      </div>

      <div style={{ padding: '32px 48px 44px 48px', flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: 'var(--t-accent,#e83b14)', marginBottom: 10 }}>
          {data.tag}
        </div>
        <div style={{
          fontFamily: "var(--t-font-display,'Bebas Neue',cursive)",
          fontSize: 56, color: 'var(--t-title-fg,#ffffff)', letterSpacing: 1,
          lineHeight: 0.95, marginBottom: 10, textTransform: 'uppercase'
        }}>
          {data.titre}
        </div>
        <div style={{ fontSize: 16, color: 'var(--t-muted-fg,#666)', lineHeight: 1.5, maxWidth: 700 }}>
          {data.description}
        </div>
      </div>
    </div>
  );
}

T05UpdateCocktailOS.defaults = {
  phaseBadge: 'Phase 1',
  tag: 'Mise à jour',
  titre: 'NOUVEAU PORTAIL CLIENT',
  description: 'Vos projets, enfin au même endroit. Suivi en temps réel et approbation simplifiée.',
  screenshot: '',
  logo: 'LOGO_COS_BLANC',
  colors: {},
  fonts: {}
};

window.T05UpdateCocktailOS = T05UpdateCocktailOS;
