# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:5175
npm run build    # Build to /dist
npm run preview  # Preview production build at http://localhost:4173
```

## Architecture

This is a static marketing site for Safetrekr built with **Vite + Vanilla JS + Bootstrap 5**. No framework—just ES6 modules.

### Project Structure

- **Root HTML files**: 10 marketing pages (index, pricing, solutions, etc.) configured as separate Vite entry points in `vite.config.js`
- **components/**: ES6 class-based components exported via `components/index.js`
- **services/**: Backend integrations (Supabase, Stripe, geocoding)
- **config/pricing.json**: Pricing tier and add-on configuration
- **styles/**: CSS with custom properties (marketing.css, calculators.css, main.css)

### Component Pattern

Components are ES6 classes with a `mount()` method. Each page imports and initializes them:

```javascript
import { MarketingHeader, MarketingFooter, Analytics } from './components/index.js';

const header = new MarketingHeader({ currentPage: 'pricing' });
header.mount('body');
```

### Key Components

- **QuoteForm** (`components/quote-form.js`): 5-step form with tier selection, add-ons, org info, payment. Uses `LocationAutocomplete` for geocoding.
- **LeadCapture**: Modal for gating resource downloads
- **TripVolumeCalculator / ROIEstimator**: Interactive pricing tools on `/pricing.html`
- **Analytics**: GA4 event tracking wrapper

### Services

- **supabaseClient.js**: Supabase connection for lead/quote data
- **quoteService.js**: Quote submission logic
- **stripeQuoteService.js**: Stripe checkout integration
- **geocodingService.js**: Location search and trip type detection (domestic vs international)

## Ecosystem Context

This marketing site (port 5175) is part of a larger SafeTrekr ecosystem:
- SafeTrekr App (5178): Main admin/analyst portal
- Traveler App (5173): Mobile-first traveler portal
- TarvaRI Console (5174) + Backend (8000): Intelligence system
- SafeTrekr Core API (8001): Core backend

All share Supabase as the database layer.
