/* global React */
/**
 * E09 — AVANT / APRÈS
 * A — 1:1 · Split vertical 50/50 avec étiquettes "AVANT" "APRÈS"
 * B — 1:1 · Carrousel-style: deux cards inclinées, fiche transformation
 */

function E09AvantApresA({ data = E09AvantApresA.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-cream)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-camel-d)';

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>
      <div style={{ position:'absolute', inset:0, padding:'40px 40px 56px',
        display:'flex', flexDirection:'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 28px 24px',
          display:'flex', justifyContent:'space-between', alignItems:'baseline',
        }}>
          <div style={{
            fontFamily: sans, fontSize: 11, fontWeight: 400,
            letterSpacing: '0.28em', textTransform:'uppercase',
            color: accent,
          }}>{data.eyebrow}</div>
          <div style={{
            fontFamily: f, fontStyle:'italic', fontSize: 22,
            opacity: 0.7,
          }}>n° {data.number}</div>
        </div>

        {/* Two photos */}
        <div style={{ position:'relative', flex: 1, display:'grid',
          gridTemplateColumns: '1fr 1fr', gap: 6,
        }}>
          {/* AVANT */}
          <div className="bs-photo" style={{ width:'100%', height:'100%' }}>
            {data.photoBefore
              ? <img src={data.photoBefore} alt="" />
              : <span className="bs-photo-label">PHOTO AVANT</span>}
            <div style={{
              position:'absolute', top: 18, left: 18,
              fontFamily: sans, fontSize: 10, fontWeight: 500,
              letterSpacing: '0.28em', textTransform:'uppercase',
              padding: '8px 14px',
              background: bg, color: fg,
            }}>AVANT</div>
          </div>
          {/* APRÈS */}
          <div className="bs-photo" style={{ width:'100%', height:'100%' }}>
            {data.photoAfter
              ? <img src={data.photoAfter} alt="" />
              : <span className="bs-photo-label">PHOTO APRÈS</span>}
            <div style={{
              position:'absolute', top: 18, right: 18,
              fontFamily: sans, fontSize: 10, fontWeight: 500,
              letterSpacing: '0.28em', textTransform:'uppercase',
              padding: '8px 14px',
              background: accent, color: bg,
            }}>APRÈS</div>
          </div>

          {/* Center divider with arrow */}
          <div style={{
            position:'absolute', top:'50%', left:'50%',
            transform:'translate(-50%, -50%)',
            width: 64, height: 64, borderRadius: '50%',
            background: bg, color: fg,
            border: `1px solid ${fg}`,
            display:'grid', placeItems:'center',
            fontFamily: f, fontStyle: 'italic', fontSize: 26,
            zIndex: 2,
          }}>→</div>
        </div>

        {/* Caption */}
        <div style={{ padding: '24px 28px 0', textAlign:'center' }}>
          <div style={{
            fontFamily: f, fontWeight: data._titleWeight || 400,
            fontSize: Math.round(48 * ts), lineHeight: 1,
            letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.01em',
          }}>
            {data.title}{' '}
            <em style={{ fontStyle:'italic', color: accent }}>{data.titleItalic}</em>
          </div>
          <div style={{
            fontFamily: sans, fontSize: 13, fontWeight: 400,
            letterSpacing: '0.24em', textTransform:'uppercase',
            opacity: 0.6, marginTop: 14,
          }}>{data.subline}</div>
          <div style={{ display:'flex', justifyContent:'center', marginTop: 14 }}>
            {window.BSLogoIcon && window.BSLogoIcon({ size: 52, style: { opacity: 1 } })}
          </div>
        </div>
      </div>
    </div>
  );
}
E09AvantApresA.defaults = {
  eyebrow: 'TRANSFORMATION · DOSSIER',
  number: '14',
  title: 'La peau',
  titleItalic: 'révélée',
  subline: 'SOIN VISAGE · ÉPILATION SOURCILS · 2H30',
  photoBefore: '',
  photoAfter: '',
};

/* ──────────────────────────────────────────────────── */

function E09AvantApresB({ data = E09AvantApresB.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-cream)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-camel-d)';

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>
      <div style={{ position:'absolute', inset:0, padding:'70px 70px 60px',
        display:'flex', flexDirection:'column', justifyContent:'space-between',
      }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{
              fontFamily: sans, fontSize: 12, fontWeight: 400,
              letterSpacing: '0.28em', textTransform:'uppercase',
              color: accent, marginBottom: 14,
            }}>{data.eyebrow}</div>
            <div style={{
              fontFamily: f, fontWeight: data._titleWeight || 400,
              fontSize: Math.round(72 * ts), lineHeight: 0.96,
              letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.015em',
            }}>
              {data.title}<br/>
              <em style={{ fontStyle: 'italic', color: accent }}>{data.titleItalic}</em>
            </div>
          </div>
          <div style={{ textAlign:'right', maxWidth: 220 }}>
            {window.BSLogoIcon && window.BSLogoIcon({ size: 48, style: { opacity: 1, marginLeft: 'auto', marginBottom: 8 } })}
            <div style={{
              fontFamily: f, fontStyle: 'italic',
              fontSize: 22, color: accent,
            }}>« {data.tagline} »</div>
          </div>
        </div>

        {/* Photo cards */}
        <div style={{ position:'relative', height: 480, margin: '0 auto', width: 700 }}>
          {/* AVANT card */}
          <div className="bs-frame" style={{
            position:'absolute', left: 0, top: 28, width: 320, height: 440,
            transform: 'rotate(-4deg)',
            padding: 14,
            background: bg,
          }}>
            <div className="bs-photo" style={{ width:'100%', height: '88%' }}>
              {data.photoBefore
                ? <img src={data.photoBefore} alt="" />
                : <span className="bs-photo-label">AVANT</span>}
            </div>
            <div style={{
              fontFamily: sans, fontSize: 10, fontWeight: 500,
              letterSpacing: '0.28em', textTransform:'uppercase',
              textAlign:'center', marginTop: 10,
              opacity: 0.7,
            }}>AVANT</div>
          </div>
          {/* APRÈS card */}
          <div className="bs-frame" style={{
            position:'absolute', right: 0, top: 0, width: 360, height: 460,
            transform: 'rotate(3deg)',
            padding: 14,
            background: bg,
            zIndex: 2,
            boxShadow: '0 10px 40px rgba(0,0,0,0.10)',
          }}>
            <div className="bs-photo" style={{ width:'100%', height: '86%',
              background: data._photoBg || accent,
            }}>
              {data.photoAfter
                ? <img src={data.photoAfter} alt="" />
                : <span className="bs-photo-label">APRÈS</span>}
            </div>
            <div style={{
              fontFamily: sans, fontSize: 10, fontWeight: 500,
              letterSpacing: '0.28em', textTransform:'uppercase',
              textAlign:'center', marginTop: 10,
              color: accent,
            }}>APRÈS</div>
          </div>

          {/* arrow */}
          <div style={{
            position:'absolute', top: 220, left: 320,
            fontFamily: f, fontStyle: 'italic', fontSize: 32,
            color: accent,
          }}>→</div>
        </div>

        {/* Specs row */}
        <div style={{
          display:'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
          paddingTop: 24, borderTop: `1px solid color-mix(in oklch, ${fg} 18%, transparent)`,
        }}>
          {(data.specs || []).map((s, i) => (
            <div key={i}>
              <div style={{
                fontFamily: sans, fontSize: 10, fontWeight: 400,
                letterSpacing: '0.26em', textTransform:'uppercase',
                color: accent, marginBottom: 6,
              }}>{s.label}</div>
              <div style={{
                fontFamily: f, fontStyle: 'italic', fontSize: 22,
              }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
E09AvantApresB.defaults = {
  eyebrow: 'TRANSFORMATION · #28',
  title: 'Une nouvelle',
  titleItalic: 'silhouette',
  tagline: 'le bon moment pour oser.',
  photoBefore: '',
  photoAfter: '',
  specs: [
    { label: 'SOIN',          value: 'visage éclat' },
    { label: 'TECHNIQUE',     value: 'micro-peeling' },
    { label: 'ESTHÉTICIENNE', value: 'Sophie L.' },
    { label: 'DURÉE',         value: '2 h' },
  ],
};

window.E09AvantApresA = E09AvantApresA;
window.E09AvantApresB = E09AvantApresB;
