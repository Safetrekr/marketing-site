# SafeTrekr Marketing Site Audit Report — UX Design

**Agent:** world-class-ux-designer
**Date:** 2026-02-24
**Scope:** All 10 pages, header/footer components, calculator components, all CSS files

---

## Critical Issues (Conversion Blockers)

### 1. The 5-Step Quote Wizard Does Not Exist on the Request-Quote Page

**File:** `request-quote.html`

The CLAUDE.md describes a `QuoteForm` component with a 5-step wizard (tier selection, trip details, add-ons, org info, checkout) as the "most complex component (~1500 lines)" and the site's main conversion point. However, the actual `request-quote.html` page contains only a basic 5-field contact form (name, email, org, interest dropdown, message textarea). There is no wizard, no tier selection, no pricing interaction, and no checkout.

This means the page that every CTA on the site points to delivers a generic "contact us" form rather than an interactive quote experience. Users who expect to configure and price a trip will instead find a passive form that asks them to wait for a sales response. This is the single largest conversion gap on the site.

**Recommendation:** Either integrate the full `QuoteForm` wizard onto this page, or if the wizard was intentionally removed, update all CTAs site-wide to set accurate expectations (e.g., "Contact Us" rather than "Get Started" or "Request a Quote").

---

### 2. CTA Labels Create False Expectations

Every page on the site links to `request-quote.html`, but each CTA promises something different:

| Page | CTA Label | What User Expects |
|------|-----------|-------------------|
| Homepage hero | "See a Sample Trip Package" | To see a sample deliverable |
| Homepage final | "Request a Sample" | To receive a sample |
| Pricing hero | "Request More Information" | To get info sent to them |
| Pricing cards (x3) | "Get Started" | To begin purchasing |
| Pricing final | "Request More Information" | Info request |
| How It Works hero | "Start a Trip" | To begin trip creation |
| How It Works mid | "Start Your First Trip" | Same |
| How It Works binder | "See Sample Binder" | To view a sample |

All of these land on the same generic contact form with zero contextual awareness. A user who clicks "Get Started" on a $450 tier card sees the same form as someone who clicks "See a Sample Binder." There is no pre-selection, no tier pass-through, no contextual messaging.

**Recommendation:** At minimum, pass the user's intent via URL parameters (e.g., `?interest=sample` or `?tier=1`) and pre-select the appropriate option in the "I'm interested in..." dropdown. Ideally, create differentiated landing experiences for "see a sample," "get pricing," and "start a trip."

---

### 3. Trip Volume Calculator: Tier Percentages Do Not Sum to 100%

**File:** `components/calculators.js` (lines 136-199)

The three tier-percentage sliders operate independently. A user can set Tier 1 to 100%, Tier 2 to 100%, and Tier 3 to 100% simultaneously. The calculator will then show 300% of trips distributed, producing nonsensical results (e.g., 10 trips x 300% = 30 trips calculated). Conversely, a user can set all to 0% and see $0 spend.

There is no enforcement, warning, or auto-balancing behavior. The help text says "Percentages should add up to 100%" but provides no mechanism to achieve that.

**Recommendation:** Implement one of these patterns:
- **Auto-balance:** When one slider moves up, reduce the others proportionally (this is the most common pattern for percentage-split controls).
- **Validation with feedback:** Show a running total ("Total: 130% — please adjust to 100%") and visually flag the error state.
- **Dropdown presets:** Replace three sliders with a single "Trip Mix" dropdown offering common scenarios (e.g., "Mostly day trips," "Mix of domestic," "Heavy international").

---

## High Priority Issues (Trust and Findability)

### 4. Eight Dead "Coming Soon" Links in the Footer

**File:** `components/marketing-footer.js` (lines 48-75)

The footer includes links to Blog, Case Studies, Webinars, Help Center, Terms of Service, Privacy Policy, Data Processing Agreement, and Accessibility Statement — all marked "(coming soon)" and linking to non-existent pages. For the target audience (school administrators, church leaders, procurement officers), missing Terms of Service and Privacy Policy pages are dealbreakers. These buyers need legal documentation to proceed with purchase.

**Recommendation:** Remove "coming soon" links for content that does not exist yet (blog, case studies, webinars). For legal pages (Terms, Privacy, DPA), either create even minimal versions or remove the links entirely. Never show a navigation link that leads nowhere.

---

### 5. Stale Dates on Integrations Page

**File:** `integrations.html` (lines 188-191, 236-238, 284-286)

Three integration cards show "Coming Q2 2025" or "Coming Q3 2025" for Skyward, Bill.com, and Planning Center. The current date is February 2026. These stale roadmap dates make the company appear inactive or unable to ship. This is especially damaging on a page targeting enterprise buyers who evaluate vendor reliability.

**Recommendation:** Update the dates to reflect current reality. If these integrations are still planned, show realistic timeframes. If they are deprioritized, change the label to "Contact us" or "Request this integration."

---

### 6. Sign-In Links Point to Localhost

**File:** `components/marketing-header.js` (lines 51-86)

All Sign In dropdown links point to `http://localhost:5174/...`. This is a development artifact that will break in production. Beyond the broken links, exposing internal port numbers in production code raises credibility concerns for security-conscious buyers.

**Recommendation:** Use environment-variable-based URLs or relative paths. For pre-launch, consider hiding the Sign In dropdown entirely or linking to a "coming soon" page.

---

### 7. Navigation Hides Key Pages from Target Audience

**File:** `components/marketing-header.js` (lines 35-41)

The primary navigation shows only 5 of 10 pages: How it Works, Solutions, Pricing, About, Security. Three pages critical to the buying process are hidden in the footer:

- **Resources** — free downloadable templates that serve as a lead-generation mechanism
- **Integrations** — a key evaluation criterion for enterprise buyers
- **Procurement** — specifically designed for the people who approve purchases

The procurement officer who lands on this site has no visible path to the procurement page without scrolling to the very bottom of any page and scanning the footer. This page should be easily discoverable.

**Recommendation:** Consider grouping navigation items under dropdowns. For example: "Product" (How It Works, Solutions, Integrations), "Pricing" (standalone), "Resources" (Templates, Blog), "Company" (About, Security, Procurement). Alternatively, add a secondary navigation bar or a visible "For Procurement" link near the Sign In area.

---

### 8. Empty Social Proof Strip

**File:** `index.html` (lines 87-88)

The homepage includes a `ProofStrip` component with the label "Trusted by leading organizations nationwide," but without reviewing the component implementation, the positioning suggests it likely renders logo placeholders or an empty container. For the target audience, social proof is the most powerful trust signal. An empty or generic "trusted by" section without named organizations or logos is worse than having no section at all — it signals that no one actually uses the product.

**Recommendation:** If you have customers, add their logos. If pre-launch, replace with specific authority signals: "Built by former US Secret Service agents" (which is on the About page but not on the homepage), compliance certifications, or statistics. Remove the strip entirely if there is nothing concrete to show.

---

## Medium Priority Issues (Usability and Consistency)

### 9. Inconsistent Step Count: Homepage Says 5, How It Works Says 4

**File:** `index.html` (line 162) vs `how-it-works.html` (line 175)

The homepage section header reads "From trip idea to defensible record in 5 steps" and shows 5 cards. The How It Works page says "From Trip Idea to Confident Departure in 4 Steps" and shows 4 cards. The How It Works page title meta tag says "4 Steps." The processes described are also different (the homepage version includes "Travelers Get Connected" as a separate step; the How It Works page collapses this).

**Recommendation:** Align on one version. The 4-step version on How It Works is cleaner and more actionable. Update the homepage preview to match, or simplify the homepage to show 3 highlights with a "See the full process" CTA.

---

### 10. Form Validation Uses `alert()` Dialogs

**File:** `request-quote.html` (lines 408-416)

Validation errors on the contact form trigger `alert('Please fill in all required fields.')`. This is jarring, inaccessible (screen readers announce alerts inconsistently), and feels unpolished for a professional B2B product. There is also no inline validation — no red borders on empty required fields, no per-field error messages, and no focus management after errors.

**Recommendation:** Replace `alert()` with inline validation. Highlight the first invalid field with a red border and an error message below it (e.g., "Please enter your name"). Move focus to the first error field. Add `aria-invalid="true"` and `aria-describedby` pointing to the error message for accessibility.

---

### 11. ROI Calculator: Hidden Assumptions Reduce Credibility

**File:** `components/calculators.js` (lines 355-358)

The ROI Estimator hardcodes `riskAvoidancePerTrip = 5000` and `riskReductionFactor = 0.15`, then presents the resulting "Risk avoidance value" as a factual savings number without explaining these assumptions upfront. For a school administrator evaluating a $450/trip spend, seeing a "$11,250 risk avoidance" figure with no visible methodology will feel like marketing sleight-of-hand rather than a credible tool.

**Recommendation:** Make assumptions transparent. Show a collapsible "How we calculate this" section explaining: "We estimate that the average cost of a preventable trip incident is $5,000 (including legal fees, insurance claims, and administrative costs). Professional safety review reduces incident likelihood by approximately 15%." Alternatively, let users input their own incident-cost assumptions.

---

### 12. Inconsistent FAQ Patterns Across Pages

Three different FAQ implementations exist across the site:

- **pricing.html** (line 370): Uses `<button class="st-faq-question">` with inline JS accordion, no ARIA attributes
- **security.html** (line 350): Uses `<button class="st-faq-question" aria-expanded="false">` with ARIA
- **how-it-works.html** (line 530): Uses native `<details>/<summary>` elements

The visual styling, animation behavior, and keyboard interaction differ across all three. Screen reader users will experience inconsistent behavior on each page.

**Recommendation:** Standardize on one FAQ component. The `<details>/<summary>` approach is the most accessible by default (built-in keyboard and screen reader support). If custom styling is needed, use the button-with-ARIA approach from security.html consistently, extracted into a shared component.

---

### 13. Contact Form Has No `<form>` Element

**File:** `request-quote.html` (lines 231-288)

The contact form is a `<div class="st-contact-form">` with a `<button type="button">` submit. There is no `<form>` element wrapping the fields. This means:
- No native form submission behavior
- No browser autofill support
- No ability to submit via Enter key
- Password managers and form-fill extensions will not recognize it
- Accessibility tools cannot identify it as a form

**Recommendation:** Wrap the form fields in a `<form>` element, change the submit button to `type="submit"`, and use `event.preventDefault()` in the handler instead.

---

### 14. About Page: 6-Column Grid Not Responsive

**File:** `about.html` (line 150)

The Field Experts badge grid uses `grid-template-columns: repeat(6, 1fr)` as an inline style. There is no media query to adjust this for smaller screens. On a phone, this will render six tiny columns where badge images and text are unreadable.

**Recommendation:** Move this to a CSS class and add responsive breakpoints: 3 columns on tablets, 2 columns on phones. Since it is an inline style, it cannot be overridden by media queries in the stylesheet.

---

## Lower Priority Issues (Polish and Optimization)

### 15. Pricing Page Volume Discounts Are Inconsistent

**File:** `pricing.html` (line 310) vs `procurement.html` (lines 319-324)

The Pricing page says: "Organizations managing 5 or more trips per year qualify for volume pricing" (generic, no specific percentages). The Procurement page says: "10% for 10+, 15% for 25+, 20% for 50+ trips." These are different thresholds (5+ vs 10+) and the pricing page does not mention specific discount percentages that procurement lists.

**Recommendation:** Align the discount structure across both pages. Procurement officers will compare what they read on Pricing vs Procurement and lose trust if numbers differ.

---

### 16. Procurement Page Uses Placeholder Phone Number

**File:** `procurement.html` (line 544)

The procurement page footer displays `1-800-555-1234`, which is a fictional phone number. This damages credibility for the most scrutiny-heavy audience on the site.

**Recommendation:** Replace with a real phone number or remove it entirely.

---

### 17. Procurement "Download" Links Are Non-Functional

**File:** `procurement.html` (lines 104-155)

The Security Questionnaire, Contract Template, W-9, and COI all have download links pointing to `#`. A procurement officer visiting this page to evaluate Safetrekr as a vendor will attempt to download these documents and find nothing works. This is the second-worst possible outcome after a 404 (the worst being that it makes the company appear fraudulent).

**Recommendation:** Either upload real documents and link them, or replace "Download PDF" buttons with "Request via email" links that open a prefilled mailto: or trigger the lead capture modal.

---

### 18. No Skip-Nav Link

None of the 10 pages include a skip-navigation link. For keyboard-only users and screen reader users, this means navigating through the entire header menu on every page before reaching content. Given that the target audience includes institutions with accessibility requirements (schools subject to ADA, FERPA-regulated institutions), this is a compliance concern.

**Recommendation:** Add a visually-hidden-until-focused skip link as the first focusable element: `<a href="#main-content" class="skip-nav">Skip to main content</a>` with corresponding `id="main-content"` on the main content area.

---

### 19. No Main Landmark

None of the pages use a `<main>` element. All content is inside `<section>` elements directly under `<body>`. This means assistive technology cannot distinguish between header, main content, and footer using landmark navigation.

**Recommendation:** Wrap the primary content sections (everything between header and footer) in a `<main>` element.

---

### 20. Resources Page Downloads All Point to `#`

**File:** `resources.html` (lines 197, 207, etc.)

All six downloadable resources (Trip Planning Checklist, Itinerary Template, Parent Communication Templates, Risk Assessment Worksheet, Emergency Contact Form, Post-Trip Debrief Guide) have `downloadUrl: '#'`. Users will click "Download PDF", see a lead capture modal, enter their information, and receive nothing. This is a broken lead-gen funnel that will erode trust immediately.

**Recommendation:** Either create the actual PDF/Word resources or remove the resources page until real content exists.

---

## Summary: Top 5 Actions by Impact

| Priority | Issue | Impact |
|----------|-------|--------|
| 1 | Restore or build the quote wizard on request-quote.html | Conversion rate |
| 2 | Fix CTA label inconsistency across all pages | User expectation management |
| 3 | Fix calculator percentage enforcement | Calculator credibility |
| 4 | Remove or fix dead links (footer, resources, procurement) | Trust and professionalism |
| 5 | Surface Procurement and Resources pages in primary navigation | Buyer findability |
