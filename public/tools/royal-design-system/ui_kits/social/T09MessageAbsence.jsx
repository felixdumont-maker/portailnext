/* global React */
/**
 * T09 — MESSAGE D'ABSENCE
 * Annonce de fermeture / congé férié · Cocktail Média
 */
function T09MessageAbsence({ data = T09MessageAbsence.defaults }) {
  const colors = data.colors || {};
  const fonts  = data.fonts  || {};
  const cv = {};

  if (colors.bg)      cv['--t-bg']      = colors.bg;
  if (colors.accent)  cv['--t-accent']  = colors.accent;
  if (colors.fg)      cv['--t-fg']      = colors.fg;
  if (colors.fgSub)   cv['--t-fg-sub']  = colors.fgSub;
  if (colors.lineFg)  cv['--t-line']    = colors.lineFg;
  if (fonts.display) {
    if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.display);
    cv['--t-font-display'] = `'${fonts.display}', 'Bebas Neue', Impact, sans-serif`;
  }
  if (fonts.body) {
    if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.body);
    cv['--t-font-body'] = `'${fonts.body}', 'Manrope', system-ui, sans-serif`;
  }

  const titreLines = (data.titre || 'BUREAUX\nFERMÉS').split('\n');

  return (
    <div className="stage-1080" id="T09" style={cv}>

      {/* ── FOND ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'var(--t-bg, #0f1923)',
      }}/>

      {/* Texture subtile — grille de points */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}/>

      {/* Dégradé radial central — halo d'ambiance */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 70% at 50% 52%, var(--t-accent, #e8640a) 0%, transparent 68%)',
        opacity: 0.10,
      }}/>

      {/* ── BARRE HAUTE ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '38px 50px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
          fontFamily: "var(--t-font-body, system-ui, sans-serif)",
        }}>
          COCKTAIL MÉDIA
        </div>

        {/* Badge occasion */}
        {data.occasion && (
          <div style={{
            background: 'var(--t-accent, #e8640a)',
            borderRadius: 100, padding: '8px 20px',
            fontSize: 9, fontWeight: 700, letterSpacing: '0.20em',
            textTransform: 'uppercase', color: '#fff',
            fontFamily: "var(--t-font-body, system-ui, sans-serif)",
          }}>
            {data.occasion}
          </div>
        )}
      </div>

      {/* ── CONTENU CENTRÉ ── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '140px 80px 160px',
        textAlign: 'center',
      }}>

        {/* Ligne déco haute */}
        <div style={{
          width: 56, height: 2,
          background: 'var(--t-accent, #e8640a)',
          borderRadius: 2, marginBottom: 36,
          opacity: 0.80,
        }}/>

        {/* Titre principal */}
        <div style={{
          fontFamily: "var(--t-font-display, 'Bebas Neue', Impact, sans-serif)",
          fontSize: 128, lineHeight: 0.88,
          letterSpacing: '0.04em', textTransform: 'uppercase',
          color: 'var(--t-fg, #ffffff)',
          marginBottom: 44,
        }}>
          {titreLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        {/* Message corps */}
        {data.message && (
          <div style={{
            fontFamily: "var(--t-font-body, system-ui, sans-serif)",
            fontSize: 22, lineHeight: 1.65, fontWeight: 400,
            color: 'var(--t-fg-sub, rgba(255,255,255,0.65))',
            maxWidth: 680,
            marginBottom: 44,
          }}>
            {data.message}
          </div>
        )}

        {/* Ligne de retour */}
        {data.dateRetour && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 18,
          }}>
            <div style={{ width: 32, height: 1, background: 'var(--t-accent, #e8640a)', opacity: 0.60 }}/>
            <div style={{
              fontFamily: "var(--t-font-body, system-ui, sans-serif)",
              fontSize: 13, fontWeight: 700, letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--t-accent, #e8640a)',
            }}>
              {data.dateRetour}
            </div>
            <div style={{ width: 32, height: 1, background: 'var(--t-accent, #e8640a)', opacity: 0.60 }}/>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '0 50px 38px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div style={{
          fontSize: 12, fontWeight: 500,
          color: 'rgba(255,255,255,0.28)',
          fontFamily: "var(--t-font-body, system-ui, sans-serif)",
        }}>
          {data.siteWeb || 'cocktailmedia.ca'}
        </div>
        {data.social && (
          <div style={{
            fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
            color: 'var(--t-accent, #e8640a)',
            fontFamily: "var(--t-font-body, system-ui, sans-serif)",
          }}>
            {data.social}
          </div>
        )}
      </div>

    </div>
  );
}

T09MessageAbsence.defaults = {
  occasion:    'JOURNÉE DES PATRIOTES',
  titre:       'BUREAUX\nFERMÉS',
  message:     'On profite de cette belle journée pour se ressourcer. On revient demain matin, plus motivés que jamais pour vous servir!',
  dateRetour:  'Retour le mardi 20 mai',
  siteWeb:     'cocktailmedia.ca',
  social:      '@cocktailmedia',
  colors:      {},
  fonts:       {},
};

window.T09MessageAbsence = T09MessageAbsence;
