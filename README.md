# Safetrekr Marketing Website

**Version:** 1.0.0
**Status:** Production Ready
**Tech Stack:** Vite + HTML5 + Vanilla JavaScript + Bootstrap 5

The marketing website for Safetrekr - a comprehensive public-facing site with lead capture, pricing calculators, request quote forms, and content resources.

---

## Table of Contents

- [Overview](#overview)
- [Pages](#pages)
- [Components](#components)
- [Getting Started](#getting-started)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Adding New Pages](#adding-new-pages)
- [Customizing Styles](#customizing-styles)
- [Analytics](#analytics)
- [SEO](#seo)

---

## Overview

The Safetrekr marketing website is a 10-page marketing site built with vanilla JavaScript and designed to convert visitors into customers. It features:

- **Professional Design**: Dark theme with modern UI components
- **Lead Capture**: Gated resources with lead capture forms
- **Quote Request**: Multi-step quote request form with pricing calculator
- **Interactive Tools**: Trip volume calculator and ROI estimator
- **SEO Optimized**: Meta tags, structured data, and semantic HTML
- **Analytics Ready**: Google Analytics 4 integration with event tracking
- **Mobile Responsive**: Fully responsive design for all devices

### Key Features

- Header with sticky navigation and mobile menu
- Footer with sitemap and social links
- Lead capture modals for gated downloads
- Multi-step quote request form with payment options
- Interactive pricing calculators (trip volume & ROI)
- Proof strip component for social proof
- Analytics tracking for all CTAs and form submissions

---

## Pages

### 1. Home (`/index.html`)
**Purpose:** Main landing page introducing Safetrekr

**Sections:**
- Hero with primary CTA
- Proof strip (customer logos)
- Value propositions (3 key benefits)
- How it works preview (4 steps)
- Solutions by segment (K-12, Higher Ed, Churches, Corporate)
- Social proof / testimonial
- Pricing preview
- Final CTA

**Key CTAs:**
- Request a Quote (primary)
- See How it Works (secondary)
- Download Free Resources (tertiary)

---

### 2. How It Works (`/how-it-works.html`)
**Purpose:** Explain the Safetrekr process in detail

**Sections:**
- Hero with value prop
- 4-step process breakdown
- Timeline visualization
- FAQ section
- Integration points
- CTA to request quote

**Content:**
- Detailed walkthrough of each step
- Expected timelines and deliverables
- Screenshots/mockups of platform
- Comparison with manual process

---

### 3. Solutions (`/solutions.html`)
**Purpose:** Industry-specific solutions and use cases

**Sections:**
- Segment selector tabs (K-12, Higher Ed, Churches, Corporate, Sports)
- Segment-specific value propositions
- Use cases and workflows
- Compliance considerations
- Success stories
- CTA to request quote

**Content:**
- Industry-specific pain points
- Tailored feature highlights
- Compliance frameworks (FERPA, Clery Act, FCRA, etc.)
- Testimonials by segment

---

### 4. Pricing (`/pricing.html`)
**Purpose:** Transparent pricing with calculators

**Sections:**
- 3-tier pricing cards (Domestic Day, Multi-Day, International)
- Add-on pricing table
- Trip volume calculator
- ROI estimator
- Volume discount information
- FAQ
- CTA to request quote

**Calculators:**
- **Trip Volume Calculator**: Estimate annual spend based on trip mix
- **ROI Estimator**: Calculate time savings and cost avoidance

---

### 5. Request Quote (`/request-quote.html`)
**Purpose:** Multi-step quote request form

**Steps:**
1. Trip details (tier selection, dates, destination, participants)
2. Add-ons (background checks, parent comms, etc.)
3. Organization info (name, contact, org type)
4. Payment option (pay now, request invoice, generate PDF quote)

**Features:**
- Progress indicator
- Real-time validation
- Order summary sidebar
- Confirmation page with next steps
- Analytics tracking for each step

---

### 6. Resources (`/resources.html`)
**Purpose:** Gated resources for lead capture

**Sections:**
- Featured resources grid
- Blog articles (placeholder)
- Case studies (placeholder)
- Webinars (placeholder)
- Help center links

**Resources:**
- Trip Planning Checklist (PDF)
- Sample Trip Packet (PDF)
- Board Approval Template (DOC)
- Parent Communication Guide (PDF)
- Background Check Compliance Guide (PDF)

**Lead Capture:**
- All resources gated with lead capture modal
- Collects: name, email, organization, org type, role

---

### 7. Security (`/security.html`)
**Purpose:** Security, privacy, and compliance information

**Sections:**
- Security overview
- Certifications and compliance
- Data protection measures
- Privacy policy highlights
- Incident response
- Third-party audits
- Contact security team

**Content:**
- SOC 2 Type II (placeholder)
- GDPR compliance
- FERPA/COPPA compliance
- Data encryption (in transit & at rest)
- Background check FCRA compliance

---

### 8. About (`/about.html`)
**Purpose:** Company information and team

**Sections:**
- Company mission and story
- Team members (with photos and bios)
- Company values
- Careers (placeholder)
- Contact information
- Office locations (if applicable)

---

### 9. Integrations (`/integrations.html`)
**Purpose:** Third-party integrations and partnerships

**Sections:**
- Integration categories (Background Checks, Mass Notify, SIS, etc.)
- Integration cards with logos
- Coming soon integrations
- Custom integration options
- API documentation link
- Request integration form

---

### 10. Procurement (`/procurement.html`)
**Purpose:** Procurement and legal information for enterprises

**Sections:**
- Procurement process overview
- RFP response template
- Legal documents (MSA, DPA, SLA)
- Security questionnaire
- Insurance certificates
- W-9 and vendor forms
- Enterprise pricing
- Contact procurement team

**Documents:**
- Master Services Agreement (MSA)
- Data Processing Agreement (DPA)
- Service Level Agreement (SLA)
- Security whitepaper
- Compliance certifications

---

## Components

All components are ES6 modules located in `/marketing/components/`:

### Core Components

- **MarketingHeader**: Sticky navigation with mobile menu
- **MarketingFooter**: Site map with social links
- **ProofStrip**: Customer logo strip for social proof
- **Analytics**: Centralized analytics tracking utilities

### Form Components

- **LeadCapture**: Gated download modal with lead capture form
- **QuoteForm**: Multi-step quote request form with validation

### Interactive Components

- **TripVolumeCalculator**: Trip volume pricing calculator
- **ROIEstimator**: ROI calculator with time savings and cost avoidance

See [COMPONENTS.md](./COMPONENTS.md) for detailed component documentation.

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

This is a standalone marketing site repository. Clone and install dependencies:

```bash
git clone git@github.com:Safetrekr/marketing-site.git
cd marketing-site
npm install
```

### Development Server

Start the Vite dev server:

```bash
npm run dev
```

The server will start at **http://localhost:5176** (or next available port if 5176 is in use)

Access the marketing site at:
- **Home:** http://localhost:5176/index.html
- **Other pages:** http://localhost:5176/[page-name].html

### Hot Module Replacement (HMR)

Vite provides instant hot module replacement:
- CSS changes apply instantly without page reload
- JavaScript changes trigger automatic page refresh
- Component changes reload affected modules only

---

## Development

### Project Structure

```
marketing-site/
├── index.html                    # Home page
├── about.html                    # About page
├── how-it-works.html             # Process explanation
├── solutions.html                # Industry solutions
├── pricing.html                  # Pricing & calculators
├── request-quote.html            # Quote request form
├── resources.html                # Gated resources
├── security.html                 # Security & compliance
├── integrations.html             # Third-party integrations
├── procurement.html              # Enterprise procurement
│
├── components/                   # Reusable JavaScript components
│   ├── index.js                  # Component exports
│   ├── marketing-header.js       # Header component
│   ├── marketing-footer.js       # Footer component
│   ├── proof-strip.js            # Customer logo strip
│   ├── lead-capture.js           # Lead capture modal
│   ├── quote-form.js             # Quote request form
│   ├── calculators.js            # Pricing calculators
│   └── analytics.js              # Analytics utilities
│
├── styles/                       # Marketing-specific styles
│   ├── marketing.css             # Main marketing styles
│   └── calculators.css           # Calculator styles
│
├── assets/                       # Marketing assets
│   ├── images/                   # Images and photos
│   └── icons/                    # Custom icons
│
└── package.json                  # Dependencies and scripts
```

### Component Usage

Import and use components in your pages:

```javascript
import { MarketingHeader, MarketingFooter, Analytics } from './components/index.js';

// Initialize header
const header = new MarketingHeader({ currentPage: 'pricing' });
header.mount('body');

// Initialize footer
const footer = new MarketingFooter();
footer.mount('body');

// Initialize analytics
Analytics.init('pricing');
```

### Adding Page-Specific Code

Each HTML page can include inline JavaScript:

```html
<script type="module">
  import { MarketingHeader, Analytics } from './components/index.js';

  // Page-specific initialization
  const header = new MarketingHeader({ currentPage: 'solutions' });
  header.mount('body');

  // Track custom events
  document.querySelector('#custom-button').addEventListener('click', () => {
    Analytics.trackCTAClick('Custom Action', 'solutions', '/target-url');
  });
</script>
```

---

## Building for Production

### Build Command

```bash
npm run build
```

This will:
- Minify HTML, CSS, and JavaScript
- Optimize images and assets
- Generate source maps
- Output to `/dist` directory

### Build Output

```
dist/
├── index.html
├── about.html
├── pricing.html
├── ...
├── components/
│   └── (bundled and minified JS)
├── styles/
│   └── (minified CSS)
└── assets/
    └── (optimized images)
```

### Preview Production Build

```bash
npm run preview
```

This starts a local server to preview the production build at **http://localhost:4173**

---

## Deployment

### GitHub Repository

This standalone marketing site is hosted at:
- **Repository:** https://github.com/Safetrekr/marketing-site
- **SSH URL:** git@github.com:Safetrekr/marketing-site.git

### GitHub Pages (Recommended Setup)

The site can be deployed to GitHub Pages:

**Build & Deploy:**

```bash
# Build for production
npm run build

# Deploy to GitHub Pages (manual)
# Copy dist/ contents to gh-pages branch
```

**Automated Deploy:**

Add a GitHub Actions workflow for automatic deployment:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Custom Domain

To use a custom domain (e.g., www.safetrekr.com):

1. Add `CNAME` file to `/public` with your domain
2. Configure DNS records:
   - `A` record: GitHub Pages IP addresses
   - `CNAME` record: `your-username.github.io`
3. Update `base` in `vite.config.js` to `/`
4. Update `import.meta.env.BASE_URL` references in components

### Netlify / Vercel

For Netlify or Vercel deployment:

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Set base directory: (leave empty or use `/`)
5. Update `base` in `vite.config.js` to `/`

### Environment Variables

No environment variables required for static build. For analytics:

```bash
# Add to .env (not tracked in git)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Update analytics.js to use:

```javascript
const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || 'GA_MEASUREMENT_ID';
```

---

## Adding New Pages

### Step 1: Create HTML File

Create a new HTML file in `/marketing/`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title - Safetrekr</title>

  <!-- SEO Meta Tags -->
  <meta name="description" content="Page description">

  <!-- Stylesheets -->
  <link rel="stylesheet" href="../src/styles/main.css">
  <link rel="stylesheet" href="./styles/marketing.css">
</head>
<body class="st-marketing-page">

  <!-- Page Content -->
  <section class="st-marketing-section">
    <div class="st-marketing-container">
      <h1>Page Title</h1>
    </div>
  </section>

  <!-- JavaScript -->
  <script type="module">
    import { MarketingHeader, MarketingFooter, Analytics } from './components/index.js';

    const header = new MarketingHeader({ currentPage: 'new-page' });
    header.mount('body');

    const footer = new MarketingFooter();
    footer.mount('body');

    Analytics.init('new-page');
  </script>
</body>
</html>
```

### Step 2: Add to Vite Config (if needed)

If you have a `vite.config.js`, add your page to the `rollupOptions.input`:

```javascript
rollupOptions: {
  input: {
    // ... existing pages
    'new-page': path.resolve(__dirname, 'new-page.html'),
  }
}
```

### Step 3: Add to Navigation

Update header component (`/components/marketing-header.js`) if needed:

```javascript
<li><a href="./new-page.html" class="st-marketing-nav-link ${this.currentPage === 'new-page' ? 'active' : ''}">New Page</a></li>
```

Update footer component (`/components/marketing-footer.js`) if needed.

### Step 4: Test

```bash
npm run dev
# Visit http://localhost:5176/new-page.html
```

---

## Customizing Styles

### CSS Variables

Marketing styles use CSS custom properties defined in `/src/styles/main.css`:

```css
:root {
  /* Colors */
  --st-primary: #1e40af;
  --st-secondary: #0891b2;
  --st-accent: #f97316;

  /* Backgrounds */
  --st-bg-primary: #0f172a;
  --st-bg-secondary: #1e293b;
  --st-bg-tertiary: #334155;

  /* Text */
  --st-text-primary: #f8fafc;
  --st-text-secondary: #cbd5e1;
  --st-text-muted: #94a3b8;

  /* Spacing */
  --st-spacing-xs: 0.25rem;
  --st-spacing-sm: 0.5rem;
  --st-spacing-md: 1rem;
  --st-spacing-lg: 1.5rem;
  --st-spacing-xl: 2rem;
  --st-spacing-2xl: 3rem;
  --st-spacing-3xl: 4rem;

  /* Border Radius */
  --st-radius-sm: 0.25rem;
  --st-radius-md: 0.5rem;
  --st-radius-lg: 0.75rem;
  --st-radius-xl: 1rem;

  /* Typography */
  --st-font-size-xs: 0.75rem;
  --st-font-size-sm: 0.875rem;
  --st-font-size-base: 1rem;
  --st-font-size-lg: 1.125rem;
  --st-font-size-xl: 1.25rem;
  --st-font-size-2xl: 1.5rem;
  --st-font-size-3xl: 1.875rem;
  --st-font-size-4xl: 2.25rem;
}
```

### Marketing-Specific Styles

Marketing styles are in `/styles/marketing.css`:

- **Layout**: `.st-marketing-container`, `.st-marketing-section`
- **Typography**: `.st-marketing-hero-title`, `.st-marketing-section-title`
- **Components**: `.st-marketing-header`, `.st-marketing-footer`
- **Cards**: `.st-marketing-feature-card`, `.st-marketing-pricing-card`
- **Buttons**: `.st-marketing-cta-primary`, `.st-marketing-cta-secondary`

### Calculator Styles

Calculator-specific styles are in `/styles/calculators.css`:

- `.st-calculator-card`
- `.st-calculator-slider`
- `.st-calculator-results`

### Customization Examples

**Change primary color:**

```css
:root {
  --st-primary: #6366f1; /* Indigo */
}
```

**Customize button styles:**

```css
.st-marketing-cta-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
```

**Add custom font:**

```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
```

```css
:root {
  --st-font-family: 'Montserrat', sans-serif;
}
```

---

## Analytics

### Google Analytics 4 Setup

See [ANALYTICS.md](./ANALYTICS.md) for complete analytics documentation.

**Quick Setup:**

1. Add GA4 script to all HTML pages:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

2. Events are automatically tracked by the Analytics component

3. View events in GA4 dashboard:
   - CTA clicks
   - Form submissions
   - Resource downloads
   - Calculator interactions
   - Pricing tier selections

### Custom Event Tracking

```javascript
import { Analytics } from './components/analytics.js';

// Track custom CTA click
Analytics.trackCTAClick('Button Text', 'page-name', '/destination-url');

// Track form submission
Analytics.trackFormSubmit('form-name', 'page-name');

// Track resource download
Analytics.trackResourceDownload('Resource Name', 'PDF');

// Track pricing tier selection
Analytics.trackPricingTierSelect('Tier Name', 450);
```

---

## SEO

### Meta Tags

All pages include SEO meta tags:

```html
<!-- Basic Meta Tags -->
<title>Page Title - Safetrekr</title>
<meta name="description" content="Page description (155 characters)">
<meta name="keywords" content="trip safety, travel management, field trips">

<!-- Open Graph (Facebook) -->
<meta property="og:title" content="Page Title - Safetrekr">
<meta property="og:description" content="Page description">
<meta property="og:type" content="website">
<meta property="og:url" content="https://safetrekr.com/page">
<meta property="og:image" content="https://safetrekr.com/og-image.png">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Page Title - Safetrekr">
<meta name="twitter:description" content="Page description">
<meta name="twitter:image" content="https://safetrekr.com/twitter-image.png">
```

### Structured Data

Home page includes Organization structured data:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Safetrekr",
  "description": "Professional trip safety management platform",
  "url": "https://safetrekr.com",
  "logo": "https://safetrekr.com/logo.png"
}
```

Add more structured data as needed:
- **Product** schema for pricing pages
- **FAQ** schema for help pages
- **BreadcrumbList** for navigation
- **Review** schema for testimonials

### Sitemap

Generate a sitemap for better SEO:

**Create `/public/sitemap.xml`:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://safetrekr.com/marketing/</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://safetrekr.com/marketing/pricing.html</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Add all pages -->
</urlset>
```

**Create `/public/robots.txt`:**

```
User-agent: *
Allow: /
Sitemap: https://safetrekr.com/sitemap.xml
```

---

## Performance Optimization

### Image Optimization

- Use WebP format for images where supported
- Provide fallback JPG/PNG formats
- Use responsive images with `srcset`
- Lazy load images below the fold

```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>
```

### Code Splitting

Vite automatically code-splits:
- Each page is a separate entry point
- Shared components are extracted to common chunks
- Dynamic imports load on demand

### Caching Strategy

Set cache headers in your hosting provider:

- HTML: `no-cache` or short TTL
- CSS/JS: `max-age=31536000` (1 year) with hash in filename
- Images: `max-age=31536000` (1 year)

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari iOS 14+
- Chrome Mobile Android 90+

**Polyfills not required** - using modern JavaScript features supported by target browsers.

---

## Troubleshooting

### Issue: Vite dev server not starting

**Solution:**
```bash
# Check if port 5174 is in use
lsof -i :5174

# Use a different port
npm run dev -- --port 3000
```

### Issue: Components not loading

**Solution:**
- Check browser console for import errors
- Verify component paths are correct
- Ensure `type="module"` is set on script tags

### Issue: Styles not applying

**Solution:**
- Clear browser cache
- Check CSS file paths
- Verify CSS custom properties are defined in `:root`

### Issue: Analytics not tracking

**Solution:**
- Verify Google Analytics script is loaded
- Check `window.gtag` is defined
- Open GA4 DebugView to see events in real-time

---

## Support

### Documentation

- [Component Documentation](./COMPONENTS.md)
- [Analytics Documentation](./ANALYTICS.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Main App README](../README.md)

### Contact

- **Email:** dev@safetrekr.com
- **GitHub Issues:** https://github.com/your-org/safetrekr-app/issues

---

## License

Proprietary - Safetrekr, Inc.

---

**Built with care by the Safetrekr Team**
