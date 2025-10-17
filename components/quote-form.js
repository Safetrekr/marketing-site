/**
 * Quote Form Component
 * Complete 5-step form for requesting trip quotes with tier selection, add-ons, and payment options
 */

import { Analytics } from './analytics.js';

export class QuoteForm {
  constructor(options = {}) {
    this.currentStep = 1;
    this.totalSteps = 5;

    // EXACT data structure as specified
    this.formData = {
      plan: {
        tier: null,
        international: false,
        overnight: false,
        internationalAcknowledged: false
      },
      trip: {
        name: '',
        dateStart: '',
        dateEnd: '',
        destCity: '',
        destCountry: 'US',
        adults: 0,
        minors: 0,
        originCity: '',
        transport: '',
        lodgingStatus: '',
        notes: '',
        showMoreDetails: false
      },
      addons: {
        bgAdultsDomestic: 0,
        bgAdultsInternational: 0
      },
      org: {
        orgName: '',
        orgType: '',
        role: '',
        email: '',
        phone: '',
        taxExempt: false
      },
      checkout: {
        mode: null,
        agreedToTerms: false,
        agreedToAuthorization: false,
        billingAddress: '',
        apEmail: '',
        poNumber: ''
      }
    };

    this.pricingConfig = null;
    this.element = null;
  }

  /**
   * Load pricing configuration from JSON file
   */
  async loadPricingConfig() {
    try {
      const response = await fetch('./config/pricing.json');
      const config = await response.json();
      this.pricingConfig = config;
    } catch (error) {
      console.error('Failed to load pricing config:', error);
      // Fallback pricing if config fails
      this.pricingConfig = {
        tiers: {
          T1: { label: 'Tier 1', price: 450, enabled: true },
          T2: { label: 'Tier 2', price: 750, enabled: false },
          T3: { label: 'Tier 3', price: 1250, enabled: false }
        },
        addons: {
          bgDomestic: { label: 'Background Check (US)', price: 35, postBilled: true },
          bgInternational: { label: 'Background Check (Intl)', price: 65, postBilled: true }
        }
      };
    }
  }

  /**
   * Calculate total price
   */
  calculateTotal() {
    if (!this.pricingConfig) return { total: 0, todayTotal: 0, postBilled: 0 };

    let total = 0;
    let postBilled = 0;

    // Add tier price
    if (this.formData.plan.tier && this.pricingConfig.tiers[this.formData.plan.tier]) {
      total += this.pricingConfig.tiers[this.formData.plan.tier].price;
    }

    // Add background check costs (post-billed)
    const bgDomestic = this.formData.addons.bgAdultsDomestic * 35;
    const bgInternational = this.formData.addons.bgAdultsInternational * 65;
    postBilled = bgDomestic + bgInternational;

    const todayTotal = total;
    total += postBilled;

    return { total, todayTotal, postBilled, bgDomestic, bgInternational };
  }

  /**
   * Validate current step
   */
  validateStep(step) {
    const errors = [];

    switch(step) {
      case 1: // Plan
        if (!this.formData.plan.tier) {
          errors.push('Please select a trip tier');
        }

        // If international AND not Tier 3, must acknowledge
        if (this.formData.plan.international &&
            this.formData.plan.tier !== 'T3' &&
            !this.formData.plan.internationalAcknowledged) {
          errors.push('Please acknowledge the international trip limitation or select Tier 3');
        }
        break;

      case 2: // Trip
        if (!this.formData.trip.name || !this.formData.trip.name.trim()) {
          errors.push('Trip name is required');
        }
        if (!this.formData.trip.dateStart) {
          errors.push('Start date is required');
        }
        if (!this.formData.trip.dateEnd) {
          errors.push('End date is required');
        }
        if (!this.formData.trip.destCity || !this.formData.trip.destCity.trim()) {
          errors.push('Destination city is required');
        }
        if (!this.formData.trip.adults || this.formData.trip.adults < 1) {
          errors.push('At least one adult is required');
        }
        if (this.formData.trip.minors === null || this.formData.trip.minors === undefined || this.formData.trip.minors < 0) {
          errors.push('Number of minors is required (can be 0)');
        }

        // Validate dates
        if (this.formData.trip.dateStart && this.formData.trip.dateEnd) {
          const start = new Date(this.formData.trip.dateStart);
          const end = new Date(this.formData.trip.dateEnd);
          if (end < start) {
            errors.push('End date must be after start date');
          }
        }
        break;

      case 3: // Add-ons (optional - no validation)
        break;

      case 4: // Organization
        if (!this.formData.org.orgName || !this.formData.org.orgName.trim()) {
          errors.push('Organization name is required');
        }
        if (!this.formData.org.orgType) {
          errors.push('Organization type is required');
        }
        if (!this.formData.org.role || !this.formData.org.role.trim()) {
          errors.push('Your role/title is required');
        }
        if (!this.formData.org.email || !this.formData.org.email.trim()) {
          errors.push('Email is required');
        } else if (!this.isValidEmail(this.formData.org.email)) {
          errors.push('Please enter a valid email address');
        }
        break;

      case 5: // Checkout
        if (!this.formData.checkout.mode) {
          errors.push('Please select a payment option');
        }
        if (!this.formData.checkout.agreedToTerms) {
          errors.push('You must agree to the Terms of Service and Privacy Policy');
        }
        if (!this.formData.checkout.agreedToAuthorization) {
          errors.push('You must confirm you are authorized to make this request');
        }
        break;
    }

    return errors;
  }

  /**
   * Email validation
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Phone validation
   */
  isValidPhone(phone) {
    return /^[\d\s\-\(\)\+]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  /**
   * Go to next step
   */
  nextStep() {
    const errors = this.validateStep(this.currentStep);

    if (errors.length > 0) {
      this.showErrors(errors);
      return;
    }

    this.clearErrors();

    // Track step completion
    Analytics.trackFormSubmit(`quote_form_step_${this.currentStep}`, 'request-quote');

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Go to previous step
   */
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Submit form
   */
  async submitForm() {
    const errors = this.validateStep(this.currentStep);

    if (errors.length > 0) {
      this.showErrors(errors);
      return;
    }

    this.clearErrors();

    // Show loading state
    const submitBtn = this.element.querySelector('[data-submit]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Track quote request
      const tierInfo = this.pricingConfig.tiers[this.formData.plan.tier];
      Analytics.trackQuoteRequest(
        tierInfo.label,
        []
      );

      // Show confirmation
      this.showConfirmation();

    } catch (error) {
      console.error('Form submission error:', error);
      this.showErrors(['An error occurred. Please try again.']);

      // Reset button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Request';
      }
    }
  }

  /**
   * Show errors
   */
  showErrors(errors) {
    const errorContainer = this.element.querySelector('[data-errors]');
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div class="st-alert st-alert-danger" role="alert">
          <div class="st-alert-icon">
            <span class="material-symbols-outlined">error</span>
          </div>
          <div class="st-alert-content">
            <strong class="st-alert-title">Please correct the following errors:</strong>
            <ul class="st-alert-list">
              ${errors.map(err => `<li>${err}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
      errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Mark invalid fields
      this.markInvalidFields();
    }
  }

  /**
   * Clear errors
   */
  clearErrors() {
    const errorContainer = this.element.querySelector('[data-errors]');
    if (errorContainer) {
      errorContainer.innerHTML = '';
    }
    this.clearInvalidFields();
  }

  /**
   * Mark invalid fields with danger state
   */
  markInvalidFields() {
    this.clearInvalidFields();

    const errors = this.validateStep(this.currentStep);
    if (errors.length === 0) return;

    switch(this.currentStep) {
      case 1:
        if (!this.formData.plan.tier) {
          this.element.querySelectorAll('.st-quote-tier-card').forEach(card => {
            card.classList.add('is-invalid');
          });
        }
        break;

      case 2:
        if (!this.formData.trip.name) this.markFieldInvalid('trip.name');
        if (!this.formData.trip.dateStart) this.markFieldInvalid('trip.dateStart');
        if (!this.formData.trip.dateEnd) this.markFieldInvalid('trip.dateEnd');
        if (!this.formData.trip.destCity) this.markFieldInvalid('trip.destCity');
        if (!this.formData.trip.adults) this.markFieldInvalid('trip.adults');
        break;

      case 4:
        if (!this.formData.org.orgName) this.markFieldInvalid('org.orgName');
        if (!this.formData.org.orgType) this.markFieldInvalid('org.orgType');
        if (!this.formData.org.role) this.markFieldInvalid('org.role');
        if (!this.formData.org.email || !this.isValidEmail(this.formData.org.email)) {
          this.markFieldInvalid('org.email');
        }
        break;

      case 5:
        if (!this.formData.checkout.mode) {
          this.element.querySelectorAll('.st-quote-payment-card').forEach(card => {
            card.classList.add('is-invalid');
          });
        }
        break;
    }

    this.markValidFields();
  }

  /**
   * Mark a specific field as invalid
   */
  markFieldInvalid(fieldName) {
    const field = this.element.querySelector(`[data-field="${fieldName}"]`);
    if (field) {
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
    }
  }

  /**
   * Mark valid fields with success state
   */
  markValidFields() {
    switch(this.currentStep) {
      case 1:
        if (this.formData.plan.tier) {
          this.element.querySelectorAll('.st-quote-tier-card').forEach(card => {
            card.classList.remove('is-invalid');
          });
        }
        break;

      case 2:
        if (this.formData.trip.name) this.markFieldValid('trip.name');
        if (this.formData.trip.dateStart) this.markFieldValid('trip.dateStart');
        if (this.formData.trip.dateEnd) this.markFieldValid('trip.dateEnd');
        if (this.formData.trip.destCity) this.markFieldValid('trip.destCity');
        if (this.formData.trip.adults) this.markFieldValid('trip.adults');
        break;

      case 4:
        if (this.formData.org.orgName) this.markFieldValid('org.orgName');
        if (this.formData.org.orgType) this.markFieldValid('org.orgType');
        if (this.formData.org.role) this.markFieldValid('org.role');
        if (this.formData.org.email && this.isValidEmail(this.formData.org.email)) {
          this.markFieldValid('org.email');
        }
        break;

      case 5:
        if (this.formData.checkout.mode) {
          this.element.querySelectorAll('.st-quote-payment-card').forEach(card => {
            card.classList.remove('is-invalid');
          });
        }
        break;
    }
  }

  /**
   * Mark a specific field as valid
   */
  markFieldValid(fieldName) {
    const field = this.element.querySelector(`[data-field="${fieldName}"]`);
    if (field && field.value) {
      field.classList.add('is-valid');
      field.classList.remove('is-invalid');
    }
  }

  /**
   * Clear all validation states from fields
   */
  clearInvalidFields() {
    if (!this.element) return;

    this.element.querySelectorAll('[data-field]').forEach(field => {
      field.classList.remove('is-invalid', 'is-valid');
    });

    this.element.querySelectorAll('.st-quote-tier-card').forEach(card => {
      card.classList.remove('is-invalid');
    });

    this.element.querySelectorAll('.st-quote-payment-card').forEach(card => {
      card.classList.remove('is-invalid');
    });
  }

  /**
   * Validate a single field in real-time
   */
  validateFieldRealtime(fieldName, fieldElement) {
    if (!fieldElement) return;

    let isValid = false;

    // Handle nested field paths
    const parts = fieldName.split('.');
    let value;

    if (parts.length === 2) {
      value = this.formData[parts[0]][parts[1]];
    } else {
      value = this.formData[fieldName];
    }

    switch(fieldName) {
      case 'trip.name':
      case 'trip.dateStart':
      case 'trip.dateEnd':
      case 'trip.destCity':
      case 'org.orgName':
      case 'org.orgType':
      case 'org.role':
        isValid = value && value.toString().trim() !== '';
        break;

      case 'trip.adults':
        isValid = value && parseInt(value) >= 1;
        break;

      case 'org.email':
        isValid = value && this.isValidEmail(value);
        break;

      case 'org.phone':
        if (value && value.trim() !== '') {
          isValid = this.isValidPhone(value);
        } else {
          fieldElement.classList.remove('is-invalid', 'is-valid');
          return;
        }
        break;

      default:
        return;
    }

    if (isValid) {
      fieldElement.classList.remove('is-invalid');
      fieldElement.classList.add('is-valid');
    } else if (value && value.toString().trim() !== '') {
      fieldElement.classList.remove('is-valid');
      fieldElement.classList.add('is-invalid');
    } else {
      fieldElement.classList.remove('is-invalid', 'is-valid');
    }
  }

  /**
   * Show confirmation page
   */
  showConfirmation() {
    const pricing = this.calculateTotal();
    const tierInfo = this.pricingConfig.tiers[this.formData.plan.tier];

    this.element.innerHTML = `
      <div class="st-quote-confirmation">
        <div class="text-center mb-5">
          <div class="st-quote-confirmation-icon">
            <span class="material-symbols-outlined">check_circle</span>
          </div>
          <h2 class="st-quote-confirmation-title">Request Received!</h2>
          <p class="st-quote-confirmation-subtitle">
            We've received your ${this.formData.checkout.mode === 'order' ? 'order' : 'quote request'} and will be in touch shortly.
          </p>
        </div>

        <div class="st-quote-confirmation-summary">
          <h3 class="mb-4">Order Summary</h3>

          <div class="st-quote-summary-item">
            <div class="st-quote-summary-label">Trip Tier</div>
            <div class="st-quote-summary-value">${tierInfo.label}</div>
            <div class="st-quote-summary-price">$${tierInfo.price.toFixed(2)}</div>
          </div>

          ${pricing.bgDomestic > 0 ? `
            <div class="st-quote-summary-item">
              <div class="st-quote-summary-label">Background Checks (US)</div>
              <div class="st-quote-summary-value">${this.formData.addons.bgAdultsDomestic} adults × $35</div>
              <div class="st-quote-summary-price">$${pricing.bgDomestic.toFixed(2)} <small>(billed later)</small></div>
            </div>
          ` : ''}

          ${pricing.bgInternational > 0 ? `
            <div class="st-quote-summary-item">
              <div class="st-quote-summary-label">Background Checks (Intl)</div>
              <div class="st-quote-summary-value">${this.formData.addons.bgAdultsInternational} adults × $65</div>
              <div class="st-quote-summary-price">$${pricing.bgInternational.toFixed(2)} <small>(billed later)</small></div>
            </div>
          ` : ''}

          <div class="st-quote-summary-total">
            <div class="st-quote-summary-label">Today's Total</div>
            <div class="st-quote-summary-price">$${pricing.todayTotal.toFixed(2)}</div>
          </div>

          ${pricing.postBilled > 0 ? `
            <div class="alert alert-info mt-3">
              <span class="material-symbols-outlined">info</span>
              <div>
                Background checks ($${pricing.postBilled.toFixed(2)}) will be billed separately after adult consent is completed.
              </div>
            </div>
          ` : ''}
        </div>

        <div class="st-quote-confirmation-details">
          <h3 class="mb-3">Trip Details</h3>
          <dl class="row">
            <dt class="col-sm-4">Trip Name</dt>
            <dd class="col-sm-8">${this.formData.trip.name}</dd>

            <dt class="col-sm-4">Destination</dt>
            <dd class="col-sm-8">${this.formData.trip.destCity}, ${this.formData.trip.destCountry}</dd>

            <dt class="col-sm-4">Dates</dt>
            <dd class="col-sm-8">${this.formatDate(this.formData.trip.dateStart)} - ${this.formatDate(this.formData.trip.dateEnd)}</dd>

            <dt class="col-sm-4">Participants</dt>
            <dd class="col-sm-8">${this.formData.trip.adults} adults, ${this.formData.trip.minors} minors</dd>

            <dt class="col-sm-4">Organization</dt>
            <dd class="col-sm-8">${this.formData.org.orgName}</dd>

            <dt class="col-sm-4">Contact</dt>
            <dd class="col-sm-8">${this.formData.org.role}<br>${this.formData.org.email}</dd>
          </dl>
        </div>

        <div class="st-quote-confirmation-next-steps">
          <h3 class="mb-3">What's Next?</h3>
          <ol class="st-quote-next-steps-list">
            ${this.formData.checkout.mode === 'order' ? `
              <li>
                <strong>Payment Confirmation</strong><br>
                You'll receive a payment receipt at ${this.formData.org.email} within minutes.
              </li>
              <li>
                <strong>Account Setup</strong><br>
                We'll send you login credentials to access your Safetrekr dashboard within 24 hours.
              </li>
            ` : this.formData.checkout.mode === 'invoice' ? `
              <li>
                <strong>Invoice Delivery</strong><br>
                We'll send an invoice to ${this.formData.org.email} within 1 business day.
              </li>
              <li>
                <strong>Account Setup</strong><br>
                Once payment is received, we'll create your account and send login credentials.
              </li>
            ` : `
              <li>
                <strong>Quote Delivery</strong><br>
                You'll receive a detailed PDF quote at ${this.formData.org.email} within 2 hours.
              </li>
              <li>
                <strong>Follow-up Call</strong><br>
                Our team will reach out within 1 business day to discuss your trip and answer questions.
              </li>
            `}
            <li>
              <strong>Trip Input</strong><br>
              Log into your dashboard to enter your complete trip details and itinerary.
            </li>
            <li>
              <strong>Analyst Review</strong><br>
              Our safety analyst will review your trip and provide recommendations (3-5 business days).
            </li>
            <li>
              <strong>Trip Packet</strong><br>
              Receive your professional trip packet and start your confident journey!
            </li>
          </ol>
        </div>

        <div class="text-center mt-5">
          <a href="./index.html" class="st-marketing-cta-primary">
            Return to Home
            <span class="material-symbols-outlined">arrow_forward</span>
          </a>
          <a href="./resources.html" class="st-marketing-cta-secondary">
            Download Free Resources
          </a>
        </div>
      </div>
    `;
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /**
   * Render the form
   */
  render() {
    if (!this.element) return;

    this.element.innerHTML = `
      <div class="st-quote-form-wrapper">
        <div class="st-quote-form-container">
        <!-- Progress Indicator -->
        ${this.renderProgressIndicator()}

        <!-- Error Container -->
        <div data-errors></div>

        <!-- Step Content -->
        <div class="st-quote-form-content">
          ${this.renderStepContent()}
        </div>

        <!-- Navigation Buttons -->
        <div class="st-quote-form-navigation">
          ${this.currentStep > 1 ? `
            <button type="button" class="st-marketing-cta-secondary" data-action="prev">
              <span class="material-symbols-outlined">arrow_back</span>
              Back
            </button>
          ` : '<div></div>'}

          ${this.currentStep < this.totalSteps ? `
            <button type="button" class="st-marketing-cta-primary" data-action="next">
              Continue
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          ` : `
            <button type="button" class="st-marketing-cta-primary" data-submit>
              Submit Request
              <span class="material-symbols-outlined">send</span>
            </button>
          `}
        </div>
        </div>

        <!-- Order Summary Sidebar -->
        ${this.renderOrderSummary()}
      </div>
    `;

    this.attachEventListeners();
  }

  /**
   * Render progress indicator
   */
  renderProgressIndicator() {
    const steps = [
      { number: 1, label: 'Plan' },
      { number: 2, label: 'Trip' },
      { number: 3, label: 'Add-ons' },
      { number: 4, label: 'Organization' },
      { number: 5, label: 'Checkout' }
    ];

    return `
      <div class="st-quote-progress">
        ${steps.map(step => `
          <div class="st-quote-progress-step ${step.number === this.currentStep ? 'active' : ''} ${step.number < this.currentStep ? 'completed' : ''}">
            <div class="st-quote-progress-step-number">
              ${step.number < this.currentStep ? '<span class="material-symbols-outlined">check</span>' : step.number}
            </div>
            <div class="st-quote-progress-step-label">${step.label}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render step content
   */
  renderStepContent() {
    switch(this.currentStep) {
      case 1: return this.renderStep1();
      case 2: return this.renderStep2();
      case 3: return this.renderStep3();
      case 4: return this.renderStep4();
      case 5: return this.renderStep5();
      default: return '';
    }
  }

  /**
   * Render Step 1: Plan (Tier selection with toggles)
   */
  renderStep1() {
    if (!this.pricingConfig) {
      return '<div class="st-quote-step">Loading pricing...</div>';
    }

    // Show risk banner if international is selected but tier is not T3
    const showRiskBanner = this.formData.plan.international && this.formData.plan.tier !== 'T3';

    return `
      <div class="st-quote-step">
        <h2 class="st-quote-step-title">Select your plan</h2>
        <p class="st-quote-step-subtitle">Choose the tier that best fits your trip needs</p>

        <!-- Tier Selection -->
        <div class="st-quote-tier-selection">
          ${Object.keys(this.pricingConfig.tiers).map(tierKey => {
            const tier = this.pricingConfig.tiers[tierKey];
            const isEnabled = tier.enabled;
            const isSelected = this.formData.plan.tier === tierKey;

            return `
              <div class="st-quote-tier-card ${isSelected ? 'selected' : ''} ${!isEnabled ? 'disabled' : ''}" data-tier="${tierKey}" data-action="select-tier-card">
                <div class="st-quote-tier-header">
                  <div class="st-quote-tier-name">${tier.label}</div>
                  <div class="st-quote-tier-price">$${tier.price}</div>
                </div>
                <div class="st-quote-tier-description">${tier.description || ''}</div>
                ${tier.features ? `
                  <ul class="st-quote-tier-features">
                    ${tier.features.map(feature => `<li>${feature}</li>`).join('')}
                  </ul>
                ` : ''}
                <button type="button" class="st-marketing-cta-primary w-100" data-action="select-tier" data-tier="${tierKey}" ${!isEnabled ? 'disabled' : ''}>
                  ${!isEnabled ? 'Coming Soon' : isSelected ? 'Selected' : 'Select Tier'}
                </button>
              </div>
            `;
          }).join('')}
        </div>

        <!-- International/Overnight Toggles (Below tier cards) -->
        <div class="st-quote-form-section mt-4">
          <div class="row g-3">
            <div class="col-md-6">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="toggleInternational" data-field="plan.international" ${this.formData.plan.international ? 'checked' : ''}>
                <label class="form-check-label" for="toggleInternational">
                  <strong>International Travel</strong>
                </label>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="toggleOvernight" data-field="plan.overnight" ${this.formData.plan.overnight ? 'checked' : ''}>
                <label class="form-check-label" for="toggleOvernight">
                  <strong>Overnight Stay</strong>
                </label>
              </div>
            </div>
          </div>
        </div>

        ${showRiskBanner ? `
          <div class="st-alert st-alert-danger mt-4" role="alert">
            <div class="st-alert-icon">
              <span class="material-symbols-outlined">warning</span>
            </div>
            <div class="st-alert-content">
              <strong class="st-alert-title">International Travel Requires Tier 3</strong>
              <p>Your selected tier does not include international travel coverage. Please either:</p>
              <ul class="st-alert-list">
                <li>Select Tier 3 - International/Complex for full international coverage</li>
                <li>Uncheck "International Travel" if this is a domestic trip</li>
                <li>Acknowledge you understand the limitation and proceed at your own risk</li>
              </ul>
              <div class="form-check mt-3">
                <input class="form-check-input" type="checkbox" id="ackInternational" data-field="plan.internationalAcknowledged" ${this.formData.plan.internationalAcknowledged ? 'checked' : ''}>
                <label class="form-check-label" for="ackInternational">
                  I acknowledge this tier does not fully cover international travel
                </label>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render Step 2: Trip Details
   */
  renderStep2() {
    return `
      <div class="st-quote-step">
        <h2 class="st-quote-step-title">Trip details</h2>
        <p class="st-quote-step-subtitle">Tell us about your trip</p>

        <div class="st-quote-form-section">
          <!-- Required Fields -->
          <h3 class="mb-4">Required Information</h3>
          <div class="row g-4">
            <div class="col-12">
              <label class="st-quote-form-label">Trip Name *</label>
              <input type="text" class="st-quote-form-input" data-field="trip.name" value="${this.formData.trip.name}" placeholder="e.g., Spring 2025 Science Field Trip" required>
            </div>

            <div class="col-md-6">
              <label class="st-quote-form-label">Start Date *</label>
              <input type="date" class="st-quote-form-input" data-field="trip.dateStart" value="${this.formData.trip.dateStart}" required>
            </div>

            <div class="col-md-6">
              <label class="st-quote-form-label">End Date *</label>
              <input type="date" class="st-quote-form-input" data-field="trip.dateEnd" value="${this.formData.trip.dateEnd}" required>
            </div>

            <div class="col-md-8">
              <label class="st-quote-form-label">Destination City *</label>
              <input type="text" class="st-quote-form-input" data-field="trip.destCity" value="${this.formData.trip.destCity}" placeholder="e.g., San Francisco" required>
            </div>

            <div class="col-md-4">
              <label class="st-quote-form-label">Country *</label>
              <select class="st-quote-form-select" data-field="trip.destCountry" required>
                <option value="US" ${this.formData.trip.destCountry === 'US' ? 'selected' : ''}>United States</option>
                <option value="CA" ${this.formData.trip.destCountry === 'CA' ? 'selected' : ''}>Canada</option>
                <option value="MX" ${this.formData.trip.destCountry === 'MX' ? 'selected' : ''}>Mexico</option>
                <option value="OTHER" ${this.formData.trip.destCountry === 'OTHER' ? 'selected' : ''}>Other</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="st-quote-form-label">Number of Adults *</label>
              <input type="number" class="st-quote-form-input" data-field="trip.adults" value="${this.formData.trip.adults || ''}" placeholder="0" min="1" required>
            </div>

            <div class="col-md-6">
              <label class="st-quote-form-label">Number of Minors *</label>
              <input type="number" class="st-quote-form-input" data-field="trip.minors" value="${this.formData.trip.minors || ''}" placeholder="0" min="0" required>
            </div>
          </div>

          <!-- Optional Fields (Collapsible) -->
          <div style="margin-top: 3rem;">
            <button type="button" class="st-marketing-cta-secondary" data-action="toggle-more-details">
              <span class="material-symbols-outlined">${this.formData.trip.showMoreDetails ? 'expand_less' : 'expand_more'}</span>
              ${this.formData.trip.showMoreDetails ? 'Hide' : 'Show'} Optional Details
            </button>
          </div>

          ${this.formData.trip.showMoreDetails ? `
            <div class="mt-4">
              <h3 class="mb-4">Optional Information</h3>
              <div class="row g-4">
                <div class="col-md-6">
                  <label class="st-quote-form-label">Origin City (Optional)</label>
                  <input type="text" class="st-quote-form-input" data-field="trip.originCity" value="${this.formData.trip.originCity}" placeholder="e.g., Boston">
                </div>

                <div class="col-md-6">
                  <label class="st-quote-form-label">Primary Transport (Optional)</label>
                  <select class="st-quote-form-select" data-field="trip.transport">
                    <option value="">Select...</option>
                    <option value="bus" ${this.formData.trip.transport === 'bus' ? 'selected' : ''}>Bus/Charter</option>
                    <option value="flight" ${this.formData.trip.transport === 'flight' ? 'selected' : ''}>Flight</option>
                    <option value="van" ${this.formData.trip.transport === 'van' ? 'selected' : ''}>Van/Personal Vehicle</option>
                    <option value="other" ${this.formData.trip.transport === 'other' ? 'selected' : ''}>Other</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="st-quote-form-label">Lodging Status (Optional)</label>
                  <select class="st-quote-form-select" data-field="trip.lodgingStatus">
                    <option value="">Select...</option>
                    <option value="booked" ${this.formData.trip.lodgingStatus === 'booked' ? 'selected' : ''}>Booked</option>
                    <option value="pending" ${this.formData.trip.lodgingStatus === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="none" ${this.formData.trip.lodgingStatus === 'none' ? 'selected' : ''}>No lodging needed</option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="st-quote-form-label">Additional Notes (Optional)</label>
                  <textarea class="st-quote-form-input" data-field="trip.notes" rows="3" placeholder="Any special considerations, activities, or details we should know...">${this.formData.trip.notes}</textarea>
                </div>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render Step 3: Add-ons
   */
  renderStep3() {
    const bgDomesticPrice = 35;
    const bgInternationalPrice = 65;

    return `
      <div class="st-quote-step">
        <h2 class="st-quote-step-title">Add-ons</h2>
        <p class="st-quote-step-subtitle">Enhance your trip with optional services (all optional)</p>

        <div class="st-quote-addons-grid">
          <!-- Background Checks - Domestic -->
          <div class="st-quote-addon-card">
            <div class="st-quote-addon-header">
              <div class="st-quote-addon-name">Background Checks - U.S. Adults</div>
              <div class="st-quote-addon-price">$${bgDomesticPrice} per adult</div>
            </div>
            <div class="st-quote-addon-description">
              U.S. background checks for adult chaperones. Consent collected after checkout.
            </div>
            <div class="mt-3">
              <label class="st-quote-form-label">Number of U.S. adults to screen:</label>
              <input type="number" class="st-quote-form-input" data-field="addons.bgAdultsDomestic" value="${this.formData.addons.bgAdultsDomestic || 0}" min="0" max="100">
              ${this.formData.addons.bgAdultsDomestic > 0 ? `
                <small class="text-muted d-block mt-2">
                  Subtotal: $${(this.formData.addons.bgAdultsDomestic * bgDomesticPrice).toFixed(2)} (billed after consent)
                </small>
              ` : ''}
            </div>
          </div>

          <!-- Background Checks - International -->
          <div class="st-quote-addon-card">
            <div class="st-quote-addon-header">
              <div class="st-quote-addon-name">Background Checks - International Adults</div>
              <div class="st-quote-addon-price">$${bgInternationalPrice} per adult</div>
            </div>
            <div class="st-quote-addon-description">
              International background checks for adults with international travel history.
            </div>
            <div class="mt-3">
              <label class="st-quote-form-label">Number of international adults to screen:</label>
              <input type="number" class="st-quote-form-input" data-field="addons.bgAdultsInternational" value="${this.formData.addons.bgAdultsInternational || 0}" min="0" max="100">
              ${this.formData.addons.bgAdultsInternational > 0 ? `
                <small class="text-muted d-block mt-2">
                  Subtotal: $${(this.formData.addons.bgAdultsInternational * bgInternationalPrice).toFixed(2)} (billed after consent)
                </small>
              ` : ''}
            </div>
          </div>
        </div>

        <div class="alert alert-info mt-4">
          <span class="material-symbols-outlined">info</span>
          <div>
            <strong>Note about background checks:</strong>
            Background check fees are billed separately after adult consent forms are completed. They are not included in today's total.
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Step 4: Organization
   */
  renderStep4() {
    return `
      <div class="st-quote-step">
        <h2 class="st-quote-step-title">Organization information</h2>
        <p class="st-quote-step-subtitle">We'll use this to set up your account</p>

        <div class="st-quote-form-section">
          <div class="row g-4">
            <div class="col-md-6">
              <label class="st-quote-form-label">Organization Type *</label>
              <select class="st-quote-form-select" data-field="org.orgType" required>
                <option value="">Select type...</option>
                <option value="k12" ${this.formData.org.orgType === 'k12' ? 'selected' : ''}>K-12 School</option>
                <option value="higher_ed" ${this.formData.org.orgType === 'higher_ed' ? 'selected' : ''}>College/University</option>
                <option value="church" ${this.formData.org.orgType === 'church' ? 'selected' : ''}>Church</option>
                <option value="youth_sports" ${this.formData.org.orgType === 'youth_sports' ? 'selected' : ''}>Youth Sports</option>
                <option value="corporate" ${this.formData.org.orgType === 'corporate' ? 'selected' : ''}>Corporate</option>
                <option value="nonprofit" ${this.formData.org.orgType === 'nonprofit' ? 'selected' : ''}>Nonprofit</option>
                <option value="other" ${this.formData.org.orgType === 'other' ? 'selected' : ''}>Other</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="st-quote-form-label">Organization Name *</label>
              <input type="text" class="st-quote-form-input" data-field="org.orgName" value="${this.formData.org.orgName}" placeholder="Your school/organization name" required>
            </div>

            <div class="col-md-6">
              <label class="st-quote-form-label">Your Role/Title *</label>
              <input type="text" class="st-quote-form-input" data-field="org.role" value="${this.formData.org.role}" placeholder="e.g., Trip Coordinator, Principal" required>
            </div>

            <div class="col-md-6">
              <label class="st-quote-form-label">Your Email *</label>
              <input type="email" class="st-quote-form-input" data-field="org.email" value="${this.formData.org.email}" placeholder="your@email.com" required>
            </div>

            <div class="col-md-6">
              <label class="st-quote-form-label">Phone Number (Optional)</label>
              <input type="tel" class="st-quote-form-input" data-field="org.phone" value="${this.formData.org.phone}" placeholder="(555) 123-4567">
            </div>

            <div class="col-md-6">
              <div class="form-check mt-4">
                <input class="form-check-input" type="checkbox" id="taxExempt" data-field="org.taxExempt" ${this.formData.org.taxExempt ? 'checked' : ''}>
                <label class="form-check-label" for="taxExempt">
                  We are tax-exempt
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Step 5: Checkout
   */
  renderStep5() {
    return `
      <div class="st-quote-step">
        <h2 class="st-quote-step-title">Checkout</h2>
        <p class="st-quote-step-subtitle">Select how you'd like to proceed</p>

        <div class="st-quote-payment-options">
          <!-- Order Now -->
          <div class="st-quote-payment-card ${this.formData.checkout.mode === 'order' ? 'selected' : ''}" data-checkout="order">
            <div class="st-quote-payment-header">
              <input type="radio" class="form-check-input" name="checkoutMode" data-field="checkout.mode" value="order" ${this.formData.checkout.mode === 'order' ? 'checked' : ''}>
              <div class="st-quote-payment-name">Order Now</div>
              <div class="st-quote-payment-badge">Fastest</div>
            </div>
            <div class="st-quote-payment-description">
              Pay now with credit card to start immediately. Get instant access to your dashboard.
            </div>

            ${this.formData.checkout.mode === 'order' ? `
              <div class="st-quote-payment-details mt-4">
                <div class="alert alert-info">
                  <span class="material-symbols-outlined">credit_card</span>
                  <div>
                    <strong>Stripe integration will be added here</strong>
                    <br>Secure payment processing with Stripe
                  </div>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Invoice / PO -->
          <div class="st-quote-payment-card ${this.formData.checkout.mode === 'invoice' ? 'selected' : ''}" data-checkout="invoice">
            <div class="st-quote-payment-header">
              <input type="radio" class="form-check-input" name="checkoutMode" data-field="checkout.mode" value="invoice" ${this.formData.checkout.mode === 'invoice' ? 'checked' : ''}>
              <div class="st-quote-payment-name">Request Invoice</div>
            </div>
            <div class="st-quote-payment-description">
              We'll email an invoice (Net 30). Work can start after payment or approved PO.
            </div>

            ${this.formData.checkout.mode === 'invoice' ? `
              <div class="st-quote-payment-details mt-4">
                <div class="mb-3">
                  <label class="st-quote-form-label">Billing Address *</label>
                  <textarea class="st-quote-form-input" data-field="checkout.billingAddress" rows="3" placeholder="Enter your billing address" required>${this.formData.checkout.billingAddress}</textarea>
                </div>

                <div class="mb-3">
                  <label class="st-quote-form-label">AP Email *</label>
                  <input type="email" class="st-quote-form-input" data-field="checkout.apEmail" value="${this.formData.checkout.apEmail}" placeholder="accounts.payable@organization.com" required>
                </div>

                <div class="mb-3">
                  <label class="st-quote-form-label">PO Number (Optional)</label>
                  <input type="text" class="st-quote-form-input" data-field="checkout.poNumber" value="${this.formData.checkout.poNumber}" placeholder="PO-2025-001">
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Request a Quote -->
          <div class="st-quote-payment-card ${this.formData.checkout.mode === 'quote' ? 'selected' : ''}" data-checkout="quote">
            <div class="st-quote-payment-header">
              <input type="radio" class="form-check-input" name="checkoutMode" data-field="checkout.mode" value="quote" ${this.formData.checkout.mode === 'quote' ? 'checked' : ''}>
              <div class="st-quote-payment-name">Request Quote (PDF)</div>
            </div>
            <div class="st-quote-payment-description">
              Download a 30-day quote to route internally. Your cart is saved for easy ordering later.
            </div>
          </div>
        </div>

        <!-- Agreement Checkboxes -->
        <div class="st-quote-agreements mt-5">
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="agreeAuthorized" data-field="checkout.agreedToAuthorization" ${this.formData.checkout.agreedToAuthorization ? 'checked' : ''} required>
            <label class="form-check-label" for="agreeAuthorized">
              I am authorized to make this purchase or request a quote on behalf of my organization. *
            </label>
          </div>

          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="agreeTerms" data-field="checkout.agreedToTerms" ${this.formData.checkout.agreedToTerms ? 'checked' : ''} required>
            <label class="form-check-label" for="agreeTerms">
              I agree to the <a href="./terms.html" target="_blank">Terms of Service</a> and <a href="./privacy.html" target="_blank">Privacy Policy</a>. *
            </label>
          </div>
        </div>

        <!-- Security Note -->
        <div class="alert alert-secondary mt-4">
          <span class="material-symbols-outlined">lock</span>
          <div>
            <strong>Secure & Confidential</strong><br>
            Your information is encrypted and never shared. All payments are processed securely through Stripe.
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render order summary sidebar
   */
  renderOrderSummary() {
    const pricing = this.calculateTotal();
    const tierInfo = this.formData.plan.tier && this.pricingConfig ? this.pricingConfig.tiers[this.formData.plan.tier] : null;

    return `
      <div class="st-quote-summary-sidebar">
        <div class="st-quote-summary-sticky">
          <h3 class="st-quote-summary-title">Order Summary</h3>

          ${tierInfo ? `
            <div class="st-quote-summary-item">
              <div class="st-quote-summary-label">${tierInfo.label}</div>
              <div class="st-quote-summary-price">$${tierInfo.price.toFixed(2)}</div>
            </div>
          ` : `
            <div class="st-quote-summary-empty">
              Select a trip tier to see pricing
            </div>
          `}

          ${this.formData.addons.bgAdultsDomestic > 0 || this.formData.addons.bgAdultsInternational > 0 ? `
            <div class="st-quote-summary-section">
              <div class="st-quote-summary-section-title">Add-ons (billed later)</div>

              ${this.formData.addons.bgAdultsDomestic > 0 ? `
                <div class="st-quote-summary-item">
                  <div class="st-quote-summary-label">
                    BG Checks (US)<br>
                    <small class="text-muted">${this.formData.addons.bgAdultsDomestic} × $35</small>
                  </div>
                  <div class="st-quote-summary-price">
                    <small>$${pricing.bgDomestic.toFixed(2)}</small>
                  </div>
                </div>
              ` : ''}

              ${this.formData.addons.bgAdultsInternational > 0 ? `
                <div class="st-quote-summary-item">
                  <div class="st-quote-summary-label">
                    BG Checks (Intl)<br>
                    <small class="text-muted">${this.formData.addons.bgAdultsInternational} × $65</small>
                  </div>
                  <div class="st-quote-summary-price">
                    <small>$${pricing.bgInternational.toFixed(2)}</small>
                  </div>
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${tierInfo ? `
            <div class="st-quote-summary-total">
              <div class="st-quote-summary-label">Today's Total</div>
              <div class="st-quote-summary-price">$${pricing.todayTotal.toFixed(2)}</div>
            </div>

            ${pricing.postBilled > 0 ? `
              <div class="st-quote-summary-note mt-3">
                <small class="text-muted">
                  + $${pricing.postBilled.toFixed(2)} background checks billed after consent
                </small>
              </div>
            ` : ''}
          ` : ''}

          <div class="st-quote-summary-note">
            <span class="material-symbols-outlined">info</span>
            <div>
              This is a one-time fee per trip. No subscriptions or hidden costs.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    if (!this.element) return;

    // Tier selection - button click
    this.element.querySelectorAll('[data-action="select-tier"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click event
        const tier = e.target.dataset.tier;
        if (!this.pricingConfig.tiers[tier].enabled) return;

        this.formData.plan.tier = tier;

        // Track analytics
        const tierInfo = this.pricingConfig.tiers[tier];
        Analytics.trackPricingTierSelect(tierInfo.label, tierInfo.price);

        this.render();
      });
    });

    // Tier selection - card click (click anywhere on the card)
    this.element.querySelectorAll('[data-action="select-tier-card"]').forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking the button itself
        if (e.target.closest('[data-action="select-tier"]')) return;

        const tier = card.dataset.tier;
        if (!this.pricingConfig.tiers[tier].enabled) return;

        this.formData.plan.tier = tier;

        // Track analytics
        const tierInfo = this.pricingConfig.tiers[tier];
        Analytics.trackPricingTierSelect(tierInfo.label, tierInfo.price);

        this.render();
      });
    });

    // Toggle more details button
    const toggleMoreBtn = this.element.querySelector('[data-action="toggle-more-details"]');
    if (toggleMoreBtn) {
      toggleMoreBtn.addEventListener('click', () => {
        this.formData.trip.showMoreDetails = !this.formData.trip.showMoreDetails;
        this.render();
      });
    }

    // Form fields
    this.element.querySelectorAll('[data-field]').forEach(field => {
      // Handle change events
      field.addEventListener('change', (e) => {
        this.handleFieldChange(e);
      });

      // Handle input events for real-time validation
      if (field.tagName === 'INPUT' || field.tagName === 'SELECT' || field.tagName === 'TEXTAREA') {
        field.addEventListener('input', (e) => {
          this.handleFieldInput(e);
        });
      }
    });

    // Navigation buttons
    const prevBtn = this.element.querySelector('[data-action="prev"]');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prevStep());
    }

    const nextBtn = this.element.querySelector('[data-action="next"]');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextStep());
    }

    const submitBtn = this.element.querySelector('[data-submit]');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitForm());
    }

    // Payment option cards - click anywhere to select
    this.element.querySelectorAll('.st-quote-payment-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('form-check-input') && !e.target.closest('[data-field]')) {
          const radio = card.querySelector('input[type="radio"]');
          if (radio) {
            radio.checked = true;
            this.formData.checkout.mode = radio.value;
            this.render();
          }
        }
      });
    });
  }

  /**
   * Handle field change events
   */
  handleFieldChange(e) {
    const fieldName = e.target.dataset.field;
    const parts = fieldName.split('.');

    if (parts.length === 2) {
      // Nested field (e.g., "plan.tier", "trip.name")
      const [section, key] = parts;

      if (e.target.type === 'checkbox') {
        this.formData[section][key] = e.target.checked;
      } else if (e.target.type === 'number') {
        this.formData[section][key] = parseInt(e.target.value) || 0;
      } else {
        this.formData[section][key] = e.target.value;
      }

      // Re-render on certain changes
      if (fieldName === 'plan.international' || fieldName === 'plan.overnight' ||
          fieldName === 'plan.internationalAcknowledged' || fieldName === 'checkout.mode') {
        this.render();
      }
    }
  }

  /**
   * Handle field input events
   */
  handleFieldInput(e) {
    const fieldName = e.target.dataset.field;
    const parts = fieldName.split('.');

    if (parts.length === 2) {
      const [section, key] = parts;

      if (e.target.type === 'checkbox') {
        this.formData[section][key] = e.target.checked;
      } else if (e.target.type === 'number') {
        this.formData[section][key] = parseInt(e.target.value) || 0;
      } else {
        this.formData[section][key] = e.target.value;
      }

      // Real-time validation
      this.validateFieldRealtime(fieldName, e.target);

      // Update summary for addon changes
      if (section === 'addons') {
        const summaryContainer = this.element.querySelector('.st-quote-summary-sidebar');
        if (summaryContainer) {
          summaryContainer.outerHTML = this.renderOrderSummary();
        }
      }
    }
  }

  /**
   * Mount the component
   */
  async mount(selector) {
    const container = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!container) {
      console.error('QuoteForm: Mount target not found');
      return;
    }

    this.element = container;

    // Load pricing config first
    await this.loadPricingConfig();

    // Then render
    this.render();
  }
}

export default QuoteForm;
