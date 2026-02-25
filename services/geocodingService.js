/**
 * Geocoding Service
 * Handles location search, geocoding, and trip type detection using Nominatim (OpenStreetMap)
 */

// Nominatim API configuration
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const SEARCH_ENDPOINT = '/search';

// Rate limiting: Nominatim requires max 1 request per second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second

// Cache configuration
const CACHE_KEY_PREFIX = 'geocoding_cache_';
const CACHE_EXPIRY_DAYS = 7;

/**
 * Search for locations using Nominatim
 * @param {string} query - Search query (city name)
 * @param {Object} options - Search options
 * @param {boolean} options.citiesOnly - Only return city-level results (default: true)
 * @param {number} options.limit - Max results to return (default: 5)
 * @returns {Promise<Array>} - Array of location results
 */
export async function searchLocations(query, options = {}) {
  const {
    citiesOnly = true,
    limit = 5
  } = options;

  if (!query || query.length < 2) {
    return [];
  }

  // Check cache first
  const cacheKey = `${CACHE_KEY_PREFIX}${query.toLowerCase()}`;
  const cachedResult = getCachedResult(cacheKey);
  if (cachedResult) {
    if (import.meta.env.DEV) console.log('[GeocodingService] Using cached result for:', query);
    return cachedResult.slice(0, limit);
  }

  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: limit.toString(),
      'accept-language': 'en'
    });

    // Filter by city-level results if requested
    if (citiesOnly) {
      params.append('featuretype', 'city');
    }

    const url = `${NOMINATIM_BASE_URL}${SEARCH_ENDPOINT}?${params.toString()}`;
    
    if (import.meta.env.DEV) console.log('[GeocodingService] Searching for:', query);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Safetrekr/1.0 (trip safety management platform)'
      }
    });

    lastRequestTime = Date.now();

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const results = await response.json();

    // Format results
    const formattedResults = results.map(formatLocationResult).filter(Boolean);

    // Cache the results
    cacheResult(cacheKey, formattedResults);

    if (import.meta.env.DEV) console.log('[GeocodingService] Found', formattedResults.length, 'results');
    
    return formattedResults;

  } catch (error) {
    console.error('[GeocodingService] Search failed:', error);
    return [];
  }
}

/**
 * Format a Nominatim result into a standardized location object
 * @param {Object} result - Raw Nominatim result
 * @returns {Object|null} - Formatted location or null if invalid
 */
function formatLocationResult(result) {
  if (!result || !result.address) {
    return null;
  }

  const address = result.address;
  
  // Extract location components
  const city = address.city || address.town || address.village || address.municipality;
  const state = address.state;
  const country = address.country;
  const countryCode = address.country_code?.toUpperCase();

  if (!city || !country) {
    return null;
  }

  // Build display name
  let displayName = city;
  
  // For US locations, use state abbreviation
  if (countryCode === 'US' && state) {
    const stateAbbr = getStateAbbreviation(state);
    displayName = `${city}, ${stateAbbr}`;
  } else if (state && countryCode !== 'US') {
    // For international, include state/region if different from city
    displayName = `${city}, ${state}, ${country}`;
  } else {
    // Just city and country
    displayName = `${city}, ${country}`;
  }

  return {
    id: result.place_id,
    displayName,
    city,
    state,
    stateAbbr: countryCode === 'US' ? getStateAbbreviation(state) : null,
    country,
    countryCode,
    lat: parseFloat(result.lat),
    lon: parseFloat(result.lon),
    bbox: result.boundingbox,
    isDomestic: countryCode === 'US',
    raw: result
  };
}

/**
 * Get US state abbreviation from full name
 * @param {string} stateName - Full state name
 * @returns {string} - State abbreviation or original name if not found
 */
function getStateAbbreviation(stateName) {
  if (!stateName) return '';
  
  const stateMap = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
    'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
    'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
    'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY'
  };

  return stateMap[stateName] || stateName;
}

/**
 * Get cached geocoding result
 * @param {string} key - Cache key
 * @returns {Array|null} - Cached results or null if not found/expired
 */
function getCachedResult(key) {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    
    // Check if expired
    const age = Date.now() - timestamp;
    const maxAge = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    
    if (age > maxAge) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[GeocodingService] Cache read error:', error);
    return null;
  }
}

/**
 * Cache geocoding result
 * @param {string} key - Cache key
 * @param {Array} data - Data to cache
 */
function cacheResult(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('[GeocodingService] Cache write error:', error);
  }
}

/**
 * Determine trip type based on departure and destination locations
 * @param {Object} departureLocation - Departure location object
 * @param {Object} destinationLocation - Destination location object
 * @returns {string} - Trip type: 'T1', 'T2', or 'T3'
 */
export function determineTripType(departureLocation, destinationLocation) {
  // If either location is international, it's T3
  if (!departureLocation?.isDomestic || !destinationLocation?.isDomestic) {
    return 'T3';
  }

  // Both are domestic US - would need dates to determine T1 vs T2
  // This function can be called again with dates to refine
  return null; // Caller should use dates to determine T1 vs T2
}

/**
 * Clear all cached geocoding results
 */
export function clearCache() {
  try {
    const keys = Object.keys(localStorage);
    const geocodingKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
    
    geocodingKeys.forEach(key => localStorage.removeItem(key));
    
    if (import.meta.env.DEV) console.log('[GeocodingService] Cleared', geocodingKeys.length, 'cached results');
  } catch (error) {
    console.error('[GeocodingService] Cache clear error:', error);
  }
}

/**
 * Debounce helper for search input
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
