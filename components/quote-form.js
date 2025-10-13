/**
 * Quote Form Component
 * Multi-step form for requesting trip quotes with tier selection, add-ons, and payment options
 */

import { Analytics } from './analytics.js';

export class QuoteForm {
  constructor(options = {}) {
    this.currentStep = 1;
    this.totalSteps = 4;
    this.formData = {
      // Step 1: Trip Details
      tripTier: null,
      tripType: '',
      departureDate: '',
      returnDate: '',
      destination: '',
      participantCount: '',

      // Step 2: Add-ons
      addons: [],

      // Step 3: Organization Info
      organizationType: '',
      organizationName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',

      // Step 4: Payment Path
      paymentPath: null,
      cardInfo: null
    };

    this.pricing = {
      tiers: {
        domestic_day: {
          name: 'Domestic Day/Overnight',
          price: 450,
          description: 'Single or overnight trips within the United States',
          features: [
            'Professional safety analyst review',
            'Trip packet with maps & itinerary',
            'Emergency contact verification',
            'Basic risk assessment',
            '3-5 business day turnaround'
          ]
        },
        domestic_multi: {
          name: 'Multi-Day Domestic',
          price: 750,
          description: 'Extended trips (2+ days) within the United States',
          features: [
            'Everything in Day/Overnight, plus:',
            'Enhanced itinerary review',
            'Multiple lodging verification',
            'Transportation safety checks',
            'Activity-specific risk assessment'
          ]
        },
        international: {
          name: 'International/Complex',
          price: 1250,
          description: 'International travel or high-risk domestic activities',
          features: [
            'Everything in Multi-Day, plus:',
            'Global risk intelligence',
            'Embassy & consulate info',
            'International medical resources',
            'Cultural & legal considerations',
            'Priority 24-48 hour turnaround'
          ]
        }
      },
      addons: {
        background_checks: {
          name: 'Background Checks',
          price: 150,
          description: 'Integrated background screening for chaperones and staff',
          per: 'trip'
        },
        parent_comms: {
          name: 'Parent Communications',
          price: 100,
          description: 'Pre-trip parent portal with forms and updates',
          per: 'trip'
        },
        incident_debrief: {
          name: 'Incident Debrief',
          price: 200,
          description: 'Post-trip incident review and documentation',
          per: 'trip'
        },
        live_tracking: {
          name: 'Live Trip Tracking',
          price: 125,
          description: 'Real-time GPS tracking during trip',
          per: 'trip'
        },
        rush_service: {
          name: 'Rush Service (24hr)',
          price: 300,
          description: '24-hour expedited analyst review',
          per: 'trip'
        }
      }
    };

    this.element = null;
  }

  /**
   * Calculate total price
   */
  calculateTotal() {
    let total = 0;

    // Add tier price
    if (this.formData.tripTier) {
      total += this.pricing.tiers[this.formData.tripTier].price;
    }

    // Add addon prices
    this.formData.addons.forEach(addonKey => {
      total += this.pricing.addons[addonKey].price;
    });

    return total;
  }

  /**
   * Validate current step
   */
  validateStep(step) {
    const errors = [];

    switch(step) {
      case 1:
        if (!this.formData.tripTier) errors.push('Please select a trip tier');
        if (!this.formData.tripType) errors.push('Please select a trip type');
        if (!this.formData.departureDate) errors.push('Please enter a departure date');
        if (!this.formData.returnDate) errors.push('Please enter a return date');
        if (!this.formData.destination) errors.push('Please enter a destination');
        if (!this.formData.participantCount) errors.push('Please enter participant count');

        // Validate dates
        if (this.formData.departureDate && this.formData.returnDate) {
          const departure = new Date(this.formData.departureDate);
          const returnDate = new Date(this.formData.returnDate);
          if (returnDate < departure) {
            errors.push('Return date must be after departure date');
          }
        }
        break;

      case 2:
        // Add-ons are optional
        break;

      case 3:
        if (!this.formData.organizationType) errors.push('Please select organization type');
        if (!this.formData.organizationName) errors.push('Please enter organization name');
        if (!this.formData.contactName) errors.push('Please enter contact name');
        if (!this.formData.contactEmail) errors.push('Please enter contact email');

        // Validate email
        if (this.formData.contactEmail && !this.isValidEmail(this.formData.contactEmail)) {
          errors.push('Please enter a valid email address');
        }

        // Validate phone if provided
        if (this.formData.contactPhone && !this.isValidPhone(this.formData.contactPhone)) {
          errors.push('Please enter a valid phone number');
        }
        break;

      case 4:
        if (!this.formData.paymentPath) errors.push('Please select a payment option');

        // Validate card info if paying now
        if (this.formData.paymentPath === 'pay_now') {
          // Note: In real implementation, this would use Stripe Elements
          // For now, just validate that something was entered
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
      Analytics.trackQuoteRequest(
        this.pricing.tiers[this.formData.tripTier].name,
        this.formData.addons.map(key => this.pricing.addons[key].name)
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
        <div class="alert alert-danger" role="alert">
          <strong>Please correct the following:</strong>
          <ul class="mb-0 mt-2">
            ${errors.map(err => `<li>${err}</li>`).join('')}
          </ul>
        </div>
      `;
      errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
  }

  /**
   * Show confirmation page
   */
  showConfirmation() {
    const total = this.calculateTotal();
    const tierInfo = this.pricing.tiers[this.formData.tripTier];

    this.element.innerHTML = `
      <div class="st-quote-confirmation">
        <div class="text-center mb-5">
          <div class="st-quote-confirmation-icon">
            <span class="material-symbols-outlined">check_circle</span>
          </div>
          <h2 class="st-quote-confirmation-title">Request Received!</h2>
          <p class="st-quote-confirmation-subtitle">
            We've received your ${this.formData.paymentPath === 'pay_now' ? 'order' : 'quote request'} and will be in touch shortly.
          </p>
        </div>

        <div class="st-quote-confirmation-summary">
          <h3 class="mb-4">Order Summary</h3>

          <div class="st-quote-summary-item">
            <div class="st-quote-summary-label">Trip Tier</div>
            <div class="st-quote-summary-value">${tierInfo.name}</div>
            <div class="st-quote-summary-price">$${tierInfo.price.toFixed(2)}</div>
          </div>

          ${this.formData.addons.map(addonKey => {
            const addon = this.pricing.addons[addonKey];
            return `
              <div class="st-quote-summary-item">
                <div class="st-quote-summary-label">${addon.name}</div>
                <div class="st-quote-summary-value">${addon.description}</div>
                <div class="st-quote-summary-price">$${addon.price.toFixed(2)}</div>
              </div>
            `;
          }).join('')}

          <div class="st-quote-summary-total">
            <div class="st-quote-summary-label">Total</div>
            <div class="st-quote-summary-price">$${total.toFixed(2)}</div>
          </div>
        </div>

        <div class="st-quote-confirmation-details">
          <h3 class="mb-3">Trip Details</h3>
          <dl class="row">
            <dt class="col-sm-4">Destination</dt>
            <dd class="col-sm-8">${this.formData.destination}</dd>

            <dt class="col-sm-4">Dates</dt>
            <dd class="col-sm-8">${this.formatDate(this.formData.departureDate)} - ${this.formatDate(this.formData.returnDate)}</dd>

            <dt class="col-sm-4">Participants</dt>
            <dd class="col-sm-8">${this.formData.participantCount}</dd>

            <dt class="col-sm-4">Organization</dt>
            <dd class="col-sm-8">${this.formData.organizationName}</dd>

            <dt class="col-sm-4">Contact</dt>
            <dd class="col-sm-8">${this.formData.contactName}<br>${this.formData.contactEmail}</dd>
          </dl>
        </div>

        <div class="st-quote-confirmation-next-steps">
          <h3 class="mb-3">What's Next?</h3>
          <ol class="st-quote-next-steps-list">
            ${this.formData.paymentPath === 'pay_now' ? `
              <li>
                <strong>Payment Confirmation</strong><br>
                You'll receive a payment receipt at ${this.formData.contactEmail} within minutes.
              </li>
              <li>
                <strong>Account Setup</strong><br>
                We'll send you login credentials to access your SafeTrekr dashboard within 24 hours.
              </li>
            ` : this.formData.paymentPath === 'request_invoice' ? `
              <li>
                <strong>Invoice Delivery</strong><br>
                We'll send an invoice to ${this.formData.contactEmail} within 1 business day.
              </li>
              <li>
                <strong>Account Setup</strong><br>
                Once payment is received, we'll create your account and send login credentials.
              </li>
            ` : `
              <li>
                <strong>Quote Delivery</strong><br>
                You'll receive a detailed PDF quote at ${this.formData.contactEmail} within 2 hours.
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
      { number: 1, label: 'Trip Details' },
      { number: 2, label: 'Add-ons' },
      { number: 3, label: 'Organization' },
      { number: 4, label: 'Payment' }
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
      default: return '';
    }
  }

  /**
   * Render Step 1: Trip Details
   */
  renderStep1() {
    return `
      <div class="st-quote-step">
        <h2 class="st-quote-step-title">Tell us about your trip</h2>
        <p class="st-quote-step-subtitle">Select your trip tier and provide basic details</p>

        <!-- Tier Selection -->
        <div class="st-quote-tier-selection">
          ${Object.keys(this.pricing.tiers).map(tierKey => {
            const tier = this.pricing.tiers[tierKey];
            return `
              <div class="st-quote-tier-card ${this.formData.tripTier === tierKey ? 'selected' : ''}" data-tier="${tierKey}">
                <div class="st-quote-tier-header">
                  <div class="st-quote-tier-name">${tier.name}</div>
                  <div class="st-quote-tier-price">$${tier.price}</div>
                </div>
                <div class="st-quote-tier-description">${tier.description}</div>
                <ul class="st-quote-tier-features">
                  ${tier.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <button type="button" class="st-marketing-cta-primary w-100" data-action="select-tier" data-tier="${tierKey}">
                  ${this.formData.tripTier === tierKey ? 'Selected' : 'Select Tier'}
                </button>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Trip Details Form -->
        <div class="st-quote-form-section mt-5">
          <h3 class="mb-4">Trip Information</h3>

          <div class="row g-4">
            <div class="col-md-6">
              <label class="st-quote-form-label">Trip Type *</label>
              <select class="st-quote-form-select" data-field="tripType" required>
                <option value="">Select type...</option>
                <option value="field_trip" ${this.formData.tripType === 'field_trip' ? 'selected' : ''}>Field Trip</option>
                <option value="study_abroad" ${this.formData.tripType === 'study_abroad' ? 'selected' : ''}>Study Abroad</option>
                <option value="mission_trip" ${this.formData.tripType === 'mission_trip' ? 'selected' : ''}>Mission Trip</option>
                <option value="athletic" ${this.formData.tripType === 'athletic' ? 'selected' : ''}>Athletic/Competition</option>
                <option value="retreat" ${this.formData.tripType === 'retreat' ? 'selected' : ''}>Retreat/Camp</option>
                <option value="corporate" ${this.formData.tripType === 'corporate' ? 'selected' : ''}>Corporate Travel</option>
                <option value="other" ${this.formData.tripType === 'other' ? 'selected' : ''}>Other</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="st-quote-form-label">Destination *</label>
              <input type="text" class="st-quote-form-input" data-field="destination" value="${this.formData.destination}" placeholder="City, State/Country" required>
            </div>

            <div class="col-md-6">
              <label class="st-quote-form-label">Departure Date *</label>
              <input type="date" class="st-quote-form-input" data-field="departureDate" value="${this.formData.departureDate}" required>
            </div>

            <div class="col-md-6">
              <label class="st-quote-form-label">Return Date *</label>
              <input type="date" class="st-quote-form-input" data-field="returnDate" value="${this.formData.returnDate}" required>
            </div>

            <div class="col-md-6">
              <label class="st-quote-form-label">Number of Participants *</label>
              <input type="number" class="st-quote-form-input" data-field="participantCount" value="${this.formData.participantCount}" placeholder="e.g., 25" min="1" required>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Step 2: Add-ons
   */
  renderStep2() {
    return `
      <div class="st-quote-step">
        <h2 class="st-quote-step-title">Enhance your trip</h2>
        <p class="st-quote-step-subtitle">Select optional add-ons to streamline your trip management</p>

        <div class="st-quote-addons-grid">
          ${Object.keys(this.pricing.addons).map(addonKey => {
            const addon = this.pricing.addons[addonKey];
            const isSelected = this.formData.addons.includes(addonKey);

            return `
              <div class="st-quote-addon-card ${isSelected ? 'selected' : ''}" data-addon="${addonKey}">
                <div class="st-quote-addon-header">
                  <input type="checkbox" class="form-check-input" data-field="addon" data-addon="${addonKey}" ${isSelected ? 'checked' : ''}>
                  <div class="st-quote-addon-name">${addon.name}</div>
                  <div class="st-quote-addon-price">+$${addon.price}</div>
                </div>
                <div class="st-quote-addon-description">${addon.description}</div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="alert alert-info mt-4">
          <span class="material-symbols-outlined">info</span>
          <div>
            <strong>Not sure what you need?</strong>
            You can always add these features later from your dashboard.
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Step 3: Organization Info
   */
  renderStep3() {
    return `
      <div class="st-quote-step">
        <h2 class="st-quote-step-title">Tell us about your organization</h2>
        <p class="st-quote-step-subtitle">We'll use this information to set up your account</p>

        <div class="st-quote-form-section">
          <div class="row g-4">
            <div class="col-md-6">
              <label class="st-quote-form-label">Organization Type *</label>
              <select class="st-quote-form-select" data-field="organizationType" required>
                <option value="">Select type...</option>
                <option value="k12" ${this.formData.organizationType === 'k12' ? 'selected' : ''}>K-12 School</option>
                <option value="higher_ed" ${this.formData.organizationType === 'higher_ed' ? 'selected' : ''}>College/University</option>
                <option value="church" ${this.formData.organizationType === 'church' ? 'selected' : ''}>Church</option>
                <option value="youth_sports" ${this.formData.organizationType === 'youth_sports' ? 'selected' : ''}>Youth Sports</option>
                <option value="corporate" ${this.formData.organizationType === 'corporate' ? 'selected' : ''}>Corporate</option>
                <option value="nonprofit" ${this.formData.organizationType === 'nonprofit' ? 'selected' : ''}>Nonprofit</option>
                <option value="other" ${this.formData.organizationType === 'other' ? 'selected' : ''}>Other</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="st-quote-form-label">Organization Name *</label>
              <input type="text" class="st-quote-form-input" data-field="organizationName" value="${this.formData.organizationName}" placeholder="Your school/organization name" required>
            </div>

            <div class="col-md-6">
              <label class="st-quote-form-label">Your Name *</label>
              <input type="text" class="st-quote-form-input" data-field="contactName" value="${this.formData.contactName}" placeholder="First and last name" required>
            </div>

            <div class="col-md-6">
              <label class="st-quote-form-label">Your Email *</label>
              <input type="email" class="st-quote-form-input" data-field="contactEmail" value="${this.formData.contactEmail}" placeholder="your@email.com" required>
            </div>

            <div class="col-md-6">
              <label class="st-quote-form-label">Phone Number</label>
              <input type="tel" class="st-quote-form-input" data-field="contactPhone" value="${this.formData.contactPhone}" placeholder="(555) 123-4567">
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Step 4: Payment Path
   */
  renderStep4() {
    return `
      <div class="st-quote-step">
        <h2 class="st-quote-step-title">Choose your payment option</h2>
        <p class="st-quote-step-subtitle">Select how you'd like to proceed</p>

        <div class="st-quote-payment-options">
          <!-- Pay Now -->
          <div class="st-quote-payment-card ${this.formData.paymentPath === 'pay_now' ? 'selected' : ''}" data-payment="pay_now">
            <div class="st-quote-payment-header">
              <input type="radio" class="form-check-input" name="paymentPath" data-field="paymentPath" value="pay_now" ${this.formData.paymentPath === 'pay_now' ? 'checked' : ''}>
              <div class="st-quote-payment-name">Pay Now</div>
              <div class="st-quote-payment-badge">Fastest</div>
            </div>
            <div class="st-quote-payment-description">
              Pay securely with credit card and start immediately. Your trip packet review will begin within 24 hours.
            </div>

            ${this.formData.paymentPath === 'pay_now' ? `
              <div class="st-quote-payment-details mt-4">
                <div class="alert alert-info">
                  <span class="material-symbols-outlined">credit_card</span>
                  <div>
                    <strong>Stripe Integration</strong>
                    In production, this section would include Stripe Elements for secure credit card input.
                  </div>
                </div>

                <div class="mb-3">
                  <label class="st-quote-form-label">Card Number</label>
                  <input type="text" class="st-quote-form-input" placeholder="4242 4242 4242 4242" disabled>
                </div>

                <div class="row g-3">
                  <div class="col-6">
                    <label class="st-quote-form-label">Expiry</label>
                    <input type="text" class="st-quote-form-input" placeholder="MM/YY" disabled>
                  </div>
                  <div class="col-6">
                    <label class="st-quote-form-label">CVC</label>
                    <input type="text" class="st-quote-form-input" placeholder="123" disabled>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Request Invoice -->
          <div class="st-quote-payment-card ${this.formData.paymentPath === 'request_invoice' ? 'selected' : ''}" data-payment="request_invoice">
            <div class="st-quote-payment-header">
              <input type="radio" class="form-check-input" name="paymentPath" data-field="paymentPath" value="request_invoice" ${this.formData.paymentPath === 'request_invoice' ? 'checked' : ''}>
              <div class="st-quote-payment-name">Request Invoice/PO</div>
            </div>
            <div class="st-quote-payment-description">
              We'll send an invoice for payment via check or purchase order. Review begins once payment is received (typically 5-10 business days).
            </div>
          </div>

          <!-- Generate Quote -->
          <div class="st-quote-payment-card ${this.formData.paymentPath === 'generate_quote' ? 'selected' : ''}" data-payment="generate_quote">
            <div class="st-quote-payment-header">
              <input type="radio" class="form-check-input" name="paymentPath" data-field="paymentPath" value="generate_quote" ${this.formData.paymentPath === 'generate_quote' ? 'checked' : ''}>
              <div class="st-quote-payment-name">Generate Quote (PDF)</div>
            </div>
            <div class="st-quote-payment-description">
              Download a detailed PDF quote for internal approval. No commitment required. Our team will follow up to answer questions.
            </div>
          </div>
        </div>

        <div class="alert alert-secondary mt-4">
          <span class="material-symbols-outlined">lock</span>
          <div>
            <strong>Secure & Confidential</strong>
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
    const total = this.calculateTotal();
    const tierInfo = this.formData.tripTier ? this.pricing.tiers[this.formData.tripTier] : null;

    return `
      <div class="st-quote-summary-sidebar">
        <div class="st-quote-summary-sticky">
          <h3 class="st-quote-summary-title">Order Summary</h3>

          ${tierInfo ? `
            <div class="st-quote-summary-item">
              <div class="st-quote-summary-label">${tierInfo.name}</div>
              <div class="st-quote-summary-price">$${tierInfo.price.toFixed(2)}</div>
            </div>
          ` : `
            <div class="st-quote-summary-empty">
              Select a trip tier to see pricing
            </div>
          `}

          ${this.formData.addons.length > 0 ? `
            <div class="st-quote-summary-section">
              <div class="st-quote-summary-section-title">Add-ons</div>
              ${this.formData.addons.map(addonKey => {
                const addon = this.pricing.addons[addonKey];
                return `
                  <div class="st-quote-summary-item">
                    <div class="st-quote-summary-label">${addon.name}</div>
                    <div class="st-quote-summary-price">$${addon.price.toFixed(2)}</div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}

          ${tierInfo ? `
            <div class="st-quote-summary-total">
              <div class="st-quote-summary-label">Total</div>
              <div class="st-quote-summary-price">$${total.toFixed(2)}</div>
            </div>
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

    // Tier selection
    this.element.querySelectorAll('[data-action="select-tier"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tier = e.target.dataset.tier;
        this.formData.tripTier = tier;
        Analytics.trackPricingTierSelect(this.pricing.tiers[tier].name, this.pricing.tiers[tier].price);
        this.render();
      });
    });

    // Form fields
    this.element.querySelectorAll('[data-field]').forEach(field => {
      field.addEventListener('change', (e) => {
        const fieldName = e.target.dataset.field;

        if (fieldName === 'addon') {
          const addonKey = e.target.dataset.addon;
          if (e.target.checked) {
            if (!this.formData.addons.includes(addonKey)) {
              this.formData.addons.push(addonKey);
              Analytics.trackAddonSelect(this.pricing.addons[addonKey].name, this.pricing.addons[addonKey].price);
            }
          } else {
            this.formData.addons = this.formData.addons.filter(k => k !== addonKey);
          }
          this.render();
        } else if (fieldName === 'paymentPath') {
          this.formData.paymentPath = e.target.value;
          this.render();
        } else {
          this.formData[fieldName] = e.target.value;
        }
      });
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

    // Payment option cards
    this.element.querySelectorAll('.st-quote-payment-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('form-check-input')) {
          const radio = card.querySelector('input[type="radio"]');
          if (radio) {
            radio.checked = true;
            this.formData.paymentPath = radio.value;
            this.render();
          }
        }
      });
    });
  }

  /**
   * Mount the component
   */
  mount(selector) {
    const container = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!container) {
      console.error('QuoteForm: Mount target not found');
      return;
    }

    this.element = container;
    this.render();
  }
}

export default QuoteForm;
