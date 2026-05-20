# Cocktail Média — Système de Templates Visuels

## Brand Specs
- **Primary:** #e83b14 (rouge-orangé)
- **Dark:** #2b2b2b
- **Base:** #FAF7F3 (crème)
- **Secondary:** #9a9490
- **Border:** #e0d9d3
- **White:** #ffffff
- **Font titres:** Bebas Neue
- **Font body:** Plus Jakarta Sans (400, 600, 700, 800)

## Logos (URLs Wix)
- Logo CM principal: https://static.wixstatic.com/shapes/603d87_80f43cc7fa3b4c06bf2c67e73f72a07b.svg
- Logo CM v2: https://static.wixstatic.com/shapes/603d87_aa27ced6fb9d4d8db0b6b99ebe3b88a6.svg
- Icône CM (martini): https://static.wixstatic.com/shapes/603d87_c9b09d330c54453fbf1b8edd389c9cfa.svg
- COS blanc: https://static.wixstatic.com/shapes/603d87_386e61a93df4413a8d1e7bfb70a9dda8.svg
- COS noir: https://static.wixstatic.com/shapes/603d87_cf96d015d2b04cfbb7b5b3c3b5117557.svg
- COS icône noir: https://static.wixstatic.com/shapes/603d87_7a1a4f6293c54c1a9d74d0daabfd08aa.svg
- COS icône blanc: https://static.wixstatic.com/shapes/603d87_341e818be4ec410da9c49612affe5cb7.svg

## Templates disponibles

| # | Nom | Format | Usage |
|---|-----|--------|-------|
| 01 | Annonce Service | 1080x1080 | Image/screenshot + bandeau titre. LinkedIn, FB, Insta feed |
| 02 | Promo Forfait | 1080x1080 | Prix + service + CTA. FB, Insta feed |
| 03 | LinkedIn Texte | 1080x1080 | Citation/réflexion sur fond crème. LinkedIn |
| 04 | Before/After | 1080x1080 | Split screen réalisations. FB, Insta feed |
| 05 | Update CocktailOS | 1080x1080 | Screenshot + bandeau tech dark. LinkedIn |
| 06 | Témoignage | 1080x1080 | Citation client + étoiles. Toutes plateformes |
| 07 | Story/Reel Cover | 1080x1920 | Format vertical. Insta stories, Reels, TikTok |

## Workflow de rendu
1. Installer les fonts: `npm install -g @fontsource/bebas-neue @fontsource/plus-jakarta-sans`
2. Copier les fonts dans /home/claude/templates/fonts/
3. Générer fonts-base64.css et logos.json (voir script dans la conversation originale)
4. Utiliser render.js avec Playwright pour convertir HTML → PNG

## Placeholders dans les templates
- `/* FONTS_PLACEHOLDER */` → remplacer par le CSS base64 des fonts
- `{{LOGO_CM_ICON_WHITE}}` → logo martini blanc (base64)
- `{{LOGO_COS_BLANC}}` → logo CocktailOS blanc (base64)
- `{{LOGO_COS_NOIR}}` → logo CocktailOS noir (base64)
- `{{LOGO_COS_ICONE_NOIR}}` → icône COS noir (base64)
- `{{LOGO_COS_ICONE_BLANC}}` → icône COS blanc (base64)
- `{{LOGO_CM_DARK}}` → logo CM dark (base64)
- Commentaires `<!-- VARIABLE: NOM -->` indiquent les zones de contenu modifiable

## Comment demander un visuel
Exemples de demandes:
- "Template 02, titre: FORFAIT PHOTO, prix: 500$, sous-titre: 10 photos pro livrées en 48h"
- "Template 03, citation: LE MARKETING C'EST PAS UNE DÉPENSE C'EST UN INVESTISSEMENT, highlight: INVESTISSEMENT"
- "Template 01 avec [image uploadée], titre: SITE WEB CLÉ EN MAIN"
- "Template 06, citation: Super travail, très professionnel!, client: Jean Tremblay, entreprise: Resto Le Brasier"

## Règles de marque
- Ne jamais utiliser le mot "agence" — utiliser "usine créative"
- Ton: direct, humain, accessible, pas corporate
- Pas de bullet points dans le copy client
- Bebas Neue uniquement en MAJUSCULES
