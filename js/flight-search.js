/**
 * Rahalah Flight Search UI
 * Handles the flight search interface and interaction
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI elements
    const searchForm = document.getElementById('flight-search-form');
    const departureInput = document.getElementById('departure-airport');
    const arrivalInput = document.getElementById('arrival-airport');
    const outboundDate = document.getElementById('outbound-date');
    const returnDate = document.getElementById('return-date');
    const flightType = document.getElementById('flight-type');
    const priceSlider = document.getElementById('price-slider');
    const stopsFilter = document.getElementById('stops-filter');
    const airlinesFilter = document.getElementById('airlines-filter');
    const cabinClass = document.getElementById('cabin-class');
    const timePreferences = document.getElementById('time-preferences');
    const resultsContainer = document.getElementById('flight-results');

    // Initialize price range
    let minPrice = 0;
    let maxPrice = 1000;

    // Initialize date pickers
    if (outboundDate) {
        outboundDate.type = 'date';
        outboundDate.min = new Date().toISOString().split('T')[0];
    }
    if (returnDate) {
        returnDate.type = 'date';
        returnDate.min = outboundDate.value;
    }

    // Update return date minimum when outbound date changes
    outboundDate.addEventListener('change', function() {
        if (returnDate) {
            returnDate.min = this.value;
        }
    });

    // Price range slider initialization
    if (priceSlider) {
        noUiSlider.create(priceSlider, {
            start: [minPrice, maxPrice],
            connect: true,
            range: {
                'min': minPrice,
                'max': maxPrice
            },
            format: {
                to: function(value) {
                    return Math.round(value);
                },
                from: function(value) {
                    return value;
                }
            }
        });

        // Update price display
        priceSlider.noUiSlider.on('update', function(values) {
            document.getElementById('min-price').textContent = `$${values[0]}`;
            document.getElementById('max-price').textContent = `$${values[1]}`;
        });
    }

    // Stops filter initialization
    if (stopsFilter) {
        const stopsOptions = {
            'any': 'Any Stops',
            'non_stop': 'Non-stop',
            'one_stop': '1 Stop',
            'two_stops': '2 Stops'
        };

        // Create stops options
        Object.entries(stopsOptions).forEach(([value, text]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            stopsFilter.appendChild(option);
        });
    }

    // Airlines filter initialization
    if (airlinesFilter) {
        // Add airline selection UI
        const preferredAirlines = document.createElement('div');
        preferredAirlines.className = 'airline-selection';
        preferredAirlines.innerHTML = `
            <label>Preferred Airlines:</label>
            <div class="airline-list">
                <input type="text" placeholder="Search airlines..." id="airline-search">
                <div id="airline-suggestions"></div>
            </div>
            <div class="selected-airlines"></div>
        `;
        airlinesFilter.appendChild(preferredAirlines);

        // Add airline search functionality
        const airlineSearch = document.getElementById('airline-search');
        const suggestions = document.getElementById('airline-suggestions');
        const selectedAirlines = document.querySelector('.selected-airlines');

        if (airlineSearch) {
            // List of common airlines
            const airlines = {
                'EY': 'Etihad Airways',
                'SV': 'Saudi Arabian Airlines',
                'F3': 'Flydubai',
                'XY': 'Air Arabia',
                'KU': 'Kuwait Airways'
            };

            airlineSearch.addEventListener('input', debounce(function() {
                const query = this.value.toLowerCase();
                suggestions.innerHTML = '';

                Object.entries(airlines).forEach(([code, name]) => {
                    if (code.toLowerCase().includes(query) || name.toLowerCase().includes(query)) {
                        const suggestion = document.createElement('div');
                        suggestion.className = 'suggestion';
                        suggestion.dataset.airline = code;
                        suggestion.innerHTML = `
                            <span class="airline-code">${code}</span>
                            <span class="airline-name">${name}</span>
                        `;
                        suggestions.appendChild(suggestion);
                    }
                });

                // Show/hide suggestions container
                suggestions.style.display = suggestions.children.length ? 'block' : 'none';
            }, 300));

            // Handle airline selection
            suggestions.addEventListener('click', function(e) {
                const suggestion = e.target.closest('.suggestion');
                if (suggestion) {
                    const airlineCode = suggestion.dataset.airline;
                    const airlineName = airlines[airlineCode];

                    // Add selected airline
                    const selected = document.createElement('div');
                    selected.className = 'selected-airline';
                    selected.dataset.airline = airlineCode;
                    selected.innerHTML = `
                        <span class="airline-code">${airlineCode}</span>
                        <span class="airline-name">${airlineName}</span>
                        <button class="remove-airline">×</button>
                    `;
                    selectedAirlines.appendChild(selected);

                    // Remove suggestion
                    suggestion.remove();
                    
                    // Reset search input
                    airlineSearch.value = '';
                }
            });

            // Handle removing selected airlines
            selectedAirlines.addEventListener('click', function(e) {
                if (e.target.classList.contains('remove-airline')) {
                    e.target.parentElement.remove();
                }
            });
        }
    }

    // Cabin class selection
    if (cabinClass) {
        const cabinOptions = ['economy', 'business', 'first'];
        cabinOptions.forEach(option => {
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'cabin-class';
            radio.value = option;
            radio.id = `cabin-${option}`;

            const label = document.createElement('label');
            label.htmlFor = `cabin-${option}`;
            label.textContent = option.charAt(0).toUpperCase() + option.slice(1);

            cabinClass.appendChild(radio);
            cabinClass.appendChild(label);
        });
    }

    // Time preferences
    if (timePreferences) {
        const timeOptions = {
            'any': 'Any Time',
            'morning': 'Morning (6:00-12:00)',
            'afternoon': 'Afternoon (12:00-18:00)',
            'evening': 'Evening (18:00-24:00)',
            'night': 'Night (00:00-6:00)'
        };

        Object.entries(timeOptions).forEach(([value, text]) => {
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'departure-time';
            radio.value = value;
            radio.id = `time-${value}`;

            const label = document.createElement('label');
            label.htmlFor = `time-${value}`;
            label.textContent = text;

            timePreferences.appendChild(radio);
            timePreferences.appendChild(label);
        });
    }

    // Handle form submission
    if (searchForm) {
        searchForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form values
            const searchParams = {
                departure_id: departureInput.value.trim(),
                arrival_id: arrivalInput.value.trim(),
                outbound_date: outboundDate.value,
                flight_type: flightType.value,
                max_price: priceSlider ? priceSlider.noUiSlider.get()[1] : maxPrice,
                min_price: priceSlider ? priceSlider.noUiSlider.get()[0] : minPrice,
                max_stops: stopsFilter.value,
                preferred_airlines: Array.from(
                    document.querySelectorAll('.selected-airline')
                ).map(airline => airline.dataset.airline),
                travel_class: document.querySelector('input[name="cabin-class"]:checked')?.value || 'economy',
                preferred_departure_time: document.querySelector('input[name="departure-time"]:checked')?.value || 'any'
            };

            // Validate required fields
            if (!searchParams.departure_id || !searchParams.arrival_id) {
                alert('Please enter both departure and arrival airports');
                return;
            }

            // Show loading state
            const searchButton = searchForm.querySelector('button[type="submit"]');
            const originalText = searchButton.textContent;
            searchButton.disabled = true;
            searchButton.textContent = 'Searching...';

            try {
                // Make API request
                const response = await fetch(`/api/search/flights?${new URLSearchParams(searchParams)}`);
                const data = await response.json();

                // Display results
                displayFlightResults(data);
            } catch (error) {
                console.error('Error searching flights:', error);
                alert('Error searching flights. Please try again.');
            } finally {
                // Restore button state
                searchButton.disabled = false;
                searchButton.textContent = originalText;
            }
        });
    }

    // Function to display flight results
    function displayFlightResults(data) {
        if (!resultsContainer) return;

        resultsContainer.innerHTML = '';

        const flights = data.best_flights || data.other_flights || [];

        if (flights.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">No flights found matching your criteria.</p>';
            return;
        }

        flights.forEach(flight => {
            const flightCard = document.createElement('div');
            flightCard.className = 'flight-card';

            // Format duration
            const duration = flight.total_duration;
            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;
            const durationText = `${hours}h ${minutes}m`;

            flightCard.innerHTML = `
                <div class="flight-info">
                    <div class="airline">
                        <span>${flight.airline}</span>
                    </div>
                    <div class="flight-details">
                        <div class="flight-number">Flight ${flight.flight_number}</div>
                        <div class="duration">${durationText}</div>
                        <div class="stops">${flight.total_stops} stop(s)</div>
                    </div>
                </div>
                <div class="flight-times">
                    <div class="departure">
                        <span class="time">${formatTime(flight.flights[0].departure_airport.time)}</span>
                        <span class="airport">${flight.flights[0].departure_airport.name}</span>
                    </div>
                    <div class="arrival">
                        <span class="time">${formatTime(flight.flights[0].arrival_airport.time)}</span>
                        <span class="airport">${flight.flights[0].arrival_airport.name}</span>
                    </div>
                </div>
                <div class="flight-price">
                    <span class="price">$${flight.price}</span>
                    <a href="${flight.booking_url}" target="_blank" class="book-button">Book Now</a>
                </div>
            `;

            resultsContainer.appendChild(flightCard);
        });
    }

    // Helper functions
    function formatTime(time) {
        return time ? time.slice(0, 5) : 'N/A';
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});
