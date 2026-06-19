/* global React */
// R06 — Alignement de départ · Royal de Shawinigan
// Canvas 1080×1080 (1:1) — cartes portrait 3:4, buste→tête
function R06Alignement({ data = R06Alignement.defaults }) {
  const isX    = data._team === 'xtreme';
  const colors = data.colors || {};
  const bgGrad = colors.bg    || 'linear-gradient(135deg,#d31a20 0%,#b21015 60%,#8a0d12 100%)';
  const cream  = colors.cream || '#f1eadb';
  const cream2 = colors.cream2|| '#e7dfcc';
  const red    = colors.accent|| '#c8141a';
  const onBg   = colors.onBg  || '#fff';   // couleur du texte sur le fond — à passer en sombre si fond clair

  const players      = data.players   || [];
  const scratches    = data.scratches || [];

  const OSWALD  = "'Oswald','Impact',sans-serif";
  const MANROPE = "'Manrope','Plus Jakarta Sans',system-ui,sans-serif";

  // ── Dimensions des cartes ─────────────────────────────────────────────────
  // 4 cartes/rangée + 1 séparateur visuel (11 px) · 3 rangées
  // cardW ≈ 236 px · cardH ≈ 294 px → portrait ✓ (bust→tête)
  const INNER_H   = 1012;
  const TITLE_H   = 72;
  const FOOTER_H  = 46;
  const SCRATCH_H = scratches.length > 0 ? 65 : 0;
  const AVAIL     = INNER_H - TITLE_H - FOOTER_H - SCRATCH_H;

  const SEP_W  = 11;                                           // 1 px trait + 5 px × 2
  const cardW  = Math.floor((972 - 3 * 5 - SEP_W) / 4);      // ≈ 236 px
  const cardH  = Math.floor((AVAIL - 2 * 5) / 3);             // ≈ 294 px

  // ── Carte joueuse ─────────────────────────────────────────────────────────
  function PlayerCard({ p }) {
    return (
      <div style={{
        width: cardW, height: cardH, flexShrink: 0,
        background: p.isCap ? cream : 'rgba(0,0,0,0.22)',
        border: `1px solid ${p.isCap ? cream2 : 'rgba(0,0,0,0.32)'}`,
        borderRadius: 13, padding: 7,
        display: 'flex', flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden', boxSizing: 'border-box',
      }}>
        {!p.photo && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: 'repeating-linear-gradient(135deg,rgba(255,255,255,0.04) 0 6px,rgba(255,255,255,0) 6px 12px)',
            backgroundColor: 'rgba(0,0,0,0.28)',
            border: '1px dashed rgba(255,255,255,0.12)',
            display: 'grid', placeItems: 'center',
            fontFamily: OSWALD, fontWeight: 700, fontSize: 25,
            color: 'rgba(255,255,255,0.18)',
          }}>#{p.num}</div>
        )}
        <div style={{ position: 'relative', borderRadius: 9, overflow: 'hidden', zIndex: 1, flex: 1 }}>
          {p.photo ? (
            <img src={p.photo} alt="" style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'top center', display: 'block',
              transform: 'scale(1.07)', transformOrigin: 'center top',
            }} />
          ) : (
            <div style={{ width: '100%', height: '100%' }} />
          )}
          {/* Numéro */}
          <div style={{
            position: 'absolute', top: 5, left: 7,
            fontFamily: OSWALD, fontWeight: 700, fontSize: 23, lineHeight: 1,
            color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.9)', letterSpacing: '-0.02em',
          }}>{p.num}</div>
          {/* Badge G */}
          {p.isCap && (
            <div style={{
              position: 'absolute', top: 5, right: 5,
              background: red, color: '#fff',
              width: 18, height: 18, borderRadius: '50%',
              display: 'grid', placeItems: 'center',
              fontSize: 9, fontWeight: 800, fontFamily: OSWALD,
              boxShadow: `0 0 0 2px ${cream}`,
            }}>G</div>
          )}
          {/* Nom — gradient bas */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(to top,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0) 100%)',
            padding: '28px 6px 7px',
          }}>
            <div style={{ fontFamily: OSWALD, fontWeight: 600, fontSize: 11, lineHeight: 1.1, textTransform: 'uppercase', color: p.isCap ? cream : 'rgba(255,255,255,0.80)', letterSpacing: '0.01em' }}>
              {p.firstName}
            </div>
            <div style={{ fontFamily: OSWALD, fontWeight: 700, fontSize: 15, lineHeight: 1.0, textTransform: 'uppercase', color: p.isCap ? cream : '#fff' }}>
              {p.lastName}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Lineup mémoïsé ── recalculé seulement si roster / dimensions / couleurs changent.
  // Taper dans un champ texte (match, date, footer…) ne re-rend plus les 12 cartes + photos.
  const lineupGrid = React.useMemo(() => {
    const fieldPlayers = players.filter(p => !p.isCap);
    const goalies      = players.filter(p =>  p.isCap);
    const lineRows = [
      { field: fieldPlayers.slice(0, 3), special: goalies[0]      || null },
      { field: fieldPlayers.slice(3, 6), special: goalies[1]      || null },
      { field: fieldPlayers.slice(6, 9), special: fieldPlayers[9] || null },
    ];
    return (
      <div style={{ marginTop:'auto', display:'flex', flexDirection:'column', gap:5 }}>
        {lineRows.map((row, ri) => (
          <div key={ri} style={{ display:'flex', gap:5, justifyContent:'center', alignItems:'flex-start' }}>
            {row.field.map((p, i) => <PlayerCard key={i} p={p} />)}
            {row.special && (
              <React.Fragment>
                <div style={{ width:1, background:'rgba(255,255,255,0.28)', alignSelf:'stretch', flexShrink:0, margin:'0 5px' }} />
                <PlayerCard p={row.special} />
              </React.Fragment>
            )}
          </div>
        ))}
      </div>
    );
  }, [players, cardW, cardH, cream, cream2, red]);

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ width:1080, height:1080, overflow:'hidden', position:'relative', fontFamily:MANROPE, color:onBg, background:bgGrad }}>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:'repeating-linear-gradient(115deg,rgba(255,255,255,0) 0 34px,rgba(255,255,255,0.035) 34px 68px)' }} />
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'radial-gradient(810px 450px at 88% 12%,rgba(255,255,255,0.10),transparent 60%),radial-gradient(630px 630px at -10% 110%,rgba(0,0,0,0.35),transparent 60%)' }} />

      <div style={{ position:'absolute', inset:0, padding:'40px 54px 28px', display:'flex', flexDirection:'column', zIndex:2 }}>

        {/* Logo — affiché seulement si fourni (aucun placeholder) */}
        {data.logo && (
          <div style={{
            position:'absolute', right:45, top:40, width:86, height:86, borderRadius:'50%',
            background:'rgba(0,0,0,0.25)', border:'2px solid rgba(255,255,255,0.55)',
            display:'grid', placeItems:'center', overflow:'hidden', zIndex:3,
          }}>
            <img src={data.logo} alt="Logo" style={{ width:'100%', height:'100%', objectFit:'contain', padding:9 }} />
          </div>
        )}

        {/* Titre */}
        <div style={{ fontFamily:OSWALD, fontWeight:700, fontSize:72, lineHeight:1.0, letterSpacing:'-0.01em', textTransform:'uppercase', textShadow:'0 3px 0 rgba(0,0,0,0.12)', whiteSpace:'nowrap' }}>
          Alignement de départ
        </div>

        {/* Zone grilles — 3 rangées de 4 : [p p p | spéciale] (mémoïsée) */}
        {lineupGrid}

        {/* En civil */}
        {scratches.length > 0 && (
          <div style={{ marginTop:5, padding:'7px 14px', background:'rgba(0,0,0,0.18)', border:'1px solid rgba(0,0,0,0.28)', borderRadius:13 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:9, marginBottom:4 }}>
              <div style={{ fontFamily:OSWALD, fontSize:16, textTransform:'uppercase', letterSpacing:'0.04em' }}>En civil</div>
              <div style={{ fontSize:9, letterSpacing:'0.22em', color:'rgba(255,255,255,0.55)', fontWeight:700 }}>{isX ? 'présents au match · non en uniforme' : 'présentes au match · non en uniforme'}</div>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {scratches.map((s, i) => (
                <div key={i} style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 13px 6px 7px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.16)', borderRadius:999 }}>
                  <div style={{ fontFamily:OSWALD, fontSize:13, fontWeight:700, background:'#fff', color:red, width:21, height:21, borderRadius:'50%', display:'grid', placeItems:'center', flexShrink:0 }}>
                    {s.num}
                  </div>
                  <span style={{ textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600, fontSize:11, whiteSpace:'nowrap' }}>{s.name}</span>
                  {s.tag && (
                    <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.6)', borderLeft:'1px solid rgba(255,255,255,0.2)', paddingLeft:7, whiteSpace:'nowrap' }}>{s.tag}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop:'auto', paddingTop:10, display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:'0.24em', textTransform:'uppercase', color:'rgba(255,255,255,0.55)', display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ whiteSpace:'nowrap' }}>{data.matchNum}</span>
            {!data.hideSeps && data.matchNum && data.date   && <span style={{ width:3, height:3, background:'rgba(255,255,255,0.45)', borderRadius:'50%', flexShrink:0 }} />}
            <span style={{ whiteSpace:'nowrap' }}>{data.date}</span>
            {!data.hideSeps && data.date   && data.time   && <span style={{ width:3, height:3, background:'rgba(255,255,255,0.45)', borderRadius:'50%', flexShrink:0 }} />}
            <span style={{ whiteSpace:'nowrap' }}>{data.time}</span>
            {!data.hideSeps && data.time   && data.arena  && <span style={{ width:3, height:3, background:'rgba(255,255,255,0.45)', borderRadius:'50%', flexShrink:0 }} />}
            <span style={{ whiteSpace:'nowrap' }}>{data.arena}</span>
          </div>
          {(data.sponsors||[]).filter(sp=>sp.logo).length > 0 ? (
            <div style={{display:'flex', alignItems:'center', gap:14}}>
              {(data.sponsors||[]).filter(sp=>sp.logo).map((sp,i)=>(
                <img key={i} src={sp.logo} alt="" style={{height:28, maxWidth:100, objectFit:'contain', opacity:0.80}}/>
              ))}
            </div>
          ) : (
            <div style={{ textAlign:'right', fontSize:10, fontWeight:700, letterSpacing:'0.24em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)', lineHeight:1.8, flexShrink:0, marginLeft:16 }}>
              <div>{data.footerLeft}</div>
              <div>{data.footerRight}</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

R06Alignement.defaults = {
  _team: 'royal',
  matchNum: 'Match #01',
  date:     'Sam. 11 Oct.',
  time:     '19 H 30',
  arena:    'Centre Gervais Auto',
  hideSeps: false,
  logo:     '',
  players: (function() {
    const P = '/tools/royal-design-system/ui_kits/social/royal-photos/';
    return [
      // 3×3 — rangées 1–3
      { num:'66', firstName:'Kim-Audrey',  lastName:'Richer',        isCap:false, photo: P+'kim-audrey-richer-1.jpg'       },
      { num:'13', firstName:'Aryelle',     lastName:'Gendron',       isCap:false, photo: P+'aryelle-gendron.jpg'           },
      { num:'23', firstName:'Stéphanie',   lastName:'Marchand',      isCap:false, photo: P+'stephanie-marchand.jpg'        },
      { num:'5',  firstName:'Pascale',     lastName:'Lebeau',        isCap:false, photo: P+'pascale-lebeau.jpg'            },
      { num:'15', firstName:'Valérie',     lastName:'Gobeil',        isCap:false, photo: P+'valerie-gobeil-1.jpg'          },
      { num:'55', firstName:'Aryane',      lastName:'Turgeon',       isCap:false, photo: P+'aryane-turgeon.jpg'            },
      { num:'9',  firstName:'Léa',         lastName:'Baril',         isCap:false, photo: P+'lea-baril.jpg'                 },
      { num:'10', firstName:'Océane',      lastName:'Beauregard',    isCap:false, photo: P+'oceanne-beauregard.jpg'        },
      { num:'4',  firstName:'Catherine',   lastName:'Côté',          isCap:false, photo: P+'catherine-cote.jpg'            },
      // +1 — rangée 4 gauche
      { num:'8',  firstName:'Audrey',      lastName:'Vachon',        isCap:false, photo: P+'audrey-vachon.jpg'             },
      // Gardiennes — rangée 4 droite
      { num:'81', firstName:'Audrey-Anne', lastName:'Lasablonnière', isCap:true,  photo: P+'audrey-anne-lasablonniere.jpg' },
      { num:'88', firstName:'Laurence',    lastName:'Descoteaux',    isCap:true,  photo: P+'laurence-descoteaux.jpg'       },
    ];
  })(),
  scratches:   [],
  footerLeft:  'Royal de Shawinigan · LNHBF',
  footerRight: 'Cocktail Média',
  sponsors:    [],
  colors: {},
};

window.R06Alignement = R06Alignement;
