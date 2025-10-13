# Marketing Site Deployment Guide

Complete guide to deploying the SafeTrekr marketing website to production.

---

## Table of Contents

- [Overview](#overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Build Process](#build-process)
- [Deployment Methods](#deployment-methods)
  - [GitHub Pages](#github-pages)
  - [Netlify](#netlify)
  - [Vercel](#vercel)
  - [AWS S3 + CloudFront](#aws-s3--cloudfront)
- [Custom Domain Setup](#custom-domain-setup)
- [Environment Variables](#environment-variables)
- [Post-Deployment Testing](#post-deployment-testing)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

---

## Overview

The SafeTrekr marketing site is a **static website** built with Vite. It requires no server-side processing and can be deployed to any static hosting provider.

### Deployment Requirements

- Node.js 18+ (for building)
- npm (for installing dependencies)
- Git (for version control)
- Domain name (optional, for custom domain)

### Production Stack

- **Static Files**: HTML, CSS, JavaScript
- **CDN**: Recommended for global performance
- **SSL/TLS**: Required (HTTPS only)
- **Analytics**: Google Analytics 4

---

## Pre-Deployment Checklist

Complete this checklist before each deployment:

### Content Review

- [ ] All pages reviewed and approved
- [ ] Copy is final (no typos, grammar errors)
- [ ] Images optimized (compressed, correct format)
- [ ] Links tested (no broken links)
- [ ] CTAs are clear and actionable
- [ ] Contact information is correct

### Technical Review

- [ ] All pages load without errors
- [ ] Console has no JavaScript errors
- [ ] All components work correctly
- [ ] Forms validate properly
- [ ] Mobile responsive on all pages
- [ ] Cross-browser testing complete (Chrome, Firefox, Safari, Edge)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Page load time under 3 seconds

### SEO & Analytics

- [ ] Meta tags on all pages (title, description, keywords)
- [ ] Open Graph tags for social sharing
- [ ] Structured data (JSON-LD) on relevant pages
- [ ] Sitemap.xml created
- [ ] Robots.txt configured
- [ ] Google Analytics 4 installed and tested
- [ ] Conversion events configured in GA4

### Legal & Compliance

- [ ] Privacy policy linked in footer
- [ ] Terms of service linked in footer
- [ ] Cookie consent banner (if EU traffic)
- [ ] GDPR compliance (if EU traffic)
- [ ] COPPA compliance (for K-12 segment)
- [ ] Copyright notices correct

### Performance

- [ ] Images compressed and optimized
- [ ] CSS minified
- [ ] JavaScript minified
- [ ] Unused code removed
- [ ] Lighthouse score 90+ (Performance, SEO, Accessibility, Best Practices)

---

## Build Process

### Step 1: Install Dependencies

```bash
cd /path/to/safetrekr-app
npm install
```

### Step 2: Update Configuration

Edit `/vite.config.js` to set the correct base path:

**For GitHub Pages:**
```javascript
export default defineConfig({
  base: '/safetrekr-app/',  // Your repo name
  // ...
});
```

**For Custom Domain:**
```javascript
export default defineConfig({
  base: '/',  // Root domain
  // ...
});
```

### Step 3: Build for Production

```bash
npm run build
```

This will:
- Minify HTML, CSS, and JavaScript
- Optimize images
- Generate source maps (for debugging)
- Output to `/dist` directory

**Build Output:**
```
dist/
├── index.html
├── marketing/
│   ├── index.html
│   ├── about.html
│   ├── pricing.html
│   ├── ...
│   ├── components/
│   │   └── (bundled JS)
│   ├── styles/
│   │   └── (minified CSS)
│   └── assets/
│       └── (optimized images)
├── admin/
├── analyst/
├── traveler/
└── src/
```

### Step 4: Test Build Locally

```bash
npm run preview
```

Open **http://localhost:4173** and test:
- All pages load
- Navigation works
- Forms submit
- CTAs work
- Analytics tracks events

---

## Deployment Methods

### GitHub Pages

**Best for:** Quick deployment, free hosting, automatic deployments

#### Initial Setup

1. **Create GitHub Repository** (if not already)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/safetrekr-app.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Source: Deploy from a branch
   - Branch: `gh-pages` (create if doesn't exist)
   - Folder: `/` (root)
   - Save

#### Manual Deployment

```bash
# Build the site
npm run build

# Deploy to GitHub Pages (using gh-pages package)
npx gh-pages -d dist
```

Or use the deploy script (add to package.json):

```json
{
  "scripts": {
    "deploy": "npm run build && npx gh-pages -d dist"
  }
}
```

Then:
```bash
npm run deploy
```

#### Automated Deployment (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Site URL:** `https://your-username.github.io/safetrekr-app/`

---

### Netlify

**Best for:** Easy deployment, preview URLs, forms handling, serverless functions

#### Method 1: Drag & Drop

1. Build locally: `npm run build`
2. Go to [Netlify](https://app.netlify.com/)
3. Drag `/dist` folder to Netlify dashboard
4. Done!

#### Method 2: Git Integration

1. **Connect Repository**
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Choose GitHub and select repository
   - Authorize Netlify

2. **Configure Build Settings**
   - Base directory: (leave empty)
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy site"

3. **Auto-Deploy**
   - Every push to `main` branch triggers automatic deployment
   - Pull requests get preview URLs

#### Netlify Configuration

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**Site URL:** `https://safetrekr.netlify.app` (or custom domain)

---

### Vercel

**Best for:** Fastest global CDN, automatic HTTPS, excellent DX

#### Deploy with Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

   Follow prompts:
   - Link to existing project or create new
   - Settings detected automatically
   - Confirm and deploy

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### Deploy with Git Integration

1. Go to [Vercel](https://vercel.com/)
2. Click "New Project"
3. Import Git Repository
4. Select `safetrekr-app` repository
5. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. Click "Deploy"

#### Vercel Configuration

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Site URL:** `https://safetrekr.vercel.app` (or custom domain)

---

### AWS S3 + CloudFront

**Best for:** Enterprise deployments, full AWS integration, fine-grained control

#### Prerequisites

- AWS Account
- AWS CLI installed and configured
- S3 bucket created
- CloudFront distribution created

#### Deployment Steps

1. **Build Site**
   ```bash
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Invalidate CloudFront Cache**
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id YOUR_DISTRIBUTION_ID \
     --paths "/*"
   ```

#### Automated Deployment Script

Create `deploy-aws.sh`:

```bash
#!/bin/bash

# Exit on error
set -e

# Build
echo "Building site..."
npm run build

# Upload to S3
echo "Uploading to S3..."
aws s3 sync dist/ s3://safetrekr-marketing --delete \
  --exclude ".git/*" \
  --cache-control "public, max-age=31536000, immutable"

# Invalidate CloudFront
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"

echo "Deployment complete!"
```

Make executable:
```bash
chmod +x deploy-aws.sh
```

Run:
```bash
./deploy-aws.sh
```

#### S3 Bucket Configuration

**Bucket Policy** (for public access):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

**Static Website Hosting:**
- Enable static website hosting
- Index document: `index.html`
- Error document: `index.html` (for SPA routing)

**Site URL:** `https://your-distribution-id.cloudfront.net` (or custom domain)

---

## Custom Domain Setup

### Purchase Domain

Purchase domain from:
- Namecheap
- Google Domains
- GoDaddy
- AWS Route 53

Recommended: `safetrekr.com` or `app.safetrekr.com`

### DNS Configuration

#### For GitHub Pages

Add DNS records at your domain registrar:

**Apex Domain (safetrekr.com):**
```
Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

**Subdomain (www.safetrekr.com):**
```
Type: CNAME
Name: www
Value: your-username.github.io
```

**Configure GitHub:**
- Go to repo Settings → Pages
- Custom domain: `safetrekr.com`
- Save

#### For Netlify

```
Type: CNAME
Name: www
Value: your-site.netlify.app

Type: A (for apex domain)
Name: @
Value: 75.2.60.5
```

Or use Netlify DNS (recommended):
- Transfer domain to Netlify DNS
- Automatic configuration

#### For Vercel

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A (for apex domain)
Name: @
Value: 76.76.21.21
```

Or use Vercel DNS:
- Add domain in Vercel dashboard
- Update nameservers at registrar

#### For AWS CloudFront

```
Type: A (Alias)
Name: @
Value: your-distribution.cloudfront.net

Type: CNAME
Name: www
Value: your-distribution.cloudfront.net
```

### SSL Certificate

All hosting providers offer free SSL:
- **GitHub Pages**: Automatic with Let's Encrypt
- **Netlify**: Automatic with Let's Encrypt
- **Vercel**: Automatic with Let's Encrypt
- **AWS**: Use AWS Certificate Manager (free)

### Verification

After DNS propagation (24-48 hours):

1. **Check DNS:**
   ```bash
   dig safetrekr.com
   dig www.safetrekr.com
   ```

2. **Test HTTPS:**
   - Visit https://safetrekr.com
   - Check SSL certificate (padlock icon)
   - Ensure no mixed content warnings

3. **Test Redirects:**
   - http://safetrekr.com → https://safetrekr.com ✓
   - http://www.safetrekr.com → https://www.safetrekr.com ✓
   - safetrekr.com → www.safetrekr.com (or vice versa) ✓

---

## Environment Variables

### GA4 Measurement ID

**Option 1: Hardcode (Current)**

Edit all HTML files:
```html
<script>
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Option 2: Environment Variable (Recommended)**

1. **Create `.env` file:**
   ```
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

2. **Update analytics.js:**
   ```javascript
   const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
   gtag('config', measurementId);
   ```

3. **Configure in hosting provider:**
   - **Netlify**: Site settings → Build & deploy → Environment
   - **Vercel**: Project settings → Environment Variables
   - **GitHub Actions**: Repository secrets

### Other Variables

```
VITE_CONTACT_EMAIL=hello@safetrekr.com
VITE_SALES_EMAIL=sales@safetrekr.com
VITE_API_URL=https://api.safetrekr.com
```

Access in code:
```javascript
const contactEmail = import.meta.env.VITE_CONTACT_EMAIL;
```

---

## Post-Deployment Testing

### Automated Tests

Run after deployment:

```bash
# Check all pages return 200
curl -I https://safetrekr.com/marketing/
curl -I https://safetrekr.com/marketing/pricing.html
curl -I https://safetrekr.com/marketing/about.html

# Check redirects
curl -I http://safetrekr.com  # Should redirect to HTTPS

# Check SSL
openssl s_client -connect safetrekr.com:443 -servername safetrekr.com
```

### Manual Tests

**Functionality:**
- [ ] All pages load correctly
- [ ] Navigation works (header, footer)
- [ ] Mobile menu works
- [ ] Forms validate and submit
- [ ] Calculators work
- [ ] Lead capture modal opens
- [ ] Quote form progresses through steps
- [ ] Analytics tracks events (check GA4 DebugView)

**Performance:**
- [ ] Lighthouse audit: 90+ on all categories
- [ ] Page load time under 3 seconds
- [ ] Images load quickly
- [ ] No layout shift (CLS < 0.1)

**Cross-Browser:**
- [ ] Chrome (desktop & mobile)
- [ ] Firefox (desktop & mobile)
- [ ] Safari (desktop & mobile)
- [ ] Edge (desktop)

**SEO:**
- [ ] All pages indexed by Google (after 24-48 hours)
- [ ] Meta tags appear in search results
- [ ] Structured data validates (Google Rich Results Test)
- [ ] Sitemap accessible at /sitemap.xml
- [ ] Robots.txt accessible at /robots.txt

---

## Monitoring & Maintenance

### Uptime Monitoring

Use a service to monitor site uptime:
- **UptimeRobot** (free): https://uptimerobot.com/
- **Pingdom**: https://www.pingdom.com/
- **StatusCake**: https://www.statuscake.com/

Configure:
- Check URL: https://safetrekr.com/marketing/
- Check interval: 5 minutes
- Alerts: Email, SMS, Slack

### Performance Monitoring

**Google Analytics 4:**
- Monitor page load times
- Track Core Web Vitals (LCP, FID, CLS)
- Set up alerts for performance degradation

**Lighthouse CI:**
- Run Lighthouse on every deploy
- Set performance budgets
- Fail build if score drops below threshold

### Error Tracking

**Sentry** (optional):
1. Create account at https://sentry.io/
2. Add Sentry SDK:
   ```html
   <script src="https://browser.sentry-cdn.com/7.x.x/bundle.min.js"></script>
   <script>
     Sentry.init({
       dsn: 'YOUR_DSN',
       environment: 'production'
     });
   </script>
   ```
3. Errors automatically captured and reported

### Security Monitoring

**Security Headers:**
Check headers at https://securityheaders.com/

**SSL Monitoring:**
Monitor SSL certificate expiration (auto-renewed by hosting provider)

---

## Rollback Procedures

### Quick Rollback

**GitHub Pages:**
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

**Netlify/Vercel:**
- Go to dashboard
- Deployments tab
- Click on previous deployment
- Click "Publish deploy"

**AWS S3:**
- Enable S3 versioning
- Restore previous version from S3 console

### Emergency Rollback

If site is completely broken:

1. **Identify last working deployment**
   - Check Git history
   - Check deployment logs

2. **Revert code**
   ```bash
   git log --oneline  # Find commit hash
   git revert <commit-hash>
   git push
   ```

3. **Redeploy**
   - Automatic (if CI/CD configured)
   - Or manual: `npm run deploy`

4. **Verify rollback**
   - Test site functionality
   - Check analytics events

---

## Troubleshooting

### Issue: 404 Errors on Reload

**Cause:** Server doesn't handle client-side routing

**Fix:**
- **GitHub Pages**: Not applicable (all routes are separate HTML files)
- **Netlify**: Add redirects to `netlify.toml` (see Netlify section)
- **Vercel**: Vercel handles automatically
- **S3/CloudFront**: Configure error document as `index.html`

### Issue: CSS/JS Not Loading

**Cause:** Incorrect base path in `vite.config.js`

**Fix:**
```javascript
// For GitHub Pages
base: '/safetrekr-app/'

// For custom domain
base: '/'
```

Rebuild and redeploy.

### Issue: Images Not Loading

**Cause:** Incorrect image paths

**Fix:**
- Use relative paths: `./assets/image.png`
- Or absolute from root: `/marketing/assets/image.png`
- Rebuild and redeploy

### Issue: Analytics Not Tracking

**Cause:**
- GA4 script not loaded
- Incorrect Measurement ID
- Ad blocker enabled

**Fix:**
1. Check GA4 script in page source
2. Verify Measurement ID
3. Test in incognito mode
4. Check GA4 DebugView

### Issue: Slow Load Times

**Cause:**
- Unoptimized images
- Too many HTTP requests
- No CDN

**Fix:**
1. Compress images (use TinyPNG, ImageOptim)
2. Enable CDN at hosting provider
3. Lazy load images below fold
4. Minify CSS/JS (Vite does automatically)

### Issue: Broken Links After Deploy

**Cause:** Relative path issues

**Fix:**
- Check all `href` attributes
- Use relative paths consistently
- Test on staging before production

---

## Deployment Checklist

Before deploying to production:

- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] Build successful (no errors)
- [ ] Preview tested locally
- [ ] Pre-deployment checklist complete
- [ ] Backup of current production (if applicable)
- [ ] Deployment plan communicated to team
- [ ] Monitoring enabled
- [ ] Rollback plan ready

After deploying:

- [ ] All pages load correctly
- [ ] Post-deployment tests passed
- [ ] Analytics tracking verified
- [ ] No console errors
- [ ] Performance acceptable (Lighthouse 90+)
- [ ] Team notified of successful deployment
- [ ] Documentation updated (if needed)

---

## Support & Resources

### Hosting Provider Docs

- [GitHub Pages](https://docs.github.com/en/pages)
- [Netlify](https://docs.netlify.com/)
- [Vercel](https://vercel.com/docs)
- [AWS S3](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront](https://docs.aws.amazon.com/cloudfront/)

### SafeTrekr Resources

- [Marketing README](./README.md)
- [Component Documentation](./COMPONENTS.md)
- [Analytics Documentation](./ANALYTICS.md)

### Getting Help

- **Deployment Issues**: dev@safetrekr.com
- **DNS Issues**: Contact domain registrar support
- **Performance Issues**: Check Lighthouse report
- **Analytics Issues**: Check ANALYTICS.md

---

**Deployment guide maintained by SafeTrekr DevOps Team**
