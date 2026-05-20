/* global React */
/**
 * T5 — AVANT / APRÈS
 * Variante A — fidèle : split vertical 50/50 photos, étiquettes Bebas, hachures
 * Variante B — exploratoire : split diagonal angulaire, étiquettes en pills colorées
 */

function T5AvantApresA({ data = T5AvantApresA.defaults }) {
  const ts = data._titleScale || 1;
  return (
    <div className="stage-1080" id="T5-A">
      <div style={{position:'absolute', inset:0, padding:'56px 56px 56px', display:'flex', flexDirection:'column', overflow:'hidden'}}>
        {/* Header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexShrink:0}}>
          <div>
            <div className="kit-eyebrow">{data.eyebrow}</div>
            <div className="kit-hero" style={{fontSize:Math.round(ts*88), marginTop:10, overflow:'hidden'}}>
              {data.title}
            </div>
          </div>
          <span className="kit-pill">{data.pill}</span>
        </div>

        {/* Split photos */}
        <div style={{
          flex:1, marginTop:28, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16,
          position:'relative'
        }}>
          {/* AVANT */}
          <div style={{position:'relative', borderRadius:'var(--r-card-lg)', overflow:'hidden'}}>
            <div className="photo-box" style={{position:'absolute', inset:0, fontSize:24}}>
              {data.before
                ? <img src={data.before} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',filter:'grayscale(0.4)'}} />
                : <span>PHOTO<br/>AVANT</span>
              }
            </div>
            <div style={{
              position:'absolute', top:18, left:18,
              background:'var(--ink)', color:'var(--white)',
              padding:'8px 18px', borderRadius:'var(--r-pill)',
              fontFamily:'var(--font-display)', fontSize:24, letterSpacing:'0.18em'
            }}>AVANT</div>
            <div style={{
              position:'absolute', left:0, right:0, bottom:0, height:120,
              background:'linear-gradient(to top, rgba(0,0,0,0.55), transparent)'
            }}/>
            <div style={{
              position:'absolute', bottom:18, left:24, right:24,
              fontSize:13, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase'
            }}>{data.beforeNote}</div>
          </div>
          {/* APRÈS */}
          <div style={{position:'relative', borderRadius:'var(--r-card-lg)', overflow:'hidden'}}>
            <div className="photo-box" style={{position:'absolute', inset:0, fontSize:24}}>
              {data.after
                ? <img src={data.after} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />
                : <span>PHOTO<br/>APRÈS</span>
              }
            </div>
            <div style={{
              position:'absolute', top:18, left:18,
              background:'var(--white)', color:'var(--brand)',
              padding:'8px 18px', borderRadius:'var(--r-pill)',
              fontFamily:'var(--font-display)', fontSize:24, letterSpacing:'0.18em'
            }}>APRÈS</div>
            <div style={{
              position:'absolute', left:0, right:0, bottom:0, height:120,
              background:'linear-gradient(to top, rgba(0,0,0,0.55), transparent)'
            }}/>
            <div style={{
              position:'absolute', bottom:18, left:24, right:24,
              fontSize:13, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase'
            }}>{data.afterNote}</div>
          </div>

          {/* arrow center */}
          <div style={{
            position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)',
            width:84, height:84, borderRadius:'50%',
            background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 8px 24px rgba(0,0,0,0.4)'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </div>

        {/* Stat row */}
        <div style={{
          marginTop:24,
          padding:'22px 28px',
          background:'var(--surface-darker)', backdropFilter:'blur(10px)',
          WebkitBackdropFilter:'blur(10px)',
          border:'1px solid var(--border-soft)', borderRadius:'var(--r-card)',
          display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:24
        }}>
          <div>
            <div style={{fontSize:11, fontWeight:800, letterSpacing:'0.28em', color:'var(--fg-muted)'}}>RÉALISATION</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:30, letterSpacing:'0.04em', marginTop:4}}>{data.project}</div>
          </div>
          <div>
            <div style={{fontSize:11, fontWeight:800, letterSpacing:'0.28em', color:'var(--fg-muted)'}}>DURÉE</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:30, letterSpacing:'0.04em', marginTop:4}}>{data.duration}</div>
          </div>
          <div>
            <div style={{fontSize:11, fontWeight:800, letterSpacing:'0.28em', color:'var(--fg-muted)'}}>VILLE</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:30, letterSpacing:'0.04em', marginTop:4}}>{data.city}</div>
          </div>
        </div>

        <div className="kit-footer" style={{marginTop:18}}>
          <span className="kit-footer-left">{data.footerLeft}</span>
          <span className="kit-footer-right">{data.footerRight}</span>
        </div>
      </div>
    </div>
  );
}
T5AvantApresA.defaults = {
  eyebrow: 'IMMOBILIER ROY · TRANSFORMATION',
  title:   'AVANT — APRÈS',
  pill:    'PROJET LIVRÉ',
  beforeNote: 'CUISINE D\'ORIGINE · 1985',
  afterNote:  'RÉNOVATION COMPLÈTE',
  project:  'BUNGALOW SHERBROOKE',
  duration: '6 SEMAINES',
  city:     'SHERBROOKE',
  footerLeft:  'IMMOBILIER ROY',
  footerRight: 'PORTFOLIO COMPLET EN LIGNE',
};

/* ---------------------------------------------------------------------- */

function T5AvantApresB({ data = T5AvantApresB.defaults }) {
  const ts = data._titleScale || 1;
  // Diagonal split via clip-path
  return (
    <div className="stage-1080 no-hatch" id="T5-B" style={{backgroundColor:'var(--brand)'}}>
      {/* AVANT layer (bottom-left half) */}
      <div style={{
        position:'absolute', inset:0,
        clipPath:'polygon(0 0, 60% 0, 40% 100%, 0 100%)'
      }}>
        <div className="photo-box" style={{
          position:'absolute', inset:0, fontSize:32, border:'none'
        }}>
          {data.before
            ? <img src={data.before} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',filter:'grayscale(0.6) brightness(0.85)'}} />
            : <span>PHOTO<br/>AVANT</span>
          }
        </div>
        <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.25)'}}/>
      </div>
      {/* APRÈS layer (top-right half) */}
      <div style={{
        position:'absolute', inset:0,
        clipPath:'polygon(60% 0, 100% 0, 100% 100%, 40% 100%)'
      }}>
        <div className="photo-box" style={{
          position:'absolute', inset:0, fontSize:32, border:'none'
        }}>
          {data.after
            ? <img src={data.after} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />
            : <span>PHOTO<br/>APRÈS</span>
          }
        </div>
      </div>
      {/* Diagonal divider line */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none'
      }}>
        <svg width="1080" height="1080" style={{position:'absolute', inset:0}}>
          <line x1="648" y1="0" x2="432" y2="1080" stroke="var(--accent)" strokeWidth="6"/>
        </svg>
      </div>

      {/* Labels along diagonal */}
      <div style={{
        position:'absolute', top:80, left:80,
        fontFamily:'var(--font-display)', fontSize:Math.round(ts*140), lineHeight:0.85,
        letterSpacing:'0.02em', color:'var(--white)',
        textShadow:'var(--shadow-press-lg)'
      }}>
        AVANT
      </div>
      <div style={{
        position:'absolute', bottom:160, right:80, textAlign:'right',
        fontFamily:'var(--font-display)', fontSize:Math.round(ts*140), lineHeight:0.85,
        letterSpacing:'0.02em', color:'var(--white)',
        textShadow:'var(--shadow-press-lg)'
      }}>
        APRÈS
      </div>

      {/* Center bottom info chip */}
      <div style={{
        position:'absolute', bottom:60, left:'50%', transform:'translateX(-50%)',
        background:'var(--ink)', color:'var(--white)',
        padding:'18px 32px', borderRadius:'var(--r-pill)',
        display:'flex', alignItems:'center', gap:18,
        border:'2px solid var(--accent)'
      }}>
        <div style={{
          fontFamily:'var(--font-display)', fontSize:24, letterSpacing:'0.18em'
        }}>{data.title}</div>
        <div style={{width:1, height:24, background:'rgba(255,255,255,0.3)'}}/>
        <div style={{fontSize:11, fontWeight:800, letterSpacing:'0.24em', textTransform:'uppercase'}}>
          {data.subtitle}
        </div>
      </div>

      {/* Eyebrow top right */}
      <div style={{
        position:'absolute', top:80, right:80, textAlign:'right',
        fontSize:11, fontWeight:800, letterSpacing:'0.32em', textTransform:'uppercase',
        color:'rgba(255,255,255,0.7)'
      }}>{data.eyebrow}</div>

      {/* footer brand */}
      <div style={{
        position:'absolute', bottom:24, left:80, right:80,
        display:'flex', justifyContent:'space-between',
        fontSize:10, fontWeight:700, letterSpacing:'0.24em', textTransform:'uppercase',
        color:'rgba(255,255,255,0.5)'
      }}>
        <span>{data.footerLeft}</span>
        <span>{data.footerRight}</span>
      </div>
    </div>
  );
}
T5AvantApresB.defaults = {
  eyebrow: 'SALON ÉCLAT · MÉTAMORPHOSE',
  title:   'BALAYAGE BLOND',
  subtitle:'4 H · COULEUR + COUPE',
  footerLeft:  'SALON ÉCLAT',
  footerRight: 'RDV · 418 555 0188',
};

window.T5AvantApresA = T5AvantApresA;
window.T5AvantApresB = T5AvantApresB;
