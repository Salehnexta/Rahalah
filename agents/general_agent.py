from .base_agent import BaseAgent
import re
import logging
import random

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("GeneralAgent")

class GeneralAgent(BaseAgent):
    """Agent for handling general travel inquiries and conversations."""
    
    def __init__(self):
        super().__init__(name="Travel Assistant")
        
        # Common travel destinations
        self.destinations = [
            "Paris", "London", "New York", "Tokyo", "Dubai", "Istanbul", 
            "Rome", "Bangkok", "Singapore", "Barcelona", "Sydney", "Cairo",
            "Riyadh", "Jeddah", "Dammam", "Madinah", "Makkah"
        ]
        
        # Common travel activities
        self.activities = [
            "sightseeing", "museums", "shopping", "food tours", "beaches",
            "hiking", "cultural experiences", "historical sites", "theme parks",
            "nightlife", "desert safari", "wildlife viewing", "water sports"
        ]
        
        # Greeting responses
        self.greetings = [
            "Hello! How can I help with your travel plans today?",
            "Hi there! I'm your Rahalah travel assistant. Where would you like to travel?",
            "Welcome to Rahalah! I can help you find flights, hotels, and plan your perfect trip.",
            "Greetings! I'm ready to assist with all your travel needs. What can I help you with today?"
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
        
        # General travel-related keywords
        travel_keywords = [
            "travel", "trip", "vacation", "holiday", "journey", "tour",
            "visit", "explore", "destination", "itinerary", "plan"
        ]
        
        # Greeting keywords
        greeting_keywords = [
            "hello", "hi", "hey", "greetings", "good morning", "good afternoon",
            "good evening", "howdy", "what's up", "how are you"
        ]
        
        # Calculate confidence based on keywords
        confidence = 0.0
        
        # Check for greetings (high confidence for handling greetings)
        for keyword in greeting_keywords:
            if keyword in request_lower:
                confidence += 0.7
                break
                
        # Check for travel keywords
        for keyword in travel_keywords:
            if keyword in request_lower:
                confidence += 0.1
                break
                
        # Check for destinations
        for destination in self.destinations:
            if destination.lower() in request_lower:
                confidence += 0.1
                break
                
        # Check for activities
        for activity in self.activities:
            if activity in request_lower:
                confidence += 0.1
                break
        
        # Always provide a minimum confidence for fallback
        confidence = max(confidence, 0.1)
        
        # Cap confidence at 1.0
        return min(confidence, 1.0)
    
    def process_request(self, request, context=None):
        """
        Process a general travel request and return a response.
        
        Args:
            request (str): The user's request text
            context (dict, optional): Additional context information
            
        Returns:
            dict: The agent's response
        """
        if context:
            self.context.update(context)
            
        request_lower = request.lower()
        
        # Check for greetings
        greeting_keywords = ["hello", "hi", "hey", "greetings", "howdy"]
        is_greeting = any(keyword in request_lower for keyword in greeting_keywords)
        
        if is_greeting:
            return {
                "content": random.choice(self.greetings),
                "type": "text"
            }
            
        # Check for destination inquiries
        destination_match = re.search(r'(?:visit|go to|travel to|about)\s+([a-zA-Z\s]+)(?:\.|\?|$)', request_lower)
        if destination_match:
            destination = destination_match.group(1).strip().title()
            return self._get_destination_info(destination)
            
        # Check for activity inquiries
        activity_match = re.search(r'(?:do|activities|things to do)\s+in\s+([a-zA-Z\s]+)(?:\.|\?|$)', request_lower)
        if activity_match:
            location = activity_match.group(1).strip().title()
            return self._get_activity_info(location)
            
        # General travel inquiry
        return {
            "content": "I can help you plan your perfect trip! I can search for flights, find hotels, recommend destinations, and provide travel tips. What specific aspect of your journey can I assist with today?",
            "type": "text"
        }
        
    def _get_destination_info(self, destination):
        """Generate information about a travel destination."""
        # In a real implementation, this would fetch data from a travel API or database
        info = f"**{destination}** is a wonderful travel destination! "
        
        # Generate some placeholder content based on the destination
        if destination in ["Paris", "Rome", "Barcelona"]:
            info += "Known for its stunning architecture, world-class museums, and delicious cuisine. "
            info += "It's perfect for cultural exploration, romantic getaways, and food enthusiasts."
        elif destination in ["Dubai", "Riyadh", "Jeddah"]:
            info += "A blend of modern luxury and rich cultural heritage. "
            info += "You'll find impressive skyscrapers, traditional markets, and excellent shopping opportunities."
        elif destination in ["Bangkok", "Tokyo", "Singapore"]:
            info += "An exciting mix of ancient traditions and cutting-edge modernity. "
            info += "Famous for its vibrant street life, unique cuisine, and friendly locals."
        else:
            info += "A great choice for travelers! It offers a unique blend of experiences for all types of visitors. "
            info += "Would you like me to help you find flights or hotels for your trip there?"
            
        return {
            "content": info,
            "type": "text"
        }
        
    def _get_activity_info(self, location):
        """Generate information about activities at a location."""
        # In a real implementation, this would fetch data from a travel API or database
        
        # Pick some random activities
        selected_activities = random.sample(self.activities, min(5, len(self.activities)))
        
        content = f"Here are some popular things to do in **{location}**:\n\n"
        for i, activity in enumerate(selected_activities, 1):
            content += f"{i}. {activity.title()}\n"
            
        content += "\nWould you like more specific information about any of these activities, or help with finding flights or accommodations for your trip?"
            
        return {
            "content": content,
            "type": "text"
        }
