from .base_agent import BaseAgent
import re
import json
import logging
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("FlightsAgent")

class FlightsAgent(BaseAgent):
    """Agent specialized in handling flight search and booking tasks."""
    
    def __init__(self):
        super().__init__(name="Flights Expert")
        self.airport_codes = {
            "dmm": "DMM", "dammam": "DMM",
            "jed": "JED", "jeddah": "JED", 
            "ruh": "RUH", "riyadh": "RUH",
            "dxb": "DXB", "dubai": "DXB",
            "bkk": "BKK", "bangkok": "BKK",
            "ist": "IST", "istanbul": "IST",
            "cai": "CAI", "cairo": "CAI",
            "lhr": "LHR", "london": "LHR",
            "cdg": "CDG", "paris": "CDG",
            "jfk": "JFK", "new york": "JFK"
        }
    
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
        high_confidence = ["flight", "fly", "plane", "airport", "airline", "ticket"]
        
        # Medium confidence keywords
        medium_confidence = ["travel", "trip", "journey", "booking"]
        
        # Look for airport codes or city names
        has_airport = False
        for airport in self.airport_codes:
            if airport in request_lower:
                has_airport = True
                break
                
        # Look for "from [X] to [Y]" pattern which strongly indicates flight search
        from_to_pattern = re.search(r'from\s+\w+\s+to\s+\w+', request_lower)
        
        # Calculate confidence based on keywords and patterns
        confidence = 0.0
        
        if from_to_pattern:
            confidence += 0.6
            
        if has_airport:
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
        Process a flight-related request and return a response.
        
        Args:
            request (str): The user's request text
            context (dict, optional): Additional context information
            
        Returns:
            dict: The agent's response
        """
        if context:
            self.context.update(context)
            
        # Extract flight parameters from the request
        params = self._extract_flight_params(request)
        logger.info(f"Extracted flight parameters: {params}")
        
        # Validate the extracted parameters
        if not params.get('departure_id') or not params.get('arrival_id'):
            return {
                "content": "I'd be happy to help you find flights! Could you please specify your departure and arrival cities or airports?",
                "type": "text"
            }
            
        # Format a response based on the parameters
        response_content = f"I found some great flight options from {params['departure_id']} to {params['arrival_id']}"
        
        if params.get('outbound_date'):
            response_content += f" on {params['outbound_date']}"
        else:
            response_content += " based on your request"
            
        response_content += ". Here are the best options:"
        
        # Simulate flight results (in a real implementation, this would call the flight search API)
        flight_results = self._get_mock_flight_results(params)
        
        return {
            "content": response_content,
            "type": "flights",
            "results": flight_results
        }
        
    def _extract_flight_params(self, request):
        """
        Extract flight search parameters from the request.
        
        Args:
            request (str): The user's request text
            
        Returns:
            dict: Flight search parameters
        """
        request_lower = request.lower()
        params = {
            'departure_id': None,
            'arrival_id': None,
            'outbound_date': None,
            'flight_type': 'one_way',
            'max_price': 1000
        }
        
        # First try to match direct airport code patterns like "DMM to RUH" or "DMM-RUH"
        direct_pattern = re.search(r'\b([a-zA-Z]{3})\s*(?:to|-|>|→)\s*([a-zA-Z]{3})\b', request_lower)
        if direct_pattern:
            departure_code = direct_pattern.group(1).strip().upper()
            arrival_code = direct_pattern.group(2).strip().upper()
            
            # Verify these are valid airport codes in our system
            if departure_code in self.airport_codes.values():
                params['departure_id'] = departure_code
            else:
                # Try to match the code to our known airports
                for code, iata in self.airport_codes.items():
                    if code.lower() == departure_code.lower():
                        params['departure_id'] = iata
                        break
                        
            if arrival_code in self.airport_codes.values():
                params['arrival_id'] = arrival_code
            else:
                # Try to match the code to our known airports
                for code, iata in self.airport_codes.items():
                    if code.lower() == arrival_code.lower():
                        params['arrival_id'] = iata
                        break
        
        # If direct pattern didn't work, try the from/to pattern
        if not params['departure_id'] or not params['arrival_id']:
            # Extract departure and arrival airports/cities using from/to pattern
            from_match = re.search(r'from\s+([a-zA-Z\s]+)(?:\s+to|$)', request_lower)
            to_match = re.search(r'to\s+([a-zA-Z\s]+)', request_lower)
            
            if from_match:
                departure = from_match.group(1).strip()
                for code, iata in self.airport_codes.items():
                    if code in departure:
                        params['departure_id'] = iata
                        break
            
            if to_match:
                arrival = to_match.group(1).strip()
                for code, iata in self.airport_codes.items():
                    if code in arrival:
                        params['arrival_id'] = iata
                        break
        
        # If we still don't have departure and arrival, try to find any airport codes in the text
        if not params['departure_id'] or not params['arrival_id']:
            # Find all airport codes mentioned in the request
            airport_mentions = []
            for code, iata in self.airport_codes.items():
                if code in request_lower:
                    airport_mentions.append(iata)
            
            # If we found exactly two airports, assume the first is departure and second is arrival
            if len(airport_mentions) == 2:
                params['departure_id'] = airport_mentions[0]
                params['arrival_id'] = airport_mentions[1]
        
        # Extract date information
        today = datetime.now()
        
        # Check for specific time frames
        if "tomorrow" in request_lower:
            outbound_date = today + timedelta(days=1)
            params['outbound_date'] = outbound_date.strftime('%Y-%m-%d')
        elif "next week" in request_lower:
            outbound_date = today + timedelta(days=7)
            params['outbound_date'] = outbound_date.strftime('%Y-%m-%d')
        elif "next month" in request_lower:
            outbound_date = today + timedelta(days=30)
            params['outbound_date'] = outbound_date.strftime('%Y-%m-%d')
        
        # Check for specific time offsets
        time_offset_match = re.search(r'in\s+(\d+)\s+(days?|weeks?|months?)', request_lower)
        if time_offset_match:
            amount = int(time_offset_match.group(1))
            unit = time_offset_match.group(2)
            
            if 'day' in unit:
                outbound_date = today + timedelta(days=amount)
            elif 'week' in unit:
                outbound_date = today + timedelta(days=amount*7)
            elif 'month' in unit:
                outbound_date = today + timedelta(days=amount*30)
                
            params['outbound_date'] = outbound_date.strftime('%Y-%m-%d')
        
        # Extract price limit
        price_match = re.search(r'under\s+\$?(\d+)', request_lower)
        if price_match:
            params['max_price'] = int(price_match.group(1))
        
        # Determine if it's a round trip
        if "round trip" in request_lower or "return" in request_lower:
            params['flight_type'] = 'round_trip'
            
            # Try to extract return date
            return_match = re.search(r'return(?:ing)?\s+(?:on|in)\s+(\d+)\s+(days?|weeks?|months?)', request_lower)
            if return_match and params['outbound_date']:
                amount = int(return_match.group(1))
                unit = return_match.group(2)
                
                outbound_date = datetime.strptime(params['outbound_date'], '%Y-%m-%d')
                
                if 'day' in unit:
                    return_date = outbound_date + timedelta(days=amount)
                elif 'week' in unit:
                    return_date = outbound_date + timedelta(days=amount*7)
                elif 'month' in unit:
                    return_date = outbound_date + timedelta(days=amount*30)
                    
                params['return_date'] = return_date.strftime('%Y-%m-%d')
        
        return params
    
    def _get_mock_flight_results(self, params):
        """
        Generate mock flight results based on the parameters.
        In a real implementation, this would call the flight search API.
        
        Args:
            params (dict): Flight search parameters
            
        Returns:
            list: Mock flight results
        """
        # Generate some realistic mock data based on the parameters
        departure_id = params.get('departure_id', 'DMM')
        arrival_id = params.get('arrival_id', 'JED')
        
        # Base price influenced by route
        base_prices = {
            ('DMM', 'JED'): 200,
            ('DMM', 'RUH'): 150,
            ('DMM', 'DXB'): 300,
            ('DMM', 'BKK'): 450,
            ('JED', 'DMM'): 200,
            ('JED', 'RUH'): 180,
            ('JED', 'DXB'): 280,
            ('RUH', 'DMM'): 150,
            ('RUH', 'JED'): 180,
            ('RUH', 'DXB'): 250,
            ('RUH', 'IST'): 380
        }
        
        # Default base price if route not found
        base_price = base_prices.get((departure_id, arrival_id), 350)
        
        # Generate between 2-4 flight options
        import random
        num_flights = random.randint(2, 4)
        
        airlines = ['Saudi Arabian Airlines', 'Emirates', 'Qatar Airways', 'Turkish Airlines', 'Etihad Airways']
        
        flight_results = []
        
        for i in range(num_flights):
            # Randomize price within a range
            price_variation = random.uniform(0.8, 1.2)
            price = int(base_price * price_variation)
            
            # Random duration between 2-12 hours
            duration_hours = random.randint(1, 8)
            duration_minutes = random.randint(0, 59)
            duration = f"{duration_hours}h {duration_minutes}m"
            
            # Random departure time
            hour = random.randint(6, 22)
            minute = random.choice([0, 15, 30, 45])
            departure_time = f"{hour:02d}:{minute:02d}"
            
            # Select a random airline
            airline = random.choice(airlines)
            
            flight_results.append({
                "from": departure_id,
                "to": arrival_id,
                "price": price,
                "duration": duration,
                "departure": f"2025-04-15 {departure_time}",
                "airline": airline,
                "bookingUrl": "#"
            })
        
        # Sort by price
        flight_results.sort(key=lambda x: x["price"])
        
        return flight_results
