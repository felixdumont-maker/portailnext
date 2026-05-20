/* global React */
/**
 * E01 — HERO / ANNONCE SALON
 * A — 1:1 · Photo full-bleed avec tagline overlay (réf : "Every Strand")
 * B — 9:16 · Story · grand serif sur photo · CTA pill
 */

function E01HeroA({ data = E01HeroA.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  return (
    <div className="bs-stage" style={{
      background: window.salonBgCss ? window.salonBgCss(data, data._bg || 'var(--bs-cream)') : (data._bg || 'var(--bs-cream)'),
      color: data._fg || 'var(--bs-ink)',
    }}>
      {/* Full-bleed photo */}
      <div className="bs-photo" style={{ position: 'absolute', inset: 0 }}>
        {data.photo
          ? <img src={data.photo} alt="" />
          : <span className="bs-photo-label">PHOTO HERO<br/>1080 × 1080</span>
        }
        {/* Soft gradient overlay for legibility */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.45) 100%)',
        }} />
      </div>

      {/* Top eyebrow */}
      <div style={{
        position: 'absolute', top: 64, left: 0, right: 0,
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: sans, fontSize: 13, fontWeight: 400,
          letterSpacing: '0.28em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.85)',
        }}>{data.eyebrow}</div>
      </div>

      {/* Centered tagline */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 80px', textAlign: 'center',
      }}>
        <div style={{
          fontFamily: sans, fontSize: 14, fontWeight: 400,
          letterSpacing: '0.26em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.85)', marginBottom: 22,
        }}>{data.kicker}</div>
        <div style={{
          fontFamily: f, fontWeight: data._titleWeight || 400,
          fontSize: Math.round(120 * ts), lineHeight: 0.96,
          letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.01em', color: '#fff',
          textTransform: 'uppercase',
        }}>
          {data.titleLine1}<br/>
          <em style={{ fontStyle: 'italic', fontWeight: 400 }}>{data.titleLine2}</em>
        </div>
        <div style={{
          width: 60, height: 1, background: 'rgba(255,255,255,0.6)',
          margin: '32px 0 26px',
        }} />
        <div style={{
          fontFamily: sans, fontSize: 16, fontWeight: 400,
          letterSpacing: '0.28em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.92)',
        }}>{data.subtitle}</div>

        {data.cta ? (
          <button style={{
            marginTop: 48, padding: '16px 40px',
            background: 'rgba(255,255,255,0.96)', color: data._fg || '#3d2c20',
            border: 'none', borderRadius: 999,
            fontFamily: sans, fontSize: 12, fontWeight: 500,
            letterSpacing: '0.32em', textTransform: 'uppercase',
            cursor: 'default',
          }}>{data.cta}</button>
        ) : null}
      </div>

      {/* Bottom branding */}
      <div style={{
        position: 'absolute', bottom: 40, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }}>
        {window.BSLogoIcon && window.BSLogoIcon({ size: 72, style: { opacity: 1 } })}
        <div style={{
          fontFamily: sans, fontSize: 13, fontWeight: 400,
          letterSpacing: '0.2em', color: 'rgba(255,255,255,0.85)',
        }}>{data.url}</div>
      </div>
    </div>
  );
}
E01HeroA.defaults = {
  eyebrow: 'LES BELLES SŒURS · SALON D\'ESTHÉTIQUE',
  kicker: 'OÙ CHAQUE',
  titleLine1: 'DÉTAIL',
  titleLine2: 'compte',
  subtitle: '— Beauté · Soin · Rituel —',
  cta: 'PRENDRE RENDEZ-VOUS',
  url: 'WWW.LESBELLESOEURS.COM',
  photo: 'refs/ref-01.webp',
};

/* ────────────────────────────────────────────────────────── */

function E01HeroB({ data = E01HeroB.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  return (
    <div className="bs-stage-9x16" style={{
      background: window.salonBgCss ? window.salonBgCss(data, data._bg || 'var(--bs-cream)') : (data._bg || 'var(--bs-cream)'),
    }}>
      {/* Photo top 60% */}
      <div className="bs-photo" style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '62%',
      }}>
        {data.photo
          ? <img src={data.photo} alt="" />
          : <span className="bs-photo-label">PHOTO STORY<br/>1080 × 1190</span>
        }
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.0) 100%)',
        }} />
      </div>

      {/* Top eyebrow on photo */}
      <div style={{
        position: 'absolute', top: 80, left: 0, right: 0,
        textAlign: 'center',
        fontFamily: sans, fontSize: 18, fontWeight: 400,
        letterSpacing: '0.26em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.92)',
      }}>{data.eyebrow}</div>

      {/* Bottom cream zone with title */}
      <div style={{
        position: 'absolute', top: '62%', left: 0, right: 0, bottom: 0,
        background: data._bg || 'var(--bs-cream)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '90px 80px 96px', textAlign: 'center',
      }}>
        <div>
          <div style={{
            fontFamily: f, fontWeight: data._titleWeight || 400,
            fontSize: Math.round(160 * ts), lineHeight: 0.95,
            letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.01em',
            color: data._fg || 'var(--bs-ink)',
          }}>
            {data.titleLine1}<br/>
            <em style={{ fontStyle: 'italic', fontWeight: 400 }}>{data.titleLine2}</em>
          </div>
          <div style={{
            width: 80, height: 1,
            background: data._fg || 'var(--bs-ink)',
            opacity: 0.5,
            margin: '40px auto 32px',
          }} />
          <div style={{
            fontFamily: sans, fontSize: 22, fontWeight: 400,
            color: data._fg || 'var(--bs-ink)', opacity: 0.78,
            letterSpacing: '0.04em', lineHeight: 1.5,
            maxWidth: 760, margin: '0 auto',
          }}>{data.subtitle}</div>
        </div>
        <div>
          {data.cta ? (
            <button style={{
              padding: '22px 56px',
              background: 'transparent', color: data._fg || 'var(--bs-ink)',
              border: `1.5px solid ${data._fg || 'var(--bs-ink)'}`,
              borderRadius: 999,
              fontFamily: sans, fontSize: 16, fontWeight: 500,
              letterSpacing: '0.32em', textTransform: 'uppercase',
              cursor: 'default',
            }}>{data.cta}</button>
          ) : null}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: 10, marginTop: 28 }}>
            {window.BSLogoIcon && window.BSLogoIcon({ size: 72, style: { opacity: 1 } })}
            <div style={{
              fontFamily: sans, fontSize: 16, fontWeight: 400,
              letterSpacing: '0.24em', textTransform: 'uppercase',
              color: data._fg || 'var(--bs-ink)', opacity: 0.7,
            }}>{data.url}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
E01HeroB.defaults = {
  eyebrow: 'OUVERT MAINTENANT',
  titleLine1: 'L\'ART',
  titleLine2: 'd\'être soi',
  subtitle: 'Soins esthétiques · maquillage · détente. Une expérience pensée pour vous, dans un écrin de calme.',
  cta: 'RÉSERVER',
  url: '@LESBELLESSOEURS',
  photo: 'refs/ref-01.webp',
};

window.E01HeroA = E01HeroA;
window.E01HeroB = E01HeroB;

/* ────────────────────────────────────────────────────────── */
/* C — 1:1 · Hero composé en grille — photo + carte titre éditoriale */

function E01HeroC({ data = E01HeroC.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-cream-2)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-camel-d)';

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>
      <div style={{ position:'absolute', inset: 0, display:'grid',
        gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr',
        gap: 0,
      }}>
        {/* Top-left: monogram block */}
        <div style={{
          background: 'var(--bs-blush)',
          padding: 56,
          display:'flex', flexDirection:'column', justifyContent:'space-between',
        }}>
          <div style={{
            fontFamily: sans, fontSize: 11, fontWeight: 400,
            letterSpacing: '0.28em', textTransform:'uppercase',
            color: fg, opacity: 0.7,
          }}>{data.eyebrow}</div>
          <div style={{
            fontFamily: f, fontStyle:'italic', fontSize: 220,
            lineHeight: 0.7, color: fg,
          }}>B<span style={{ color: accent }}>s</span></div>
          <div style={{
            fontFamily: sans, fontSize: 11, fontWeight: 400,
            letterSpacing: '0.26em', textTransform:'uppercase',
            color: fg, opacity: 0.55,
          }}>EST. 2025 · SHAWINIGAN</div>
        </div>

        {/* Top-right: photo */}
        <div className="bs-photo" style={{ width:'100%', height:'100%' }}>
          {data.photo
            ? <img src={data.photo} alt="" />
            : <span className="bs-photo-label">PHOTO HERO</span>}
        </div>

        {/* Bottom-left: photo or peach */}
        <div style={{ background: 'var(--bs-peach)', position:'relative' }}>
          {data.photo2
            ? <div className="bs-photo" style={{ width:'100%', height:'100%' }}>
                <img src={data.photo2} alt="" />
              </div>
            : (
              <div style={{
                position:'absolute', inset: 0,
                display:'grid', placeItems:'center',
                fontFamily: f, fontStyle:'italic',
                fontSize: 38, color: fg, opacity: 0.55, textAlign:'center',
                padding: 40,
              }}>{data.flavorQuote}</div>
            )}
        </div>

        {/* Bottom-right: title block */}
        <div style={{
          background: bg, color: fg,
          padding: 50,
          display:'flex', flexDirection:'column', justifyContent:'space-between',
        }}>
          <div style={{
            fontFamily: sans, fontSize: 11, fontWeight: 400,
            letterSpacing: '0.28em', textTransform:'uppercase',
            color: accent,
          }}>{data.kicker}</div>

          <div>
            <div style={{
              fontFamily: f, fontWeight: 400,
              fontSize: Math.round(76 * ts), lineHeight: 0.94,
              letterSpacing: '-0.02em',
            }}>
              {data.titleLine1}<br/>
              <em style={{ fontStyle:'italic', color: accent }}>{data.titleLine2}</em>
            </div>
          </div>

          <div>
            <div style={{ height: 1, background: fg, opacity: 0.18, marginBottom: 14 }} />
            <div style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                {window.BSLogoIcon && window.BSLogoIcon({ size: 52, style: { opacity: 1 } })}
                <span style={{
                  fontFamily: sans, fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.26em', textTransform:'uppercase',
                  opacity: 0.7,
                }}>{data.cta}</span>
              </div>
              <span style={{ color: accent, fontFamily: sans, fontWeight: 400 }}>→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
E01HeroC.defaults = {
  eyebrow: 'ESTHÉTIQUE · SHAWINIGAN',
  kicker: 'NOUVELLE COLLECTION · AUTOMNE',
  titleLine1: 'L\'art',
  titleLine2: 'd\'être soi',
  flavorQuote: '« sortez d\'ici plus vous-même que jamais »',
  cta: 'RÉSERVER VOTRE PLACE',
  photo: 'refs/ref-01.webp',
  photo2: 'refs/ref-02.webp',
};

window.E01HeroC = E01HeroC;
