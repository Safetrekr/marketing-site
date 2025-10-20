/**
 * Location Autocomplete Component
 * Provides a searchable dropdown for city selection with worldwide coverage
 */

import { searchLocations, debounce } from '/services/geocodingService.js';

export class LocationAutocomplete {
  constructor(options = {}) {
    this.options = {
      inputId: options.inputId, // Required: ID of the input element
      placeholder: options.placeholder || 'Search for a city...',
      onSelect: options.onSelect || (() => {}), // Callback when location is selected
      initialValue: options.initialValue || null, // Pre-populate with location object
      required: options.required !== false, // Required by default
      limit: options.limit || 5 // Max results to show
    };

    this.input = null;
    this.dropdown = null;
    this.results = [];
    this.selectedLocation = null;
    this.isOpen = false;

    // Bind methods
    this.handleInput = debounce(this.handleInput.bind(this), 300);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  /**
   * Initialize the autocomplete
   */
  init() {
    this.input = document.getElementById(this.options.inputId);
    
    if (!this.input) {
      console.error(`[LocationAutocomplete] Input element not found: #${this.options.inputId}`);
      return;
    }

    // Create dropdown container
    this.createDropdown();

    // Set initial value if provided
    if (this.options.initialValue) {
      this.setLocation(this.options.initialValue);
    }

    // Set placeholder
    this.input.placeholder = this.options.placeholder;

    // Add event listeners
    this.input.addEventListener('input', this.handleInput);
    this.input.addEventListener('keydown', this.handleKeydown);
    this.input.addEventListener('focus', () => {
      if (this.results.length > 0) {
        this.showDropdown();
      }
    });

    document.addEventListener('click', this.handleClickOutside);

    console.log(`[LocationAutocomplete] Initialized for #${this.options.inputId}`);
  }

  /**
   * Create dropdown element
   */
  createDropdown() {
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'st-location-autocomplete-dropdown';
    this.dropdown.style.display = 'none';
    
    // Position dropdown below input
    this.input.parentNode.style.position = 'relative';
    this.input.parentNode.appendChild(this.dropdown);
  }

  /**
   * Handle input changes
   */
  async handleInput(e) {
    const query = e.target.value.trim();

    // Clear selection if user types
    this.selectedLocation = null;

    if (query.length < 2) {
      this.hideDropdown();
      return;
    }

    // Show loading state
    this.showLoading();

    try {
      // Search locations
      this.results = await searchLocations(query, {
        citiesOnly: true,
        limit: this.options.limit
      });

      if (this.results.length > 0) {
        this.renderResults();
        this.showDropdown();
      } else {
        this.showNoResults();
      }
    } catch (error) {
      console.error('[LocationAutocomplete] Search error:', error);
      this.showError();
    }
  }

  /**
   * Handle keyboard navigation
   */
  handleKeydown(e) {
    if (!this.isOpen) return;

    const items = this.dropdown.querySelectorAll('.autocomplete-item');
    const activeItem = this.dropdown.querySelector('.autocomplete-item.active');
    let activeIndex = Array.from(items).indexOf(activeItem);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, items.length - 1);
        this.setActiveItem(items, activeIndex);
        break;

      case 'ArrowUp':
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        this.setActiveItem(items, activeIndex);
        break;

      case 'Enter':
        e.preventDefault();
        if (activeItem) {
          const index = parseInt(activeItem.dataset.index);
          this.selectLocation(this.results[index]);
        }
        break;

      case 'Escape':
        this.hideDropdown();
        break;
    }
  }

  /**
   * Set active dropdown item
   */
  setActiveItem(items, index) {
    items.forEach(item => item.classList.remove('active'));
    if (items[index]) {
      items[index].classList.add('active');
      items[index].scrollIntoView({ block: 'nearest' });
    }
  }

  /**
   * Handle clicks outside dropdown
   */
  handleClickOutside(e) {
    if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
      this.hideDropdown();
    }
  }

  /**
   * Render search results
   */
  renderResults() {
    this.dropdown.innerHTML = this.results.map((location, index) => `
      <div class="autocomplete-item" data-index="${index}">
        <div class="autocomplete-item-main">
          <span class="material-symbols-outlined">location_on</span>
          <span class="autocomplete-item-name">${this.escapeHtml(location.displayName)}</span>
        </div>
        <div class="autocomplete-item-meta">
          <span class="badge bg-${location.isDomestic ? 'success' : 'info'}" style="font-size: 0.7rem;">
            ${location.isDomestic ? 'Domestic' : 'International'}
          </span>
        </div>
      </div>
    `).join('');

    // Add click handlers
    this.dropdown.querySelectorAll('.autocomplete-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.selectLocation(this.results[index]);
      });

      item.addEventListener('mouseenter', () => {
        this.dropdown.querySelectorAll('.autocomplete-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.dropdown.innerHTML = `
      <div class="autocomplete-loading">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <span class="ms-2">Searching cities...</span>
      </div>
    `;
    this.showDropdown();
  }

  /**
   * Show no results message
   */
  showNoResults() {
    this.dropdown.innerHTML = `
      <div class="autocomplete-no-results">
        <span class="material-symbols-outlined">search_off</span>
        <span>No cities found</span>
      </div>
    `;
    this.showDropdown();
  }

  /**
   * Show error message
   */
  showError() {
    this.dropdown.innerHTML = `
      <div class="autocomplete-error">
        <span class="material-symbols-outlined">error</span>
        <span>Search failed. Please try again.</span>
      </div>
    `;
    this.showDropdown();
  }

  /**
   * Select a location
   */
  selectLocation(location) {
    this.selectedLocation = location;
    this.input.value = location.displayName;
    this.hideDropdown();

    // Trigger callback
    this.options.onSelect(location);

    console.log('[LocationAutocomplete] Location selected:', location);
  }

  /**
   * Set location programmatically
   */
  setLocation(location) {
    this.selectedLocation = location;
    this.input.value = location.displayName;
  }

  /**
   * Get selected location
   */
  getLocation() {
    return this.selectedLocation;
  }

  /**
   * Clear selection
   */
  clear() {
    this.selectedLocation = null;
    this.input.value = '';
    this.hideDropdown();
  }

  /**
   * Show dropdown
   */
  showDropdown() {
    this.dropdown.style.display = 'block';
    this.isOpen = true;
  }

  /**
   * Hide dropdown
   */
  hideDropdown() {
    this.dropdown.style.display = 'none';
    this.isOpen = false;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Validate selection
   */
  validate() {
    if (this.options.required && !this.selectedLocation) {
      this.input.classList.add('is-invalid');
      return false;
    }

    this.input.classList.remove('is-invalid');
    this.input.classList.add('is-valid');
    return true;
  }

  /**
   * Destroy the autocomplete
   */
  destroy() {
    if (this.input) {
      this.input.removeEventListener('input', this.handleInput);
      this.input.removeEventListener('keydown', this.handleKeydown);
    }

    document.removeEventListener('click', this.handleClickOutside);

    if (this.dropdown && this.dropdown.parentNode) {
      this.dropdown.parentNode.removeChild(this.dropdown);
    }

    console.log(`[LocationAutocomplete] Destroyed for #${this.options.inputId}`);
  }
}
