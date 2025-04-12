"""
Apply debugging decorators to Rahalah agent classes.

This script applies performance monitoring and logging decorators to all agent classes,
making it easier to debug and trace the agent system's behavior.
"""

import importlib
import inspect
import os
import sys
from types import FunctionType, ModuleType
from typing import Any, Dict, List, Set, Tuple, Type

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.debug import (
    performance_timer, 
    log_function_call, 
    trace_exception,
    logger
)

# Agent classes and methods to apply decorators to
AGENT_MODULES = [
    "agents.base_agent",
    "agents.master_agent",
    "agents.flights_agent",
    "agents.hotels_agent",
    "agents.general_agent",
    "agents.package_agent",
]

# Methods to apply performance monitoring to
PERFORMANCE_METHODS = {
    "process_request", 
    "can_handle", 
    "_analyze_request",
    "_extract_flight_params",
    "_extract_hotel_params",
    "_extract_package_params",
    "_get_mock_flight_results",
    "_get_mock_hotel_results",
    "_get_mock_package_results",
    "_consolidate_responses",
}

# Methods to log function calls for
LOG_METHODS = {
    "process_request",
    "can_handle",
    "register_agent",
}

# Methods to apply exception tracing to
EXCEPTION_TRACE_METHODS = {
    "process_request", 
    "_analyze_request",
    "_collect_agent_responses",
    "_consolidate_responses",
}

def import_module(module_name: str) -> ModuleType:
    """Import a module by name."""
    try:
        return importlib.import_module(module_name)
    except ImportError as e:
        logger.error(f"Failed to import module {module_name}: {e}")
        return None

def get_agent_classes(module: ModuleType) -> List[Tuple[str, Type]]:
    """Get all agent classes from a module."""
    if not module:
        return []
        
    agent_classes = []
    for name, obj in inspect.getmembers(module):
        if (inspect.isclass(obj) and 
            hasattr(obj, "__module__") and 
            obj.__module__ == module.__name__ and
            (name.endswith("Agent") or name == "BaseAgent")):
            agent_classes.append((name, obj))
            
    return agent_classes

def apply_decorators_to_method(
    cls: Type, 
    method_name: str,
    method_sets: List[Tuple[Set[str], Any]]
) -> bool:
    """Apply decorators to a specific method if it exists in the class."""
    if not hasattr(cls, method_name):
        return False
        
    method = getattr(cls, method_name)
    if not isinstance(method, FunctionType):
        return False
        
    # Track if any decorators were applied
    applied = False
    
    # Apply decorators based on method sets
    for method_set, decorator in method_sets:
        if method_name in method_set:
            # Avoid applying decorator if already applied
            if hasattr(method, "__decorated_with__") and decorator.__name__ in method.__decorated_with__:
                continue
                
            # Apply decorator
            decorated_method = decorator(method)
            
            # Track which decorators have been applied
            if not hasattr(decorated_method, "__decorated_with__"):
                decorated_method.__decorated_with__ = set()
            decorated_method.__decorated_with__.add(decorator.__name__)
            
            # Set the decorated method back on the class
            setattr(cls, method_name, decorated_method)
            applied = True
            logger.debug(f"Applied {decorator.__name__} to {cls.__name__}.{method_name}")
            
    return applied

def apply_debugging_to_agents():
    """Apply all debugging decorators to agent classes."""
    logger.info("Applying debugging decorators to agent classes...")
    
    # Use list of tuples instead of dict with sets as keys
    method_sets = [
        (PERFORMANCE_METHODS, performance_timer),
        (LOG_METHODS, log_function_call()),
        (EXCEPTION_TRACE_METHODS, trace_exception())
    ]
    
    # Track stats
    stats = {
        "modules_processed": 0,
        "classes_processed": 0,
        "methods_decorated": 0,
        "modules_failed": 0
    }
    
    # Process each agent module
    for module_name in AGENT_MODULES:
        module = import_module(module_name)
        if not module:
            stats["modules_failed"] += 1
            continue
            
        agent_classes = get_agent_classes(module)
        stats["modules_processed"] += 1
        
        # Apply decorators to each agent class
        for class_name, cls in agent_classes:
            logger.info(f"Processing class: {class_name}")
            stats["classes_processed"] += 1
            
            # Get all methods in the class
            for name, obj in inspect.getmembers(cls):
                if isinstance(obj, FunctionType) and not name.startswith("__"):
                    if apply_decorators_to_method(cls, name, method_sets):
                        stats["methods_decorated"] += 1
    
    # Log results
    logger.info(f"Debugging decorators applied to {stats['methods_decorated']} methods " +
               f"in {stats['classes_processed']} classes across {stats['modules_processed']} modules.")
    
    if stats["modules_failed"] > 0:
        logger.warning(f"Failed to process {stats['modules_failed']} modules.")
        
    return stats

if __name__ == "__main__":
    apply_debugging_to_agents()
    print("Debugging decorators applied to all agent classes. Restart the server for changes to take effect.")
