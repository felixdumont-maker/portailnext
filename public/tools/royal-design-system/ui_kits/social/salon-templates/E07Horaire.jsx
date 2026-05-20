/* global React */
/**
 * E07 — HORAIRE / OUVERTURE
 * A — 1:1 · Tableau hebdomadaire éditorial, jours · heures
 * B — 1:1 · Avis de fermeture / horaire spécial, format affiche
 */

const HOURS_DEFAULT = [
  { d: 'Lundi',     h: 'Fermé',         closed: true },
  { d: 'Mardi',     h: '9 h — 18 h' },
  { d: 'Mercredi',  h: '9 h — 20 h' },
  { d: 'Jeudi',     h: '9 h — 20 h' },
  { d: 'Vendredi',  h: '9 h — 18 h' },
  { d: 'Samedi',    h: '9 h — 16 h' },
  { d: 'Dimanche',  h: 'Fermé',         closed: true },
];

function E07HoraireA({ data = E07HoraireA.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-cream)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-camel-d)';
  const hours = data.hours || HOURS_DEFAULT;

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>
      <div style={{ position:'absolute', inset:0, padding:'76px 90px',
        display:'flex', flexDirection:'column', justifyContent:'space-between',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: sans, fontSize: 12, fontWeight: 400,
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: accent,
          }}>{data.eyebrow}</div>
          <div style={{
            fontFamily: f, fontWeight: data._titleWeight || 400,
            fontSize: Math.round(86 * ts), lineHeight: 1,
            letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.015em',
            marginTop: 14,
          }}>
            {data.titleMain || 'Heures'}<br/>
            <em style={{ fontStyle: 'italic', color: accent }}>{data.titleItalic}</em>
          </div>
        </div>

        {/* Schedule */}
        <div style={{ maxWidth: 620, margin: '0 auto', width: '100%' }}>
          {hours.map((row, i) => (
            <div key={i} style={{
              display:'grid', gridTemplateColumns: '1fr auto',
              alignItems: 'baseline',
              padding: '14px 0',
              borderTop: i === 0 ? `1px solid ${fg}` : 'none',
              borderBottom: `1px solid ${fg}`,
              opacity: row.closed ? 0.45 : 1,
            }}>
              <div style={{
                fontFamily: f, fontStyle: 'italic',
                fontSize: 30, fontWeight: 400,
              }}>{row.d}</div>
              <div style={{
                fontFamily: sans, fontSize: 18, fontWeight: 400,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: row.closed ? fg : accent,
              }}>{row.h}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign:'center' }}>
          {window.BSLogoIcon && window.BSLogoIcon({ size: 68, style: { margin: '0 auto 12px', opacity: 1 } })}
          <div style={{
            fontFamily: f, fontStyle: 'italic', fontSize: 22,
            opacity: 0.78,
          }}>{data.tagline}</div>
          <div style={{
            fontFamily: sans, fontSize: 12, fontWeight: 400,
            letterSpacing: '0.26em', textTransform:'uppercase',
            opacity: 0.55, marginTop: 14,
          }}>{data.footer}</div>
        </div>
      </div>
    </div>
  );
}
E07HoraireA.defaults = {
  eyebrow: 'SALON · HORAIRES D\'OUVERTURE',
  titleMain: 'Heures',
  titleItalic: 'd\'ouverture',
  hours: HOURS_DEFAULT,
  tagline: 'sur rendez-vous, toujours.',
  footer: '(819) 536-9264  ·  @LESBELLESSOEURS',
};

/* ──────────────────────────────────────────────────── */

function E07HoraireB({ data = E07HoraireB.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-cream)';
  const fg = data._fg || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-camel-d)';

  return (
    <div className="bs-stage" style={{ background: window.salonBgCss ? window.salonBgCss(data, fg) : fg, color: bg }}>
      {/* decorative wash */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 30%, color-mix(in oklch, ${accent} 20%, transparent) 0%, transparent 60%)`,
      }} />

      <div style={{ position:'absolute', inset:0, padding:'80px 90px',
        display:'flex', flexDirection:'column', justifyContent:'space-between',
        textAlign:'center',
      }}>
        <div>
          <div style={{
            fontFamily: sans, fontSize: 12, fontWeight: 400,
            letterSpacing: '0.32em', textTransform:'uppercase',
            color: accent, marginBottom: 18,
          }}>{data.eyebrow}</div>
          <div style={{
            display:'inline-block',
            fontFamily: sans, fontSize: 11, fontWeight: 500,
            letterSpacing: '0.28em', textTransform:'uppercase',
            padding: '8px 18px',
            border: `1px solid ${accent}`,
            color: accent,
          }}>{data.tag}</div>
        </div>

        <div>
          <div style={{
            fontFamily: f, fontWeight: data._titleWeight || 400,
            fontSize: Math.round(108 * ts), lineHeight: 0.92,
            letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.02em',
          }}>
            {data.titleMain || 'Le salon'}<br/>
            <em style={{ fontStyle: 'italic', color: accent }}>{data.titleItalic}</em>
          </div>
          <div style={{
            fontFamily: f, fontStyle: 'italic',
            fontSize: 36, marginTop: 22,
            opacity: 0.85,
          }}>{data.dateRange}</div>
        </div>

        <div>
          <div style={{
            fontFamily: sans, fontSize: 16, lineHeight: 1.55, fontWeight: 300,
            maxWidth: 540, margin: '0 auto', opacity: 0.78,
          }}>{data.body}</div>
          <div style={{ display:'flex', justifyContent:'center', marginTop: 22 }}>
            {window.BSLogoIcon && window.BSLogoIcon({ size: 56, style: { opacity: 1, filter: 'brightness(0) invert(1)' } })}
          </div>
          <div style={{
            display:'flex', justifyContent:'center', gap: 36, marginTop: 14,
            fontFamily: sans, fontSize: 12, fontWeight: 400,
            letterSpacing: '0.26em', textTransform:'uppercase',
            color: accent,
          }}>
            <span>{data.footerLeft}</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>{data.footerRight}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
E07HoraireB.defaults = {
  eyebrow: 'AVIS À LA CLIENTÈLE',
  tag: 'FERMETURE TEMPORAIRE',
  titleMain: 'Le salon',
  titleItalic: 'fait relâche',
  dateRange: 'du 23 au 28 décembre',
  body: 'Toute l\'équipe prend une pause bien méritée. Nous vous retrouvons le 30 décembre, fraîchement reposées et prêtes à magnifier votre fin d\'année.',
  footerLeft: 'PRENEZ RDV EN AVANCE',
  footerRight: '@LESBELLESSOEURS',
};

window.E07HoraireA = E07HoraireA;
window.E07HoraireB = E07HoraireB;
