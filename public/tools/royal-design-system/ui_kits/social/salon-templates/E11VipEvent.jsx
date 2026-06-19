/* global React */
/**
 * E11 — SOIRÉE VIP / ÉVÉNEMENT EXCLUSIF
 * A — 1:1 · Affiche typographique sombre, infos clés en badges
 * B — 1:1 · Carte invitation avec photo + détails
 * C — 1:1 · Double expérience (deux pros, deux ateliers) avec photos découpées
 * D — 1:1 · Affiche « Glow Up » rose/or/noir, fidèle à la maquette cliente
 */

function E11VipEventA({ data = E11VipEventA.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-ink)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-cream)';
  const accent = data._accent || '#f4d35e';
  const infos = Array.isArray(data.infos) && data.infos.length ? data.infos : E11VipEventA.defaults.infos;

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>
      {/* halo décoratif */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 22%, color-mix(in oklch, ${accent} 22%, transparent) 0%, transparent 62%)`,
      }} />

      <div style={{ position:'absolute', inset:0, padding:'86px 90px',
        display:'flex', flexDirection:'column', justifyContent:'space-between', alignItems:'center',
      }}>
        {/* Eyebrow + badge */}
        <div style={{ textAlign:'center' }}>
          <div style={{
            display:'inline-block', border: `1px solid ${accent}`, borderRadius: 999,
            padding: '8px 22px', marginBottom: 22,
            fontFamily: sans, fontSize: 11, fontWeight: 500,
            letterSpacing: '0.3em', textTransform:'uppercase', color: accent,
          }}>{data.badge}</div>
          <div style={{
            fontFamily: sans, fontSize: 13, fontWeight: 400,
            letterSpacing: '0.26em', textTransform:'uppercase',
            opacity: 0.7,
          }}>{data.eyebrow}</div>
        </div>

        {/* Titre */}
        <div style={{ textAlign:'center' }}>
          <div style={{
            fontFamily: f, fontWeight: data._titleWeight || 300,
            fontSize: Math.round(118 * ts), lineHeight: 0.94,
            letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.015em',
          }}>{data.titleMain}</div>
          <div style={{
            fontFamily: f, fontStyle:'italic', fontWeight: data._titleWeight || 400,
            fontSize: Math.round(168 * ts), lineHeight: 0.92,
            color: accent, margin: '6px 0 26px',
          }}>{data.titleItalic}</div>

          <div style={{
            fontFamily: sans, fontSize: 16, lineHeight: 1.7, fontWeight: 300,
            opacity: 0.8, maxWidth: 560, margin: '0 auto',
          }}>{data.description}</div>
        </div>

        {/* Infos clés (date / heure / lieu) */}
        <div style={{ display:'flex', gap: 28, justifyContent:'center', flexWrap:'wrap' }}>
          {infos.map((it, i) => (
            <div key={i} style={{ textAlign:'center', minWidth: 140 }}>
              <div style={{
                fontFamily: sans, fontSize: 11, fontWeight: 500,
                letterSpacing: '0.26em', textTransform:'uppercase',
                color: accent, marginBottom: 8,
              }}>{it.label}</div>
              <div style={{
                fontFamily: f, fontStyle:'italic', fontSize: 24, lineHeight: 1.2,
              }}>{it.value}</div>
            </div>
          ))}
        </div>

        {/* Footer / RSVP */}
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          width: '100%', paddingTop: 24,
          borderTop: `1px solid color-mix(in oklch, ${fg} 18%, transparent)`,
          fontFamily: sans, fontSize: 13, fontWeight: 400,
          letterSpacing: '0.22em', textTransform:'uppercase',
        }}>
          <span style={{ color: accent }}>{data.cta}</span>
          <span style={{ opacity: 0.65 }}>{data.rsvp}</span>
        </div>
      </div>
    </div>
  );
}
E11VipEventA.defaults = {
  badge: 'SUR INVITATION',
  eyebrow: 'ÉVÉNEMENT EXCLUSIF',
  titleMain: 'SOIRÉE',
  titleItalic: 'VIP',
  description: 'Une soirée intime entre client·es privilégié·es : bulles, mignardises et surprises beauté. Places très limitées — première arrivée, première servie.',
  infos: [
    { label: 'Date',  value: 'Jeudi 18 juin' },
    { label: 'Heure', value: '18 h — 21 h' },
    { label: 'Lieu',  value: 'Au salon' },
  ],
  cta:  'CONFIRME TA PRÉSENCE →',
  rsvp: 'RSVP avant le 14 juin',
};

/* ──────────────────────────────────────────────────── */

function E11VipEventB({ data = E11VipEventB.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-blush)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-camel-d)';
  const infos = Array.isArray(data.infos) && data.infos.length ? data.infos : E11VipEventB.defaults.infos;

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>
      <div style={{
        position: 'absolute', top: 64, left: 72, right: 72, bottom: 64,
        display: 'grid', gridTemplateColumns: '48% 52%',
        background: 'var(--bs-cream)',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(61,44,32,0.10)',
      }}>
        {/* Photo */}
        <div className="bs-photo">
          {data.photo
            ? <img src={data.photo} alt=""
                style={{ objectPosition: `${data._photoX ?? 50}% ${data._photoY ?? 50}%` }} />
            : <span className="bs-photo-label">PHOTO ÉVÉNEMENT<br/>ambiance, déco, équipe</span>}
        </div>

        {/* Panneau invitation */}
        <div style={{
          padding: '58px 54px 50px',
          display:'flex', flexDirection:'column', justifyContent:'space-between',
        }}>
          <div>
            <div style={{
              fontFamily: sans, fontSize: 12, fontWeight: 400,
              letterSpacing: '0.28em', textTransform:'uppercase',
              color: accent, marginBottom: 16,
            }}>{data.tag}</div>

            <div style={{
              fontFamily: f, fontWeight: data._titleWeight || 400,
              fontSize: Math.round(58 * ts), lineHeight: 1.04,
              letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.01em',
            }}>
              {data.title}<br/>
              <em style={{ fontStyle:'italic', color: accent }}>{data.titleItalic}</em>
            </div>

            <div style={{ height: 1, background: 'currentColor', opacity: 0.16, margin: '26px 0 22px' }} />

            <div style={{ display:'flex', flexDirection:'column', gap: 14, marginBottom: 24 }}>
              {infos.map((it, i) => (
                <div key={i} style={{ display:'flex', alignItems:'baseline', gap: 14 }}>
                  <span style={{
                    fontFamily: sans, fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.2em', textTransform:'uppercase',
                    color: accent, minWidth: 64,
                  }}>{it.label}</span>
                  <span style={{ fontFamily: sans, fontSize: 16, fontWeight: 400, opacity: 0.85 }}>{it.value}</span>
                </div>
              ))}
            </div>

            <div style={{
              fontFamily: sans, fontSize: 14.5, lineHeight: 1.65,
              fontWeight: 300, opacity: 0.74,
            }}>{data.description}</div>
          </div>

          <div>
            <div style={{
              fontFamily: f, fontStyle:'italic', fontSize: 17, opacity: 0.55, marginBottom: 12,
            }}>{data.note}</div>
            <div style={{
              display:'inline-block', background: fg, color: bg, padding: '15px 28px',
              fontFamily: sans, fontSize: 12.5, fontWeight: 500,
              letterSpacing: '0.2em', textTransform:'uppercase',
            }}>{data.cta}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
E11VipEventB.defaults = {
  tag: 'INVITATION',
  title: 'Soirée',
  titleItalic: 'VIP',
  infos: [
    { label: 'Date',  value: 'Jeudi 18 juin 2026' },
    { label: 'Heure', value: '18 h à 21 h' },
    { label: 'Lieu',  value: 'Au salon · 123 rue Principale' },
  ],
  description: 'On t\'ouvre les portes après les heures pour une soirée toute douce : bulles, bouchées, surprises beauté et bons cadeaux exclusifs pour les présent·es.',
  note: 'Places limitées — confirme ta présence.',
  cta: 'JE CONFIRME MA PRÉSENCE',
  photo: 'refs/ref-04.webp',
  _photoX: 50,
  _photoY: 50,
};

/* ──────────────────────────────────────────────────── */

function E11VipEventC({ data = E11VipEventC.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-cream)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-camel-d)';
  const sections = Array.isArray(data.sections) && data.sections.length === 2
    ? data.sections : E11VipEventC.defaults.sections;

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>
      <div style={{
        position: 'absolute', inset: 0, padding: '54px 64px',
        display: 'flex', flexDirection: 'column', gap: 22,
      }}>
        {/* En-tête */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: sans, fontSize: 11, fontWeight: 500,
            letterSpacing: '0.3em', textTransform: 'uppercase', color: accent, marginBottom: 8,
          }}>{data.eyebrow}</div>
          <div style={{
            fontFamily: f, fontWeight: data._titleWeight || 300,
            fontSize: Math.round(50 * ts), lineHeight: 1.05,
          }}>
            {data.titleMain} <em style={{ fontStyle: 'italic', color: accent }}>{data.titleItalic}</em>
          </div>
          <div style={{
            fontFamily: sans, fontSize: 13, lineHeight: 1.6, fontWeight: 300,
            opacity: 0.7, maxWidth: 520, margin: '10px auto 0',
          }}>{data.tagline}</div>
        </div>

        {/* Duo de photos découpées */}
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
          {sections.map((s, i) => (
            <div key={i} style={{ flex: 1, maxWidth: 230, textAlign: 'center' }}>
              <div style={{
                borderRadius: 8, overflow: 'hidden', aspectRatio: '4/5',
                border: `1px solid color-mix(in oklch, ${fg} 14%, transparent)`,
              }}>
                {s.photo
                  ? <img src={s.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div className="bs-photo-label" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%',
                      background: 'rgba(0,0,0,0.05)', fontSize: 10, fontFamily: sans,
                    }}>PHOTO DÉCOUPÉE</div>}
              </div>
              <div style={{
                fontFamily: sans, fontSize: 10.5, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: accent, marginTop: 10,
              }}>{s.role}</div>
            </div>
          ))}
        </div>

        {/* Deux expériences, côte à côte */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, minHeight: 0 }}>
          {sections.map((s, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <div style={{
                fontFamily: sans, fontSize: 10.5, fontWeight: 500,
                letterSpacing: '0.22em', textTransform: 'uppercase', color: accent, marginBottom: 4,
              }}>{s.eyebrow}</div>
              <div style={{ fontFamily: f, fontStyle: 'italic', fontSize: 21, lineHeight: 1.15, marginBottom: 13 }}>{s.label}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {(s.items || []).map((it, j) => (
                  <li key={j} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 9,
                    fontFamily: sans, fontSize: 12.5, lineHeight: 1.5, opacity: 0.8,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent, marginTop: 6, flexShrink: 0 }} />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Pied de page : tirage + CTA */}
        <div style={{
          textAlign: 'center', borderTop: `1px solid color-mix(in oklch, ${fg} 16%, transparent)`,
          paddingTop: 18,
        }}>
          <div style={{ fontFamily: f, fontStyle: 'italic', fontSize: 18, color: accent, marginBottom: 12 }}>{data.draw}</div>
          <div style={{
            display: 'inline-block', background: fg, color: bg, padding: '14px 30px',
            fontFamily: sans, fontSize: 12, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase',
          }}>{data.cta}</div>
          <div style={{ fontFamily: sans, fontSize: 11.5, opacity: 0.6, marginTop: 12, letterSpacing: '0.04em' }}>{data.rsvp}</div>
        </div>
      </div>
    </div>
  );
}
E11VipEventC.defaults = {
  eyebrow: 'JOURNÉE VIP',
  titleMain: 'Glow',
  titleItalic: 'Up',
  tagline: 'Une journée, deux expériences, un seul Glow Up — prenez du temps pour vous, vous le méritez !',
  sections: [
    {
      role: 'Coiffure',
      eyebrow: 'Beauté & vitalité',
      label: 'Au salon de coiffure',
      photo: '',
      items: [
        'Analyse capillaire gratuite',
        'Conseils beauté et bien-être',
        'Découverte de solutions nutritionnelles',
      ],
    },
    {
      role: 'Esthétique',
      eyebrow: 'Technologie & bien-être',
      label: 'Aux Belles Sœurs Esthétique',
      photo: '',
      items: [
        'VIP d’essai de nos technologies : Laser Triton — résultats visibles pour une peau plus lisse et uniforme',
        'B-Pulse / B-Online — 100 % améliore le bien-être intime',
        'Analyse capillaire gratuite : nutrition, équilibre, bien-être quotidien et santé capillaire',
      ],
    },
  ],
  draw: 'À gagner : 2 paniers-cadeaux Expérience',
  cta: 'CONFIRME TA PRÉSENCE →',
  rsvp: 'Jeudi 18 juin · places limitées',
};

/* ──────────────────────────────────────────────────── */

function E11VipEventD({ data = E11VipEventD.defaults }) {
  const sans   = data._fontBody || "'Figtree', sans-serif";
  const script = data._font || "'Gloock', serif";
  const accent = data._accent || '#e8669f';
  const gold   = data._gold   || '#d8b25c';
  const ink    = data._bg     || '#1c1216';
  const sections = Array.isArray(data.sections) && data.sections.length === 2
    ? data.sections : E11VipEventD.defaults.sections;
  const highlights = Array.isArray(data.highlights) && data.highlights.length
    ? data.highlights : E11VipEventD.defaults.highlights;

  return (
    <div className="bs-stage" style={{
      background: `radial-gradient(ellipse at 50% 14%, color-mix(in oklch, ${accent} 30%, transparent) 0%, ${ink} 55%)`,
      color: '#fff',
    }}>
      {/* cadre or décoratif */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 20, border: `1px solid ${gold}`, borderRadius: 8, pointerEvents: 'none' }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 26, border: `1px solid color-mix(in oklch, ${gold} 45%, transparent)`, borderRadius: 6, pointerEvents: 'none' }} />

      <div style={{ position: 'absolute', inset: 0, padding: '50px 56px', display: 'flex', flexDirection: 'column', gap: 13 }}>

        {/* Titre */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: sans, fontSize: 11, letterSpacing: '0.42em', textTransform: 'uppercase', color: gold }}>{data.eyebrow}</div>
          <div style={{ fontFamily: script, fontWeight: 400, fontSize: 44, letterSpacing: '0.05em', lineHeight: 1, marginTop: 6 }}>{data.titleMain}</div>
          <div style={{ fontFamily: script, fontStyle: 'italic', fontSize: 50, color: accent, lineHeight: 1.1, marginTop: 2 }}>
            {data.titleScript} <span style={{ fontSize: 26 }}>♡</span>
          </div>
          <div style={{ fontFamily: sans, fontStyle: 'italic', fontSize: 12.5, opacity: 0.72, marginTop: 8 }}>{data.tagline}</div>
        </div>

        {/* Duo de photos découpées, avec halo */}
        <div style={{ position: 'relative', height: 192, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div aria-hidden="true" style={{
            position: 'absolute', width: 280, height: 170, borderRadius: '50%',
            background: `radial-gradient(ellipse, color-mix(in oklch, ${accent} 38%, transparent) 0%, transparent 70%)`,
            filter: 'blur(6px)',
          }} />
          {sections.map((s, i) => (
            <div key={i} style={{
              position: 'relative', width: 138, height: 178, borderRadius: 14, overflow: 'hidden',
              border: `2px solid ${gold}`, boxShadow: `0 0 32px color-mix(in oklch, ${accent} 55%, transparent)`,
              marginLeft: i === 0 ? 0 : -30, transform: `rotate(${i === 0 ? -5 : 5}deg)`, zIndex: i,
            }}>
              {s.photo
                ? <img src={s.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div className="bs-photo-label" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%',
                    background: 'rgba(255,255,255,0.06)', fontSize: 10, fontFamily: sans, color: '#fff',
                  }}>PHOTO {i + 1}</div>}
            </div>
          ))}
        </div>

        {/* Bandeau slogan */}
        <div style={{
          textAlign: 'center', background: 'rgba(0,0,0,0.32)', border: `1px solid color-mix(in oklch, ${gold} 55%, transparent)`,
          borderRadius: 999, padding: '11px 22px', fontFamily: sans, fontSize: 11.5, letterSpacing: '0.06em',
        }}>
          {data.banner} <em style={{ fontStyle: 'italic', color: accent }}>{data.bannerEmphasis}</em> <span>♡</span>
        </div>

        {/* Rangée de points forts */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          {highlights.map((h, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 22, lineHeight: 1 }}>{h.icon}</div>
              <div style={{ fontFamily: sans, fontSize: 9, lineHeight: 1.35, marginTop: 6, opacity: 0.82 }}>{h.label}</div>
            </div>
          ))}
        </div>

        {/* Phrase de transition */}
        <div style={{ textAlign: 'center', fontFamily: script, fontStyle: 'italic', fontSize: 16, color: gold, margin: '2px 0' }}>
          {data.divider}
        </div>

        {/* Deux expériences + badge date central */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'start', minHeight: 0 }}>
          {sections.map((s, i) => (
            <div key={i} style={{
              order: i === 0 ? 0 : 2,
              background: 'rgba(255,255,255,0.05)', border: `1px solid color-mix(in oklch, ${gold} 35%, transparent)`,
              borderRadius: 10, padding: '16px 16px 14px', textAlign: 'left',
            }}>
              <div style={{ fontFamily: sans, fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: accent, marginBottom: 3 }}>{s.eyebrow}</div>
              <div style={{ fontFamily: script, fontStyle: 'italic', fontSize: 17, marginBottom: 9 }}>{s.label}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(s.items || []).map((it, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontFamily: sans, fontSize: 10.5, lineHeight: 1.45, opacity: 0.82 }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: gold, marginTop: 6, flexShrink: 0 }} />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
              <div style={{
                display: 'inline-block', border: `1px solid ${accent}`, borderRadius: 999, padding: '4px 14px',
                fontFamily: sans, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: accent,
              }}>{s.tag}</div>
            </div>
          ))}
          <div style={{ order: 1, alignSelf: 'center', textAlign: 'center' }}>
            <div style={{
              width: 76, height: 76, borderRadius: '50%', border: `2px solid ${accent}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.25)',
            }}>
              <div style={{ fontFamily: sans, fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.7 }}>{data.dateLabel}</div>
              <div style={{ fontFamily: script, fontWeight: 400, fontSize: 16, color: gold, lineHeight: 1.15 }}>{data.dateValue}</div>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div style={{ textAlign: 'center', borderTop: `1px solid color-mix(in oklch, ${gold} 30%, transparent)`, paddingTop: 12 }}>
          <div style={{ fontFamily: script, fontStyle: 'italic', fontSize: 19 }}>
            {data.closingMain} <em style={{ fontStyle: 'italic', color: accent }}>{data.closingAccent}</em> {data.closingEnd} <span style={{ color: accent }}>♡</span>
          </div>
          <div style={{
            display: 'inline-block', marginTop: 8, border: `1px solid ${gold}`, borderRadius: 999,
            padding: '6px 18px', fontFamily: sans, fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: gold,
          }}>{data.badge} ♡</div>
          <div style={{ fontFamily: sans, fontSize: 10, opacity: 0.55, marginTop: 10, fontStyle: 'italic' }}>{data.footerNote} ♡</div>
        </div>
      </div>
    </div>
  );
}
E11VipEventD.defaults = {
  eyebrow: 'JOURNÉE VIP',
  titleMain: 'JOURNÉE VIP',
  titleScript: 'Glow Up',
  tagline: 'Ta beauté du cœur au bout des ongles',
  banner: 'Beauté intérieure, beauté extérieure,',
  bannerEmphasis: 'confiance pour la vie',
  highlights: [
    { icon: '💆‍♀️', label: 'Analyse capillaire gratuite' },
    { icon: '🧴', label: 'Découvrez nos solutions pour nourrir votre beauté de l’intérieur' },
    { icon: '🎁', label: '2 paniers-cadeaux à faire tirer' },
    { icon: '💗', label: 'Prenez du temps pour vous, vous le méritez' },
  ],
  divider: 'Une journée. Deux expériences. Un seul Glow Up.',
  sections: [
    {
      eyebrow: 'Expérience beauté & vitalité',
      label: 'Au salon de coiffure',
      tag: 'Journée',
      items: [
        'Analyse capillaire gratuite',
        'Conseils beauté et bien-être',
        'Découverte de solutions nutritionnelles',
        'Tirage de 2 paniers-cadeaux',
      ],
      photo: '',
    },
    {
      eyebrow: 'Expérience technologie & bien-être',
      label: 'Aux Belles Sœurs Esthétique',
      tag: 'Soirée VIP',
      items: [
        'VIP d’essai de nos technologies',
        'Laser Triton — résultats visibles, peau plus lisse et uniforme',
        'B-Pulse / B-Online — améliore le bien-être intime',
        'Découverte de nos soins spécialisés',
      ],
      photo: '',
    },
  ],
  dateLabel: 'Jeudi',
  dateValue: '18 juin',
  closingMain: 'Venez vivre une expérience',
  closingAccent: 'VIP',
  closingEnd: 'avec nous !',
  badge: 'Vous êtes précieuse',
  footerNote: 'Prenez soin de vous, dedans comme dehors',
};

window.E11VipEventA = E11VipEventA;
window.E11VipEventB = E11VipEventB;
window.E11VipEventC = E11VipEventC;
window.E11VipEventD = E11VipEventD;
