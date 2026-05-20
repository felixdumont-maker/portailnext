/* global React */
/**
 * R04 — HORAIRE DE LA SEMAINE
 * Template modifiable via le panneau d’édition dans index.html.
 */
function R04Horaire({ data = R04Horaire.defaults }) {
  const title = data.title || 'HORAIRE DE LA SEMAINE';
  const titleLines = title.split('\n');
  const colors = data.colors || {};
  const fonts  = data.fonts  || {};
  const colorVars = {};
  if (colors.bg)        { colorVars['--template-bg']    = colors.bg; colorVars['--brand'] = colors.bg; }
  if (colors.pillBg)      colorVars['--pill-bg']         = colors.pillBg;
  if (colors.pillFg)      colorVars['--pill-fg']         = colors.pillFg;
  if (colors.homeCardBg)  colorVars['--home-card-bg']    = colors.homeCardBg;
  if (colors.awayCardBg)  colorVars['--away-card-bg']    = colors.awayCardBg;
  if (colors.awayCardFg)  colorVars['--away-card-fg']    = colors.awayCardFg;
  if (colors.homeTagBg)   colorVars['--home-tag-bg']     = colors.homeTagBg;
  if (colors.homeTagFg)   colorVars['--home-tag-fg']     = colors.homeTagFg;
  if (colors.awayTagBg)   colorVars['--away-tag-bg']     = colors.awayTagBg;
  if (colors.awayTagFg)   colorVars['--away-tag-fg']     = colors.awayTagFg;
  if (colors.darkOnLight) {
    colorVars['--fg-primary']    = '#062045';
    colorVars['--fg-secondary']  = 'rgba(6,32,69,0.65)';
    colorVars['--fg-tertiary']   = 'rgba(6,32,69,0.45)';
    colorVars['--fg-muted']      = 'rgba(6,32,69,0.30)';
    colorVars['--fg-faint']      = 'rgba(6,32,69,0.15)';
    colorVars['--surface-light'] = 'rgba(6,32,69,0.10)';
    colorVars['--surface-mid']   = 'rgba(6,32,69,0.07)';
    colorVars['--surface-dark']  = 'rgba(6,32,69,0.18)';
    colorVars['--border-strong'] = 'rgba(6,32,69,0.28)';
    colorVars['--border-soft']   = 'rgba(6,32,69,0.12)';
    colorVars['--border-faint']  = 'rgba(6,32,69,0.06)';
  }
  if (colors.fg)    colorVars['--fg-primary']   = colors.fg;
  if (colors.fgSub) colorVars['--fg-secondary'] = colors.fgSub;
  if (fonts.display) { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.display); colorVars['--font-display'] = `'${fonts.display}', Impact, 'Arial Narrow Bold', sans-serif`; }
  if (fonts.body)    { if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.body);    colorVars['--font-body']    = `'${fonts.body}', system-ui, -apple-system, sans-serif`; }
  if (colors.homeCardAlpha !== undefined) {
    const h = colors.homeCardBg || '#000000';
    const r = parseInt(h.slice(1,3),16)||0, g = parseInt(h.slice(3,5),16)||0, b = parseInt(h.slice(5,7),16)||0;
    colorVars['--home-card-bg'] = `rgba(${r},${g},${b},${colors.homeCardAlpha})`;
  }
  if (colors.awayCardAlpha !== undefined) {
    const h = colors.awayCardBg || '#f5f1e8';
    const r = parseInt(h.slice(1,3),16)||245, g = parseInt(h.slice(3,5),16)||241, b = parseInt(h.slice(5,7),16)||232;
    colorVars['--away-card-bg'] = `rgba(${r},${g},${b},${colors.awayCardAlpha})`;
  }
  let bgStyle = {};
  if (data._bgImage) {
    const c = (data._overlayColor || '#000000').replace('#','');
    const r = parseInt(c.slice(0,2),16)||0, g = parseInt(c.slice(2,4),16)||0, b = parseInt(c.slice(4,6),16)||0;
    const o = data._overlayOpacity !== undefined ? data._overlayOpacity : 0.4;
    bgStyle = {
      backgroundImage: `linear-gradient(rgba(${r},${g},${b},${o}),rgba(${r},${g},${b},${o})),url("${data._bgImage}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return (
    <div className="stage-1080" id="R04" style={{...colorVars, ...bgStyle}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '72px 80px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="kit-eyebrow">{data.eyebrow}</div>

          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 104,
              lineHeight: 0.86,
              letterSpacing: 'var(--ls-display)',
              textShadow: 'var(--shadow-press)',
              textTransform: 'uppercase',
              whiteSpace: 'pre-line'
            }}
          >
            {titleLines.map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < titleLines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>

          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: 'var(--fg-tertiary)',
              marginTop: 4,
              textTransform: 'uppercase'
            }}
          >
            {data.range}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {(data.games || []).map((game, index) => (
            <GameCard key={index} game={game} />
          ))}
        </div>

        <PartnersFooter data={data} />
      </div>
    </div>
  );
}

function GameCard({ game }) {
  const isHome = game.location === 'HOME';

  return (
    <div
      style={{
        background: isHome ? 'var(--home-card-bg, var(--surface-deep))' : 'var(--away-card-bg, var(--bg-cream))',
        color: isHome ? 'var(--fg-primary)' : 'var(--away-card-fg, var(--ink))',
        border: isHome ? '1px solid var(--border-soft)' : 'none',
        borderRadius: 'var(--r-card)',
        padding: '22px 28px',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto auto',
        gap: 24,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          textAlign: 'center',
          minWidth: 90,
          paddingRight: 24,
          borderRight: isHome ? '1px solid var(--border-soft)' : '1px solid rgba(20,20,20,0.15)'
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.22em',
            opacity: 0.6,
            textTransform: 'uppercase'
          }}
        >
          {game.dayName}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 56,
            lineHeight: 1,
            marginTop: 4
          }}
        >
          {game.dayNum}
        </div>

        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            opacity: 0.6,
            marginTop: 2,
            textTransform: 'uppercase'
          }}
        >
          {game.month}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            lineHeight: 1.05,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}
        >
          {game.home}
          <span style={{ opacity: 0.5, padding: '0 10px' }}>VS</span>
          {game.away}
        </div>

        <div style={{ fontSize: 13, opacity: 0.7 }}>
          {game.arena}
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            lineHeight: 1
          }}
        >
          {game.time}
        </div>
      </div>

      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 14,
          letterSpacing: '0.2em',
          background: isHome ? 'var(--home-tag-bg, var(--fg-primary))' : 'var(--away-tag-bg, var(--template-bg, var(--royal-red)))',
          color: isHome ? 'var(--home-tag-fg, var(--template-bg, var(--royal-red)))' : 'var(--away-tag-fg, var(--fg-primary))',
          padding: '8px 16px',
          borderRadius: 'var(--r-pill)',
          textTransform: 'uppercase'
        }}
      >
        {isHome ? 'DOMICILE' : 'EXTÉRIEUR'}
      </span>
    </div>
  );
}

function PartnersFooter({ data }) {
  return (
    <div
      style={{
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 24
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: 'var(--fg-tertiary)',
            textTransform: 'uppercase'
          }}
        >
          {data.sponsorsTitle || 'PARTENAIRES'}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18
          }}
        >
          {(data.sponsors || []).map((partner, index) => (
            partner.logo ? (
              <img
                key={index}
                src={partner.logo}
                alt={partner.name}
                style={{
                  maxHeight: 32,
                  maxWidth: 120,
                  objectFit: 'contain',
                  opacity: 0.82
                }}
              />
            ) : (
              <div
                key={index}
                className="logo-box"
                style={{ width: 80, height: 32, borderRadius: 6 }}
              >
                <span className="ph">{partner.name || 'LOGO'}</span>
              </div>
            )
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 36,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.16em',
          color: 'var(--fg-tertiary)',
          textTransform: 'uppercase'
        }}
      >
        <span>{data.footerLeft || 'ROYAL DE SHAWINIGAN · LNHBF'}</span>
        <span>{data.footerRight || 'COCKTAIL MÉDIA'}</span>
      </div>
    </div>
  );
}

R04Horaire.defaults = {
  colors: {},
  fonts: {},
  _team: 'royal',
  eyebrow: 'ROYAL DE SHAWINIGAN · LNHBF',
  title: 'HORAIRE\nDE LA SEMAINE',
  range: 'DU 14 AU 20 AVRIL 2026',
  footerLeft: 'ROYAL DE SHAWINIGAN · LNHBF',
  footerRight: 'COCKTAIL MÉDIA',

  sponsorsTitle: 'PARTENAIRES',
  sponsors: [
    {
      name: 'LPS Physiothérapie',
      logo: '../../assets/logos/sponsors/lps-blanc.png'
    },
    {
      name: 'Royal LePage Centre',
      logo: '../../assets/logos/sponsors/royal-lepage-centre.png'
    },
    {
      name: 'Cocktail Média',
      logo: '../../assets/logos/cocktail-media-icon-white.png'
    }
  ],

  games: [
    {
      dayName: 'MAR',
      dayNum: '15',
      month: 'AVR',
      home: 'ROYAL',
      away: 'HAWKS',
      arena: 'Aréna Jacques-Plante · Shawinigan',
      time: '19 H 30',
      location: 'HOME'
    },
    {
      dayName: 'JEU',
      dayNum: '17',
      month: 'AVR',
      home: 'GRANBY',
      away: 'ROYAL',
      arena: 'Centre sportif · Granby',
      time: '20 H 00',
      location: 'AWAY'
    },
    {
      dayName: 'SAM',
      dayNum: '19',
      month: 'AVR',
      home: 'ROYAL',
      away: 'SHERBROOKE',
      arena: 'Aréna Jacques-Plante · Shawinigan',
      time: '18 H 00',
      location: 'HOME'
    }
  ]
};

window.R04Horaire = R04Horaire;
