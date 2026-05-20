/* global React, CM_LOGOS */
function T02PromoForfait({ data = T02PromoForfait.defaults }) {
  const colors = data.colors || {};
  const fonts  = data.fonts  || {};
  const cv = {};
  if (colors.bg)      cv['--t-bg']       = colors.bg;
  if (colors.accent)  cv['--t-accent']   = colors.accent;
  if (colors.titleFg) cv['--t-title-fg'] = colors.titleFg;
  if (colors.mutedFg) cv['--t-muted-fg'] = colors.mutedFg;
  if (fonts.display) { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.display); cv['--t-font-display'] = `'${fonts.display}','Bebas Neue',cursive`; }
  if (fonts.body)    { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.body);    cv['--t-font-body']    = `'${fonts.body}',Manrope,sans-serif`; }

  const logoSrc = (typeof CM_LOGOS !== 'undefined' && CM_LOGOS[data.logo]) || '';

  return (
    <div style={{
      width: 1080, height: 1080,
      fontFamily: "var(--t-font-body,Manrope,sans-serif)",
      overflow: 'hidden',
      background: 'var(--t-bg,#2b2b2b)',
      display: 'flex', flexDirection: 'column',
      padding: 64, justifyContent: 'space-between', boxSizing: 'border-box',
      ...cv
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {logoSrc && <img src={logoSrc} alt="Logo" style={{ height: 48 }} />}
        <div style={{
          fontSize: 12, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase',
          color: 'var(--t-accent,#e83b14)',
          background: 'rgba(232,59,20,0.1)',
          padding: '8px 16px', borderRadius: 100
        }}>
          {data.tag}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--t-muted-fg,#9a9490)' }}>
          {data.serviceLabel}
        </div>
        <div style={{
          fontFamily: "var(--t-font-display,'Bebas Neue',cursive)",
          fontSize: 86, lineHeight: 0.92, color: 'var(--t-title-fg,#ffffff)',
          letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'pre-line'
        }}>
          {data.titre}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 8 }}>
          <div style={{
            fontFamily: "var(--t-font-display,'Bebas Neue',cursive)",
            fontSize: 96, color: 'var(--t-accent,#e83b14)', lineHeight: 1
          }}>
            {data.prix}
          </div>
          <div style={{ fontSize: 18, color: 'var(--t-muted-fg,#9a9490)', fontWeight: 500 }}>
            {data.detailPrix}
          </div>
        </div>
        <div style={{ width: 80, height: 4, background: 'var(--t-accent,#e83b14)', borderRadius: 2 }} />
        <div style={{ fontSize: 19, color: 'var(--t-muted-fg,#9a9490)', lineHeight: 1.6, maxWidth: 600 }}>
          {data.sousTitre}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{
          fontSize: 15, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase',
          color: 'var(--t-title-fg,#ffffff)',
          background: 'var(--t-accent,#e83b14)',
          padding: '16px 40px', borderRadius: 100
        }}>
          {data.cta}
        </div>
        <div style={{ fontSize: 14, color: 'var(--t-muted-fg,#9a9490)', fontWeight: 500, letterSpacing: 1 }}>
          cocktailmedia.ca
        </div>
      </div>
    </div>
  );
}

T02PromoForfait.defaults = {
  tag: 'Forfait',
  serviceLabel: 'Capsules vidéo',
  titre: '10 CAPSULES\nRÉSEAUX SOCIAUX',
  prix: '300$',
  detailPrix: "au lieu de 750$ à l'unité",
  sousTitre: 'Montage, sous-titres et musique inclus. Prêt à publier sur tous vos réseaux.',
  cta: 'Réservez maintenant',
  logo: 'LOGO_CM_ICON_WHITE',
  colors: {},
  fonts: {}
};

window.T02PromoForfait = T02PromoForfait;
