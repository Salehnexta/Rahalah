/**
 * Flight Data Provider
 * 
 * This module provides flight data for the Rahalah travel app.
 * It includes both static data for common routes and functions
 * to process natural language queries in Arabic.
 */

// Common routes with realistic flight data
const flightDatabase = {
  // Dammam (DMM) to Jeddah (JED)
  'DMM-JED': [
    {
      airline: 'flyadeal',
      flightNumber: 'F3 1143',
      departureTime: '06:30',
      arrivalTime: '08:50',
      duration: '2h 20m',
      price: 146,
      currency: 'SAR',
      stops: 0,
      aircraft: 'Airbus A320'
    },
    {
      airline: 'Saudia',
      flightNumber: 'SV 1054',
      departureTime: '10:00',
      arrivalTime: '12:25',
      duration: '2h 25m',
      price: 439,
      currency: 'SAR',
      stops: 0,
      aircraft: 'Boeing 787-9'
    },
    {
      airline: 'flyadeal',
      flightNumber: 'F3 1147',
      departureTime: '15:35',
      arrivalTime: '17:55',
      duration: '2h 20m',
      price: 180,
      currency: 'SAR',
      stops: 0,
      aircraft: 'Airbus A320'
    },
    {
      airline: 'Saudia',
      flightNumber: 'SV 1058',
      departureTime: '16:00',
      arrivalTime: '18:25',
      duration: '2h 25m',
      price: 450,
      currency: 'SAR',
      stops: 0,
      aircraft: 'Airbus A330'
    },
    {
      airline: 'flynas',
      flightNumber: 'XY 2163',
      departureTime: '19:45',
      arrivalTime: '22:05',
      duration: '2h 20m',
      price: 165,
      currency: 'SAR',
      stops: 0,
      aircraft: 'Airbus A320'
    }
  ],
  
  // Dammam (DMM) to Riyadh (RUH)
  'DMM-RUH': [
    {
      airline: 'Saudia',
      flightNumber: 'SV 1052',
      departureTime: '07:30',
      arrivalTime: '08:40',
      duration: '1h 10m',
      price: 340,
      currency: 'SAR',
      stops: 0,
      aircraft: 'Airbus A320'
    },
    {
      airline: 'flynas',
      flightNumber: 'XY 2164',
      departureTime: '09:15',
      arrivalTime: '10:25',
      duration: '1h 10m',
      price: 220,
      currency: 'SAR',
      stops: 0,
      aircraft: 'Airbus A320'
    },
    {
      airline: 'flyadeal',
      flightNumber: 'F3 1145',
      departureTime: '14:20',
      arrivalTime: '15:30',
      duration: '1h 10m',
      price: 195,
      currency: 'SAR',
      stops: 0,
      aircraft: 'Airbus A320'
    }
  ],
  
  // Dammam (DMM) to Bangkok (BKK)
  'DMM-BKK': [
    {
      airline: 'Saudia',
      flightNumber: 'SV 846',
      departureTime: '01:25',
      arrivalTime: '15:05',
      duration: '7h 40m',
      price: 2450,
      currency: 'SAR',
      stops: 1,
      stopAirports: ['JED'],
      aircraft: 'Boeing 787-9'
    },
    {
      airline: 'Emirates',
      flightNumber: 'EK 566',
      departureTime: '18:45',
      arrivalTime: '10:05+1',
      duration: '9h 20m',
      price: 2850,
      currency: 'SAR',
      stops: 1,
      stopAirports: ['DXB'],
      aircraft: 'Boeing 777-300ER'
    },
    {
      airline: 'Qatar Airways',
      flightNumber: 'QR 1127',
      departureTime: '02:10',
      arrivalTime: '16:30',
      duration: '8h 20m',
      price: 3100,
      currency: 'SAR',
      stops: 1,
      stopAirports: ['DOH'],
      aircraft: 'Airbus A350-900'
    }
  ],
  
  // Riyadh (RUH) to Mecca (via Jeddah JED)
  'RUH-JED': [
    {
      airline: 'Saudia',
      flightNumber: 'SV 1024',
      departureTime: '06:00',
      arrivalTime: '07:45',
      duration: '1h 45m',
      price: 590,
      currency: 'SAR',
      stops: 0,
      aircraft: 'Airbus A320'
    },
    {
      airline: 'flynas',
      flightNumber: 'XY 2113',
      departureTime: '10:15',
      arrivalTime: '12:00',
      duration: '1h 45m',
      price: 520,
      currency: 'SAR',
      stops: 0,
      aircraft: 'Airbus A320'
    },
    {
      airline: 'flyadeal',
      flightNumber: 'F3 1134',
      departureTime: '16:30',
      arrivalTime: '18:15',
      duration: '1h 45m',
      price: 480,
      currency: 'SAR',
      stops: 0,
      aircraft: 'Airbus A320'
    }
  ]
};

// Hotel database for common destinations
const hotelDatabase = {
  // Bangkok hotels
  'BKK': [
    {
      name: 'Grande Centre Point Hotel Terminal21',
      stars: 5,
      price: 750,
      currency: 'SAR',
      perNight: true,
      address: 'Sukhumvit Road, Bangkok',
      amenities: ['Pool', 'Spa', 'Free WiFi', 'Restaurant'],
      rating: 4.7,
      reviewCount: 2453
    },
    {
      name: 'Shangri-La Bangkok',
      stars: 5,
      price: 950,
      currency: 'SAR',
      perNight: true,
      address: 'Riverside, Bangkok',
      amenities: ['Pool', 'Spa', 'Free WiFi', 'Multiple Restaurants', 'River View'],
      rating: 4.8,
      reviewCount: 3256
    },
    {
      name: 'Siam Kempinski Hotel Bangkok',
      stars: 5,
      price: 1100,
      currency: 'SAR',
      perNight: true,
      address: 'Pathum Wan, Bangkok',
      amenities: ['Pool', 'Spa', 'Free WiFi', 'Luxury Amenities', 'Shopping Access'],
      rating: 4.9,
      reviewCount: 2876
    }
  ],
  
  // Mecca hotels
  'JED': [
    {
      name: 'Makkah Clock Royal Tower',
      stars: 5,
      price: 1500,
      currency: 'SAR',
      perNight: true,
      address: 'Abraj Al Bait, Mecca',
      amenities: ['Haram View', 'Free WiFi', 'Multiple Restaurants', 'Shopping'],
      rating: 4.6,
      reviewCount: 5432
    },
    {
      name: 'Conrad Makkah',
      stars: 5,
      price: 1200,
      currency: 'SAR',
      perNight: true,
      address: 'Jabal Omar, Mecca',
      amenities: ['Luxury Rooms', 'Free WiFi', 'Restaurant', 'Fitness Center'],
      rating: 4.7,
      reviewCount: 3241
    }
  ]
};

// Car rental database for common destinations
const carRentalDatabase = {
  'BKK': [
    {
      company: 'Avis',
      carType: 'Toyota Corolla',
      price: 120,
      currency: 'SAR',
      perDay: true,
      pickupLocations: ['Suvarnabhumi Airport', 'Don Mueang Airport', 'City Center'],
      features: ['Automatic', 'Air Conditioning', 'GPS']
    },
    {
      company: 'Hertz',
      carType: 'Honda Civic',
      price: 135,
      currency: 'SAR',
      perDay: true,
      pickupLocations: ['Suvarnabhumi Airport', 'City Center'],
      features: ['Automatic', 'Air Conditioning', 'Bluetooth']
    }
  ],
  'JED': [
    {
      company: 'Budget',
      carType: 'Toyota Camry',
      price: 180,
      currency: 'SAR',
      perDay: true,
      pickupLocations: ['King Abdulaziz Airport', 'City Center'],
      features: ['Automatic', 'Air Conditioning', 'GPS']
    },
    {
      company: 'Hanco',
      carType: 'Hyundai Sonata',
      price: 165,
      currency: 'SAR',
      perDay: true,
      pickupLocations: ['King Abdulaziz Airport', 'City Center', 'Mecca Road'],
      features: ['Automatic', 'Air Conditioning', 'Bluetooth']
    }
  ]
};

/**
 * Process Arabic language query and extract search parameters
 * @param {string} arabicQuery - Natural language query in Arabic
 * @returns {Object} Extracted search parameters
 */
function processArabicQuery(arabicQuery) {
  // City code mapping
  const cityMapping = {
    'الرياض': 'RUH',
    'جدة': 'JED',
    'جده': 'JED',
    'مكة': 'JED', // Mecca - closest airport is Jeddah
    'مكه': 'JED',
    'الدمام': 'DMM',
    'بانكوك': 'BKK'
  };
  
  // Extract origin
  let origin = null;
  Object.entries(cityMapping).forEach(([city, code]) => {
    if (arabicQuery.includes(`من ${city}`)) {
      origin = code;
    }
  });
  
  // Extract destination
  let destination = null;
  Object.entries(cityMapping).forEach(([city, code]) => {
    if (arabicQuery.includes(`الى ${city}`) || 
        arabicQuery.includes(`إلى ${city}`) ||
        arabicQuery.includes(`ل${city}`)) {
      destination = code;
    }
  });
  
  // Set defaults if not detected
  if (!origin) origin = 'DMM';
  if (!destination) destination = 'JED';
  
  // Make sure origin and destination are different
  if (origin === destination) {
    console.warn('Origin and destination are the same! Setting default destination.');
    destination = origin === 'JED' ? 'RUH' : 'JED';
  }
  
  // Detect date
  let departDate = new Date();
  
  // Check for 'tomorrow' in Arabic
  if (arabicQuery.includes('غدا') || arabicQuery.includes('غداً')) {
    departDate.setDate(departDate.getDate() + 1);
  } else if (arabicQuery.includes('بعد غد')) {
    departDate.setDate(departDate.getDate() + 2);
  } else if (arabicQuery.includes('أسبوع') || arabicQuery.includes('اسبوع')) {
    departDate.setDate(departDate.getDate() + 7);
  }
  
  // Format date as YYYY-MM-DD
  const formattedDate = departDate.toISOString().split('T')[0];
  
  // Detect hotel requirements
  let hotelNeeded = arabicQuery.includes('فندق') || arabicQuery.includes('فنادق');
  let hotelStars = 0;
  
  // Check for hotel stars
  if (arabicQuery.includes('5 نجوم') || arabicQuery.includes('خمس نجوم') || arabicQuery.includes('خمسة نجوم')) {
    hotelStars = 5;
  } else if (arabicQuery.includes('4 نجوم') || arabicQuery.includes('أربع نجوم') || arabicQuery.includes('اربع نجوم')) {
    hotelStars = 4;
  } else if (arabicQuery.includes('3 نجوم') || arabicQuery.includes('ثلاث نجوم')) {
    hotelStars = 3;
  }
  
  // Detect car rental requirements
  let carNeeded = arabicQuery.includes('سيارة') || arabicQuery.includes('سيارات') || arabicQuery.includes('ايجار');
  
  return {
    origin,
    destination,
    departDate: formattedDate,
    adults: 1,
    hotelNeeded,
    hotelStars,
    carNeeded
  };
}

/**
 * Search for flights based on parameters
 * @param {Object} params - Search parameters
 * @returns {Array} Array of matching flights
 */
function searchFlights(params) {
  const { origin, destination, departDate } = params;
  const routeKey = `${origin}-${destination}`;
  
  // Check if we have data for this route
  if (flightDatabase[routeKey]) {
    return flightDatabase[routeKey].map(flight => {
      // Clone the flight object to avoid modifying the original
      return { ...flight, departDate };
    });
  }
  
  return [];
}

/**
 * Search for hotels based on parameters
 * @param {Object} params - Search parameters
 * @returns {Array} Array of matching hotels
 */
function searchHotels(params) {
  const { destination, hotelStars } = params;
  
  // Check if we have hotel data for this destination
  if (hotelDatabase[destination]) {
    return hotelDatabase[destination].filter(hotel => {
      // Filter by stars if specified
      if (hotelStars > 0) {
        return hotel.stars >= hotelStars;
      }
      return true;
    });
  }
  
  return [];
}

/**
 * Search for car rentals based on parameters
 * @param {Object} params - Search parameters
 * @returns {Array} Array of matching car rentals
 */
function searchCarRentals(params) {
  const { destination } = params;
  
  // Check if we have car rental data for this destination
  if (carRentalDatabase[destination]) {
    return carRentalDatabase[destination];
  }
  
  return [];
}

/**
 * Process a travel search query in Arabic
 * @param {string} arabicQuery - Natural language query in Arabic
 * @returns {Object} Search results including flights, hotels, and car rentals
 */
function processTravel(arabicQuery) {
  // Extract search parameters from the Arabic query
  const params = processArabicQuery(arabicQuery);
  
  // Search for flights
  const flights = searchFlights(params);
  
  // Search for hotels if needed
  const hotels = params.hotelNeeded ? searchHotels(params) : [];
  
  // Search for car rentals if needed
  const cars = params.carNeeded ? searchCarRentals(params) : [];
  
  return {
    query: arabicQuery,
    params,
    flights,
    hotels,
    cars
  };
}

module.exports = {
  processArabicQuery,
  searchFlights,
  searchHotels,
  searchCarRentals,
  processTravel
};
