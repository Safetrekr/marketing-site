# SafeTrekr Marketing Site Audit Report — Visual Design & UI

**Agent:** world-class-ui-designer
**Date:** 2026-02-24
**Scope:** All five key HTML pages, all three CSS files, key component files

---

## P0 — Broken or Likely Rendering Incorrectly

### 1. Contact Form Uses Undefined CSS Variables (request-quote.html)

The inline `<style>` block in `request-quote.html` (lines 64-195) references a completely different variable namespace that does not exist anywhere in the design system:

```css
/* Used in request-quote.html */
var(--st-color-surface)       /* UNDEFINED */
var(--st-color-border)        /* UNDEFINED */
var(--st-color-text)          /* UNDEFINED */
var(--st-color-primary)       /* UNDEFINED */
var(--st-color-background)    /* UNDEFINED */
var(--st-color-primary-rgb)   /* UNDEFINED */
var(--st-color-success)       /* Has fallback: #22c55e */
```

The established token system uses `--st-bg-primary`, `--st-border-subtle`, `--st-text-primary`, `--st-primary`, etc. Because these variables resolve to nothing, the contact form container likely has no background, no border, transparent text, and no focus ring styling. The form may be functionally invisible or severely broken visually.

### 2. Calculator CSS References Undefined Token `--st-border-default`

`styles/calculators.css` references `--st-border-default` in three places (lines 267, 353, 417). This token is not defined in main.css — only `--st-border-subtle` and `--st-border-medium` exist. Visual separators are missing in calculator results and pricing table.

### 3. Pricing Page FAQ Wrapper Uses Undefined Class

`pricing.html` (line 368) wraps FAQ items in `<div class="st-faq-section">`, but no `.st-faq-section` rule exists in any CSS file. The security page correctly uses `st-faq-list` which is defined. The pricing FAQ will render full-width with no max-width constraint.

---

## P1 — Significant Quality Issues

### 4. Primary Green (#4ba467) Fails WCAG AA Contrast on White

The brand primary `#4ba467` on `#fefefe` yields approximately 3.3:1 contrast ratio (AA requires 4.5:1 for normal text). This affects:

- Eyebrow text (`.st-marketing-section-eyebrow`): 14px uppercase, weight 600 — fails
- Tertiary CTA links (`.st-marketing-cta-tertiary`): borderline
- Primary CTA buttons (white on green): same 3.3:1 — fails

The dark variant `#2f7e48` on hover achieves ~5.3:1 and passes. Consider darkening the primary to approximately `#3a8a54` for 4.5:1.

### 5. `--st-primary-light` Is Identical to `--st-primary`

```css
--st-primary: #4ba467;
--st-primary-dark: #2f7e48;
--st-primary-light: #4BA467;  /* Same hex, just different case */
```

There is no actual light variant. A proper light variant might be `#6bb882`.

### 6. Calculator Slider Fill Does Not Track Thumb Position

`styles/calculators.css` line 92:

```css
background: linear-gradient(to right,
  var(--st-primary) 0%, var(--st-primary) 50%,
  var(--st-bg-tertiary) 50%, var(--st-bg-tertiary) 100%);
```

The fill is hardcoded to 50% regardless of the actual slider value. The JavaScript does not update the track background. This creates a broken-feeling interactive element.

### 7. Dark Theme Changes Brand Identity from Green to Blue

```css
[data-theme="dark"] {
  --st-primary: #0091ff;       /* Blue, not green */
  --st-primary-dark: #0077cc;
  --st-primary-light: #33a9ff;
}
```

The dark theme replaces the green brand with electric blue — a completely different color identity. Additionally, there is **no theme toggle** in any component. If dark mode is not user-facing on the marketing site, these tokens should be removed.

### 8. About Page Relies Heavily on Inline Styles

`about.html` contains approximately 80+ inline `style` attributes. Any design system update will miss these elements. Responsive behavior is not controlled — inline styles cannot be overridden by media queries.

### 9. About Page Badge Grid: 6 Columns with No Responsive Breakpoint

Line 150:

```html
<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: var(--st-spacing-lg);">
```

On a 375px mobile viewport, each column would be ~52px wide. Badge images and text will be unreadable on phones. Because the styles are inline, CSS media queries cannot override them.

---

## P2 — Polish Issues

### 10. Hardcoded Colors Break Dark Theme Compatibility

| File | Line | Hardcoded Value | Should Be |
|------|------|----------------|-----------|
| marketing.css | 56 | `rgba(255, 255, 255, 0.95)` | Theme-aware token |
| marketing.css | 202 | `background: white` | `var(--st-bg-card)` |
| marketing.css | 305 | `background-color: white` | `var(--st-bg-card)` |
| marketing.css | 387 | `rgba(255, 255, 255, 0.95)` | Theme-aware |
| calculators.css | 103 | `border: 3px solid white` | `var(--st-bg-card)` |
| about.html | 496 | `background: white` | `var(--st-bg-card)` |

### 11. Footer Social Icons Use Generic Material Symbols

"share" for Twitter, "business" for LinkedIn, "group" for Facebook, "photo_camera" for Instagram. Not recognizable as social platforms. Consider actual brand icons or Simple Icons.

### 12. Header Sign-In Links Hardcode localhost URLs

`http://localhost:5174` for all sign-in links. Broken in production.

### 13. Repetitive Section Layout on Homepage

Four consecutive sections on the homepage use the identical layout pattern (eyebrow + title + subtitle + card grid). Creates visual monotony. Consider varying layout for at least one section.

### 14. Spacing Token Gap at the Large End

Scale jumps from `--st-spacing-xl: 2rem` to `--st-spacing-2xl: 3rem`. No `3xl` or `4xl`. But sections use hardcoded `5rem` (80px) and `6rem`. Consider adding `3xl: 4rem` and `4xl: 5rem`.

### 15. Calculator Tier Percentages Can Exceed or Fall Below 100%

No visual feedback that the sum deviates from 100%. Should show a warning badge or auto-normalize.

---

## P3 — Minor / Cosmetic

### 16. Hardcoded `rgba(75, 164, 103, ...)` Throughout

The green brand color `rgb(75, 164, 103)` is hardcoded as rgba values in at least 15 places for backgrounds, borders, and hover states. Should use a `--st-primary-rgb` token.

### 17. "coming soon" Labels in Footer Use Inline Styles

`style="font-size: 0.75em; opacity: 0.7;"` inline — should be a utility class.

### 18. CTA Button and Card Use Same Border Radius (1rem)

Both use `--st-radius-lg` (16px). On compact buttons this creates a pill-like appearance. Consider differentiated radii.

### 19. Missing `font-family` on Button in request-quote.html

Buttons do not inherit `font-family` by default. The button text may render in browser default sans-serif rather than Inter.

### 20. No Scroll-Margin on Anchor Target (`#calculators`)

The pricing page links to `#calculators` from the hero CTA. The sticky header (~60px) will hide the top of the calculator section. Needs `scroll-margin-top: 80px`.

---

## Summary

| Priority | Count | Key Themes |
|----------|-------|-----------|
| **P0** | 3 | Undefined CSS variables, missing class definitions |
| **P1** | 6 | Contrast failures, broken slider fills, inline style sprawl, mobile breakpoint gaps |
| **P2** | 6 | Dark theme incompatibility, hardcoded URLs, layout monotony, icon quality |
| **P3** | 5 | Token hygiene, minor spacing and inheritance issues |

## Recommended Action Order

1. **Fix P0 items first** — the contact form is likely visually broken. Replace `--st-color-*` references with correct `--st-*` tokens. Fix `--st-border-default` to `--st-border-medium`. Change `st-faq-section` to `st-faq-list`.

2. **Address P1 contrast** — darken `--st-primary` from `#4ba467` to approximately `#3a8a54` to reach 4.5:1.

3. **Fix calculator slider tracking** — add JS to update slider track gradient on each `input` event.

4. **Refactor about.html** — extract inline styles into CSS classes. Add responsive breakpoints for badge grid.

5. **Resolve dark theme strategy** — decide whether to support dark mode. If yes, fix green-to-blue shift. If no, remove dark theme tokens.

---

## Appendix: Color System Alignment Audit

The marketing site's `main.css` tokens were compared against the canonical SafeTrekr design system (from the app). Below are all discrepancies that need to be resolved.

### Light Theme Discrepancies

| Token (main.css) | Current Value | Canonical Value | Status |
|---|---|---|---|
| `--st-bg-primary` | `#fefefe` (near-white) | `#E7ECEE` (cool gray-blue) | **Wrong** — should be cool gray-blue, not near-white |
| `--st-bg-secondary` | `#f9f8f4` | — | No direct canonical match |
| `--st-bg-card` | `#ffffff` | `#F7F8F8` | Slightly off |
| `--st-primary-light` | `#4BA467` (identical to primary) | — | **Bug** — no actual light variant exists |
| `--st-success` | `#4cbb20` | `#4BA467` (same as primary) | Wrong green |
| `--st-warning` | `#c67024` | `#F59E0B` | Different orange |
| `--st-info` | `#2b93c0` | `#2A4A59` (dark teal) | Different color entirely |
| `--st-text-secondary` | `#59727e` | `#616567` (muted-foreground) | Close but different |
| `--st-accent-green` | `#4cbb20` | — | Not in canonical system |
| `--st-accent-cyan` | `#3ce6e3` | `#2F7E7E` (teal) | Different shade |
| `--st-accent-yellow` | `#ede339` | `#EAB308` | Different yellow |
| `--st-border-subtle` | `rgba(30, 64, 79, 0.18)` | `#8A9599` (solid) | Different approach — canonical uses solid borders |
| `--st-border-medium` | `rgba(30, 64, 79, 0.3)` | `#8A9599` (solid) | Same issue |
| `--st-radius-lg` | `1rem` (16px) | `0.625rem` (10px) | **Too rounded** — canonical uses 10px globally |
| `--st-radius-xl` | `1.5rem` (24px) | — | Not in canonical system |

### Dark Theme Discrepancies (Nearly All Wrong)

| Token (main.css) | Current Value | Canonical Value | Status |
|---|---|---|---|
| `--st-primary` | `#0091ff` (blue) | `#4BA467` (green) | **Critical** — brand identity break. Primary must stay green in both themes |
| `--st-primary-dark` | `#0077cc` (blue) | `#2F7E48` | Wrong color family |
| `--st-primary-light` | `#33a9ff` (blue) | — | Wrong color family |
| `--st-bg-primary` | `#031118` | `#061A23` (deep navy-teal) | Close but off |
| `--st-bg-secondary` | `#07202B` | — | Close to canonical |
| `--st-bg-tertiary` | `#2a2a2a` (neutral gray) | `#2A4A59` (teal) | **Wrong family** — should be teal, not gray |
| `--st-bg-card` | `rgba(255,255,255,0.02)` | `#0A2733` (solid) | Different approach — canonical uses solid |
| `--st-text-secondary` | `#b8b8b8` | `#929899` (muted-foreground) | Different gray |
| `--st-text-muted` | `#888888` | `#929899` | Different gray |
| `--st-danger` | `#dc3545` (Bootstrap red) | `#F43F5E` (brighter) | Old Bootstrap palette |
| `--st-success` | `#28a745` (Bootstrap green) | `#22C55E` (brighter) | Old Bootstrap palette |
| `--st-warning` | `#ffc107` (Bootstrap yellow) | `#F97316` (orange) | Old Bootstrap palette |
| `--st-info` | `#17a2b8` (Bootstrap cyan) | `#3B82F6` (blue) | Old Bootstrap palette |
| `--st-accent-green` | `#bbff9a` | — | Not in canonical system |
| `--st-accent-cyan` | `#00c1de` | `#14B8A6` (teal) | Different |
| `--st-accent-yellow` | `#fce405` | `#FACC15` | Close but different |

### Missing Tokens (in canonical system but absent from main.css)

These tokens exist in the canonical system and should be added to `main.css`:

**Light theme:**
- `--st-foreground: #123646` (primary text — currently `--st-text-primary`)
- `--st-popover: #E7EBEC`
- `--st-popover-foreground: #07202B`
- `--st-secondary: #123646` (dark teal for secondary actions)
- `--st-secondary-foreground: #FFFFFF`
- `--st-muted: #E7ECEE`
- `--st-muted-foreground: #616567`
- `--st-accent: #E7ECEE`
- `--st-accent-foreground: #061A23`
- `--st-destructive: #C1253E`
- `--st-destructive-foreground: #FCEBEE`
- `--st-border: #8A9599` (solid border token)
- `--st-input: #80959B`
- `--st-ring: #365462` (focus ring)

**Dark theme:**
- `--st-popover: #2A4A59`
- `--st-muted: #2A4A59`
- `--st-accent: #494D4E`
- `--st-ring: #737373`

### Key Takeaways

1. **Dark theme is entirely wrong** — it uses an old Bootstrap-era palette with blue primary instead of the canonical green-stays-green approach. The entire `[data-theme="dark"]` block needs to be rewritten.

2. **Light theme is ~70% correct** — primary green, text colors, and basic backgrounds are close. Main fixes needed: background color (`#E7ECEE` not `#fefefe`), border radius (`0.625rem` not `1rem`), semantic colors (warning, info), and solid border tokens.

3. **Border radius is globally too rounded** — canonical system uses `0.625rem` (10px) everywhere. The marketing site uses `1rem` (16px) for `--st-radius-lg`, creating a pill-like look on buttons.

4. **Missing the secondary color** — the canonical system has `--st-secondary: #123646` (dark teal) as a core brand color alongside the green. The marketing site doesn't define this token.

5. **Hardcoded `rgba(75, 164, 103, ...)` values** (15+ instances across CSS files) should be replaced with a `--st-primary-rgb: 75, 164, 103` token for opacity variants.
