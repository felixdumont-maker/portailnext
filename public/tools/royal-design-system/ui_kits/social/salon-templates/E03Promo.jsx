/* global React */
/**
 * E03 — PROMO / RABAIS
 * A — 1:1 · Liste de services en promo + photo
 * B — 1:1 · Affichette typographique stacked, pas de photo
 */

function E03PromoA({ data = E03PromoA.defaults }) {
  const f    = data._font     || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg   = data._bg      || 'var(--bs-cream)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg     = data._fg     || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-camel-d)';
  const items  = Array.isArray(data.items) && data.items.length ? data.items : E03PromoA.defaults.items;

  const n = items.length;
  const prixSize  = n <= 2 ? 108 : n === 3 ? 78 : 62;
  const svcSize   = n <= 2 ? 17  : n === 3 ? 14 : 12;
  const avantSize = Math.round(prixSize * 0.32);
  const rowGap    = n <= 2 ? 24  : n === 3 ? 16 : 12;

  /* Couleurs individuelles par élément */
  const cBadge  = data._colorBadge  || '#f8cbca';
  const cEyebrow= data._colorEyebrow|| '#f8cbca';
  const cBonus  = data._colorBonus  || '#f8cbca';
  const cPrix   = data._colorPrix   || fg;
  const cSvc    = data._colorSvc    || fg;
  const cDesc   = data._colorDesc   || fg;
  const cCta    = data._colorCta    || bg;
  const cWeb    = data._colorWeb    || bg;
  const cUntil  = data._colorUntil  || bg;

  /* Taille entête — slider _headerScale */
  const hs       = data._headerScale || 1;
  const iconSize = Math.round(50 * hs);
  const brandSize = Math.round(12 * hs);
  const logoH     = Math.round(44 * hs);

  /* Bloc entête (réutilisé en haut ou entre entête+corps) */
  const HeaderBrand = (
    <div style={{ display:'flex', alignItems:'center', gap: Math.round(10 * hs) }}>
      {window.BSLogoIcon && window.BSLogoIcon({ size: iconSize, style: { opacity: 1 } })}
      {data.logo ? (
        <img src={data.logo} alt={data.brand}
          style={{ height: logoH, maxWidth: Math.round(200 * hs), objectFit:'contain', objectPosition:'left center' }} />
      ) : (
        <div style={{ fontFamily: sans, fontSize: brandSize, fontWeight: 400,
          letterSpacing: '0.28em', textTransform:'uppercase' }}>{data.brand}</div>
      )}
    </div>
  );

  /* Position du bloc : haut (défaut) ou entre entête et corps */
  const logoBetween = !!data._logoBetween;

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>

      {/* Badge PROMO */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 108, right: 80,
        width: 172, height: 172, borderRadius: '50%',
        background: cBadge,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        transform: 'rotate(-14deg)',
        zIndex: 10, pointerEvents: 'none',
      }}>
        <span style={{ fontFamily: sans, fontWeight: 900, fontSize: 38,
          color: 'white', letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1,
        }}>PROMO</span>
        <span style={{ fontFamily: sans, fontWeight: 400, fontSize: 14,
          color: 'rgba(255,255,255,0.8)', letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 6,
        }}>{data.tag}</span>
      </div>

      <div style={{ position:'absolute', inset:0, padding:'64px 72px',
        display:'grid', gridTemplateRows:'auto auto 1fr auto', gap: 20,
      }}>

        {/* Ligne du haut : logo (si position haut) */}
        <div>
          {!logoBetween && HeaderBrand}
        </div>

        {/* Entre entête et corps : logo (si position milieu) */}
        {logoBetween && (
          <div style={{ paddingBottom: 8 }}>{HeaderBrand}</div>
        )}
        {!logoBetween && <div />}

        {/* Centre : items (gauche) + photo (droite) */}
        <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap: 44, alignItems:'stretch' }}>

          <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', gap: 0 }}>

            {data.eyebrow && (
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  fontFamily: f, fontStyle: 'italic', fontWeight: 400,
                  fontSize: Math.round((n <= 2 ? 54 : 44) * (data._eyebrowScale || 1)),
                  lineHeight: 1.1, color: cEyebrow, letterSpacing: '-0.01em', marginBottom: 10,
                }}>{data.eyebrow}</div>
                <div style={{ height: 2, width: 56, background: cEyebrow, borderRadius: 2, opacity: 0.6 }} />
              </div>
            )}

            {items.map((item, i) => (
              <div key={i}>
                {i > 0 && (
                  <div style={{ height: 1, margin: `${rowGap}px 0`,
                    background: `color-mix(in oklch, ${fg} 14%, transparent)` }} />
                )}
                <div style={{ fontFamily: sans, fontSize: svcSize, fontWeight: 500,
                  letterSpacing: '0.18em', textTransform:'uppercase', color: cSvc, opacity: 0.75, marginBottom: 2,
                }}>{item.service}</div>
                <div style={{ display:'flex', alignItems:'flex-end', gap: 10, lineHeight: 0.88 }}>
                  <span style={{ fontFamily: f, fontWeight: data._titleWeight || 400,
                    fontSize: prixSize, color: cPrix,
                    letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.02em',
                  }}>{item.prix}</span>
                  {item.avant && (
                    <span style={{ fontFamily: f, fontStyle:'italic', fontSize: avantSize,
                      opacity: 0.35, textDecoration: 'line-through',
                      marginBottom: Math.round(prixSize * 0.06),
                    }}>{item.avant}</span>
                  )}
                </div>
              </div>
            ))}

            {data.description && (
              <div style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.6,
                color: cDesc, opacity: 0.72, marginTop: 22,
              }}>{data.description}</div>
            )}

            {data.bonus && (
              <div style={{ fontFamily: f, fontStyle: 'italic', fontWeight: 400,
                fontSize: n <= 2 ? 26 : 22, lineHeight: 1.3,
                color: cBonus, marginTop: 18,
              }}>{data.bonus}</div>
            )}
          </div>

          <div className="bs-photo" style={{ borderRadius: 4 }}>
            {data.photo
              ? <img src={data.photo} alt=""
                  style={{ objectPosition: `${data._photoX ?? 50}% ${data._photoY ?? 50}%` }} />
              : <span className="bs-photo-label">PHOTO PROMO</span>}
          </div>
        </div>

        {/* Footer band */}
        <div style={{ background: fg, color: bg, padding: '18px 26px',
          display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center',
          fontFamily: sans, fontSize: 12, fontWeight: 500,
          letterSpacing: '0.22em', textTransform:'uppercase',
        }}>
          <span style={{ color: cCta }}>{data.cta}</span>
          <span style={{ color: cWeb, opacity: 0.8, textAlign:'center' }}>{data.website}</span>
          <span style={{ color: cUntil, opacity: 0.6, textAlign:'right' }}>{data.until}</span>
        </div>

      </div>
    </div>
  );
}
E03PromoA.defaults = {
  brand:       'LES BELLES SŒURS',
  tag:         'OFFRE SPÉCIALE',
  eyebrow:     'BAL DE FINISSANTS 2025',
  items: [
    { service: 'Faciale de base', prix: '80$',  avant: '95$'  },
    { service: 'Peeling',         prix: '100$', avant: '135$' },
  ],
  description: 'Pour améliorer les peaux texturées et tendance acnéique.\nInvitation aux filles comme aux garçons — un visage de prince ou de princesse pour votre bal !',
  bonus: 'Viens avec une amie et on vous enlève chacun 10% de plus 🎀',
  cta:     'PRENDS RDV DÈS MAINTENANT →',
  website: 'LESBELLSSOEURS.COM',
  until:   'JUSQU\'AU 31 MAI',
  photo:   'refs/ref-03.webp',
  _logoBetween: false,
  _headerScale: 1,
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
