/**
 * Test script for improved MCP travel search
 * This demonstrates searching for flights, hotels, and car rentals based on user requirements
 */

const { processMCPTravel } = require('./js/mcp-travel-search');
const fs = require('fs');
const path = require('path');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Test queries based on user requirements
const testQueries = [
  {
    name: 'flight-search',
    query: 'رحلة من الدمام الى بانكوك الأسبوع القادم',
    description: 'Flight from DMM to BKK next week'
  },
  {
    name: 'hotel-search',
    query: 'فندق خمس نجوم في بانكوك لمدة ثلاث ليالي الأسبوع القادم',
    description: '5-star hotel in Bangkok for 3 nights next week'
  },
  {
    name: 'car-rental',
    query: 'استئجار سيارة في بانكوك الأسبوع القادم',
    description: 'Car rental in Bangkok next week'
  }
];

async function runSearch(queryObj) {
  console.log(`\n=== TESTING: ${queryObj.description} ===`);
  console.log(`Processing Arabic query: "${queryObj.query}"`);
  
  try {
    // Process the Arabic query and perform real search with MCP
    console.log('Searching for travel options using improved MCP implementation...');
    const results = await processMCPTravel(queryObj.query);
    
    // Save screenshot if available
    if (results.flights && results.flights.screenshot) {
      const screenshotPath = path.join(screenshotsDir, `${queryObj.name}-${Date.now()}.png`);
      fs.writeFileSync(screenshotPath, results.flights.screenshot);
      console.log(`Flight screenshot saved to: ${screenshotPath}`);
    }
    
    if (results.hotels && results.hotels.screenshot) {
      const screenshotPath = path.join(screenshotsDir, `${queryObj.name}-hotels-${Date.now()}.png`);
      fs.writeFileSync(screenshotPath, results.hotels.screenshot);
      console.log(`Hotel screenshot saved to: ${screenshotPath}`);
    }
    
    // Display flight results
    if (results.flights) {
      console.log('\n=== FLIGHT SEARCH RESULTS ===\n');
      
      if (!results.flights.success) {
        console.log(`Search encountered issues: ${results.flights.error}`);
        console.log('Using fallback flight data:');
      }
      
      if (results.flights.flights.length === 0) {
        console.log('No flights found for this route.');
      } else {
        results.flights.flights.forEach((flight, index) => {
          console.log(`\nFlight #${index + 1}:`);
          console.log(`  Airline: ${flight.airline} ${flight.flightNumber || ''}`);
          console.log(`  Departure: ${flight.departTime}`);
          console.log(`  Arrival: ${flight.arriveTime}`);
          console.log(`  Duration: ${flight.duration}`);
          console.log(`  Price: ${flight.price}`);
          console.log(`  Stops: ${flight.stops}`);
        });
      }
    }
    
    // Display hotel results if available
    if (results.hotels) {
      console.log('\n=== HOTEL SEARCH RESULTS ===\n');
      
      if (!results.hotels.success) {
        console.log(`Hotel search encountered issues: ${results.hotels.error}`);
        console.log('Using fallback hotel data:');
      }
      
      if (results.hotels.hotels && results.hotels.hotels.length === 0) {
        console.log('No hotels found for this destination.');
      } else if (results.hotels.hotels) {
        results.hotels.hotels.forEach((hotel, index) => {
          console.log(`\nHotel #${index + 1}:`);
          console.log(`  Name: ${hotel.name}`);
          console.log(`  Rating: ${hotel.rating || hotel.stars + ' stars'}`);
          console.log(`  Price: ${hotel.price}`);
          console.log(`  Address: ${hotel.address || 'Address not available'}`);
        });
      }
    }
    
    // Display car rental results if available
    if (results.cars) {
      console.log('\n=== CAR RENTAL RESULTS ===\n');
      
      if (!results.cars.success) {
        console.log(`Car rental search encountered issues: ${results.cars.error}`);
        console.log('Using fallback car rental data:');
      } else if (results.cars.cars && results.cars.cars.length > 0) {
        results.cars.cars.forEach((car, index) => {
          console.log(`\nCar Rental #${index + 1}:`);
          console.log(`  Company: ${car.company}`);
          console.log(`  Car Type: ${car.carType}`);
          console.log(`  Model: ${car.model}`);
          console.log(`  Price: ${car.price}`);
          console.log(`  Location: ${car.location}`);
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error running search:', error);
    return { error: error.message };
  }
}

// Get the query index from command line or default to 0
const queryIndex = process.argv[2] ? parseInt(process.argv[2]) : 0;

if (queryIndex >= 0 && queryIndex < testQueries.length) {
  console.log('Starting improved MCP travel search...');
  runSearch(testQueries[queryIndex]).catch(error => {
    console.error('Fatal error running search:', error);
  });
} else {
  console.log('Invalid query index. Available queries:');
  testQueries.forEach((query, index) => {
    console.log(`${index}: ${query.description} - "${query.query}"`);
  });
}
