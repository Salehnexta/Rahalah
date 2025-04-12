from .base_agent import BaseAgent
from .flights_agent import FlightsAgent
from .hotels_agent import HotelsAgent
import re
import logging
import random
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("PackageAgent")

class PackageAgent(BaseAgent):
    """Agent specialized in handling combined flight and hotel packages."""
    
    def __init__(self):
        super().__init__(name="Package Expert")
        # Initialize flight and hotel agents to reuse their functionality
        self.flights_agent = FlightsAgent()
        self.hotels_agent = HotelsAgent()
        
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
        high_confidence = ["package", "bundle", "combo", "travel package", "vacation package", "combo deal"]
        
        # Medium confidence keywords
        medium_confidence = ["trip", "vacation", "journey", "getaway", "holiday", "both", "together", "flight and hotel"]
        
        # Check if the request contains both flight and hotel indicators
        has_flight_indicators = False
        has_hotel_indicators = False
        
        # Flight indicators
        flight_keywords = ["flight", "fly", "airline", "plane", "travel"]
        for keyword in flight_keywords:
            if keyword in request_lower:
                has_flight_indicators = True
                break
                
        # Hotel indicators
        hotel_keywords = ["hotel", "stay", "room", "accommodation", "resort"]
        for keyword in hotel_keywords:
            if keyword in request_lower:
                has_hotel_indicators = True
                break
        
        # Calculate confidence based on keywords and patterns
        confidence = 0.0
        
        # High confidence if it explicitly mentions packages
        for keyword in high_confidence:
            if keyword in request_lower:
                confidence += 0.4
                
        # Medium confidence for related keywords
        for keyword in medium_confidence:
            if keyword in request_lower:
                confidence += 0.2
                
        # High confidence if it mentions both flights and hotels
        if has_flight_indicators and has_hotel_indicators:
            confidence += 0.5
            
        # Boost confidence if it mentions a city
        for city in self.flights_agent.airport_codes:
            if city in request_lower:
                confidence += 0.1
                break
        
        # Cap confidence at 1.0
        return min(confidence, 1.0)
    
    def process_request(self, request, context=None):
        """
        Process a package-related request and return a response.
        
        Args:
            request (str): The user's request text
            context (dict, optional): Additional context information
            
        Returns:
            dict: The agent's response
        """
        if context:
            self.context.update(context)
            
        # Extract package parameters from the request
        params = self._extract_package_params(request)
        logger.info(f"Extracted package parameters: {params}")
        
        # Validate the extracted parameters
        if not params.get('destination'):
            return {
                "content": "I'd be happy to help you find a travel package! Could you please specify your destination?",
                "type": "text"
            }
            
        if not params.get('departure'):
            return {
                "content": "I'd be happy to help you find a travel package! Could you please specify your departure city?",
                "type": "text"
            }
            
        # Format a response based on the parameters
        destination_name = next((city for city, code in self.flights_agent.airport_codes.items() 
                              if code == params['destination']), params['destination'])
        departure_name = next((city for city, code in self.flights_agent.airport_codes.items() 
                            if code == params['departure']), params['departure'])
        
        response_content = f"I found some great travel packages from {departure_name.title()} to {destination_name.title()}"
        
        if params.get('outbound_date'):
            response_content += f" departing on {params['outbound_date']}"
        
        if params.get('return_date'):
            response_content += f" and returning on {params['return_date']}"
            
        response_content += ". Each package includes both flight and hotel accommodations. Here are the best options:"
        
        # Generate package results
        package_results = self._get_mock_package_results(params)
        
        return {
            "content": response_content,
            "type": "packages",
            "results": package_results
        }
        
    def _extract_package_params(self, request):
        """
        Extract travel package parameters from the request.
        
        Args:
            request (str): The user's request text
            
        Returns:
            dict: Package search parameters
        """
        # Leverage both flight and hotel agents to extract parameters
        flight_params = self.flights_agent._extract_flight_params(request)
        hotel_params = self.hotels_agent._extract_hotel_params(request)
        
        # Combine parameters
        params = {
            'departure': flight_params.get('departure_id'),
            'destination': flight_params.get('arrival_id'),
            'outbound_date': flight_params.get('outbound_date'),
            'return_date': None,
            'adults': 2,
            'children': 0,
            'max_price': 1500,
            'hotel_rating': 4
        }
        
        # For location, prioritize flight destination over hotel location
        if not params['destination'] and hotel_params.get('location'):
            params['destination'] = hotel_params.get('location')
            
        # Use hotel check-in and check-out as outbound and return dates
        if not params['outbound_date'] and hotel_params.get('check_in'):
            params['outbound_date'] = hotel_params.get('check_in')
            
        if hotel_params.get('check_out'):
            params['return_date'] = hotel_params.get('check_out')
            
        # Set package type based on return date
        params['package_type'] = 'round_trip' if params.get('return_date') else 'one_way'
        
        # Extract number of travelers
        travelers_match = re.search(r'(\d+)\s+(?:adult|person|people|traveler)', request.lower())
        if travelers_match:
            params['adults'] = int(travelers_match.group(1))
            
        children_match = re.search(r'(\d+)\s+(?:child|children|kid|kids)', request.lower())
        if children_match:
            params['children'] = int(children_match.group(1))
            
        # Extract budget constraints
        budget_match = re.search(r'(?:under|less than|budget|max|maximum)\s+\$?(\d+)', request.lower())
        if budget_match:
            params['max_price'] = int(budget_match.group(1))
            
        # Extract hotel quality preferences
        for rating in range(5, 0, -1):
            if f"{rating} star" in request.lower() or f"{rating}-star" in request.lower():
                params['hotel_rating'] = rating
                break
                
        return params
        
    def _get_mock_package_results(self, params):
        """
        Generate mock travel package results based on the parameters.
        
        Args:
            params (dict): The package search parameters
            
        Returns:
            list: Mock package results
        """
        # Generate 3-5 package options
        num_packages = random.randint(3, 5)
        packages = []
        
        for i in range(num_packages):
            # Generate a flight for this package
            flight = {
                'airline': random.choice([
                    'Saudi Airlines', 'Emirates', 'Qatar Airways', 'Etihad Airways', 
                    'Turkish Airlines', 'Gulf Air', 'Flynas', 'Flyadeal'
                ]),
                'flight_number': f"{''.join(random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ') for _ in range(2))}{random.randint(100, 999)}",
                'departure_airport': params['departure'],
                'arrival_airport': params['destination'],
                'departure_time': f"{random.randint(0, 23):02d}:{random.choice(['00', '15', '30', '45'])}",
                'arrival_time': f"{random.randint(0, 23):02d}:{random.choice(['00', '15', '30', '45'])}",
                'duration': f"{random.randint(1, 8)}h {random.randint(0, 55)}m",
                'class': random.choice(['Economy', 'Economy Plus', 'Business', 'First']),
                'stopover': random.choice([None, '1 stop in Dubai', '1 stop in Istanbul', '1 stop in Doha'])
            }
            
            # Generate a hotel for this package
            hotel = {
                'name': random.choice([
                    'Grand Hyatt', 'Marriott Hotel', 'Four Seasons', 'The Ritz-Carlton', 
                    'Hilton Hotel', 'Shangri-La', 'Radisson Blu', 'Intercontinental', 
                    'Holiday Inn', 'Crowne Plaza', 'Mövenpick', 'Novotel'
                ]),
                'rating': min(5, max(1, params['hotel_rating'] + random.choice([-1, 0, 0, 1]))),
                'location': next((city for city, code in self.hotels_agent.city_codes.items() 
                                if code == params['destination']), 'City Center'),
                'amenities': random.sample(self.hotels_agent.amenities, k=random.randint(3, 6)),
                'room_type': random.choice(['Standard', 'Deluxe', 'Suite', 'Executive', 'Family']),
                'board_type': random.choice(['Room Only', 'Breakfast Included', 'Half Board', 'Full Board', 'All Inclusive'])
            }
            
            # Calculate package price (flight + hotel + some random factor)
            base_price = 300 + (hotel['rating'] * 100) + (300 if flight['class'] != 'Economy' else 0)
            if params.get('package_type') == 'round_trip':
                base_price *= 1.8  # Round trips are more expensive
                
            # Add some randomness
            price_variation = random.uniform(0.85, 1.15)
            total_price = round(base_price * price_variation * params['adults'] + 
                              (base_price * 0.7 * price_variation * params['children']))
            
            # Cap at max price if specified
            if params.get('max_price') and total_price > params['max_price']:
                continue
                
            # Calculate savings
            original_price = round(total_price * random.uniform(1.15, 1.3))
            savings = original_price - total_price
            savings_percent = round((savings / original_price) * 100)
            
            # Create the package object
            package = {
                'id': f"PKG-{random.randint(10000, 99999)}",
                'name': f"{flight['airline']} {hotel['name']} {params['destination']} Package",
                'flight': flight,
                'hotel': hotel,
                'price': total_price,
                'original_price': original_price,
                'savings': savings,
                'savings_percent': savings_percent,
                'nights': random.randint(3, 7),
                'package_type': params.get('package_type', 'round_trip'),
                'outbound_date': params.get('outbound_date')
            }
            
            packages.append(package)
            
        # Sort packages by price
        packages.sort(key=lambda x: x['price'])
        
        return packages
