/**
 * Rahalah Travel App - UI Enhancements
 * This file contains UI enhancement functionality for the Rahalah travel app
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', function(event) {
            if (!sidebar.contains(event.target) && event.target !== mobileMenuToggle) {
                sidebar.classList.remove('active');
            }
        });
    }
    
    // Search Filters Toggle
    const filterToggle = document.getElementById('filter-toggle');
    const searchFilters = document.getElementById('search-filters');
    const closeFilters = document.getElementById('close-filters');
    
    if (filterToggle && searchFilters && closeFilters) {
        filterToggle.addEventListener('click', function() {
            searchFilters.classList.toggle('active');
        });
        
        closeFilters.addEventListener('click', function() {
            searchFilters.classList.remove('active');
        });
    }
    
    // Price Range Slider
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    const priceMinValue = document.getElementById('price-min-value');
    const priceMaxValue = document.getElementById('price-max-value');
    
    if (priceMin && priceMax && priceMinValue && priceMaxValue) {
        // Update price values when sliders change
        priceMin.addEventListener('input', function() {
            priceMinValue.textContent = '$' + this.value;
            // Ensure min doesn't exceed max
            if (parseInt(priceMin.value) > parseInt(priceMax.value)) {
                priceMax.value = priceMin.value;
                priceMaxValue.textContent = '$' + priceMax.value;
            }
        });
        
        priceMax.addEventListener('input', function() {
            priceMaxValue.textContent = '$' + this.value;
            // Ensure max doesn't go below min
            if (parseInt(priceMax.value) < parseInt(priceMin.value)) {
                priceMin.value = priceMax.value;
                priceMinValue.textContent = '$' + priceMin.value;
            }
        });
    }
    
    // Show/Hide filters based on conversation type
    const conversationTypes = document.querySelectorAll('.conversation-type');
    const hotelFilters = document.querySelectorAll('.hotel-filter');
    const flightFilters = document.querySelectorAll('.flight-filter');
    const carFilters = document.querySelectorAll('.car-filter');
    
    function updateFilters() {
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
            updateFilters();
        });
    });
    
    // Initialize filters based on current conversation type
    updateFilters();
    
    // Apply Filters Button
    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            // Get all filter values
            const filters = {
                priceMin: parseInt(priceMin.value),
                priceMax: parseInt(priceMax.value),
                stars: Array.from(document.querySelectorAll('.star-rating input:checked')).map(input => input.value),
                amenities: Array.from(document.querySelectorAll('.amenities-options input:checked')).map(input => input.value),
                airlines: Array.from(document.querySelectorAll('.airline-options input:checked')).map(input => input.value),
                carTypes: Array.from(document.querySelectorAll('.car-type-options input:checked')).map(input => input.value),
                sortBy: document.getElementById('sort-options').value
            };
            
            // Apply filters to search results
            applySearchFilters(filters);
            
            // Close filter panel
            searchFilters.classList.remove('active');
        });
    }
    
    // Function to apply filters to search results
    function applySearchFilters(filters) {
        // Get all result cards
        const resultCards = document.querySelectorAll('.result-card');
        if (!resultCards.length) return;
        
        resultCards.forEach(card => {
            // Get card data attributes for filtering
            const price = parseInt(card.getAttribute('data-price') || '0');
            const stars = card.getAttribute('data-stars');
            const amenities = card.getAttribute('data-amenities')?.split(',') || [];
            const airline = card.getAttribute('data-airline');
            const carType = card.getAttribute('data-car-type');
            
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
            
            // Apply airline filter for flights
            if (visible && airline && filters.airlines.length) {
                visible = filters.airlines.includes(airline);
            }
            
            // Apply car type filter for car rentals
            if (visible && carType && filters.carTypes.length) {
                visible = filters.carTypes.includes(carType);
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
    
    // Enhanced Error Handling for Form Submissions
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Clear previous error messages
            clearErrors(loginForm);
            
            // Validate form
            let isValid = true;
            
            if (!email) {
                showError(document.getElementById('login-email'), 'Email is required');
                isValid = false;
            } else if (!isValidEmail(email)) {
                showError(document.getElementById('login-email'), 'Please enter a valid email');
                isValid = false;
            }
            
            if (!password) {
                showError(document.getElementById('login-password'), 'Password is required');
                isValid = false;
            }
            
            if (isValid) {
                // Show loading state
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
                
                // Submit form data
                loginUser(email, password)
                    .then(response => {
                        // Handle successful login
                        closeModal('login-modal');
                        updateUserProfile(response.user);
                    })
                    .catch(error => {
                        // Show error message
                        const errorContainer = document.createElement('div');
                        errorContainer.className = 'form-error-message';
                        errorContainer.textContent = error.message || 'Failed to login. Please try again.';
                        loginForm.prepend(errorContainer);
                    })
                    .finally(() => {
                        // Reset button state
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    });
            }
        });
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            
            // Clear previous error messages
            clearErrors(signupForm);
            
            // Validate form
            let isValid = true;
            
            if (!name) {
                showError(document.getElementById('signup-name'), 'Name is required');
                isValid = false;
            }
            
            if (!email) {
                showError(document.getElementById('signup-email'), 'Email is required');
                isValid = false;
            } else if (!isValidEmail(email)) {
                showError(document.getElementById('signup-email'), 'Please enter a valid email');
                isValid = false;
            }
            
            if (!password) {
                showError(document.getElementById('signup-password'), 'Password is required');
                isValid = false;
            } else if (password.length < 8) {
                showError(document.getElementById('signup-password'), 'Password must be at least 8 characters');
                isValid = false;
            }
            
            if (isValid) {
                // Show loading state
                const submitBtn = signupForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
                
                // Submit form data
                registerUser(name, email, password)
                    .then(response => {
                        // Handle successful registration
                        closeModal('signup-modal');
                        updateUserProfile(response.user);
                        
                        // Show welcome message
                        showNotification('Account created successfully! Welcome to Rahalah.', 'success');
                    })
                    .catch(error => {
                        // Show error message
                        const errorContainer = document.createElement('div');
                        errorContainer.className = 'form-error-message';
                        errorContainer.textContent = error.message || 'Failed to create account. Please try again.';
                        signupForm.prepend(errorContainer);
                    })
                    .finally(() => {
                        // Reset button state
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    });
            }
        });
    }
    
    // Helper functions for form validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showError(inputElement, message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'input-error';
        errorElement.textContent = message;
        
        // Insert error message after input
        inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
        
        // Add error class to input
        inputElement.classList.add('error');
    }
    
    function clearErrors(form) {
        // Remove all error messages
        const errorMessages = form.querySelectorAll('.input-error, .form-error-message');
        errorMessages.forEach(error => error.remove());
        
        // Remove error class from inputs
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => input.classList.remove('error'));
    }
    
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    // Function to update user profile UI after login/signup
    function updateUserProfile(user) {
        const userProfile = document.getElementById('user-profile');
        const loggedInProfile = document.getElementById('logged-in-profile');
        const authButtons = userProfile.querySelectorAll('.auth-btn');
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        
        if (user) {
            // Hide auth buttons
            authButtons.forEach(btn => btn.style.display = 'none');
            
            // Show logged in profile
            loggedInProfile.style.display = 'block';
            
            // Update user info
            userName.textContent = user.name || user.email.split('@')[0];
            userEmail.textContent = user.email;
        } else {
            // Show auth buttons
            authButtons.forEach(btn => btn.style.display = 'block');
            
            // Hide logged in profile
            loggedInProfile.style.display = 'none';
        }
    }
    
    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${getIconForType(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="close-notification">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);
        
        // Auto close after 5 seconds
        const timeout = setTimeout(() => {
            closeNotification(notification);
        }, 5000);
        
        // Close button
        const closeBtn = notification.querySelector('.close-notification');
        closeBtn.addEventListener('click', () => {
            clearTimeout(timeout);
            closeNotification(notification);
        });
    }
    
    function closeNotification(notification) {
        notification.classList.remove('active');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
    
    function getIconForType(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }
    
    // Add notification styles
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            min-width: 300px;
            max-width: 400px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 9999;
            transform: translateX(120%);
            transition: transform 0.3s ease;
        }
        
        .notification.active {
            transform: translateX(0);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .notification.success {
            border-left: 4px solid var(--success-color);
        }
        
        .notification.success i {
            color: var(--success-color);
        }
        
        .notification.error {
            border-left: 4px solid var(--error-color);
        }
        
        .notification.error i {
            color: var(--error-color);
        }
        
        .notification.warning {
            border-left: 4px solid var(--warning-color);
        }
        
        .notification.warning i {
            color: var(--warning-color);
        }
        
        .notification.info {
            border-left: 4px solid var(--info-color);
        }
        
        .notification.info i {
            color: var(--info-color);
        }
        
        .close-notification {
            background: none;
            border: none;
            color: var(--light-text);
            cursor: pointer;
        }
        
        .form-error-message {
            background-color: rgba(231, 76, 60, 0.1);
            color: var(--error-color);
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
            font-size: 14px;
        }
        
        .input-error {
            color: var(--error-color);
            font-size: 12px;
            margin-top: 5px;
            margin-bottom: 10px;
        }
        
        input.error {
            border-color: var(--error-color);
        }
    `;
    document.head.appendChild(notificationStyles);
});
