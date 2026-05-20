/* global React */
/**
 * T08 — HISTOIRE DE PME
 * Série mensuelle Cocktail Média · PME cliente en vedette
 * Photo plein fond · dégradé bas · panneau crème avec logo, infos, citation
 */
function T08HistoirePME({ data = T08HistoirePME.defaults }) {
  const colors = data.colors || {};
  const fonts  = data.fonts  || {};
  const cv = {};

  if (colors.bg)       cv['--t-bg']       = colors.bg;
  if (colors.accent)   cv['--t-accent']   = colors.accent;
  if (colors.panelBg)  cv['--t-panel-bg'] = colors.panelBg;
  if (colors.nameFg)   cv['--t-name-fg']  = colors.nameFg;
  if (colors.fg)       cv['--t-fg']       = colors.fg;
  if (colors.fgSub)    cv['--t-fg-sub']   = colors.fgSub;
  if (fonts.display) {
    if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.display);
    cv['--t-font-display'] = `'${fonts.display}', 'Bebas Neue', Impact, sans-serif`;
  }
  if (fonts.body) {
    if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.body);
    cv['--t-font-body'] = `'${fonts.body}', 'Manrope', system-ui, sans-serif`;
  }

  const nameSize = (data.companyName || '').length > 22 ? 42 : (data.companyName || '').length > 14 ? 50 : 60;

  return (
    <div className="stage-1080" id="T08" style={cv}>

      {/* ── FOND PHOTO ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: 'var(--t-bg, #2a1f10)',
        backgroundImage: data.photo ? `url("${data.photo}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: data.photoPosition || 'center center',
        backgroundRepeat: 'no-repeat',
      }}/>

      {/* Placeholder si pas de photo */}
      {!data.photo && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 380,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 14, color: 'rgba(255,255,255,0.14)',
        }}>
          <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
            <rect x="6" y="14" width="56" height="42" rx="6" stroke="currentColor" strokeWidth="2.5" fill="none"/>
            <circle cx="34" cy="35" r="11" stroke="currentColor" strokeWidth="2.5" fill="none"/>
            <circle cx="34" cy="35" r="4.5" fill="currentColor" opacity="0.35"/>
            <path d="M22 14v-4a4 4 0 014-4h16a4 4 0 014 4v4" stroke="currentColor" strokeWidth="2.5"/>
          </svg>
          <div style={{
            fontFamily: "var(--t-font-display,'Bebas Neue',Impact,sans-serif)",
            fontSize: 15, letterSpacing: '0.22em', textTransform: 'uppercase',
          }}>PHOTO DE L'ENTREPRISE</div>
        </div>
      )}

      {/* Dégradé bas — fondu vers le panneau */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.40) 62%, rgba(0,0,0,0.75) 82%, rgba(0,0,0,0.90) 100%)',
      }}/>

      {/* ── BARRE HAUTE ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '36px 44px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.24em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.78)',
        }}>
          COCKTAIL MÉDIA
        </div>
        <div style={{
          background: 'var(--t-accent, #e8640a)',
          borderRadius: 100, padding: '7px 18px',
          display: 'flex', alignItems: 'center', gap: 7,
          fontSize: 10, fontWeight: 700, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: '#fff',
        }}>
          <span>HISTOIRE DE PME</span>
          {data.episode && (
            <span style={{ opacity: 0.70 }}>· #{String(data.episode).padStart(2,'0')}</span>
          )}
        </div>
      </div>

      {/* ── PANNEAU CRÈME ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'var(--t-panel-bg, #f5efe0)',
        borderRadius: '24px 24px 0 0',
        padding: '28px 44px 42px',
      }}>

        {/* Logo PME + Nom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14 }}>
          {data.logo && (
            <div style={{
              width: 68, height: 68, borderRadius: 14, flexShrink: 0,
              background: '#fff', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 14px rgba(0,0,0,0.10)',
            }}>
              <img src={data.logo} alt="" style={{ maxWidth: 58, maxHeight: 58, objectFit: 'contain', display: 'block' }}/>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--t-font-display,'Bebas Neue',Impact,sans-serif)",
              fontSize: nameSize, lineHeight: 0.88,
              textTransform: 'uppercase', letterSpacing: '0.02em',
              color: 'var(--t-name-fg, #1a1108)',
              wordBreak: 'break-word',
            }}>
              {data.companyName || "NOM DE L'ENTREPRISE"}
            </div>
          </div>
        </div>

        {/* Tags : secteur · ville */}
        {(data.sector || data.city) && (
          <div style={{ display: 'flex', gap: 7, marginBottom: 13, flexWrap: 'wrap' }}>
            {data.sector && (
              <span style={{
                background: 'rgba(0,0,0,0.07)', borderRadius: 100,
                padding: '4px 14px', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--t-fg, #3d2e14)',
              }}>{data.sector}</span>
            )}
            {data.city && (
              <span style={{
                background: 'rgba(0,0,0,0.07)', borderRadius: 100,
                padding: '4px 14px', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--t-fg, #3d2e14)',
              }}>{data.city}</span>
            )}
          </div>
        )}

        {/* Description */}
        {data.description && (
          <div style={{
            fontSize: 14, lineHeight: 1.58, color: 'var(--t-fg, #3d2e14)',
            marginBottom: 13,
          }}>
            {data.description}
          </div>
        )}

        {/* Citation */}
        {data.quote && (
          <div style={{ position: 'relative', paddingLeft: 28, marginBottom: 18 }}>
            <span style={{
              position: 'absolute', left: 0, top: -4,
              fontFamily: "var(--t-font-display,'Bebas Neue',Impact,sans-serif)",
              fontSize: 48, lineHeight: 1, color: 'var(--t-accent, #e8640a)', opacity: 0.55,
              userSelect: 'none',
            }}>«</span>
            <div style={{
              fontStyle: 'italic', fontSize: 14, lineHeight: 1.55,
              color: 'var(--t-fg-sub, rgba(61,46,20,0.68))',
            }}>
              {data.quote}
            </div>
            {data.quoteAuthor && (
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: 'var(--t-accent, #e8640a)',
                marginTop: 6,
              }}>
                {'—'} {data.quoteAuthor}
              </div>
            )}
          </div>
        )}

        {/* Footer : site · social · CM */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 13, borderTop: '1px solid rgba(0,0,0,0.09)',
        }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            {data.website && (
              <span style={{
                fontSize: 12, fontWeight: 500,
                color: 'var(--t-fg-sub, rgba(61,46,20,0.60))',
              }}>{data.website}</span>
            )}
            {data.social && (
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: 'var(--t-accent, #e8640a)',
              }}>{data.social}</span>
            )}
          </div>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.20em',
            textTransform: 'uppercase', color: 'rgba(0,0,0,0.25)',
          }}>COCKTAIL MÉDIA</span>
        </div>

      </div>
    </div>
  );
}

T08HistoirePME.defaults = {
  companyName: "NOM DE L'ENTREPRISE",
  episode: '01',
  photo: '',
  photoPosition: 'center center',
  logo: '',
  sector: 'RESTAURATION',
  city: 'SHAWINIGAN',
  description: "Courte présentation de l'entreprise et de ce qui la rend unique dans son domaine.",
  quote: "Ce que je voulais, c'était créer un endroit où les gens se sentent chez eux.",
  quoteAuthor: 'Marie Tremblay, fondatrice',
  website: 'www.entreprise.com',
  social: '@entreprise',
  colors: {},
  fonts: {},
};

window.T08HistoirePME = T08HistoirePME;
