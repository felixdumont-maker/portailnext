/* global React */
// R11 — Starting 3 · Royal de Shawinigan / Xtreme
// 3 joueurs portrait en rangée + 1 gardien(ne) pleine largeur en bas
function R11Starting3({ data = R11Starting3.defaults }) {
  const colors = data.colors || {};
  const bgGrad = colors.bg || 'linear-gradient(135deg,#d31a20 0%,#b21015 60%,#8a0d12 100%)';
  const cream  = colors.cream  || '#f1eadb';
  const cream2 = colors.cream2 || '#e7dfcc';
  const red    = colors.accent || '#c8141a';

  const dark    = !!colors.darkOnLight;
  const fg      = dark ? '#062045'              : '#fff';
  const fgSub   = dark ? 'rgba(6,32,69,0.65)'  : 'rgba(255,255,255,0.58)';
  const fgMuted = dark ? 'rgba(6,32,69,0.45)'  : 'rgba(255,255,255,0.55)';
  const fgFaint = dark ? 'rgba(6,32,69,0.28)'  : 'rgba(255,255,255,0.50)';

  const OSWALD  = "'Oswald','Impact',sans-serif";
  const MANROPE = "'Manrope','Plus Jakarta Sans',system-ui,sans-serif";

  const players = (data.players || []).slice(0, 3);
  const goalie  = data.goalie || {};
  const PAD = 54;
  const PLAYER_GAP = 12;

  function PlayerCard({ p }) {
    return (
      <div style={{
        flex: 1, minWidth: 0,
        background: 'rgba(0,0,0,0.22)',
        border: '1px solid rgba(0,0,0,0.32)',
        borderRadius: 13,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {p.photo ? (
          <img src={p.photo} alt="" style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: p.photoPos || 'top center',
            transform: 'scale(1.06)', transformOrigin: 'top center',
          }} />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(135deg,rgba(255,255,255,0.04) 0 6px,rgba(255,255,255,0) 6px 12px)',
            display: 'grid', placeItems: 'center',
            fontFamily: OSWALD, fontWeight: 700, fontSize: 44, color: 'rgba(255,255,255,0.13)',
          }}>#{p.num || '?'}</div>
        )}
        <div style={{
          position: 'absolute', top: 9, left: 11, zIndex: 2,
          fontFamily: OSWALD, fontWeight: 700, fontSize: 26, lineHeight: 1,
          color: '#fff', textShadow: '0 1px 8px rgba(0,0,0,1)',
        }}>{p.num}</div>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0) 100%)',
          padding: '40px 12px 12px',
        }}>
          <div style={{ fontFamily: OSWALD, fontWeight: 600, fontSize: 13, lineHeight: 1.15, textTransform: 'uppercase', color: 'rgba(255,255,255,0.72)', letterSpacing: '0.01em' }}>{p.firstName}</div>
          <div style={{ fontFamily: OSWALD, fontWeight: 700, fontSize: 20, lineHeight: 1.0, textTransform: 'uppercase', color: '#fff' }}>{p.lastName}</div>
          {p.position && <div style={{ fontFamily: MANROPE, fontWeight: 700, fontSize: 9, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{p.position}</div>}
        </div>
      </div>
    );
  }

  function GoalieCard({ g }) {
    const goalieLabel = data._team === 'xtreme' ? 'Gardien' : 'Gardienne';
    return (
      <div style={{
        flexShrink: 0, height: 220,
        background: cream, border: `2px solid ${cream2}`,
        borderRadius: 13, overflow: 'hidden',
        display: 'flex', position: 'relative',
      }}>
        <div style={{ width: 196, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          {g.photo ? (
            <img src={g.photo} alt="" style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: g.photoPos || 'top center',
              transform: 'scale(1.08)', transformOrigin: 'top center',
            }} />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'grid', placeItems: 'center',
              background: 'rgba(0,0,0,0.08)', fontFamily: OSWALD, fontWeight: 700,
              fontSize: 36, color: red, opacity: 0.5,
            }}>#{g.num || '?'}</div>
          )}
          <div style={{ position: 'absolute', top: 0, right: -1, bottom: 0, width: 56,
            background: `linear-gradient(90deg, transparent, ${cream})`, pointerEvents: 'none' }} />
        </div>
        <div style={{ flex: 1, padding: '20px 24px 20px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ background: red, color: '#fff', width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800, fontFamily: OSWALD, flexShrink: 0, boxShadow: `0 0 0 2px ${cream2}` }}>G</div>
            <div style={{ fontFamily: OSWALD, fontWeight: 700, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: red }}>{goalieLabel}</div>
          </div>
          <div style={{ fontFamily: OSWALD, fontWeight: 600, fontSize: 16, lineHeight: 1.1, textTransform: 'uppercase', color: 'rgba(0,0,0,0.50)', letterSpacing: '0.01em' }}>{g.firstName}</div>
          <div style={{ fontFamily: OSWALD, fontWeight: 800, fontSize: 46, lineHeight: 0.92, textTransform: 'uppercase', color: '#1a1a1a', marginBottom: 8 }}>{g.lastName || goalieLabel.toUpperCase()}</div>
          <div style={{ fontFamily: OSWALD, fontWeight: 700, fontSize: 22, color: red }}>#{g.num}</div>
        </div>
        <div style={{
          position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)',
          fontFamily: OSWALD, fontWeight: 900, fontSize: 168, lineHeight: 1, letterSpacing: '-0.04em',
          color: 'rgba(0,0,0,0.05)', userSelect: 'none', pointerEvents: 'none',
        }}>{g.num}</div>
      </div>
    );
  }

  return (
    <div style={{ width: 1080, height: 1080, overflow: 'hidden', position: 'relative', fontFamily: MANROPE, color: '#fff', background: bgGrad }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(115deg,rgba(255,255,255,0) 0 34px,rgba(255,255,255,0.035) 34px 68px)' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(810px 450px at 88% 12%,rgba(255,255,255,0.10),transparent 60%),radial-gradient(630px 630px at -10% 110%,rgba(0,0,0,0.35),transparent 60%)' }} />

      <div style={{ position: 'absolute', inset: 0, padding: `40px ${PAD}px 28px`, display: 'flex', flexDirection: 'column', zIndex: 2 }}>

        {/* Logo */}
        <div style={{
          position: 'absolute', right: 45, top: 40, width: 86, height: 86, borderRadius: '50%',
          background: 'rgba(0,0,0,0.25)',
          border: data.logo ? '2px solid rgba(255,255,255,0.55)' : '2px dashed rgba(255,255,255,0.35)',
          display: 'grid', placeItems: 'center', overflow: 'hidden', zIndex: 3,
        }}>
          {data.logo
            ? <img src={data.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 9 }} />
            : <div style={{ textAlign: 'center', color: fgMuted, fontFamily: MANROPE, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1.3 }}>LOGO</div>
          }
        </div>

        {/* Titre */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontFamily: OSWALD, fontWeight: 700, fontSize: 72, lineHeight: 1.0, letterSpacing: '-0.01em', textTransform: 'uppercase', textShadow: dark ? 'none' : '0 3px 0 rgba(0,0,0,0.12)', color: fg }}>
            Starting 3
          </div>
          {data.matchInfo && (
            <div style={{ fontFamily: MANROPE, fontWeight: 700, fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase', color: fgSub, marginTop: 6 }}>
              {data.matchInfo}
            </div>
          )}
        </div>

        {/* 3 joueurs */}
        <div style={{ marginTop: 18, flex: 1, minHeight: 0, display: 'flex', gap: PLAYER_GAP }}>
          {players.map((p, i) => <PlayerCard key={i} p={p} />)}
          {Array.from({ length: Math.max(0, 3 - players.length) }).map((_, i) => (
            <PlayerCard key={'ph' + i} p={{ num: '', firstName: '', lastName: 'JOUEUR', position: '' }} />
          ))}
        </div>

        {/* Gardien(ne) */}
        <div style={{ marginTop: 14, flexShrink: 0 }}>
          <GoalieCard g={goalie} />
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: fgMuted, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>{data.date}</span>
            {data.date && data.arena && <span style={{ width: 3, height: 3, background: fgMuted, borderRadius: '50%', flexShrink: 0 }} />}
            <span>{data.arena}</span>
          </div>
          {(data.sponsors||[]).filter(sp=>sp.logo).length > 0 ? (
            <div style={{display:'flex', alignItems:'center', gap:14}}>
              {(data.sponsors||[]).filter(sp=>sp.logo).map((sp,i)=>(
                <img key={i} src={sp.logo} alt="" style={{height:28, maxWidth:100, objectFit:'contain', opacity:0.80}}/>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'right', fontSize: 10, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: fgFaint, lineHeight: 1.8, flexShrink: 0 }}>
              <div>{data.footerLeft}</div>
              <div>{data.footerRight}</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

R11Starting3.defaults = {
  _team: 'royal',
  matchInfo: 'Sam. 11 Oct. · 19 H 30 · Centre Gervais Auto',
  date:  'Sam. 11 Oct.',
  arena: 'Centre Gervais Auto',
  logo:  '',
  players: (function () {
    const P = '/tools/royal-design-system/ui_kits/social/royal-photos/';
    return [
      { num: '66', firstName: 'Kim-Audrey', lastName: 'Richer',   position: 'Attaque', photo: P + 'kim-audrey-richer-1.jpg', photoPos: 'top center' },
      { num: '13', firstName: 'Aryelle',    lastName: 'Gendron',  position: 'Attaque', photo: P + 'aryelle-gendron.jpg',    photoPos: 'top center' },
      { num: '23', firstName: 'Stéphanie',  lastName: 'Marchand', position: 'Défense', photo: P + 'stephanie-marchand.jpg', photoPos: 'top center' },
    ];
  })(),
  goalie: (function () {
    const P = '/tools/royal-design-system/ui_kits/social/royal-photos/';
    return { num: '81', firstName: 'Audrey-Anne', lastName: 'Lasablonnière', photo: P + 'audrey-anne-lasablonniere.jpg', photoPos: 'top center' };
  })(),
  footerLeft:  'Royal de Shawinigan · LNHBF',
  footerRight: 'Cocktail Média',
  sponsors:    [],
  colors: {},
};

window.R11Starting3 = R11Starting3;
