/* global React */
/**
 * T4 — HORAIRE / HEURES D'OUVERTURE
 * Variante A — fidèle : grille 7 jours, hachures, pill HORAIRE
 * Variante B — exploratoire : liste verticale typographique stacked, jours alignés à gauche
 */

function T4HoraireA({ data = T4HoraireA.defaults }) {
  const ts = data._titleScale || 1;
  return (
    <div className="stage-1080" id="T4-A">
      <div style={{position:'absolute', inset:0, padding:'72px 80px', display:'flex', flexDirection:'column', overflow:'hidden'}}>
        {/* Header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexShrink:0}}>
          <div>
            <div className="kit-eyebrow">{data.eyebrow}</div>
            <div className="kit-hero" style={{fontSize:Math.round(ts*104), marginTop:14, overflow:'hidden'}}>
              {data.title}
            </div>
          </div>
          <span className="kit-pill" style={{marginTop:14}}>{data.pill}</span>
        </div>

        <div style={{flex:'1 1 0', minHeight:0, marginTop:36, display:'grid', gridTemplateColumns:'1fr', gap:Math.round(ts*14), overflow:'hidden', alignContent:'start'}}>
          {data.days.map((d, i) => (
            <div key={i} style={{
              display:'grid', gridTemplateColumns:'1.5fr 2fr 1fr', alignItems:'center',
              padding:`${Math.round(ts*18)}px 28px`,
              background: d.closed ? 'var(--surface-low)' : 'var(--surface-mid)',
              border:'1px solid var(--border-soft)', borderRadius:'var(--r-card)',
              opacity: d.closed ? 0.7 : 1
            }}>
              <div style={{fontFamily:'var(--font-display)', fontSize:Math.round(ts*34), letterSpacing:'0.06em'}}>{d.day}</div>
              <div style={{
                fontFamily:'var(--font-display)', fontSize:Math.round(ts*34), letterSpacing:'0.04em',
                color: d.closed ? 'var(--fg-tertiary)' : 'var(--fg-primary)'
              }}>{d.hours}</div>
              <div style={{textAlign:'right', fontSize:11, fontWeight:800, letterSpacing:'0.28em', color:'var(--fg-muted)', textTransform:'uppercase'}}>
                {d.note || ''}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop:24, display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'18px 28px', background:'var(--surface-darker)',
          backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
          border:'1px solid var(--border-soft)', borderRadius:'var(--r-card)'
        }}>
          <div>
            <div style={{fontSize:11, fontWeight:800, letterSpacing:'0.28em', color:'var(--fg-muted)'}}>ADRESSE</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:30, letterSpacing:'0.04em', marginTop:4}}>{data.address}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:11, fontWeight:800, letterSpacing:'0.28em', color:'var(--fg-muted)'}}>TÉLÉPHONE</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:30, letterSpacing:'0.04em', marginTop:4}}>{data.phone}</div>
          </div>
        </div>

        <div className="kit-footer" style={{marginTop:24}}>
          <span className="kit-footer-left">{data.footerLeft}</span>
          <span className="kit-footer-right">{data.footerRight}</span>
        </div>
      </div>
    </div>
  );
}
T4HoraireA.defaults = {
  eyebrow: 'BOUTIQUE MARGUERITE · HORAIRE',
  title:   'NOS HEURES',
  pill:    'EN VIGUEUR',
  days: [
    { day:'LUNDI',    hours:'10H — 18H' },
    { day:'MARDI',    hours:'10H — 18H' },
    { day:'MERCREDI', hours:'10H — 18H' },
    { day:'JEUDI',    hours:'10H — 21H', note:'OUVERT TARD' },
    { day:'VENDREDI', hours:'10H — 21H', note:'OUVERT TARD' },
    { day:'SAMEDI',   hours:'09H — 17H' },
    { day:'DIMANCHE', hours:'FERMÉ', closed:true },
  ],
  address: '4321 RUE NOTRE-DAME',
  phone:   '514 555 0123',
  footerLeft:  'BOUTIQUE MARGUERITE',
  footerRight: 'WWW.MARGUERITE.CA',
};

/* ---------------------------------------------------------------------- */

function T4HoraireB({ data = T4HoraireB.defaults }) {
  const ts = data._titleScale || 1;
  return (
    <div className="stage-1080 no-hatch" id="T4-B" style={{backgroundColor:'var(--ink)'}}>
      {/* corner accent square */}
      <div style={{position:'absolute', right:0, top:0, width:180, height:180, backgroundColor:'var(--brand)'}}/>
      <div style={{
        position:'absolute', right:28, top:22,
        fontFamily:'var(--font-display)', fontSize:34, letterSpacing:'0.06em',
        textAlign:'right', lineHeight:0.95, color:'var(--white)'
      }}>
        OUVERT<br/>7 / 7
      </div>

      <div style={{position:'absolute', inset:0, padding:'72px 80px', display:'flex', flexDirection:'column', justifyContent:'space-between', color:'var(--white)', overflow:'hidden'}}>
        <div style={{flexShrink:0}}>
          <div style={{fontSize:11, fontWeight:800, letterSpacing:'0.32em', textTransform:'uppercase', color:'rgba(255,255,255,0.55)'}}>{data.eyebrow}</div>
          <div style={{
            fontFamily:'var(--font-display)', fontSize:Math.round(ts*112), lineHeight:0.86,
            letterSpacing:'0.02em', textTransform:'uppercase', marginTop:14,
            color:'var(--white)', overflow:'hidden'
          }}>
            HEURES<br/><span style={{color:'var(--brand)'}}>D'OUVERTURE</span>
          </div>
        </div>

        <div style={{display:'flex', flexDirection:'column', flex:'1 1 0', minHeight:0, overflow:'hidden', justifyContent:'center'}}>
          {data.days.map((d, i) => (
            <div key={i} style={{
              display:'flex', justifyContent:'space-between', alignItems:'baseline',
              padding:`${Math.round(ts*9)}px 0`,
              borderTop: i===0 ? '2px solid rgba(255,255,255,0.18)' : 'none',
              borderBottom:'2px solid rgba(255,255,255,0.18)'
            }}>
              <div style={{
                fontFamily:'var(--font-display)', fontSize:Math.round(ts*34), letterSpacing:'0.06em',
                color: d.closed ? 'rgba(255,255,255,0.35)' : 'var(--white)'
              }}>{d.day}</div>
              <div style={{
                fontFamily:'var(--font-alt)', fontSize:Math.round(ts*22), fontWeight:600,
                letterSpacing:'0.04em',
                color: d.closed ? 'rgba(255,255,255,0.35)' : 'var(--white)'
              }}>
                {d.hours}
              </div>
            </div>
          ))}
        </div>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexShrink:0}}>
          <div>
            <div style={{fontSize:11, fontWeight:800, letterSpacing:'0.28em', color:'rgba(255,255,255,0.45)'}}>OÙ NOUS TROUVER</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:Math.round(ts*32), letterSpacing:'0.04em', marginTop:4}}>{data.address}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:11, fontWeight:800, letterSpacing:'0.28em', color:'rgba(255,255,255,0.45)'}}>{data.footerRight}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
T4HoraireB.defaults = {
  eyebrow: 'SALON ÉCLAT · NOUVEAUX HORAIRES',
  days: [
    { day:'LUN', hours:'09H00 — 18H00' },
    { day:'MAR', hours:'09H00 — 20H00' },
    { day:'MER', hours:'09H00 — 18H00' },
    { day:'JEU', hours:'09H00 — 20H00' },
    { day:'VEN', hours:'09H00 — 17H00' },
    { day:'SAM', hours:'10H00 — 16H00' },
    { day:'DIM', hours:'SUR RENDEZ-VOUS', closed:true },
  ],
  address: '125 RUE PRINCIPALE',
  footerRight: 'TEL · 418 555 0188',
};

window.T4HoraireA = T4HoraireA;
window.T4HoraireB = T4HoraireB;
