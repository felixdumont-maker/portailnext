/* global React */
/**
 * E04 — TÉMOIGNAGE CLIENT
 * A — 1:1 · Citation centrée · 5 étoiles · photo client circulaire
 * B — 1:1 · Photo gauche · témoignage à droite façon magazine
 */

function E04TemoignageA({ data = E04TemoignageA.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-cream)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-camel-d)';
  const stars = '★★★★★';

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>

      <div style={{ position:'absolute', inset:0, padding:'90px 110px',
        display:'flex', flexDirection:'column', justifyContent:'space-between',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{
            fontFamily: sans, fontSize: 12, fontWeight: 400,
            letterSpacing: '0.28em', textTransform:'uppercase', opacity: 0.62,
          }}>{data.eyebrow}</div>
          {window.BSLogoIcon && window.BSLogoIcon({ size: 60, style: { opacity: 1 } })}
        </div>

        <div style={{ textAlign:'center' }}>
          <div style={{
            fontFamily: f, fontSize: 200, lineHeight: 0.6,
            color: accent, marginBottom: 28,
          }}>"</div>
          <div style={{
            fontFamily: f, fontWeight: data._titleWeight || 400, fontStyle: 'italic',
            fontSize: Math.round(56 * ts), lineHeight: 1.25,
            letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.005em', maxWidth: 820, margin: '0 auto',
          }}>{data.quote}</div>
          <div role="img" aria-label={data.starsLabel || '5 étoiles sur 5'} style={{
            marginTop: 36, color: accent, fontSize: 22, letterSpacing: '0.28em',
          }}>{stars}</div>
        </div>

        <div style={{ textAlign:'center' }}>
          {data.photo && (
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              margin: '0 auto 16px', overflow:'hidden',
            }}>
              <img src={data.photo} alt={data.photoAlt || data.name || ''} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
          )}
          <div style={{ fontFamily: f, fontSize: 26, fontWeight: 400 }}>{data.name}</div>
          <div style={{
            fontFamily: sans, fontSize: 12, fontWeight: 400,
            letterSpacing: '0.26em', textTransform:'uppercase',
            opacity: 0.62, marginTop: 6,
          }}>{data.serviceTag}</div>
        </div>
      </div>
    </div>
  );
}
E04TemoignageA.defaults = {
  eyebrow: 'AVIS · GOOGLE 5 ÉTOILES',
  quote: 'Une équipe à l\'écoute, une atmosphère apaisante et un résultat au-delà de mes attentes. Je sors d\'ici toujours plus confiante.',
  name: 'Camille D.',
  serviceTag: 'SOIN VISAGE · MAQUILLAGE',
  starsLabel: '5 étoiles sur 5',
  photo: '',
  photoAlt: '',
};

/* ──────────────────────────────────────────────────── */

function E04TemoignageB({ data = E04TemoignageB.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-cream)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-camel-d)';

  return (
    <div className="bs-stage" style={{
      background: bgStage, color: fg,
      outline: '2px solid #f9d0ce',
      outlineOffset: '-32px',
    }}>

      {/* Lavis blush sur le panneau texte */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: '44%',
        background: 'linear-gradient(to left, #f9d0ce 0%, transparent 100%)',
        opacity: 0.5,
        pointerEvents: 'none',
      }} />

      <div style={{ position:'absolute', inset:0, display:'grid', gridTemplateColumns:'480px 1fr' }}>
        {/* Photo client */}
        <div style={{ position:'relative', padding: 80 }}>
          <div className="bs-photo bs-frame" style={{
            position:'absolute', top: 110, left: 60, right: 30, bottom: 180,
            padding: 0,
          }}>
            <div className="bs-photo" style={{ position:'absolute', inset: 16 }}>
              {data.photo
                ? <img src={data.photo} alt={data.photoAlt || data.name || ''} />
                : <span className="bs-photo-label">PHOTO<br/>CLIENT</span>}
            </div>
          </div>
          {/* small decorative tag */}
          <div style={{
            position:'absolute', bottom: 110, left: 60,
            fontFamily: f, fontStyle:'italic', fontSize: 28,
            color: accent,
          }}>— {data.byline}</div>
        </div>

        {/* Texte */}
        <div style={{
          padding: '90px 90px 80px 0',
          display:'flex', flexDirection:'column', justifyContent:'space-between',
        }}>
          <div>
            <div style={{
              fontFamily: sans, fontSize: 12, fontWeight: 400,
              letterSpacing:'0.26em', textTransform:'uppercase',
              color: accent, marginBottom: 22,
            }}>{data.eyebrow}</div>
            <div role="img" aria-label={data.starsLabel || '5 étoiles sur 5'} style={{ fontSize: 28, color: accent, letterSpacing: '0.2em', marginBottom: 26 }}>★★★★★</div>
            <div style={{
              fontFamily: f, fontWeight: data._titleWeight || 400, fontStyle: 'italic',
              fontSize: Math.round(48 * ts), lineHeight: 1.18,
              letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.005em',
            }}>{data.quote}</div>
          </div>

          <div>
            <div style={{ height:1, background: fg, opacity: 0.18, marginBottom: 22 }} />
            <div style={{
              fontFamily: f, fontSize: 32, fontWeight: 400,
            }}>{data.name}</div>
            <div style={{
              fontFamily: sans, fontSize: 13, fontWeight: 400,
              letterSpacing: '0.24em', textTransform:'uppercase',
              opacity: 0.65, marginTop: 4,
            }}>{data.subline}</div>
            <div style={{ marginTop: 16 }}>
              {window.BSLogoTexte && window.BSLogoTexte({ height: 30, style: { opacity: 1 } })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
E04TemoignageB.defaults = {
  eyebrow: 'CLIENT REVIEW · LILY',
  quote: 'Je viens depuis trois ans, je n\'irais nulle part ailleurs. L\'atmosphère est si accueillante, je repars toujours rayonnante et confiante.',
  byline: 'depuis 2023',
  name: 'Lily Tremblay',
  subline: 'SOIN VISAGE · ÉPILATION',
  starsLabel: '5 étoiles sur 5',
  photo: '',
  photoAlt: '',
};

window.E04TemoignageA = E04TemoignageA;
window.E04TemoignageB = E04TemoignageB;
