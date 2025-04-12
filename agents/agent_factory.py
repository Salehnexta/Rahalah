import logging
from .master_agent import MasterAgent
from .flights_agent import FlightsAgent
from .hotels_agent import HotelsAgent
from .general_agent import GeneralAgent
from .package_agent import PackageAgent

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("AgentFactory")

class AgentFactory:
    """Factory class for creating and managing agent instances."""
    
    @staticmethod
    def create_agent_system():
        """
        Create and initialize the complete agent system with a master agent
        and all specialized agents.
        
        Returns:
            MasterAgent: The master agent with all specialized agents registered
        """
        logger.info("Creating agent system")
        
        # Create master agent
        master_agent = MasterAgent()
        
        # Create specialized agents
        flights_agent = FlightsAgent()
        hotels_agent = HotelsAgent()
        general_agent = GeneralAgent()
        package_agent = PackageAgent()
        
        # Register specialized agents with the master agent
        master_agent.register_agent("flights", flights_agent)
        master_agent.register_agent("hotels", hotels_agent)
        master_agent.register_agent("general", general_agent)
        master_agent.register_agent("packages", package_agent)
        
        logger.info("Agent system created successfully")
        
        return master_agent
