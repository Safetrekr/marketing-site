# SafeTrekr Marketing Site Audit Report — Architecture & Security

**Agent:** chief-technology-architect
**Date:** 2026-02-24
**Scope:** All files in `components/`, `services/`, `config/`, Supabase Edge Functions, `vite.config.js`, `.env`, `.gitignore`, `checkout-success.html`

---

## CRITICAL

### 1. XSS Vulnerabilities in `quote-form.js`

**File:** `components/quote-form.js`

The `showConfirmation()` method (around lines 553-673) renders user-submitted data directly into HTML via template literals with no escaping:

```javascript
<dd class="col-sm-8">${this.formData.trip.name}</dd>
<dd class="col-sm-8">${this.formData.org.orgName}</dd>
<dd class="col-sm-8">${this.formData.org.role}<br>${this.formData.org.email}</dd>
```

An attacker entering `<img src=x onerror=alert(document.cookie)>` as a trip name or org name would get script execution. This is a stored-XSS vector if the data is later rendered elsewhere.

Additional XSS sites in the same file:
- **`showTierUpgradeModal()`** (~line 1579): Nominatim-returned `destinationName` injected unescaped. An attacker who controls a Nominatim result (or a MITM on the HTTP Nominatim call) could inject markup.
- **Billing address geocoding results** (~lines 1314-1318): `${result.name}` and `${result.address}` from Nominatim rendered as raw HTML in dropdown suggestions.

**Notable contrast:** `LocationAutocomplete.js` already has a proper `escapeHtml()` utility (line 302) and uses it. That pattern exists in the codebase but is not applied in `quote-form.js`.

**Recommendation:** Extract `escapeHtml()` into a shared utility module. Apply it to every user-supplied or third-party string before interpolation into HTML. Audit every `${}` inside template literals that produce HTML.

---

### 2. Feature Flag Contradiction Exposes Unreleased Tiers

**File:** `config/pricing.json`

The configuration contains two conflicting gating mechanisms:

```json
// Each tier object:
"T2": { "enabled": true, ... }
"T3": { "enabled": true, ... }

// Feature flags section:
"FF_TIER_2": false,
"FF_TIER_3": false
```

The `quote-form.js` tier rendering logic (around line 792) checks only `tier.enabled`, never the `featureFlags` section. Since `T2.enabled` and `T3.enabled` are both `true`, all three tiers are presented to users despite `FF_TIER_2` and `FF_TIER_3` being set to `false`.

The `featureFlags` object is loaded from the JSON but never referenced in any JavaScript file across the entire codebase. It is dead code.

**Impact:** Users can select and pay for T2 ($750) and T3 ($1,250) tiers that may not be operationally ready. The Edge Function accepts all three tier codes, so payment would succeed for an unfinished product tier.

**Recommendation:** Either remove the dead `featureFlags` section and rely solely on `tier.enabled`, or wire `featureFlags` into the rendering logic and set `T2.enabled` / `T3.enabled` to `false` until ready.

---

## HIGH

### 3. `checkout-success.html` Missing from Vite Build Config

**File:** `vite.config.js`

The `rollupOptions.input` object lists 10 HTML entry points but omits `checkout-success.html`. This page is the Stripe Checkout `success_url` target — the page a paying customer lands on after completing payment.

In development (`npm run dev`), Vite serves it fine. In production (`npm run build`), this file will not be included in the output, resulting in a **404 for every customer who just paid**.

**Recommendation:** Add `'checkout-success': resolve(__dirname, 'checkout-success.html')` to `rollupOptions.input`.

---

### 4. Hardcoded `localhost` URLs in Header Navigation

**File:** `components/marketing-header.js`

All "Sign In" dropdown links (both desktop and mobile) point to `http://localhost:5174/...`:

```javascript
<a href="http://localhost:5174/org-login.html" ...>
<a href="http://localhost:5174/traveler/welcome.html?role=traveler" ...>
<a href="http://localhost:5174/staff-login.html" ...>
```

These appear on lines 51-86 (desktop) and 128-163 (mobile). In production, every sign-in link will be broken or will route to whatever is running on the user's localhost.

**Recommendation:** Use environment-based URL configuration. Vite supports `import.meta.env.VITE_APP_URL` for this purpose.

---

### 5. Duplicated Supabase Credentials in `stripeQuoteService.js`

**File:** `services/stripeQuoteService.js`

Lines 85-86 hardcode the Supabase URL and anon key a second time, duplicating what `supabaseClient.js` already provides:

```javascript
const supabaseUrl = 'https://olgjdqguafidgrutubih.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

The file imports the Supabase singleton on line 6 but the checkout path uses raw `fetch()` with the duplicated credentials. If the key is rotated, this second copy will be missed.

**Recommendation:** Use `supabase.functions.invoke('create-checkout-session', { body: requestBody })` consistently, matching the invoice path. Remove the duplicated credentials.

---

### 6. CORS Wildcard on All Edge Functions

**Files:** `supabase/functions/create-checkout-session/index.ts`, `create-invoice/index.ts`, `marketing-stripe-webhook/index.ts`

All three Edge Functions use:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  ...
};
```

This allows any website to call these endpoints. While the anon key is required, it is public and visible in the client-side code.

The webhook function (`marketing-stripe-webhook`) does not need CORS at all since it is called server-to-server by Stripe.

**Recommendation:** Restrict `Access-Control-Allow-Origin` to the actual marketing site domain(s). Remove CORS headers entirely from the webhook function.

---

### 7. XSS in `checkout-success.html`

**File:** `checkout-success.html`

Around lines 243-253, Stripe session metadata is rendered into the page without escaping. The `org_name` and `trip_name` metadata values originate from user input submitted during the quote form and could contain malicious HTML.

**Recommendation:** Escape all values before rendering into the DOM.

---

## MEDIUM

### 8. `checkQuoteAccess()` Always Returns `canAccess: true`

**File:** `services/stripeQuoteService.js`, line 229

```javascript
canAccess: true, // User can always access after quote submission
```

The access-check function provides no actual gating. Any quote ID grants access regardless of payment status. If this function is used for authorization decisions anywhere in the ecosystem, it is an authorization bypass.

**Recommendation:** If this is truly the desired behavior, remove the function entirely to avoid false confidence.

---

### 9. No Idempotency on Quote Submission

**File:** `services/quoteService.js`

`submitQuote()` performs an `INSERT` into the `quotes` table with no duplicate-detection logic. A user double-clicking "Submit" or experiencing a network retry will create multiple quote records, potentially triggering multiple Stripe sessions or invoices.

**Recommendation:** Generate a client-side idempotency key (UUID) before submission. Include it in the quote record and add a unique constraint on it.

---

### 10. `sessionStorage` Magic Token Lost During Stripe Redirect

**Files:** `components/quote-form.js`, `checkout-success.html`

The onboarding flow stores a `magic_token` in `sessionStorage` after quote submission. When the user is redirected to Stripe Checkout (an external domain), the browser may open it in a new tab or the session context may change. `sessionStorage` is per-tab and per-origin, so the token may be lost.

**Recommendation:** Pass the magic token through the Stripe `success_url` as a query parameter, or store it in `localStorage` instead.

---

### 11. Stripe Invoice `hosted_invoice_url` May Be Null for Quote Mode

**File:** `supabase/functions/create-invoice/index.ts`

For the "quote" payment mode, the invoice is created with `auto_advance: false` and is never finalized. The `hosted_invoice_url` and `invoice_pdf` properties are only populated on finalized invoices but are returned to the client.

**Recommendation:** Call `stripe.invoices.finalizeInvoice(invoice.id)` before returning for quote mode, or handle the draft state explicitly.

---

### 12. Absolute Import Paths Conflict with `base: './'`

**File:** `vite.config.js`

The Vite config sets `base: './'` for relative asset paths in production. However, `services/` files use absolute imports (`import supabase from '/services/supabaseClient.js'`). Leading-slash imports resolve relative to the web server root, not the `base` path. In production with a non-root deployment, these imports will 404.

**Recommendation:** Use relative imports or Vite aliases (`@services/supabaseClient.js`). The aliases are already defined but not consistently used.

---

### 13. Client-Side Pricing Sent to Backend for Invoices

**File:** `components/quote-form.js`, ~line 268

The client calculates the price and sends it to the Edge Function. For invoices (`create-invoice`), the Edge Function uses the client-sent `tierPrice` as the `unit_amount`. A malicious user could modify the invoice amount by tampering with the request.

**Recommendation:** Look up the canonical price server-side in the invoice Edge Function.

---

### 14. Background Check Prices Hardcoded in Multiple Places

**Files:** `components/quote-form.js` (lines 105-106, 898-899), `config/pricing.json`

The quote form hardcodes `* 35` and `* 65` for background checks while `pricing.json` defines the same values. If prices change in the JSON, the hardcoded values will be out of sync.

**Recommendation:** Read background check prices from the loaded pricing config.

---

### 15. Sensitive Data in Console Logs

**Files:** `stripeQuoteService.js`, `quoteService.js`, `quote-form.js`, all Edge Functions

Extensive `console.log()` calls output complete quote data objects, Stripe session IDs, request/response bodies. Visible to anyone opening browser DevTools.

**Recommendation:** Gate console logging behind `import.meta.env.DEV` or remove it entirely.

---

## LOW

### 16. `.env` Contains Server-Side Secrets

**File:** `.env`

The `.env` file contains `STRIPE_SECRET_KEY` (a `sk_test_` key) and `SUPABASE_SERVICE_ROLE_KEY`. While `.gitignore` excludes it, its presence in a client-side project is a risk.

**Recommendation:** Remove server-side secrets from this file.

---

### 17. Calculators Use Independent Hardcoded Pricing

**File:** `components/calculators.js`, lines 26-30

The calculators have their own hardcoded price values that do not reference `pricing.json`.

**Recommendation:** Import and use values from `pricing.json`.

---

### 18. Minor XSS in `lead-capture.js` and `proof-strip.js`

**Files:** `components/lead-capture.js` (line 65), `components/proof-strip.js` (line 37)

Values from developer-controlled configuration rendered as HTML. Low risk now, but becomes an XSS vector if the data source changes.

**Recommendation:** Apply `escapeHtml()` for defense-in-depth.

---

### 19. Analytics GA Measurement ID Not Configured

**File:** `components/analytics.js`, line 28

The `GA_MEASUREMENT_ID` is a placeholder string. Google Analytics tracking is non-functional.

---

### 20. Geocoding Rate Limiting Is Per-Tab Only

**File:** `services/geocodingService.js`

The 1-request-per-second rate limit is per-tab. Multiple tabs or users on the same network can exceed Nominatim's rate limit and trigger IP bans.

**Recommendation:** Add a custom `User-Agent` header (required by Nominatim's terms). Consider server-side proxying.

---

## Architecture Observations

### Component Pattern
The ES6 class + `mount(selector)` pattern is clean and appropriate for a framework-free static site. The barrel export from `components/index.js` is well-organized. The main architectural risk is the lack of a shared HTML escaping utility.

### Service Layer
The singleton pattern for the Supabase client is correct. The service layer separation is logical. The main issue is inconsistent API call patterns (raw `fetch` vs. `supabase.functions.invoke`) in `stripeQuoteService.js`.

### Edge Functions
The webhook handler (`marketing-stripe-webhook`) is well-structured with proper signature verification, comprehensive event handling, and fallback provisioning logic. This is the strongest piece of the codebase from a security perspective.

---

## Summary: Priority Action Items

| Priority | Count | Key Actions |
|----------|-------|-------------|
| CRITICAL | 2 | Fix XSS in quote-form.js; resolve feature flag contradiction |
| HIGH | 5 | Add checkout-success.html to build; fix localhost URLs; deduplicate credentials; restrict CORS; escape checkout-success.html output |
| MEDIUM | 8 | Idempotency, sessionStorage token, invoice finalization, server-side price lookup, import paths, console logging, hardcoded prices, access check |
| LOW | 5 | Remove .env secrets, calculator pricing, minor XSS, GA ID, rate limiting |
