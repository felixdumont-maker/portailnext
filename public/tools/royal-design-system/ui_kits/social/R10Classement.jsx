/* global React */
/**
 * R10 — CLASSEMENT DE LA LIGUE
 * Royal (_team:'royal') → LNHBF féminin, 9 équipes
 * Xtreme (_team:'xtreme') → LNHB masculin, 11 équipes
 * Tri auto par PTS · équipe highlight configurable
 */
function R10Classement({ data = R10Classement.defaults }) {
  const isX    = data._team === 'xtreme';
  const colors = data.colors || {};
  const fonts  = data.fonts  || {};

  const colorVars = {};
  if (colors.bg)         { colorVars['--template-bg'] = colors.bg; colorVars['--brand'] = colors.bg; }
  if (colors.headerBg)    colorVars['--header-bg']     = colors.headerBg;
  if (colors.rowHlBg)     colorVars['--row-hl-bg']     = colors.rowHlBg;
  if (colors.rowHlBorder) colorVars['--row-hl-border'] = colors.rowHlBorder;
  if (colors.ptsColor)    colorVars['--pts-color']     = colors.ptsColor;
  if (colors.darkOnLight) {
    colorVars['--fg-primary']   = '#062045';
    colorVars['--fg-secondary'] = 'rgba(6,32,69,0.65)';
    colorVars['--fg-tertiary']  = 'rgba(6,32,69,0.45)';
    colorVars['--fg-muted']     = 'rgba(6,32,69,0.28)';
    colorVars['--border-soft']  = 'rgba(6,32,69,0.12)';
  }
  if (colors.fg)    colorVars['--fg-primary']   = colors.fg;
  if (colors.fgSub) colorVars['--fg-secondary'] = colors.fgSub;
  if (fonts.display) {
    if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.display);
    colorVars['--font-display'] = `'${fonts.display}', Impact, 'Arial Narrow Bold', sans-serif`;
  }
  if (fonts.body) {
    if (typeof window.loadTemplateFont === 'function') window.loadTemplateFont(fonts.body);
    colorVars['--font-body'] = `'${fonts.body}', system-ui, -apple-system, sans-serif`;
  }

  const teams = data.autoSort
    ? [...(data.teams || [])].sort((a, b) => (b.pts - a.pts) || (b.w - a.w) || (a.l - b.l))
    : (data.teams || []);

  const highlightTeam = data.highlightTeam || '';
  const n = teams.length;

  // Grille des colonnes — rang | logo | nom | PJ | V | D | DP | PTS
  const COLS = '44px 68px 1fr 56px 50px 50px 56px 74px';

  const colHead = (label, align = 'center') => (
    <div style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.20em',
      textTransform: 'uppercase', color: 'var(--fg-muted)',
      textAlign: align,
    }}>{label}</div>
  );

  return (
    <div className="stage-1080" id="R10" style={colorVars}>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
      }}>

        {/* ── HEADER ── */}
        <div style={{
          background: 'var(--header-bg, rgba(0,0,0,0.28))',
          padding: '36px 44px 22px',
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.24em',
            textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 8,
          }}>
            {data.eyebrow}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 72, lineHeight: 0.88,
                letterSpacing: '0.03em', textTransform: 'uppercase',
                textShadow: 'var(--shadow-press)',
              }}>
                CLASSEMENT
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 26, lineHeight: 1,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--fg-tertiary)',
              }}>
                {data.subtitle || (isX ? 'LNHB · MASCULIN' : 'LNHBF · FÉMININ')}
              </div>
            </div>
            {data.weekContext && (
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.16em',
                textTransform: 'uppercase', color: 'var(--fg-secondary)',
                textAlign: 'right', paddingBottom: 4,
              }}>
                {data.weekContext}
              </div>
            )}
          </div>
        </div>

        {/* ── EN-TÊTES COLONNES ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: COLS,
          padding: '10px 44px 8px',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          flexShrink: 0,
          alignItems: 'center',
          gap: 0,
        }}>
          {colHead('')}
          {colHead('')}
          {colHead('ÉQUIPE', 'left')}
          {colHead('PJ')}
          {colHead('V')}
          {colHead('D')}
          {colHead('DP')}
          {colHead('PTS')}
        </div>

        {/* ── LIGNES ÉQUIPES ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 28px' }}>
          {teams.map((team, i) => {
            const rank      = i + 1;
            const isHL      = highlightTeam && team.name === highlightTeam;
            const isFirst   = rank === 1;
            const isEven    = i % 2 === 1;

            return (
              <div key={i} style={{
                flex: 1,
                display: 'grid', gridTemplateColumns: COLS,
                alignItems: 'center',
                padding: '0 16px',
                gap: 0,
                borderRadius: 10,
                position: 'relative',
                background: isHL
                  ? 'var(--row-hl-bg, rgba(255,255,255,0.16))'
                  : isEven
                    ? 'rgba(255,255,255,0.03)'
                    : 'transparent',
                outline: isHL ? '1.5px solid var(--row-hl-border, rgba(255,255,255,0.45))' : 'none',
                outlineOffset: '-1px',
              }}>

                {/* Rang */}
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: isFirst ? 34 : 26,
                  color: isFirst
                    ? 'var(--pts-color, var(--fg-primary))'
                    : 'var(--fg-muted)',
                  lineHeight: 1,
                  textAlign: 'center',
                }}>
                  {isFirst ? '①' : rank}
                </div>

                {/* Logo */}
                <div style={{
                  width: 54, height: 54,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto',
                }}>
                  {team.logo ? (
                    <img src={team.logo} alt=""
                      style={{ maxWidth: 52, maxHeight: 52, objectFit: 'contain', display: 'block' }}/>
                  ) : (
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px dashed rgba(255,255,255,0.20)',
                    }}/>
                  )}
                </div>

                {/* Nom */}
                <div style={{
                  fontFamily: isHL ? 'var(--font-display)' : 'var(--font-body)',
                  fontSize: isHL ? 22 : 17,
                  fontWeight: isHL ? 400 : 700,
                  letterSpacing: isHL ? '0.06em' : '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--fg-primary)',
                  opacity: isHL ? 1 : 0.85,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  paddingRight: 8,
                }}>
                  {team.name}
                </div>

                {/* PJ */}
                <div style={{
                  fontSize: 15, fontWeight: 600, textAlign: 'center',
                  color: 'var(--fg-tertiary)',
                }}>{team.gp ?? '—'}</div>

                {/* V */}
                <div style={{
                  fontSize: 15, fontWeight: 700, textAlign: 'center',
                  color: 'var(--fg-secondary)',
                }}>{team.w ?? '—'}</div>

                {/* D */}
                <div style={{
                  fontSize: 15, fontWeight: 600, textAlign: 'center',
                  color: 'var(--fg-tertiary)',
                }}>{team.l ?? '—'}</div>

                {/* DP */}
                <div style={{
                  fontSize: 15, fontWeight: 600, textAlign: 'center',
                  color: 'var(--fg-tertiary)',
                }}>{team.otl ?? '—'}</div>

                {/* PTS — mis en évidence */}
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: isHL ? 32 : 28,
                  lineHeight: 1, textAlign: 'center',
                  color: isHL
                    ? 'var(--pts-color, var(--fg-primary))'
                    : 'var(--fg-primary)',
                  opacity: isHL ? 1 : 0.80,
                }}>{team.pts ?? '—'}</div>

              </div>
            );
          })}
        </div>

        {/* ── FOOTER ── */}
        <div className="kit-footer" style={{ padding: '10px 44px 28px', flexShrink: 0 }}>
          {(data.sponsors||[]).filter(sp=>sp.logo).length > 0 ? (
            <div style={{display:'flex', alignItems:'center', gap:18}}>
              {(data.sponsors||[]).filter(sp=>sp.logo).map((sp,i)=>(
                <img key={i} src={sp.logo} alt="" style={{height:30, maxWidth:110, objectFit:'contain', opacity:0.85}}/>
              ))}
            </div>
          ) : (
            <span className="kit-footer-left">{data.footerLeft || 'CLASSEMENT OFFICIEL'}</span>
          )}
          <span className="kit-footer-right">{data.footerRight || 'COCKTAIL MÉDIA'}</span>
        </div>

      </div>
    </div>
  );
}

/* ── Données par défaut ── */
const _R10_FL = './team-logos/';
const _R10_FM = './team-logos/logos-masculins/';

R10Classement.defaultTeamsRoyal = [
  { name: 'ROYAL DE SHAWINIGAN',                   logo: _R10_FL+'LogoLNHBF_Shawinigan.svg',  gp:3, w:3, l:0, otl:0, pts:7 },
  { name: 'HAWKS DE MIRABEL',                      logo: _R10_FL+'Hawks-de-Mirabel.png',       gp:3, w:2, l:0, otl:1, pts:7 },
  { name: 'CHBS DE SHERBROOKE',                    logo: _R10_FL+'LogoLNHBF_Sherbrooke.png',   gp:3, w:2, l:1, otl:0, pts:6 },
  { name: 'ASSURANCIA VENNE ET FILLE DE JOLIETTE', logo: _R10_FL+'LogoLNHBF_Joliette.png',    gp:3, w:2, l:1, otl:0, pts:6 },
  { name: 'HUSKIES DE DEK ANJOU',                  logo: _R10_FL+'LogoLNHBF_Anjou.png',        gp:3, w:2, l:1, otl:0, pts:6 },
  { name: 'PROSTYLE LETTRAGE DE LÉVIS',            logo: _R10_FL+'LogoLNHBF_Levis.png',        gp:3, w:2, l:1, otl:0, pts:6 },
  { name: 'ÉLITE ÉLECTRIQUE DE ANJOU',             logo: _R10_FL+'LogoLNHBF_Montreal.png',     gp:3, w:1, l:1, otl:1, pts:4 },
  { name: 'LYNX DE VICTORIAVILLE',                 logo: _R10_FL+'Lynx-de-Victoriaville-F.png',gp:3, w:1, l:2, otl:0, pts:3 },
  { name: 'MUSTANGS DE GRANBY',                    logo: _R10_FL+'LogoLNHBF_Granby.png',       gp:3, w:0, l:3, otl:0, pts:0 },
  { name: 'GOLD & PINK DE ST-HUBERT',              logo: _R10_FL+'LogoLNHBF_StHubert.png',     gp:3, w:0, l:3, otl:0, pts:0 },
];

R10Classement.defaultTeamsXtreme = [
  { name: 'XTREME DE SHAWINIGAN',   logo: _R10_FM+'Xtreme-de-Shawinigan.png',        gp:16, w:12, l:2,  otl:2, pts:26 },
  { name: 'HARFANGS DE QUÉBEC',     logo: _R10_FM+'Harfangs-de-Quebec.png',           gp:16, w:11, l:3,  otl:2, pts:24 },
  { name: 'ASSURANCIA JOLIETTE',    logo: _R10_FM+'Assurancia-de-Joliette.png',       gp:16, w:10, l:4,  otl:2, pts:22 },
  { name: 'LYNX DE VICTORIAVILLE',  logo: _R10_FM+'Lynx-de-Victoriaville.png',        gp:16, w:8,  l:6,  otl:2, pts:18 },
  { name: 'HAWKS DE MIRABEL',       logo: _R10_FM+'Hawks-de-Mirabel.png',             gp:16, w:7,  l:7,  otl:2, pts:16 },
  { name: 'HUSKIES DEK ANJOU',      logo: _R10_FM+'Huskies-DEK-Anjou.png',            gp:16, w:7,  l:8,  otl:1, pts:15 },
  { name: 'CAMPING ÎLE-MARIE',      logo: _R10_FM+'Camping-Ile-Marie-du-CHBS.png',    gp:16, w:6,  l:8,  otl:2, pts:14 },
  { name: 'GB DEK BOUCHERVILLE',    logo: _R10_FM+'LOGO_GB_DEK-Boucherville.png',     gp:16, w:5,  l:9,  otl:2, pts:12 },
  { name: 'MOBUX DE MCMASTERVILLE', logo: _R10_FM+'Mobux-de-McMasterville-3.png',     gp:16, w:4,  l:10, otl:2, pts:10 },
  { name: 'PRÉDATEURS',             logo: _R10_FM+'Predateurs.jpg',                   gp:16, w:3,  l:11, otl:2, pts:8  },
  { name: 'PSL',                    logo: _R10_FM+'PSL-NHLB-petite.png',              gp:16, w:2,  l:12, otl:2, pts:6  },
];

R10Classement.defaults = {
  colors: {},
  fonts: {},
  _team: 'royal',
  autoSort: true,
  eyebrow: 'LNHBF · SAISON 2025-2026',
  weekContext: 'SEMAINE DU 15 MAI 2026',
  highlightTeam: 'ROYAL DE SHAWINIGAN',
  footerLeft: 'CLASSEMENT OFFICIEL',
  footerRight: 'COCKTAIL MÉDIA',
  sponsors: [],
  teams: R10Classement.defaultTeamsRoyal,
};

window.R10Classement = R10Classement;
