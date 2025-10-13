/**
 * Lead Capture Modal Component
 * Gated download flow with lead capture form
 */

import { Analytics } from './analytics.js';

export class LeadCapture {
  constructor(options = {}) {
    this.resourceName = options.resourceName || 'Resource';
    this.resourceType = options.resourceType || 'PDF';
    this.resourceUrl = options.resourceUrl || '#';
    this.onSuccess = options.onSuccess || null;

    this.modal = null;
    this.form = null;
  }

  /**
   * Show the lead capture modal
   */
  show() {
    this.createModal();
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Hide the lead capture modal
   */
  hide() {
    if (this.modal) {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';

      // Remove modal after animation
      setTimeout(() => {
        if (this.modal && this.modal.parentNode) {
          this.modal.parentNode.removeChild(this.modal);
        }
        this.modal = null;
        this.form = null;
      }, 300);
    }
  }

  /**
   * Create the modal HTML
   */
  createModal() {
    // Remove existing modal if present
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }

    this.modal = document.createElement('div');
    this.modal.className = 'st-lead-capture-modal';
    this.modal.innerHTML = `
      <div class="st-lead-capture-overlay"></div>
      <div class="st-lead-capture-content">
        <div class="st-lead-capture-header">
          <div class="st-lead-capture-icon">
            <span class="material-symbols-outlined">download</span>
          </div>
          <h2 class="st-lead-capture-title">Download ${this.resourceName}</h2>
          <p class="st-lead-capture-subtitle">
            Enter your information to receive this free resource.
          </p>
          <button type="button" class="st-lead-capture-close" aria-label="Close">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form class="st-lead-capture-form" novalidate>
          <div class="st-lead-capture-form-row">
            <div class="st-lead-capture-form-group">
              <label for="lead-first-name" class="st-lead-capture-label">
                First Name <span class="st-lead-capture-required">*</span>
              </label>
              <input
                type="text"
                id="lead-first-name"
                name="firstName"
                class="st-lead-capture-input"
                required
                autocomplete="given-name"
              >
              <div class="st-lead-capture-error"></div>
            </div>

            <div class="st-lead-capture-form-group">
              <label for="lead-last-name" class="st-lead-capture-label">
                Last Name <span class="st-lead-capture-required">*</span>
              </label>
              <input
                type="text"
                id="lead-last-name"
                name="lastName"
                class="st-lead-capture-input"
                required
                autocomplete="family-name"
              >
              <div class="st-lead-capture-error"></div>
            </div>
          </div>

          <div class="st-lead-capture-form-group">
            <label for="lead-email" class="st-lead-capture-label">
              Email Address <span class="st-lead-capture-required">*</span>
            </label>
            <input
              type="email"
              id="lead-email"
              name="email"
              class="st-lead-capture-input"
              required
              autocomplete="email"
            >
            <div class="st-lead-capture-error"></div>
          </div>

          <div class="st-lead-capture-form-group">
            <label for="lead-organization" class="st-lead-capture-label">
              Organization <span class="st-lead-capture-required">*</span>
            </label>
            <input
              type="text"
              id="lead-organization"
              name="organization"
              class="st-lead-capture-input"
              required
              autocomplete="organization"
            >
            <div class="st-lead-capture-error"></div>
          </div>

          <div class="st-lead-capture-form-group">
            <label for="lead-organization-type" class="st-lead-capture-label">
              Organization Type <span class="st-lead-capture-required">*</span>
            </label>
            <select
              id="lead-organization-type"
              name="organizationType"
              class="st-lead-capture-select"
              required
            >
              <option value="">Select one...</option>
              <option value="k12">K-12 School</option>
              <option value="higher-ed">Higher Education</option>
              <option value="church">Church / Religious Organization</option>
              <option value="sports">Sports Team / Athletic Organization</option>
              <option value="corporate">Corporate / Business</option>
              <option value="nonprofit">Nonprofit Organization</option>
              <option value="other">Other</option>
            </select>
            <div class="st-lead-capture-error"></div>
          </div>

          <div class="st-lead-capture-form-group">
            <label for="lead-role" class="st-lead-capture-label">
              Role / Title
            </label>
            <input
              type="text"
              id="lead-role"
              name="role"
              class="st-lead-capture-input"
              autocomplete="organization-title"
            >
            <div class="st-lead-capture-error"></div>
          </div>

          <div class="st-lead-capture-form-group st-lead-capture-checkbox-group">
            <label class="st-lead-capture-checkbox-label">
              <input
                type="checkbox"
                id="lead-consent"
                name="consent"
                class="st-lead-capture-checkbox"
                required
              >
              <span>
                I agree to receive communications from SafeTrekr about products, services, and resources.
                <span class="st-lead-capture-required">*</span>
              </span>
            </label>
            <div class="st-lead-capture-error"></div>
          </div>

          <div class="st-lead-capture-actions">
            <button type="submit" class="st-marketing-cta-primary st-lead-capture-submit">
              Download ${this.resourceType}
              <span class="material-symbols-outlined">download</span>
            </button>
            <button type="button" class="st-marketing-cta-secondary st-lead-capture-cancel">
              Cancel
            </button>
          </div>

          <p class="st-lead-capture-privacy-note">
            We respect your privacy. Your information will never be shared with third parties.
            <a href="./privacy.html" target="_blank" class="st-lead-capture-privacy-link">Privacy Policy</a>
          </p>
        </form>

        <div class="st-lead-capture-success" style="display: none;">
          <div class="st-lead-capture-success-icon">
            <span class="material-symbols-outlined">check_circle</span>
          </div>
          <h3 class="st-lead-capture-success-title">Download Ready!</h3>
          <p class="st-lead-capture-success-message">
            Thank you for your interest. Your download will begin shortly.
          </p>
          <a href="${this.resourceUrl}" class="st-marketing-cta-primary st-lead-capture-download-link" download>
            Download ${this.resourceType}
            <span class="material-symbols-outlined">download</span>
          </a>
          <button type="button" class="st-marketing-cta-secondary st-lead-capture-close-success">
            Close
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    // Bind event listeners
    this.bindEvents();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Close button
    const closeBtn = this.modal.querySelector('.st-lead-capture-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Close success button
    const closeSuccessBtn = this.modal.querySelector('.st-lead-capture-close-success');
    if (closeSuccessBtn) {
      closeSuccessBtn.addEventListener('click', () => this.hide());
    }

    // Cancel button
    const cancelBtn = this.modal.querySelector('.st-lead-capture-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hide());
    }

    // Overlay click
    const overlay = this.modal.querySelector('.st-lead-capture-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.hide());
    }

    // Form submission
    this.form = this.modal.querySelector('.st-lead-capture-form');
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Real-time validation
    const inputs = this.form.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => {
        // Clear error on input
        const errorDiv = input.closest('.st-lead-capture-form-group').querySelector('.st-lead-capture-error');
        if (errorDiv) {
          errorDiv.textContent = '';
          input.classList.remove('error');
        }
      });
    });

    // ESC key to close
    this.handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    };
    document.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Validate a single field
   */
  validateField(field) {
    const formGroup = field.closest('.st-lead-capture-form-group');
    const errorDiv = formGroup.querySelector('.st-lead-capture-error');
    let error = '';

    if (field.hasAttribute('required') && !field.value.trim()) {
      error = 'This field is required';
    } else if (field.type === 'email' && field.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value.trim())) {
        error = 'Please enter a valid email address';
      }
    } else if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
      error = 'You must agree to continue';
    }

    if (error) {
      errorDiv.textContent = error;
      field.classList.add('error');
      return false;
    } else {
      errorDiv.textContent = '';
      field.classList.remove('error');
      return true;
    }
  }

  /**
   * Validate entire form
   */
  validateForm() {
    const inputs = this.form.querySelectorAll('input[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Handle form submission
   */
  async handleSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!this.validateForm()) {
      return;
    }

    // Get form data
    const formData = new FormData(this.form);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      organization: formData.get('organization'),
      organizationType: formData.get('organizationType'),
      role: formData.get('role'),
      resourceName: this.resourceName,
      resourceType: this.resourceType,
      timestamp: new Date().toISOString()
    };

    console.log('Lead captured:', data);

    // Track analytics
    Analytics.trackLeadCapture(this.resourceName, data.email);

    // In production, send to backend/CRM
    // await fetch('/api/leads', { method: 'POST', body: JSON.stringify(data) });

    // Show success state
    this.showSuccess();

    // Call success callback if provided
    if (this.onSuccess) {
      this.onSuccess(data);
    }

    // Trigger download after short delay
    setTimeout(() => {
      this.triggerDownload();
    }, 1000);
  }

  /**
   * Show success state
   */
  showSuccess() {
    const formEl = this.modal.querySelector('.st-lead-capture-form');
    const successEl = this.modal.querySelector('.st-lead-capture-success');

    if (formEl && successEl) {
      formEl.style.display = 'none';
      successEl.style.display = 'block';
    }
  }

  /**
   * Trigger the download
   */
  triggerDownload() {
    // Track download
    Analytics.trackResourceDownload(this.resourceName, this.resourceType);

    // In production, this would download the actual file
    // For now, just log it
    console.log(`Downloading: ${this.resourceName} (${this.resourceType})`);
    console.log(`Resource URL: ${this.resourceUrl}`);

    // Simulate download by opening resource URL
    if (this.resourceUrl && this.resourceUrl !== '#') {
      const link = document.createElement('a');
      link.href = this.resourceUrl;
      link.download = `${this.resourceName.replace(/\s+/g, '-')}.${this.resourceType.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.handleKeyDown) {
      document.removeEventListener('keydown', this.handleKeyDown);
    }
    this.hide();
  }

  /**
   * Static method to show modal
   */
  static show(options) {
    const modal = new LeadCapture(options);
    modal.show();
    return modal;
  }
}

export default LeadCapture;
