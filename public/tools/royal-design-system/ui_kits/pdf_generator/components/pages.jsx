/* global React */
const { useState, useEffect, useMemo, useRef } = React;

// ============== HELPERS ==============
function parseAccent(text) {
  // Replace **word** with orange accent span
  if (!text) return null;
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <span key={i} className="cm-accent">{p.slice(2, -2)}</span>;
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

function paragraphs(text) {
  if (!text) return null;
  return String(text).split(/\n\s*\n/).map((p, i) => (
    <p key={i}>{parseAccent(p)}</p>
  ));
}

// ============== COVER PAGE ==============
function CoverPage({ data, variant, logoSrc, branding = {} }) {
  const artStyle = data.artStyle || 'angular';
  const showArt = artStyle !== 'aucune';
  const effectiveLogo = data.coverLogo || logoSrc;
  return (
    <div className={`cm-page cm-cover variant-${variant}`} data-screen-label="01 Couverture">
      {data.coverBg && (
        <img src={data.coverBg} className="cm-cover-bg" alt="" aria-hidden="true" />
      )}
      <div className="cm-cover-logo">
        <img src={effectiveLogo} alt="" />
      </div>
      <div className="cm-cover-main">
        {showArt && (
          <div className={`cm-cover-art art-${artStyle}`} aria-hidden="true">
            <div className="cm-shape"></div>
            <div className="cm-pedestal"></div>
          </div>
        )}
        {data.docType && <div className="cm-cover-doctype">{data.docType}</div>}
        <div className="cm-cover-year">{data.year || '2025'}</div>
        <h1 className="cm-cover-title" style={data.titleFont ? { fontFamily: `'${data.titleFont}', 'Helvetica Neue', sans-serif` } : {}}>{data.title || 'PROFIL DE\nL\'ENTREPRISE'}</h1>
        {data.subtitle && <div className="cm-cover-subtitle">{data.subtitle}</div>}
      </div>
      <div>
        <div className="cm-cover-tagline">{data.tagline || 'accessibilité. créativité. simplicité.'}</div>
        <div className="cm-cover-meta">
          <span>créé par {data.author || 'Félix Dumont'}</span>
          <span>{data.date || '09.07.2025'}</span>
        </div>
      </div>
    </div>
  );
}

// ============== TABLE OF CONTENTS ==============
function TocPage({ items, variant, branding = {} }) {
  const website = branding.website || 'COCKTAILMEDIA.CA';
  return (
    <div className={`cm-page variant-${variant}`} data-screen-label="02 Table des matières">
      <div className="cm-page-header">
        <span>{website}</span>
        <span></span>
      </div>
      <div className="cm-toc">
        <div className="cm-toc-side">
          <div className="cm-toc-vertical-title">table des matières</div>
        </div>
        <div className="cm-toc-list">
          {items.map((it, i) => (
            <div className="cm-toc-item" key={i}>
              <div className="cm-toc-item-label">{it.label}</div>
              <div className="cm-toc-item-page">{it.page}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="cm-page-footer">3</div>
    </div>
  );
}

// ============== SECTION DIVIDER ==============
function DividerPage({ num, title, accent, subtitle, variant, label, titleFont }) {
  const tfStyle = titleFont ? { fontFamily: `'${titleFont}', 'Helvetica Neue', sans-serif` } : {};
  const renderTitle = () => {
    if (!title) return null;
    if (accent && title.includes(accent)) {
      const [before, after] = title.split(accent);
      return <h2 className="cm-divider-title" style={tfStyle}>{before}<span className="cm-accent">{accent}</span>{after}</h2>;
    }
    return <h2 className="cm-divider-title" style={tfStyle}>{title}</h2>;
  };
  return (
    <div className={`cm-page cm-divider variant-${variant}`} data-screen-label={label}>
      <div className="cm-divider-bg"></div>
      <div className="cm-divider-content">
        <div className="cm-divider-num">{num}</div>
        <div className="cm-divider-text">
          {renderTitle()}
          {subtitle && <div className="cm-divider-subtitle">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

// ============== CONTENT PAGE ==============
function ContentPage({ num, title, accent, subtitle, body, variant, label, twoCol, pageNum, branding = {}, titleFont }) {
  const website = branding.website || 'COCKTAILMEDIA.CA';
  const tfStyle = titleFont ? { fontFamily: `'${titleFont}', 'Helvetica Neue', sans-serif` } : {};
  const renderTitle = () => {
    if (!title) return null;
    if (accent && title.includes(accent)) {
      const [before, after] = title.split(accent);
      return (
        <h2 className="cm-content-title" style={tfStyle}>
          {before}<span className="cm-accent">{accent}</span>{after}<span className="cm-dot">.</span>
        </h2>
      );
    }
    return <h2 className="cm-content-title" style={tfStyle}>{title}<span className="cm-dot">.</span></h2>;
  };
  return (
    <div className={`cm-page variant-${variant}`} data-screen-label={label}>
      <div className="cm-content cm-with-header">
        <div className="cm-page-header">
          <span>{website}</span>
          <span>{num && `0${num}`}</span>
        </div>
        <div className="cm-content-header">
          {num && <div className="cm-content-bignum">{String(num).padStart(2, '0')}</div>}
          {renderTitle()}
          {subtitle && <div className="cm-content-subtitle">{subtitle}</div>}
        </div>
        <div className={`cm-content-body ${twoCol ? 'cm-two-col' : ''}`}>
          {paragraphs(body)}
        </div>
        {pageNum && <div className="cm-page-footer">{pageNum}</div>}
      </div>
    </div>
  );
}

// ============== TEAM / BIO PAGE ==============
function BioPage({ name, role, story, photoSrc, variant, label, pageNum, branding = {}, pageTitle, pageAccent, pageTitleFont }) {
  const website = branding.website || 'COCKTAILMEDIA.CA';
  const bTitle = pageTitle || 'notre';
  const bAccent = pageAccent || 'équipe';
  const tfStyle = pageTitleFont ? { fontFamily: `'${pageTitleFont}', 'Helvetica Neue', sans-serif` } : {};
  let bioTitleEl;
  if (bTitle.includes(bAccent)) {
    const [b, a] = bTitle.split(bAccent);
    bioTitleEl = <h2 className="cm-content-title" style={tfStyle}>{b}<span className="cm-accent">{bAccent}</span>{a || ''}<span className="cm-dot">.</span></h2>;
  } else {
    bioTitleEl = <h2 className="cm-content-title" style={tfStyle}>{bTitle}<span className="cm-dot">.</span></h2>;
  }
  return (
    <div className={`cm-page variant-${variant}`} data-screen-label={label}>
      <div className="cm-content cm-with-header">
        <div className="cm-page-header">
          <span>{website}</span>
          <span>L'ÉQUIPE</span>
        </div>
        <div className="cm-content-header">
          <div className="cm-content-bignum">02</div>
          {bioTitleEl}
        </div>
        <div className="cm-bio">
          <div>
            {photoSrc
              ? <img src={photoSrc} alt={name} style={{width:'100%', aspectRatio:'3/4', objectFit:'cover'}}/>
              : <div className="cm-bio-photo">PORTRAIT</div>}
            <div className="cm-bio-name" style={{marginTop:'12px'}}>{name}</div>
            <div className="cm-bio-role">{role}</div>
          </div>
          <div className="cm-bio-text">
            {paragraphs(story)}
          </div>
        </div>
        {pageNum && <div className="cm-page-footer">{pageNum}</div>}
      </div>
    </div>
  );
}

// ============== SERVICES MENU ==============
function ServicesPage({ services, variant, label, pageNum, branding = {}, pageTitle, pageAccent, pageSubtitle, pageTitleFont }) {
  const website = branding.website || 'COCKTAILMEDIA.CA';
  const sTitle = pageTitle || 'nos services';
  const sAccent = pageAccent || 'services';
  const tfStyle = pageTitleFont ? { fontFamily: `'${pageTitleFont}', 'Helvetica Neue', sans-serif` } : {};
  let servicesTitleEl;
  if (sTitle.includes(sAccent)) {
    const [b, a] = sTitle.split(sAccent);
    servicesTitleEl = <h2 className="cm-content-title" style={tfStyle}>{b}<span className="cm-accent">{sAccent}</span>{a || ''}<span className="cm-dot">.</span></h2>;
  } else {
    servicesTitleEl = <h2 className="cm-content-title" style={tfStyle}>{sTitle}<span className="cm-dot">.</span></h2>;
  }
  return (
    <div className={`cm-page variant-${variant}`} data-screen-label={label}>
      <div className="cm-content cm-with-header">
        <div className="cm-page-header">
          <span>{website}</span>
          <span>NOS SERVICES</span>
        </div>
        <div className="cm-content-header">
          <div className="cm-content-bignum">02</div>
          {servicesTitleEl}
          <div className="cm-content-subtitle">{pageSubtitle || 'Comme au resto, à la carte.'}</div>
        </div>
        <div className="cm-services-grid">
          {services.map((s, i) => (
            <div key={i} className={`cm-service-card ${i % 2 === 0 ? 'cm-accent-card' : ''}`}>
              <div className="cm-service-cat">{s.category}</div>
              <h3 className="cm-service-name">{s.name}</h3>
              <p className="cm-service-desc">{s.description}</p>
            </div>
          ))}
        </div>
        {pageNum && <div className="cm-page-footer">{pageNum}</div>}
      </div>
    </div>
  );
}

// ============== PRICE LIST ==============
function PricelistPage({ priceSections, variant, label, pageNum, branding = {}, pageTitle, pageAccent, pageTitleFont }) {
  const website = branding.website || 'COCKTAILMEDIA.CA';
  const pTitle = pageTitle || 'liste de prix';
  const pAccent = pageAccent || 'prix';
  const tfStyle = pageTitleFont ? { fontFamily: `'${pageTitleFont}', 'Helvetica Neue', sans-serif` } : {};
  let priceTitleEl;
  if (pTitle.includes(pAccent)) {
    const [b, a] = pTitle.split(pAccent);
    priceTitleEl = <h2 className="cm-content-title" style={tfStyle}>{b}<span className="cm-accent">{pAccent}</span>{a || ''}<span className="cm-dot">.</span></h2>;
  } else {
    priceTitleEl = <h2 className="cm-content-title" style={tfStyle}>{pTitle}<span className="cm-dot">.</span></h2>;
  }
  return (
    <div className={`cm-page variant-${variant}`} data-screen-label={label}>
      <div className="cm-content cm-with-header">
        <div className="cm-page-header">
          <span>{website}</span>
          <span>LISTE DE PRIX</span>
        </div>
        <div className="cm-content-header">
          <div className="cm-content-bignum">03</div>
          {priceTitleEl}
        </div>
        <div className="cm-pricelist" style={{padding:0}}>
          {priceSections.map((sec, i) => (
            <div key={i} className="cm-price-section">
              <div className="cm-price-section-title">{sec.icon && <span style={{marginRight:8}}>{sec.icon}</span>}{sec.category} <span className="cm-accent">— {sec.subtitle}</span></div>
              <table className="cm-price-table">
                <thead>
                  <tr><th>Service</th><th>Prix</th></tr>
                </thead>
                <tbody>
                  {sec.items.map((it, j) => (
                    <tr key={j}>
                      <td>{it.name}</td>
                      <td>{it.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sec.note && <div className="cm-price-note">{sec.note}</div>}
            </div>
          ))}
        </div>
        {pageNum && <div className="cm-page-footer">{pageNum}</div>}
      </div>
    </div>
  );
}

// ============== TIMELINE PAGE ==============
function TimelinePage({ phases, title, accent, subtitle, num, variant, label, pageNum, branding = {}, titleFont }) {
  const website = branding.website || 'COCKTAILMEDIA.CA';
  const tfStyle = titleFont ? { fontFamily: `'${titleFont}', 'Helvetica Neue', sans-serif` } : {};
  return (
    <div className={`cm-page variant-${variant}`} data-screen-label={label}>
      <div className="cm-content cm-with-header">
        <div className="cm-page-header">
          <span>{website}</span>
          <span>MISE EN ŒUVRE</span>
        </div>
        <div className="cm-content-header">
          {num && <div className="cm-content-bignum">{String(num).padStart(2, '0')}</div>}
          <h2 className="cm-content-title" style={tfStyle}>
            {title.split(accent || '___')[0]}
            {accent && <span className="cm-accent">{accent}</span>}
            {accent && title.split(accent)[1]}
            <span className="cm-dot">.</span>
          </h2>
          {subtitle && <div className="cm-content-subtitle">{subtitle}</div>}
        </div>
        <div className="cm-timeline">
          {phases.map((p, i) => (
            <React.Fragment key={i}>
              <div className="cm-tl-date">{p.date}</div>
              <div className="cm-tl-body">
                <div className="cm-tl-title">{p.title}</div>
                <div className="cm-tl-text">{p.text}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
        {pageNum && <div className="cm-page-footer">{pageNum}</div>}
      </div>
    </div>
  );
}

// ============== METRICS PAGE ==============
function MetricsPage({ title, accent, subtitle, metrics, body, variant, label, pageNum, branding = {}, titleFont }) {
  const website = branding.website || 'COCKTAILMEDIA.CA';
  const tfStyle = titleFont ? { fontFamily: `'${titleFont}', 'Helvetica Neue', sans-serif` } : {};
  return (
    <div className={`cm-page variant-${variant}`} data-screen-label={label}>
      <div className="cm-content cm-with-header">
        <div className="cm-page-header">
          <span>{website}</span>
          <span>PROJECTIONS</span>
        </div>
        <div className="cm-content-header">
          <div className="cm-content-bignum">04</div>
          <h2 className="cm-content-title" style={tfStyle}>
            {title.split(accent || '___')[0]}
            {accent && <span className="cm-accent">{accent}</span>}
            {accent && title.split(accent)[1]}
            <span className="cm-dot">.</span>
          </h2>
          {subtitle && <div className="cm-content-subtitle">{subtitle}</div>}
        </div>
        <div className="cm-metrics-row">
          {metrics.map((m, i) => (
            <div className="cm-metric" key={i}>
              <div className="cm-metric-label">{m.label}</div>
              <div className="cm-metric-value">{m.value}</div>
            </div>
          ))}
        </div>
        <div className="cm-content-body">{paragraphs(body)}</div>
        {pageNum && <div className="cm-page-footer">{pageNum}</div>}
      </div>
    </div>
  );
}

// ============== CLOSING PAGE ==============
function ClosingPage({ message, variant, branding = {} }) {
  const website = branding.website || 'COCKTAILMEDIA.CA';
  return (
    <div className={`cm-page cm-divider variant-${variant}`} data-screen-label="Conclusion">
      <div className="cm-divider-bg"></div>
      <div className="cm-divider-content" style={{flexDirection:'column', alignItems:'flex-start'}}>
        <h2 className="cm-divider-title" style={{fontSize:'48px', maxWidth:'5.5in'}}>
          {parseAccent(message)}
        </h2>
        <div style={{marginTop:'1in', fontFamily:'var(--cm-font-heading)', fontWeight:800, fontSize:'14px', letterSpacing:'0.15em', color:'var(--cm-cream)'}}>
          {website}
        </div>
      </div>
    </div>
  );
}

// ============== PRICE LIST CONTINUATION PAGE ==============
// Identique à PricelistPage mais sans le grand en-tête (bignum + titre)
// pour les pages 2, 3... de la liste de prix.
function PricelistContPage({ priceSections, variant, label, pageNum, branding = {} }) {
  const website = branding.website || 'COCKTAILMEDIA.CA';
  return (
    <div className={`cm-page variant-${variant}`} data-screen-label={label}>
      <div className="cm-content cm-with-header">
        <div className="cm-page-header">
          <span>{website}</span>
          <span>LISTE DE PRIX (SUITE)</span>
        </div>
        <div className="cm-pricelist" style={{ padding: 0 }}>
          {priceSections.map((sec, i) => (
            <div key={i} className="cm-price-section">
              <div className="cm-price-section-title">
                {sec.icon && <span style={{ marginRight: 8 }}>{sec.icon}</span>}
                {sec.category} <span className="cm-accent">— {sec.subtitle}</span>
              </div>
              <table className="cm-price-table">
                <thead><tr><th>Service</th><th>Prix</th></tr></thead>
                <tbody>
                  {(sec.items || []).map((it, j) => (
                    <tr key={j}><td>{it.name}</td><td>{it.price}</td></tr>
                  ))}
                </tbody>
              </table>
              {sec.note && <div className="cm-price-note">{sec.note}</div>}
            </div>
          ))}
        </div>
        {pageNum && <div className="cm-page-footer">{pageNum}</div>}
      </div>
    </div>
  );
}

// ============== PRICE LIST AUTO-PAGINATION ==============
// Divise les sections de prix en plusieurs pages si nécessaire.
// Hauteurs estimées à 96 dpi (screen) — conservatrices pour éviter tout débordement.
function buildPricePages(sections, v, branding, startPageNum, pageHeader = {}) {
  if (!sections || sections.length === 0) return [];

  const SECTION_BASE = 95;   // titre section + en-tête tableau + marge bas
  const ROW_H        = 33;   // hauteur d'une ligne de prix
  const NOTE_H       = 26;   // note optionnelle sous un tableau
  const FIRST_BUDGET = 620;  // espace dispo page 1 (après bignum + titre + header)
  const CONT_BUDGET  = 820;  // espace dispo pages suivantes (header seul)

  function sectionH(sec) {
    return SECTION_BASE + ((sec.items || []).length * ROW_H) + (sec.note ? NOTE_H : 0);
  }

  const pages = [];
  let bucket = [], used = 0, isFirst = true;

  for (const sec of sections) {
    const h = sectionH(sec);
    const budget = isFirst ? FIRST_BUDGET : CONT_BUDGET;
    if (used + h > budget && bucket.length > 0) {
      pages.push({ secs: bucket, isFirst });
      bucket = [sec]; used = h; isFirst = false;
    } else {
      bucket.push(sec); used += h;
    }
  }
  if (bucket.length > 0) pages.push({ secs: bucket, isFirst });

  const total = pages.length;
  return pages.map((p, i) => {
    const pNum = startPageNum != null ? String(startPageNum + i) : null;
    const lbl  = total > 1 ? `Prix (${i + 1}/${total})` : 'Prix';
    if (p.isFirst) {
      return <window.PricelistPage
        key={`pl-${i}`} priceSections={p.secs}
        pageTitle={pageHeader.title} pageAccent={pageHeader.accent} pageTitleFont={pageHeader.titleFont}
        variant={v} label={lbl} pageNum={pNum} branding={branding} />;
    }
    return <window.PricelistContPage
      key={`pl-${i}`} priceSections={p.secs}
      variant={v} label={lbl} pageNum={pNum} branding={branding} />;
  });
}

// Export to window for cross-script access
Object.assign(window, {
  CoverPage, TocPage, DividerPage, ContentPage,
  BioPage, ServicesPage, PricelistPage, PricelistContPage,
  TimelinePage, MetricsPage, ClosingPage,
  parseAccent, paragraphs, buildPricePages
});
