/* global React */
const { useState } = React;

/**
 * R01 — SOIR DE MATCH
 * Gameday announcement. Top: ROYAL eyebrow + LE ROYAL hero + DATE pill.
 * Middle: Big VS — both team logo boxes flanking a giant "VS".
 * Lower: Glass info strip (date · time · arena). Footer: brand strip.
 */
function R01Gameday({ data = R01Gameday.defaults }) {
  const colors = data.colors || {};
  const fonts  = data.fonts  || {};
  const colorVars = {};
  if (colors.bg)    { colorVars['--template-bg']   = colors.bg; colorVars['--brand'] = colors.bg; }
  if (colors.pillBg)  colorVars['--pill-bg']        = colors.pillBg;
  if (colors.pillFg)  colorVars['--pill-fg']        = colors.pillFg;
  if (colors.glassBg) colorVars['--surface-glass']  = colors.glassBg;
  if (colors.vsFg)    colorVars['--vs-fg']          = colors.vsFg;
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
    colorVars['--vs-fg']         = '#062045';
  }
  if (colors.fg)    colorVars['--fg-primary']   = colors.fg;
  if (colors.fgSub) colorVars['--fg-secondary'] = colors.fgSub;
  if (fonts.display) { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.display); colorVars['--font-display'] = `'${fonts.display}', Impact, 'Arial Narrow Bold', sans-serif`; }
  if (fonts.body)    { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.body);    colorVars['--font-body']    = `'${fonts.body}', system-ui, -apple-system, sans-serif`; }
  const bgStyle = {};
  if (data._bgImage) {
    const hex = (data._overlayColor || '#000000').replace('#', '');
    const r = parseInt(hex.slice(0,2), 16) || 0;
    const g = parseInt(hex.slice(2,4), 16) || 0;
    const b = parseInt(hex.slice(4,6), 16) || 0;
    const a = data._overlayOpacity ?? 0.45;
    bgStyle.backgroundImage = `linear-gradient(rgba(${r},${g},${b},${a}),rgba(${r},${g},${b},${a})),url("${data._bgImage}")`;
    bgStyle.backgroundSize  = 'cover';
    bgStyle.backgroundPosition = 'center';
  }
  return (
    <div className="stage-1080" id="R01" style={{...colorVars, ...bgStyle}}>
      <div style={{position:'absolute', inset:0, padding:'72px 80px', display:'flex', flexDirection:'column'}}>

        {/* Header eyebrow + hero title */}
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          <div className="kit-eyebrow">{data.eyebrow}</div>
          <div style={{
            fontFamily:'var(--font-display)', fontSize:124, lineHeight:0.86,
            letterSpacing:'var(--ls-display)', textShadow:'var(--shadow-press)',
            textTransform:'uppercase'
          }}>
            {data.heroLine1}<br/>{data.heroLine2}
          </div>
          <div style={{marginTop:8}}>
            <span className="kit-pill">{data.pill}</span>
          </div>
        </div>

        {/* Mid VS lockup */}
        <div style={{
          flex:1, display:'flex', alignItems:'center', justifyContent:'space-between',
          gap:32, padding:'40px 0'
        }}>
          <TeamBlock name={data.home.name} subtitle={data.home.subtitle} logo={data.home.logo} side="home"/>
          <div style={{
            fontFamily:'var(--font-display)', fontSize:200, lineHeight:1,
            letterSpacing:'-0.03em', textShadow:'4px 4px 0 rgba(0,0,0,0.35)',
            color:'var(--vs-fg, var(--fg-primary))'
          }}>VS</div>
          <TeamBlock name={data.away.name} subtitle={data.away.subtitle} logo={data.away.logo} side="away"/>
        </div>

        {/* Glass info strip */}
        <div style={{
          background:'var(--surface-glass)', backdropFilter:'blur(8px)',
          WebkitBackdropFilter:'blur(8px)',
          border:'1px solid var(--border-soft)', borderRadius:'var(--r-card)',
          padding:'22px 32px', display:'grid', gridTemplateColumns:'repeat(3, 1fr)',
          gap:24, textAlign:'center'
        }}>
          <InfoCell label="DATE" value={data.info.date}/>
          <InfoCell label="HEURE" value={data.info.time}/>
          <InfoCell label="CENTRE" value={data.info.arena}/>
        </div>

        {/* Footer */}
        <div className="kit-footer" style={{marginTop:28}}>
          {(data.sponsors || []).filter(sp => sp.logo).length > 0 ? (
            <div style={{display:'flex', alignItems:'center', gap:18}}>
              {(data.sponsors || []).filter(sp => sp.logo).map((sp, i) => (
                <img key={i} src={sp.logo} alt="" style={{height:34, maxWidth:120, objectFit:'contain', opacity:0.88}} />
              ))}
            </div>
          ) : (
            <span className="kit-footer-left">{data.footer.left}</span>
          )}
          <span className="kit-footer-right">{data.footer.right}</span>
        </div>
      </div>
    </div>
  );
}

function TeamBlock({ name, subtitle, logo, side }) {
  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:16, flex:1}}>
      <div className="logo-box" style={{width:240, height:240, borderRadius:20}}>
        {logo ? <img src={logo} alt="" style={{width:'80%',height:'80%'}}/> : <span className="ph">LOGO<br/>{name}</span>}
      </div>
      <div style={{
        fontFamily:'var(--font-display)', fontSize:34, letterSpacing:'var(--ls-display)',
        textTransform:'uppercase', textAlign:'center', lineHeight:1
      }}>{name}</div>
      {subtitle && (
        <div style={{
          fontSize:13, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase',
          color:'var(--fg-muted)'
        }}>{subtitle}</div>
      )}
    </div>
  );
}

function InfoCell({ label, value }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:6}}>
      <div style={{fontSize:11, fontWeight:700, letterSpacing:'0.22em', color:'var(--fg-muted)'}}>{label}</div>
      <div style={{fontFamily:'var(--font-display)', fontSize:30, letterSpacing:'0.04em'}}>{value}</div>
    </div>
  );
}

R01Gameday.defaults = {
  colors: {},
  fonts: {},
  _team: 'royal',
  _bgImage: '',
  _overlayColor: '#000000',
  _overlayOpacity: 0.45,
  eyebrow: 'ROYAL DE SHAWINIGAN · LNHBF',
  heroLine1: 'SOIR DE',
  heroLine2: 'MATCH',
  pill: 'SAMEDI 18 AVRIL',
  home: { name: 'ROYAL', subtitle: 'SHAWINIGAN', logo: './team-logos/LogoLNHBF_Shawinigan.svg' },
  away: { name: 'HAWKS', subtitle: 'MIRABEL',    logo: './team-logos/Hawks-de-Mirabel.png' },
  info: { date: '18 AVRIL', time: '19 H 30', arena: 'JACQUES-PLANTE' },
  footer: { left: 'NOS PARTENAIRES', right: 'COCKTAIL MÉDIA' },
  sponsors: [],
};

window.R01Gameday = R01Gameday;
