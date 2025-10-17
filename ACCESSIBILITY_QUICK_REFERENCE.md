# Accessibility Quick Reference Card

One-page guide for Safetrekr marketing website accessibility fixes.

---

## 🚨 Critical Fixes (Do These First!)

### 1. Skip Link
```html
<!-- Add after <body> tag on ALL pages -->
<a href="#main-content" class="st-skip-link">Skip to main content</a>

<!-- Wrap main content -->
<main id="main-content" role="main">
  <!-- All sections here -->
</main>
```

### 2. Hide Decorative Icons
```html
<!-- Before -->
<span class="material-symbols-outlined">menu</span>

<!-- After -->
<span class="material-symbols-outlined" aria-hidden="true">menu</span>
```

### 3. Label Icon Buttons
```html
<!-- Before -->
<button class="st-marketing-mobile-toggle">
  <span class="material-symbols-outlined">menu</span>
</button>

<!-- After -->
<button class="st-marketing-mobile-toggle" aria-label="Open navigation menu">
  <span class="material-symbols-outlined" aria-hidden="true">menu</span>
</button>
```

### 4. Add Landmarks
```html
<header class="st-marketing-header" role="banner">
  <nav role="navigation" aria-label="Main navigation">
    <!-- nav links -->
  </nav>
</header>

<main id="main-content" role="main">
  <!-- content -->
</main>

<footer class="st-marketing-footer" role="contentinfo">
  <!-- footer -->
</footer>
```

---

## 📋 Form Accessibility

### Labels
```html
<label for="email">Email <span aria-label="required">*</span></label>
<input
  type="email"
  id="email"
  name="email"
  aria-required="true"
  aria-invalid="false"
  aria-describedby="email-error"
>
<div id="email-error" role="alert"></div>
```

### Validation
```javascript
// Show error
input.setAttribute('aria-invalid', 'true');
errorDiv.textContent = 'Please enter a valid email';

// Clear error
input.setAttribute('aria-invalid', 'false');
errorDiv.textContent = '';
```

### Autocomplete
```html
<input type="text" autocomplete="given-name">  <!-- First name -->
<input type="text" autocomplete="family-name"> <!-- Last name -->
<input type="email" autocomplete="email">
<input type="tel" autocomplete="tel">
<input type="text" autocomplete="organization">
```

---

## 🎯 Interactive Elements

### FAQ Accordions
```html
<button
  class="st-faq-question"
  aria-expanded="false"
  aria-controls="faq-answer-1"
>
  Question text
  <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
</button>
<div id="faq-answer-1" class="st-faq-answer">
  Answer text
</div>
```

```javascript
// Toggle
button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
```

### Sliders/Range Inputs
```html
<label for="trip-count">Number of trips</label>
<input
  type="range"
  id="trip-count"
  min="1"
  max="100"
  value="10"
  aria-valuemin="1"
  aria-valuemax="100"
  aria-valuenow="10"
  aria-valuetext="10 trips"
>
<output id="trip-count-display">10 trips</output>
```

### Live Regions
```html
<!-- Announces changes to screen readers -->
<div class="st-calculator-result" aria-live="polite" aria-atomic="true">
  Estimated cost: $4,500
</div>

<!-- For urgent messages -->
<div role="alert" aria-live="assertive">
  Error: Please fill out all required fields
</div>
```

---

## 📊 Tables

```html
<table role="table" aria-label="Pricing comparison">
  <caption class="sr-only">
    Safetrekr pricing tiers with features and turnaround times
  </caption>
  <thead>
    <tr>
      <th scope="col">Trip Tier</th>
      <th scope="col">Price</th>
      <th scope="col">Features</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Tier 1</th>
      <td>$450</td>
      <td>Basic features</td>
    </tr>
  </tbody>
</table>
```

---

## 🔘 Buttons vs Links

### Use Button When
- Triggers action (open modal, submit form, toggle menu)
- Stays on same page
```html
<button type="button" aria-label="Close modal">Close</button>
```

### Use Link When
- Navigates to different page/section
- Has href attribute
```html
<a href="./pricing.html">View Pricing</a>
```

---

## 🎨 CSS Classes Added

```css
/* Skip link - already in marketing.css */
.st-skip-link { /* Shows on focus */ }

/* Screen reader only */
.sr-only { /* Hides visually, accessible to SR */ }
.sr-only-focusable:focus { /* Shows on focus */ }
```

Usage:
```html
<span class="sr-only">Opens in new window</span>
<h2 class="sr-only">Pricing tiers comparison</h2>
```

---

## ✅ Quick Testing Checklist

### Keyboard (5 min)
- [ ] Tab through entire page
- [ ] All interactive elements reachable
- [ ] Focus visible on all elements
- [ ] Escape closes modals/menus

### Screen Reader (10 min)
- [ ] Turn on NVDA/VoiceOver
- [ ] Navigate by headings (H key in NVDA)
- [ ] Navigate by landmarks (D key in NVDA)
- [ ] All buttons have names
- [ ] Form labels read correctly

### Automated (5 min)
- [ ] Run axe DevTools
- [ ] Run WAVE extension
- [ ] Run Lighthouse audit
- [ ] Fix any critical issues

---

## 🛠️ Tools & Extensions

**Free Browser Extensions:**
- **axe DevTools** - Best automated testing
- **WAVE** - Visual accessibility checker
- **Lighthouse** - Built into Chrome DevTools

**Free Screen Readers:**
- **NVDA** (Windows) - https://www.nvaccess.org/
- **VoiceOver** (Mac) - Built-in (Cmd+F5)

**Color Contrast:**
- WebAIM Contrast Checker - https://webaim.org/resources/contrastchecker/

---

## 🚫 Common Mistakes to Avoid

❌ **Don't:**
```html
<div onclick="handleClick()">Click me</div>
<span class="icon">✓</span>
<a href="#" onclick="showModal()">Open</a>
<img src="logo.png"> <!-- No alt -->
```

✅ **Do:**
```html
<button type="button" onclick="handleClick()">Click me</button>
<span aria-hidden="true">✓</span>
<button type="button" onclick="showModal()">Open</button>
<img src="logo.png" alt="Safetrekr logo">
```

---

## 📱 Mobile Accessibility

```html
<!-- Minimum tap target: 48x48px -->
<button style="min-width: 48px; min-height: 48px;">
  <span class="material-symbols-outlined" aria-hidden="true">menu</span>
</button>

<!-- Viewport for proper zooming -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## 🔍 Find & Replace Patterns

### Pattern 1: Material Icons
**Find:** `<span class="material-symbols-outlined">([^<]+)</span>`
**Replace:** `<span class="material-symbols-outlined" aria-hidden="true">$1</span>`

### Pattern 2: External Links
**Find:** `<a href="http`
**Add:** `target="_blank" rel="noopener noreferrer"`
**Plus:** `<span class="sr-only">Opens in new window</span>`

---

## 📞 When to Ask for Help

If you encounter:
- Custom interactive widgets (not standard HTML)
- Complex data visualizations
- Video/audio content
- Complex forms with conditional logic
- Third-party embedded content

Refer to full documentation or consult accessibility specialist.

---

## 📚 Additional Resources

**Full Documentation:**
- `/marketing/ACCESSIBILITY_AUDIT_REPORT.md` - Complete audit
- `/marketing/ACCESSIBILITY_FIXES.md` - Detailed implementation guide
- `/marketing/ACCESSIBILITY_SUMMARY.md` - Executive summary

**External:**
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA: https://www.w3.org/WAI/ARIA/apg/
- WebAIM: https://webaim.org/

---

**Last Updated:** 2025-10-12
**Print this page for quick reference during development!**
