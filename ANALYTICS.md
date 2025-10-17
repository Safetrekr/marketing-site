# Marketing Analytics Documentation

Complete guide to analytics tracking and Google Analytics 4 integration for the Safetrekr marketing website.

---

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Event Tracking](#event-tracking)
- [Event Reference](#event-reference)
- [Custom Dimensions](#custom-dimensions)
- [Conversion Tracking](#conversion-tracking)
- [Testing & Debugging](#testing--debugging)
- [Reports & Dashboards](#reports--dashboards)

---

## Overview

The Safetrekr marketing site uses **Google Analytics 4 (GA4)** for comprehensive event tracking and conversion measurement. All tracking is centralized in the `Analytics` component for consistency and maintainability.

### Key Features

- Automatic CTA tracking on all pages
- Form submission tracking
- Lead capture tracking
- Resource download tracking
- Pricing calculator tracking
- Quote request funnel tracking
- External link tracking
- Privacy-conscious (no PII sent to GA)

### Privacy & Compliance

- **No PII Sent**: Email addresses and names are NOT sent to Google Analytics
- **Consent Required**: Implement cookie consent banner before enabling GA (not included)
- **GDPR Compliant**: Anonymized IP addresses, no user-level tracking without consent
- **COPPA Compliant**: Safe for K-12 schools (no child data collected)

---

## Setup

### Step 1: Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create new GA4 property
3. Note your Measurement ID (format: `G-XXXXXXXXXX`)

### Step 2: Add GA4 Script to All Pages

Add to `<head>` section of every HTML page:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  // Configure GA4
  gtag('config', 'G-XXXXXXXXXX', {
    'send_page_view': false,  // We'll track page views manually
    'anonymize_ip': true,     // GDPR compliance
    'allow_ad_personalization_signals': false  // Privacy-first
  });
</script>
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

### Step 3: Initialize Analytics on Each Page

Add to page JavaScript:

```javascript
import { Analytics } from './components/analytics.js';

// Initialize analytics for this page
Analytics.init('page-name');
```

The `init()` method:
- Tracks initial page view
- Sets up automatic CTA tracking
- Logs to console for debugging

### Step 4: Verify Installation

1. Open page in browser
2. Open browser DevTools → Console
3. Look for: `Analytics: Initialized for page "page-name"`
4. Click a CTA button
5. Look for: `Analytics: CTA Click { ctaText, ctaLocation, ctaDestination }`

---

## Event Tracking

### Automatic Tracking

The Analytics component automatically tracks:

**CTA Buttons**
- Any element with class `.st-marketing-cta-primary`, `.st-marketing-cta-secondary`, or `.st-marketing-cta-tertiary`
- Tracked on click
- Captures button text, page location, and destination URL

**Page Views**
- Tracked on `Analytics.init()`
- Captures page path and title

### Manual Tracking

For custom events, call Analytics methods directly:

```javascript
import { Analytics } from './components/analytics.js';

// Track custom CTA (not using standard classes)
element.addEventListener('click', () => {
  Analytics.trackCTAClick('Custom Button', 'page-name', '/destination');
});

// Track form submission
form.addEventListener('submit', () => {
  Analytics.trackFormSubmit('newsletter-form', 'home');
});

// Track resource download
downloadBtn.addEventListener('click', () => {
  Analytics.trackResourceDownload('Trip Planning Checklist', 'PDF');
});
```

---

## Event Reference

### Core Events

#### trackPageView(pagePath, pageTitle)

Tracks a page view.

**When to use:** Automatically called by `Analytics.init()`, or manually for SPAs

**Parameters:**
- `pagePath` (string): URL path (e.g., `/marketing/pricing.html`)
- `pageTitle` (string): Page title

**GA4 Event:** `page_view`

**Example:**
```javascript
Analytics.trackPageView('/marketing/pricing.html', 'Pricing - Safetrekr');
```

---

#### trackCTAClick(ctaText, ctaLocation, ctaDestination)

Tracks call-to-action button clicks.

**When to use:** Automatically tracked for CTA buttons, or manually for custom CTAs

**Parameters:**
- `ctaText` (string): Button text (e.g., "Request Quote")
- `ctaLocation` (string): Page identifier (e.g., "pricing")
- `ctaDestination` (string): Target URL or action

**GA4 Event:** `cta_click`

**Event Parameters:**
- `event_category`: `'conversion'`
- `event_label`: Button text
- `cta_location`: Page identifier
- `cta_destination`: Target URL

**Example:**
```javascript
Analytics.trackCTAClick('Request a Quote', 'pricing', './request-quote.html');
```

---

#### trackFormSubmit(formName, formLocation)

Tracks form submissions.

**When to use:** On successful form submission (after validation)

**Parameters:**
- `formName` (string): Form identifier (e.g., "contact-form")
- `formLocation` (string): Page identifier

**GA4 Event:** `form_submit`

**Event Parameters:**
- `event_category`: `'conversion'`
- `event_label`: Form name
- `form_location`: Page identifier

**Example:**
```javascript
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (isValid()) {
    Analytics.trackFormSubmit('contact-form', 'about');
    // Submit form...
  }
});
```

---

#### trackResourceDownload(resourceName, resourceType)

Tracks gated resource downloads.

**When to use:** After lead capture, when download is triggered

**Parameters:**
- `resourceName` (string): Resource name (e.g., "Trip Planning Checklist")
- `resourceType` (string): File type (e.g., "PDF", "DOC")

**GA4 Event:** `resource_download`

**Event Parameters:**
- `event_category`: `'engagement'`
- `event_label`: Resource name
- `resource_type`: File type

**Example:**
```javascript
Analytics.trackResourceDownload('Sample Trip Packet', 'PDF');
```

---

#### trackPricingTierSelect(tierName, tierPrice)

Tracks pricing tier selection in quote form.

**When to use:** When user selects a pricing tier

**Parameters:**
- `tierName` (string): Tier name (e.g., "Multi-Day Domestic")
- `tierPrice` (number): Tier price

**GA4 Event:** `pricing_tier_select`

**Event Parameters:**
- `event_category`: `'conversion'`
- `event_label`: Tier name
- `tier_price`: Price

**Example:**
```javascript
Analytics.trackPricingTierSelect('International/Complex', 1250);
```

---

#### trackCalculatorUse(calculatorType, calculatorResult)

Tracks interactive calculator usage.

**When to use:** When user interacts with pricing calculators

**Parameters:**
- `calculatorType` (string): Calculator identifier (e.g., "trip_volume", "roi_estimator")
- `calculatorResult` (object): Calculator output data

**GA4 Event:** `calculator_use`

**Event Parameters:**
- `event_category`: `'engagement'`
- `event_label`: Calculator type
- `calculator_result`: Stringified result object

**Example:**
```javascript
Analytics.trackCalculatorUse('trip_volume', {
  trips_per_year: 25,
  total_annual_spend: 18750
});
```

---

#### trackVideoPlay(videoTitle, videoLocation)

Tracks video play events.

**When to use:** When user plays a video

**Parameters:**
- `videoTitle` (string): Video title
- `videoLocation` (string): Page identifier

**GA4 Event:** `video_play`

**Event Parameters:**
- `event_category`: `'engagement'`
- `event_label`: Video title
- `video_location`: Page identifier

**Example:**
```javascript
videoElement.addEventListener('play', () => {
  Analytics.trackVideoPlay('How Safetrekr Works', 'home');
});
```

---

#### trackSegmentSelect(segmentName)

Tracks solution segment selection.

**When to use:** When user selects an industry segment

**Parameters:**
- `segmentName` (string): Segment identifier (e.g., "k12", "higher-ed")

**GA4 Event:** `segment_select`

**Event Parameters:**
- `event_category`: `'engagement'`
- `event_label`: Segment name

**Example:**
```javascript
Analytics.trackSegmentSelect('k12');
```

---

#### trackAddonSelect(addonName, addonPrice)

Tracks add-on selection in quote form.

**When to use:** When user selects/deselects an add-on

**Parameters:**
- `addonName` (string): Add-on name (e.g., "Background Checks")
- `addonPrice` (number): Add-on price

**GA4 Event:** `addon_select`

**Event Parameters:**
- `event_category`: `'conversion'`
- `event_label`: Add-on name
- `addon_price`: Price

**Example:**
```javascript
Analytics.trackAddonSelect('Background Checks', 150);
```

---

#### trackQuoteRequest(tripTier, addons)

Tracks quote request submission.

**When to use:** On final quote form submission

**Parameters:**
- `tripTier` (string): Selected trip tier
- `addons` (Array<string>): Array of selected add-on names

**GA4 Event:** `quote_request`

**Event Parameters:**
- `event_category`: `'conversion'`
- `trip_tier`: Tier name
- `addons`: Comma-separated add-on names

**Example:**
```javascript
Analytics.trackQuoteRequest('Multi-Day Domestic', [
  'Background Checks',
  'Parent Communications'
]);
```

---

#### trackLeadCapture(resourceName, leadEmail)

Tracks lead capture form submission.

**When to use:** After lead capture form is successfully submitted

**Parameters:**
- `resourceName` (string): Resource being downloaded
- `leadEmail` (string): Lead email (NOT sent to GA)

**GA4 Event:** `lead_capture`

**Event Parameters:**
- `event_category`: `'conversion'`
- `event_label`: Resource name
- `lead_captured`: `true` (boolean, no PII sent)

**Example:**
```javascript
Analytics.trackLeadCapture('Board Approval Template', 'user@example.com');
// Note: Email is NOT sent to Google Analytics
```

---

#### trackExternalLink(linkUrl, linkText)

Tracks external link clicks.

**When to use:** When user clicks link to external domain

**Parameters:**
- `linkUrl` (string): External URL
- `linkText` (string): Link text

**GA4 Event:** `external_link_click`

**Event Parameters:**
- `event_category`: `'engagement'`
- `event_label`: Link text
- `link_url`: External URL

**Example:**
```javascript
externalLink.addEventListener('click', (e) => {
  Analytics.trackExternalLink(e.target.href, e.target.textContent);
});
```

---

## Custom Dimensions

### Recommended Custom Dimensions

Create these custom dimensions in GA4 for enhanced reporting:

| Dimension Name | Scope | Parameter Name | Description |
|----------------|-------|----------------|-------------|
| CTA Location | Event | `cta_location` | Page where CTA was clicked |
| CTA Destination | Event | `cta_destination` | Target URL of CTA |
| Form Location | Event | `form_location` | Page where form was submitted |
| Resource Type | Event | `resource_type` | Type of downloaded resource |
| Calculator Type | Event | `calculator_type` | Type of calculator used |
| Trip Tier | Event | `trip_tier` | Selected trip tier |
| Organization Size | User | `org_size` | Organization size (from ROI calculator) |

### Creating Custom Dimensions

1. Go to GA4 Admin → Data display → Custom definitions
2. Click "Create custom dimension"
3. Enter dimension name and parameter name
4. Select scope (Event or User)
5. Save

---

## Conversion Tracking

### Conversion Events

Mark these events as conversions in GA4:

1. **quote_request** - Primary conversion goal
2. **lead_capture** - Secondary conversion goal
3. **cta_click** (with destination = request-quote) - Micro-conversion
4. **form_submit** (contact forms) - Micro-conversion

### Marking Events as Conversions

1. Go to GA4 Admin → Events
2. Find event in list
3. Toggle "Mark as conversion"

### Conversion Funnel

Track the quote request funnel:

1. **Page View** - Pricing page
2. **CTA Click** - "Request Quote" button
3. **Form Start** - Step 1 of quote form
4. **Form Progress** - Steps 2-3 completed
5. **Conversion** - Quote request submitted

Implementation:

```javascript
// Step 1: Automatic (page view tracking)

// Step 2: Automatic (CTA tracking)

// Step 3-4: Track each step
Analytics.trackFormSubmit('quote_form_step_1', 'request-quote');
Analytics.trackFormSubmit('quote_form_step_2', 'request-quote');
Analytics.trackFormSubmit('quote_form_step_3', 'request-quote');

// Step 5: Final conversion
Analytics.trackQuoteRequest(tierName, addons);
```

---

## Testing & Debugging

### Enable Debug Mode

Add to GA4 config:

```javascript
gtag('config', 'G-XXXXXXXXXX', {
  'debug_mode': true
});
```

### GA4 DebugView

1. Enable debug mode (above)
2. Go to GA4 → Configure → DebugView
3. Open your site in browser
4. Interact with site
5. See events appear in real-time in DebugView

### Console Logging

The Analytics component logs all events to console:

```
Analytics: Initialized for page "pricing"
Analytics: CTA Click { ctaText: "Request Quote", ctaLocation: "pricing", ctaDestination: "./request-quote.html" }
Analytics: Form Submit { formName: "quote_form_step_1", formLocation: "request-quote" }
```

### Browser Extensions

**Recommended:**
- **GA4 Event Tracker** - Chrome extension to visualize events
- **Google Analytics Debugger** - Chrome extension for debug info
- **Tag Assistant** - Chrome extension by Google

### Testing Checklist

- [ ] GA4 script loads without errors
- [ ] Page views tracked on each page
- [ ] CTA clicks tracked with correct parameters
- [ ] Form submissions tracked
- [ ] Lead captures tracked (without PII)
- [ ] Calculator interactions tracked
- [ ] Events appear in DebugView
- [ ] Conversion events marked correctly

---

## Reports & Dashboards

### Standard Reports

**Acquisition Reports**
- Traffic sources to marketing site
- Campaign performance (UTM tracking)

**Engagement Reports**
- Most viewed pages
- Most clicked CTAs
- Average engagement time
- Bounce rate by page

**Conversion Reports**
- Quote requests by source
- Lead captures by resource
- Conversion rate by segment
- Form abandonment rate

### Custom Explorations

**Quote Funnel Analysis**
```
1. Pricing page views
2. Request quote CTA clicks
3. Quote form step 1 completions
4. Quote form step 2 completions
5. Quote form step 3 completions
6. Quote form step 4 completions
7. Quote requests submitted
```

**Resource Performance**
```
Dimension: Resource name (event_label from resource_download)
Metrics: Downloads, unique users, conversion rate
```

**Calculator ROI**
```
Dimension: Calculator type
Metrics: Uses, unique users, quote requests within session
```

### Recommended Dashboards

**Marketing Overview Dashboard**
- Total page views
- Top pages
- Top CTAs clicked
- Quote requests (this month vs last month)
- Lead captures (this month vs last month)
- Conversion rate

**Content Performance Dashboard**
- Page views by page
- Engagement time by page
- Bounce rate by page
- Exit rate by page
- Top performing CTAs

**Conversion Funnel Dashboard**
- Pricing page → Quote request funnel
- Drop-off at each step
- Conversion rate by traffic source
- Quote requests by trip tier
- Add-on selection rate

---

## UTM Campaign Tracking

### UTM Parameters

Use UTM parameters for campaign tracking:

```
https://safetrekr.com/marketing/?utm_source=email&utm_medium=newsletter&utm_campaign=spring_2025
```

**Parameters:**
- `utm_source`: Traffic source (e.g., email, social, google)
- `utm_medium`: Marketing medium (e.g., newsletter, cpc, banner)
- `utm_campaign`: Campaign name (e.g., spring_2025, product_launch)
- `utm_content`: Content variant (e.g., button_red, button_blue)
- `utm_term`: Paid search keyword (e.g., trip_safety_software)

### Campaign URL Builder

Use Google's Campaign URL Builder:
https://ga-dev-tools.google/campaign-url-builder/

### Example Campaigns

**Email Newsletter:**
```
?utm_source=email&utm_medium=newsletter&utm_campaign=monthly_update
```

**Facebook Ad:**
```
?utm_source=facebook&utm_medium=social&utm_campaign=k12_retargeting
```

**Google Search Ad:**
```
?utm_source=google&utm_medium=cpc&utm_campaign=trip_safety&utm_term=school_trip_management
```

---

## Advanced Tracking

### Event Sequencing

Track multi-step user journeys:

```javascript
// Step 1: User views pricing calculator
Analytics.trackCalculatorUse('trip_volume', result);

// Step 2: User clicks CTA
Analytics.trackCTAClick('Request Quote', 'pricing', './request-quote.html');

// Step 3: User completes quote form
Analytics.trackQuoteRequest(tier, addons);
```

GA4 will automatically track the sequence and time between events.

### User Properties

Set user properties for segmentation:

```javascript
// After ROI calculator use, set organization size
gtag('set', 'user_properties', {
  organization_size: 'large',
  industry_segment: 'higher-ed'
});
```

### Enhanced Measurement

Enable in GA4 Admin → Data streams → Enhanced measurement:

- Scroll tracking (auto)
- Outbound link clicks (auto)
- Site search (auto)
- Video engagement (auto)
- File downloads (auto)

---

## Privacy & Compliance

### GDPR Compliance

```javascript
// Anonymize IP addresses
gtag('config', 'G-XXXXXXXXXX', {
  'anonymize_ip': true
});

// Disable advertising features
gtag('config', 'G-XXXXXXXXXX', {
  'allow_ad_personalization_signals': false
});
```

### Cookie Consent

Implement cookie consent banner (not included):

```javascript
// Wait for consent before loading GA
if (userConsent) {
  loadGoogleAnalytics();
}

// Or use Google Consent Mode
gtag('consent', 'default', {
  'analytics_storage': 'denied'
});

// After user consents
gtag('consent', 'update', {
  'analytics_storage': 'granted'
});
```

### Data Retention

Configure in GA4 Admin → Data settings → Data retention:
- Event data retention: 14 months (recommended)
- Reset user data on new activity: Off (for accurate LTV)

---

## Troubleshooting

### Events Not Appearing

**Check:**
1. GA4 script loaded? (View page source)
2. Measurement ID correct?
3. Browser ad blocker disabled?
4. `window.gtag` defined? (Console)
5. Events in DebugView? (Enable debug mode)

### Duplicate Events

**Causes:**
- GA4 script included multiple times
- Analytics.init() called multiple times
- Event listeners attached multiple times

**Fix:**
- Check page has single GA4 script
- Call Analytics.init() once per page
- Use event delegation for dynamic elements

### Parameters Missing

**Check:**
- Parameter names match GA4 custom dimensions
- Parameters are strings or numbers (not objects)
- Parameters have values (not null/undefined)

---

## Best Practices

1. **Track What Matters**: Focus on conversion-related events
2. **Consistent Naming**: Use snake_case for event names
3. **Descriptive Labels**: Use clear, searchable event labels
4. **Test Before Deploy**: Use DebugView to verify events
5. **Document Changes**: Update this doc when adding events
6. **Privacy First**: Never send PII to Google Analytics
7. **Mobile Testing**: Test on mobile devices
8. **Page Performance**: GA4 script is async, but still impacts load time

---

## Support & Resources

### Google Analytics Resources

- [GA4 Documentation](https://support.google.com/analytics/answer/9304153)
- [GA4 Events Reference](https://support.google.com/analytics/answer/9267735)
- [GA4 Best Practices](https://support.google.com/analytics/answer/9267744)

### Safetrekr Resources

- [Component Documentation](./COMPONENTS.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Main README](./README.md)

### Getting Help

- **GA4 Setup**: dev@safetrekr.com
- **Custom Events**: Check COMPONENTS.md
- **Bug Reports**: GitHub Issues

---

**Analytics documentation maintained by Safetrekr Marketing Team**
