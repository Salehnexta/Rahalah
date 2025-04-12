class BaseAgent:
    """Base class for all agents in the Rahalah system."""
    
    def __init__(self, name):
        self.name = name
        self.context = {}
    
    def process_request(self, request, context=None):
        """
        Process a user request and return a response.
        
        Args:
            request (str): The user's request text
            context (dict, optional): Additional context information
            
        Returns:
            dict: The agent's response
        """
        if context:
            self.context.update(context)
        
        # This method should be implemented by all subclasses
        raise NotImplementedError("Subclasses must implement process_request")
    
    def can_handle(self, request):
        """
        Determine if this agent can handle the given request.
        
        Args:
            request (str): The user's request text
            
        Returns:
            float: Confidence score between 0.0 and 1.0
        """
        # This method should be implemented by all subclasses
        raise NotImplementedError("Subclasses must implement can_handle")
