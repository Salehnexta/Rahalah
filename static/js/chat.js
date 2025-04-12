document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const messagesContainer = document.getElementById('messages-container');
    const newChatButton = document.getElementById('new-chat-btn');
    
    // Add welcome message
    addSystemMessage("Hello! I am your Rahalah travel assistant. How can I help you plan your journey today?");
    
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (message) {
            sendMessage(message);
            messageInput.value = '';
        }
    });
    
    newChatButton.addEventListener('click', function() {
        // Clear chat history
        messagesContainer.innerHTML = '';
        // Add welcome message again
        addSystemMessage("Hello! I am your Rahalah travel assistant. How can I help you plan your journey today?");
    });
    
    function sendMessage(message) {
        // Add user message to chat
        addUserMessage(message);
        
        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message system-message';
        loadingDiv.innerHTML = `
            <div class="message-content">
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(loadingDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Send message to the server
        fetch('/process_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Remove loading indicator
            messagesContainer.removeChild(loadingDiv);
            
            // Add the agent's response
            addSystemMessage(data.response);
            
            // If there are flight results, display them
            if (data.flight_results && data.flight_results.length > 0) {
                displayFlightOptions(data.flight_results);
            }
            
            // If there are hotel results, display them
            if (data.hotel_results && data.hotel_results.length > 0) {
                displayHotelOptions(data.hotel_results);
            }
            
            // If there are package results, display them
            if (data.package_results && data.package_results.length > 0) {
                displayPackageOptions(data.package_results);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            messagesContainer.removeChild(loadingDiv);
            addSystemMessage("Sorry, there was an error processing your request. Please try again.");
        });
    }
    
    function addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function addSystemMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function formatFlightOption(flight) {
        return `
            <div class="flight-option">
                <div class="flight-header">
                    <span class="flight-route">${flight.from} → ${flight.to}</span>
                    <span class="flight-price">$${flight.price}</span>
                </div>
                <div class="flight-details">
                    <span class="flight-time">${flight.departure}</span>
                    <span class="flight-duration">${flight.duration}</span>
                    <span class="flight-airline">${flight.airline}</span>
                </div>
                <button class="flight-book">Book Now</button>
            </div>
        `;
    }
    
    function formatHotelOption(hotel) {
        return `
            <div class="hotel-option">
                <div class="hotel-header">
                    <span class="hotel-name">${hotel.name}</span>
                    <span class="hotel-price">$${hotel.price}/night</span>
                </div>
                <div class="hotel-details">
                    <span class="hotel-location">${hotel.location}</span>
                    <span class="hotel-rating">★ ${hotel.rating} (${hotel.reviews} reviews)</span>
                </div>
                <div class="hotel-amenities">
                    ${hotel.amenities.slice(0, 3).map(amenity => `<span class="amenity">${amenity}</span>`).join('')}
                </div>
                <button class="hotel-book">Book Now</button>
            </div>
        `;
    }
    
    function displayFlightOptions(flights) {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'flight-options-container';
        
        let html = '';
        flights.forEach(flight => {
            html += formatFlightOption(flight);
        });
        
        optionsDiv.innerHTML = html;
        messagesContainer.appendChild(optionsDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function displayHotelOptions(hotels) {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'hotel-options-container';
        
        let html = '';
        hotels.forEach(hotel => {
            html += formatHotelOption(hotel);
        });
        
        optionsDiv.innerHTML = html;
        messagesContainer.appendChild(optionsDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function formatPackageOption(package) {
        // Format airline and flight details
        const flight = package.flight;
        const hotel = package.hotel;
        
        // Calculate savings display
        const savingsDisplay = package.savings_percent ? 
            `<span class="package-savings">Save ${package.savings_percent}%</span>` : '';
        
        // Create best value badge for the first package
        const badgeDisplay = (package.id.endsWith('0') || package.id.endsWith('1')) ? 
            `<div class="package-badge">Best Value</div>` : '';
        
        return `
            <div class="package-option">
                ${badgeDisplay}
                <div class="package-header">
                    <span class="package-name">${package.name}</span>
                    <div class="package-price">
                        <span class="package-current-price">$${package.price}</span>
                        <span class="package-original-price">$${package.original_price}</span>
                        ${savingsDisplay}
                    </div>
                </div>
                
                <div class="package-components">
                    <div class="package-flight">
                        <div class="component-header">
                            <i class="fas fa-plane"></i> Flight
                        </div>
                        <div class="package-details">
                            <div class="package-detail-item">
                                <div class="detail-label">Airline</div>
                                <div class="detail-value">${flight.airline}</div>
                            </div>
                            <div class="package-detail-item">
                                <div class="detail-label">Route</div>
                                <div class="detail-value">${flight.departure_airport} → ${flight.arrival_airport}</div>
                            </div>
                            <div class="package-detail-item">
                                <div class="detail-label">Departure</div>
                                <div class="detail-value">${flight.departure_time}</div>
                            </div>
                            <div class="package-detail-item">
                                <div class="detail-label">Duration</div>
                                <div class="detail-value">${flight.duration}</div>
                            </div>
                            <div class="package-detail-item">
                                <div class="detail-label">Class</div>
                                <div class="detail-value">${flight.class}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="package-hotel">
                        <div class="component-header">
                            <i class="fas fa-hotel"></i> Hotel
                        </div>
                        <div class="package-details">
                            <div class="package-detail-item">
                                <div class="detail-label">Hotel</div>
                                <div class="detail-value">${hotel.name}</div>
                            </div>
                            <div class="package-detail-item">
                                <div class="detail-label">Location</div>
                                <div class="detail-value">${hotel.location}</div>
                            </div>
                            <div class="package-detail-item">
                                <div class="detail-label">Rating</div>
                                <div class="detail-value">${'★'.repeat(hotel.rating)}</div>
                            </div>
                            <div class="package-detail-item">
                                <div class="detail-label">Room</div>
                                <div class="detail-value">${hotel.room_type}</div>
                            </div>
                            <div class="package-detail-item">
                                <div class="detail-label">Stay</div>
                                <div class="detail-value">${package.nights} nights</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="package-cta">
                    <button class="view-details-btn">View Details</button>
                    <button class="book-package-btn">Book Package</button>
                </div>
            </div>
        `;
    }
    
    function displayPackageOptions(packages) {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'package-options-container';
        
        let html = '';
        packages.forEach(package => {
            html += formatPackageOption(package);
        });
        
        optionsDiv.innerHTML = html;
        messagesContainer.appendChild(optionsDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});
