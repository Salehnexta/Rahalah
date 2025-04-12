"""
Debug utility for Rahalah travel assistant application.

This module provides comprehensive debugging tools for the Rahalah application,
including configurable logging, performance monitoring, and request tracing.
"""

import logging
import time
import functools
import json
import os
import sys
import traceback
import inspect
from typing import Any, Callable, Dict, List, Optional, Union, TypeVar, cast
from datetime import datetime

# Create debug logs directory if it doesn't exist
DEBUG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'debug_logs')
os.makedirs(DEBUG_DIR, exist_ok=True)

# Configure default logger
logger = logging.getLogger('rahalah.debug')
logger.setLevel(logging.DEBUG)

# Configure console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_format = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
console_handler.setFormatter(console_format)
logger.addHandler(console_handler)

# Configure file handler for detailed logs
log_file = os.path.join(DEBUG_DIR, f'rahalah_debug_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
file_handler = logging.FileHandler(log_file)
file_handler.setLevel(logging.DEBUG)
file_format = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
file_handler.setFormatter(file_format)
logger.addHandler(file_handler)

# Type variable for function return types
F = TypeVar('F', bound=Callable[..., Any])

class DebugConfig:
    """Configuration for the debug system."""
    
    # Default configuration
    enabled: bool = True
    log_level: int = logging.INFO
    trace_requests: bool = True
    performance_monitoring: bool = True
    log_agent_selection: bool = True
    log_agent_confidence: bool = True
    log_to_console: bool = True
    log_to_file: bool = True
    max_log_files: int = 10
    enable_request_capture: bool = True
    enable_response_capture: bool = True
    
    @classmethod
    def configure(cls, **kwargs: Any) -> None:
        """Configure debug options."""
        for key, value in kwargs.items():
            if hasattr(cls, key):
                setattr(cls, key, value)
                logger.info(f"Debug config: {key} set to {value}")
            else:
                logger.warning(f"Unknown debug config option: {key}")

    @classmethod
    def set_log_level(cls, level: Union[int, str]) -> None:
        """Set the log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)."""
        if isinstance(level, str):
            level_map = {
                'DEBUG': logging.DEBUG,
                'INFO': logging.INFO,
                'WARNING': logging.WARNING,
                'ERROR': logging.ERROR,
                'CRITICAL': logging.CRITICAL
            }
            level_int = level_map.get(level.upper(), logging.INFO)
        else:
            level_int = level
            
        cls.log_level = level_int
        logger.setLevel(level_int)
        logger.info(f"Log level set to {level}")

def performance_timer(func: F) -> F:
    """
    Decorator to measure and log execution time of functions.
    
    Args:
        func: The function to measure
        
    Returns:
        The wrapped function
    """
    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        if not DebugConfig.enabled or not DebugConfig.performance_monitoring:
            return func(*args, **kwargs)
            
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        
        execution_time = end_time - start_time
        logger.debug(f"Performance: {func.__module__}.{func.__qualname__} "
                    f"executed in {execution_time:.4f} seconds")
        
        # For very slow operations, log at a higher level
        if execution_time > 1.0:
            logger.info(f"Slow operation detected: {func.__module__}.{func.__qualname__} "
                       f"took {execution_time:.4f} seconds")
        
        return result
    
    return cast(F, wrapper)

def log_function_call(level: int = logging.DEBUG) -> Callable[[F], F]:
    """
    Decorator to log function calls with arguments and return values.
    
    Args:
        level: The logging level to use
        
    Returns:
        Decorator function
    """
    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            if not DebugConfig.enabled:
                return func(*args, **kwargs)
                
            func_name = f"{func.__module__}.{func.__qualname__}"
            
            # Get calling frame info
            frame = inspect.currentframe()
            if frame and frame.f_back:
                caller = f"{frame.f_back.f_code.co_filename}:{frame.f_back.f_lineno}"
            else:
                caller = "unknown"
            
            # Log call
            arg_str = ', '.join([repr(a) for a in args])
            kwarg_str = ', '.join([f"{k}={repr(v)}" for k, v in kwargs.items()])
            all_args = ', '.join(filter(None, [arg_str, kwarg_str]))
            
            logger.log(level, f"CALL {func_name}({all_args}) from {caller}")
            
            try:
                result = func(*args, **kwargs)
                
                # Log result (truncate if too large)
                result_repr = repr(result)
                if len(result_repr) > 1000:
                    result_repr = result_repr[:1000] + "..."
                    
                logger.log(level, f"RETURN from {func_name}: {result_repr}")
                return result
            except Exception as e:
                logger.error(f"EXCEPTION in {func_name}: {str(e)}")
                logger.debug(f"Traceback: {traceback.format_exc()}")
                raise
                
        return cast(F, wrapper)
    
    return decorator

def capture_request(func: F) -> F:
    """
    Decorator to capture and log API requests.
    
    Args:
        func: Function to decorate, typically an API request handler
        
    Returns:
        Wrapped function
    """
    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        if not DebugConfig.enabled or not DebugConfig.enable_request_capture:
            return func(*args, **kwargs)
            
        # Try to capture the request object
        request_obj = None
        request_data = {}
        
        # Typically for Flask route handlers, request is in flask.request
        for arg in args:
            if hasattr(arg, 'get_json') and callable(getattr(arg, 'get_json')):
                request_obj = arg
                break
                
        if not request_obj:
            # Look for Flask request in the global context
            try:
                from flask import request as flask_request
                request_obj = flask_request
            except (ImportError, RuntimeError):
                pass
                
        # Extract request data
        if request_obj:
            try:
                # Method, path, headers
                request_data['method'] = getattr(request_obj, 'method', 'UNKNOWN')
                request_data['path'] = getattr(request_obj, 'path', 'UNKNOWN')
                
                # Headers (excluding auth headers)
                if hasattr(request_obj, 'headers'):
                    headers = dict(request_obj.headers)
                    for sensitive in ('authorization', 'cookie', 'x-api-key'):
                        if sensitive in headers:
                            headers[sensitive] = '[REDACTED]'
                    request_data['headers'] = headers
                
                # Request body
                if hasattr(request_obj, 'get_json') and callable(getattr(request_obj, 'get_json')):
                    try:
                        body = request_obj.get_json(silent=True)
                        if body:
                            request_data['body'] = body
                    except Exception:
                        pass
                
                # Query params
                if hasattr(request_obj, 'args') and request_obj.args:
                    request_data['query_params'] = dict(request_obj.args)
            except Exception as e:
                logger.warning(f"Error capturing request data: {str(e)}")
        
        # Log the request
        if request_data:
            logger.debug(f"API Request: {json.dumps(request_data, default=str)}")
        
        # Execute the original function
        return func(*args, **kwargs)
    
    return cast(F, wrapper)

def capture_response(func: F) -> F:
    """
    Decorator to capture and log API responses.
    
    Args:
        func: Function to decorate, typically an API response handler
        
    Returns:
        Wrapped function
    """
    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        if not DebugConfig.enabled or not DebugConfig.enable_response_capture:
            return func(*args, **kwargs)
            
        # Execute the original function
        start_time = time.time()
        result = func(*args, **kwargs)
        execution_time = time.time() - start_time
        
        # Log the response
        try:
            response_data = {
                'execution_time': f"{execution_time:.4f}s",
                'func': f"{func.__module__}.{func.__qualname__}"
            }
            
            # Handle different response types
            if isinstance(result, dict):
                # Sanitize response to avoid logging sensitive data
                result_copy = result.copy()
                if 'token' in result_copy:
                    result_copy['token'] = '[REDACTED]'
                response_data['body'] = result_copy
            
            logger.debug(f"API Response: {json.dumps(response_data, default=str)}")
        except Exception as e:
            logger.warning(f"Error logging response: {str(e)}")
            
        return result
    
    return cast(F, wrapper)

def trace_exception(exception_type: Any = Exception, handler: Optional[Callable[[Exception], None]] = None) -> Callable[[F], F]:
    """
    Decorator to trace exceptions and optionally handle them.
    
    Args:
        exception_type: Type of exception to catch
        handler: Optional handler function to call with the exception
        
    Returns:
        Decorator function
    """
    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            try:
                return func(*args, **kwargs)
            except exception_type as e:
                logger.error(f"Exception in {func.__module__}.{func.__qualname__}: {str(e)}")
                logger.debug(f"Traceback: {traceback.format_exc()}")
                
                if handler:
                    handler(e)
                    
                raise
                
        return cast(F, wrapper)
    
    return decorator

def log_agent_selection(agent_scores: Dict[str, float], selected_agent: str) -> None:
    """
    Log agent selection decisions with confidence scores.
    
    Args:
        agent_scores: Dictionary of agent IDs to confidence scores
        selected_agent: ID of the selected agent
    """
    if not DebugConfig.enabled or not DebugConfig.log_agent_selection:
        return
        
    logger.info(f"Selected agent: {selected_agent}")
    
    if DebugConfig.log_agent_confidence:
        # Sort agents by confidence score
        sorted_agents = sorted(agent_scores.items(), key=lambda x: x[1], reverse=True)
        scores_str = ', '.join(f"{agent}:{score:.2f}" for agent, score in sorted_agents)
        logger.info(f"Agent confidence scores: {scores_str}")

def format_exception(e: Exception) -> str:
    """
    Format an exception for logging.
    
    Args:
        e: The exception to format
        
    Returns:
        Formatted exception string with traceback
    """
    tb = traceback.format_exception(type(e), e, e.__traceback__)
    return ''.join(tb)

def configure_from_env() -> None:
    """Configure debug settings from environment variables."""
    # Check for DEBUG environment variable
    debug_env = os.environ.get('RAHALAH_DEBUG', 'false').lower()
    if debug_env in ('true', '1', 'yes'):
        DebugConfig.enabled = True
        DebugConfig.log_level = logging.DEBUG
        logger.setLevel(logging.DEBUG)
        console_handler.setLevel(logging.DEBUG)
        logger.info("Debug mode enabled from environment variable")
    
    # Check for LOG_LEVEL environment variable
    log_level_env = os.environ.get('RAHALAH_LOG_LEVEL')
    if log_level_env:
        DebugConfig.set_log_level(log_level_env)

def rotate_log_files() -> None:
    """Rotate log files to keep only the most recent ones."""
    if not os.path.exists(DEBUG_DIR):
        return
        
    log_files = [f for f in os.listdir(DEBUG_DIR) if f.startswith('rahalah_debug_') and f.endswith('.log')]
    if len(log_files) <= DebugConfig.max_log_files:
        return
        
    # Sort log files by creation time (oldest first)
    log_files.sort(key=lambda f: os.path.getmtime(os.path.join(DEBUG_DIR, f)))
    
    # Delete oldest files
    files_to_delete = log_files[:len(log_files) - DebugConfig.max_log_files]
    for file in files_to_delete:
        try:
            os.remove(os.path.join(DEBUG_DIR, file))
            logger.debug(f"Rotated old log file: {file}")
        except Exception as e:
            logger.warning(f"Failed to delete old log file {file}: {str(e)}")

# Initialize debug configuration from environment
configure_from_env()

# Rotate log files on startup
rotate_log_files()

# Log startup information
logger.info(f"Rahalah debug module initialized at {datetime.now().isoformat()}")
logger.debug(f"Python version: {sys.version}")
logger.debug(f"Platform: {sys.platform}")
logger.debug(f"Debug log file: {log_file}")
