/* global React */
/**
 * R07 — 3 ÉTOILES DU MATCH
 * 1re étoile: grande photo à gauche + info à droite.
 * 2e et 3e étoiles: deux cartes côte à côte sans photo.
 */
function R07Etoiles({ data = R07Etoiles.defaults }) {
  const isX = data._team === 'xtreme';
  const colors = data.colors || {};
  const fonts  = data.fonts  || {};
  const colorVars = {};
  colorVars['--fg-primary']   = '#ffffff';
  colorVars['--fg-secondary'] = 'rgba(255,255,255,0.65)';
  colorVars['--fg-tertiary']  = 'rgba(255,255,255,0.45)';
  colorVars['--fg-muted']     = 'rgba(255,255,255,0.35)';
  if (colors.bg) { colorVars['--template-bg'] = colors.bg; colorVars['--brand'] = colors.bg; }
  if (colors.pillBg)  colorVars['--pill-bg']       = colors.pillBg;
  if (colors.pillFg)  colorVars['--pill-fg']        = colors.pillFg;
  if (colors.starBg)  colorVars['--star-card-bg']   = colors.starBg;
  if (colors.photoBg) colorVars['--photo-panel-bg'] = colors.photoBg;
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
    colorVars['--star-card-bg']  = 'rgba(6,32,69,0.08)';
    colorVars['--photo-panel-bg']= '#1a3a6b';
  }
  if (colors.fg)    colorVars['--fg-primary']   = colors.fg;
  if (colors.fgSub) colorVars['--fg-secondary'] = colors.fgSub;
  if (fonts.display) { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.display); colorVars['--font-display'] = `'${fonts.display}', Impact, 'Arial Narrow Bold', sans-serif`; }
  if (fonts.body)    { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.body);    colorVars['--font-body']    = `'${fonts.body}', system-ui, -apple-system, sans-serif`; }

  const s1 = data.star1 || {};
  const s2 = data.star2 || {};
  const s3 = data.star3 || {};

  const photoPos = s1.photoPosition || 'center top';

  const starLabel = (n) => n === 1
    ? (isX ? '1re étoile' : '1re étoile')
    : n === 2 ? '2e étoile' : '3e étoile';

  return (
    <div className="stage-1080" id="R07" style={colorVars}>
      <div style={{position:'absolute', inset:0, padding:'72px 80px', display:'flex', flexDirection:'column', gap:20}}>

        {/* Header */}
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          <div className="kit-eyebrow">{data.eyebrow}</div>
          <div style={{
            fontFamily:'var(--font-display)', fontSize:104, lineHeight:0.86,
            letterSpacing:'var(--ls-display)', textShadow:'var(--shadow-press)',
            textTransform:'uppercase'
          }}>
            {data.heroLine1}<br/>{data.heroLine2}
          </div>
          {data.matchInfo && (
            <div style={{fontSize:13, fontWeight:700, letterSpacing:'0.18em', color:'var(--fg-tertiary)', textTransform:'uppercase', marginTop:4}}>
              {data.matchInfo}
            </div>
          )}
        </div>

        {/* 1re étoile — photo + info */}
        <div style={{
          flex:1, display:'flex', borderRadius:'var(--r-card)',
          overflow:'hidden', border:'1px solid var(--border-soft)',
          background:'var(--star-card-bg, var(--surface-mid))'
        }}>
          {/* Photo */}
          <div style={{
            width:340, flexShrink:0,
            backgroundColor:'var(--photo-panel-bg, #2a2a2a)',
            backgroundImage: s1.photo ? `url("${s1.photo}")` : 'none',
            backgroundSize:'cover', backgroundPosition: photoPos,
            backgroundRepeat:'no-repeat', position:'relative'
          }}>
            {!s1.photo && (
              <div style={{
                width:'100%', height:'100%', display:'flex', alignItems:'center',
                justifyContent:'center', color:'var(--fg-tertiary)',
                fontFamily:'var(--font-display)', fontSize:22, letterSpacing:'0.08em', textAlign:'center'
              }}>PHOTO<br/>{isX ? 'JOUEUR' : 'JOUEUSE'}</div>
            )}
            <div style={{
              position:'absolute', inset:0,
              background:'linear-gradient(90deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.25) 100%)',
              pointerEvents:'none'
            }}/>
          </div>

          {/* Info 1re étoile */}
          <div style={{
            flex:1, padding:'36px 40px', display:'flex', flexDirection:'column',
            justifyContent:'center', gap:14
          }}>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <span style={{fontSize:28, lineHeight:1}}>★</span>
              <span style={{
                fontFamily:'var(--font-display)', fontSize:16, letterSpacing:'0.22em',
                textTransform:'uppercase', color:'var(--fg-primary)', opacity:0.9
              }}>{starLabel(1)}</span>
            </div>
            <div style={{
              fontFamily:'var(--font-display)', fontSize:72, lineHeight:0.88,
              letterSpacing:'var(--ls-display)', textTransform:'uppercase',
              textShadow:'var(--shadow-press)'
            }}>{s1.name || 'NOM JOUEUR'}</div>
            {(s1.number || s1.position) && (
              <div style={{
                display:'flex', alignItems:'center', gap:16, marginTop:4
              }}>
                {s1.number && (
                  <span style={{
                    fontFamily:'var(--font-display)', fontSize:36,
                    color:'var(--fg-primary)', opacity:0.7
                  }}>#{s1.number}</span>
                )}
                {s1.position && (
                  <span style={{
                    fontSize:13, fontWeight:700, letterSpacing:'0.18em',
                    textTransform:'uppercase', color:'var(--fg-tertiary)'
                  }}>{s1.position}</span>
                )}
              </div>
            )}
            {s1.stats && (
              <div style={{
                fontSize:14, color:'var(--fg-secondary)', fontWeight:600,
                letterSpacing:'0.06em', marginTop:4
              }}>{s1.stats}</div>
            )}
          </div>
        </div>

        {/* 2e et 3e étoiles */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          {[{star: s2, n:2}, {star: s3, n:3}].map(({star, n}) => (
            <div key={n} style={{
              background:'var(--star-card-bg, var(--surface-mid))',
              border:'1px solid var(--border-soft)', borderRadius:'var(--r-card)',
              padding:'24px 28px', display:'flex', flexDirection:'column', gap:10
            }}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{fontSize:22, lineHeight:1}}>{'★'.repeat(n)}</span>
                <span style={{
                  fontFamily:'var(--font-display)', fontSize:13, letterSpacing:'0.22em',
                  textTransform:'uppercase', color:'var(--fg-primary)', opacity:0.85
                }}>{starLabel(n)}</span>
              </div>
              <div style={{
                fontFamily:'var(--font-display)', fontSize:46, lineHeight:0.9,
                letterSpacing:'var(--ls-display)', textTransform:'uppercase',
                textShadow:'var(--shadow-press)'
              }}>{star.name || 'NOM JOUEUR'}</div>
              <div style={{display:'flex', alignItems:'center', gap:12}}>
                {star.number && (
                  <span style={{fontFamily:'var(--font-display)', fontSize:26, opacity:0.65}}>#{star.number}</span>
                )}
                {star.position && (
                  <span style={{fontSize:12, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--fg-tertiary)'}}>{star.position}</span>
                )}
              </div>
              {star.stats && (
                <div style={{fontSize:13, color:'var(--fg-secondary)', fontWeight:600, letterSpacing:'0.04em'}}>{star.stats}</div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="kit-footer">
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

R07Etoiles.defaults = {
  colors: {},
  fonts: {},
  _team: 'royal',
  eyebrow: 'ROYAL DE SHAWINIGAN · LNHBF',
  heroLine1: '3 ÉTOILES',
  heroLine2: 'DU MATCH',
  matchInfo: 'SAMEDI 18 AVRIL · CENTRE JACQUES-PLANTE',
  star1: { name: 'A. VACHON',   number: '8',  position: 'GARDIENNE', stats: '32 arrêts · Blanchissage', photo: '' },
  star2: { name: 'C. GAUTHIER', number: '22', position: 'ATTAQUE',   stats: '2 buts · 1 passe' },
  star3: { name: 'M. LECLERC',  number: '11', position: 'DÉFENSE',   stats: '1 but · 2 passes' },
  footer: { left: 'NOS PARTENAIRES', right: 'COCKTAIL MÉDIA' },
  sponsors: [],
};

window.R07Etoiles = R07Etoiles;
