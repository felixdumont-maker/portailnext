/* global React */
/**
 * T1 — ANNONCE / ÉVÉNEMENT (Gameday générique)
 * Variante A — fidèle au système : hachures + Bebas + glass strip
 * Variante B — exploratoire : grand chiffre date façon affiche, accent jaune, sans hachure
 */
const { useState: t1us } = React;

function T1EventA({ data = T1EventA.defaults }) {
  const ts = data._titleScale || 1;
  return (
    <div className="stage-1080" id="T1-A">
      <div style={{position:'absolute', inset:0, padding:'72px 80px', display:'flex', flexDirection:'column', overflow:'hidden'}}>
        {/* Header */}
        <div style={{display:'flex', flexDirection:'column', gap:18, flexShrink:0}}>
          <div className="kit-eyebrow">{data.eyebrow}</div>
          <div className="kit-hero" style={{fontSize:Math.round(ts*170), marginTop:-4, overflow:'hidden'}}>
            {data.heroLine1}<br/>{data.heroLine2}
          </div>
          <div style={{marginTop:6}}>
            <span className="kit-pill">{data.pill}</span>
          </div>
        </div>

        {/* Photo bleed center */}
        <div style={{
          flex:'1 1 0', minHeight:0, marginTop:38, position:'relative',
          borderRadius:'var(--r-card-lg)', overflow:'hidden'
        }}>
          <div className="photo-box" style={{position:'absolute', inset:0, fontSize:32}}>
            {data.photo
              ? <img src={data.photo} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />
              : <span>PHOTO<br/>VITRINE / PRODUIT</span>
            }
          </div>
          {/* photo→brand bottom fade */}
          <div style={{
            position:'absolute', inset:0,
            background:'linear-gradient(to top, var(--brand) 0%, transparent 55%)'
          }}/>
        </div>

        {/* Glass info strip */}
        <div style={{
          marginTop:28,
          background:'var(--surface-darker)', backdropFilter:'blur(10px)',
          WebkitBackdropFilter:'blur(10px)',
          border:'1px solid var(--border-soft)', borderRadius:'var(--r-card)',
          padding:'24px 32px',
          display:'grid', gridTemplateColumns:'repeat(3, 1fr)',
          gap:24, textAlign:'center'
        }}>
          <InfoCellT1 label="DATE"  value={data.date}/>
          <InfoCellT1 label="HEURE" value={data.time}/>
          <InfoCellT1 label="LIEU"  value={data.place}/>
        </div>

        {/* Footer */}
        <div className="kit-footer" style={{marginTop:28}}>
          <span className="kit-footer-left">{data.footerLeft}</span>
          <span className="kit-footer-right">{data.footerRight}</span>
        </div>
      </div>
    </div>
  );
}
function InfoCellT1({label, value}) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:6}}>
      <div style={{fontSize:11, fontWeight:800, letterSpacing:'0.28em', color:'var(--fg-muted)'}}>{label}</div>
      <div style={{fontFamily:'var(--font-display)', fontSize:34, letterSpacing:'0.04em'}}>{value}</div>
    </div>
  );
}
T1EventA.defaults = {
  eyebrow: 'BOUTIQUE MARGUERITE · MONTRÉAL',
  heroLine1: 'GRANDE',
  heroLine2: 'OUVERTURE',
  pill: 'SAMEDI 17 MAI',
  date:  '17 MAI',
  time:  '10 H 00',
  place: 'RUE NOTRE-DAME',
  footerLeft:  'NOM DE L\'ENTREPRISE',
  footerRight: 'SUIVEZ-NOUS · @MARGUERITE',
};

/* ---------------------------------------------------------------------- */

function T1EventB({ data = T1EventB.defaults }) {
  const ts = data._titleScale || 1;
  return (
    <div className="stage-1080 no-hatch" id="T1-B" style={{backgroundColor:'var(--brand)'}}>
      {/* big yellow tilted shape behind date */}
      <div style={{
        position:'absolute', right:-120, top:120, width:780, height:780,
        background:'var(--accent)', borderRadius:'50%',
        filter:'drop-shadow(0 24px 60px rgba(0,0,0,0.25))'
      }}/>
      {/* small dot accents */}
      <div style={{position:'absolute', left:80, bottom:280, width:14, height:14, borderRadius:'50%', background:'var(--white)'}}/>
      <div style={{position:'absolute', left:120, bottom:240, width:8, height:8, borderRadius:'50%', background:'var(--accent)'}}/>

      <div style={{position:'absolute', inset:0, padding:'80px', display:'flex', flexDirection:'column', justifyContent:'space-between', overflow:'hidden'}}>
        <div>
          <div className="kit-eyebrow" style={{color:'rgba(255,255,255,0.7)'}}>{data.eyebrow}</div>
          <div className="kit-hero" style={{fontSize:Math.round(ts*130), marginTop:18, maxWidth:620, overflow:'hidden'}}>
            {data.heroLine1}<br/>
            <span style={{color:'var(--accent)'}}>{data.heroLine2}</span>
          </div>
          <div style={{
            marginTop:20, fontFamily:'var(--font-body)', fontSize:18, lineHeight:1.5,
            color:'var(--fg-primary)', maxWidth:480, fontWeight:500
          }}>
            {data.body}
          </div>
        </div>

        {/* Big date numeric in circle */}
        <div style={{
          position:'absolute', right:80, top:200, width:520, height:520,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          color:'var(--ink)', textAlign:'center', overflow:'hidden'
        }}>
          <div style={{fontFamily:'var(--font-display)', fontSize:Math.round(ts*34), letterSpacing:'0.32em'}}>{data.dayName}</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:Math.round(ts*300), lineHeight:0.85, letterSpacing:'-0.03em'}}>{data.dayNum}</div>
          <div style={{fontFamily:'var(--font-display)', fontSize:Math.round(ts*48), letterSpacing:'0.18em'}}>{data.month}</div>
          <div style={{marginTop:14, fontSize:13, fontWeight:800, letterSpacing:'0.32em'}}>{data.time} · {data.place}</div>
        </div>

        {/* footer */}
        <div className="kit-footer">
          <span className="kit-footer-left">{data.footerLeft}</span>
          <span className="kit-footer-right">{data.footerRight}</span>
        </div>
      </div>
    </div>
  );
}
T1EventB.defaults = {
  eyebrow: 'PORTES OUVERTES · IMMOBILIER ROY',
  heroLine1: 'VENEZ',
  heroLine2: 'VISITER',
  body: 'Cinq nouvelles propriétés à découvrir, café et croissants offerts toute la matinée.',
  dayName: 'SAMEDI',
  dayNum:  '24',
  month:   'MAI',
  time:    '10H–14H',
  place:   '450 BOUL. ST-JOSEPH',
  footerLeft:  'IMMOBILIER ROY · CENTRE-VILLE',
  footerRight: 'INFOS · 514 555 0123',
};

window.T1EventA = T1EventA;
window.T1EventB = T1EventB;
