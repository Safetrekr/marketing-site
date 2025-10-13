/**
 * Proof Strip Component
 * Displays customer logos or testimonials for social proof
 */

export class ProofStrip {
  constructor(options = {}) {
    this.label = options.label || 'Trusted by leading organizations';
    this.logos = options.logos || this.getDefaultLogos();
    this.container = null;
  }

  /**
   * Get default logos (placeholders for now)
   */
  getDefaultLogos() {
    return [
      { name: 'K-12 School District', alt: 'Sample K-12 School District' },
      { name: 'University', alt: 'Sample University' },
      { name: 'Church Network', alt: 'Sample Church Network' },
      { name: 'Corporate', alt: 'Sample Corporation' },
      { name: 'Sports Organization', alt: 'Sample Sports Organization' }
    ];
  }

  /**
   * Render the proof strip HTML
   */
  render() {
    const logosHtml = this.logos.map(logo => `
      <div class="st-marketing-proof-strip-logo"
           style="display: flex; align-items: center; justify-content: center;
                  background-color: var(--st-bg-tertiary); border-radius: var(--st-radius-md);
                  padding: var(--st-spacing-md) var(--st-spacing-lg);
                  font-weight: 600; color: var(--st-text-muted);
                  font-size: var(--st-font-size-sm);">
        ${logo.name}
      </div>
    `).join('');

    const html = `
      <div class="st-marketing-proof-strip" id="proof-strip">
        <div class="st-marketing-container">
          <div class="st-marketing-proof-strip-label">${this.label}</div>
          <div class="st-marketing-proof-strip-logos">
            ${logosHtml}
          </div>
        </div>
      </div>
    `;

    return html;
  }

  /**
   * Mount the proof strip to the page
   */
  mount(selector) {
    const target = document.querySelector(selector);
    if (!target) {
      console.error(`ProofStrip: Target element "${selector}" not found`);
      return;
    }

    target.insertAdjacentHTML('beforeend', this.render());
    this.container = document.getElementById('proof-strip');

    console.log('ProofStrip: Mounted successfully');
  }

  /**
   * Update logos dynamically
   */
  updateLogos(newLogos) {
    this.logos = newLogos;
    if (this.container) {
      const parent = this.container.parentElement;
      this.destroy();
      this.mount(parent);
    }
  }

  /**
   * Destroy the proof strip
   */
  destroy() {
    this.container?.remove();
  }
}

export default ProofStrip;
