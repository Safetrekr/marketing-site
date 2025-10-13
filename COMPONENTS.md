# Marketing Components Documentation

Comprehensive documentation for all reusable components in the SafeTrekr marketing website.

---

## Table of Contents

- [Overview](#overview)
- [Core Components](#core-components)
  - [MarketingHeader](#marketingheader)
  - [MarketingFooter](#marketingfooter)
  - [ProofStrip](#proofstrip)
  - [Analytics](#analytics)
- [Form Components](#form-components)
  - [LeadCapture](#leadcapture)
  - [QuoteForm](#quoteform)
- [Interactive Components](#interactive-components)
  - [TripVolumeCalculator](#tripvolumecalculator)
  - [ROIEstimator](#roiestimator)

---

## Overview

All components are ES6 modules located in `/marketing/components/`. They follow a consistent API pattern:

- **Constructor**: Accepts an options object for configuration
- **render()**: Returns HTML string
- **mount(selector)**: Mounts component to DOM element
- **destroy()**: Cleans up and removes component

### Importing Components

```javascript
// Import individual components
import { MarketingHeader } from './components/marketing-header.js';
import { Analytics } from './components/analytics.js';

// Import from index
import { MarketingHeader, MarketingFooter, Analytics } from './components/index.js';
```

---

## Core Components

### MarketingHeader

**File:** `/marketing/components/marketing-header.js`

Sticky navigation header with logo, navigation links, and mobile menu.

#### Constructor

```javascript
new MarketingHeader(options)
```

**Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `currentPage` | `string` | `''` | Current page identifier for active link styling |

#### Methods

**mount(selector)**
- Mounts header to the beginning of target element
- **Parameters:**
  - `selector` (string): CSS selector for target element (default: `'body'`)
- **Returns:** void

**destroy()**
- Removes header from DOM and cleans up event listeners
- **Returns:** void

**openMobileMenu()**
- Opens mobile menu overlay
- **Returns:** void

**closeMobileMenu()**
- Closes mobile menu overlay
- **Returns:** void

#### Usage Example

```javascript
import { MarketingHeader } from './components/marketing-header.js';

// Initialize with current page
const header = new MarketingHeader({ currentPage: 'pricing' });
header.mount('body');

// Clean up
header.destroy();
```

#### Features

- Sticky header with scroll shadow effect
- Mobile-responsive hamburger menu
- Active link highlighting
- Smooth mobile menu transitions
- Escape key to close mobile menu
- Body scroll lock when mobile menu is open

#### Events

The header automatically tracks analytics events:
- `mobile_menu_open` when mobile menu is opened

#### Styling

CSS classes:
- `.st-marketing-header` - Main header container
- `.st-marketing-header.scrolled` - Applied when scrolled
- `.st-marketing-nav-link` - Navigation links
- `.st-marketing-nav-link.active` - Active page link
- `.st-marketing-mobile-menu` - Mobile menu overlay
- `.st-marketing-mobile-menu.open` - Mobile menu visible

---

### MarketingFooter

**File:** `/marketing/components/marketing-footer.js`

Full-featured footer with sitemap, social links, and compliance info.

#### Constructor

```javascript
new MarketingFooter(options)
```

**Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `year` | `number` | Current year | Copyright year |

#### Methods

**mount(selector)**
- Mounts footer to the end of target element
- **Parameters:**
  - `selector` (string): CSS selector for target element (default: `'body'`)
- **Returns:** void

**destroy()**
- Removes footer from DOM and cleans up event listeners
- **Returns:** void

#### Usage Example

```javascript
import { MarketingFooter } from './components/marketing-footer.js';

// Initialize with default year
const footer = new MarketingFooter();
footer.mount('body');

// Initialize with custom year
const footer = new MarketingFooter({ year: 2024 });
footer.mount('body');
```

#### Features

- 5-column footer grid
- Social media links with icons
- Automatic copyright year
- Link tracking with analytics

#### Events

Automatically tracks analytics events:
- `footer_link_click` for all footer links
- `social_link_click` for social media links

#### Styling

CSS classes:
- `.st-marketing-footer` - Main footer container
- `.st-marketing-footer-grid` - Footer columns grid
- `.st-marketing-footer-section` - Footer column
- `.st-marketing-footer-link` - Footer links
- `.st-marketing-footer-social-link` - Social links

---

### ProofStrip

**File:** `/marketing/components/proof-strip.js`

Displays customer logos or organization names for social proof.

#### Constructor

```javascript
new ProofStrip(options)
```

**Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | `string` | `'Trusted by leading organizations'` | Label text above logos |
| `logos` | `Array<Object>` | Default logos | Array of logo objects |

**Logo Object Structure:**

```javascript
{
  name: string,  // Organization name (displayed as placeholder)
  alt: string    // Alt text for accessibility
}
```

#### Methods

**mount(selector)**
- Mounts proof strip to target element
- **Parameters:**
  - `selector` (string): CSS selector for target element
- **Returns:** void

**updateLogos(newLogos)**
- Dynamically updates logo array and re-renders
- **Parameters:**
  - `newLogos` (Array<Object>): New array of logo objects
- **Returns:** void

**destroy()**
- Removes proof strip from DOM
- **Returns:** void

#### Usage Example

```javascript
import { ProofStrip } from './components/proof-strip.js';

// Initialize with default logos
const proofStrip = new ProofStrip({
  label: 'Trusted by leading organizations nationwide'
});
proofStrip.mount('#proof-strip-container');

// Update logos dynamically
proofStrip.updateLogos([
  { name: 'Harvard University', alt: 'Harvard University' },
  { name: 'Google', alt: 'Google' },
  { name: 'First Baptist Church', alt: 'First Baptist Church' }
]);
```

#### Features

- Responsive logo grid
- Placeholder logo cards (customizable with real logos)
- Horizontal scrolling on mobile

#### Styling

CSS classes:
- `.st-marketing-proof-strip` - Main container
- `.st-marketing-proof-strip-label` - Label text
- `.st-marketing-proof-strip-logos` - Logo grid
- `.st-marketing-proof-strip-logo` - Individual logo card

---

### Analytics

**File:** `/marketing/components/analytics.js`

Centralized analytics tracking utility for Google Analytics 4.

#### Static Methods

All methods are static - no instance creation needed.

**init(pageName)**
- Initializes analytics tracking for a page
- Auto-tracks CTA button clicks
- **Parameters:**
  - `pageName` (string): Page identifier
- **Returns:** void

**trackPageView(pagePath, pageTitle)**
- Tracks a page view
- **Parameters:**
  - `pagePath` (string): Page URL path
  - `pageTitle` (string): Page title
- **Returns:** void

**trackCTAClick(ctaText, ctaLocation, ctaDestination)**
- Tracks a call-to-action button click
- **Parameters:**
  - `ctaText` (string): Button text
  - `ctaLocation` (string): Page where CTA was clicked
  - `ctaDestination` (string): Target URL or action
- **Returns:** void

**trackFormSubmit(formName, formLocation)**
- Tracks form submission
- **Parameters:**
  - `formName` (string): Form identifier
  - `formLocation` (string): Page where form was submitted
- **Returns:** void

**trackResourceDownload(resourceName, resourceType)**
- Tracks resource download
- **Parameters:**
  - `resourceName` (string): Resource name
  - `resourceType` (string): Resource file type (PDF, DOC, etc.)
- **Returns:** void

**trackPricingTierSelect(tierName, tierPrice)**
- Tracks pricing tier selection
- **Parameters:**
  - `tierName` (string): Tier name
  - `tierPrice` (number): Tier price
- **Returns:** void

**trackCalculatorUse(calculatorType, calculatorResult)**
- Tracks calculator interaction
- **Parameters:**
  - `calculatorType` (string): Calculator identifier
  - `calculatorResult` (object): Calculator output data
- **Returns:** void

**trackVideoPlay(videoTitle, videoLocation)**
- Tracks video play event
- **Parameters:**
  - `videoTitle` (string): Video title
  - `videoLocation` (string): Page where video was played
- **Returns:** void

**trackSegmentSelect(segmentName)**
- Tracks solution segment selection
- **Parameters:**
  - `segmentName` (string): Segment identifier (k12, higher-ed, etc.)
- **Returns:** void

**trackAddonSelect(addonName, addonPrice)**
- Tracks add-on selection in quote form
- **Parameters:**
  - `addonName` (string): Add-on name
  - `addonPrice` (number): Add-on price
- **Returns:** void

**trackQuoteRequest(tripTier, addons)**
- Tracks quote request submission
- **Parameters:**
  - `tripTier` (string): Selected trip tier
  - `addons` (Array<string>): Array of selected add-on names
- **Returns:** void

**trackLeadCapture(resourceName, leadEmail)**
- Tracks lead capture (gated resource)
- **Parameters:**
  - `resourceName` (string): Resource name
  - `leadEmail` (string): Lead email (NOT sent to GA)
- **Returns:** void

**trackExternalLink(linkUrl, linkText)**
- Tracks external link click
- **Parameters:**
  - `linkUrl` (string): External URL
  - `linkText` (string): Link text
- **Returns:** void

#### Usage Example

```javascript
import { Analytics } from './components/analytics.js';

// Initialize analytics for page
Analytics.init('pricing');

// Track custom events
Analytics.trackCTAClick('Get Started', 'pricing', '/request-quote');
Analytics.trackFormSubmit('contact-form', 'about');
Analytics.trackResourceDownload('Trip Planning Checklist', 'PDF');
Analytics.trackPricingTierSelect('Multi-Day Domestic', 750);
```

#### Features

- Automatic CTA tracking on page init
- Console logging for debugging (in all environments)
- Graceful degradation if GA4 not loaded
- Privacy-conscious (no PII sent to analytics)

#### Event Categories

- **conversion**: CTA clicks, form submissions, tier selections, quote requests
- **engagement**: Video plays, calculator use, segment selections, external links
- **content**: Resource downloads, lead captures

---

## Form Components

### LeadCapture

**File:** `/marketing/components/lead-capture.js`

Modal dialog with lead capture form for gated resources.

#### Constructor

```javascript
new LeadCapture(options)
```

**Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `resourceName` | `string` | `'Resource'` | Name of gated resource |
| `resourceType` | `string` | `'PDF'` | Resource file type |
| `resourceUrl` | `string` | `'#'` | Download URL for resource |
| `onSuccess` | `function` | `null` | Callback after form submission |

#### Methods

**show()**
- Shows the lead capture modal
- **Returns:** void

**hide()**
- Hides and removes the modal
- **Returns:** void

**destroy()**
- Cleans up event listeners and removes modal
- **Returns:** void

**Static: LeadCapture.show(options)**
- Quick static method to show modal without instance creation
- **Parameters:**
  - `options` (object): Constructor options
- **Returns:** LeadCapture instance

#### Usage Example

```javascript
import { LeadCapture } from './components/lead-capture.js';

// Method 1: Instance
const leadCapture = new LeadCapture({
  resourceName: 'Trip Planning Checklist',
  resourceType: 'PDF',
  resourceUrl: '/assets/resources/trip-planning-checklist.pdf',
  onSuccess: (data) => {
    console.log('Lead captured:', data);
  }
});
leadCapture.show();

// Method 2: Static
LeadCapture.show({
  resourceName: 'Sample Trip Packet',
  resourceType: 'PDF',
  resourceUrl: '/assets/resources/sample-packet.pdf'
});
```

#### Features

- Multi-field form with validation
- Real-time validation on blur
- Email and phone validation
- Required fields marked with asterisk
- Success state with download link
- Privacy note with link to privacy policy
- Analytics tracking for lead capture and download
- Escape key to close
- Click outside to close
- Body scroll lock when open

#### Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| First Name | text | Yes | Non-empty |
| Last Name | text | Yes | Non-empty |
| Email | email | Yes | Valid email format |
| Organization | text | Yes | Non-empty |
| Organization Type | select | Yes | Must select option |
| Role / Title | text | No | - |
| Consent | checkbox | Yes | Must be checked |

#### Events

Tracks analytics events:
- `lead_capture` when form is submitted
- `resource_download` when download is triggered

#### Styling

CSS classes:
- `.st-lead-capture-modal` - Modal overlay
- `.st-lead-capture-modal.active` - Modal visible
- `.st-lead-capture-content` - Modal content
- `.st-lead-capture-form` - Form container
- `.st-lead-capture-form-group` - Form field wrapper
- `.st-lead-capture-input` - Input fields
- `.st-lead-capture-input.error` - Error state
- `.st-lead-capture-error` - Error message
- `.st-lead-capture-success` - Success state

---

### QuoteForm

**File:** `/marketing/components/quote-form.js`

Multi-step quote request form with validation and order summary.

#### Constructor

```javascript
new QuoteForm(options)
```

**Options:**

Currently no options - configuration is internal.

#### Methods

**mount(selector)**
- Mounts form to target element
- **Parameters:**
  - `selector` (string): CSS selector or DOM element
- **Returns:** void

**nextStep()**
- Advances to next step (with validation)
- **Returns:** void

**prevStep()**
- Returns to previous step
- **Returns:** void

**submitForm()**
- Submits form (final step)
- **Returns:** Promise<void>

#### Usage Example

```javascript
import { QuoteForm } from './components/quote-form.js';

// Initialize and mount
const quoteForm = new QuoteForm();
quoteForm.mount('#quote-form-container');
```

#### Features

- 4-step wizard with progress indicator
- Step 1: Trip details & tier selection
- Step 2: Add-on selection
- Step 3: Organization information
- Step 4: Payment option
- Real-time validation
- Order summary sidebar
- Confirmation page with next steps
- Analytics tracking for each step

#### Form Steps

**Step 1: Trip Details**
- Tier selection (3 tiers with pricing)
- Trip type dropdown
- Destination input
- Departure date
- Return date
- Participant count

**Step 2: Add-ons**
- Background checks ($150)
- Parent communications ($100)
- Incident debrief ($200)
- Live trip tracking ($125)
- Rush service ($300)

**Step 3: Organization Info**
- Organization type
- Organization name
- Contact name
- Contact email
- Contact phone (optional)

**Step 4: Payment Option**
- Pay now (Stripe integration placeholder)
- Request invoice/PO
- Generate PDF quote

#### Pricing

**Trip Tiers:**
- Domestic Day/Overnight: $450
- Multi-Day Domestic: $750
- International/Complex: $1,250

**Add-ons:** See step 2 above

#### Validation

Each step validates before advancing:
- Required fields must be filled
- Dates must be valid (return after departure)
- Email must be valid format
- Phone must be valid format (if provided)

#### Events

Tracks analytics events:
- `quote_form_step_1` through `quote_form_step_4` on step completion
- `pricing_tier_select` when tier is selected
- `addon_select` when add-on is toggled
- `quote_request` on final submission

#### Styling

CSS classes:
- `.st-quote-form-container` - Main container
- `.st-quote-progress` - Progress indicator
- `.st-quote-step` - Step content
- `.st-quote-tier-card` - Tier selection card
- `.st-quote-tier-card.selected` - Selected tier
- `.st-quote-addon-card` - Add-on card
- `.st-quote-addon-card.selected` - Selected add-on
- `.st-quote-payment-card` - Payment option card
- `.st-quote-summary-sidebar` - Order summary
- `.st-quote-confirmation` - Success page

---

## Interactive Components

### TripVolumeCalculator

**File:** `/marketing/components/calculators.js`

Interactive calculator for estimating annual spend based on trip volume and tier distribution.

#### Constructor

```javascript
new TripVolumeCalculator(config)
```

**Config:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `mountSelector` | `string` | `'#trip-volume-calculator'` | CSS selector for mount point |

#### Methods

**mount(selector)**
- Mounts calculator to target element
- **Parameters:**
  - `selector` (string): CSS selector
- **Returns:** void

**updateState(updates)**
- Updates calculator state and re-renders
- **Parameters:**
  - `updates` (object): State properties to update
- **Returns:** void

**calculateSpend()**
- Calculates total annual spend
- **Returns:** object with breakdown

**render()**
- Re-renders calculator
- **Returns:** void

#### State Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `tripsPerYear` | `number` | `10` | Number of trips per year |
| `tier1Percentage` | `number` | `60` | Percentage of Tier 1 trips (0-100) |
| `tier2Percentage` | `number` | `30` | Percentage of Tier 2 trips (0-100) |
| `tier3Percentage` | `number` | `10` | Percentage of Tier 3 trips (0-100) |

#### Usage Example

```javascript
import { TripVolumeCalculator } from './components/calculators.js';

// Initialize and mount
const calculator = new TripVolumeCalculator({
  mountSelector: '#trip-volume-calculator'
});
calculator.mount('#trip-volume-calculator');

// Programmatically update state
calculator.updateState({
  tripsPerYear: 25,
  tier1Percentage: 50,
  tier2Percentage: 40,
  tier3Percentage: 10
});
```

#### Features

- Slider inputs for trips per year (1-100)
- Number input for trips per year (1-500)
- Tier distribution sliders (0-100%)
- Real-time calculation
- Breakdown by tier
- Total annual spend
- Average cost per trip

#### Calculation Output

```javascript
{
  tier1Count: number,      // Number of Tier 1 trips
  tier2Count: number,      // Number of Tier 2 trips
  tier3Count: number,      // Number of Tier 3 trips
  tier1Cost: number,       // Total cost for Tier 1
  tier2Cost: number,       // Total cost for Tier 2
  tier3Cost: number,       // Total cost for Tier 3
  totalCost: number,       // Total annual cost
  avgCostPerTrip: number   // Average per trip
}
```

#### Events

Tracks analytics event:
- `calculator_use` with type `trip_volume` on state update

#### Styling

CSS classes:
- `.st-calculator-card` - Main calculator card
- `.st-calculator-slider` - Range slider input
- `.st-calculator-number-input` - Number input
- `.st-calculator-results` - Results section
- `.st-calculator-result-row` - Result line item
- `.st-calculator-total-amount` - Total amount highlight

---

### ROIEstimator

**File:** `/marketing/components/calculators.js`

Interactive calculator for estimating ROI from time savings and cost avoidance.

#### Constructor

```javascript
new ROIEstimator(config)
```

**Config:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `mountSelector` | `string` | `'#roi-estimator'` | CSS selector for mount point |

#### Methods

**mount(selector)**
- Mounts calculator to target element
- **Parameters:**
  - `selector` (string): CSS selector
- **Returns:** void

**updateState(updates)**
- Updates calculator state and re-renders
- **Parameters:**
  - `updates` (object): State properties to update
- **Returns:** void

**calculateROI()**
- Calculates ROI metrics
- **Returns:** object with metrics

**render()**
- Re-renders calculator
- **Returns:** void

#### State Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `orgSize` | `string` | `'medium'` | Organization size (small, medium, large) |
| `tripsPerYear` | `number` | `15` | Number of trips per year |
| `currentHoursPerTrip` | `number` | `20` | Hours currently spent per trip |
| `staffHourlyRate` | `number` | `50` | Staff hourly rate (loaded cost) |

#### Usage Example

```javascript
import { ROIEstimator } from './components/calculators.js';

// Initialize and mount
const roiEstimator = new ROIEstimator({
  mountSelector: '#roi-estimator'
});
roiEstimator.mount('#roi-estimator');

// Update state
roiEstimator.updateState({
  orgSize: 'large',
  tripsPerYear: 50
});
```

#### Features

- Organization size selector (small, medium, large)
- Slider inputs for all variables
- Real-time calculation
- Time savings metrics
- Cost savings breakdown
- ROI percentage
- Weeks of work saved

#### Calculation Output

```javascript
{
  hoursSavedPerTrip: number,        // Hours saved per trip
  totalHoursSavedPerYear: number,   // Total hours saved annually
  staffTimeSavings: number,         // Dollar value of time saved
  riskAvoidanceSavings: number,     // Estimated risk avoidance value
  totalSavings: number,             // Total annual savings
  estimatedSafeTrekrCost: number,   // Estimated annual SafeTrekr cost
  netSavings: number,               // Net benefit (savings - cost)
  roi: number,                      // ROI percentage
  weeksOfWorkSaved: number          // Equivalent weeks of work
}
```

#### Assumptions

- **Time Savings:** 50% average reduction in trip planning time
- **Risk Avoidance:** $5,000 average cost of preventable incident
- **Risk Reduction:** 15% reduction in incidents with professional review

#### Events

Tracks analytics event:
- `calculator_use` with type `roi_estimator` on state update

#### Styling

CSS classes:
- `.st-calculator-card` - Main calculator card
- `.st-calculator-button-group` - Organization size buttons
- `.st-calculator-button` - Size button
- `.st-calculator-button.active` - Active size
- `.st-calculator-roi-metrics` - Metrics grid
- `.st-calculator-roi-metric` - Individual metric card
- `.st-calculator-roi-summary` - ROI summary section
- `.st-calculator-roi-positive` - Positive ROI styling

---

## Development Guidelines

### Adding New Components

1. Create component file in `/marketing/components/`
2. Follow ES6 module pattern
3. Export as named or default export
4. Add to `/marketing/components/index.js`
5. Document in this file

### Component Pattern

```javascript
/**
 * Component description
 */
export class ComponentName {
  constructor(options = {}) {
    // Initialize state
    this.option1 = options.option1 || 'default';
    this.container = null;
  }

  /**
   * Render component HTML
   */
  render() {
    return `
      <div class="component">
        <!-- HTML -->
      </div>
    `;
  }

  /**
   * Mount component to DOM
   */
  mount(selector) {
    const target = document.querySelector(selector);
    if (!target) {
      console.error(`Component: Target "${selector}" not found`);
      return;
    }

    target.insertAdjacentHTML('beforeend', this.render());
    this.container = target.querySelector('.component');
    this.attachEventListeners();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Event handlers
  }

  /**
   * Cleanup
   */
  destroy() {
    this.container?.remove();
  }
}

export default ComponentName;
```

### Best Practices

- Use ES6 classes for components
- Accept options object in constructor
- Provide sensible defaults
- Use `mount()` pattern for DOM insertion
- Clean up in `destroy()` method
- Track analytics events when appropriate
- Add JSDoc comments
- Use semantic HTML
- Follow BEM-style CSS naming

---

## Browser Compatibility

All components use modern JavaScript features supported by:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

No polyfills required for target browsers.

---

## Testing

### Manual Testing

Test each component in isolation:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="../src/styles/main.css">
  <link rel="stylesheet" href="./styles/marketing.css">
</head>
<body>
  <div id="test-container"></div>

  <script type="module">
    import { ComponentName } from './components/component-name.js';

    const component = new ComponentName({ option: 'value' });
    component.mount('#test-container');
  </script>
</body>
</html>
```

### Component Checklist

- [ ] Mounts successfully
- [ ] Renders correctly
- [ ] Responds to user interactions
- [ ] Cleans up on destroy
- [ ] Works on mobile
- [ ] Tracks analytics (if applicable)
- [ ] Accessible (keyboard nav, ARIA labels)

---

## Support

For questions or issues with components:
- Check this documentation
- Review component source code
- Check browser console for errors
- Open GitHub issue if bug found

---

**Documentation maintained by SafeTrekr Team**
