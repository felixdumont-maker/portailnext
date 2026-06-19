/* global React */
/**
 * R08 — JOUEUR·EUSE DE LA SEMAINE
 * Royal (féminin) · Xtreme (masculin)
 * textSide: 'right' | 'left'  — position du panneau info
 * awardType: 'offensif' | 'defensif'
 */
function R08JoueurSemaine({ data = R08JoueurSemaine.defaults }) {
  const isX      = data._team === 'xtreme';
  const colors   = data.colors || {};
  const fonts    = data.fonts  || {};
  const textSide = data.textSide || 'right'; // 'right' = photo gauche, 'left' = photo droite

  const colorVars = {};
  if (colors.bg)           { colorVars['--template-bg'] = colors.bg; colorVars['--brand'] = colors.bg; }
  if (colors.photoBg)        colorVars['--photo-panel-bg']   = colors.photoBg;
  if (colors.statBg)         colorVars['--stat-card-bg']     = colors.statBg;
  if (colors.statBorder)     colorVars['--stat-card-border'] = colors.statBorder;
  if (colors.awardFg)        colorVars['--award-fg']         = colors.awardFg;
  if (colors.accentBar)      colorVars['--accent-bar']       = colors.accentBar;
  if (colors.darkOnLight) {
    colorVars['--fg-primary']    = '#062045';
    colorVars['--fg-secondary']  = 'rgba(6,32,69,0.65)';
    colorVars['--fg-tertiary']   = 'rgba(6,32,69,0.45)';
    colorVars['--fg-muted']      = 'rgba(6,32,69,0.30)';
    colorVars['--fg-faint']      = 'rgba(6,32,69,0.15)';
    colorVars['--surface-light'] = 'rgba(6,32,69,0.10)';
    colorVars['--surface-mid']   = 'rgba(6,32,69,0.07)';
    colorVars['--border-soft']   = 'rgba(6,32,69,0.12)';
    colorVars['--photo-panel-bg']= '#1a3a6b';
    colorVars['--stat-card-bg']  = 'rgba(6,32,69,0.10)';
    colorVars['--stat-card-border'] = 'rgba(6,32,69,0.20)';
  }
  if (colors.fg)    colorVars['--fg-primary']   = colors.fg;
  if (colors.fgSub) colorVars['--fg-secondary'] = colors.fgSub;
  if (fonts.display) {
    if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.display);
    colorVars['--font-display'] = `'${fonts.display}', Impact, 'Arial Narrow Bold', sans-serif`;
  }
  if (fonts.body) {
    if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.body);
    colorVars['--font-body'] = `'${fonts.body}', system-ui, -apple-system, sans-serif`;
  }

  // ── Multi-joueurs : une seule photo, plusieurs noms (ex. 2 joueurs du match) ──
  const extraPlayers = (data.extraPlayers || []).filter(p => p && (p.firstName || p.lastName || p.number));
  const playerList = [
    { firstName: data.firstName, lastName: data.lastName, number: data.number, position: data.position },
    ...extraPlayers,
  ];
  const multi = playerList.length > 1;

  const award    = data.awardType || 'offensif';
  const isMatch  = award === 'match';
  const awardWho = (isX ? 'JOUEUR' : 'JOUEUSE') + (multi ? 'S' : '');
  const awardType = isMatch
    ? 'DU MATCH'
    : isX
      ? (award === 'offensif' ? 'OFFENSIF'  : 'DÉFENSIF')
      : (award === 'offensif' ? 'OFFENSIVE' : 'DÉFENSIVE');

  const photoPos   = data.photoPosition || 'center top';
  const stats      = data.stats    || [];
  const sponsors   = data.sponsors || [];

  // Espaceurs flex avant/après le bloc de contenu principal
  const VALIGN_SPACERS = {
    top:    { before: 0,    after: 1    },
    upper:  { before: 0.35, after: 1    },
    center: { before: 1,    after: 1    },
    lower:  { before: 1.8,  after: 0.3  },
  };
  const spacers = VALIGN_SPACERS[data.textVAlign || 'top'];

  // Placement photo/texte
  const photoLeft  = textSide === 'right' ? 20  : null;
  const photoRight = textSide === 'left'  ? 20  : null;
  const textLeft   = textSide === 'left'  ? 20  : null;
  const textRight  = textSide === 'right' ? 20  : null;

  // Gradient photo : dégradé vers l'intérieur (là où se trouve le texte)
  const photoGrad = textSide === 'right'
    ? 'linear-gradient(90deg, transparent 55%, rgba(0,0,0,0.22) 100%)'
    : 'linear-gradient(270deg, transparent 55%, rgba(0,0,0,0.22) 100%)';

  // Barre accent : sur le bord intérieur du panneau texte
  const accentBarSide = textSide === 'right' ? { left: 0 } : { right: 0 };

  return (
    <div className="stage-1080" id="R08" style={colorVars}>

      {/* ── PHOTO PANEL ── */}
      <div style={{
        position: 'absolute',
        left: photoLeft, right: photoRight, top: 20,
        width: 492, height: 1040,
        overflow: 'hidden',
        backgroundColor: 'var(--photo-panel-bg, #2a2a2a)',
        backgroundImage: data.photo ? `url("${data.photo}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: photoPos,
        backgroundRepeat: 'no-repeat',
        borderRadius: 'var(--r-card)',
      }}>
        {!data.photo && (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 10,
            background: 'var(--surface-mid)',
            color: 'var(--fg-tertiary)',
          }}>
            <svg width="56" height="56" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="14" r="8" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5"/>
              <path d="M4 40c0-9.94 8.06-18 18-18s18 8.06 18 18" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4"/>
            </svg>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 20,
              letterSpacing: '0.14em', textAlign: 'center', opacity: 0.4,
            }}>
              PHOTO<br/>{isX ? 'JOUEUR' : 'JOUEUSE'}
            </div>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: photoGrad, pointerEvents: 'none' }}/>
      </div>

      {/* ── PANNEAU TEXTE ── */}
      <div style={{
        position: 'absolute',
        left: textLeft, right: textRight, top: 20,
        width: 528, height: 1040,
        padding: '48px 44px 36px 44px',
        boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Barre accent verticale */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, width: 5,
          ...accentBarSide,
          background: 'var(--accent-bar, rgba(255,255,255,0.30))',
          borderRadius: 3,
        }}/>

        {/* Numéro watermark — toujours centré dans le panneau (masqué en multi-joueurs) */}
        {data.number && !multi && (
          <div style={{
            position: 'absolute',
            top: '50%', transform: 'translateY(-50%)',
            right: textSide === 'right' ? 10 : 'auto',
            left:  textSide === 'left'  ? 10 : 'auto',
            fontFamily: 'var(--font-display)',
            fontSize: 340, lineHeight: 1,
            letterSpacing: '-0.04em',
            color: 'rgba(255,255,255,0.04)',
            userSelect: 'none', pointerEvents: 'none',
            zIndex: 0,
          }}>
            {data.number}
          </div>
        )}

        {/* ── Espaceur avant le contenu (contrôle position verticale) ── */}
        {spacers.before > 0 && <div style={{ flex: spacers.before }}/>}

        {/* ── Bloc contenu principal ── */}
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* Eyebrow */}
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.24em',
            color: 'var(--fg-muted)', textTransform: 'uppercase',
            marginBottom: 22,
          }}>
            {data.eyebrow}
          </div>

          {/* Section award */}
          <div style={{ marginBottom: 18 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, letterSpacing: '0.28em',
              textTransform: 'uppercase', color: 'var(--fg-tertiary)',
              marginBottom: 10,
            }}>
              {awardWho}
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 58, lineHeight: 1.0,
              letterSpacing: '0.03em', textTransform: 'uppercase',
              color: 'var(--award-fg, var(--fg-primary))',
              textShadow: 'var(--shadow-press)',
              marginBottom: 10,
            }}>
              {awardType}
            </div>
            {!isMatch && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.18)', borderRadius: 1 }}/>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.30em',
                  color: 'var(--fg-muted)', textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}>
                  DE LA SEMAINE
                </span>
              </div>
            )}
          </div>

          {/* Nom(s) — 1 joueur (grand format) ou plusieurs (compact, même photo) */}
          {multi ? (
            <div style={{ marginBottom: 18 }}>
              {playerList.map((pl, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'baseline', gap: 12,
                  paddingBottom: 12, marginBottom: 12,
                  borderBottom: i < playerList.length - 1 ? '1px solid rgba(255,255,255,0.12)' : 'none',
                }}>
                  {pl.number && (
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 34, lineHeight: 1, opacity: 0.5, flexShrink: 0 }}>
                      #{pl.number}
                    </span>
                  )}
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: 30, lineHeight: 0.9,
                      letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--fg-tertiary)',
                    }}>
                      {pl.firstName}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: 46, lineHeight: 0.86,
                      letterSpacing: '0.02em', textTransform: 'uppercase', textShadow: 'var(--shadow-press)',
                    }}>
                      {pl.lastName}
                    </div>
                    {pl.position && (
                      <div style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.20em',
                        textTransform: 'uppercase', color: 'var(--fg-tertiary)', marginTop: 5,
                      }}>
                        {pl.position}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <React.Fragment>
              {/* Nom */}
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 64, lineHeight: 0.88,
                letterSpacing: '0.02em', textTransform: 'uppercase',
                textShadow: 'var(--shadow-press)',
              }}>
                {data.firstName}
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 84, lineHeight: 0.86,
                letterSpacing: '0.02em', textTransform: 'uppercase',
                color: 'var(--fg-tertiary)',
                textShadow: 'var(--shadow-press)',
                marginBottom: 18,
              }}>
                {data.lastName}
              </div>

              {/* Numéro + position */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                paddingBottom: 14, marginBottom: 14,
                borderBottom: '1px solid rgba(255,255,255,0.10)',
              }}>
                {data.number && (
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 38, lineHeight: 1, opacity: 0.55 }}>
                    #{data.number}
                  </span>
                )}
                {data.position && (
                  <span style={{
                    fontSize: 12, fontWeight: 700, letterSpacing: '0.20em',
                    textTransform: 'uppercase', color: 'var(--fg-tertiary)',
                  }}>
                    {data.position}
                  </span>
                )}
              </div>
            </React.Fragment>
          )}

          {/* Contexte */}
          {data.matchContext && (
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.16em',
              color: 'var(--fg-secondary)', textTransform: 'uppercase', marginBottom: 18,
            }}>
              {data.matchContext}
            </div>
          )}

          {/* Stats */}
          {stats.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
              gap: 8,
            }}>
              {stats.map((stat, i) => (
                <div key={i} style={{
                  background: 'var(--stat-card-bg, rgba(0,0,0,0.22))',
                  border: '1px solid var(--stat-card-border, rgba(255,255,255,0.10))',
                  borderRadius: 10, padding: '12px 6px', textAlign: 'center',
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 46, lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
                    color: 'var(--fg-muted)', textTransform: 'uppercase', marginTop: 4,
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Espaceur après le contenu ── */}
        <div style={{ flex: spacers.after }}/>

        {/* Section sponsors */}
        {sponsors.length > 0 && (
          <div style={{ marginBottom: 18, position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
              color: 'var(--fg-muted)', textTransform: 'uppercase', marginBottom: 10,
            }}>
              {data.sponsorsTitle || 'PRÉSENTÉ PAR'}
            </div>
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18,
              paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.10)',
            }}>
              {sponsors.map((sp, i) => sp.logo ? (
                <img key={i} src={sp.logo} alt={sp.name || ''}
                  style={{ maxHeight: 38, maxWidth: 100, objectFit: 'contain', opacity: 0.90, display: 'block' }}/>
              ) : (
                <div key={i} className="logo-box" style={{ width: 80, height: 38, borderRadius: 6 }}>
                  <span className="ph">{sp.name || 'LOGO'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="kit-footer" style={{ position: 'relative', zIndex: 1 }}>
          <span className="kit-footer-left">{data.footerLeft || 'DE LA SEMAINE'}</span>
          <span className="kit-footer-right">{data.footerRight || 'COCKTAIL MÉDIA'}</span>
        </div>
      </div>
    </div>
  );
}

R08JoueurSemaine.defaults = {
  colors: {},
  fonts: {},
  _team: 'royal',
  awardType: 'offensif',
  textSide: 'right',
  textVAlign: 'top',
  eyebrow: 'LNHBF · ROYAL DE SHAWINIGAN',
  firstName: 'CAMILLE',
  lastName: 'LAVOIE',
  number: '17',
  position: 'ATTAQUE',
  extraPlayers: [],
  photo: '',
  photoPosition: 'center top',
  matchContext: 'SEMAINE DU 10 MAI 2026',
  footerLeft: 'DE LA SEMAINE',
  footerRight: 'COCKTAIL MÉDIA',
  sponsorsTitle: 'PRÉSENTÉ PAR',
  sponsors: [],
  stats: [
    { label: 'BUTS',   value: '3' },
    { label: 'PASSES', value: '2' },
    { label: 'POINTS', value: '5' },
  ],
};

window.R08JoueurSemaine = R08JoueurSemaine;
