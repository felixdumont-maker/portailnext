/* global React */
/**
 * R05 — RÉSULTATS (multi-match recap)
 * Two stacked match-result cards on a single 1080×1080.
 * Each card: outcome chip, teams + scores, brief scorer line.
 */
function R05MultiResultats({ data = R05MultiResultats.defaults }) {
  const colors = data.colors || {};
  const fonts  = data.fonts  || {};
  const colorVars = {};
  if (colors.bg)         { colorVars['--template-bg']   = colors.bg; colorVars['--brand'] = colors.bg; }
  if (colors.pillBg)       colorVars['--pill-bg']        = colors.pillBg;
  if (colors.pillFg)       colorVars['--pill-fg']        = colors.pillFg;
  if (colors.winBg)        colorVars['--win-bg']         = colors.winBg;
  if (colors.winFg)        colorVars['--win-fg']         = colors.winFg;
  if (colors.lossBg)       colorVars['--loss-bg']        = colors.lossBg;
  if (colors.lossFg)       colorVars['--loss-fg']        = colors.lossFg;
  if (colors.resultCardBg) colorVars['--surface-deep']   = colors.resultCardBg;
  if (colors.darkOnLight) {
    colorVars['--fg-primary']    = '#062045';
    colorVars['--fg-secondary']  = 'rgba(6,32,69,0.65)';
    colorVars['--fg-tertiary']   = 'rgba(6,32,69,0.45)';
    colorVars['--fg-muted']      = 'rgba(6,32,69,0.30)';
    colorVars['--fg-faint']      = 'rgba(6,32,69,0.15)';
    colorVars['--surface-light'] = 'rgba(6,32,69,0.10)';
    colorVars['--surface-mid']   = 'rgba(6,32,69,0.07)';
    colorVars['--surface-dark']  = 'rgba(6,32,69,0.18)';
    colorVars['--surface-deep']  = 'rgba(6,32,69,0.12)';
    colorVars['--border-strong'] = 'rgba(6,32,69,0.28)';
    colorVars['--border-soft']   = 'rgba(6,32,69,0.12)';
    colorVars['--border-faint']  = 'rgba(6,32,69,0.06)';
  }
  if (colors.cardAlpha !== undefined) {
    const hex = colors.resultCardBg || '#ffffff';
    const r = parseInt(hex.slice(1,3),16)||255, g = parseInt(hex.slice(3,5),16)||255, b = parseInt(hex.slice(5,7),16)||255;
    colorVars['--surface-deep'] = `rgba(${r},${g},${b},${colors.cardAlpha})`;
    colorVars['--border-soft']  = `rgba(${r},${g},${b},${Math.min(1,colors.cardAlpha+0.06)})`;
  }
  if (colors.fg)    colorVars['--fg-primary']   = colors.fg;
  if (colors.fgSub) colorVars['--fg-secondary'] = colors.fgSub;
  if (fonts.display) { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.display); colorVars['--font-display'] = `'${fonts.display}', Impact, 'Arial Narrow Bold', sans-serif`; }
  if (fonts.body)    { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.body);    colorVars['--font-body']    = `'${fonts.body}', system-ui, -apple-system, sans-serif`; }
  let bgStyle = {};
  if (data._bgImage) {
    const c = (data._overlayColor || '#000000').replace('#','');
    const r = parseInt(c.slice(0,2),16)||0, g = parseInt(c.slice(2,4),16)||0, b = parseInt(c.slice(4,6),16)||0;
    const o = data._overlayOpacity !== undefined ? data._overlayOpacity : 0.4;
    bgStyle = {
      backgroundImage: `linear-gradient(rgba(${r},${g},${b},${o}),rgba(${r},${g},${b},${o})),url("${data._bgImage}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  const _n = (data.matches || []).length;
  const _auto = _n <= 1 ? 1.5 : _n === 2 ? 1.4 : _n === 3 ? 1.0 : _n === 4 ? 0.75 : 0.60;
  const effectiveScale = data.matchScale !== undefined ? data.matchScale : _auto;
  return (
    <div className="stage-1080" id="R05" style={{...colorVars, ...bgStyle}}>
      <div style={{position:'absolute', inset:0, padding:'72px 80px', display:'flex', flexDirection:'column', gap:22}}>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          <div className="kit-eyebrow">{data.eyebrow}</div>
          <div style={{
            fontFamily:'var(--font-display)', fontSize:96, lineHeight:0.86,
            letterSpacing:'var(--ls-display)', textShadow:'var(--shadow-press)',
            textTransform:'uppercase'
          }}>{(data.title || 'RÉSULTATS\nDE LA SOIRÉE').split('\n').map((line, i, arr) =>
            i < arr.length - 1 ? <React.Fragment key={i}>{line}<br/></React.Fragment> : <span key={i}>{line}</span>
          )}</div>
          <div style={{fontSize:14, fontWeight:700, letterSpacing:'0.18em', color:'var(--fg-tertiary)'}}>{data.date}</div>
        </div>

        <div style={{flex:1, display:'flex', flexDirection:'column', gap:18, overflow:'visible'}}>
          {data.matches.map((m, i) => (
            <div key={i} style={{flexShrink:0, zoom: effectiveScale}}>
              <ResultRow m={m} isXtreme={data._team === 'xtreme'}/>
            </div>
          ))}
        </div>

        <div className="kit-footer">
          {(data.sponsors||[]).filter(sp=>sp.logo).length > 0 ? (
            <div style={{display:'flex', alignItems:'center', gap:18}}>
              {(data.sponsors||[]).filter(sp=>sp.logo).map((sp,i)=>(
                <img key={i} src={sp.logo} alt="" style={{height:30, maxWidth:110, objectFit:'contain', opacity:0.85}}/>
              ))}
            </div>
          ) : (
            <span className="kit-footer-left">{data.footerLeft || 'NOS PARTENAIRES'}</span>
          )}
          <span className="kit-footer-right">{data.footerRight || 'COCKTAIL MÉDIA'}</span>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ m, isXtreme }) {
  const win = m.outcome === 'VICTOIRE';
  const suffix = m.shootout ? ' · FUS.' : m.overtime ? ' · PROL.' : '';
  const outcomeLabel = m.outcome + suffix;
  const scorersArr = Array.isArray(m.scorers) ? m.scorers : [];
  const scorersStr = !Array.isArray(m.scorers) ? (m.scorers || '') : '';
  return (
    <div style={{
      background:'var(--surface-deep)', border:'1px solid var(--border-soft)',
      borderRadius:'var(--r-card)', padding:'24px 28px',
      display:'grid', gridTemplateColumns:'auto 1fr auto', gap:24,
      alignItems:'center', position:'relative', overflow:'hidden'
    }}>
      <div style={{
        position:'absolute', left:0, top:0, bottom:0, width:6,
        background: win ? 'var(--win-fg)' : 'var(--loss-fg)'
      }}/>
      <span style={{
        fontFamily:'var(--font-display)', fontSize:18, letterSpacing:'0.10em',
        background: win ? 'var(--win-bg)' : 'var(--loss-bg)',
        color: win ? 'var(--win-fg)' : 'var(--loss-fg)',
        padding:'8px 18px', borderRadius:'var(--r-pill)', whiteSpace:'nowrap'
      }}>{outcomeLabel}</span>

      <div style={{display:'flex', alignItems:'center', gap:24}}>
        <TeamScore name={m.home} score={m.homeScore} winner={win}  logo={m.homeLogo}/>
        <div style={{fontFamily:'var(--font-display)', fontSize:24, color:'var(--fg-muted)'}}>—</div>
        <TeamScore name={m.away} score={m.awayScore} winner={!win} logo={m.awayLogo}/>
      </div>

      <div style={{textAlign:'right', maxWidth:280}}>
        <div style={{fontSize:11, fontWeight:700, letterSpacing:'0.22em', color:'var(--fg-muted)', marginBottom:8}}>{isXtreme ? 'BUTEURS XTREME' : 'BUTEUSES ROYAL'}</div>
        {scorersArr.length > 0 ? (
          <div style={{display:'flex', flexWrap:'wrap', gap:5, justifyContent:'flex-end'}}>
            {scorersArr.map((s, idx) => (
              <div key={idx} style={{
                background:'rgba(255,255,255,0.11)', border:'1px solid rgba(255,255,255,0.18)',
                padding:'5px 11px', borderRadius:'12px', fontSize:12, fontWeight:700,
                letterSpacing:'0.02em', lineHeight:1.3
              }}>
                <div>{s.name}{s.goals > 1 ? <span style={{opacity:0.65, marginLeft:5, fontSize:11}}>×{s.goals}</span> : null}</div>
                {s.assist ? <div style={{fontSize:10, fontWeight:600, letterSpacing:'0.06em', opacity:0.6, marginTop:2}}>{s.assist}</div> : null}
              </div>
            ))}
          </div>
        ) : (
          <div style={{fontSize:14, lineHeight:1.4, color:'var(--fg-secondary)'}}>{scorersStr}</div>
        )}
      </div>
    </div>
  );
}

function TeamScore({ name, score, winner, logo }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:14}}>
      <div className="logo-box" style={{width:64, height:64, borderRadius:10}}>
        {logo
          ? <img src={logo} alt="" style={{width:'80%',height:'80%'}}/>
          : <span className="ph" style={{fontSize:7}}>{name}</span>}
      </div>
      <div>
        <div style={{fontFamily:'var(--font-display)', fontSize:24, lineHeight:1, letterSpacing:'0.04em'}}>{name}</div>
        <div style={{
          fontFamily:'var(--font-display)', fontSize: winner ? 64 : 48,
          lineHeight:0.95, color: winner ? 'var(--fg-primary)' : 'var(--fg-tertiary)',
          textShadow: winner ? 'var(--shadow-press)' : 'none'
        }}>{score}</div>
      </div>
    </div>
  );
}

R05MultiResultats.defaults = {
  colors: { bg:'#062045', winBg:'#FFC702', winFg:'#062045', lossBg:'rgba(255,255,255,0.12)', lossFg:'rgba(255,255,255,0.55)' },
  fonts: {},
  _team: 'xtreme',
  eyebrow: 'XTREME DE SHAWINIGAN · DOUBLE EN-TÊTE',
  footerLeft: 'NOS PARTENAIRES',
  footerRight: 'COCKTAIL MÉDIA',
  sponsors: [],
  title: 'RÉSULTATS\nDE LA SOIRÉE',
  date: '',
  matches: [
    {
      outcome: 'VICTOIRE', home: 'XTREME', homeScore: 8,
      homeLogo: './team-logos/logos-masculins/Xtreme-de-Shawinigan.png',
      away: 'SHA', awayScore: 5, awayLogo: '',
      overtime: false, shootout: false,
      scorers: [
        { name: 'S. DUBOIS',      goals: 3 },
        { name: 'A. DUBÉ',        goals: 3 },
        { name: 'V. FAUBERT',     goals: 1 },
        { name: 'P. HAMEL-SAUVÉ', goals: 1 },
      ]
    },
    {
      outcome: 'VICTOIRE', home: 'XTREME', homeScore: 0,
      homeLogo: './team-logos/logos-masculins/Xtreme-de-Shawinigan.png',
      away: 'SHA', awayScore: 0, awayLogo: '',
      overtime: false, shootout: false,
      scorers: [
        { name: 'A. DUBÉ',    goals: 2 },
        { name: 'N. HENLEY',  goals: 1 },
      ]
    }
  ]
};

window.R05MultiResultats = R05MultiResultats;
