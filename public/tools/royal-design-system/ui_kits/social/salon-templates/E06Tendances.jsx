/* global React */
/**
 * E06 — TENDANCES COULEUR
 * A — 1:1 · Palette saisonnière, 4 swatches éditoriaux nommés
 * B — 1:1 · Couleur du mois, photo modèle + fiche détaillée
 */

const TRENDS_DEFAULT = [
  { name: 'Caramel beurré',     code: '02',    hex: '#B8814A' },
  { name: 'Miel Toscane',       code: '07',    hex: '#D49A52' },
  { name: 'Châtain noisette',   code: '11',    hex: '#7B5236' },
  { name: 'Espresso brûlé',     code: '23',    hex: '#3D2515' },
];

function E06TendancesA({ data = E06TendancesA.defaults }) {
  const ts = data._titleScale || 1;
  const f = data._font || "'Gloock', serif";
  const sans = data._fontBody || "'Figtree', sans-serif";
  const bg = data._bg || 'var(--bs-cream)';
  const bgStage = window.salonBgCss ? window.salonBgCss(data, bg) : bg;
  const fg = data._fg || 'var(--bs-ink)';
  const accent = data._accent || 'var(--bs-camel-d)';

  const palette = data.palette || TRENDS_DEFAULT;

  return (
    <div className="bs-stage" style={{ background: bgStage, color: fg }}>
      <div style={{ position:'absolute', inset:0, padding:'80px 90px',
        display:'flex', flexDirection:'column', justifyContent:'space-between',
      }}>
        {/* Header */}
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'flex-end',
        }}>
          <div>
            <div style={{
              fontFamily: sans, fontSize: 12, fontWeight: 400,
              letterSpacing: '0.28em', textTransform: 'uppercase',
              opacity: 0.6, marginBottom: 14,
            }}>{data.eyebrow}</div>
            <div style={{
              fontFamily: f, fontWeight: data._titleWeight || 400,
              fontSize: Math.round(82 * ts), lineHeight: 0.95,
              letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.015em',
            }}>
              Palette<br/>
              <em style={{ fontStyle:'italic', color: accent }}>{data.season}</em>
            </div>
          </div>
          <div style={{
            fontFamily: f, fontStyle: 'italic',
            fontSize: 26, color: accent,
            textAlign:'right',
          }}>
            <div>n° {data.issue}</div>
            <div style={{
              fontFamily: sans, fontStyle:'normal', fontSize: 11, fontWeight: 400,
              letterSpacing: '0.24em', textTransform:'uppercase',
              color: fg, opacity: 0.55, marginTop: 4,
            }}>{data.year}</div>
          </div>
        </div>

        {/* Swatches grid */}
        <div style={{
          display:'grid',
          gridTemplateColumns: `repeat(${palette.length}, 1fr)`,
          gap: 18,
        }}>
          {palette.map((c, i) => (
            <div key={i} style={{ display:'flex', flexDirection:'column' }}>
              <div style={{
                width:'100%', aspectRatio: '3 / 4',
                background: c.hex,
                position:'relative',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
              }}>
                <div style={{
                  position:'absolute', top: 12, left: 14,
                  fontFamily: sans, fontSize: 10, fontWeight: 400,
                  letterSpacing: '0.3em',
                  color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                }}>N° {c.code}</div>
                <div style={{
                  position:'absolute', bottom: 12, right: 14,
                  fontFamily: sans, fontSize: 10, fontWeight: 400,
                  letterSpacing: '0.2em',
                  color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                }}>{c.hex.toUpperCase()}</div>
              </div>
              <div style={{
                fontFamily: f, fontSize: 22, fontStyle: 'italic',
                marginTop: 14, lineHeight: 1.2,
              }}>{c.name}</div>
              <div style={{
                fontFamily: sans, fontSize: 11, fontWeight: 400,
                letterSpacing: '0.24em', textTransform:'uppercase',
                opacity: 0.55, marginTop: 4,
              }}>{c.tag || 'COLORATION'}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bs-footer-row">
          <span>{data.footerLeft}</span>
          {window.BSLogoIcon && window.BSLogoIcon({ size: 52, style: { opacity: 1 } })}
          <span>{data.footerRight}</span>
        </div>
      </div>
    </div>
  );
}
E06TendancesA.defaults = {
  eyebrow: 'TENDANCES COLORATION · CARTE',
  season: 'Automne',
  issue: '04',
  year: 'OCTOBRE 2025',
  palette: [
    { name: 'Caramel beurré',   code: '02', hex: '#B8814A', tag: 'BALAYAGE' },
    { name: 'Miel Toscane',     code: '07', hex: '#D49A52', tag: 'OMBRÉ' },
    { name: 'Châtain noisette', code: '11', hex: '#7B5236', tag: 'COULEUR' },
    { name: 'Espresso brûlé',   code: '23', hex: '#3D2515', tag: 'NUANCE' },
  ],
  footerLeft: '@LESBELLESSOEURS',
  footerRight: 'PRENEZ RDV · LIEN EN BIO',
};

/* ──────────────────────────────────────────────────── */

function E06TendancesB({ data = E06TendancesB.defaults }) {
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
        gridTemplateColumns: '1fr 1fr',
      }}>
        {/* Photo modèle */}
        <div style={{ padding: '56px 0 56px 56px', position:'relative' }}>
          <div className="bs-photo" style={{ width:'100%', height:'100%',
            background: data._photoBg || accent,
          }}>
            {data.photo
              ? <img src={data.photo} alt="" />
              : <span className="bs-photo-label">PHOTO MODÈLE<br/>COULEUR DU MOIS</span>}
          </div>
          {/* corner stamp */}
          <div style={{
            position:'absolute', top: 80, left: 80,
            width: 120, height: 120, borderRadius: '50%',
            background: bg, color: fg,
            border: `1px solid ${fg}`,
            display:'grid', placeItems:'center', textAlign:'center',
            fontFamily: f, fontStyle:'italic', fontSize: 18,
            lineHeight: 1.1,
          }}>
            <div>
              <div style={{
                fontFamily: sans, fontStyle:'normal', fontSize: 9, fontWeight: 500,
                letterSpacing: '0.26em', opacity: 0.6,
              }}>COULEUR<br/>DU MOIS</div>
              <div style={{ marginTop: 6, fontSize: 22 }}>{data.swatchCode || 'N° 07'}</div>
            </div>
          </div>
        </div>

        {/* Fiche */}
        <div style={{
          padding: '76px 80px',
          display:'flex', flexDirection:'column', justifyContent:'space-between',
        }}>
          <div>
            <div style={{
              fontFamily: sans, fontSize: 12, fontWeight: 400,
              letterSpacing: '0.28em', textTransform:'uppercase',
              color: accent, marginBottom: 14,
            }}>{data.eyebrow}</div>
            <div style={{
              fontFamily: f, fontWeight: data._titleWeight || 400,
              fontSize: Math.round(78 * ts), lineHeight: 0.96,
              letterSpacing: data._letterSpacing !== undefined ? `${data._letterSpacing}em` : '-0.015em',
            }}>
              {data.colorName}
            </div>
            <div style={{
              fontFamily: f, fontStyle: 'italic',
              fontSize: 28, color: accent, marginTop: 12,
            }}>{data.colorTagline}</div>

            <div style={{ height:1, background: fg, opacity: 0.18, margin: '32px 0 24px' }} />

            <div style={{
              fontFamily: sans, fontSize: 16, lineHeight: 1.6, fontWeight: 300,
              opacity: 0.82, marginBottom: 26,
            }}>{data.body}</div>

            {/* Mini swatch + specs */}
            <div style={{ display:'flex', alignItems:'stretch', gap: 16 }}>
              <div style={{
                width: 84, height: 84,
                background: data.swatchHex,
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
              }} />
              <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 28px', alignContent:'center' }}>
                {(data.specs || []).map((s, i) => (
                  <React.Fragment key={i}>
                    <div style={{
                      fontFamily: sans, fontSize: 10, fontWeight: 400,
                      letterSpacing: '0.28em', textTransform:'uppercase',
                      opacity: 0.55,
                    }}>{s.label}</div>
                    <div style={{
                      fontFamily: f, fontStyle: 'italic', fontSize: 18,
                    }}>{s.value}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="bs-footer-row" style={{ marginTop: 40 }}>
            <span>{data.footerLeft}</span>
            {window.BSLogoIcon && window.BSLogoIcon({ size: 52, style: { opacity: 1 } })}
            <span>{data.footerRight}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
E06TendancesB.defaults = {
  eyebrow: 'COULEUR DE LA SAISON · OCTOBRE',
  swatchCode: 'N° 07',
  colorName: 'Miel\nToscane',
  colorTagline: 'la chaleur d\'un dimanche',
  body: 'Un blond chaud aux reflets dorés, taillé pour les jours qui raccourcissent. Idéal sur bases châtaines à brunes claires, en balayage ou en glaze enveloppant.',
  swatchHex: '#D49A52',
  specs: [
    { label: 'TON',       value: 'chaud · doré' },
    { label: 'BASE',      value: '5 à 7' },
    { label: 'TECHNIQUE', value: 'balayage' },
    { label: 'DURÉE',     value: '3h env.' },
  ],
  photo: '',
  footerLeft: '@LESBELLESSOEURS',
  footerRight: 'RDV · LIEN EN BIO',
};

window.E06TendancesA = E06TendancesA;
window.E06TendancesB = E06TendancesB;
