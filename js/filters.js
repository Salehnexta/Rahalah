/**
 * Rahalah Travel App - Elegant Filters
 * Handles the functionality of the redesigned filter system
 */

document.addEventListener('DOMContentLoaded', function() {
    // Filter toggle
    const filterToggle = document.getElementById('filter-toggle');
    const filtersContainer = document.getElementById('filters-container');
    const closeFilters = document.getElementById('close-filters');
    
    if (filterToggle && filtersContainer && closeFilters) {
        // Open filters
        filterToggle.addEventListener('click', function() {
            filtersContainer.classList.add('active');
            filterToggle.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when filters are open
        });
        
        // Close filters
        closeFilters.addEventListener('click', function() {
            filtersContainer.classList.remove('active');
            filterToggle.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        });
        
        // Close filters when clicking outside
        document.addEventListener('click', function(event) {
            if (filtersContainer.classList.contains('active') && 
                !filtersContainer.contains(event.target) && 
                event.target !== filterToggle) {
                filtersContainer.classList.remove('active');
                filterToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Price Range Slider
    const priceSlider = document.getElementById('price-slider');
    const priceTrack = document.getElementById('price-track');
    const priceHandleMin = document.getElementById('price-handle-min');
    const priceHandleMax = document.getElementById('price-handle-max');
    const priceMinValue = document.getElementById('price-min-value');
    const priceMaxValue = document.getElementById('price-max-value');
    
    if (priceSlider && priceTrack && priceHandleMin && priceHandleMax) {
        const minPrice = 0;
        const maxPrice = 1000;
        let activeHandle = null;
        
        // Initialize price values
        updatePriceValues();
        updatePriceTrack();
        
        // Handle mouse/touch events for price slider
        priceHandleMin.addEventListener('mousedown', startDrag);
        priceHandleMax.addEventListener('mousedown', startDrag);
        priceHandleMin.addEventListener('touchstart', startDrag);
        priceHandleMax.addEventListener('touchstart', startDrag);
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);
        
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
        
        function startDrag(e) {
            e.preventDefault();
            activeHandle = this;
            activeHandle.classList.add('active');
        }
        
        function drag(e) {
            if (!activeHandle) return;
            
            // Get mouse/touch position
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            
            // Get slider dimensions
            const sliderRect = priceSlider.getBoundingClientRect();
            const sliderWidth = sliderRect.width;
            const sliderLeft = sliderRect.left;
            
            // Calculate position as percentage of slider width
            let percentage = Math.max(0, Math.min(100, ((clientX - sliderLeft) / sliderWidth) * 100));
            
            // Enforce min/max constraints
            if (activeHandle === priceHandleMin) {
                const maxPercentage = parseFloat(priceHandleMax.style.left || 100);
                percentage = Math.min(percentage, maxPercentage - 5); // Prevent handles from overlapping
            } else if (activeHandle === priceHandleMax) {
                const minPercentage = parseFloat(priceHandleMin.style.left || 0);
                percentage = Math.max(percentage, minPercentage + 5); // Prevent handles from overlapping
            }
            
            // Update handle position
            activeHandle.style.left = percentage + '%';
            
            // Update price value
            const value = Math.round(minPrice + (percentage / 100) * (maxPrice - minPrice));
            activeHandle.setAttribute('data-value', value);
            
            // Update price display and track
            updatePriceValues();
            updatePriceTrack();
        }
        
        function endDrag() {
            if (activeHandle) {
                activeHandle.classList.remove('active');
                activeHandle = null;
            }
        }
        
        function updatePriceValues() {
            const minValue = parseInt(priceHandleMin.getAttribute('data-value') || minPrice);
            const maxValue = parseInt(priceHandleMax.getAttribute('data-value') || maxPrice);
            
            priceMinValue.textContent = '$' + minValue;
            priceMaxValue.textContent = '$' + maxValue;
        }
        
        function updatePriceTrack() {
            const minPercentage = parseFloat(priceHandleMin.style.left || 0);
            const maxPercentage = parseFloat(priceHandleMax.style.left || 100);
            
            priceTrack.style.left = minPercentage + '%';
            priceTrack.style.width = (maxPercentage - minPercentage) + '%';
        }
        
        // Initialize handle positions
        priceHandleMin.style.left = '0%';
        priceHandleMax.style.left = '100%';
    }
    
    // Star Rating Selection
    const starOptions = document.querySelectorAll('.star-option');
    
    starOptions.forEach(option => {
        option.addEventListener('click', function() {
            this.classList.toggle('selected');
            updateActiveFilters();
        });
    });
    
    // Amenities Selection
    const amenityOptions = document.querySelectorAll('.amenity-option');
    
    amenityOptions.forEach(option => {
        option.addEventListener('click', function() {
            this.classList.toggle('selected');
            updateActiveFilters();
        });
    });
    
    // Show/Hide filters based on conversation type
    const conversationTypes = document.querySelectorAll('.conversation-type');
    const hotelFilters = document.querySelectorAll('.hotel-filter');
    const flightFilters = document.querySelectorAll('.flight-filter');
    const carFilters = document.querySelectorAll('.car-filter');
    
    function updateVisibleFilters() {
        const activeType = document.querySelector('.conversation-type.active');
        if (!activeType) return;
        
        const type = activeType.getAttribute('data-type');
        
        // Hide all filters first
        hotelFilters.forEach(filter => filter.style.display = 'none');
        flightFilters.forEach(filter => filter.style.display = 'none');
        carFilters.forEach(filter => filter.style.display = 'none');
        
        // Show relevant filters
        if (type === 'hotels') {
            hotelFilters.forEach(filter => filter.style.display = 'block');
        } else if (type === 'flights') {
            flightFilters.forEach(filter => filter.style.display = 'block');
        } else if (type === 'cars') {
            carFilters.forEach(filter => filter.style.display = 'block');
        }
    }
    
    // Update filters when conversation type changes
    conversationTypes.forEach(type => {
        type.addEventListener('click', function() {
            conversationTypes.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            updateVisibleFilters();
        });
    });
    
    // Initialize visible filters
    updateVisibleFilters();
    
    // Active Filters Display
    const activeFiltersContainer = document.getElementById('active-filters');
    
    function updateActiveFilters() {
        if (!activeFiltersContainer) return;
        
        // Clear current active filters
        activeFiltersContainer.innerHTML = '';
        
        // Add selected star ratings
        const selectedStars = document.querySelectorAll('.star-option.selected');
        selectedStars.forEach(star => {
            const value = star.getAttribute('data-value');
            addActiveFilter('star', value + ' Star', value);
        });
        
        // Add selected amenities
        const selectedAmenities = document.querySelectorAll('.amenity-option.selected');
        selectedAmenities.forEach(amenity => {
            const value = amenity.getAttribute('data-value');
            const label = amenity.textContent.trim();
            addActiveFilter('amenity', label, value);
        });
        
        // Add price range
        const minPrice = priceHandleMin ? parseInt(priceHandleMin.getAttribute('data-value') || 0) : 0;
        const maxPrice = priceHandleMax ? parseInt(priceHandleMax.getAttribute('data-value') || 1000) : 1000;
        
        if (minPrice > 0 || maxPrice < 1000) {
            addActiveFilter('price', `$${minPrice} - $${maxPrice}`, `${minPrice}-${maxPrice}`);
        }
        
        // Add location if set
        const locationSearch = document.getElementById('location-search');
        if (locationSearch && locationSearch.value.trim()) {
            addActiveFilter('location', locationSearch.value.trim(), locationSearch.value.trim());
        }
    }
    
    function addActiveFilter(type, label, value) {
        const filterElement = document.createElement('div');
        filterElement.className = 'active-filter';
        filterElement.setAttribute('data-type', type);
        filterElement.setAttribute('data-value', value);
        
        filterElement.innerHTML = `
            ${label}
            <button class="remove-filter" data-type="${type}" data-value="${value}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        activeFiltersContainer.appendChild(filterElement);
        
        // Add event listener to remove button
        const removeButton = filterElement.querySelector('.remove-filter');
        removeButton.addEventListener('click', function() {
            const filterType = this.getAttribute('data-type');
            const filterValue = this.getAttribute('data-value');
            
            removeActiveFilter(filterType, filterValue);
        });
    }
    
    function removeActiveFilter(type, value) {
        // Remove from active filters display
        const filterElement = activeFiltersContainer.querySelector(`.active-filter[data-type="${type}"][data-value="${value}"]`);
        if (filterElement) {
            filterElement.remove();
        }
        
        // Update corresponding filter controls
        if (type === 'star') {
            const starOption = document.querySelector(`.star-option[data-value="${value}"]`);
            if (starOption) {
                starOption.classList.remove('selected');
            }
        } else if (type === 'amenity') {
            const amenityOption = document.querySelector(`.amenity-option[data-value="${value}"]`);
            if (amenityOption) {
                amenityOption.classList.remove('selected');
            }
        } else if (type === 'price') {
            // Reset price range to default
            if (priceHandleMin && priceHandleMax) {
                priceHandleMin.style.left = '0%';
                priceHandleMin.setAttribute('data-value', 0);
                priceHandleMax.style.left = '100%';
                priceHandleMax.setAttribute('data-value', 1000);
                updatePriceValues();
                updatePriceTrack();
            }
        } else if (type === 'location') {
            const locationSearch = document.getElementById('location-search');
            if (locationSearch) {
                locationSearch.value = '';
            }
        }
    }
    
    // Location search input
    const locationSearch = document.getElementById('location-search');
    if (locationSearch) {
        locationSearch.addEventListener('input', debounce(function() {
            updateActiveFilters();
        }, 500));
    }
    
    // Apply Filters Button
    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            // Get all filter values
            const filters = {
                priceMin: priceHandleMin ? parseInt(priceHandleMin.getAttribute('data-value') || 0) : 0,
                priceMax: priceHandleMax ? parseInt(priceHandleMax.getAttribute('data-value') || 1000) : 1000,
                stars: Array.from(document.querySelectorAll('.star-option.selected')).map(option => option.getAttribute('data-value')),
                amenities: Array.from(document.querySelectorAll('.amenity-option.selected')).map(option => option.getAttribute('data-value')),
                location: locationSearch ? locationSearch.value.trim() : '',
                sortBy: document.getElementById('sort-select') ? document.getElementById('sort-select').value : 'price-asc'
            };
            
            // Apply filters to search results
            applySearchFilters(filters);
            
            // Close filter panel
            filtersContainer.classList.remove('active');
            filterToggle.classList.remove('active');
            document.body.style.overflow = '';
            
            // Show notification
            showFilterAppliedNotification(filters);
        });
    }
    
    // Function to apply filters to search results
    function applySearchFilters(filters) {
        // Get all result cards
        const resultCards = document.querySelectorAll('.result-card');
        if (!resultCards.length) {
            console.log('No result cards found to filter');
            return;
        }
        
        console.log('Applying filters:', filters);
        
        resultCards.forEach(card => {
            // Get card data attributes for filtering
            const price = parseInt(card.getAttribute('data-price') || '0');
            const stars = card.getAttribute('data-stars');
            const amenities = card.getAttribute('data-amenities')?.split(',') || [];
            const location = card.getAttribute('data-location')?.toLowerCase();
            
            // Apply price filter
            let visible = price >= filters.priceMin && price <= filters.priceMax;
            
            // Apply star rating filter for hotels
            if (visible && stars && filters.stars.length) {
                visible = filters.stars.includes(stars);
            }
            
            // Apply amenities filter for hotels
            if (visible && amenities.length && filters.amenities.length) {
                // Check if card has at least one of the selected amenities
                const hasSelectedAmenity = amenities.some(amenity => 
                    filters.amenities.includes(amenity)
                );
                visible = hasSelectedAmenity;
            }
            
            // Apply location filter
            if (visible && location && filters.location) {
                visible = location.includes(filters.location.toLowerCase());
            }
            
            // Show/hide card based on filters
            card.style.display = visible ? 'block' : 'none';
        });
        
        // Apply sorting
        sortResults(filters.sortBy);
    }
    
    // Function to sort search results
    function sortResults(sortBy) {
        const resultsContainer = document.querySelector('.search-results');
        if (!resultsContainer) return;
        
        const resultCards = Array.from(resultsContainer.querySelectorAll('.result-card'));
        if (!resultCards.length) return;
        
        // Sort cards based on selected option
        resultCards.sort((a, b) => {
            if (sortBy === 'price-asc') {
                return (parseInt(a.getAttribute('data-price') || '0') - 
                        parseInt(b.getAttribute('data-price') || '0'));
            } else if (sortBy === 'price-desc') {
                return (parseInt(b.getAttribute('data-price') || '0') - 
                        parseInt(a.getAttribute('data-price') || '0'));
            } else if (sortBy === 'rating-desc') {
                return (parseFloat(b.getAttribute('data-rating') || '0') - 
                        parseFloat(a.getAttribute('data-rating') || '0'));
            } else if (sortBy === 'duration-asc') {
                return (parseInt(a.getAttribute('data-duration') || '0') - 
                        parseInt(b.getAttribute('data-duration') || '0'));
            }
            return 0;
        });
        
        // Re-append sorted cards to container
        resultCards.forEach(card => {
            resultsContainer.appendChild(card);
        });
    }
    
    // Show notification when filters are applied
    function showFilterAppliedNotification(filters) {
        // Count number of active filters
        let filterCount = 0;
        
        if (filters.priceMin > 0 || filters.priceMax < 1000) filterCount++;
        if (filters.stars.length > 0) filterCount++;
        if (filters.amenities.length > 0) filterCount++;
        if (filters.location) filterCount++;
        
        // Create notification message
        let message = '';
        
        if (filterCount === 0) {
            message = 'Showing all results';
        } else {
            message = `Filters applied: ${filterCount} active filter${filterCount > 1 ? 's' : ''}`;
        }
        
        // Show notification if available
        if (typeof showNotification === 'function') {
            showNotification(message, 'info');
        } else {
            console.log(message);
        }
    }
    
    // Utility function for debouncing
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    // Initialize active filters
    updateActiveFilters();
    
    // Mobile filter toggle
    const mobileFilterToggle = document.querySelector('.filter-toggle-mobile');
    const filtersColumn = document.querySelector('.filters-column');
    
    if (mobileFilterToggle && filtersColumn) {
        mobileFilterToggle.addEventListener('click', function() {
            filtersColumn.classList.toggle('active');
            // Optionally toggle an active state on the button itself
            mobileFilterToggle.classList.toggle('active'); 
            
            // Optional: Prevent body scroll when filters are open on mobile
            if (filtersColumn.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }
}); // End of DOMContentLoaded listener
