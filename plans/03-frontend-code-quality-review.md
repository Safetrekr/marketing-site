# SafeTrekr Marketing Site Audit Report — Frontend Code Quality

**Agent:** react-developer
**Date:** 2026-02-24
**Scope:** All 7 components, 4 services, 10 HTML entry points, configuration files

---

## CRITICAL (P0) — Security Vulnerabilities

### 1. Multiple XSS vectors in `quote-form.js` via innerHTML interpolation

**File:** `components/quote-form.js`

User-controlled and API-sourced strings are interpolated directly into `innerHTML` without escaping throughout the entire quote form.

**Specific locations:**

- **Line ~1315** — Billing address geocoding results: `data-result='${JSON.stringify(result)}'` embeds Nominatim API response data into an HTML attribute. If the API returns data containing single quotes, the attribute breaks and enables injection. Additionally, `result.name` and `result.address` are interpolated into innerHTML unescaped.

- **Line ~1579** — `showTierUpgradeModal()`: `${destinationName}` comes from the geocoding API response and is interpolated directly into innerHTML.

- **Lines ~609-622** — Confirmation page: `this.formData.trip.name`, `this.formData.trip.destCity`, `this.formData.org.orgName`, `this.formData.org.email`, and `this.formData.org.role` are all user-entered values rendered without escaping.

- **Line ~864** — Step 2 render: `value="${this.formData.trip.name}"` — if a user enters a name containing `"` characters, it breaks out of the HTML attribute.

- **Line ~339** — Error messages: `${errors.map(err => '<li>${err}</li>')}` — if error messages are ever constructed from user input, this is injectable.

**Fix:** Add a shared `escapeHtml()` utility (like `LocationAutocomplete` already has at line 302) and use it on every interpolated value.

### 2. XSS in `proof-strip.js`

**File:** `components/proof-strip.js`, line 37

`${logo.name}` is interpolated into innerHTML. Currently only used with hardcoded defaults, but if logos are ever loaded from an API or CMS, this becomes exploitable.

### 3. XSS in `lead-capture.js`

**File:** `components/lead-capture.js`, line 65

`${this.resourceName}` and `${this.resourceType}` are interpolated into innerHTML.

### 4. Stripe anon key duplicated and hardcoded in two places

**Files:** `services/supabaseClient.js` (line 10), `services/stripeQuoteService.js` (lines 85-86)

The Supabase URL and anon key are hardcoded in `supabaseClient.js` AND separately duplicated in `stripeQuoteService.js` where it makes a raw `fetch()` call bypassing the Supabase client.

---

## HIGH (P1) — Functional Bugs & Memory Leaks

### 5. TripVolumeCalculator: Percentages not constrained to sum to 100%

**File:** `components/calculators.js`, lines 36-59

Users can set tier 1 = 100%, tier 2 = 100%, tier 3 = 100% (totaling 300%). The calculator happily computes counts as if 300% of trips exist. Additionally, `Math.round()` causes rounding errors — for example, 10 trips at 33/34/33 produces 3+3+3 = 9 counted trips, but `avgCostPerTrip` divides by `tripsPerYear` (10), not the actual sum (9).

**Fix:** Either enforce that sliders sum to 100% or display a warning when total is not 100%. Also divide by actual trip count sum for the average.

### 6. ROIEstimator: Dead code and questionable assumptions

**File:** `components/calculators.js`, lines 326-378

- The `timeSavings` object (lines 326-331) defines granular reduction percentages (60%, 70%, 50%, 40%) but is **never used**. The actual calculation uses a hardcoded `avgTimeSavingsPercentage = 0.50`.

- The "risk avoidance" calculation multiplies `tripsPerYear * $5,000 * 0.15`. The $5,000 and 15% are unsourced marketing assumptions.

- The ROI can show implausibly high numbers (+107% at defaults).

### 7. ROIEstimator: Org size change overwrites user-customized inputs

**File:** `components/calculators.js`, lines 388-392

When the user clicks a different org size button, `updateState()` silently overwrites `staffHourlyRate` and `currentHoursPerTrip` with the org-size defaults, even if the user has already customized those sliders.

### 8. Memory leaks in MarketingHeader

**File:** `components/marketing-header.js`, lines 203-280

- `window.addEventListener('scroll', ...)` creates an anonymous arrow function, making it impossible to remove later.
- `document.addEventListener('keydown', ...)` at line 226 is never removed.
- `document.addEventListener('click', ...)` at line 252 is never removed.
- The `destroy()` method removes DOM elements but never removes these listeners.

### 9. Memory leak in Analytics.init()

**File:** `components/analytics.js`, line 195

`document.addEventListener('click', ...)` is added but never removed. If `init()` is called multiple times, click handlers stack up.

### 10. Memory leak in quote-form.js

**File:** `components/quote-form.js`, line 1339

`document.addEventListener('click', ...)` for billing address outside-click handler is re-added every time step 5 is rendered.

### 11. LeadCapture keydown listener leak

**File:** `components/lead-capture.js`, lines 280-285

The Escape keydown listener is registered on `document` in `bindEvents()` and only cleaned up in `destroy()`, not in `hide()`. When using the static `LeadCapture.show()` method (line 430), `destroy()` is never called.

### 12. Feature flags are dead config

**File:** `config/pricing.json`, lines 98-107

`featureFlags.FF_TIER_2: false` and `FF_TIER_3: false`, but `tiers.T2.enabled: true` and `T3.enabled: true`. The quote form checks `tier.enabled`, never `featureFlags`. The feature flags are never referenced anywhere in the codebase.

### 13. Hardcoded localhost URLs in header

**File:** `components/marketing-header.js`, lines 51-86, 128-163

All "Sign In" dropdown links point to `http://localhost:5174/...`.

### 14. Google Analytics is non-functional

**File:** `components/analytics.js`, line 28

`gtag('config', 'GA_MEASUREMENT_ID', ...)` uses a literal placeholder string. No GA script tag exists on any page.

---

## MEDIUM (P2) — Accessibility Violations (WCAG 2.2 AA)

### 15. No skip navigation link

No page has a "Skip to main content" link.

### 16. Quote form wizard is inaccessible to screen readers

**File:** `components/quote-form.js`

- No `aria-live` region announces step changes
- Progress indicator has no `aria-current="step"` on the active step
- Step content has no `role="group"` or `aria-labelledby`

### 17. Form labels not programmatically associated with inputs

**File:** `components/quote-form.js`

Labels have no `for` attribute, inputs use `data-field` instead of `id`. Screen readers cannot associate labels with inputs.

### 18. LocationAutocomplete dropdown not accessible

**File:** `components/LocationAutocomplete.js`, lines 176-201

- No `role="listbox"` on dropdown
- No `role="option"` on items
- No `aria-expanded`, `aria-controls`, `aria-activedescendant`, or `aria-autocomplete`
- Active item highlighting is visual-only

### 19. FAQ accordions inconsistent and incomplete

`security.html` FAQs have `aria-expanded` on buttons. `pricing.html` FAQs have NO `aria-expanded`. Neither has `aria-controls`. `how-it-works.html` uses native `<details>/<summary>`.

### 20. LeadCapture modal lacks dialog semantics

**File:** `components/lead-capture.js`, lines 50-223

- No `role="dialog"` or `aria-modal="true"`
- No focus trap
- No focus management on open/close
- Modal title not linked via `aria-labelledby`

### 21. Mobile menu lacks focus trap

**File:** `components/marketing-header.js`, lines 302-313

No focus trap when mobile menu is open. Keyboard users can tab behind the overlay.

### 22. Sign-in dropdown not keyboard accessible

**File:** `components/marketing-header.js`, lines 233-259

No `aria-haspopup`, `aria-expanded`, `role="menu"`, or `role="menuitem"`. No arrow key navigation.

### 23. Color contrast concerns

Several places use reduced opacity (`0.7`, `0.8`) that may fail WCAG AA 4.5:1 contrast.

### 24. Calculator sliders have no accessible labels

**File:** `components/calculators.js`

Range inputs have no `aria-label`, `aria-labelledby`, or associated `<label for="...">`. No `aria-valuetext`.

---

## MEDIUM (P2) — Code Quality & Performance

### 25. quote-form.js at 1637 lines should be decomposed

Suggested decomposition:
- `QuoteFormWizard.js` — orchestration, step navigation, state
- `QuoteStepTier.js` — step 1
- `QuoteStepTrip.js` — step 2
- `QuoteStepAddons.js` — step 3
- `QuoteStepOrg.js` — step 4
- `QuoteStepCheckout.js` — step 5
- `QuoteConfirmation.js` — confirmation page
- `QuoteOrderSummary.js` — sidebar

### 26. Console.log pollution throughout codebase

Every component, service, and analytics call has `console.log()` that will run in production.

### 27. `checkout-success.html` build configuration issues

1. NOT listed in `vite.config.js` `rollupOptions.input` — will not be in production builds
2. References `/styles/components.css` which does not exist
3. Uses absolute paths while Vite config sets `base: './'`

### 28. Contact form uses `alert()` for validation

**File:** `request-quote.html`, lines 408-416

### 29. geocodingService.js caching has no size limit

Writes to localStorage without checking storage usage or entry count. Cached objects include the large `raw` Nominatim response.

### 30. geocodingService.js rate limiting resets on page refresh

`lastRequestTime` resets to 0 on every page load.

### 31. Debounce has no cancel capability

Pending debounced search callbacks may fire after `LocationAutocomplete.destroy()`.

---

## LOW (P3)

### 32. Social media icons are misleading

Material Symbols used as stand-ins: "share" for Twitter, "business" for LinkedIn, etc.

### 33. `ProofStrip.updateLogos()` passes parent element to mount

`this.mount(parent)` passes a DOM element, but `mount()` expects a CSS selector string. This will always fail.

### 34. quoteService.js onboarding flow has no transaction safety

`completeQuoteOnboarding()` creates org, user, trip draft in sequential API calls with no rollback.

### 35. Unused `basePath` / `marketingBase` / `rootBase` variables in header

Three path variables computed in `render()` but never used.

### 36. `formatDate()` in quote-form.js may produce "Invalid Date"

Timezone interpretation issue: HTML date input returns `YYYY-MM-DD` parsed as UTC midnight, then `toLocaleDateString()` may show previous day.

---

## Calculators Deep Dive

### TripVolumeCalculator

| Issue | Severity | Detail |
|-------|----------|--------|
| Percentages can exceed 100% | HIGH | No constraint. User can freely set 100/100/100 |
| Rounding error in trip counts | MEDIUM | Counted trips may not sum to `tripsPerYear` |
| Average cost uses wrong denominator | MEDIUM | Divides by slider value, not rounded sum |
| No visual indicator when percentages diverge | HIGH | No feedback that distribution is invalid |
| Hardcoded prices | LOW | Should load from `pricing.json` |
| Analytics fires on every slider movement | LOW | Should debounce |

### ROIEstimator

| Issue | Severity | Detail |
|-------|----------|--------|
| Dead code: `timeSavings` never used | MEDIUM | Defined with 4 percentages, replaced by hardcoded 0.50 |
| Risk avoidance value is aspirational | HIGH | `$5,000 * 0.15` per trip, no cited source |
| Org size change overwrites custom inputs | MEDIUM | Rate resets when clicking different org size |
| ROI can show implausibly high values | MEDIUM | 107% at defaults |
| "Weeks of work saved" uses 40-hour assumption | LOW | Should note assumption |

### Both Calculators

| Issue | Severity | Detail |
|-------|----------|--------|
| Full re-render on every input event | MEDIUM | Replaces entire innerHTML on each slider tick |
| No `aria-label` on sliders | HIGH (a11y) | Screen readers get no context |
| Slider and number input desync | LOW | Slider max 100, number input max 500 |

---

## Summary

| Priority | Count | Action Required |
|----------|-------|-----------------|
| P0 (Critical) | 4 | XSS vulnerabilities — fix immediately |
| P1 (High) | 10 | Memory leaks, calculator bugs, dead config, broken URLs |
| P2 (Medium) | 17 | Accessibility violations, code quality, build config |
| P3 (Low) | 5 | Minor issues, cosmetic |

**Top 5 actions:**

1. Add shared `escapeHtml()` utility and apply to every interpolated value in template literals
2. Fix calculator percentage constraint and ROI dead code / assumption labeling
3. Add `aria-*` attributes to quote form wizard, LocationAutocomplete, FAQ accordions, and LeadCapture modal
4. Fix memory leaks in MarketingHeader, Analytics, and quote-form.js
5. Add `checkout-success.html` to Vite build config and fix path references
