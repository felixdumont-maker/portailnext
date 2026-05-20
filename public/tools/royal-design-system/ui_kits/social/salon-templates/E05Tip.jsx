/* global React */
/**
 * E05 — TIP / CONSEIL BEAUTÉ
 * A — 1:1 · "Le saviez-vous ?" éditorial · numérotation gros chiffre
 * B — 1:1 · Mythe vs Fait · panneau split avec photo en background
 */

function E05TipA({ data = E05TipA.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-cream)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-camel-d)';

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>
      {/* top accent bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:6, background: accent }} />
      <div style={{ position:'absolute', inset:0, padding:'76px 80px',
        display:'grid', gridTemplateColumns:'auto 1fr', gap: 64,
      }}>
        {/* Big number */}
        <div style={{ display:'flex', flexDirection:'column' }}>
          <div style={{
            fontFamily: sans, fontSize: 12, fontWeight: 400,
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: accent, marginBottom: 12,
          }}>{data.serie}</div>
          <div style={{
            fontFamily: f, fontWeight: 400,
            fontSize: 360, lineHeight: 0.86,
            letterSpacing: '-0.04em',
            color: accent,
            marginLeft: -16,
          }}>{data.number}</div>
          <div style={{
            fontFamily: f, fontStyle:'italic', fontSize: 38,
            marginTop: -10, color: fg, opacity: 0.85,
          }}>{data.numberSuffix}</div>
        </div>

        {/* Content */}
        <div style={{
          paddingTop: 22,
          display:'flex', flexDirection:'column', justifyContent:'space-between',
        }}>
          <div>
            <div style={{
              fontFamily: sans, fontSize: 12, fontWeight: 400,
              letterSpacing: '0.26em', textTransform: 'uppercase',
              opacity: 0.55, marginBottom: 18,
            }}>{data.kicker}</div>
            <div style={{
              fontFamily: f, fontWeight: data._titleWeight || 400,
              fontSize: Math.round(70 * ts), lineHeight: 1.06,
              letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.01em',
            }}>
              {data.title}<br/>
              <em style={{ fontStyle:'italic', color: accent }}>{data.titleItalic}</em>
            </div>
            <div style={{ height:1, background: fg, opacity: 0.18, margin: '32px 0 24px' }} />
            <div style={{
              fontFamily: sans, fontSize: 18, lineHeight: 1.62,
              fontWeight: 300, opacity: 0.82, maxWidth: 480,
            }}>{data.body}</div>
          </div>

          <div style={{
            display:'flex', alignItems:'center', gap: 14,
            marginTop: 28,
          }}>
            <span style={{
              fontFamily: sans, fontSize: 12, fontWeight: 500,
              letterSpacing: '0.24em', textTransform:'uppercase',
              padding: '12px 22px',
              border: `1px solid ${accent}`,
              color: accent, borderRadius: 999,
            }}>{data.cta}</span>
            <span style={{ display:'flex', alignItems:'center', gap: 8 }}>
              {window.BSLogoIcon && window.BSLogoIcon({ size: 52, style: { opacity: 1 } })}
              <span style={{
                fontFamily: sans, fontSize: 12, fontWeight: 400,
                letterSpacing: '0.22em', textTransform:'uppercase',
                opacity: 0.55,
              }}>{data.byline}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
E05TipA.defaults = {
  serie: 'CONSEILS DE L\'ÉQUIPE · ÉPISODE',
  number: '01',
  numberSuffix: '· un',
  kicker: 'LE GESTE QUI CHANGE TOUT',
  title: 'Votre peau',
  titleItalic: 'se révèle',
  body: 'Appliquez votre sérum sur peau légèrement humide — les actifs pénètrent deux fois plus vite. Un détail que nos techniciennes transmettent à chaque soin visage.',
  cta: 'RÉSERVER UN SOIN →',
  byline: 'PAR L\'ÉQUIPE BELLES SŒURS',
};

/* ──────────────────────────────────────────────────── */

function E05TipB({ data = E05TipB.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-cream)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-camel-d)';

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>
      {/* Photo in background, dimmed */}
      {data.photo ? (
        <>
          <img src={data.photo} alt="" style={{
            position:'absolute', inset: 0,
            width:'100%', height:'100%', objectFit:'cover',
            opacity: 0.32,
          }} />
          <div style={{ position:'absolute', inset: 0, background: bg, opacity: 0.55 }} />
        </>
      ) : null}

      <div style={{ position:'absolute', inset:0, padding:'90px 100px',
        display:'flex', flexDirection:'column', justifyContent:'space-between',
      }}>
        <div style={{
          fontFamily: sans, fontSize: 13, fontWeight: 400,
          letterSpacing: '0.28em', textTransform: 'uppercase',
          color: accent,
        }}>{data.serie}</div>

        {/* Mythe / Fait */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 60 }}>
          <div>
            <div style={{
              fontFamily: sans, fontSize: 12, fontWeight: 500,
              letterSpacing:'0.28em', textTransform:'uppercase',
              padding: '6px 14px',
              background: fg, color: bg,
              display:'inline-block',
              marginBottom: 18,
            }}>MYTHE</div>
            <div style={{
              fontFamily: f, fontWeight: data._titleWeight || 400,
              fontSize: Math.round(40 * ts), lineHeight: 1.18,
              fontStyle:'italic',
            }}>« {data.mythe} »</div>
          </div>
          <div>
            <div style={{
              fontFamily: sans, fontSize: 12, fontWeight: 500,
              letterSpacing:'0.28em', textTransform:'uppercase',
              padding: '6px 14px',
              background: accent, color: bg,
              display:'inline-block',
              marginBottom: 18,
            }}>FAIT</div>
            <div style={{
              fontFamily: f, fontWeight: data._titleWeight || 400,
              fontSize: Math.round(36 * ts), lineHeight: 1.22,
            }}>{data.fait}</div>
          </div>
        </div>

        <div className="bs-footer-row">
          <span>{data.footerLeft}</span>
          {window.BSLogoIcon && window.BSLogoIcon({ size: 52, style: { opacity: 1 } })}
          <span>{data.footerRight}</span>
        </div>
      </div>
    </div>
  );
}
E05TipB.defaults = {
  serie: 'IDÉES REÇUES · #01',
  mythe: 'La crème hydratante suffit pour avoir une belle peau.',
  fait: 'L\'hydratation est une fondation, pas une solution. Nos esthéticiennes associent nettoyage, sérum et soin ciblé — selon votre peau, pas selon les tendances.',
  footerLeft: '@LESBELLESSOEURS',
  footerRight: 'SHAWINIGAN · EST. 2025',
  photo: '',
};

window.E05TipA = E05TipA;
window.E05TipB = E05TipB;
