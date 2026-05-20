# CocktailOS Portail — Copilot Instructions

## Project Overview

Migration from Flask to Next.js 16 of the Cocktail Média client portal (CocktailOS). Next.js calls the existing Flask API (`/api/v1/*`). Auth via session cookies (`credentials: 'include'`). No global state manager — `useState` + `useEffect`.

See `MIGRATION_STATUS.md` for current migration progress and priorities.

---

## Design Context

### Users

**Primary — Clients (portail side):**
Customers of Cocktail Média — local businesses and SMEs, often going through their first or early branding experience. They're not designers. They come to the portal to track project progress, upload documents when requested, check email-notified updates, and find deliverables from past projects. They check on mobile after receiving a notification email. They need to feel reassured and capable — not overwhelmed. **User-friendliness is the single most important emotional outcome.**

**Secondary — Admins / future Freelancers (admin side):**
Currently Cocktail Média staff managing clients, projects, invoices, and services. Long-term: the admin section evolves into a lightweight CRM + finance + inventory tool for freelancers in any field. Power users who spend focused sessions in the tool.

### Brand Personality

**Three words:** creative, accessible, simple

**Tone:** Direct and assured. Warm but not casual. French-first, eventually bilingual.

**Emotional goals:**
- Client side: *reassurance*, *clarity*, *quiet pride*
- Admin side: *speed*, *control*, *focus*

### Aesthetic Direction

**Visual tone:** High contrast. Bold typography. One strong accent used with precision. Deliberate mix of dark and light surfaces. Creative without being chaotic. Simple without being sterile.

**Two distinct atmospheres — not a simple theme toggle:**
- **Client portal** = warm light cream surfaces (`oklch(97% 0.012 70)`), calm, approachable, daytime use
- **Admin / Login** = dark surfaces (`oklch(18% 0.015 35)`), structured, efficient, focused

**Typography:**
- Display / headings: **Bricolage Grotesque** (variable, Google Fonts)
- Body / UI: **Atkinson Hyperlegible** (Google Fonts)
- Load via `next/font`, not raw `<link>` tags

**Colors (OKLCH):**
- Brand accent: `oklch(52% 0.21 32)` — Cocktail Média orange-red, existing `#e83b14`
- Dark surface: `oklch(18% 0.015 35)`
- Light surface: `oklch(97% 0.012 70)`
- Text on dark: `oklch(92% 0.02 70)`
- Text on light: `oklch(22% 0.015 35)`

**Anti-patterns to avoid:**
- Generic SaaS card grids
- Glassmorphism for decoration
- Gradient text (`background-clip: text`)
- Side-stripe borders (`border-left: 3px+ solid`)
- Cyan-on-dark / purple-blue gradients
- Large rounded icons above every heading

### Design Principles

1. **User-friendliness is the brief.** A non-designer client is the judge. Clarity beats cleverness.
2. **High contrast, earned color.** Orange-red for primary actions and key statuses only.
3. **Bold type, quiet layout.** Typography carries the visual weight. Layout breathes.
4. **Two distinct atmospheres.** Client = warm/light/calm. Admin = dark/structured/efficient.
5. **Future-ready simplicity.** i18n-ready text constants, clear component boundaries.

### Technical Constraints

- WCAG AA minimum (4.5:1 body, 3:1 large text/UI)
- All animations respect `prefers-reduced-motion`
- Touch targets ≥ 44px
- Full keyboard navigation + visible focus states
- French-first; text in constants for future EN translation
- Icons: Material Symbols Outlined (already loaded)
