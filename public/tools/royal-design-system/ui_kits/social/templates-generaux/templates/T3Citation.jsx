/* global React */
/**
 * T3 — CITATION / TÉMOIGNAGE
 * Variante A — fidèle : grosses guillemets, photo client trapézoïdale, hachures
 * Variante B — exploratoire : citation en serif Fraunces, fond crème, étoiles 5/5
 */

function T3CitationA({ data = T3CitationA.defaults }) {
  const ts = data._titleScale || 1;
  return (
    <div className="stage-1080" id="T3-A">
      <div style={{position:'absolute', inset:0, padding:'72px 80px', display:'flex', flexDirection:'column', overflow:'hidden'}}>
        {/* Header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0}}>
          <div className="kit-eyebrow">{data.eyebrow}</div>
          <span className="kit-pill">{data.pill}</span>
        </div>

        {/* Big quote mark */}
        <div style={{
          fontFamily:'var(--font-display)', fontSize:Math.round(ts*360), lineHeight:0.7,
          color:'var(--accent)', marginTop:8, marginLeft:-12,
          textShadow:'var(--shadow-press-lg)', flexShrink:0
        }}>"</div>

        {/* Quote */}
        <div style={{marginTop:Math.round(ts*-90), paddingRight:40, flex:'1 1 0', minHeight:0, overflow:'hidden'}}>
          <div style={{
            fontFamily:'var(--font-display)', fontSize:Math.round(ts*84), lineHeight:0.96,
            letterSpacing:'0.02em', textShadow:'var(--shadow-press)',
            textTransform:'uppercase', overflow:'hidden'
          }}>{data.quote}</div>
        </div>

        {/* Author block */}
        <div style={{
          display:'flex', alignItems:'center', gap:24,
          padding:'24px 28px',
          background:'var(--surface-darker)', backdropFilter:'blur(10px)',
          WebkitBackdropFilter:'blur(10px)',
          border:'1px solid var(--border-soft)', borderRadius:'var(--r-card)'
        }}>
          {/* Avatar */}
          <div className="photo-box" style={{
            width:120, height:120, borderRadius:'50%', flexShrink:0, fontSize:11, overflow:'hidden'
          }}>
            {data.photo
              ? <img src={data.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
              : <span>PHOTO<br/>CLIENT</span>
            }
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:'var(--font-display)', fontSize:Math.round(ts*42), letterSpacing:'0.04em', lineHeight:1}}>{data.name}</div>
            <div style={{fontSize:13, fontWeight:700, letterSpacing:'0.18em', color:'var(--fg-tertiary)', textTransform:'uppercase', marginTop:8}}>
              {data.role}
            </div>
          </div>
          <div style={{display:'flex', gap:6}}>
            {Array.from({length:5}).map((_,i)=> (
              <Star key={i} filled={i < data.rating}/>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="kit-footer" style={{marginTop:24}}>
          <span className="kit-footer-left">{data.footerLeft}</span>
          <span className="kit-footer-right">{data.footerRight}</span>
        </div>
      </div>
    </div>
  );
}
function Star({filled}) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={filled?'var(--accent)':'none'} stroke={filled?'var(--accent)':'rgba(255,255,255,0.35)'} strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
    </svg>
  );
}
T3CitationA.defaults = {
  eyebrow: 'TÉMOIGNAGE CLIENT · IMMOBILIER ROY',
  pill:    '★ 5/5',
  quote:   'L\'équipe a vendu notre maison en huit jours. Service hors pair.',
  name:    'JULIE LEVASSEUR',
  role:    'PROPRIÉTAIRE · LAVAL',
  rating:  5,
  footerLeft:  'IMMOBILIER ROY',
  footerRight: 'AVIS · GOOGLE',
};

/* ---------------------------------------------------------------------- */

function T3CitationB({ data = T3CitationB.defaults }) {
  const ts = data._titleScale || 1;
  return (
    <div className="stage-1080 no-hatch bg-cream" id="T3-B">
      {/* Brand stripe top */}
      <div style={{position:'absolute', left:0, right:0, top:0, height:14, background:'var(--brand)'}}/>
      {/* Accent dot bottom-left */}
      <div style={{position:'absolute', left:80, bottom:120, width:16, height:16, borderRadius:'50%', background:'var(--brand)'}}/>

      <div style={{position:'absolute', inset:0, padding:'100px 96px 80px', display:'flex', flexDirection:'column', overflow:'hidden'}}>

        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0}}>
          <div style={{
            fontSize:11, fontWeight:800, letterSpacing:'0.32em', textTransform:'uppercase',
            color:'rgba(26,7,8,0.55)'
          }}>{data.eyebrow}</div>
          <div style={{display:'flex', gap:6}}>
            {Array.from({length:5}).map((_,i)=> (
              <svg key={i} width="26" height="26" viewBox="0 0 24 24" fill={i<data.rating?'var(--brand)':'none'} stroke={i<data.rating?'var(--brand)':'rgba(26,7,8,0.25)'} strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
              </svg>
            ))}
          </div>
        </div>

        {/* Open quote */}
        <div style={{
          fontFamily:'var(--font-serif)', fontSize:Math.round(ts*280), lineHeight:0.6,
          color:'var(--brand)', marginTop:18, marginLeft:-16, fontWeight:700, flexShrink:0
        }}>"</div>

        {/* Quote */}
        <div style={{
          fontFamily:'var(--font-serif)', fontStyle:'italic',
          fontSize:Math.round(ts*64), lineHeight:1.1, color:'var(--ink)',
          marginTop:Math.round(ts*-90), fontWeight:500, maxWidth:840,
          textWrap:'pretty', flex:'1 1 0', minHeight:0, overflow:'hidden'
        }}>
          {data.quote}
        </div>

        {/* Signature */}
        <div style={{display:'flex', alignItems:'center', gap:20, flexShrink:0}}>
          <div style={{width:64, height:2, background:'var(--ink)'}}/>
          <div>
            <div style={{
              fontFamily:'var(--font-display)', fontSize:Math.round(ts*36), letterSpacing:'0.04em',
              color:'var(--ink)', lineHeight:1
            }}>{data.name}</div>
            <div style={{
              fontSize:13, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase',
              color:'rgba(26,7,8,0.55)', marginTop:6
            }}>{data.role}</div>
          </div>
        </div>

        <div style={{
          marginTop:36, display:'flex', justifyContent:'space-between',
          fontSize:11, fontWeight:700, letterSpacing:'0.20em', textTransform:'uppercase',
          color:'rgba(26,7,8,0.40)'
        }}>
          <span>{data.footerLeft}</span>
          <span>{data.footerRight}</span>
        </div>
      </div>
    </div>
  );
}
T3CitationB.defaults = {
  eyebrow: 'CE QU\'ELLES EN DISENT',
  rating:  5,
  quote:   '« Mon balayage est encore parfait après quatre mois. Je n\'irai nulle part ailleurs. »',
  name:    'AUDREY GAGNON',
  role:    'CLIENTE FIDÈLE',
  footerLeft:  'SALON ÉCLAT',
  footerRight: 'AVIS · 4,9 / 5 SUR GOOGLE',
};

window.T3CitationA = T3CitationA;
window.T3CitationB = T3CitationB;
