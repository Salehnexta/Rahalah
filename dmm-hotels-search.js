/**
 * Dammam Hotel Search using SearchApi.io
 * Searches for 5-star hotels in Dammam for 3 nights starting next week
 * Direct API call approach to bypass modules
 */

async function searchDammamHotels() {
    try {
        // Direct fetch approach instead of using the module
        // This avoids any module loading issues
        
        console.log('🏨 Searching for 5-star hotels in Dammam (DMM) for 3 nights starting next week 🏨');
        console.log('---------------------------------------------------------');
        
        // Calculate dates for next week and 3 nights later
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7); // 7 days from now = next week
        
        const checkOut = new Date(nextWeek);
        checkOut.setDate(nextWeek.getDate() + 3); // 3 nights stay
        
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        // Prepare search parameters with next week date and 3-night stay
        const checkInFormatted = formatDate(nextWeek);
        const checkOutFormatted = formatDate(checkOut);
        
        console.log('Search parameters:');
        console.log(`- Check-in: ${checkInFormatted}`);
        console.log(`- Check-out: ${checkOutFormatted}`);
        console.log(`- Nights: 3`);
        console.log(`- Location: Dammam (DMM)`);
        console.log(`- Star Rating: 5-star`);
        console.log('\nFetching results from SearchApi.io...');
        
        // Direct API call to SearchApi.io
        const API_KEY = 'nriBRADgZfgDwVCVKMryiQ2G';
        // Use SA for Saudi Arabia as the country code, add star_rating=5 for 5-star hotels
        const url = `https://www.searchapi.io/api/v1/search?engine=google_hotels&api_key=${API_KEY}&q=Hotels+in+Dammam&check_in_date=${checkInFormatted}&check_out_date=${checkOutFormatted}&adults=2&star_rating=5&gl=sa&hl=en`;
        
        console.log(`Fetching from: ${url}`);
        
        const response = await fetch(url);
        const responseData = await response.text(); // Get text first to inspect any potential error messages
        
        console.log(`Response status: ${response.status}`);
        
        // If response is not OK, log detailed error information
        if (!response.ok) {
            console.error(`API error: ${response.status} ${response.statusText}`);
            console.error(`Response body: ${responseData.slice(0, 500)}...`); // Log first 500 chars of response
            throw new Error(`API request failed with status: ${response.status}`);
        }
        
        // Parse JSON if response is OK
        const results = JSON.parse(responseData);
        
        if (results.properties && results.properties.length > 0) {
            console.log(`\n✅ Found ${results.properties.length} 5-star hotels in Dammam`);
            
            // Display all hotels with details
            console.log('\n===== 5-STAR DAMMAM HOTELS AVAILABLE FOR YOUR DATES =====');
            results.properties.forEach((hotel, index) => {
                console.log(`\n${index + 1}. ${hotel.name || 'Unnamed Hotel'}`);
                
                // Get rating information
                const rating = hotel.rating ? `${hotel.rating}/5` : 'N/A';
                const reviews = hotel.reviews_count || 0;
                console.log(`   Rating: ${rating} (${reviews} reviews)`);
                
                // Get price information
                const price = hotel.price ? hotel.price : 'Price not available';
                console.log(`   Price: ${price}`);
                
                // Address information
                console.log(`   Address: ${hotel.address || 'Address not available'}`);
                
                // Star rating
                console.log(`   Stars: ${hotel.stars || 5} ★`);
                
                // Show amenities if available
                if (hotel.amenities && hotel.amenities.length > 0) {
                    console.log(`   Amenities: ${hotel.amenities.slice(0, 5).join(', ')}`);
                }
                
                // Show booking URL
                console.log(`   Booking URL: ${hotel.link || 'URL not available'}`);
                console.log(`   ------------------------------`);
            });
            
            console.log('\nFor more details and booking, visit the hotel URLs.');
        } else {
            console.log(`❌ No 5-star hotels found in Dammam for your dates.`);
            
            // Check if there are properties but they might not be 5-star
            if (results.properties && results.properties.length === 0) {
                console.log(`Try searching without the 5-star filter for more options.`);
            }
            
            console.log(`Response structure: ${JSON.stringify(Object.keys(results))}`);
            
            // Log some sample data from the response to help debug
            if (results.search_information) {
                console.log(`Search Information: ${JSON.stringify(results.search_information)}`);
            }
        }
    } catch (error) {
        console.error('Error searching for Dammam hotels:', error.message);
        console.error('Try checking the API key or request parameters');
    }
}

// Execute the search
searchDammamHotels();
