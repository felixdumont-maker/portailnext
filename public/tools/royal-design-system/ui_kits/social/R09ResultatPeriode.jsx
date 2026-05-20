/* global React */
/**
 * R09 — RÉSULTAT DE PÉRIODE
 * Photo d'action plein-fond haut · score + période en bas.
 * Royal (féminin) · Xtreme (masculin) via _team.
 * period: '1' | '2' | '3' | 'ot' | 'final'
 */
function R09ResultatPeriode({ data = R09ResultatPeriode.defaults }) {
  const isX   = data._team === 'xtreme';
  const colors = data.colors || {};
  const fonts  = data.fonts  || {};

  const colorVars = {};
  if (colors.bg)         { colorVars['--template-bg'] = colors.bg; colorVars['--brand'] = colors.bg; }
  if (colors.photoBg)      colorVars['--photo-panel-bg']  = colors.photoBg;
  if (colors.infoBg)       colorVars['--info-panel-bg']   = colors.infoBg;
  if (colors.periodBg)     colorVars['--period-badge-bg'] = colors.periodBg;
  if (colors.periodFg)     colorVars['--period-badge-fg'] = colors.periodFg;
  if (colors.scorerBg)     colorVars['--scorer-pill-bg']  = colors.scorerBg;
  if (colors.darkOnLight) {
    colorVars['--fg-primary']    = '#062045';
    colorVars['--fg-secondary']  = 'rgba(6,32,69,0.65)';
    colorVars['--fg-tertiary']   = 'rgba(6,32,69,0.45)';
    colorVars['--fg-muted']      = 'rgba(6,32,69,0.30)';
    colorVars['--surface-mid']   = 'rgba(6,32,69,0.07)';
    colorVars['--border-soft']   = 'rgba(6,32,69,0.12)';
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

  const PERIOD_LABELS = {
    '1':     '1RE PÉRIODE',
    '2':     '2E PÉRIODE',
    '3':     '3E PÉRIODE',
    'ot':    'PROLONGATION',
    'final': 'FINAL',
  };
  const periodLabel = PERIOD_LABELS[data.period] || data.period || '1RE PÉRIODE';

  const scorers  = data.scorers  || [];
  const photoH   = 520;
  const infoH    = 560;

  return (
    <div className="stage-1080" id="R09" style={colorVars}>

      {/* ── PHOTO PANEL ── */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0,
        width: 1080, height: photoH,
        backgroundColor: 'var(--photo-panel-bg, #1c1c1c)',
        backgroundImage: data.photo ? `url("${data.photo}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: data.photoPosition || 'center center',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
      }}>
        {!data.photo && (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 12,
            background: 'linear-gradient(135deg, var(--photo-panel-bg, #1c1c1c) 0%, rgba(0,0,0,0.6) 100%)',
            color: 'rgba(255,255,255,0.22)',
          }}>
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <rect x="8" y="18" width="56" height="42" rx="5" stroke="currentColor" strokeWidth="2.5" fill="none"/>
              <circle cx="36" cy="39" r="12" stroke="currentColor" strokeWidth="2.5" fill="none"/>
              <circle cx="36" cy="39" r="5"  fill="currentColor" opacity="0.4"/>
              <path d="M22 18v-4a4 4 0 014-4h20a4 4 0 014 4v4" stroke="currentColor" strokeWidth="2.5"/>
            </svg>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20, letterSpacing: '0.18em', textTransform: 'uppercase',
            }}>
              PHOTO D'ACTION
            </div>
          </div>
        )}

        {/* Eyebrow — haut gauche */}
        <div style={{
          position: 'absolute', top: 36, left: 44,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.70)',
          textShadow: '0 1px 4px rgba(0,0,0,0.5)',
        }}>
          {data.eyebrow}
        </div>

        {/* Badge période — haut droite */}
        <div style={{
          position: 'absolute', top: 30, right: 44,
          background: 'var(--period-badge-bg, rgba(255,255,255,1))',
          color: 'var(--period-badge-fg, var(--template-bg, #d62127))',
          borderRadius: 6,
          padding: '7px 18px',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15, letterSpacing: '0.18em', textTransform: 'uppercase',
          }}>
            {periodLabel}
          </span>
        </div>

        {/* Dégradé bas — fondu vers l'info panel */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)',
          pointerEvents: 'none',
        }}/>
      </div>

      {/* ── INFO PANEL ── */}
      <div style={{
        position: 'absolute',
        left: 0, top: photoH,
        width: 1080, height: infoH,
        background: 'var(--info-panel-bg, var(--template-bg, #d62127))',
        display: 'flex', flexDirection: 'column',
        padding: '32px 60px 32px',
        boxSizing: 'border-box',
      }}>

        {/* Score row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 0, flex: 1, minHeight: 0,
        }}>

          {/* Équipe locale */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 10,
          }}>
            <div className="logo-box" style={{ width: 145, height: 145, borderRadius: 14 }}>
              {data.home.logo
                ? <img src={data.home.logo} alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }}/>
                : <span className="ph">{data.home.name}</span>}
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 36, letterSpacing: '0.06em', textTransform: 'uppercase',
              textAlign: 'center', lineHeight: 1,
            }}>
              {data.home.name}
            </div>
          </div>

          {/* Score central */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 6,
            padding: '0 24px',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 168, lineHeight: 0.9,
              letterSpacing: '-0.02em',
              textShadow: 'var(--shadow-press)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span>{data.homeScore ?? 0}</span>
              <span style={{ opacity: 0.30, fontSize: 90 }}>·</span>
              <span style={{ opacity: 0.75 }}>{data.awayScore ?? 0}</span>
            </div>
          </div>

          {/* Équipe adverse */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 10,
          }}>
            <div className="logo-box" style={{ width: 145, height: 145, borderRadius: 14 }}>
              {data.away.logo
                ? <img src={data.away.logo} alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }}/>
                : <span className="ph">{data.away.name}</span>}
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 36, letterSpacing: '0.06em', textTransform: 'uppercase',
              textAlign: 'center', lineHeight: 1,
            }}>
              {data.away.name}
            </div>
          </div>

        </div>

        {/* Scorers de la période */}
        {scorers.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', flexWrap: 'wrap',
            gap: 8, marginBottom: 18, justifyContent: 'center',
          }}>
            <span style={{
              fontSize: 14, fontWeight: 700, letterSpacing: '0.22em',
              textTransform: 'uppercase', opacity: 0.55, marginRight: 4,
            }}>
              {isX ? 'BUTEURS' : 'BUTEUSES'}
            </span>
            {scorers.map((s, i) => (
              <div key={i} style={{
                background: 'var(--scorer-pill-bg, rgba(255,255,255,0.14))',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 20, padding: '8px 20px',
                fontSize: 18, fontWeight: 700, letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}>
                {s.name}{s.goals > 1 ? ` ×${s.goals}` : ''}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="kit-footer">
          {(data.sponsors||[]).filter(sp=>sp.logo).length > 0 ? (
            <div style={{display:'flex', alignItems:'center', gap:18}}>
              {(data.sponsors||[]).filter(sp=>sp.logo).map((sp,i)=>(
                <img key={i} src={sp.logo} alt="" style={{height:30, maxWidth:110, objectFit:'contain', opacity:0.85}}/>
              ))}
            </div>
          ) : (
            <span className="kit-footer-left">{data.footer?.left || 'EN DIRECT'}</span>
          )}
          <span className="kit-footer-right">{data.footer?.right || 'COCKTAIL MÉDIA'}</span>
        </div>

      </div>
    </div>
  );
}

R09ResultatPeriode.defaults = {
  colors: {},
  fonts: {},
  _team: 'royal',
  period: '2',
  eyebrow: 'LNHBF · ROYAL DE SHAWINIGAN',
  photo: '',
  photoPosition: 'center center',
  home: { name: 'ROYAL', logo: './team-logos/LogoLNHBF_Shawinigan.svg' },
  away: { name: 'HAWKS', logo: './team-logos/Hawks-de-Mirabel.png' },
  homeScore: 2,
  awayScore: 1,
  scorers: [
    { name: 'C. LAVOIE',   goals: 1 },
    { name: 'A. VACHON',   goals: 1 },
  ],
  footer: { left: 'EN DIRECT', right: 'COCKTAIL MÉDIA' },
  sponsors: [],
};

window.R09ResultatPeriode = R09ResultatPeriode;
