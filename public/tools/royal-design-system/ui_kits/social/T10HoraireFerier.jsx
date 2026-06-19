/* global React */
/**
 * T10 — HORAIRE MODIFIÉ · CONGÉ FÉRIÉ
 * Annonce de variation d'horaire pour les fériés · Cocktail Média
 */
function T10HoraireFerier({ data = T10HoraireFerier.defaults }) {
  const colors = data.colors || {};
  const fonts  = data.fonts  || {};
  const cv = {};

  if (colors.bg)      cv['--t-bg']      = colors.bg;
  if (colors.accent)  cv['--t-accent']  = colors.accent;
  if (colors.fg)      cv['--t-fg']      = colors.fg;
  if (colors.fgSub)   cv['--t-fg-sub']  = colors.fgSub;
  if (colors.row)     cv['--t-row']     = colors.row;
  if (fonts.display) {
    if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.display);
    cv['--t-font-display'] = `'${fonts.display}', 'Bebas Neue', Impact, sans-serif`;
  }
  if (fonts.body) {
    if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.body);
    cv['--t-font-body'] = `'${fonts.body}', 'Manrope', system-ui, sans-serif`;
  }

  const titreLines = (data.titre || 'HORAIRE\nMODIFIÉ').split('\n');
  const jours = data.jours || [];

  return (
    <div className="stage-1080" id="T10" style={cv}>

      {/* ── FOND ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'var(--t-bg, #0f1923)',
      }}/>

      {/* Texture grille de points */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}/>

      {/* Halo accent haut-gauche */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 420, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 60% at 20% 0%, var(--t-accent, #e8640a) 0%, transparent 70%)',
        opacity: 0.07,
      }}/>

      {/* ── BARRE HAUTE ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '38px 52px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)',
          fontFamily: "var(--t-font-body, system-ui, sans-serif)",
        }}>
          COCKTAIL MÉDIA
        </div>
        {data.badge && (
          <div style={{
            background: 'var(--t-accent, #e8640a)',
            borderRadius: 100, padding: '7px 18px',
            fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: '#fff',
            fontFamily: "var(--t-font-body, system-ui, sans-serif)",
          }}>
            {data.badge}
          </div>
        )}
      </div>

      {/* ── TITRE ── */}
      <div style={{
        position: 'absolute', top: 110, left: 52, right: 52,
      }}>
        <div style={{
          fontFamily: "var(--t-font-display, 'Bebas Neue', Impact, sans-serif)",
          fontSize: 100, lineHeight: 0.88,
          letterSpacing: '0.04em', textTransform: 'uppercase',
          color: 'var(--t-fg, #ffffff)',
        }}>
          {titreLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        {/* Ligne déco sous le titre */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, marginTop: 22,
        }}>
          <div style={{ width: 40, height: 2, background: 'var(--t-accent, #e8640a)', borderRadius: 2 }}/>
          {data.soustitre && (
            <div style={{
              fontFamily: "var(--t-font-body, system-ui, sans-serif)",
              fontSize: 12, fontWeight: 700, letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--t-accent, #e8640a)',
            }}>
              {data.soustitre}
            </div>
          )}
        </div>
      </div>

      {/* ── LISTE DES JOURS ── */}
      <div style={{
        position: 'absolute',
        top: 316, left: 52, right: 52,
      }}>
        {jours.map((jour, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            padding: '17px 0',
            borderTop: `1px solid rgba(255,255,255,${i === 0 ? 0.12 : 0.08})`,
          }}>
            <div style={{
              fontFamily: "var(--t-font-body, system-ui, sans-serif)",
              fontSize: 19, fontWeight: 600,
              color: jour.ferme
                ? 'rgba(255,255,255,0.35)'
                : 'var(--t-fg, #ffffff)',
              letterSpacing: '0.01em',
            }}>
              {jour.date}
            </div>
            <div style={{
              fontFamily: "var(--t-font-body, system-ui, sans-serif)",
              fontSize: 17, fontWeight: jour.ferme ? 400 : 700,
              letterSpacing: jour.ferme ? '0.08em' : '0.12em',
              textTransform: 'uppercase',
              color: jour.ferme
                ? 'rgba(255,255,255,0.28)'
                : 'var(--t-accent, #e8640a)',
            }}>
              {jour.heures}
            </div>
          </div>
        ))}
        {/* Ligne de fermeture */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}/>
      </div>

      {/* ── NOTE DE RETOUR ── */}
      {data.note && (
        <div style={{
          position: 'absolute', bottom: 110, left: 52, right: 52,
          fontFamily: "var(--t-font-body, system-ui, sans-serif)",
          fontSize: 15, lineHeight: 1.60, fontWeight: 400,
          color: 'var(--t-fg-sub, rgba(255,255,255,0.55))',
          maxWidth: 700,
        }}>
          {data.note}
        </div>
      )}

      {/* ── FOOTER ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '0 52px 38px',
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

T10HoraireFerier.defaults = {
  badge:     'CONGÉ FÉRIÉ',
  titre:     'HORAIRE\nMODIFIÉ',
  soustitre: 'Prochains jours fériés',
  jours: [
    { date: 'Vendredi 20 juin',  heures: '9 h — 12 h' },
    { date: 'Lundi 23 juin',     heures: 'Fermé',       ferme: true },
    { date: 'Mardi 24 juin',     heures: 'Fermé',       ferme: true },
    { date: 'Mercredi 25 juin',  heures: '9 h — 17 h' },
  ],
  note:      'Nous serons de retour en pleine forme le mercredi 25 juin. Pour toute urgence, écrivez-nous par courriel.',
  siteWeb:   'cocktailmedia.ca',
  social:    '@cocktailmedia',
  colors:    {},
  fonts:     {},
};

window.T10HoraireFerier = T10HoraireFerier;
