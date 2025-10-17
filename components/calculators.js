/**
 * Calculator Components for Pricing Page
 * Interactive calculators for trip volume and ROI estimation
 */

import { Analytics } from './analytics.js';

/**
 * Trip Volume Calculator
 * Calculates estimated annual spend based on trip volume and tier distribution
 */
export class TripVolumeCalculator {
  constructor(config = {}) {
    this.config = {
      mountSelector: config.mountSelector || '#trip-volume-calculator',
      ...config
    };

    this.state = {
      tripsPerYear: 10,
      tier1Percentage: 60,
      tier2Percentage: 30,
      tier3Percentage: 10
    };

    this.pricing = {
      tier1: 450,
      tier2: 750,
      tier3: 1250
    };
  }

  /**
   * Calculate total annual spend
   */
  calculateSpend() {
    const { tripsPerYear, tier1Percentage, tier2Percentage, tier3Percentage } = this.state;

    const tier1Count = Math.round((tripsPerYear * tier1Percentage) / 100);
    const tier2Count = Math.round((tripsPerYear * tier2Percentage) / 100);
    const tier3Count = Math.round((tripsPerYear * tier3Percentage) / 100);

    const tier1Cost = tier1Count * this.pricing.tier1;
    const tier2Cost = tier2Count * this.pricing.tier2;
    const tier3Cost = tier3Count * this.pricing.tier3;

    const totalCost = tier1Cost + tier2Cost + tier3Cost;
    const avgCostPerTrip = tripsPerYear > 0 ? totalCost / tripsPerYear : 0;

    return {
      tier1Count,
      tier2Count,
      tier3Count,
      tier1Cost,
      tier2Cost,
      tier3Cost,
      totalCost,
      avgCostPerTrip
    };
  }

  /**
   * Update calculator state
   */
  updateState(updates) {
    this.state = { ...this.state, ...updates };
    this.render();

    // Track analytics
    const result = this.calculateSpend();
    Analytics.trackCalculatorUse('trip_volume', {
      trips_per_year: this.state.tripsPerYear,
      total_annual_spend: result.totalCost
    });
  }

  /**
   * Format currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Render calculator HTML
   */
  getHTML() {
    const result = this.calculateSpend();

    return `
      <div class="st-calculator-card">
        <div class="st-calculator-header">
          <div class="st-calculator-icon">
            <span class="material-symbols-outlined">calculate</span>
          </div>
          <h3 class="st-calculator-title">Trip Volume Calculator</h3>
          <p class="st-calculator-description">
            Estimate your annual Safetrekr spend based on trip volume and complexity distribution.
          </p>
        </div>

        <div class="st-calculator-body">
          <!-- Trips Per Year Input -->
          <div class="st-calculator-input-group">
            <label class="st-calculator-label">
              How many trips do you plan per year?
            </label>
            <div class="st-calculator-slider-container">
              <input
                type="range"
                id="trips-per-year-slider"
                min="1"
                max="100"
                value="${this.state.tripsPerYear}"
                class="st-calculator-slider"
              >
              <div class="st-calculator-slider-value">
                <input
                  type="number"
                  id="trips-per-year-input"
                  min="1"
                  max="500"
                  value="${this.state.tripsPerYear}"
                  class="st-calculator-number-input"
                > trips/year
              </div>
            </div>
          </div>

          <!-- Tier Distribution -->
          <div class="st-calculator-input-group">
            <label class="st-calculator-label">
              Trip complexity distribution
            </label>
            <p class="st-calculator-help-text">
              Adjust the percentages below to match your typical trip mix. Percentages should add up to 100%.
            </p>

            <!-- Tier 1 -->
            <div class="st-calculator-tier-row">
              <div class="st-calculator-tier-info">
                <span class="st-calculator-tier-label">Tier 1: Domestic Day/Overnight</span>
                <span class="st-calculator-tier-price">${this.formatCurrency(this.pricing.tier1)}</span>
              </div>
              <div class="st-calculator-slider-container">
                <input
                  type="range"
                  id="tier1-slider"
                  min="0"
                  max="100"
                  value="${this.state.tier1Percentage}"
                  class="st-calculator-slider st-calculator-slider-tier1"
                >
                <span class="st-calculator-slider-value">${this.state.tier1Percentage}%</span>
              </div>
            </div>

            <!-- Tier 2 -->
            <div class="st-calculator-tier-row">
              <div class="st-calculator-tier-info">
                <span class="st-calculator-tier-label">Tier 2: Multi-Day Domestic</span>
                <span class="st-calculator-tier-price">${this.formatCurrency(this.pricing.tier2)}</span>
              </div>
              <div class="st-calculator-slider-container">
                <input
                  type="range"
                  id="tier2-slider"
                  min="0"
                  max="100"
                  value="${this.state.tier2Percentage}"
                  class="st-calculator-slider st-calculator-slider-tier2"
                >
                <span class="st-calculator-slider-value">${this.state.tier2Percentage}%</span>
              </div>
            </div>

            <!-- Tier 3 -->
            <div class="st-calculator-tier-row">
              <div class="st-calculator-tier-info">
                <span class="st-calculator-tier-label">Tier 3: International/Complex</span>
                <span class="st-calculator-tier-price">${this.formatCurrency(this.pricing.tier3)}</span>
              </div>
              <div class="st-calculator-slider-container">
                <input
                  type="range"
                  id="tier3-slider"
                  min="0"
                  max="100"
                  value="${this.state.tier3Percentage}"
                  class="st-calculator-slider st-calculator-slider-tier3"
                >
                <span class="st-calculator-slider-value">${this.state.tier3Percentage}%</span>
              </div>
            </div>
          </div>

          <!-- Results -->
          <div class="st-calculator-results">
            <div class="st-calculator-results-header">
              <h4>Estimated Annual Investment</h4>
            </div>

            <div class="st-calculator-results-breakdown">
              <div class="st-calculator-result-row">
                <span>${result.tier1Count} Tier 1 trips × ${this.formatCurrency(this.pricing.tier1)}</span>
                <span>${this.formatCurrency(result.tier1Cost)}</span>
              </div>
              <div class="st-calculator-result-row">
                <span>${result.tier2Count} Tier 2 trips × ${this.formatCurrency(this.pricing.tier2)}</span>
                <span>${this.formatCurrency(result.tier2Cost)}</span>
              </div>
              <div class="st-calculator-result-row">
                <span>${result.tier3Count} Tier 3 trips × ${this.formatCurrency(this.pricing.tier3)}</span>
                <span>${this.formatCurrency(result.tier3Cost)}</span>
              </div>
            </div>

            <div class="st-calculator-results-total">
              <div class="st-calculator-result-row-total">
                <span>Total Annual Spend</span>
                <span class="st-calculator-total-amount">${this.formatCurrency(result.totalCost)}</span>
              </div>
              <div class="st-calculator-result-row-secondary">
                <span>Average per trip</span>
                <span>${this.formatCurrency(result.avgCostPerTrip)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render the calculator
   */
  render() {
    const container = document.querySelector(this.config.mountSelector);
    if (!container) {
      console.error(`TripVolumeCalculator: Mount point "${this.config.mountSelector}" not found`);
      return;
    }

    container.innerHTML = this.getHTML();
    this.attachEventListeners();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Trips per year slider
    const tripsSlider = document.getElementById('trips-per-year-slider');
    const tripsInput = document.getElementById('trips-per-year-input');

    if (tripsSlider) {
      tripsSlider.addEventListener('input', (e) => {
        this.updateState({ tripsPerYear: parseInt(e.target.value) });
      });
    }

    if (tripsInput) {
      tripsInput.addEventListener('input', (e) => {
        const value = Math.max(1, Math.min(500, parseInt(e.target.value) || 1));
        this.updateState({ tripsPerYear: value });
      });
    }

    // Tier distribution sliders
    const tier1Slider = document.getElementById('tier1-slider');
    const tier2Slider = document.getElementById('tier2-slider');
    const tier3Slider = document.getElementById('tier3-slider');

    if (tier1Slider) {
      tier1Slider.addEventListener('input', (e) => {
        this.updateState({ tier1Percentage: parseInt(e.target.value) });
      });
    }

    if (tier2Slider) {
      tier2Slider.addEventListener('input', (e) => {
        this.updateState({ tier2Percentage: parseInt(e.target.value) });
      });
    }

    if (tier3Slider) {
      tier3Slider.addEventListener('input', (e) => {
        this.updateState({ tier3Percentage: parseInt(e.target.value) });
      });
    }
  }

  /**
   * Mount the calculator to a container
   */
  mount(selector) {
    this.config.mountSelector = selector;
    this.render();
  }
}

/**
 * ROI Estimator
 * Calculates time savings and cost avoidance from using Safetrekr
 */
export class ROIEstimator {
  constructor(config = {}) {
    this.config = {
      mountSelector: config.mountSelector || '#roi-estimator',
      ...config
    };

    this.state = {
      orgSize: 'medium', // small, medium, large
      tripsPerYear: 15,
      currentHoursPerTrip: 20,
      staffHourlyRate: 50
    };

    // Time savings assumptions
    this.timeSavings = {
      researchAndPlanning: 0.60,      // 60% reduction in research time
      documentationAndPackets: 0.70,  // 70% reduction in documentation time
      complianceAndLegal: 0.50,       // 50% reduction in compliance work
      stakeholderComms: 0.40          // 40% reduction in communication overhead
    };

    this.orgSizeDefaults = {
      small: { hourlyRate: 40, hoursPerTrip: 15, avgTier: 600 },
      medium: { hourlyRate: 50, hoursPerTrip: 20, avgTier: 700 },
      large: { hourlyRate: 65, hoursPerTrip: 30, avgTier: 850 }
    };
  }

  /**
   * Calculate ROI metrics
   */
  calculateROI() {
    const { tripsPerYear, currentHoursPerTrip, staffHourlyRate } = this.state;

    // Time savings (assuming 50% average time reduction)
    const avgTimeSavingsPercentage = 0.50;
    const hoursSavedPerTrip = currentHoursPerTrip * avgTimeSavingsPercentage;
    const totalHoursSavedPerYear = hoursSavedPerTrip * tripsPerYear;

    // Cost savings
    const staffTimeSavings = totalHoursSavedPerYear * staffHourlyRate;

    // Risk avoidance (estimated value of professional review)
    const riskAvoidancePerTrip = 5000; // Average cost of a preventable incident
    const riskReductionFactor = 0.15; // Assume 15% reduction in incidents
    const riskAvoidanceSavings = tripsPerYear * riskAvoidancePerTrip * riskReductionFactor;

    // Estimated Safetrekr cost (using average tier pricing)
    const avgTierPrice = this.orgSizeDefaults[this.state.orgSize].avgTier;
    const estimatedSafetrekrCost = tripsPerYear * avgTierPrice;

    // Total savings and ROI
    const totalSavings = staffTimeSavings + riskAvoidanceSavings;
    const netSavings = totalSavings - estimatedSafetrekrCost;
    const roi = estimatedSafetrekrCost > 0 ? ((netSavings / estimatedSafetrekrCost) * 100) : 0;

    return {
      hoursSavedPerTrip: Math.round(hoursSavedPerTrip),
      totalHoursSavedPerYear: Math.round(totalHoursSavedPerYear),
      staffTimeSavings: Math.round(staffTimeSavings),
      riskAvoidanceSavings: Math.round(riskAvoidanceSavings),
      totalSavings: Math.round(totalSavings),
      estimatedSafetrekrCost,
      netSavings: Math.round(netSavings),
      roi: Math.round(roi),
      weeksOfWorkSaved: Math.round(totalHoursSavedPerYear / 40)
    };
  }

  /**
   * Update calculator state
   */
  updateState(updates) {
    this.state = { ...this.state, ...updates };

    // Update related fields when org size changes
    if (updates.orgSize) {
      const defaults = this.orgSizeDefaults[updates.orgSize];
      this.state.staffHourlyRate = defaults.hourlyRate;
      this.state.currentHoursPerTrip = defaults.hoursPerTrip;
    }

    this.render();

    // Track analytics
    const result = this.calculateROI();
    Analytics.trackCalculatorUse('roi_estimator', {
      trips_per_year: this.state.tripsPerYear,
      org_size: this.state.orgSize,
      estimated_roi: result.roi
    });
  }

  /**
   * Format currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format number with commas
   */
  formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
  }

  /**
   * Render calculator HTML
   */
  getHTML() {
    const result = this.calculateROI();

    return `
      <div class="st-calculator-card">
        <div class="st-calculator-header">
          <div class="st-calculator-icon st-calculator-icon-success">
            <span class="material-symbols-outlined">trending_up</span>
          </div>
          <h3 class="st-calculator-title">ROI Estimator</h3>
          <p class="st-calculator-description">
            Calculate the time savings and cost avoidance from professional trip safety management.
          </p>
        </div>

        <div class="st-calculator-body">
          <!-- Organization Size -->
          <div class="st-calculator-input-group">
            <label class="st-calculator-label">
              Organization size
            </label>
            <div class="st-calculator-button-group">
              <button
                class="st-calculator-button ${this.state.orgSize === 'small' ? 'active' : ''}"
                data-org-size="small"
              >
                Small<br>
                <span class="st-calculator-button-subtitle">1-5 trips/year</span>
              </button>
              <button
                class="st-calculator-button ${this.state.orgSize === 'medium' ? 'active' : ''}"
                data-org-size="medium"
              >
                Medium<br>
                <span class="st-calculator-button-subtitle">6-25 trips/year</span>
              </button>
              <button
                class="st-calculator-button ${this.state.orgSize === 'large' ? 'active' : ''}"
                data-org-size="large"
              >
                Large<br>
                <span class="st-calculator-button-subtitle">25+ trips/year</span>
              </button>
            </div>
          </div>

          <!-- Trips Per Year -->
          <div class="st-calculator-input-group">
            <label class="st-calculator-label">
              How many trips per year?
            </label>
            <div class="st-calculator-slider-container">
              <input
                type="range"
                id="roi-trips-slider"
                min="1"
                max="100"
                value="${this.state.tripsPerYear}"
                class="st-calculator-slider"
              >
              <div class="st-calculator-slider-value">
                <input
                  type="number"
                  id="roi-trips-input"
                  min="1"
                  max="500"
                  value="${this.state.tripsPerYear}"
                  class="st-calculator-number-input"
                > trips/year
              </div>
            </div>
          </div>

          <!-- Current Hours Per Trip -->
          <div class="st-calculator-input-group">
            <label class="st-calculator-label">
              Current hours spent per trip (planning, documentation, compliance)
            </label>
            <div class="st-calculator-slider-container">
              <input
                type="range"
                id="hours-slider"
                min="5"
                max="80"
                step="5"
                value="${this.state.currentHoursPerTrip}"
                class="st-calculator-slider"
              >
              <div class="st-calculator-slider-value">
                <input
                  type="number"
                  id="hours-input"
                  min="1"
                  max="200"
                  value="${this.state.currentHoursPerTrip}"
                  class="st-calculator-number-input"
                > hours
              </div>
            </div>
          </div>

          <!-- Staff Hourly Rate -->
          <div class="st-calculator-input-group">
            <label class="st-calculator-label">
              Average staff hourly rate (loaded cost)
            </label>
            <div class="st-calculator-slider-container">
              <input
                type="range"
                id="rate-slider"
                min="25"
                max="150"
                step="5"
                value="${this.state.staffHourlyRate}"
                class="st-calculator-slider"
              >
              <div class="st-calculator-slider-value">
                $<input
                  type="number"
                  id="rate-input"
                  min="25"
                  max="300"
                  value="${this.state.staffHourlyRate}"
                  class="st-calculator-number-input"
                >/hour
              </div>
            </div>
          </div>

          <!-- Results -->
          <div class="st-calculator-results st-calculator-results-roi">
            <div class="st-calculator-results-header">
              <h4>Estimated Annual Value</h4>
            </div>

            <!-- Key Metrics -->
            <div class="st-calculator-roi-metrics">
              <div class="st-calculator-roi-metric">
                <div class="st-calculator-roi-metric-icon">
                  <span class="material-symbols-outlined">schedule</span>
                </div>
                <div class="st-calculator-roi-metric-content">
                  <div class="st-calculator-roi-metric-value">${this.formatNumber(result.totalHoursSavedPerYear)} hours</div>
                  <div class="st-calculator-roi-metric-label">Time saved annually</div>
                  <div class="st-calculator-roi-metric-subtitle">(~${result.weeksOfWorkSaved} weeks of work)</div>
                </div>
              </div>

              <div class="st-calculator-roi-metric">
                <div class="st-calculator-roi-metric-icon">
                  <span class="material-symbols-outlined">savings</span>
                </div>
                <div class="st-calculator-roi-metric-content">
                  <div class="st-calculator-roi-metric-value">${this.formatCurrency(result.staffTimeSavings)}</div>
                  <div class="st-calculator-roi-metric-label">Staff time savings</div>
                  <div class="st-calculator-roi-metric-subtitle">${result.hoursSavedPerTrip} hours × ${this.state.tripsPerYear} trips</div>
                </div>
              </div>

              <div class="st-calculator-roi-metric">
                <div class="st-calculator-roi-metric-icon">
                  <span class="material-symbols-outlined">security</span>
                </div>
                <div class="st-calculator-roi-metric-content">
                  <div class="st-calculator-roi-metric-value">${this.formatCurrency(result.riskAvoidanceSavings)}</div>
                  <div class="st-calculator-roi-metric-label">Risk avoidance value</div>
                  <div class="st-calculator-roi-metric-subtitle">Professional safety review</div>
                </div>
              </div>
            </div>

            <!-- ROI Summary -->
            <div class="st-calculator-results-total st-calculator-roi-summary">
              <div class="st-calculator-result-row">
                <span>Total annual savings</span>
                <span>${this.formatCurrency(result.totalSavings)}</span>
              </div>
              <div class="st-calculator-result-row">
                <span>Estimated Safetrekr cost</span>
                <span>-${this.formatCurrency(result.estimatedSafetrekrCost)}</span>
              </div>
              <div class="st-calculator-result-row-total st-calculator-roi-result">
                <span>Net annual benefit</span>
                <span class="st-calculator-total-amount ${result.netSavings >= 0 ? 'st-calculator-positive' : 'st-calculator-negative'}">
                  ${this.formatCurrency(result.netSavings)}
                </span>
              </div>
              <div class="st-calculator-roi-percentage">
                <span class="st-calculator-roi-badge ${result.roi >= 0 ? 'st-calculator-roi-positive' : ''}">
                  ${result.roi >= 0 ? '+' : ''}${result.roi}% ROI
                </span>
              </div>
            </div>

            <p class="st-calculator-disclaimer">
              * Estimates based on industry averages. Actual savings may vary based on your specific workflows,
              staff composition, and risk profile. Values include both direct staff time savings and estimated
              risk avoidance from professional safety review.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render the calculator
   */
  render() {
    const container = document.querySelector(this.config.mountSelector);
    if (!container) {
      console.error(`ROIEstimator: Mount point "${this.config.mountSelector}" not found`);
      return;
    }

    container.innerHTML = this.getHTML();
    this.attachEventListeners();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Organization size buttons
    const orgSizeButtons = document.querySelectorAll('[data-org-size]');
    orgSizeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const orgSize = e.currentTarget.dataset.orgSize;
        this.updateState({ orgSize });
      });
    });

    // Trips per year slider
    const tripsSlider = document.getElementById('roi-trips-slider');
    const tripsInput = document.getElementById('roi-trips-input');

    if (tripsSlider) {
      tripsSlider.addEventListener('input', (e) => {
        this.updateState({ tripsPerYear: parseInt(e.target.value) });
      });
    }

    if (tripsInput) {
      tripsInput.addEventListener('input', (e) => {
        const value = Math.max(1, Math.min(500, parseInt(e.target.value) || 1));
        this.updateState({ tripsPerYear: value });
      });
    }

    // Hours slider
    const hoursSlider = document.getElementById('hours-slider');
    const hoursInput = document.getElementById('hours-input');

    if (hoursSlider) {
      hoursSlider.addEventListener('input', (e) => {
        this.updateState({ currentHoursPerTrip: parseInt(e.target.value) });
      });
    }

    if (hoursInput) {
      hoursInput.addEventListener('input', (e) => {
        const value = Math.max(1, Math.min(200, parseInt(e.target.value) || 1));
        this.updateState({ currentHoursPerTrip: value });
      });
    }

    // Hourly rate slider
    const rateSlider = document.getElementById('rate-slider');
    const rateInput = document.getElementById('rate-input');

    if (rateSlider) {
      rateSlider.addEventListener('input', (e) => {
        this.updateState({ staffHourlyRate: parseInt(e.target.value) });
      });
    }

    if (rateInput) {
      rateInput.addEventListener('input', (e) => {
        const value = Math.max(25, Math.min(300, parseInt(e.target.value) || 25));
        this.updateState({ staffHourlyRate: value });
      });
    }
  }

  /**
   * Mount the calculator to a container
   */
  mount(selector) {
    this.config.mountSelector = selector;
    this.render();
  }
}
