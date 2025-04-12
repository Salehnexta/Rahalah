from flask import Flask, jsonify, request, render_template, url_for, send_from_directory
import os
import requests
from dotenv import load_dotenv
import json
import logging
import traceback
import time
from agents.agent_factory import AgentFactory
from datetime import datetime
from utils.debug import DebugConfig, performance_timer, capture_request, capture_response, log_agent_selection, logger as debug_logger

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_url_path='/static', static_folder='static')

# Disable template caching
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.jinja_env.auto_reload = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# Get API key from environment
API_KEY = os.getenv('SEARCHAPI_IO_KEY')

# Initialize the agent system
master_agent = AgentFactory.create_agent_system()

# Directory to save search results
SEARCH_RESULTS_DIR = 'search_results'
if not os.path.exists(SEARCH_RESULTS_DIR):
    os.makedirs(SEARCH_RESULTS_DIR)

PORT = 8090

@app.route('/')
def index():
    return render_template('chat.html')

@app.route('/process_message', methods=['POST'])
@capture_request
@capture_response
@performance_timer
def process_message():
    """Process a chat message through the agent system."""
    try:
        request_start_time = time.time()
        if not request.is_json:
            logger.error("Request is not JSON")
            return jsonify({'error': 'Request must be JSON'}), 400
            
        data = request.get_json()
        logger.info(f"Received data: {data}")
        
        user_message = data.get('message', '')
        
        if not user_message:
            logger.error("No message provided")
            return jsonify({'error': 'Message is required'}), 400
        
        # Process the message through the master agent
        logger.info(f"Processing message: {user_message}")
        
        # Get agent scores for debugging
        agent_scores = master_agent._analyze_request(user_message)
        logger.info(f"Agent scores: {agent_scores}")
        
        # Log agent selection for debugging
        top_agent = max(agent_scores.items(), key=lambda x: x[1])[0] if agent_scores else None
        log_agent_selection(agent_scores, top_agent)
        
        # Process the request
        process_start_time = time.time()
        response = master_agent.process_request(user_message)
        process_duration = time.time() - process_start_time
        debug_logger.debug(f"Request processing completed in {process_duration:.4f}s")
        
        # Extract the flight, hotel, or package results based on response type
        flight_results = []
        hotel_results = []
        package_results = []
        
        if response.get('type') == 'flights' and 'results' in response:
            flight_results = response['results']
            logger.info(f"Found {len(flight_results)} flight results")
        elif response.get('type') == 'hotels' and 'results' in response:
            hotel_results = response['results']
            logger.info(f"Found {len(hotel_results)} hotel results")
        elif response.get('type') == 'packages' and 'results' in response:
            package_results = response['results']
            logger.info(f"Found {len(package_results)} package results")
        
        logger.info(f"Response type: {response.get('type', 'text')}")
        logger.info(f"Has flight results: {bool(flight_results)}")
        logger.info(f"Has hotel results: {bool(hotel_results)}")
        logger.info(f"Has package results: {bool(package_results)}")
        
        # Return the agent's response
        return jsonify({
            'response': response.get('content', 'Sorry, I could not process your request'),
            'type': response.get('type', 'text'),
            'flight_results': flight_results,
            'hotel_results': hotel_results,
            'package_results': package_results
        })
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        return jsonify({'error': f'Error processing message: {str(e)}'}), 500

@app.route('/api/search/flights', methods=['GET'])
def search_flights():
    try:
        # Get parameters from request
        departure_id = request.args.get('departure_id', '')
        arrival_id = request.args.get('arrival_id', '')
        outbound_date = request.args.get('outbound_date')
        flight_type = request.args.get('flight_type', 'one_way')
        
        # Validate required parameters
        if not all([departure_id, arrival_id]):
            return jsonify({
                'error': 'Missing required parameters: departure_id and arrival_id are required'
            }), 400

        # If no date specified, search for cheapest flights in the range
        if not outbound_date:
            from datetime import datetime, timedelta
            current_date = datetime.now()
            start_date = current_date + timedelta(days=60)  # Two months from now
            end_date = start_date + timedelta(days=7)  # Search for a week
            outbound_date = start_date.strftime('%Y-%m-%d')
            date_range = f"{start_date.strftime('%Y-%m-%d')}:{end_date.strftime('%Y-%m-%d')}"

        # Get standardized search parameters
        params = {
            'engine': 'google_flights',
            'departure_id': departure_id,
            'arrival_id': arrival_id,
            'flight_type': flight_type,
            'api_key': API_KEY,
            'sort_by': 'price',
            'currency': 'USD',
            'adults': 1,
            'travel_class': 'economy',
            'max_price': 1000
        }

        # Add date range to params if we calculated it
        if 'date_range' in locals():
            params['date_range'] = date_range

        # Make API request
        response = requests.get(
            'https://www.searchapi.io/api/v1/search',
            params=params,
            headers={'Accept': 'application/json'}
        )

        if response.status_code == 200:
            data = response.json()
            
            # Process results
            if 'best_flights' in data:
                for flight in data['best_flights']:
                    if 'booking_token' in flight:
                        flight['booking_url'] = f"https://www.searchapi.io/api/v1/searches/{data['search_metadata']['id']}?token={flight['booking_token']}"
            
            return jsonify(data)
        else:
            return jsonify({
                'error': f'API request failed with status {response.status_code}',
                'details': response.text
            }), response.status_code

    except Exception as e:
        return jsonify({
            'error': f'An error occurred: {str(e)}'
        }), 500

# Enable debug routes if debug mode is enabled
if os.environ.get('RAHALAH_DEBUG', 'false').lower() in ('true', '1', 'yes'):
    @app.route('/debug/config', methods=['GET', 'POST'])
    def debug_config():
        """View and update debug configuration."""
        # Get only serializable configuration values
        config_dict = {
            'enabled': DebugConfig.enabled,
            'log_level': DebugConfig.log_level,
            'trace_requests': DebugConfig.trace_requests,
            'performance_monitoring': DebugConfig.performance_monitoring,
            'log_agent_selection': DebugConfig.log_agent_selection,
            'log_agent_confidence': DebugConfig.log_agent_confidence,
            'log_to_console': DebugConfig.log_to_console,
            'log_to_file': DebugConfig.log_to_file,
            'max_log_files': DebugConfig.max_log_files,
            'enable_request_capture': DebugConfig.enable_request_capture,
            'enable_response_capture': DebugConfig.enable_response_capture
        }
        
        if request.method == 'POST' and request.is_json:
            config_updates = request.get_json()
            DebugConfig.configure(**config_updates)
            return jsonify({
                'status': 'success',
                'message': 'Debug configuration updated',
                'config': config_dict
            })
        
        return jsonify({
            'status': 'success',
            'config': config_dict
        })
    
    @app.route('/debug/logs', methods=['GET'])
    def debug_logs():
        """View recent debug logs."""
        debug_dir = os.path.join(os.path.dirname(__file__), 'debug_logs')
        if not os.path.exists(debug_dir):
            return jsonify({'error': 'Debug logs directory not found'}), 404
            
        log_files = [f for f in os.listdir(debug_dir) if f.endswith('.log')]
        log_files.sort(key=lambda f: os.path.getmtime(os.path.join(debug_dir, f)), reverse=True)
        
        logs = []
        for log_file in log_files[:5]:  # Show only 5 most recent logs
            file_path = os.path.join(debug_dir, log_file)
            file_size = os.path.getsize(file_path)
            logs.append({
                'filename': log_file,
                'size': file_size,
                'created': datetime.fromtimestamp(os.path.getctime(file_path)).isoformat(),
                'url': url_for('debug_log_content', filename=log_file)
            })
            
        return jsonify({
            'status': 'success',
            'logs': logs
        })
    
    @app.route('/debug/logs/<filename>', methods=['GET'])
    def debug_log_content(filename):
        """View content of a specific log file."""
        debug_dir = os.path.join(os.path.dirname(__file__), 'debug_logs')
        return send_from_directory(debug_dir, filename)

if __name__ == '__main__':
    # Log system startup
    debug_logger.info(f"Rahalah server starting with debugging enabled at {datetime.now().isoformat()}")
    print(f"Rahalah server started at http://localhost:{PORT}")
    app.run(port=PORT, debug=True)
