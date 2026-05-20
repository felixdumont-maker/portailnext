/* global React */
/**
 * R03 — RÉSULTAT DE MATCH
 * Layout R01-inspired: gros logos, score central énorme, strip verre buteuses.
 */
function R03Resultat({ data = R03Resultat.defaults }) {
  const win     = data.outcome === 'VICTOIRE';
  const neutral = data.outcome === 'NEUTRE';
  const isX = data._team === 'xtreme';
  const colors = data.colors || {};
  const fonts  = data.fonts  || {};
  const colorVars = {};
  if (colors.bg)         { colorVars['--template-bg']  = colors.bg; colorVars['--brand'] = colors.bg; }
  if (colors.winBg)        colorVars['--win-bg']        = colors.winBg;
  if (colors.winFg)        colorVars['--win-fg']        = colors.winFg;
  if (colors.lossBg)       colorVars['--loss-bg']       = colors.lossBg;
  if (colors.lossFg)       colorVars['--loss-fg']       = colors.lossFg;
  if (colors.scoreBoardBg) colorVars['--surface-glass'] = colors.scoreBoardBg;
  if (colors.darkOnLight) {
    colorVars['--fg-primary']    = '#062045';
    colorVars['--fg-secondary']  = 'rgba(6,32,69,0.65)';
    colorVars['--fg-tertiary']   = 'rgba(6,32,69,0.45)';
    colorVars['--fg-muted']      = 'rgba(6,32,69,0.30)';
    colorVars['--fg-faint']      = 'rgba(6,32,69,0.15)';
    colorVars['--surface-light'] = 'rgba(6,32,69,0.10)';
    colorVars['--surface-mid']   = 'rgba(6,32,69,0.07)';
    colorVars['--surface-dark']  = 'rgba(6,32,69,0.18)';
    colorVars['--surface-glass'] = 'rgba(6,32,69,0.85)';
    colorVars['--border-strong'] = 'rgba(6,32,69,0.28)';
    colorVars['--border-soft']   = 'rgba(6,32,69,0.12)';
    colorVars['--border-faint']  = 'rgba(6,32,69,0.06)';
  }
  if (colors.logoBoxBg)     colorVars['--surface-mid']   = colors.logoBoxBg;
  if (colors.logoBoxBorder) colorVars['--border-strong'] = colors.logoBoxBorder;
  if (colors.fg)    colorVars['--fg-primary']   = colors.fg;
  if (colors.fgSub) colorVars['--fg-secondary'] = colors.fgSub;
  if (fonts.display) { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.display); colorVars['--font-display'] = `'${fonts.display}', Impact, 'Arial Narrow Bold', sans-serif`; }
  if (fonts.body)    { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.body);    colorVars['--font-body']    = `'${fonts.body}', system-ui, -apple-system, sans-serif`; }

  const outcomeBg = neutral ? 'rgba(255,255,255,0.15)' : win ? 'var(--win-bg, #ffffff)' : 'var(--loss-bg, #000000)';
  const outcomeFg = neutral ? 'var(--fg-primary)'      : win ? 'var(--win-fg, #d62127)' : 'var(--loss-fg, #888888)';
  const outcomeText = neutral ? (data.pillText || 'APERÇU') : data.outcome;

  const homeSize = neutral ? 240 : win  ? 270 : 210;
  const awaySize = neutral ? 240 : !win ? 270 : 210;
  const homeOpacity = neutral ? 1 : win  ? 1 : 0.65;
  const awayOpacity = neutral ? 1 : !win ? 1 : 0.65;

  return (
    <div className="stage-1080" id="R03" style={colorVars}>
      <div style={{position:'absolute', inset:0, padding:'60px 72px', display:'flex', flexDirection:'column'}}>

        {/* ── Header ── */}
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          <div className="kit-eyebrow">{data.eyebrow}</div>
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            <span style={{
              fontFamily:'var(--font-display)', alignSelf:'flex-start',
              fontSize:36, letterSpacing:'0.05em', textTransform:'uppercase',
              background: outcomeBg, color: outcomeFg,
              padding:'6px 26px', borderRadius:'var(--r-pill)',
              lineHeight:1.15,
            }}>{outcomeText}</span>
            <span style={{
              fontSize:13, fontWeight:700, letterSpacing:'0.18em',
              color:'var(--fg-primary)', opacity:0.7, textTransform:'uppercase',
              textAlign:'center'
            }}>{data.subEyebrow}</span>
          </div>
        </div>

        {/* ── Score héros ── */}
        <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'center', gap:0}}>

          {/* Équipe locale */}
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:12}}>
            <div style={{
              fontFamily:'var(--font-display)',
              fontSize: homeSize,
              lineHeight:0.85, letterSpacing:'-0.04em',
              color:'var(--fg-primary)',
              textShadow: (win || neutral) ? 'var(--shadow-press)' : 'none',
              opacity: homeOpacity,
            }}>{data.homeScore}</div>
            <div className="logo-box" style={{width:150, height:150, borderRadius:16}}>
              {data.home.logo
                ? <img src={data.home.logo} alt="" style={{width:'80%',height:'80%',objectFit:'contain'}}/>
                : <span className="ph">{data.home.name}</span>}
            </div>
            <div style={{
              fontFamily:'var(--font-display)', fontSize:38,
              letterSpacing:'var(--ls-display)', textTransform:'uppercase', lineHeight:1, textAlign:'center'
            }}>{data.home.name}</div>
          </div>

          {/* Dash + FINAL — calé au centre vertical du score gagnant */}
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:8, flexShrink:0,
            paddingTop: win ? Math.round(270*0.85/2 - 40) : Math.round(210*0.85/2 - 40)
          }}>
            <div style={{
              fontFamily:'var(--font-display)', fontSize:80, lineHeight:1,
              color:'var(--fg-primary)', opacity:0.45,
            }}>–</div>
            {!neutral && <div style={{
              fontSize:10, fontWeight:700, letterSpacing:'0.28em',
              color:'var(--fg-primary)', textTransform:'uppercase', opacity:0.75,
            }}>FINAL</div>}
          </div>

          {/* Équipe adverse */}
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:12}}>
            <div style={{
              fontFamily:'var(--font-display)',
              fontSize: awaySize,
              lineHeight:0.85, letterSpacing:'-0.04em',
              color:'var(--fg-primary)',
              textShadow: (!win || neutral) ? 'var(--shadow-press)' : 'none',
              opacity: awayOpacity,
            }}>{data.awayScore}</div>
            <div className="logo-box" style={{width:150, height:150, borderRadius:16}}>
              {data.away.logo
                ? <img src={data.away.logo} alt="" style={{width:'80%',height:'80%',objectFit:'contain'}}/>
                : <span className="ph">{data.away.name}</span>}
            </div>
            <div style={{
              fontFamily:'var(--font-display)', fontSize:38,
              letterSpacing:'var(--ls-display)', textTransform:'uppercase', lineHeight:1, textAlign:'center'
            }}>{data.away.name}</div>
          </div>

        </div>
        </div>

        {/* ── Strip verre : buteuses + gardienne ── */}
        <div style={{
          background:'var(--surface-glass)', backdropFilter:'blur(8px)',
          WebkitBackdropFilter:'blur(8px)',
          border:'1px solid var(--border-soft)', borderRadius:'var(--r-card)',
          padding:'20px 28px', display:'grid',
          gridTemplateColumns:'1fr 1px 220px', gap:0, alignItems:'start'
        }}>
          {/* Buteuses */}
          <div style={{paddingRight:24}}>
            <div style={{
              fontSize:10, fontWeight:700, letterSpacing:'0.24em',
              color:'var(--fg-primary)', opacity:0.75, marginBottom:12, textTransform:'uppercase'
            }}>{isX ? 'Buteurs' : 'Buteuses'}</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:7}}>
              {(data.scorers || []).map((s, i) => (
                <div key={i} style={{
                  background:'rgba(255,255,255,0.12)',
                  border:'1px solid rgba(255,255,255,0.22)',
                  padding:'7px 13px', borderRadius:'14px',
                  display:'flex', flexDirection:'column', gap:2
                }}>
                  <div style={{fontSize:13, fontWeight:700, letterSpacing:'0.03em'}}>
                    {s.name}
                    <span style={{opacity:0.7, marginLeft:7, fontSize:11}}>×{s.goals}</span>
                  </div>
                  {s.assist && (
                    <div style={{fontSize:10, fontWeight:600, letterSpacing:'0.08em', opacity:0.6, textTransform:'uppercase'}}>
                      {s.assist}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{background:'var(--border-soft)', height:'100%', margin:'0 0'}} />

          {/* Gardienne */}
          <div style={{paddingLeft:24}}>
            <div style={{
              fontSize:10, fontWeight:700, letterSpacing:'0.24em',
              color:'var(--fg-primary)', opacity:0.75, marginBottom:10, textTransform:'uppercase'
            }}>{isX ? 'Gardien' : 'Gardienne'}</div>
            <div style={{
              fontFamily:'var(--font-display)', fontSize:26, lineHeight:1.1,
              letterSpacing:'0.02em'
            }}>{data.goalie.name}</div>
            <div style={{
              fontSize:12, color:'var(--fg-primary)', opacity:0.72, marginTop:5,
              fontWeight:700, letterSpacing:'0.08em'
            }}>{data.goalie.line}</div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="kit-footer" style={{marginTop:22}}>
          {(data.sponsors||[]).filter(sp=>sp.logo).length > 0 ? (
            <div style={{display:'flex', alignItems:'center', gap:18}}>
              {(data.sponsors||[]).filter(sp=>sp.logo).map((sp,i)=>(
                <img key={i} src={sp.logo} alt="" style={{height:30, maxWidth:110, objectFit:'contain', opacity:0.85}}/>
              ))}
            </div>
          ) : (
            <span className="kit-footer-left">{data.footer?.left || 'NOS PARTENAIRES'}</span>
          )}
          <span className="kit-footer-right">{data.footer?.right || 'COCKTAIL MÉDIA'}</span>
        </div>
      </div>
    </div>
  );
}


R03Resultat.defaults = {
  colors: {},
  fonts: {},
  _team: 'royal',
  eyebrow: 'RÉSULTAT · LNHBF',
  subEyebrow: 'SAMEDI 12 AVRIL · CENTRE JACQUES-PLANTE',
  outcome: 'VICTOIRE',
  title: 'BELLE\nVICTOIRE',
  home: { name: 'ROYAL', logo: './team-logos/LogoLNHBF_Shawinigan.svg' },
  away: { name: 'HAWKS', logo: './team-logos/Hawks-de-Mirabel.png' },
  homeScore: 5,
  awayScore: 2,
  scorers: [
    { name: 'C. GAUTHIER',  goals: 2 },
    { name: 'M. LECLERC',   goals: 1 },
    { name: 'A. ROBIDOUX',  goals: 1 },
    { name: 'J. ST-PIERRE', goals: 1 },
  ],
  goalie: { name: 'A. DUBUC', line: '24 arrêts sur 26' },
  footer: { left: 'NOS PARTENAIRES', right: 'COCKTAIL MÉDIA' },
  sponsors: [],
};

window.R03Resultat = R03Resultat;
