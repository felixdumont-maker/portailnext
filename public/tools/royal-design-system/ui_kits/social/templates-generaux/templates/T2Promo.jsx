/* global React */
/**
 * T2 — PROMO / OFFRE
 * Variante A — fidèle : pourcentage géant Bebas, hachures, pill SOLDES
 * Variante B — exploratoire : composition typographique stacked, accent shape, sans photo
 */

function T2PromoA({ data = T2PromoA.defaults }) {
  const ts = data._titleScale || 1;
  return (
    <div className="stage-1080" id="T2-A">
      <div style={{position:'absolute', inset:0, padding:'72px 80px', display:'flex', flexDirection:'column', overflow:'hidden'}}>
        {/* Header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexShrink:0}}>
          <div className="kit-eyebrow">{data.eyebrow}</div>
          <span className="kit-pill" style={{background:'var(--ink)', color:'var(--white)'}}>{data.tag}</span>
        </div>

        {/* Mid: Big % centered */}
        <div style={{flex:'1 1 0', minHeight:0, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden'}}>
          <div style={{textAlign:'center', position:'relative'}}>
            <div className="kit-hero" style={{fontSize:Math.round(ts*80), color:'var(--fg-primary)'}}>
              {data.kicker}
            </div>
            <div style={{
              fontFamily:'var(--font-display)',
              fontSize:Math.round(ts*520), lineHeight:0.82,
              letterSpacing:'-0.04em',
              textShadow:'var(--shadow-press-lg)',
              display:'flex', alignItems:'baseline', justifyContent:'center'
            }}>
              <span>{data.value}</span>
              <span style={{fontSize:Math.round(ts*200), marginLeft:8}}>{data.unit}</span>
            </div>
            <div className="kit-hero" style={{fontSize:Math.round(ts*60), marginTop:-8}}>
              {data.suffix}
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div style={{
          background:'var(--surface-darker)', backdropFilter:'blur(10px)',
          WebkitBackdropFilter:'blur(10px)',
          border:'1px solid var(--border-soft)', borderRadius:'var(--r-card)',
          padding:'24px 32px',
          display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:24
        }}>
          <div>
            <div style={{fontSize:11, fontWeight:800, letterSpacing:'0.28em', color:'var(--fg-muted)'}}>CONDITIONS</div>
            <div style={{fontSize:14, marginTop:6, fontWeight:600, color:'var(--fg-primary)'}}>{data.terms}</div>
          </div>
          <div>
            <div style={{fontSize:11, fontWeight:800, letterSpacing:'0.28em', color:'var(--fg-muted)'}}>JUSQU'AU</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:30, letterSpacing:'0.04em', marginTop:4}}>{data.until}</div>
          </div>
          <div>
            <div style={{fontSize:11, fontWeight:800, letterSpacing:'0.28em', color:'var(--fg-muted)'}}>CODE</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:30, letterSpacing:'0.18em', marginTop:4}}>{data.code}</div>
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
T2PromoA.defaults = {
  eyebrow: 'SALON ÉCLAT · OFFRE LIMITÉE',
  tag:     'EXCLUSIF EN LIGNE',
  kicker:  'JUSQU\'À',
  value:   '40',
  unit:    '%',
  suffix:  'DE RABAIS',
  terms:   'Sur tout produit de soin capillaire en boutique et en ligne.',
  until:   '30 MAI',
  code:    'ÉCLAT40',
  footerLeft:  'SALON ÉCLAT · QUÉBEC',
  footerRight: 'WWW.SALONECLAT.CA',
};

/* ---------------------------------------------------------------------- */

function T2PromoB({ data = T2PromoB.defaults }) {
  const ts = data._titleScale || 1;
  return (
    <div className="stage-1080 no-hatch bg-cream" id="T2-B">
      {/* Big brand shape anchor right */}
      <div style={{
        position:'absolute', right:-180, top:-180, width:780, height:780,
        background:'var(--brand)', borderRadius:'50%'
      }}/>
      {/* Accent square */}
      <div style={{
        position:'absolute', right:140, bottom:130, width:160, height:160,
        background:'var(--accent)', transform:'rotate(8deg)'
      }}/>

      <div style={{position:'absolute', inset:0, padding:'80px', display:'flex', flexDirection:'column', justifyContent:'space-between', overflow:'hidden'}}>
        <div style={{overflow:'hidden', flex:'1 1 0', minHeight:0}}>
          <div className="kit-eyebrow" style={{color:'rgba(26,7,8,0.5)'}}>{data.eyebrow}</div>
          <div style={{
            fontFamily:'var(--font-display)', fontSize:Math.round(ts*240), lineHeight:0.82,
            letterSpacing:'0.02em', textTransform:'uppercase',
            color:'var(--ink)', marginTop:24, maxWidth:760, overflow:'hidden'
          }}>
            {data.line1}<br/>
            <span style={{color:'var(--brand)'}}>{data.line2}</span><br/>
            {data.line3}
          </div>
        </div>

        <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:24}}>
          <div style={{maxWidth:520}}>
            <div style={{fontSize:13, fontWeight:800, letterSpacing:'0.28em', color:'rgba(26,7,8,0.55)', textTransform:'uppercase'}}>L'OFFRE</div>
            <div style={{fontSize:22, lineHeight:1.4, fontWeight:600, marginTop:8, color:'var(--ink)'}}>{data.body}</div>
          </div>
          <div style={{
            background:'var(--ink)', color:'var(--white)',
            padding:'18px 26px', borderRadius:8,
            display:'flex', flexDirection:'column', gap:4, alignItems:'flex-end'
          }}>
            <div style={{fontSize:10, fontWeight:800, letterSpacing:'0.28em'}}>UTILISEZ</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:36, letterSpacing:'0.18em', lineHeight:1}}>{data.code}</div>
          </div>
        </div>

        <div className="kit-footer" style={{color:'rgba(26,7,8,0.45)'}}>
          <span style={{fontSize:11, fontWeight:700, letterSpacing:'0.20em', textTransform:'uppercase'}}>{data.footerLeft}</span>
          <span style={{fontSize:11, fontWeight:700, letterSpacing:'0.20em', textTransform:'uppercase'}}>{data.footerRight}</span>
        </div>
      </div>
    </div>
  );
}
T2PromoB.defaults = {
  eyebrow: 'BOUTIQUE COMPLICE · LIQUIDATION',
  line1:   'TOUT',
  line2:   'DOIT',
  line3:   'PARTIR.',
  body:    'Trois jours seulement. Sélection printemps à 50% en boutique uniquement.',
  code:    'ADIEU50',
  footerLeft:  'BOUTIQUE COMPLICE',
  footerRight: '21 — 23 MAI',
};

window.T2PromoA = T2PromoA;
window.T2PromoB = T2PromoB;
