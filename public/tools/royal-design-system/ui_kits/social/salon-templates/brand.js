/* Les Belles Sœurs — Brand constants
   Chargé avant tous les templates. Accessible via window.BS partout.
*/
window.BS = {
  name:        'Les Belles Sœurs',
  nameUpper:   'LES BELLES SŒURS',
  tagline:     'SALON D\'ESTHÉTIQUE · SHAWINIGAN',
  address:     '4693 Bd des Hêtres, Shawinigan, QC',
  phone:       '(819) 536-9264',
  phoneShort:  '819 536-9264',
  website:     'WWW.LESBELLESOEURS.COM',
  instagram:   '@LESBELLESSOEURS',
  since:       'EST. 2025',
  city:        'SHAWINIGAN',
  logoIcon:    '/tools/royal-design-system/ui_kits/social/salon-templates/logo-icone.png',
  logoTexte:   '/tools/royal-design-system/ui_kits/social/salon-templates/logo-texte.png',
};

/* Composant logo inline — appelable dans n'importe quel template JSX
   Usage: window.BSLogo({ size, style })
*/
window.BSLogoIcon = function({ size = 72, style = {} }) {
  return React.createElement('img', {
    src: window.BS.logoIcon,
    alt: window.BS.name,
    style: {
      width: size,
      height: size,
      objectFit: 'contain',
      display: 'block',
      ...style,
    },
  });
};

window.BSLogoTexte = function({ height = 32, style = {} }) {
  return React.createElement('img', {
    src: window.BS.logoTexte,
    alt: window.BS.name,
    style: {
      height: height,
      width: 'auto',
      objectFit: 'contain',
      display: 'block',
      ...style,
    },
  });
};
