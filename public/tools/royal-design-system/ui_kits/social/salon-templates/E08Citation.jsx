/* global React */
/**
 * E08 — CITATION ÉDITORIALE
 * A — 1:1 · Citation pleine page, typo serif géante
 * B — 1:1 · Citation tournée, photo de coiffeuse en background
 */

function E08CitationA({ data = E08CitationA.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-cream)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-camel-d)';

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>
      {/* corner ornaments */}
      {['tl','tr','bl','br'].map((corner, i) => {
        const pos = {
          tl: { top: 56, left: 56,  borderTop: `1px solid ${accent}`, borderLeft: `1px solid ${accent}` },
          tr: { top: 56, right: 56, borderTop: `1px solid ${accent}`, borderRight: `1px solid ${accent}` },
          bl: { bottom: 56, left: 56,  borderBottom: `1px solid ${accent}`, borderLeft: `1px solid ${accent}` },
          br: { bottom: 56, right: 56, borderBottom: `1px solid ${accent}`, borderRight: `1px solid ${accent}` },
        }[corner];
        return <div key={i} style={{ position:'absolute', width: 32, height: 32, ...pos }} />;
      })}

      <div style={{ position:'absolute', inset:0, padding: 100,
        display:'flex', flexDirection:'column', justifyContent:'center',
        textAlign:'center',
      }}>
        <div style={{
          fontFamily: sans, fontSize: 12, fontWeight: 400,
          letterSpacing: '0.32em', textTransform:'uppercase',
          color: accent, marginBottom: 30,
        }}>{data.eyebrow}</div>

        <div style={{
          fontFamily: f, fontSize: 180, lineHeight: 0.5,
          color: accent, marginBottom: 22,
        }}>"</div>

        <div style={{
          fontFamily: f, fontWeight: data._titleWeight || 400, fontStyle: 'italic',
          fontSize: Math.round(76 * ts), lineHeight: 1.1,
          letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.01em',
          maxWidth: 760, margin: '0 auto',
        }}>{data.quote}</div>

        <div style={{
          marginTop: 36,
          display:'flex', alignItems:'center', justifyContent:'center', gap: 16,
        }}>
          <div style={{ width: 40, height: 1, background: accent }} />
          <div style={{
            fontFamily: sans, fontSize: 12, fontWeight: 400,
            letterSpacing: '0.26em', textTransform:'uppercase',
            color: accent,
          }}>{data.author}</div>
          <div style={{ width: 40, height: 1, background: accent }} />
        </div>
      </div>

      {/* tiny brand mark */}
      <div style={{
        position:'absolute', bottom: 28, left: 0, right: 0,
        display:'flex', flexDirection:'column', alignItems:'center', gap: 6,
      }}>
        {window.BSLogoIcon && window.BSLogoIcon({ size: 60, style: { opacity: 1 } })}
        <div style={{
          fontFamily: sans, fontSize: 10, fontWeight: 400,
          letterSpacing: '0.28em', textTransform: 'uppercase',
          opacity: 0.42,
        }}>{data.footer}</div>
      </div>
    </div>
  );
}
E08CitationA.defaults = {
  eyebrow: 'PENSÉE DU JOUR',
  quote: 'Une coupe ne change pas qui vous êtes — elle révèle qui vous êtes déjà.',
  author: 'LES BELLES SŒURS',
  footer: 'ESTHÉTIQUE · SHAWINIGAN, QC',
};

/* ──────────────────────────────────────────────────── */

function E08CitationB({ data = E08CitationB.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-cream)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-camel-d)';

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>
      <div style={{ position:'absolute', inset:0, display:'grid',
        gridTemplateColumns: '1.1fr 1fr',
      }}>
        {/* Photo */}
        <div style={{ padding: '56px 0 56px 56px', position:'relative' }}>
          <div className="bs-photo" style={{ width:'100%', height:'100%',
            background: data._photoBg || accent,
          }}>
            {data.photo
              ? <img src={data.photo} alt="" />
              : <span className="bs-photo-label">PHOTO<br/>ESTHÉTICIENNE</span>}
          </div>
          {/* signature stamp */}
          <div style={{
            position:'absolute', right: -34, bottom: 100,
            background: bg, color: fg,
            padding: '14px 22px',
            border: `1px solid ${fg}`,
            fontFamily: f, fontStyle: 'italic', fontSize: 22,
            transform: 'rotate(-4deg)',
            boxShadow: '0 8px 22px rgba(0,0,0,0.06)',
          }}>{data.signature}</div>
        </div>

        {/* Quote */}
        <div style={{ padding: '88px 70px 80px 56px',
          display:'flex', flexDirection:'column', justifyContent:'space-between',
        }}>
          <div>
            <div style={{
              fontFamily: sans, fontSize: 11, fontWeight: 400,
              letterSpacing: '0.28em', textTransform:'uppercase',
              color: accent, marginBottom: 18,
            }}>{data.eyebrow}</div>
            <div style={{
              fontFamily: f, fontSize: 120, lineHeight: 0.4,
              color: accent, marginBottom: 18,
            }}>"</div>
            <div style={{
              fontFamily: f, fontWeight: data._titleWeight || 400, fontStyle: 'italic',
              fontSize: Math.round(46 * ts), lineHeight: 1.18,
              letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.005em',
            }}>{data.quote}</div>
          </div>

          <div>
            <div style={{ height: 1, background: fg, opacity: 0.2, marginBottom: 18 }} />
            <div style={{
              fontFamily: f, fontSize: 26,
            }}>{data.author}</div>
            <div style={{
              fontFamily: sans, fontSize: 11, fontWeight: 400,
              letterSpacing: '0.24em', textTransform:'uppercase',
              opacity: 0.55, marginTop: 4,
            }}>{data.role}</div>
            <div style={{ marginTop: 16 }}>
              {window.BSLogoTexte && window.BSLogoTexte({ height: 28, style: { opacity: 1 } })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
E08CitationB.defaults = {
  eyebrow: "PAROLE D'ESTHÉTICIENNE",
  quote: 'Ma priorité, c\'est votre bien-être — pas juste le résultat. Quand vous êtes à l\'aise sur la table, la magie opère naturellement.',
  signature: 'Sophie',
  author: 'Sophie Lavoie',
  role: 'ESTHÉTICIENNE PRINCIPALE',
  photo: '',
};

window.E08CitationA = E08CitationA;
window.E08CitationB = E08CitationB;
