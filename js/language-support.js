/**
 * Rahalah Travel App - Language Support Module
 * Provides multi-language support with a focus on Arabic and English
 */

class LanguageSupport {
    constructor() {
        // Default language based on browser settings or user preference
        this.currentLanguage = localStorage.getItem('rahalah_language') || 'ar';
        
        // Available language options
        this.languages = {
            ar: {
                name: 'العربية',
                direction: 'rtl',
                code: 'ar'
            },
            en: {
                name: 'English',
                direction: 'ltr',
                code: 'en'
            }
        };
        
        // Dictionary of translations
        this.translations = {
            // Search related
            'search_flights': {
                ar: 'البحث عن رحلات',
                en: 'Search Flights'
            },
            'search_hotels': {
                ar: 'البحث عن فنادق',
                en: 'Search Hotels'
            },
            'search_cars': {
                ar: 'البحث عن سيارات',
                en: 'Search Cars'
            },
            'from': {
                ar: 'من',
                en: 'From'
            },
            'to': {
                ar: 'إلى',
                en: 'To'
            },
            'departure': {
                ar: 'تاريخ المغادرة',
                en: 'Departure Date'
            },
            'return': {
                ar: 'تاريخ العودة',
                en: 'Return Date'
            },
            'passengers': {
                ar: 'المسافرين',
                en: 'Passengers'
            },
            'search': {
                ar: 'بحث',
                en: 'Search'
            },
            
            // Cities and airports
            'riyadh': {
                ar: 'الرياض',
                en: 'Riyadh'
            },
            'jeddah': {
                ar: 'جدة',
                en: 'Jeddah'
            },
            'mecca': {
                ar: 'مكة المكرمة',
                en: 'Mecca'
            },
            'medina': {
                ar: 'المدينة المنورة',
                en: 'Medina'
            },
            'dammam': {
                ar: 'الدمام',
                en: 'Dammam'
            },
            'bangkok': {
                ar: 'بانكوك',
                en: 'Bangkok'
            },
            'dubai': {
                ar: 'دبي',
                en: 'Dubai'
            },
            
            // Hotel related
            'check_in': {
                ar: 'تاريخ الوصول',
                en: 'Check-in Date'
            },
            'check_out': {
                ar: 'تاريخ المغادرة',
                en: 'Check-out Date'
            },
            'rooms': {
                ar: 'الغرف',
                en: 'Rooms'
            },
            'adults': {
                ar: 'البالغين',
                en: 'Adults'
            },
            'children': {
                ar: 'الأطفال',
                en: 'Children'
            },
            'hotel_stars': {
                ar: 'تصنيف الفندق',
                en: 'Hotel Stars'
            },
            
            // Car rental related
            'pickup_date': {
                ar: 'تاريخ الاستلام',
                en: 'Pick-up Date'
            },
            'return_date': {
                ar: 'تاريخ الإرجاع',
                en: 'Return Date'
            },
            'car_type': {
                ar: 'نوع السيارة',
                en: 'Car Type'
            },
            
            // Authentication related
            'login': {
                ar: 'تسجيل الدخول',
                en: 'Login'
            },
            'register': {
                ar: 'تسجيل',
                en: 'Register'
            },
            'email': {
                ar: 'البريد الإلكتروني',
                en: 'Email'
            },
            'password': {
                ar: 'كلمة المرور',
                en: 'Password'
            },
            'full_name': {
                ar: 'الاسم الكامل',
                en: 'Full Name'
            },
            
            // User profile
            'profile': {
                ar: 'الملف الشخصي',
                en: 'Profile'
            },
            'saved_trips': {
                ar: 'الرحلات المحفوظة',
                en: 'Saved Trips'
            },
            'preferences': {
                ar: 'التفضيلات',
                en: 'Preferences'
            },
            
            // Common UI elements
            'save': {
                ar: 'حفظ',
                en: 'Save'
            },
            'cancel': {
                ar: 'إلغاء',
                en: 'Cancel'
            },
            'confirm': {
                ar: 'تأكيد',
                en: 'Confirm'
            },
            'edit': {
                ar: 'تعديل',
                en: 'Edit'
            },
            'delete': {
                ar: 'حذف',
                en: 'Delete'
            },
            
            // Time related
            'today': {
                ar: 'اليوم',
                en: 'Today'
            },
            'tomorrow': {
                ar: 'غدا',
                en: 'Tomorrow'
            },
            'next_week': {
                ar: 'الأسبوع القادم',
                en: 'Next Week'
            },
            
            // Natural language search
            'nl_flight_search': {
                ar: 'البحث عن رحلة من [المدينة] إلى [الوجهة] في [التاريخ]',
                en: 'Search for a flight from [city] to [destination] on [date]'
            },
            'nl_hotel_search': {
                ar: 'البحث عن فندق في [المدينة] من [تاريخ البداية] إلى [تاريخ النهاية]',
                en: 'Search for a hotel in [city] from [start date] to [end date]'
            }
        };
        
        // Apply initial language settings
        this.applyLanguage(this.currentLanguage);
    }
    
    /**
     * Switch the application language
     * @param {string} lang - Language code (ar or en)
     */
    switchLanguage(lang) {
        if (this.languages[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('rahalah_language', lang);
            this.applyLanguage(lang);
            return true;
        }
        return false;
    }
    
    /**
     * Apply the selected language to the UI
     * @param {string} lang - Language code
     */
    applyLanguage(lang) {
        const direction = this.languages[lang].direction;
        
        // Set HTML dir attribute for RTL support
        document.documentElement.setAttribute('dir', direction);
        document.documentElement.setAttribute('lang', lang);
        
        // Add RTL-specific CSS class to body
        if (direction === 'rtl') {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }
        
        // Update all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (this.translations[key] && this.translations[key][lang]) {
                el.textContent = this.translations[key][lang];
            }
        });
        
        // Update placeholders for inputs
        const inputElements = document.querySelectorAll('input[data-i18n-placeholder]');
        inputElements.forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (this.translations[key] && this.translations[key][lang]) {
                el.placeholder = this.translations[key][lang];
            }
        });
        
        // Dispatch a language change event
        const event = new CustomEvent('languageChanged', { detail: { language: lang, direction: direction } });
        document.dispatchEvent(event);
    }
    
    /**
     * Get translation for a key
     * @param {string} key - Translation key
     * @param {Object} params - Optional parameters to replace in the translation
     * @returns {string} - Translated text
     */
    translate(key, params = {}) {
        if (!this.translations[key] || !this.translations[key][this.currentLanguage]) {
            // Return key if translation not found
            return key;
        }
        
        let text = this.translations[key][this.currentLanguage];
        
        // Replace parameters in the translation
        if (params) {
            Object.keys(params).forEach(param => {
                text = text.replace(`[${param}]`, params[param]);
            });
        }
        
        return text;
    }
    
    /**
     * Parse Arabic natural language query
     * @param {string} query - Natural language query in Arabic
     * @returns {Object} - Structured search parameters
     */
    parseArabicQuery(query) {
        // Lowercase and remove diacritics for better matching
        const normalizedQuery = this.normalizeArabicText(query);
        
        // Basic patterns to detect in Arabic queries
        const patterns = {
            // Flight patterns
            flightPattern: /رحل[ةه]\s+(?:من|إلى|الى)\s+|طيران\s+(?:من|إلى|الى)/i,
            fromPattern: /من\s+([ء-ي\s]+?)\s+(?:إلى|الى|في|ل|على)/i,
            toPattern: /(?:إلى|الى)\s+([ء-ي\s]+?)\s+(?:في|من|ل|على|$)/i,
            
            // Date patterns
            tomorrowPattern: /غد[اً]|بكرة/i,
            todayPattern: /اليوم|النهارده/i,
            nextWeekPattern: /الأسبوع\s+القادم|الأسبوع\s+الجاي/i,
            
            // Hotel patterns
            hotelPattern: /فندق|إقامة|اقامة/i,
            starsPattern: /(\d)\s*نجوم|(\d)\s*نجمة/i,
            nightsPattern: /(\d+)\s*(?:ليلة|ليالي|ليال)/i,
            
            // Car patterns
            carPattern: /سيارة|إيجار\s+سيارة|ايجار\s+سيارة/i,
            carTypePattern: /سيارة\s+([ء-ي\s]+?)(?:\s+في|\s+من|\s+$)/i
        };
        
        // Extract search type
        let searchType = 'unknown';
        if (patterns.flightPattern.test(normalizedQuery)) {
            searchType = 'flight';
        } else if (patterns.hotelPattern.test(normalizedQuery)) {
            searchType = 'hotel';
        } else if (patterns.carPattern.test(normalizedQuery)) {
            searchType = 'car';
        }
        
        // Build result object
        const result = {
            type: searchType,
            params: {}
        };
        
        // Extract origin/destination for flights
        if (searchType === 'flight') {
            const fromMatch = normalizedQuery.match(patterns.fromPattern);
            if (fromMatch && fromMatch[1]) {
                result.params.origin = this.cleanArabicText(fromMatch[1]);
            }
            
            const toMatch = normalizedQuery.match(patterns.toPattern);
            if (toMatch && toMatch[1]) {
                result.params.destination = this.cleanArabicText(toMatch[1]);
            }
        }
        
        // Extract city for hotels or cars
        if (searchType === 'hotel' || searchType === 'car') {
            const inCityMatch = normalizedQuery.match(/في\s+([ء-ي\s]+?)(?:\s+من|\s+$)/i);
            if (inCityMatch && inCityMatch[1]) {
                result.params.city = this.cleanArabicText(inCityMatch[1]);
            }
        }
        
        // Extract dates
        if (patterns.tomorrowPattern.test(normalizedQuery)) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            result.params.date = this.formatDate(tomorrow);
        } else if (patterns.todayPattern.test(normalizedQuery)) {
            result.params.date = this.formatDate(new Date());
        } else if (patterns.nextWeekPattern.test(normalizedQuery)) {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            result.params.date = this.formatDate(nextWeek);
        }
        
        // Extract stars for hotels
        if (searchType === 'hotel') {
            const starsMatch = normalizedQuery.match(patterns.starsPattern);
            if (starsMatch && (starsMatch[1] || starsMatch[2])) {
                result.params.stars = parseInt(starsMatch[1] || starsMatch[2], 10);
            }
            
            const nightsMatch = normalizedQuery.match(patterns.nightsPattern);
            if (nightsMatch && nightsMatch[1]) {
                result.params.nights = parseInt(nightsMatch[1], 10);
            }
        }
        
        // Extract car type
        if (searchType === 'car') {
            const carTypeMatch = normalizedQuery.match(patterns.carTypePattern);
            if (carTypeMatch && carTypeMatch[1]) {
                result.params.carType = this.cleanArabicText(carTypeMatch[1]);
            }
        }
        
        return result;
    }
    
    /**
     * Normalize Arabic text for better matching
     * @param {string} text - Arabic text to normalize
     * @returns {string} - Normalized text
     */
    normalizeArabicText(text) {
        // Remove diacritics
        text = text.replace(/[\u064B-\u065F]/g, '');
        
        // Normalize alef forms
        text = text.replace(/[أإآا]/g, 'ا');
        
        // Normalize teh marbuta and heh
        text = text.replace(/[ةه]/g, 'ه');
        
        // Normalize yeh forms
        text = text.replace(/[يى]/g, 'ي');
        
        return text.trim();
    }
    
    /**
     * Clean Arabic text by removing extra spaces
     * @param {string} text - Arabic text to clean
     * @returns {string} - Cleaned text
     */
    cleanArabicText(text) {
        return text.replace(/\s+/g, ' ').trim();
    }
    
    /**
     * Format date in YYYY-MM-DD format
     * @param {Date} date - Date object
     * @returns {string} - Formatted date
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

// Create and export a singleton instance
const languageSupport = new LanguageSupport();
export default languageSupport;
