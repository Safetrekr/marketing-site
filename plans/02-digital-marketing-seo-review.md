# SafeTrekr Marketing Site Audit Report — Digital Marketing & SEO

**Agent:** world-class-digital-marketing-lead
**Date:** 2026-02-24
**Scope:** 10 HTML pages, `components/analytics.js`, `components/quote-form.js`, `components/marketing-header.js`, `components/marketing-footer.js`, `checkout-success.html`, `config/pricing.json`

---

## CRITICAL (Blocks Revenue or Indexing)

### C1. GA4 Is Completely Non-Functional — Zero Data Collection

There are **two compounding failures** that mean absolutely no analytics data is being collected:

**Problem A:** No `gtag.js` script tag exists in any HTML file. None of the 10 pages include the Google Analytics script loader (`<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX">`). Without this, `window.gtag` is always `undefined`.

**Problem B:** The measurement ID in `components/analytics.js` (line 28) is a literal placeholder string:

```javascript
// components/analytics.js line 28
gtag('config', 'GA_MEASUREMENT_ID', { ... });
```

Even if the gtag script were loaded, this would configure against a non-existent property. Every analytics method guards with `if (window.gtag)` so all calls silently no-op. The result: zero page views, zero conversion events, zero funnel data. **You are flying completely blind.**

**Files affected:** All 10 HTML files and `components/analytics.js`

---

### C2. All Canonical URLs Point to a GitHub Pages Dev URL

Every page's `<link rel="canonical">` points to `https://jessedo81.github.io/safetrekr-app/marketing/`. This tells Google the authoritative version of every page lives on a personal GitHub Pages deployment, not on the production domain. This will cause:

- Google indexing the GitHub Pages URL instead of the production URL
- Link equity flowing to the wrong domain
- Potential duplicate content penalties

**Every page has this issue.** Examples:

| Page | Canonical URL |
|------|--------------|
| `index.html` line 17 | `https://jessedo81.github.io/safetrekr-app/marketing/` |
| `pricing.html` line 17 | `https://jessedo81.github.io/safetrekr-app/marketing/pricing.html` |
| `security.html` line 17 | `https://jessedo81.github.io/safetrekr-app/marketing/security.html` |

---

### C3. All Open Graph and Twitter Card URLs Point to GitHub Pages

Same domain problem affects all social sharing metadata. Every page's `og:url`, `og:image`, and `twitter:image` reference `jessedo81.github.io`. When someone shares a page on LinkedIn, Twitter, or Slack, the preview will resolve against the wrong domain.

**Files affected:** All 10 HTML files (og:url, og:image, twitter:image meta tags)

---

### C4. Structured Data URLs Point to GitHub Pages

JSON-LD schema on `index.html` (line 51), `how-it-works.html`, `pricing.html`, `request-quote.html`, `security.html`, `resources.html`, `integrations.html`, and `procurement.html` all reference `jessedo81.github.io` in their `url` fields. Google's Rich Results will attribute data to the wrong domain.

---

### C5. The 5-Step Quote Wizard Is Not Mounted Anywhere

The most significant conversion asset — `components/quote-form.js` (1,500+ lines) — containing a sophisticated 5-step wizard with tier selection, trip detail collection, add-on upselling, org info capture, and three checkout modes (pay now, invoice, quote PDF) **is completely unused on the live site**.

Instead, `request-quote.html` renders a simple 5-field contact form (name, email, org, interest, message) with a generic "Send Request" button. The `QuoteForm` class is never imported or instantiated.

**Impact:** The entire conversion funnel — tier selection, pricing transparency, trip-specific quoting, and payment integration — is absent. Visitors who click "Get Started" on pricing or "Request a Quote" elsewhere land on a generic contact form with no pricing context, no product selection, and no way to self-serve.

---

## HIGH (Significant SEO or Conversion Impact)

### H1. Header Sign-In Links Point to localhost

`components/marketing-header.js` lines 51-86 hardcode all sign-in URLs to `http://localhost:5174/...`:

```javascript
<a href="http://localhost:5174/org-login.html" ...>Organization Admin</a>
<a href="http://localhost:5174/traveler/welcome.html?role=traveler" ...>Traveler</a>
<a href="http://localhost:5174/staff-login.html" ...>Safetrekr Staff</a>
```

These will be completely broken in any deployed environment.

---

### H2. Pricing Page FAQ Missing FAQPage Schema

`pricing.html` has 8 well-structured FAQ items (lines 368-488) rendered in HTML but **no FAQPage JSON-LD**. This is a missed rich snippet opportunity for queries like "Safetrekr pricing", "trip safety cost", and "field trip budget." Compare with `how-it-works.html` which correctly includes FAQPage schema.

---

### H3. Security Page FAQ Missing FAQPage Schema

`security.html` has 8 FAQ items (lines 348-488) covering FERPA, certifications, data storage, deletion, and SSO — all high-value search queries — but **no FAQPage structured data**.

---

### H4. About Page Has No Structured Data At All

`about.html` is the only content page with **zero JSON-LD**. It should have:
- `Organization` schema with founders
- `Person` schema for Mike Dawson, Alan D., and Bobby Brasher (with `jobTitle`, `worksFor`, `sameAs`)
- This is especially valuable since the founders have distinctive, search-worthy backgrounds (Secret Service, NCFI)

---

### H5. Procurement Page Uses Placeholder Phone Number

`procurement.html` line 544:

```html
<a href="tel:+18005551234">1-800-555-1234</a>
```

This is a fictitious number. Any prospect who calls it reaches nothing.

---

### H6. Integrations Page Has Stale Dates

`integrations.html` shows "Coming Q2 2025" for Skyward and "Coming Q3 2025" for Planning Center. Since it is February 2026, these appear overdue. Either update the status to "Available Now" or adjust the timeline.

---

### H7. Pricing Page CTAs Create Expectation Mismatch

All three pricing cards say "Get Started" and link to `./request-quote.html`, but the landing page is a generic contact form — not a purchase or quote flow. A user who selects "Domestic Day Trip" at $450 and clicks "Get Started" expects to begin purchasing. Instead they get "How can we help?" with no pricing context carried through.

---

### H8. No Form Spam Protection

The contact form on `request-quote.html` has:
- No reCAPTCHA (visible or invisible)
- No honeypot field
- No rate limiting
- Uses `alert()` for validation errors (lines 408-416) instead of inline validation

---

## MEDIUM (Measurable Improvement Opportunity)

### M1. checkout-success.html Is Completely Unoptimized

**Missing:** meta description, canonical URL, OG tags, favicon links, structured data, and GA4 conversion tracking. This page should fire a `purchase` conversion event — it is the single most important event to track. Uses absolute paths (`/styles/main.css`) which may break with Vite's `base: './'` config.

File: `/Users/jessetms/Sites/Safetrekr/marketing-site/checkout-success.html`

---

### M2. About Page Title Tag Is Weak

```html
<title>Team - Safetrekr</title>
```

At 18 characters, this wastes title space. It should target keywords like "About Safetrekr | Ex-Secret Service Trip Safety Team" or "Leadership - Professional Trip Safety Management | Safetrekr".

---

### M3. No robots.txt or sitemap.xml

No evidence of either file. Without `robots.txt`, crawlers have no directives. Without `sitemap.xml`, Google relies solely on link discovery to find pages. The `procurement.html` and `integrations.html` pages are particularly at risk of poor discovery since they are less linked internally.

---

### M4. Product Schema on Pricing Page Is Incomplete

`pricing.html` lines 46-76 define a `Product` with three `Offer` items but are missing:
- `availability` (e.g., `https://schema.org/InStock`)
- `url` for each offer
- `priceValidUntil`
- No `aggregateRating` or `review` (expected for Product schema)

---

### M5. No BreadcrumbList Schema on Any Page

No page includes `BreadcrumbList` structured data. For a 10-page site with clear hierarchy (Home > How It Works, Home > Solutions, etc.), breadcrumbs would improve SERP display.

---

### M6. Analytics Coverage Gaps Beyond the gtag Issue

Even once GA4 is properly configured, the following events are untracked:
- **Scroll depth** (scroll_25, scroll_50, scroll_75) — not implemented
- **Quote wizard step progression** — the wizard is not mounted, so no funnel tracking exists
- **Contact form success** — fires a raw `gtag('event', ...)` on line 456 of `request-quote.html` instead of using the `Analytics.trackFormSubmit()` method
- **Checkout success / purchase event** — `checkout-success.html` fires zero analytics events
- **Resource download tracking** — `Analytics.trackResourceDownload()` exists but `resources.html` uses `LeadCapture` instead of the Analytics method directly
- **Error state tracking** — form failures and checkout errors are not tracked

---

### M7. Console.log Statements in Production Code

Every page initialization outputs debug logs. `analytics.js` logs every single event to the console (lines 20, 34, 49, etc.). `marketing-header.js` and `marketing-footer.js` also log on mount. These should be stripped or gated behind `import.meta.env.DEV`.

---

### M8. Footer Links to Non-Existent Legal Pages

`components/marketing-footer.js` lines 72-75 link to four pages that do not exist:
- `./legal/terms.html`
- `./legal/privacy.html`
- `./legal/dpa.html`
- `./legal/accessibility.html`

These are marked "(coming soon)" but still produce 404s if clicked, which damages crawl budget and user trust.

---

### M9. Inconsistent CTA Copy Across Pages

The primary CTA text varies inconsistently:

| Page | Primary CTA |
|------|-------------|
| `index.html` hero | "See a Sample Trip Package" |
| `index.html` final | "Request a Sample" |
| `pricing.html` hero | "Request More Information" |
| `pricing.html` cards | "Get Started" |
| `pricing.html` final | "Request More Information" |
| `how-it-works.html` hero | "Start a Trip" |
| `how-it-works.html` final | "Start a Trip" |
| Header | "Request Info" |

This makes A/B testing impossible and creates messaging inconsistency. Standardize around 2-3 variants maximum.

---

### M10. Resources Page Download Links Are All "#"

`resources.html` defines 6 downloadable resources (Trip Planning Checklist, Itinerary Template, etc.) but every `downloadUrl` is set to `'#'` (lines 197-257). Users who provide their email via the lead capture modal receive nothing.

---

## LOW (Polish / Future Improvement)

### L1. Meta Keywords Tags Are Obsolete

All 10 pages include `<meta name="keywords">`. Google has publicly stated it ignores this tag since 2009. Not harmful, but clutters the `<head>` and provides no SEO value.

---

### L2. Same OG Image Across All Pages

Every page references `og-image.png`. Page-specific OG images (especially for pricing, solutions, and the team page) would improve click-through rates from social shares.

---

### L3. Material Symbols Font Loaded Synchronously

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined..." rel="stylesheet">
```

This blocks rendering. Consider loading with `media="print" onload="this.media='all'"` or `font-display: swap`.

---

### L4. No Preload Hints for Critical Resources

No `<link rel="preload">` for `main.css`, `marketing.css`, or the Inter font. Adding these would improve LCP.

---

### L5. pricing.json Feature Flags Show Tier 2 and Tier 3 as Disabled

`config/pricing.json` has `FF_TIER_2: false` and `FF_TIER_3: false`, yet the pricing page HTML displays all three tiers with prices. If the quote wizard were mounted, users could only select Tier 1. This inconsistency between the static HTML and the dynamic config will cause problems when the wizard is re-enabled.

---

## Summary: Top 5 Actions by Impact

| Priority | Issue | Impact |
|----------|-------|--------|
| 1 | **Fix GA4** — Add gtag.js script to all pages, replace placeholder measurement ID (C1) | Enables all data collection |
| 2 | **Fix all canonical/OG/schema URLs** to point to production domain (C2, C3, C4) | Fixes indexation and social sharing |
| 3 | **Mount the QuoteForm wizard** on request-quote.html or create a dedicated purchase page (C5) | Restores the entire conversion funnel |
| 4 | **Add FAQPage schema** to pricing.html and security.html (H2, H3) | Captures rich snippets for high-value queries |
| 5 | **Fix production-breaking hardcodes** — localhost sign-in links, placeholder phone number, stale integration dates (H1, H5, H6) | Prevents user-facing failures in production |
