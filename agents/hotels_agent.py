from .base_agent import BaseAgent
import re
import logging
from datetime import datetime, timedelta
import random

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("HotelsAgent")

class HotelsAgent(BaseAgent):
    """Agent specialized in handling hotel search and booking tasks."""
    
    def __init__(self):
        super().__init__(name="Hotels Expert")
        self.city_codes = {
            "dammam": "DMM",
            "damm": "DMM",
            "damma": "DMM",
            "dmm": "DMM",
            "jeddah": "JED",
            "jed": "JED",
            "riyadh": "RUH",
            "ruh": "RUH",
            "dubai": "DXB",
            "dxb": "DXB",
            "bangkok": "BKK",
            "bkk": "BKK",
            "istanbul": "IST",
            "ist": "IST", 
            "cairo": "CAI",
            "london": "LHR",
            "lhr": "LHR",
            "paris": "CDG",
            "cdg": "CDG",
            "new york": "JFK",
            "jfk": "JFK"
        }
        
        # Common hotel amenities
        self.amenities = [
            "Free WiFi", "Swimming pool", "Fitness center", "Restaurant", 
            "Room service", "Spa", "Airport shuttle", "Business center",
            "Free parking", "Breakfast included", "Air conditioning",
            "Concierge service", "Hot tub", "Bar/Lounge"
        ]
    
    def can_handle(self, request):
        """
        Determine if this agent can handle the given request.
        
        Args:
            request (str): The user's request text
            
        Returns:
            float: Confidence score between 0.0 and 1.0
        """
        request_lower = request.lower()
        
        # High confidence keywords
        high_confidence = ["hotel", "room", "accommodation", "stay", "lodge", "resort", "inn"]
        
        # Medium confidence keywords
        medium_confidence = ["book", "reservation", "night", "suite", "check-in", "check-out"]
        
        # Look for city names
        has_city = False
        for city in self.city_codes:
            if city in request_lower:
                has_city = True
                break
        
        # Pattern for direct hotel+city mention (e.g., "hotel dammam" or "dammam hotel")
        direct_hotel_city_pattern = False
        for city in self.city_codes:
            for keyword in high_confidence:
                pattern1 = f"{keyword}\s+{city}"
                pattern2 = f"{city}\s+{keyword}"
                if pattern1 in request_lower or pattern2 in request_lower:
                    direct_hotel_city_pattern = True
                    break
                
        # Look for "hotel in [city]" pattern
        hotel_in_pattern = re.search(r'(?:hotel|room|accommodation|stay)(?:\s+in|\s+at|\s+near)\s+\w+', request_lower)
        
        # Calculate confidence based on keywords and patterns
        confidence = 0.0
        
        if hotel_in_pattern:
            confidence += 0.6
            
        if direct_hotel_city_pattern:
            confidence += 0.7
            
        if has_city:
            confidence += 0.3
            
        for keyword in high_confidence:
            if keyword in request_lower:
                confidence += 0.2
                
        for keyword in medium_confidence:
            if keyword in request_lower:
                confidence += 0.1
        
        # Cap confidence at 1.0
        return min(confidence, 1.0)
    
    def process_request(self, request, context=None):
        """
        Process a hotel-related request and return a response.
        
        Args:
            request (str): The user's request text
            context (dict, optional): Additional context information
            
        Returns:
            dict: The agent's response
        """
        if context:
            self.context.update(context)
            
        # Extract hotel parameters from the request
        params = self._extract_hotel_params(request)
        logger.info(f"Extracted hotel parameters: {params}")
        
        # Validate the extracted parameters
        if not params.get('location'):
            return {
                "content": "I'd be happy to help you find a hotel! Could you please specify which city or location you're interested in?",
                "type": "text"
            }
            
        # Format a response based on the parameters
        location_name = next((city for city, code in self.city_codes.items() if code == params['location']), params['location'])
        response_content = f"I found some excellent hotel options in {location_name.title()}"
        
        if params.get('check_in') and params.get('check_out'):
            response_content += f" from {params['check_in']} to {params['check_out']}"
            
        if params.get('guests'):
            response_content += f" for {params['guests']} guest(s)"
            
        response_content += ". Here are my top recommendations:"
        
        # Generate hotel results
        hotel_results = self._get_mock_hotel_results(params)
        
        return {
            "content": response_content,
            "type": "hotels",
            "results": hotel_results
        }
        
    def _extract_hotel_params(self, request):
        """
        Extract hotel search parameters from the request.
        
        Args:
            request (str): The user's request text
            
        Returns:
            dict: Hotel search parameters
        """
        request_lower = request.lower()
        params = {
            'location': None,
            'check_in': None,
            'check_out': None,
            'guests': 2,
            'max_price': 300,
            'amenities': []
        }
        
        # Try to extract city from direct mention patterns first
        # This handles cases like "hotel dammam tomorrow"
        words = request_lower.split()
        for i, word in enumerate(words):
            if word in self.city_codes:
                params['location'] = self.city_codes[word]
                break
        
        # If still no location, try looking for partial matches
        if not params['location']:
            for city, code in self.city_codes.items():
                if city in request_lower:
                    params['location'] = code
                    break
        
        # If still no city was found, look for a location pattern
        if not params['location']:
            location_match = re.search(r'(?:in|at|near|to)\s+([a-zA-Z\s]+)(?:\.|\?|$|\s+for)', request_lower)
            if location_match:
                location = location_match.group(1).strip()
                # Check if this matches any of our city codes
                for city, code in self.city_codes.items():
                    if city in location:
                        params['location'] = code
                        break
                
                # If still no match, just use the location string
                if not params['location']:
                    params['location'] = location
        
        # Extract date information
        today = datetime.now()
        
        # Default check-in date (tomorrow)
        check_in = today + timedelta(days=1)
        # Default check-out date (check-in + 3 days)
        check_out = check_in + timedelta(days=3)
        
        # Check for specific time frames like "tomorrow" or "next week"
        if "tomorrow" in request_lower:
            check_in = today + timedelta(days=1)
            check_out = check_in + timedelta(days=3)
        elif "tonight" in request_lower or "today" in request_lower:
            check_in = today
            check_out = today + timedelta(days=1)
        elif "next week" in request_lower:
            check_in = today + timedelta(days=7)
            check_out = check_in + timedelta(days=3)
        elif "weekend" in request_lower:
            # Find the next Saturday
            days_until_saturday = (5 - today.weekday()) % 7
            if days_until_saturday == 0:  # Today is Saturday
                days_until_saturday = 7
            check_in = today + timedelta(days=days_until_saturday)
            check_out = check_in + timedelta(days=2)  # Saturday to Monday
        
        params['check_in'] = check_in.strftime('%Y-%m-%d')
        params['check_out'] = check_out.strftime('%Y-%m-%d')
        
        # Try to extract specific dates
        date_range_match = re.search(r'from\s+(\w+\s+\d{1,2})\s+to\s+(\w+\s+\d{1,2})', request_lower)
        if date_range_match:
            try:
                # This is simplified and would need more robust date parsing in a real system
                check_in_str = date_range_match.group(1)
                check_out_str = date_range_match.group(2)
                
                # Add the year since it might be missing from the request
                current_year = today.year
                check_in_with_year = f"{check_in_str}, {current_year}"
                check_out_with_year = f"{check_out_str}, {current_year}"
                
                # Parse dates
                check_in = datetime.strptime(check_in_with_year, '%B %d, %Y')
                check_out = datetime.strptime(check_out_with_year, '%B %d, %Y')
                
                # Ensure check_out is after check_in
                if check_out <= check_in:
                    check_out = check_in + timedelta(days=1)
                
                params['check_in'] = check_in.strftime('%Y-%m-%d')
                params['check_out'] = check_out.strftime('%Y-%m-%d')
            except ValueError:
                # If date parsing fails, just use the defaults
                pass
        
        # Extract number of guests
        guests_match = re.search(r'(\d+)\s+(?:guests?|people|persons?)', request_lower)
        if guests_match:
            params['guests'] = int(guests_match.group(1))
        
        # Extract price limit
        price_match = re.search(r'under\s+\$?(\d+)', request_lower)
        if price_match:
            params['max_price'] = int(price_match.group(1))
        
        # Extract amenities
        for amenity in self.amenities:
            if amenity.lower() in request_lower:
                params['amenities'].append(amenity)
        
        return params
    
    def _get_mock_hotel_results(self, params):
        """
        Generate mock hotel results based on the parameters.
        In a real implementation, this would call a hotel booking API.
        
        Args:
            params (dict): Hotel search parameters
            
        Returns:
            list: Mock hotel results
        """
        location = params.get('location', 'Unknown')
        max_price = params.get('max_price', 300)
        
        # Hotel chain names
        hotel_chains = [
            "Hilton", "Marriott", "Hyatt", "Sheraton", "Four Seasons", 
            "Ritz-Carlton", "Westin", "Holiday Inn", "InterContinental",
            "Radisson", "Fairmont", "Waldorf Astoria", "St. Regis", "W Hotels"
        ]
        
        # Location-based name additions
        location_names = {
            "DMM": ["Dammam", "Corniche", "Al Khobar", "Dhahran", "Eastern Province"],
            "JED": ["Jeddah", "Red Sea", "Al Balad", "Corniche", "Andalus"],
            "RUH": ["Riyadh", "Kingdom Centre", "Olaya", "Diplomatic Quarter", "Al Faisaliah"],
            "DXB": ["Dubai", "Marina", "Downtown", "Palm Jumeirah", "Business Bay"],
            "BKK": ["Bangkok", "Sukhumvit", "Riverside", "Silom", "Siam"],
            "IST": ["Istanbul", "Bosphorus", "Taksim", "Sultanahmet", "Beyoglu"],
            "CAI": ["Cairo", "Nile", "Giza", "Heliopolis", "Zamalek"],
            "LHR": ["London", "Westminster", "Kensington", "Mayfair", "Chelsea"],
            "CDG": ["Paris", "Champs-Élysées", "Eiffel", "Opera", "Louvre"],
            "JFK": ["New York", "Manhattan", "Times Square", "Central Park", "Broadway"]
        }
        
        # Generate between 2-4 hotel options
        num_hotels = random.randint(2, 4)
        
        hotel_results = []
        
        location_name_options = location_names.get(location, ["City Center", "Downtown", "Plaza", "Boulevard", "Resort"])
        
        for i in range(num_hotels):
            # Randomize price within a range
            price_variation = random.uniform(0.7, 1.0)
            price = int(max_price * price_variation)
            
            # Generate hotel name
            hotel_chain = random.choice(hotel_chains)
            location_name = random.choice(location_name_options)
            hotel_name = f"{hotel_chain} {location_name}"
            
            # Random rating between 3.5 and 5.0
            rating = round(random.uniform(3.5, 5.0), 1)
            
            # Random number of reviews
            reviews = random.randint(50, 1500)
            
            # Select random amenities
            num_amenities = random.randint(4, 8)
            selected_amenities = random.sample(self.amenities, num_amenities)
            
            # Generate image URL (placeholder)
            image_url = "#"
            
            hotel_results.append({
                "name": hotel_name,
                "location": location if len(location) == 3 else location.title(),
                "price": price,
                "price_per_night": price,
                "total_price": price * ((datetime.strptime(params['check_out'], '%Y-%m-%d') - 
                                       datetime.strptime(params['check_in'], '%Y-%m-%d')).days or 1),
                "rating": rating,
                "reviews": reviews,
                "amenities": selected_amenities,
                "image": image_url,
                "bookingUrl": "#"
            })
        
        # Sort by price
        hotel_results.sort(key=lambda x: x["price"])
        
        return hotel_results
