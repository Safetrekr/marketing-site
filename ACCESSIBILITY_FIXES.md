# Safetrekr Marketing - Accessibility Implementation Guide

This document provides the specific code changes needed to implement WCAG 2.1 AA accessibility fixes across all marketing pages.

## Implementation Priority

1. **Critical** (Implement immediately)
2. **High** (Implement within 1 week)
3. **Medium** (Implement within 2 weeks)
4. **Low** (Nice to have)

---

## 1. Skip Link (Critical)

**Apply to:** All HTML pages

**Add immediately after `<body>` tag:**

```html
<body class="st-marketing-page">
  <!-- Skip Link for Accessibility -->
  <a href="#main-content" class="st-skip-link">Skip to main content</a>

  <!-- Rest of page content -->
```

**CSS already added to:** `/marketing/styles/marketing.css`

---

## 2. Mobile Menu Toggle - ARIA Label (Critical)

**File:** `/marketing/components/header.js`

**Current code:**
```javascript
<button class="st-marketing-mobile-toggle">
  <span class="material-symbols-outlined">menu</span>
</button>
```

**Updated code:**
```javascript
<button class="st-marketing-mobile-toggle" aria-label="Open navigation menu" aria-expanded="false">
  <span class="material-symbols-outlined" aria-hidden="true">menu</span>
</button>
```

**JavaScript update needed:**
- Toggle `aria-expanded` between "true" and "false" when clicked
- Update `aria-label` to "Close navigation menu" when open

---

## 3. Material Icons - Hide from Screen Readers (Critical)

**Apply to:** All pages with Material Symbols icons

**Pattern to find and replace:**

**Before:**
```html
<span class="material-symbols-outlined">verified_user</span>
```

**After:**
```html
<span class="material-symbols-outlined" aria-hidden="true">verified_user</span>
```

**When icon has adjacent text, no other changes needed.**

**When icon is alone in button:**
```html
<button aria-label="Close dialog">
  <span class="material-symbols-outlined" aria-hidden="true">close</span>
</button>
```

---

## 4. ARIA Landmarks (High)

**Apply to:** All HTML pages

### Header Component

**Current:**
```html
<!-- Header injected by MarketingHeader component -->
```

**Update in:** `/marketing/components/header.js`

```javascript
const headerHTML = `
  <header class="st-marketing-header" role="banner">
    <div class="st-marketing-header-inner">
      <a href="./index.html" class="st-marketing-logo" aria-label="Safetrekr - Trip Safety Management">
        Safetrekr
      </a>
      <nav class="st-marketing-nav" role="navigation" aria-label="Main navigation">
        <!-- Navigation links -->
      </nav>
    </div>
  </header>
`;
```

### Main Content Wrapper

**Current:**
```html
<!-- Hero Section -->
<section class="st-marketing-hero">
  ...
</section>

<!-- Feature Section -->
<section class="st-marketing-section">
  ...
</section>
```

**Updated:**
```html
<main id="main-content" role="main">
  <!-- Hero Section -->
  <section class="st-marketing-hero" aria-labelledby="hero-heading">
    <div class="st-marketing-hero-content">
      <h1 id="hero-heading" class="st-marketing-hero-title">
        Transparent, Trip-Based Pricing
      </h1>
      ...
    </div>
  </section>

  <!-- Feature Section -->
  <section class="st-marketing-section" aria-labelledby="tiers-heading">
    <div class="st-marketing-container">
      <div class="st-marketing-section-header">
        <h2 id="tiers-heading" class="st-marketing-section-title">
          Choose the right tier for each trip
        </h2>
      </div>
    </div>
  </section>
</main>
```

### Footer Component

**Update in:** `/marketing/components/footer.js`

```javascript
const footerHTML = `
  <footer class="st-marketing-footer" role="contentinfo">
    <div class="st-marketing-container">
      <!-- Footer content -->
    </div>
  </footer>
`;
```

---

## 5. FAQ Accordions - ARIA States (High)

**Files:** pricing.html, security.html, any page with FAQs

**Current JavaScript:**
```javascript
question.addEventListener('click', () => {
  const isActive = item.classList.contains('active');

  // Close all other items
  faqItems.forEach(otherItem => {
    otherItem.classList.remove('active');
  });

  // Toggle current item
  if (!isActive) {
    item.classList.add('active');
  }
});
```

**Updated JavaScript:**
```javascript
question.addEventListener('click', () => {
  const wasExpanded = question.getAttribute('aria-expanded') === 'true';

  // Close all other items
  faqItems.forEach(otherItem => {
    otherItem.classList.remove('active');
    otherItem.querySelector('.st-faq-question').setAttribute('aria-expanded', 'false');
  });

  // Toggle current item
  if (!wasExpanded) {
    item.classList.add('active');
    question.setAttribute('aria-expanded', 'true');
  }
});
```

**HTML Update:**
```html
<div class="st-faq-item">
  <button class="st-faq-question" aria-expanded="false" aria-controls="faq-answer-1">
    <span>Is Safetrekr FERPA compliant for K-12 schools?</span>
    <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
  </button>
  <div class="st-faq-answer" id="faq-answer-1">
    <div class="st-faq-answer-content">
      <p>Yes. Safetrekr is fully FERPA compliant...</p>
    </div>
  </div>
</div>
```

---

## 6. Lead Capture Modal - Focus Management (High)

**File:** `/marketing/components/lead-capture.js`

**Add to `show()` method:**

```javascript
show(options) {
  // ... existing code ...

  this.modal.classList.add('active');

  // Focus management
  this.previousFocus = document.activeElement;

  // Set focus to first form field after modal opens
  setTimeout(() => {
    const firstInput = this.modal.querySelector('input, select, textarea, button');
    if (firstInput) {
      firstInput.focus();
    }
  }, 100);

  // Trap focus within modal
  this.trapFocus();
}
```

**Add to `hide()` method:**

```javascript
hide() {
  this.modal.classList.remove('active');

  // Return focus to element that opened modal
  if (this.previousFocus) {
    this.previousFocus.focus();
  }
}
```

**Add focus trap method:**

```javascript
trapFocus() {
  const focusableElements = this.modal.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  this.modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }

    if (e.key === 'Escape') {
      this.hide();
    }
  });
}
```

---

## 7. Form Validation - ARIA Live Regions (High)

**Files:** request-quote.html, pricing.html calculator

**Error message display:**

```html
<div class="st-form-group">
  <label for="email" class="st-lead-capture-label">
    Email <span class="st-lead-capture-required">*</span>
  </label>
  <input
    type="email"
    id="email"
    name="email"
    class="st-lead-capture-input"
    aria-required="true"
    aria-invalid="false"
    aria-describedby="email-error"
  >
  <div id="email-error" class="st-lead-capture-error" role="alert" aria-live="assertive">
    <!-- Error message appears here -->
  </div>
</div>
```

**JavaScript update:**

```javascript
function validateEmail(input) {
  const errorElement = document.getElementById(input.id + '-error');

  if (!input.validity.valid) {
    input.setAttribute('aria-invalid', 'true');
    errorElement.textContent = 'Please enter a valid email address';
    input.classList.add('error');
  } else {
    input.setAttribute('aria-invalid', 'false');
    errorElement.textContent = '';
    input.classList.remove('error');
  }
}
```

---

## 8. Pricing Tiers Table - Accessibility (High)

**File:** pricing.html

**Current:**
```html
<table class="st-pricing-table">
  <thead>
    <tr>
      <th>Trip Tier</th>
      <th>Price</th>
      <th>Trip Type</th>
      <th>What's Included</th>
      <th>Typical Turnaround</th>
    </tr>
  </thead>
  ...
</table>
```

**Updated:**
```html
<table class="st-pricing-table" role="table" aria-label="Pricing tiers comparison">
  <caption class="sr-only">Safetrekr pricing tiers with features and turnaround times</caption>
  <thead>
    <tr>
      <th scope="col">Trip Tier</th>
      <th scope="col">Price</th>
      <th scope="col">Trip Type</th>
      <th scope="col">What's Included</th>
      <th scope="col">Typical Turnaround</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Tier 1: Domestic Day/Overnight</th>
      <td>$450</td>
      <td>...</td>
      <td>...</td>
      <td>3-5 business days</td>
    </tr>
  </tbody>
</table>
```

---

## 9. Interactive Calculator - ARIA Labels (High)

**File:** `/marketing/components/calculators.js`

**Trip Volume Calculator inputs:**

```html
<div class="st-calculator-slider-group">
  <label for="trip-count-slider" class="st-calculator-label">
    Number of trips per year
  </label>
  <input
    type="range"
    id="trip-count-slider"
    name="tripCount"
    min="1"
    max="100"
    value="10"
    aria-valuemin="1"
    aria-valuemax="100"
    aria-valuenow="10"
    aria-valuetext="10 trips"
    aria-describedby="trip-count-display"
  >
  <output id="trip-count-display" class="st-calculator-output">
    10 trips
  </output>
</div>

<div class="st-calculator-result" role="region" aria-live="polite" aria-atomic="true">
  <h3 class="st-calculator-result-title">Estimated Annual Cost</h3>
  <div class="st-calculator-result-value">$4,500</div>
  <p class="st-calculator-result-note">Based on 10 Tier 1 trips</p>
</div>
```

**JavaScript update:**

```javascript
slider.addEventListener('input', (e) => {
  const value = e.target.value;
  const output = document.getElementById(e.target.id.replace('-slider', '-display'));

  // Update ARIA attributes
  e.target.setAttribute('aria-valuenow', value);
  e.target.setAttribute('aria-valuetext', `${value} trips`);

  // Update visual output
  output.textContent = `${value} trips`;

  // Calculate and update result
  updateCalculation();
});
```

---

## 10. Quote Form Progress Indicator (Medium)

**File:** request-quote.html

**Current:**
```html
<div class="st-quote-progress-step active">
  <div class="st-quote-progress-step-number">1</div>
  <div class="st-quote-progress-step-label">Trip Details</div>
</div>
```

**Updated:**
```html
<div class="st-quote-progress" role="progressbar" aria-valuemin="1" aria-valuemax="4" aria-valuenow="1" aria-valuetext="Step 1 of 4: Trip Details">
  <div class="st-quote-progress-step active" aria-current="step">
    <div class="st-quote-progress-step-number" aria-hidden="true">1</div>
    <div class="st-quote-progress-step-label">Trip Details</div>
  </div>
  <div class="st-quote-progress-step">
    <div class="st-quote-progress-step-number" aria-hidden="true">2</div>
    <div class="st-quote-progress-step-label">Add-ons</div>
  </div>
  <!-- ... -->
</div>
```

**JavaScript update when changing steps:**

```javascript
function goToStep(stepNumber) {
  const progressBar = document.querySelector('.st-quote-progress');
  progressBar.setAttribute('aria-valuenow', stepNumber);
  progressBar.setAttribute('aria-valuetext', `Step ${stepNumber} of 4: ${stepLabels[stepNumber]}`);

  // Update aria-current
  document.querySelectorAll('.st-quote-progress-step').forEach((step, index) => {
    if (index + 1 === stepNumber) {
      step.setAttribute('aria-current', 'step');
    } else {
      step.removeAttribute('aria-current');
    }
  });
}
```

---

## 11. Footer Social Links (Medium)

**File:** `/marketing/components/footer.js`

**Current:**
```html
<a href="https://twitter.com/safetrekr" class="st-marketing-footer-social-link">
  <span class="material-symbols-outlined">twitter</span>
</a>
```

**Updated:**
```html
<a href="https://twitter.com/safetrekr" class="st-marketing-footer-social-link" aria-label="Follow Safetrekr on Twitter" target="_blank" rel="noopener noreferrer">
  <span class="material-symbols-outlined" aria-hidden="true">twitter</span>
  <span class="sr-only">Opens in new window</span>
</a>
```

---

## 12. Autocomplete Attributes (Low)

**Files:** request-quote.html, lead-capture modal

**Personal information fields:**

```html
<input
  type="text"
  id="firstName"
  name="firstName"
  autocomplete="given-name"
  aria-required="true"
>

<input
  type="text"
  id="lastName"
  name="lastName"
  autocomplete="family-name"
  aria-required="true"
>

<input
  type="email"
  id="email"
  name="email"
  autocomplete="email"
  aria-required="true"
>

<input
  type="tel"
  id="phone"
  name="phone"
  autocomplete="tel"
>

<input
  type="text"
  id="organization"
  name="organization"
  autocomplete="organization"
  aria-required="true"
>

<input
  type="text"
  id="jobTitle"
  name="jobTitle"
  autocomplete="organization-title"
>
```

---

## Testing Checklist

After implementing these fixes, test with:

### Automated Tools
- [ ] axe DevTools Chrome Extension
- [ ] WAVE browser extension
- [ ] Lighthouse accessibility audit (aim for 95+)
- [ ] W3C HTML Validator

### Keyboard Testing
- [ ] Tab through entire page
- [ ] Shift+Tab backward navigation
- [ ] Enter/Space to activate buttons
- [ ] Escape to close modals
- [ ] Arrow keys in select boxes
- [ ] Focus visible on all elements

### Screen Reader Testing
- [ ] NVDA (Windows) - Free
- [ ] JAWS (Windows) - Trial available
- [ ] VoiceOver (Mac) - Built-in (Cmd+F5)
- [ ] TalkBack (Android) - Built-in
- [ ] VoiceOver (iOS) - Built-in

### Visual Testing
- [ ] Zoom to 200% - layout intact
- [ ] 320px width - no horizontal scroll
- [ ] High contrast mode (Windows)
- [ ] Dark mode
- [ ] Focus indicators visible

---

## Quick Win Checklist

Can be implemented in < 2 hours:

1. [ ] Add skip link to all pages
2. [ ] Add `aria-hidden="true"` to all Material Icons
3. [ ] Add `aria-label` to mobile menu toggle
4. [ ] Add `role="banner"`, `role="main"`, `role="contentinfo"` to header/main/footer
5. [ ] Add `aria-label` to social media links
6. [ ] Update FAQ buttons with `aria-expanded` attribute
7. [ ] Test keyboard navigation on all pages

---

## Implementation Order

### Phase 1 (Week 1)
- Skip links
- Icon `aria-hidden`
- Button ARIA labels
- ARIA landmarks
- Focus indicator improvements

### Phase 2 (Week 2)
- FAQ accordion ARIA states
- Form validation with live regions
- Modal focus management
- Table accessibility

### Phase 3 (Week 3)
- Calculator ARIA labels
- Quote form progress
- Autocomplete attributes
- Final testing and fixes

---

## Support Resources

- **WCAG Quick Reference:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices:** https://www.w3.org/WAI/ARIA/apg/
- **WebAIM Articles:** https://webaim.org/articles/
- **Deque University:** https://dequeuniversity.com/

---

**Last Updated:** 2025-10-12
