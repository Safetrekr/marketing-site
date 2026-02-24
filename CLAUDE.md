# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:5175
npm run build    # Build to /dist
npm run preview  # Preview production build at http://localhost:4173
```

No linter, formatter, or test runner is configured. There are no tests.

## Architecture

Static marketing site for Safetrekr built with **Vite + Vanilla JS + Bootstrap 5**. No framework — just ES6 modules. Uses Inter font and Material Symbols Outlined icons.

### Entry Points

10 root HTML files, each a separate Vite entry point configured in `vite.config.js` `rollupOptions.input`. Each page has an inline `<script type="module">` that imports components from `components/index.js` and initializes them.

### Component Pattern

Components are ES6 classes with a `mount(selector)` method that renders HTML and attaches event listeners. All components are barrel-exported from `components/index.js`:

```javascript
import { MarketingHeader, MarketingFooter, Analytics } from './components/index.js';
const header = new MarketingHeader({ currentPage: 'pricing' });
header.mount('body');
```

### Services Layer

Services use absolute import paths from root (e.g., `import supabase from '/services/supabaseClient.js'`).

- **supabaseClient.js**: Singleton Supabase client. Credentials are hardcoded (public anon key).
- **quoteService.js**: Quote CRUD operations against Supabase `quotes` table, plus onboarding flow (create org, user, trip draft, activate quote).
- **stripeQuoteService.js**: Three payment modes — `order` (Stripe Checkout redirect), `invoice` (Net 30 Stripe Invoice), `quote` (PDF quote with payment link). Calls Supabase Edge Functions `create-checkout-session` and `create-invoice`.
- **geocodingService.js**: Nominatim/OpenStreetMap location search with 1req/sec rate limiting and localStorage caching. Used by `LocationAutocomplete` component.

### Quote Form Flow

`QuoteForm` is the most complex component (~1500 lines). Its 5-step wizard:
1. Tier selection (T1/T2/T3) — auto-suggested by departure/destination locations and trip dates
2. Trip details — uses `LocationAutocomplete` for city search
3. Add-ons — background checks priced per-adult
4. Organization info
5. Checkout — three modes: pay now, request invoice, request quote PDF

### Pricing Configuration

`config/pricing.json` defines tiers (T1=$450, T2=$750, T3=$1250), add-ons, and feature flags. Feature flags gate unreleased tiers/add-ons (currently only T1 and background checks are fully enabled via `FF_TIER_2: false`, `FF_TIER_3: false`, `FF_BG_CHECKS: true`).

### Styles

- **styles/main.css**: Design tokens (CSS custom properties) — brand colors start with `--st-`, light theme default with dark theme variant
- **styles/marketing.css**: Page layout, header/footer, cards, CTAs — all classes prefixed `st-marketing-`
- **styles/calculators.css**: Calculator-specific styles prefixed `st-calculator-`

### Path Aliases

Defined in `vite.config.js`: `@` maps to project root, `@components` to `./components`, `@styles` to `./styles`.

## Adding a New Page

1. Create `new-page.html` in project root
2. Add entry to `vite.config.js` `rollupOptions.input`
3. Add nav link in `components/marketing-header.js`
4. Add footer link in `components/marketing-footer.js`

## Ecosystem Context

This marketing site (port 5175) is part of a larger SafeTrekr ecosystem:
- SafeTrekr App (5178): Main admin/analyst portal
- Traveler App (5173): Mobile-first traveler portal
- TarvaRI Console (5174) + Backend (8000): Intelligence system
- SafeTrekr Core API (8001): Core backend

All share Supabase as the database layer. The quote submission flow on this site creates records that the SafeTrekr App consumes for onboarding.
