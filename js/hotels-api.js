/**
 * Rahalah Travel App - Hotels API Integration
 * Uses SearchApi.io's Google Hotels API to get real hotel data
 */

// Store the API key in a variable (in production, consider using environment variables)
const SEARCH_API_KEY = 'nriBRADgZfgDwVCVKMryiQ2G';
const BASE_URL = 'https://www.searchapi.io/api/v1/search';

/**
 * Search for hotels based on parameters
 * 
 * @param {Object} params - Search parameters
 * @param {string} params.query - Location query (e.g., "Hotels in Riyadh")
 * @param {string} params.checkIn - Check-in date in YYYY-MM-DD format
 * @param {string} params.checkOut - Check-out date in YYYY-MM-DD format
 * @param {number} params.adults - Number of adults
 * @param {number[]} params.starRating - Array of star ratings to filter by (e.g., [4, 5] for 4 and 5 star hotels)
 * @param {number} params.minPrice - Minimum price (in local currency)
 * @param {number} params.maxPrice - Maximum price (in local currency)
 * @param {string[]} params.amenities - Array of amenities to filter by
 * @param {string} params.language - Language code (e.g., 'en', 'ar')
 * @returns {Promise<Object>} - Hotels search results
 */
async function searchHotels(params) {
    try {
        // Construct the API request URL with query parameters
        const url = new URL(BASE_URL);
        
        // Required parameters
        url.searchParams.append('engine', 'google_hotels');
        url.searchParams.append('api_key', SEARCH_API_KEY);
        url.searchParams.append('q', params.query || 'hotels');
        
        // Optional parameters with defaults
        if (params.checkIn) url.searchParams.append('check_in', params.checkIn);
        if (params.checkOut) url.searchParams.append('check_out', params.checkOut);
        if (params.adults) url.searchParams.append('adults', params.adults.toString());
        
        // Filter parameters
        if (params.starRating && params.starRating.length > 0) {
            url.searchParams.append('star_rating', params.starRating.join(','));
        }
        
        if (params.minPrice) url.searchParams.append('min_price', params.minPrice.toString());
        if (params.maxPrice) url.searchParams.append('max_price', params.maxPrice.toString());
        
        if (params.amenities && params.amenities.length > 0) {
            url.searchParams.append('amenities', params.amenities.join(','));
        }
        
        // UI parameters
        if (params.language) url.searchParams.append('gl', params.language);
        
        console.log(`Fetching hotels data from: ${url.toString()}`);
        
        // Make the API request
        const response = await fetch(url.toString());
        
        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        return processHotelResults(data);
        
    } catch (error) {
        console.error('Error searching hotels:', error);
        return {
            success: false,
            error: error.message,
            hotels: []
        };
    }
}

/**
 * Process and normalize hotel search results
 * 
 * @param {Object} apiResponse - Raw API response
 * @returns {Object} - Processed hotel results
 */
function processHotelResults(apiResponse) {
    try {
        if (!apiResponse.hotel_results || !Array.isArray(apiResponse.hotel_results)) {
            throw new Error('Invalid API response format');
        }
        
        const hotels = apiResponse.hotel_results.map(hotel => ({
            id: hotel.hotel_id || generateId(),
            name: hotel.name || 'Unknown Hotel',
            address: hotel.address || '',
            rating: parseFloat(hotel.rating) || 0,
            reviewCount: hotel.reviews || 0,
            price: extractPrice(hotel),
            thumbnail: hotel.thumbnail || '',
            amenities: hotel.amenities || [],
            stars: extractStars(hotel),
            url: hotel.link || '',
            latitude: hotel.latitude || null,
            longitude: hotel.longitude || null
        }));
        
        return {
            success: true,
            hotels: hotels,
            totalResults: apiResponse.search_information?.total_results || hotels.length,
            currency: extractCurrency(apiResponse)
        };
    } catch (error) {
        console.error('Error processing hotel results:', error);
        return {
            success: false,
            error: error.message,
            hotels: []
        };
    }
}

/**
 * Extract price from hotel result
 */
function extractPrice(hotel) {
    if (hotel.price) {
        // Try to extract numeric price from string like "$120" or "120 SAR"
        const priceMatch = hotel.price.match(/\d+/);
        return priceMatch ? parseInt(priceMatch[0], 10) : null;
    }
    return null;
}

/**
 * Extract star rating from hotel result
 */
function extractStars(hotel) {
    if (hotel.stars) {
        return parseInt(hotel.stars, 10);
    }
    
    // If no explicit stars, try to determine from description or class
    if (hotel.class) {
        const starsMatch = hotel.class.match(/(\d+)-star/i);
        return starsMatch ? parseInt(starsMatch[1], 10) : null;
    }
    
    return null;
}

/**
 * Extract currency from API response
 */
function extractCurrency(apiResponse) {
    // Default to USD if not specified
    return apiResponse.search_information?.currency || 'USD';
}

/**
 * Generate a random ID for hotels that don't have one
 */
function generateId() {
    return Math.random().toString(36).substring(2, 15);
}

/**
 * Process an Arabic query to extract hotel search parameters
 * 
 * @param {string} query - Arabic query text
 * @returns {Object} - Extracted search parameters
 */
function processArabicQuery(query) {
    // Default parameters
    const params = {
        query: query,
        checkIn: null,
        checkOut: null,
        adults: 2,
        starRating: [],
        language: 'ar'
    };
    
    // Check for location keywords
    const locationKeywords = [
        { ar: 'في', en: 'in' },
        { ar: 'الرياض', en: 'Riyadh' },
        { ar: 'جدة', en: 'Jeddah' },
        { ar: 'مكة', en: 'Makkah' },
        { ar: 'المدينة', en: 'Madinah' },
        { ar: 'الدمام', en: 'Dammam' },
        { ar: 'جده', en: 'Jeddah' },
        { ar: 'بانكوك', en: 'Bangkok' },
        { ar: 'دبي', en: 'Dubai' }
    ];
    
    // Check for star rating
    if (query.includes('خمس نجوم') || query.includes('5 نجوم')) {
        params.starRating.push(5);
    } else if (query.includes('أربع نجوم') || query.includes('4 نجوم')) {
        params.starRating.push(4);
    } else if (query.includes('ثلاث نجوم') || query.includes('3 نجوم')) {
        params.starRating.push(3);
    }
    
    // Extract location
    for (const keyword of locationKeywords) {
        if (query.includes(keyword.ar)) {
            params.query = `Hotels in ${keyword.en}`;
            break;
        }
    }
    
    // Set default dates (next week for 3 nights)
    const today = new Date();
    const checkIn = new Date(today);
    checkIn.setDate(today.getDate() + 7); // Next week
    
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkIn.getDate() + 3); // 3 nights
    
    params.checkIn = formatDate(checkIn);
    params.checkOut = formatDate(checkOut);
    
    return params;
}

/**
 * Format a date as YYYY-MM-DD
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Export the functions for use in other files
export {
    searchHotels,
    processArabicQuery
};
