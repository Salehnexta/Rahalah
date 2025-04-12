from .base_agent import BaseAgent
import re
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("MasterAgent")

class MasterAgent(BaseAgent):
    """
    Master Agent responsible for coordinating the conversation flow 
    and delegating tasks to specialized agents.
    """
    
    def __init__(self):
        super().__init__(name="Master")
        self.specialized_agents = {}
        self.conversation_history = []
        self.user_preferences = {}
        
    def register_agent(self, agent_id, agent):
        """Register a specialized agent with the master agent."""
        logger.info(f"Registering agent: {agent_id} ({agent.name})")
        self.specialized_agents[agent_id] = agent
        
    def process_request(self, request, context=None):
        """
        Process a user request by routing to appropriate agents and 
        ensuring a coherent response.
        
        Args:
            request (str): The user's request text
            context (dict, optional): Additional context information
            
        Returns:
            dict: The consolidated response
        """
        try:
            # Update context and history
            if context:
                self.context.update(context)
            
            # Add request to conversation history
            self.conversation_history.append({"role": "user", "content": request})
            
            # Analyze request and determine which agents to invoke
            agent_scores = self._analyze_request(request)
            logger.info(f"Agent scores for request: {agent_scores}")
            
            # Get responses from appropriate agents
            responses = self._collect_agent_responses(request, agent_scores)
            
            # Check if we got any valid responses
            if not responses:
                logger.warning("No agent was able to provide a response")
                apology_response = {
                    "content": "I apologize, but I couldn't find a suitable response to your query. Could you please rephrase or provide more details about what you're looking for?",
                    "type": "text"
                }
                self.conversation_history.append({"role": "assistant", "content": apology_response["content"]})
                return apology_response
            
            # Consolidate and validate responses
            final_response = self._consolidate_responses(responses)
            
            # Add response to conversation history
            self.conversation_history.append({"role": "assistant", "content": final_response["content"]})
            
            return final_response
            
        except Exception as e:
            # Log the error
            logger.error(f"Error processing request: {str(e)}")
            
            # Create an apology response
            apology_response = {
                "content": f"I apologize, but I encountered an issue while processing your request. Please try again or rephrase your question. Error: {str(e)}",
                "type": "text"
            }
            
            # Still add to history so we maintain context
            self.conversation_history.append({"role": "assistant", "content": apology_response["content"]})
            
            return apology_response
    
    def _analyze_request(self, request):
        """
        Analyze the request to determine which specialized agents should handle it.
        
        Returns:
            dict: Mapping of agent_id to confidence score (0.0 to 1.0)
        """
        agent_scores = {}
        
        # Have each agent evaluate if it can handle this request
        for agent_id, agent in self.specialized_agents.items():
            confidence = agent.can_handle(request)
            if confidence > 0.0:
                agent_scores[agent_id] = confidence
        
        # If no agent can handle it, use default handling
        if not agent_scores:
            agent_scores["general"] = 1.0
            
        return agent_scores
    
    def _collect_agent_responses(self, request, agent_scores):
        """
        Collect responses from appropriate agents based on confidence scores.
        
        Args:
            request (str): The user's request
            agent_scores (dict): Mapping of agent_id to confidence score
            
        Returns:
            list: Responses from individual agents
        """
        responses = []
        
        # Sort agents by confidence score
        sorted_agents = sorted(agent_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Get response from the top agent(s)
        threshold = 0.5  # Only consider agents with confidence > 0.5
        
        for agent_id, score in sorted_agents:
            if score < threshold:
                continue
                
            if agent_id in self.specialized_agents:
                agent = self.specialized_agents[agent_id]
                response = agent.process_request(request, self.context)
                responses.append({
                    "agent_id": agent_id,
                    "confidence": score,
                    "response": response
                })
        
        # If we have no responses, provide a fallback with an apology
        if not responses:
            responses.append({
                "agent_id": "fallback",
                "confidence": 1.0,
                "response": {
                    "content": "I apologize, but I'm not sure how to help with that specific request. Could you please provide more details about what you're looking for, or try a different query?",
                    "type": "text"
                }
            })
            
        return responses
    
    def _consolidate_responses(self, responses):
        """
        Consolidate multiple agent responses into a coherent final response.
        
        Args:
            responses (list): List of agent responses
            
        Returns:
            dict: Consolidated response
        """
        # If only one response, use it directly
        if len(responses) == 1:
            return responses[0]["response"]
        
        # If multiple responses, combine them
        consolidated_content = ""
        flight_results = []
        hotel_results = []
        
        for resp in responses:
            agent_id = resp["agent_id"]
            agent_response = resp["response"]
            
            # Extract results from different agents
            if agent_id == "flights" and "results" in agent_response:
                flight_results.extend(agent_response["results"])
            elif agent_id == "hotels" and "results" in agent_response:
                hotel_results.extend(agent_response["results"])
            
            # Add agent's content to the consolidated response
            if "content" in agent_response:
                if consolidated_content:
                    consolidated_content += "\n\n"
                consolidated_content += agent_response["content"]
        
        # Create the final consolidated response
        final_response = {
            "content": consolidated_content,
            "type": "text"
        }
        
        # Add any results
        if flight_results:
            final_response["flight_results"] = flight_results
        if hotel_results:
            final_response["hotel_results"] = hotel_results
            
        return final_response
    
    def extract_user_preferences(self, request):
        """Extract and update user preferences from the request."""
        # Extract location preferences
        locations = re.findall(r'(?:from|to)\s+([A-Za-z\s]+)', request)
        if locations:
            self.user_preferences["locations"] = locations
            
        # Extract date preferences
        date_match = re.search(r'(?:on|in|around|during)\s+([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*-\s*\d{1,2}(?:st|nd|rd|th)?)?)', request)
        if date_match:
            self.user_preferences["dates"] = date_match.group(1)
            
        # Extract price preferences
        price_match = re.search(r'(?:under|below|around|about)\s+\$?(\d+)', request)
        if price_match:
            self.user_preferences["max_price"] = int(price_match.group(1))
            
        return self.user_preferences
