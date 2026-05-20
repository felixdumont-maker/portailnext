/* global React */
/**
 * E03 — PROMO / RABAIS
 * A — 1:1 · Pourcentage géant + photo carrée
 * B — 1:1 · Affichette typographique stacked, pas de photo
 */

function E03PromoA({ data = E03PromoA.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-cream)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-camel-d)';

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>
      <div style={{ position:'absolute', inset:0, padding:'76px 80px',
        display:'grid', gridTemplateRows:'auto 1fr auto', gap: 28,
      }}>
        {/* Header row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
            {window.BSLogoIcon && window.BSLogoIcon({ size: 56, style: { opacity: 1 } })}
            <div style={{
              fontFamily: sans, fontSize: 13, fontWeight: 400,
              letterSpacing: '0.26em', textTransform:'uppercase',
            }}>{data.brand}</div>
          </div>
          <div style={{
            fontFamily: sans, fontSize: 12, fontWeight: 400,
            letterSpacing: '0.26em', textTransform:'uppercase',
            padding: '8px 16px', border: `1px solid ${fg}`, borderRadius: 999,
          }}>{data.tag}</div>
        </div>

        {/* Center grid : value + photo */}
        <div style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr', gap: 36, alignItems:'stretch' }}>
          <div style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <div style={{
              fontFamily: sans, fontSize: 14, fontWeight: 400,
              letterSpacing: '0.26em', textTransform:'uppercase',
              color: accent, marginBottom: 10,
            }}>{data.kicker}</div>
            <div style={{ display:'flex', alignItems:'flex-start', gap: 0, lineHeight: 0.85 }}>
              <span style={{
                fontFamily: f, fontWeight: data._titleWeight || 400,
                fontSize: Math.round(360 * ts),
                letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.03em',
              }}>{data.value}</span>
              <span style={{
                fontFamily: f, fontWeight: 400, fontStyle:'italic',
                fontSize: Math.round(180 * ts), marginTop: 32,
                color: accent,
              }}>{data.unit}</span>
            </div>
            <div style={{
              fontFamily: f, fontStyle:'italic', fontSize: 44,
              marginTop: -8, lineHeight: 1.1,
            }}>{data.suffix}</div>
            <div style={{
              fontFamily: sans, fontSize: 15, lineHeight: 1.55,
              marginTop: 20, opacity: 0.72, maxWidth: 380,
            }}>{data.description}</div>
          </div>

          <div className="bs-photo" style={{ borderRadius: 4 }}>
            {data.photo
              ? <img src={data.photo} alt="" />
              : <span className="bs-photo-label">PHOTO PROMO</span>}
          </div>
        </div>

        {/* Footer band */}
        <div style={{
          background: fg, color: bg, padding: '20px 28px',
          display:'flex', justifyContent:'space-between', alignItems:'center',
          fontFamily: sans, fontSize: 13, fontWeight: 500,
          letterSpacing: '0.22em', textTransform:'uppercase',
        }}>
          <span>{data.code}</span>
          <span style={{ opacity: 0.7 }}>{data.until}</span>
          <span style={{ color: accent }}>{data.cta}</span>
        </div>
      </div>
    </div>
  );
}
E03PromoA.defaults = {
  brand: 'LES BELLES SŒURS',
  tag: 'OFFRE LIMITÉE',
  kicker: 'JUSQU\'À',
  value: '30',
  unit: '%',
  suffix: 'de rabais',
  description: 'Sur les soins esthétiques et le maquillage. Une parenthèse beauté à prix doux pour célébrer la rentrée.',
  code: 'CODE · BELLES30',
  until: 'JUSQU\'AU 31 OCTOBRE',
  cta: 'RÉSERVEZ →',
  photo: 'refs/ref-03.webp',
};

/* ──────────────────────────────────────────────────── */

function E03PromoB({ data = E03PromoB.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-ink)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-cream)';
  const accent = data._accent || 'var(--bs-camel-d)';

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>
      <div style={{ position:'absolute', inset:0, padding:'90px 90px 80px',
        display:'flex', flexDirection:'column', justifyContent:'space-between',
      }}>
        <div style={{ textAlign:'center' }}>
          <div style={{
            fontFamily: sans, fontSize: 13, fontWeight: 400,
            letterSpacing: '0.28em', textTransform:'uppercase',
            color: accent,
          }}>{data.eyebrow}</div>
          <div style={{ height: 1, width: 60, background: accent, opacity: 0.6, margin: '24px auto 0' }} />
        </div>

        {/* Stacked typographique */}
        <div style={{ textAlign:'center' }}>
          <div style={{
            fontFamily: f, fontWeight: data._titleWeight || 300,
            fontSize: Math.round(160 * ts), lineHeight: 0.92,
            letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.02em',
          }}>{data.line1}</div>
          <div style={{
            fontFamily: f, fontStyle:'italic', fontWeight: data._titleWeight || 400,
            fontSize: Math.round(220 * ts), lineHeight: 0.9,
            color: accent, margin: '8px 0',
          }}>{data.line2}</div>
          <div style={{
            fontFamily: f, fontWeight: data._titleWeight || 300,
            fontSize: Math.round(160 * ts), lineHeight: 0.92,
            letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.02em',
          }}>{data.line3}</div>

          <div style={{
            fontFamily: sans, fontSize: 18, lineHeight: 1.6, fontWeight: 300,
            opacity: 0.78, maxWidth: 640, margin: '40px auto 0',
          }}>{data.body}</div>
        </div>

        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          paddingTop: 22, borderTop: `1px solid color-mix(in oklch, ${fg} 18%, transparent)`,
          fontFamily: sans, fontSize: 13, fontWeight: 400,
          letterSpacing: '0.22em', textTransform:'uppercase',
        }}>
          <span>{data.footerLeft}</span>
          <span style={{ color: accent }}>{data.code}</span>
          <span style={{ opacity: 0.65 }}>{data.footerRight}</span>
        </div>
      </div>
    </div>
  );
}
E03PromoB.defaults = {
  eyebrow: 'GRANDE LIQUIDATION D\'AUTOMNE',
  line1: 'JUSQU\'À',
  line2: '40%',
  line3: 'DE RABAIS',
  body: 'Tous les soins et produits en boutique. Du 14 au 28 octobre seulement, en salon ou en ligne.',
  footerLeft: 'LES BELLES SŒURS',
  code: 'CODE · MERCI40',
  footerRight: 'JUSQU\'AU 28.10',
};

window.E03PromoA = E03PromoA;
window.E03PromoB = E03PromoB;
