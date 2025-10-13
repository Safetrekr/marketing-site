/**
 * Analytics Utilities
 * Centralized analytics tracking for marketing site
 */

export class Analytics {
  /**
   * Track a CTA click event
   */
  static trackCTAClick(ctaText, ctaLocation, ctaDestination) {
    if (window.gtag) {
      gtag('event', 'cta_click', {
        event_category: 'conversion',
        event_label: ctaText,
        cta_location: ctaLocation,
        cta_destination: ctaDestination
      });
    }

    console.log('Analytics: CTA Click', { ctaText, ctaLocation, ctaDestination });
  }

  /**
   * Track a page view
   */
  static trackPageView(pagePath, pageTitle) {
    if (window.gtag) {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: pagePath,
        page_title: pageTitle
      });
    }

    console.log('Analytics: Page View', { pagePath, pageTitle });
  }

  /**
   * Track form submission
   */
  static trackFormSubmit(formName, formLocation) {
    if (window.gtag) {
      gtag('event', 'form_submit', {
        event_category: 'conversion',
        event_label: formName,
        form_location: formLocation
      });
    }

    console.log('Analytics: Form Submit', { formName, formLocation });
  }

  /**
   * Track resource download
   */
  static trackResourceDownload(resourceName, resourceType) {
    if (window.gtag) {
      gtag('event', 'resource_download', {
        event_category: 'engagement',
        event_label: resourceName,
        resource_type: resourceType
      });
    }

    console.log('Analytics: Resource Download', { resourceName, resourceType });
  }

  /**
   * Track pricing tier selection
   */
  static trackPricingTierSelect(tierName, tierPrice) {
    if (window.gtag) {
      gtag('event', 'pricing_tier_select', {
        event_category: 'conversion',
        event_label: tierName,
        tier_price: tierPrice
      });
    }

    console.log('Analytics: Pricing Tier Select', { tierName, tierPrice });
  }

  /**
   * Track calculator interaction
   */
  static trackCalculatorUse(calculatorType, calculatorResult) {
    if (window.gtag) {
      gtag('event', 'calculator_use', {
        event_category: 'engagement',
        event_label: calculatorType,
        calculator_result: calculatorResult
      });
    }

    console.log('Analytics: Calculator Use', { calculatorType, calculatorResult });
  }

  /**
   * Track video play
   */
  static trackVideoPlay(videoTitle, videoLocation) {
    if (window.gtag) {
      gtag('event', 'video_play', {
        event_category: 'engagement',
        event_label: videoTitle,
        video_location: videoLocation
      });
    }

    console.log('Analytics: Video Play', { videoTitle, videoLocation });
  }

  /**
   * Track solution segment selection
   */
  static trackSegmentSelect(segmentName) {
    if (window.gtag) {
      gtag('event', 'segment_select', {
        event_category: 'engagement',
        event_label: segmentName
      });
    }

    console.log('Analytics: Segment Select', { segmentName });
  }

  /**
   * Track add-on selection
   */
  static trackAddonSelect(addonName, addonPrice) {
    if (window.gtag) {
      gtag('event', 'addon_select', {
        event_category: 'conversion',
        event_label: addonName,
        addon_price: addonPrice
      });
    }

    console.log('Analytics: Add-on Select', { addonName, addonPrice });
  }

  /**
   * Track quote request
   */
  static trackQuoteRequest(tripTier, addons = []) {
    if (window.gtag) {
      gtag('event', 'quote_request', {
        event_category: 'conversion',
        trip_tier: tripTier,
        addons: addons.join(', ')
      });
    }

    console.log('Analytics: Quote Request', { tripTier, addons });
  }

  /**
   * Track lead capture (gated resource)
   */
  static trackLeadCapture(resourceName, leadEmail) {
    if (window.gtag) {
      gtag('event', 'lead_capture', {
        event_category: 'conversion',
        event_label: resourceName,
        // Don't send PII (email) to analytics
        lead_captured: true
      });
    }

    console.log('Analytics: Lead Capture', { resourceName });
  }

  /**
   * Track external link click
   */
  static trackExternalLink(linkUrl, linkText) {
    if (window.gtag) {
      gtag('event', 'external_link_click', {
        event_category: 'engagement',
        event_label: linkText,
        link_url: linkUrl
      });
    }

    console.log('Analytics: External Link Click', { linkUrl, linkText });
  }

  /**
   * Initialize analytics tracking on page load
   */
  static init(pageName) {
    // Track initial page view
    this.trackPageView(window.location.pathname, document.title);

    // Auto-track all CTA button clicks
    document.addEventListener('click', (e) => {
      const cta = e.target.closest('.st-marketing-cta-primary, .st-marketing-cta-secondary, .st-marketing-cta-tertiary');
      if (cta) {
        const ctaText = cta.textContent.trim();
        const ctaLocation = pageName;
        const ctaDestination = cta.getAttribute('href') || cta.getAttribute('data-action');
        this.trackCTAClick(ctaText, ctaLocation, ctaDestination);
      }
    });

    console.log(`Analytics: Initialized for page "${pageName}"`);
  }
}

export default Analytics;
