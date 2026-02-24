# Safetrekr Marketing Website

**Tech Stack:** Vite + HTML5 + Vanilla JavaScript + Bootstrap 5

The public-facing marketing website for Safetrekr — a trip safety management platform. Includes lead capture, pricing calculators, a multi-step quote request form with Stripe payment integration, and gated content resources.

## Getting Started

**Prerequisites:** Node.js 18+ and npm

```bash
git clone git@github.com:Safetrekr/marketing-site.git
cd marketing-site
npm install
npm run dev      # http://localhost:5175
```

```bash
npm run build    # Build to /dist
npm run preview  # Preview production build at http://localhost:4173
```

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Landing page with hero, proof strip, value props, pricing preview |
| How It Works | `how-it-works.html` | 4-step process breakdown with timeline and FAQ |
| Solutions | `solutions.html` | Industry-specific tabs (K-12, Higher Ed, Churches, Corporate, Sports) |
| Pricing | `pricing.html` | 3-tier pricing cards, trip volume calculator, ROI estimator |
| Request Quote | `request-quote.html` | 5-step form: tier, trip details, add-ons, org info, payment |
| Resources | `resources.html` | Gated downloadable resources with lead capture modal |
| Security | `security.html` | Security, privacy, and compliance information |
| About | `about.html` | Company mission, team, and values |
| Integrations | `integrations.html` | Third-party integration categories and cards |
| Procurement | `procurement.html` | Enterprise procurement docs (MSA, DPA, SLA) |

All pages are configured as separate Vite entry points in `vite.config.js`.

## Project Structure

```
marketing-site/
├── *.html                        # 10 marketing pages (Vite entry points)
├── vite.config.js                # Vite config with entry points + path aliases
├── config/pricing.json           # Tier pricing, add-ons, and feature flags
│
├── components/                   # ES6 class-based components
│   ├── index.js                  # Barrel exports
│   ├── marketing-header.js       # Sticky nav with mobile menu
│   ├── marketing-footer.js       # Site map with social links
│   ├── proof-strip.js            # Customer logo strip
│   ├── lead-capture.js           # Gated download modal
│   ├── quote-form.js             # 5-step quote wizard (~1500 lines)
│   ├── LocationAutocomplete.js   # City search with Nominatim
│   ├── calculators.js            # TripVolumeCalculator + ROIEstimator
│   └── analytics.js              # GA4 event tracking wrapper
│
├── services/                     # Backend integrations
│   ├── supabaseClient.js         # Singleton Supabase client
│   ├── quoteService.js           # Quote CRUD + onboarding flow
│   ├── stripeQuoteService.js     # Stripe Checkout + Invoice via Edge Functions
│   └── geocodingService.js       # Nominatim location search with caching
│
├── styles/
│   ├── main.css                  # Design tokens (CSS custom properties)
│   ├── marketing.css             # Page layout, cards, CTAs
│   └── calculators.css           # Calculator-specific styles
│
└── assets/                       # Images, icons, favicons
```

## Components

Components are ES6 classes with a `mount(selector)` method. Each page imports and initializes them via an inline `<script type="module">`:

```javascript
import { MarketingHeader, MarketingFooter, Analytics } from './components/index.js';

const header = new MarketingHeader({ currentPage: 'pricing' });
header.mount('body');

const footer = new MarketingFooter();
footer.mount('body');

Analytics.init('pricing');
```

See [COMPONENTS.md](./COMPONENTS.md) for detailed component documentation.

## Services

- **Supabase** (`supabaseClient.js`): Shared database for leads, quotes, organizations. Public anon key is hardcoded.
- **Quote Service** (`quoteService.js`): Inserts quotes into the `quotes` table and orchestrates onboarding (org creation, user creation, trip draft).
- **Stripe** (`stripeQuoteService.js`): Three payment modes — immediate checkout, Net 30 invoice, or PDF quote. Calls Supabase Edge Functions (`create-checkout-session`, `create-invoice`).
- **Geocoding** (`geocodingService.js`): Nominatim/OpenStreetMap city search with 1 req/sec rate limiting and 7-day localStorage cache. Powers the `LocationAutocomplete` component.

## Pricing Configuration

`config/pricing.json` defines three tiers and add-ons. Feature flags control which are visible:

| Tier | Price | Feature Flag | Status |
|------|-------|-------------|--------|
| T1 — Day-trip essentials | $450 | (always on) | Enabled |
| T2 — Multi-day domestic | $750 | `FF_TIER_2` | Disabled |
| T3 — International/Complex | $1,250 | `FF_TIER_3` | Disabled |

Background checks (`FF_BG_CHECKS: true`) are the only enabled add-on. Other add-ons (rush, translation, comms kit, debrief) are flagged off.

## Styles

CSS custom properties are defined in `styles/main.css` with an `st-` prefix. Light theme is the default; dark theme is available via `[data-theme="dark"]`.

Key brand values:
- Primary: `#4ba467` (green)
- Font: Inter
- Icons: Material Symbols Outlined

All marketing-specific classes use the `st-marketing-` prefix. Calculator classes use `st-calculator-`.

## Analytics

Google Analytics 4 integration via the `Analytics` component. Call `Analytics.init('page-name')` on each page to auto-track CTA clicks. Custom events:

```javascript
Analytics.trackCTAClick('Button Text', 'page-name', '/destination');
Analytics.trackFormSubmit('form-name', 'page-name');
Analytics.trackResourceDownload('Resource Name', 'PDF');
Analytics.trackPricingTierSelect('Tier Name', 450);
```

See [ANALYTICS.md](./ANALYTICS.md) for complete documentation.

## Adding a New Page

1. Create `new-page.html` in the project root with the standard boilerplate (see existing pages for template)
2. Add the entry to `vite.config.js` `rollupOptions.input`
3. Add navigation link in `components/marketing-header.js`
4. Add footer link in `components/marketing-footer.js`

## Deployment

```bash
npm run build    # Output to /dist
```

The site can be deployed to any static hosting provider (GitHub Pages, Netlify, Vercel). Set build command to `npm run build` and publish directory to `dist`.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## SafeTrekr Ecosystem

This marketing site is part of a larger ecosystem of integrated applications:

| Service | Port | Description |
|---------|------|-------------|
| **Marketing Site** (this) | 5175 | Public-facing marketing and lead capture |
| **SafeTrekr App** | 5178 | Main application (Admin, Analyst portals) |
| **Traveler App** | 5173 | Mobile-first traveler portal |
| **TarvaRI Console** | 5174 | Intelligence system console |
| **TarvaRI Backend** | 8000 | Intelligence API (FastAPI) |
| **SafeTrekr Core API** | 8001 | Core backend API (FastAPI) |

All services share Supabase as the database layer. Quotes submitted on this site are consumed by the SafeTrekr App for customer onboarding.

## License

Proprietary - Safetrekr, Inc.
