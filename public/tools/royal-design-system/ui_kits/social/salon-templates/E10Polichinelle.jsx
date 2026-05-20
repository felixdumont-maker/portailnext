/* global React */
/**
 * E10 — POLICHINELLE (1:1) — proclamation / dicton de salon
 *  Format citation poétique avec voix éditoriale forte
 * A — Affiche couleur, énoncé géant en serif, ornements
 * B — Carte à secret, "secret de polichinelle" sur fond blush
 */

function E10PolichinelleA({ data = E10PolichinelleA.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-peach)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-camel-d)';

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>
      {/* corner ornaments */}
      {[
        { top: 60, left: 60 },
        { top: 60, right: 60, transform: 'scaleX(-1)' },
        { bottom: 60, left: 60, transform: 'scaleY(-1)' },
        { bottom: 60, right: 60, transform: 'scale(-1, -1)' },
      ].map((s, i) => (
        <div key={i} style={{ position:'absolute', ...s,
          fontFamily: f, fontStyle:'italic', fontSize: 28, color: accent,
        }}>✦</div>
      ))}

      <div style={{ position:'absolute', inset:0, padding:'120px 110px',
        display:'flex', flexDirection:'column', justifyContent:'space-between',
        textAlign:'center',
      }}>
        <div>
          <div style={{
            fontFamily: sans, fontSize: 12, fontWeight: 400,
            letterSpacing: '0.32em', textTransform: 'uppercase',
            color: accent,
          }}>{data.eyebrow}</div>
          <div style={{
            fontFamily: f, fontStyle:'italic', fontSize: 26,
            marginTop: 12, opacity: 0.8,
          }}>{data.kicker}</div>
        </div>

        <div>
          <div style={{
            fontFamily: f, fontWeight: data._titleWeight || 400,
            fontSize: Math.round(110 * ts), lineHeight: 0.94,
            letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.02em',
          }}>
            {data.title}
          </div>
          <div style={{
            fontFamily: f, fontStyle:'italic',
            fontSize: Math.round(58 * ts), lineHeight: 1.05,
            color: accent, marginTop: 18,
          }}>{data.titleItalic}</div>
        </div>

        <div>
          <div style={{ display:'flex', justifyContent:'center', marginBottom: 14 }}>
            {window.BSLogoIcon && window.BSLogoIcon({ size: 60, style: { opacity: 1 } })}
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap: 16 }}>
            <div style={{ width: 40, height: 1, background: accent }} />
            <div style={{
              fontFamily: sans, fontSize: 11, fontWeight: 500,
              letterSpacing: '0.28em', textTransform:'uppercase',
              color: accent,
            }}>{data.signoff}</div>
            <div style={{ width: 40, height: 1, background: accent }} />
          </div>
        </div>
      </div>
    </div>
  );
}
E10PolichinelleA.defaults = {
  eyebrow: 'SECRET DE POLICHINELLE · #03',
  kicker: 'on ne le dira qu\'à voix basse —',
  title: 'le rose,',
  titleItalic: 'ça va à toutes.',
  signoff: 'LES BELLES SŒURS · SHAWINIGAN',
};

/* ──────────────────────────────────────────────────── */

function E10PolichinelleB({ data = E10PolichinelleB.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-blush)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-cream)';

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>
      {/* envelope/seal vibe */}
      <div style={{
        position:'absolute', top: 90, left: '50%', transform:'translateX(-50%)',
        fontFamily: f, fontStyle:'italic', fontSize: 28, color: fg, opacity: 0.8,
      }}>~</div>

      <div style={{ position:'absolute', inset:'70px 80px',
        display:'flex', flexDirection:'column', justifyContent:'space-between',
        padding: '50px 50px',
        background: accent, color: fg,
        boxShadow: '0 18px 50px rgba(0,0,0,0.10)',
      }}>
        <div style={{ textAlign:'center' }}>
          <div style={{
            fontFamily: sans, fontSize: 11, fontWeight: 400,
            letterSpacing: '0.32em', textTransform: 'uppercase',
            opacity: 0.6,
          }}>{data.eyebrow}</div>
        </div>

        <div style={{ textAlign:'center' }}>
          <div style={{
            fontFamily: f, fontSize: 100, lineHeight: 0.5,
            color: bg, marginBottom: 28,
          }}>"</div>
          <div style={{
            fontFamily: f, fontWeight: data._titleWeight || 400,
            fontSize: Math.round(58 * ts), lineHeight: 1.1,
            letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.01em',
            fontStyle: 'italic',
          }}>
            {data.quote}
          </div>
          <div style={{
            fontFamily: f,
            fontSize: 100, lineHeight: 0.5,
            color: bg, marginTop: 18, transform: 'rotate(180deg)', display:'inline-block',
          }}>"</div>
        </div>

        <div style={{ textAlign:'center' }}>
          <div style={{ height: 1, background: fg, opacity: 0.18, marginBottom: 18 }} />
          <div style={{
            fontFamily: f, fontStyle:'italic', fontSize: 24,
          }}>— {data.author}</div>
          <div style={{
            fontFamily: sans, fontSize: 10, fontWeight: 400,
            letterSpacing: '0.28em', textTransform:'uppercase',
            color: fg, opacity: 0.55, marginTop: 6,
          }}>{data.role}</div>
          <div style={{ display:'flex', justifyContent:'center', marginTop: 14 }}>
            {window.BSLogoIcon && window.BSLogoIcon({ size: 48, style: { opacity: 1 } })}
          </div>
        </div>
      </div>
    </div>
  );
}
E10PolichinelleB.defaults = {
  eyebrow: 'CARNET · DICTON DE SALON',
  quote: 'Une bonne coupe fait taire mille doutes — et c\'est précisément pour ça qu\'on la coupe.',
  author: 'la maison',
  role: 'BELLES SŒURS · DEPUIS 2025',
};

window.E10PolichinelleA = E10PolichinelleA;
window.E10PolichinelleB = E10PolichinelleB;
