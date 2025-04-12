# Rahalah Debugging System Documentation

## Overview

The Rahalah debugging system provides comprehensive tools for monitoring, troubleshooting, and optimizing the Rahalah travel assistant application. It includes performance monitoring, request/response tracking, agent selection logging, and detailed error tracing.

## Features

- **Performance Monitoring**: Track execution time of critical functions
- **Request/Response Capture**: Log API requests and responses
- **Agent Selection Logging**: Monitor agent selection decisions and confidence scores
- **Error Tracing**: Comprehensive exception capture with stacktraces
- **Function Call Logging**: Track function calls with arguments and return values
- **Log Rotation**: Automatically manage log files
- **Debug API Endpoints**: Configure and view logs through HTTP endpoints (when in debug mode)

## Getting Started

### Enabling Debug Mode

Set the `RAHALAH_DEBUG` environment variable to enable debug mode:

```bash
# In .env file or shell
RAHALAH_DEBUG=true
```

You can also set the log level:

```bash
RAHALAH_LOG_LEVEL=DEBUG  # Options: DEBUG, INFO, WARNING, ERROR, CRITICAL
```

### Viewing Debug Logs

When debug mode is enabled, logs are written to the `debug_logs` directory in the project root. The most recent logs are also available through the debug API endpoints.

### Debug API Endpoints

When debug mode is enabled, the following endpoints are available:

- `GET /debug/config` - View current debug configuration
- `POST /debug/config` - Update debug configuration
- `GET /debug/logs` - List available log files
- `GET /debug/logs/<filename>` - View content of a specific log file

## Configuration Options

The `DebugConfig` class in `utils/debug.py` provides the following configuration options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | bool | `True` | Master switch for debugging |
| `log_level` | int | `logging.INFO` | Log level (DEBUG, INFO, etc.) |
| `trace_requests` | bool | `True` | Capture API requests |
| `performance_monitoring` | bool | `True` | Monitor function performance |
| `log_agent_selection` | bool | `True` | Log agent selection decisions |
| `log_agent_confidence` | bool | `True` | Log confidence scores for agents |
| `log_to_console` | bool | `True` | Output logs to console |
| `log_to_file` | bool | `True` | Output logs to file |
| `max_log_files` | int | `10` | Maximum number of log files to keep |
| `enable_request_capture` | bool | `True` | Capture API request details |
| `enable_response_capture` | bool | `True` | Capture API response details |

## Usage

### Decorators

The debug module provides several decorators that can be applied to functions:

#### Performance Monitoring

```python
from utils.debug import performance_timer

@performance_timer
def my_function():
    # Function will be timed and logged
    pass
```

#### Function Call Logging

```python
from utils.debug import log_function_call

@log_function_call(level=logging.DEBUG)
def my_function(arg1, arg2):
    # Arguments and return value will be logged
    return result
```

#### Request/Response Capture

```python
from utils.debug import capture_request, capture_response

@app.route('/my_endpoint', methods=['POST'])
@capture_request
@capture_response
def my_endpoint():
    # Request and response will be captured
    return response
```

#### Exception Tracing

```python
from utils.debug import trace_exception

@trace_exception(exception_type=ValueError)
def my_function():
    # Exceptions will be logged with stacktrace
    raise ValueError("Something went wrong")
```

### Direct Logging

You can also use the debug logger directly:

```python
from utils.debug import logger

def my_function():
    logger.debug("Debug message")
    logger.info("Info message")
    logger.warning("Warning message")
    logger.error("Error message")
```

## Applying Debugging to Agent Classes

The `utils/apply_debugging.py` script applies appropriate decorators to agent classes automatically. Run this script after making changes to agent classes:

```bash
python utils/apply_debugging.py
```

## Updating Debug Configuration

Debug configuration can be updated at runtime through the debug API:

```bash
curl -X POST http://localhost:8090/debug/config \
  -H "Content-Type: application/json" \
  -d '{"log_level": "DEBUG", "performance_monitoring": true}'
```

Or programmatically:

```python
from utils.debug import DebugConfig

DebugConfig.configure(log_level="DEBUG", performance_monitoring=True)
```

## Best Practices

1. **Use Appropriate Log Levels**:
   - `DEBUG`: Detailed information, typically of interest only when diagnosing problems
   - `INFO`: Confirmation that things are working as expected
   - `WARNING`: An indication that something unexpected happened, but the application still works
   - `ERROR`: Due to a more serious problem, the application couldn't perform some function
   - `CRITICAL`: A serious error indicating that the program itself may be unable to continue running

2. **Be Careful with Sensitive Data**:
   - Avoid logging sensitive user information
   - Password and credentials are automatically redacted, but be cautious with other sensitive data

3. **Optimize Performance Monitoring**:
   - Apply performance_timer only to potentially slow or critical functions
   - For very frequently called functions, consider disabling monitoring in production

4. **Log Rotation**:
   - Logs are automatically rotated, keeping only the most recent files
   - Adjust `max_log_files` if you need to retain more log history
