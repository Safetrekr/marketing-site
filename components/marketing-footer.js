/**
 * Marketing Footer Component
 * Full-featured footer with site map, social links, and compliance info
 */

export class MarketingFooter {
  constructor(options = {}) {
    this.year = options.year || new Date().getFullYear();
    this.container = null;
  }

  /**
   * Render the footer HTML
   */
  render() {
    const html = `
      <footer class="st-marketing-footer" id="marketing-footer">
        <div class="st-marketing-container">
          <!-- Footer Grid -->
          <div class="st-marketing-footer-grid">
            <!-- Brand Column -->
            <div class="st-marketing-footer-brand">
              <div class="st-marketing-footer-logo">
                <img src="./assets/images/safetrekr-logo-vert-dark.svg" alt="Safetrekr" style="height: 32px;">
              </div>
              <p class="st-marketing-footer-tagline">
                Professionally reviewed before departure. Actively monitored during travel. Fully documented for the record.
              </p>
            </div>

            <!-- Product Links -->
            <div class="st-marketing-footer-section">
              <h4 class="st-marketing-footer-section-title">Product</h4>
              <ul class="st-marketing-footer-links">
                <li><a href="./how-it-works.html" class="st-marketing-footer-link">How it Works</a></li>
                <li><a href="./solutions.html" class="st-marketing-footer-link">Solutions</a></li>
                <li><a href="./pricing.html" class="st-marketing-footer-link">Pricing</a></li>

                <li><a href="./request-quote.html" class="st-marketing-footer-link">Contact Us</a></li>
              </ul>
            </div>

            <!-- Resources Links -->
            <div class="st-marketing-footer-section">
              <h4 class="st-marketing-footer-section-title">Resources</h4>
              <ul class="st-marketing-footer-links">
                <li><a href="./resources.html" class="st-marketing-footer-link">Templates & Guides</a></li>
                <li><a href="./resources.html#blog" class="st-marketing-footer-link">Blog <span style="font-size: 0.75em; opacity: 0.7;">(coming soon)</span></a></li>
                <li><a href="./resources.html#case-studies" class="st-marketing-footer-link">Case Studies <span style="font-size: 0.75em; opacity: 0.7;">(coming soon)</span></a></li>
                <li><a href="./resources.html#webinars" class="st-marketing-footer-link">Webinars <span style="font-size: 0.75em; opacity: 0.7;">(coming soon)</span></a></li>
                <li><a href="./resources.html#help" class="st-marketing-footer-link">Help Center <span style="font-size: 0.75em; opacity: 0.7;">(coming soon)</span></a></li>
              </ul>
            </div>

            <!-- Company Links -->
            <div class="st-marketing-footer-section">
              <h4 class="st-marketing-footer-section-title">Company</h4>
              <ul class="st-marketing-footer-links">
                <li><a href="./about.html" class="st-marketing-footer-link">About Us</a></li>
                <li><a href="./about.html#team" class="st-marketing-footer-link">Team</a></li>
                <li><a href="./about.html#careers" class="st-marketing-footer-link">Careers</a></li>
                <li><a href="./security.html" class="st-marketing-footer-link">Security</a></li>
                <li><a href="./about.html#contact" class="st-marketing-footer-link">Contact</a></li>
              </ul>
            </div>

            <!-- Legal Links -->
            <div class="st-marketing-footer-section">
              <h4 class="st-marketing-footer-section-title">Legal</h4>
              <ul class="st-marketing-footer-links">

                <li><a href="./legal/terms.html" class="st-marketing-footer-link">Terms of Service <span style="font-size: 0.75em; opacity: 0.7;">(coming soon)</span></a></li>
                <li><a href="./legal/privacy.html" class="st-marketing-footer-link">Privacy Policy <span style="font-size: 0.75em; opacity: 0.7;">(coming soon)</span></a></li>
                <li><a href="./legal/dpa.html" class="st-marketing-footer-link">Data Processing <span style="font-size: 0.75em; opacity: 0.7;">(coming soon)</span></a></li>
                <li><a href="./legal/accessibility.html" class="st-marketing-footer-link">Accessibility <span style="font-size: 0.75em; opacity: 0.7;">(coming soon)</span></a></li>
              </ul>
            </div>
          </div>

          <!-- Footer Bottom -->
          <div class="st-marketing-footer-bottom">
            <div class="st-marketing-footer-copyright">
              &copy; ${this.year} Safetrekr. All rights reserved.
            </div>

            <div class="st-marketing-footer-social">
              <a href="https://twitter.com/safetrekr" class="st-marketing-footer-social-link" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                <span class="material-symbols-outlined">share</span>
              </a>
              <a href="https://linkedin.com/company/safetrekr" class="st-marketing-footer-social-link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <span class="material-symbols-outlined">business</span>
              </a>
              <a href="https://facebook.com/safetrekr" class="st-marketing-footer-social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <span class="material-symbols-outlined">group</span>
              </a>
              <a href="https://instagram.com/safetrekr" class="st-marketing-footer-social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <span class="material-symbols-outlined">photo_camera</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    `;

    return html;
  }

  /**
   * Mount the footer to the page
   */
  mount(selector = 'body') {
    const target = document.querySelector(selector);
    if (!target) {
      if (import.meta.env.DEV) console.error(`MarketingFooter: Target element "${selector}" not found`);
      return;
    }

    // Insert footer at the end of target
    target.insertAdjacentHTML('beforeend', this.render());

    // Store reference
    this.container = document.getElementById('marketing-footer');

    // Attach event listeners
    this.attachEventListeners();

    if (import.meta.env.DEV) console.log('MarketingFooter: Mounted successfully');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Track footer link clicks
    const footerLinks = this.container?.querySelectorAll('.st-marketing-footer-link');
    footerLinks?.forEach(link => {
      link.addEventListener('click', (e) => {
        const linkText = e.target.textContent.trim();
        const linkHref = e.target.getAttribute('href');

        // Track analytics event
        if (window.gtag) {
          gtag('event', 'footer_link_click', {
            event_category: 'engagement',
            event_label: linkText,
            link_url: linkHref
          });
        }
      });
    });

    // Track social link clicks
    const socialLinks = this.container?.querySelectorAll('.st-marketing-footer-social-link');
    socialLinks?.forEach(link => {
      link.addEventListener('click', (e) => {
        const platform = e.currentTarget.getAttribute('aria-label');
        const linkHref = e.currentTarget.getAttribute('href');

        // Track analytics event
        if (window.gtag) {
          gtag('event', 'social_link_click', {
            event_category: 'engagement',
            event_label: platform,
            link_url: linkHref
          });
        }
      });
    });
  }

  /**
   * Destroy the footer
   */
  destroy() {
    this.container?.remove();
  }
}

export default MarketingFooter;
