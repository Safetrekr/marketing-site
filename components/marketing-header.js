/**
 * Marketing Header Component
 * Sticky navigation with logo, links, and CTAs
 * Mobile-responsive with hamburger menu
 */

export class MarketingHeader {
  constructor(options = {}) {
    this.currentPage = options.currentPage || '';
    this.container = null;
    this.mobileMenu = null;
    this.isScrolled = false;
  }

  /**
   * Render the header HTML
   */
  render() {
    // Determine base path - use relative paths that work in both dev and production
    const basePath = import.meta.env?.BASE_URL || './';
    const marketingBase = basePath.endsWith('/') ? `${basePath}marketing/` : `${basePath}/marketing/`;
    const rootBase = basePath.endsWith('/') ? basePath : `${basePath}/`;

    const html = `
      <header class="st-marketing-header" id="marketing-header">
        <div class="st-marketing-header-inner">
          <!-- Logo -->
          <a href="./index.html" class="st-marketing-logo">
            <img src="./assets/images/safetrekr-logo-vert-dark.svg" alt="Safetrekr" class="st-marketing-logo-desktop">
            <img src="./assets/images/safetrekr-mark-dark.svg" alt="Safetrekr" class="st-marketing-logo-mobile">
          </a>

          <!-- Desktop Navigation -->
          <nav class="st-marketing-nav" aria-label="Main navigation">
            <ul class="st-marketing-nav-links">
              <li><a href="./how-it-works.html" class="st-marketing-nav-link ${this.currentPage === 'how-it-works' ? 'active' : ''}">How it Works</a></li>
              <li><a href="./solutions.html" class="st-marketing-nav-link ${this.currentPage === 'solutions' ? 'active' : ''}">Solutions</a></li>
              <li><a href="./pricing.html" class="st-marketing-nav-link ${this.currentPage === 'pricing' ? 'active' : ''}">Pricing</a></li>
              <li><a href="./about.html" class="st-marketing-nav-link ${this.currentPage === 'about' ? 'active' : ''}">About</a></li>
              <li><a href="./security.html" class="st-marketing-nav-link ${this.currentPage === 'security' ? 'active' : ''}">Security</a></li>
            </ul>

            <!-- CTA Actions -->
            <div class="st-marketing-nav-actions">
              <div class="st-marketing-dropdown">
                <button class="st-marketing-cta-tertiary st-marketing-cta-sm st-marketing-dropdown-toggle" id="sign-in-dropdown">
                  Sign In
                  <span class="material-symbols-outlined" style="font-size: 18px; margin-left: 4px;">expand_more</span>
                </button>
                <div class="st-marketing-dropdown-menu" id="sign-in-menu">
                  <a href="http://localhost:5174/org-login.html" class="st-marketing-dropdown-item">
                    <span class="material-symbols-outlined">business</span>
                    <div>
                      <div class="st-marketing-dropdown-item-title">Organization Admin</div>
                      <div class="st-marketing-dropdown-item-subtitle">Schools, Churches, Teams</div>
                    </div>
                  </a>
                  <a href="http://localhost:5174/traveler/welcome.html?role=traveler" class="st-marketing-dropdown-item">
                    <span class="material-symbols-outlined">luggage</span>
                    <div>
                      <div class="st-marketing-dropdown-item-title">Traveler</div>
                      <div class="st-marketing-dropdown-item-subtitle">Trip Participant</div>
                    </div>
                  </a>
                  <a href="http://localhost:5174/traveler/welcome.html?role=chaperone" class="st-marketing-dropdown-item">
                    <span class="material-symbols-outlined">supervisor_account</span>
                    <div>
                      <div class="st-marketing-dropdown-item-title">Chaperone</div>
                      <div class="st-marketing-dropdown-item-subtitle">Trip Supervisor</div>
                    </div>
                  </a>
                  <a href="http://localhost:5174/traveler/welcome.html?role=guardian" class="st-marketing-dropdown-item">
                    <span class="material-symbols-outlined">family_restroom</span>
                    <div>
                      <div class="st-marketing-dropdown-item-title">Guardian</div>
                      <div class="st-marketing-dropdown-item-subtitle">Parent/Guardian</div>
                    </div>
                  </a>
                  <div class="st-marketing-dropdown-divider"></div>
                  <a href="http://localhost:5174/staff-login.html" class="st-marketing-dropdown-item">
                    <span class="material-symbols-outlined">badge</span>
                    <div>
                      <div class="st-marketing-dropdown-item-title">Safetrekr Staff</div>
                      <div class="st-marketing-dropdown-item-subtitle">Admin & Analyst</div>
                    </div>
                  </a>
                </div>
              </div>
              <a href="./request-quote.html" class="st-marketing-cta-primary st-marketing-cta-sm">
                Request Info
              </a>
            </div>
          </nav>

          <!-- Mobile Menu Toggle -->
          <button class="st-marketing-mobile-toggle" id="mobile-menu-toggle" aria-label="Toggle mobile menu">
            <span class="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      <!-- Mobile Menu Overlay -->
      <div class="st-marketing-mobile-menu" id="mobile-menu">
        <div class="st-marketing-mobile-menu-header">
          <a href="./index.html" class="st-marketing-logo">
            <img src="./assets/images/safetrekr-mark-dark.svg" alt="Safetrekr">
          </a>
          <button class="st-marketing-mobile-menu-close" id="mobile-menu-close" aria-label="Close mobile menu">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav class="st-marketing-mobile-menu-nav" aria-label="Mobile navigation">
          <ul class="st-marketing-mobile-menu-links">
            <li><a href="./index.html" class="st-marketing-mobile-menu-link ${this.currentPage === 'home' ? 'active' : ''}">Home</a></li>
            <li><a href="./how-it-works.html" class="st-marketing-mobile-menu-link ${this.currentPage === 'how-it-works' ? 'active' : ''}">How it Works</a></li>
            <li><a href="./solutions.html" class="st-marketing-mobile-menu-link ${this.currentPage === 'solutions' ? 'active' : ''}">Solutions</a></li>
            <li><a href="./pricing.html" class="st-marketing-mobile-menu-link ${this.currentPage === 'pricing' ? 'active' : ''}">Pricing</a></li>
            <li><a href="./about.html" class="st-marketing-mobile-menu-link ${this.currentPage === 'about' ? 'active' : ''}">About</a></li>
            <li><a href="./security.html" class="st-marketing-mobile-menu-link ${this.currentPage === 'security' ? 'active' : ''}">Security</a></li>
          </ul>
          <div class="st-marketing-mobile-menu-actions">
            <div class="st-marketing-mobile-dropdown">
              <button class="st-marketing-cta-secondary st-marketing-mobile-dropdown-toggle" id="mobile-sign-in-dropdown">
                Sign In
                <span class="material-symbols-outlined" style="font-size: 18px; margin-left: 4px;">expand_more</span>
              </button>
              <div class="st-marketing-mobile-dropdown-menu" id="mobile-sign-in-menu" style="display: none;">
                <a href="http://localhost:5174/org-login.html" class="st-marketing-mobile-dropdown-item">
                  <span class="material-symbols-outlined">business</span>
                  <div>
                    <div class="st-marketing-dropdown-item-title">Organization Admin</div>
                    <div class="st-marketing-dropdown-item-subtitle">Schools, Churches, Teams</div>
                  </div>
                </a>
                <a href="http://localhost:5174/traveler/welcome.html?role=traveler" class="st-marketing-mobile-dropdown-item">
                  <span class="material-symbols-outlined">luggage</span>
                  <div>
                    <div class="st-marketing-dropdown-item-title">Traveler</div>
                    <div class="st-marketing-dropdown-item-subtitle">Trip Participant</div>
                  </div>
                </a>
                <a href="http://localhost:5174/traveler/welcome.html?role=chaperone" class="st-marketing-mobile-dropdown-item">
                  <span class="material-symbols-outlined">supervisor_account</span>
                  <div>
                    <div class="st-marketing-dropdown-item-title">Chaperone</div>
                    <div class="st-marketing-dropdown-item-subtitle">Trip Supervisor</div>
                  </div>
                </a>
                <a href="http://localhost:5174/traveler/welcome.html?role=guardian" class="st-marketing-mobile-dropdown-item">
                  <span class="material-symbols-outlined">family_restroom</span>
                  <div>
                    <div class="st-marketing-dropdown-item-title">Guardian</div>
                    <div class="st-marketing-dropdown-item-subtitle">Parent/Guardian</div>
                  </div>
                </a>
                <div class="st-marketing-dropdown-divider"></div>
                <a href="http://localhost:5174/staff-login.html" class="st-marketing-mobile-dropdown-item">
                  <span class="material-symbols-outlined">badge</span>
                  <div>
                    <div class="st-marketing-dropdown-item-title">Safetrekr Staff</div>
                    <div class="st-marketing-dropdown-item-subtitle">Admin & Analyst</div>
                  </div>
                </a>
              </div>
            </div>
            <a href="./request-quote.html" class="st-marketing-cta-primary">
              Request Info
            </a>
          </div>
        </nav>
      </div>
    `;

    return html;
  }

  /**
   * Mount the header to the page
   */
  mount(selector = 'body') {
    const target = document.querySelector(selector);
    if (!target) {
      if (import.meta.env.DEV) console.error(`MarketingHeader: Target element "${selector}" not found`);
      return;
    }

    // Insert header at the beginning of target
    target.insertAdjacentHTML('afterbegin', this.render());

    // Store references
    this.container = document.getElementById('marketing-header');
    this.mobileMenu = document.getElementById('mobile-menu');

    // Attach event listeners
    this.attachEventListeners();

    if (import.meta.env.DEV) console.log('MarketingHeader: Mounted successfully');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Scroll event for header shadow
    window.addEventListener('scroll', () => this.handleScroll());

    // Mobile menu toggle
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const closeBtn = document.getElementById('mobile-menu-close');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.openMobileMenu());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeMobileMenu());
    }

    // Close mobile menu on link click
    const mobileLinks = this.mobileMenu?.querySelectorAll('.st-marketing-mobile-menu-link');
    mobileLinks?.forEach(link => {
      link.addEventListener('click', () => this.closeMobileMenu());
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.mobileMenu?.classList.contains('open')) {
        this.closeMobileMenu();
      }
    });

    // Desktop Sign In dropdown
    const signInDropdownBtn = document.getElementById('sign-in-dropdown');
    const signInMenu = document.getElementById('sign-in-menu');

    if (signInDropdownBtn && signInMenu) {
      signInDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = signInMenu.classList.contains('open');

        // Close any other open dropdowns
        document.querySelectorAll('.st-marketing-dropdown-menu.open').forEach(menu => {
          menu.classList.remove('open');
        });

        if (!isOpen) {
          signInMenu.classList.add('open');
        }
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        signInMenu.classList.remove('open');
      });

      // Prevent menu clicks from closing the dropdown
      signInMenu.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Mobile Sign In dropdown
    const mobileSignInDropdownBtn = document.getElementById('mobile-sign-in-dropdown');
    const mobileSignInMenu = document.getElementById('mobile-sign-in-menu');

    if (mobileSignInDropdownBtn && mobileSignInMenu) {
      mobileSignInDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = mobileSignInMenu.style.display === 'block';

        if (isOpen) {
          mobileSignInMenu.style.display = 'none';
          mobileSignInDropdownBtn.querySelector('.material-symbols-outlined').textContent = 'expand_more';
        } else {
          mobileSignInMenu.style.display = 'block';
          mobileSignInDropdownBtn.querySelector('.material-symbols-outlined').textContent = 'expand_less';
        }
      });
    }
  }

  /**
   * Handle scroll event
   */
  handleScroll() {
    const scrollPosition = window.scrollY;
    const shouldBeScrolled = scrollPosition > 50;

    if (shouldBeScrolled !== this.isScrolled) {
      this.isScrolled = shouldBeScrolled;
      if (this.isScrolled) {
        this.container?.classList.add('scrolled');
      } else {
        this.container?.classList.remove('scrolled');
      }
    }
  }

  /**
   * Open mobile menu
   */
  openMobileMenu() {
    this.mobileMenu?.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Track analytics event
    if (window.gtag) {
      gtag('event', 'mobile_menu_open', {
        event_category: 'engagement',
        event_label: 'Mobile Menu'
      });
    }
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    this.mobileMenu?.classList.remove('open');
    document.body.style.overflow = '';
  }

  /**
   * Destroy the header
   */
  destroy() {
    this.container?.remove();
    this.mobileMenu?.remove();
    document.body.style.overflow = '';
  }
}

export default MarketingHeader;
