/* global React */
/**
 * E02 — SERVICE / SOIN (avec prix)
 * A — 1:1 · Photo gauche · panneau service à droite · prix vedette
 * B — 1:1 · Liste de services éditoriale · pas de photo · accent serif
 */

function E02ServiceA({ data = E02ServiceA.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-blush)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-camel-d)';

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>
      {/* Carte intérieure crème — contour blush tout autour */}
      <div style={{
        position: 'absolute', top: 64, left: 72, right: 72, bottom: 64,
        display: 'grid', gridTemplateColumns: '52% 48%',
        background: 'var(--bs-cream)',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(61,44,32,0.10)',
      }}>
        {/* Photo */}
        <div className="bs-photo" style={{ position:'relative' }}>
          {data.photo
            ? <img src={data.photo} alt="" />
            : <span className="bs-photo-label">PHOTO SOIN<br/>portrait recommandé</span>}
        </div>

        {/* Panneau */}
        <div style={{
          padding: '60px 56px 52px',
          display:'flex', flexDirection:'column', justifyContent:'space-between',
        }}>
          <div>
            <div style={{
              fontFamily: sans, fontSize: 12, fontWeight: 400,
              letterSpacing: '0.26em', textTransform: 'uppercase',
              color: accent, marginBottom: 18,
            }}>{data.tag}</div>

            <div style={{
              fontFamily: f, fontWeight: data._titleWeight || 400,
              fontSize: Math.round(74 * ts), lineHeight: 1.0,
              letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.005em',
            }}>
              {data.title}<br/>
              <em style={{ fontStyle:'italic' }}>{data.titleItalic}</em>
            </div>

            <div style={{ height: 1, background: 'currentColor', opacity: 0.18, margin: '32px 0 24px' }} />

            <div style={{
              fontFamily: sans, fontSize: 16, lineHeight: 1.65,
              fontWeight: 300, opacity: 0.78, marginBottom: 28,
            }}>{data.description}</div>

            {/* Inclusions */}
            <ul style={{ listStyle:'none', padding:0, margin:0 }}>
              {(data.inclusions || []).map((it, i) => (
                <li key={i} style={{
                  display:'flex', alignItems:'center', gap:14, padding:'10px 0',
                  borderBottom: '1px solid rgba(61,44,32,0.10)',
                  fontFamily: sans, fontSize: 15,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: accent, flexShrink: 0,
                  }} />
                  <span style={{ flex: 1 }}>{it}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prix + CTA */}
          <div style={{ marginTop: 32 }}>
            <div style={{
              display:'flex', alignItems:'baseline', gap: 14, marginBottom: 18,
            }}>
              <div style={{
                fontFamily: f, fontSize: 86, fontWeight: 400, lineHeight: 1,
              }}>{data.price}</div>
              <div style={{
                fontFamily: sans, fontSize: 14, fontWeight: 400,
                letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.6,
              }}>{data.priceUnit}</div>
            </div>
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              fontFamily: sans, fontSize: 11, fontWeight: 400,
              letterSpacing: '0.22em', textTransform:'uppercase', opacity: 0.65,
            }}>
              <span>{data.duration}</span>
              <span style={{ display:'flex', alignItems:'center', gap: 6 }}>
                {window.BSLogoIcon && window.BSLogoIcon({ size: 52, style: { opacity: 1 } })}
                {data.brand}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
E02ServiceA.defaults = {
  tag: 'SOIN SIGNATURE',
  title: 'Coloration',
  titleItalic: 'sur mesure',
  description: 'Une consultation approfondie, un mélange créé pour vous, un résultat qui révèle votre éclat naturel.',
  inclusions: ['Consultation 15 min', 'Soin pré-couleur', 'Brushing inclus', 'Conseils maison'],
  price: '120$',
  priceUnit: '· DÈS',
  duration: 'DURÉE · 2H30',
  brand: 'LES BELLES SŒURS',
  photo: 'refs/ref-02.webp',
};

/* ──────────────────────────────────────────────────── */

function E02ServiceB({ data = E02ServiceB.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-cream)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-camel-d)';

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>
      <div style={{
        position:'absolute', inset:0,
        padding:'90px 96px',
        display:'flex', flexDirection:'column',
      }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom: 56 }}>
          <div style={{
            fontFamily: sans, fontSize: 12, fontWeight: 400,
            letterSpacing: '0.26em', textTransform:'uppercase',
            color: accent, marginBottom: 22,
          }}>{data.eyebrow}</div>
          <div style={{
            fontFamily: f, fontWeight: data._titleWeight || 400,
            fontSize: Math.round(110 * ts), lineHeight: 0.96,
            letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.01em',
          }}>
            {data.title}<br/>
            <em style={{ fontStyle:'italic' }}>{data.titleItalic}</em>
          </div>
        </div>

        {/* Liste services */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap: 4 }}>
          {(data.services || []).map((s, i) => (
            <div key={i}>
              <div style={{
                display:'grid', gridTemplateColumns:'auto 1fr auto auto',
                alignItems:'baseline', gap: 24, padding: '20px 0',
              }}>
                <div style={{
                  fontFamily: sans, fontSize: 13, fontWeight: 400,
                  letterSpacing:'0.18em', opacity: 0.5, minWidth: 32,
                }}>{String(i+1).padStart(2,'0')}</div>
                <div>
                  <div style={{
                    fontFamily: f, fontSize: 36, fontWeight: 400, lineHeight: 1.1,
                  }}>{s.name}</div>
                  {s.note ? (
                    <div style={{
                      fontFamily: sans, fontSize: 13, opacity: 0.55,
                      letterSpacing: '0.06em', marginTop: 4,
                    }}>{s.note}</div>
                  ) : null}
                </div>
                <div style={{
                  fontFamily: sans, fontSize: 12, fontWeight: 400,
                  letterSpacing:'0.22em', textTransform:'uppercase', opacity: 0.55,
                }}>{s.duration}</div>
                <div style={{
                  fontFamily: f, fontSize: 32, fontWeight: 500,
                  fontStyle:'italic', minWidth: 110, textAlign: 'right',
                }}>{s.price}</div>
              </div>
              {i < (data.services||[]).length - 1 ? (
                <div style={{ height:1, background:'currentColor', opacity:0.10 }} />
              ) : null}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bs-footer-row" style={{ marginTop: 40 }}>
          <span style={{ display:'flex', alignItems:'center', gap: 8 }}>
            {window.BSLogoTexte && window.BSLogoTexte({ height: 32, style: { opacity: 1 } })}
            {data.footerLeft}
          </span>
          <span>{data.footerRight}</span>
        </div>
      </div>
    </div>
  );
}
E02ServiceB.defaults = {
  eyebrow: 'CARTE DES SOINS · AUTOMNE',
  title: 'Notre',
  titleItalic: 'sélection',
  services: [
    { name: 'Coupe & brushing',    note: 'Cheveux longs · +15$', duration: '60 MIN', price: '75$' },
    { name: 'Coloration complète', note: 'Mèches en supplément', duration: '2H30',   price: '120$' },
    { name: 'Soin réparateur',     note: 'Kératine ou botox',    duration: '90 MIN', price: '95$' },
    { name: 'Maquillage soirée',   note: 'Sur rendez-vous',      duration: '45 MIN', price: '85$' },
  ],
  footerLeft: 'WWW.LESBELLESOEURS.COM',
  footerRight: 'PRIX EN VIGUEUR · OCT. 2026',
};

window.E02ServiceA = E02ServiceA;
window.E02ServiceB = E02ServiceB;
