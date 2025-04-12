/**
 * Rahalah Travel App - Search Integration
 * Connects the SearchApi.io Hotels API with the improved filters UI
 */

import { searchHotels, processArabicQuery } from './hotels-api.js';

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.getElementById('search-query');
    const searchButton = document.querySelector('.search-btn');
    const resultsContainer = document.querySelector('.results-column');
    const loadingIndicator = document.createElement('div');
    
    // Set up loading indicator
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<div class="spinner"></div><p>جاري البحث...</p>';
    
    // Setup conversation type tabs
    const conversationTypes = document.querySelectorAll('.conversation-type');
    let currentSearchType = 'hotels'; // Default search type
    
    // Listen for tab changes
    conversationTypes.forEach(type => {
        type.addEventListener('click', function() {
            currentSearchType = this.getAttribute('data-type');
        });
    });
    
    // Setup search form submission
    if (searchForm) {
        searchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            performSearch();
        });
    }
    
    // Setup search button click
    if (searchButton) {
        searchButton.addEventListener('click', async function(e) {
            e.preventDefault();
            performSearch();
        });
    }
    
    /**
     * Perform search based on current type and query
     */
    async function performSearch() {
        if (!searchInput || !searchInput.value.trim()) {
            return; // Don't search with empty query
        }
        
        const query = searchInput.value.trim();
        
        // Show loading indicator
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
            resultsContainer.appendChild(loadingIndicator);
        }
        
        try {
            switch (currentSearchType) {
                case 'hotels':
                    await searchAndDisplayHotels(query);
                    break;
                case 'flights':
                    // Flight search (to be implemented)
                    displayMessage('عذراً، البحث عن الرحلات غير متاح حالياً');
                    break;
                case 'cars':
                    // Car rental search (to be implemented)
                    displayMessage('عذراً، البحث عن السيارات غير متاح حالياً');
                    break;
                default:
                    displayMessage('يرجى اختيار نوع البحث (فنادق، رحلات، أو سيارات)');
            }
        } catch (error) {
            console.error('Search error:', error);
            displayMessage('حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');
        }
    }
    
    /**
     * Search for hotels and display results
     */
    async function searchAndDisplayHotels(query) {
        try {
            // Process Arabic query to extract parameters
            const params = processArabicQuery(query);
            
            // Get filters values to apply
            applyFiltersToParams(params);
            
            // Perform API search
            const results = await searchHotels(params);
            
            // Remove loading indicator
            if (loadingIndicator.parentNode) {
                loadingIndicator.parentNode.removeChild(loadingIndicator);
            }
            
            // Display results
            if (results.success && results.hotels.length > 0) {
                displayHotelResults(results);
                
                // Update active filters display
                updateActiveFiltersFromResults(results);
            } else {
                displayMessage('لم يتم العثور على فنادق تطابق معايير البحث.');
            }
        } catch (error) {
            console.error('Hotel search error:', error);
            displayMessage('حدث خطأ أثناء البحث عن الفنادق. يرجى المحاولة مرة أخرى.');
        }
    }
    
    /**
     * Apply current filter values to search parameters
     */
    function applyFiltersToParams(params) {
        // Price range filter
        const minPriceElem = document.getElementById('price-min-value');
        const maxPriceElem = document.getElementById('price-max-value');
        
        if (minPriceElem) {
            const minPrice = parseInt(minPriceElem.textContent.replace(/[^0-9]/g, ''));
            if (!isNaN(minPrice)) {
                params.minPrice = minPrice;
            }
        }
        
        if (maxPriceElem) {
            const maxPrice = parseInt(maxPriceElem.textContent.replace(/[^0-9]/g, ''));
            if (!isNaN(maxPrice) && maxPrice < 1000) { // Only set if less than max
                params.maxPrice = maxPrice;
            }
        }
        
        // Star rating filter
        const selectedStars = [];
        document.querySelectorAll('.star-option.selected').forEach(option => {
            const stars = parseInt(option.getAttribute('data-value'));
            if (!isNaN(stars)) {
                selectedStars.push(stars);
            }
        });
        
        if (selectedStars.length > 0) {
            params.starRating = selectedStars;
        }
        
        // Amenities filter
        const selectedAmenities = [];
        document.querySelectorAll('.amenity-option.selected').forEach(option => {
            const amenity = option.getAttribute('data-value');
            if (amenity) {
                selectedAmenities.push(amenity);
            }
        });
        
        if (selectedAmenities.length > 0) {
            params.amenities = selectedAmenities;
        }
        
        return params;
    }
    
    /**
     * Display hotel results in the UI
     */
    function displayHotelResults(results) {
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = '';
        
        // Create results counter
        const resultsCounter = document.createElement('div');
        resultsCounter.className = 'results-counter';
        resultsCounter.textContent = `تم العثور على ${results.hotels.length} فنادق`;
        resultsContainer.appendChild(resultsCounter);
        
        // Create hotels list
        results.hotels.forEach(hotel => {
            const hotelCard = createHotelCard(hotel, results.currency);
            resultsContainer.appendChild(hotelCard);
        });
    }
    
    /**
     * Create hotel result card HTML
     */
    function createHotelCard(hotel, currency) {
        const card = document.createElement('div');
        card.className = 'result-card';
        
        // Generate star icons
        let starsHtml = '';
        if (hotel.stars) {
            for (let i = 0; i < hotel.stars; i++) {
                starsHtml += '<i class="fas fa-star"></i>';
            }
        }
        
        // Format price
        const priceText = hotel.price ? `${hotel.price} ${currency}` : 'سعر غير متوفر';
        
        card.innerHTML = `
            <div class="result-header">
                <h3>${hotel.name}</h3>
                <div class="hotel-stars">${starsHtml}</div>
            </div>
            <div class="result-body">
                <div class="hotel-details">
                    <div class="hotel-address">
                        <i class="fas fa-map-marker-alt"></i>
                        <p>${hotel.address || 'العنوان غير متوفر'}</p>
                    </div>
                    <div class="hotel-rating">
                        <span class="rating-score">${hotel.rating}</span>/5
                        <span class="rating-count">(${hotel.reviewCount} تقييم)</span>
                    </div>
                </div>
                ${hotel.thumbnail ? `<img src="${hotel.thumbnail}" alt="${hotel.name}" class="hotel-image">` : ''}
                <div class="hotel-amenities">
                    ${hotel.amenities.slice(0, 5).map(amenity => 
                        `<span class="amenity-tag">${amenity}</span>`
                    ).join('')}
                </div>
            </div>
            <div class="result-footer">
                <div class="price">${priceText}</div>
                <a href="${hotel.url}" target="_blank" class="book-btn">عرض التفاصيل</a>
            </div>
        `;
        
        return card;
    }
    
    /**
     * Update active filters display based on search results
     */
    function updateActiveFiltersFromResults(results) {
        const activeFiltersContainer = document.getElementById('active-filters');
        if (!activeFiltersContainer) return;
        
        activeFiltersContainer.innerHTML = '';
        
        // Add active filter badges
        const addFilterBadge = (text, onRemove) => {
            const badge = document.createElement('div');
            badge.className = 'filter-badge';
            badge.innerHTML = `
                ${text}
                <button class="filter-remove" aria-label="إزالة هذا الفلتر">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Handle remove click
            const removeButton = badge.querySelector('.filter-remove');
            if (removeButton && onRemove) {
                removeButton.addEventListener('click', onRemove);
            }
            
            activeFiltersContainer.appendChild(badge);
        };
        
        // Add price range filter badge if set
        if (results.params && (results.params.minPrice || results.params.maxPrice)) {
            const minText = results.params.minPrice ? results.params.minPrice : '0';
            const maxText = results.params.maxPrice ? results.params.maxPrice : '1000+';
            addFilterBadge(`السعر: ${minText} - ${maxText} ${results.currency}`);
        }
        
        // Add star rating filter badges
        if (results.params && results.params.starRating && results.params.starRating.length > 0) {
            results.params.starRating.forEach(stars => {
                addFilterBadge(`${stars} نجوم`);
            });
        }
        
        // Add amenities filter badges
        if (results.params && results.params.amenities && results.params.amenities.length > 0) {
            results.params.amenities.forEach(amenity => {
                addFilterBadge(amenity);
            });
        }
    }
    
    /**
     * Display a message in the results container
     */
    function displayMessage(message) {
        if (!resultsContainer) return;
        
        // Remove loading indicator
        if (loadingIndicator.parentNode) {
            loadingIndicator.parentNode.removeChild(loadingIndicator);
        }
        
        // Show message
        resultsContainer.innerHTML = `<div class="message-container">${message}</div>`;
    }
});
