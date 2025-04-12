document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const welcomeScreen = document.getElementById('welcome-screen');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const newChatBtnAr = document.getElementById('new-chat-btn-ar');
    const conversationTypes = document.querySelectorAll('.conversation-type');
    const optionCards = document.querySelectorAll('.option-card');
    const examplePrompts = document.querySelectorAll('.example-prompt');
    const langButtons = document.querySelectorAll('.lang-btn');
    const typingIndicator = document.getElementById('typing-indicator');
    
    // State
    let currentConversationType = 'flights'; // Default conversation type
    let conversationActive = false;
    let currentLanguage = 'en'; // Default language
    
    // Arabic sample responses
    const arSampleResponses = {
        cars: {
            default: "يمكنني مساعدتك في العثور على سيارة للإيجار. ما هي وجهتك وتواريخ الإيجار ونوع السيارة المفضلة؟"
        },
        flights: {
            default: "يمكنني مساعدتك في العثور على رحلات. ما هي مدينة المغادرة والوجهة وتاريخ السفر؟",
            "Find flights from Dammam to Riyadh for tomorrow": `
                <p>وجدت عدة رحلات من الدمام (DMM) إلى الرياض (RUH) غدًا:</p>
                <p><strong>رحلات الصباح:</strong></p>
                <ul>
                    <li><strong>طيران ناس XY2103</strong> - 07:15 إلى 08:25 - 290 ريال</li>
                    <li><strong>الخطوط السعودية SV1051</strong> - 08:30 إلى 09:40 - 320 ريال</li>
                    <li><strong>طيران أديل F3 1201</strong> - 09:00 إلى 10:10 - 270 ريال</li>
                </ul>
                <p><strong>رحلات الظهيرة:</strong></p>
                <ul>
                    <li><strong>الخطوط السعودية SV1055</strong> - 12:45 إلى 13:55 - 380 ريال</li>
                    <li><strong>طيران أديل F3 1203</strong> - 14:00 إلى 15:10 - 300 ريال</li>
                </ul>
                <p><strong>رحلات المساء:</strong></p>
                <ul>
                    <li><strong>طيران ناس XY2107</strong> - 16:45 إلى 17:55 - 330 ريال</li>
                    <li><strong>الخطوط السعودية SV1059</strong> - 18:00 إلى 19:10 - 420 ريال</li>
                </ul>
                <p>هل ترغب في مساعدتك في حجز أي من هذه الرحلات؟ يمكنني توفير روابط مباشرة إلى مواقع شركات الطيران.</p>
            `
        },
        hotels: {
            default: "يمكنني مساعدتك في العثور على فنادق. ما هي وجهتك وتواريخ تسجيل الوصول/المغادرة والميزانية؟"
        },
        packages: {
            default: "يمكنني مساعدتك في تصميم باقة سفر مخصصة بناءً على ميزانيتك. ما هي وجهتك ومدة الرحلة وميزانيتك التقريبية؟",
            "Plan a 5-day trip to Dubai with a budget of $1500": `
                <p>إليك خطة رحلة لمدة 5 أيام إلى دبي بميزانية 1500 دولار:</p>
                <p><strong>السفر والإقامة ($900):</strong></p>
                <ul>
                    <li><strong>الطيران:</strong> رحلة ذهاب وعودة مع طيران فلاي دبي - $350</li>
                    <li><strong>الفندق:</strong> فندق روضة المروج (3 نجوم) - 4 ليالي - $550</li>
                </ul>
                <p><strong>الأنشطة والجولات ($400):</strong></p>
                <ul>
                    <li><strong>اليوم 1:</strong> جولة في مدينة دبي القديمة وسوق الذهب - $50</li>
                    <li><strong>اليوم 2:</strong> زيارة برج خليفة ودبي مول - $100</li>
                    <li><strong>اليوم 3:</strong> رحلة سفاري صحراوية - $120</li>
                    <li><strong>اليوم 4:</strong> يوم في أكوافنتشر واتربارك - $80</li>
                    <li><strong>اليوم 5:</strong> زيارة جزيرة النخلة والمرسى - $50</li>
                </ul>
                <p><strong>النقل والطعام ($200):</strong></p>
                <ul>
                    <li><strong>النقل:</strong> بطاقة مترو لمدة 5 أيام + بعض رحلات التاكسي - $100</li>
                    <li><strong>الطعام:</strong> مزيج من المطاعم المحلية والعالمية - $100</li>
                </ul>
                <p>هل ترغب في تعديل أي جزء من هذه الخطة؟ يمكنني تقديم المزيد من الخيارات أو تعديل الميزانية حسب احتياجاتك.</p>
            `
        }
    };
    
    // English sample responses for demo
    const sampleResponses = {
        flights: {
            default: "I can help you find flights. What's your departure city, destination, and travel date?",
            "Find flights from Dammam to Riyadh for tomorrow": `
                <p>I found several flights from Dammam (DMM) to Riyadh (RUH) for tomorrow:</p>
                <p><strong>Morning Flights:</strong></p>
                <ul>
                    <li><strong>flynas XY2103</strong> - 07:15 to 08:25 - 290 SAR <span class="provider-tag">flynas</span> <a href="#" class="offer-link" data-flight="flynas-xy2103">View Flight Details</a></li>
                    <li><strong>Saudia SV1051</strong> - 08:30 to 09:40 - 320 SAR <span class="provider-tag">Saudia Airlines</span> <a href="#" class="offer-link" data-flight="saudia-sv1051">View Flight Details</a></li>
                    <li><strong>flyadeal F3 1201</strong> - 09:00 to 10:10 - 270 SAR <span class="provider-tag">flyadeal</span> <a href="#" class="offer-link" data-flight="flyadeal-f31201">View Flight Details</a></li>
                </ul>
                <p><strong>Afternoon Flights:</strong></p>
                <ul>
                    <li><strong>Saudia SV1055</strong> - 12:45 to 13:55 - 380 SAR <span class="provider-tag">Saudia Airlines</span> <a href="#" class="offer-link" data-flight="saudia-sv1055">View Flight Details</a></li>
                    <li><strong>flyadeal F3 1203</strong> - 14:00 to 15:10 - 300 SAR <span class="provider-tag">flyadeal</span> <a href="#" class="offer-link" data-flight="flyadeal-f31203">View Flight Details</a></li>
                </ul>
                <p><strong>Evening Flights:</strong></p>
                <ul>
                    <li><strong>flynas XY2107</strong> - 16:45 to 17:55 - 330 SAR <span class="provider-tag">flynas</span> <a href="#" class="offer-link" data-flight="flynas-xy2107">View Flight Details</a></li>
                    <li><strong>Saudia SV1059</strong> - 18:00 to 19:10 - 420 SAR <span class="provider-tag">Saudia Airlines</span> <a href="#" class="offer-link" data-flight="saudia-sv1059">View Flight Details</a></li>
                </ul>
                <p>Would you like me to help you book any of these flights? I can provide you with direct links to airline websites.</p>
            `,
            "What's the cheapest flight from Jeddah to Dubai next week?": `
                <p>I've found the cheapest flights from Jeddah (JED) to Dubai (DXB) for next week:</p>
                <ul>
                    <li><strong>flydubai FZ 638</strong> - Monday - 08:25 to 12:10 - 450 SAR <span class="provider-tag">flydubai</span> <a href="#" class="offer-link" data-flight="flydubai-fz638">View Flight Details</a></li>
                    <li><strong>flynas XY 247</strong> - Tuesday - 14:30 to 18:05 - 420 SAR (Cheapest option) <span class="provider-tag">flynas</span> <a href="#" class="offer-link" data-flight="flynas-xy247">View Flight Details</a></li>
                    <li><strong>Air Arabia G9 332</strong> - Wednesday - 09:15 to 12:50 - 435 SAR <span class="provider-tag">Air Arabia</span> <a href="#" class="offer-link" data-flight="airarabia-g9332">View Flight Details</a></li>
                    <li><strong>flydubai FZ 638</strong> - Thursday - 08:25 to 12:10 - 490 SAR <span class="provider-tag">flydubai</span> <a href="#" class="offer-link" data-flight="flydubai-fz638-thu">View Flight Details</a></li>
                    <li><strong>Emirates EK 804</strong> - Friday - 15:40 to 19:25 - 580 SAR <span class="provider-tag">Emirates</span> <a href="#" class="offer-link" data-flight="emirates-ek804">View Flight Details</a></li>
                </ul>
                <p>The cheapest option is <strong>flynas XY 247</strong> on Tuesday at 420 SAR.</p>
                <p>Would you like more details about any of these flights or help with booking?</p>
            `,
            "Find train from Riyadh to Dammam": `
                <p>Here are the train services available from Riyadh to Dammam:</p>
                <p><strong>Saudi Railways (SAR) Options:</strong></p>
                <ul>
                    <li><strong>Morning Train 2</strong> - 06:45 to 10:20 - 85 SAR (Economy) / 120 SAR (Business) <span class="provider-tag">Saudi Railways</span> <a href="#" class="offer-link" data-train="sar-morning2">View Train Details</a></li>
                    <li><strong>Noon Train 4</strong> - 12:30 to 16:05 - 85 SAR (Economy) / 120 SAR (Business) <span class="provider-tag">Saudi Railways</span> <a href="#" class="offer-link" data-train="sar-noon4">View Train Details</a></li>
                    <li><strong>Evening Train 6</strong> - 18:15 to 21:50 - 85 SAR (Economy) / 120 SAR (Business) <span class="provider-tag">Saudi Railways</span> <a href="#" class="offer-link" data-train="sar-evening6">View Train Details</a></li>
                </ul>
                <p><strong>Train Amenities:</strong></p>
                <ul>
                    <li>Free Wi-Fi onboard</li>
                    <li>Comfortable seating with power outlets</li>
                    <li>Café car with refreshments</li>
                    <li>Luggage storage</li>
                </ul>
                <p>The journey takes approximately 3 hours and 35 minutes, covering a distance of about 450 km. Business class offers wider seats, complimentary meals, and priority boarding.</p>
                <p>Would you like me to help you book tickets for any of these trains?</p>
            `,
        },
        hotels: {
            "Find me hotels in Dubai": `<p>Here are some hotel options in Dubai:</p>
                <ul>
                    <li><strong>Burj Al Arab</strong>: 5-star luxury hotel - $1,200 per night <span class="provider-tag">Jumeirah Group</span> <a href="#" class="offer-link" data-hotel="burj-al-arab">View Hotel Details</a></li>
                    <li><strong>Atlantis, The Palm</strong>: 5-star resort on Palm Jumeirah - $550 per night <span class="provider-tag">Kerzner International</span> <a href="#" class="offer-link" data-hotel="atlantis-palm">View Hotel Details</a></li>
                    <li><strong>Rove Downtown</strong>: 3-star hotel near Dubai Mall - $150 per night <span class="provider-tag">Emaar Hospitality</span> <a href="#" class="offer-link" data-hotel="rove-downtown">View Hotel Details</a></li>
                </ul>
                <p>Would you like more details about any of these hotels?</p>`,
            "I need a hotel in New York": `<p>Here are some hotel options in New York:</p>
                <ul>
                    <li><strong>The Plaza</strong>: 5-star luxury hotel near Central Park - $650 per night <span class="provider-tag">Fairmont Hotels</span> <a href="#" class="offer-link" data-hotel="the-plaza">View Hotel Details</a></li>
                    <li><strong>Marriott Marquis</strong>: 4-star hotel in Times Square - $400 per night <span class="provider-tag">Marriott International</span> <a href="#" class="offer-link" data-hotel="marriott-marquis">View Hotel Details</a></li>
                    <li><strong>Pod 51 Hotel</strong>: 3-star budget hotel in Midtown - $200 per night <span class="provider-tag">Pod Hotels</span> <a href="#" class="offer-link" data-hotel="pod-51">View Hotel Details</a></li>
                </ul>
                <p>Would you like me to help you book a room at any of these hotels?</p>`,
            "Best family-friendly hotels in Jeddah": `
                <p>Here are the best family-friendly hotels in Jeddah:</p>
                <p><strong>1. Waldorf Astoria Jeddah</strong> <span class="provider-tag">Hilton Hotels</span> <a href="#" class="offer-link" data-hotel="waldorf-jeddah">View Hotel Details</a></p>
                <ul>
                    <li><strong>Price:</strong> 850 SAR per night</li>
                    <li><strong>Rating:</strong> 8.7/10 (Excellent)</li>
                    <li><strong>Distance to Beach:</strong> 5-minute walk</li>
                    <li><strong>Family Features:</strong> Kids' pool, family rooms, children's playground</li>
                </ul>
                <p><strong>2. Rosewood Jeddah</strong> <span class="provider-tag">Rosewood Hotels</span> <a href="#" class="offer-link" data-hotel="rosewood-jeddah">View Hotel Details</a></p>
                <ul>
                    <li><strong>Price:</strong> 1,200 SAR per night</li>
                    <li><strong>Rating:</strong> 9.1/10 (Exceptional)</li>
                    <li><strong>Distance to Beach:</strong> Beachfront</li>
                    <li><strong>Family Features:</strong> Kids' club, family suites, children's menu</li>
                </ul>
                <p><strong>3. Park Hyatt Jeddah</strong> <span class="provider-tag">Hyatt Hotels</span> <a href="#" class="offer-link" data-hotel="park-hyatt-jeddah">View Hotel Details</a></p>
                <ul>
                    <li><strong>Price:</strong> 1,100 SAR per night</li>
                    <li><strong>Rating:</strong> 9.0/10 (Excellent)</li>
                    <li><strong>Distance to Beach:</strong> Beachfront</li>
                    <li><strong>Family Features:</strong> Children's pool, family activities, babysitting service</li>
                </ul>
                <p>Would you like more information about any of these properties?</p>
            `,
            "What are the best boutique hotels in Riyadh city center?": `
                <p>Here are some of the best boutique hotels in Riyadh city center:</p>
                <p><strong>1. The Boulevard Arjaan by Rotana</strong></p>
                <ul>
                    <li><strong>Price:</strong> 750 SAR per night</li>
                    <li><strong>Rating:</strong> 8.9/10 (Excellent)</li>
                    <li><strong>Location:</strong> King Fahd Road, city center</li>
                    <li><strong>Style:</strong> Modern luxury with Arabic touches</li>
                </ul>
                <p><strong>2. Centro Olaya by Rotana</strong></p>
                <ul>
                    <li><strong>Price:</strong> 650 SAR per night</li>
                    <li><strong>Rating:</strong> 8.7/10 (Excellent)</li>
                    <li><strong>Location:</strong> Olaya District, near Kingdom Tower</li>
                    <li><strong>Style:</strong> Contemporary minimalist design</li>
                </ul>
                <p><strong>3. Vivienda Residence</strong></p>
                <ul>
                    <li><strong>Price:</strong> 800 SAR per night</li>
                    <li><strong>Rating:</strong> 9.0/10 (Excellent)</li>
                    <li><strong>Location:</strong> Al Olaya, near business district</li>
                    <li><strong>Style:</strong> Elegant boutique with personalized service</li>
                </ul>
                <p>Would you like more details about amenities, room types, or booking information?</p>
            `
        },
        packages: {
            default: "I can help you design a custom travel package based on your budget. What's your destination, trip duration, and approximate budget?",
            "Plan a 5-day trip to Dubai with a budget of $1500": `
                <p>Here's a 5-day Dubai trip plan with a $1500 budget:</p>
                <p><strong>Travel & Accommodation ($900):</strong></p>
                <ul>
                    <li><strong>Flights:</strong> Round-trip with flydubai - $350</li>
                    <li><strong>Hotel:</strong> Rove Downtown (3-star) - 4 nights - $550</li>
                </ul>
                <p><strong>Activities & Tours ($400):</strong></p>
                <ul>
                    <li><strong>Day 1:</strong> Old Dubai tour & Gold Souk - $50</li>
                    <li><strong>Day 2:</strong> Burj Khalifa visit & Dubai Mall - $100</li>
                    <li><strong>Day 3:</strong> Desert Safari experience - $120</li>
                    <li><strong>Day 4:</strong> Day at Aquaventure Waterpark - $80</li>
                    <li><strong>Day 5:</strong> Palm Jumeirah & Marina visit - $50</li>
                </ul>
                <p><strong>Transportation & Food ($200):</strong></p>
                <ul>
                    <li><strong>Transport:</strong> 5-day metro pass + some taxi rides - $100</li>
                    <li><strong>Food:</strong> Mix of local and international restaurants - $100</li>
                </ul>
                <p>Would you like to modify any part of this plan? I can provide more options or adjust the budget according to your needs.</p>
            `,
            "What's the best family vacation package for Bali under $3000?": `
                <p>Here's a family-friendly Bali vacation package for 4 people (2 adults, 2 children) under $3000:</p>
                <p><strong>Travel & Accommodation ($1800):</strong></p>
                <ul>
                    <li><strong>Flights:</strong> Round-trip economy tickets - $1200 total</li>
                    <li><strong>Hotel:</strong> Bali Dynasty Resort (family-friendly) - 6 nights - $600</li>
                </ul>
                <p><strong>Activities & Experiences ($700):</strong></p>
                <ul>
                    <li><strong>Waterbom Bali:</strong> Water park day pass for family - $150</li>
                    <li><strong>Bali Safari & Marine Park:</strong> Full-day family experience - $180</li>
                    <li><strong>Ubud Day Trip:</strong> Monkey Forest, Rice Terraces & local village - $120</li>
                    <li><strong>Uluwatu Temple & Kecak Dance:</strong> Cultural evening - $100</li>
                    <li><strong>Beach Club Day:</strong> Family day at Finn's Beach Club - $150</li>
                </ul>
                <p><strong>Transportation & Meals ($500):</strong></p>
                <ul>
                    <li><strong>Private driver:</strong> For 3 days of exploration - $150</li>
                    <li><strong>Airport transfers:</strong> Round-trip - $50</li>
                    <li><strong>Meals:</strong> Mix of hotel dining and local restaurants - $300</li>
                </ul>
                <p>This package includes family-friendly accommodations with a kids' club, pool with water slides, and activities suitable for all ages. Would you like me to customize any aspect of this package?</p>
            `,
            "Create a luxury weekend getaway to Jeddah for 2 people": `
                <p>Here's a luxury weekend getaway to Jeddah for 2 people:</p>
                <p><strong>Accommodation ($800):</strong></p>
                <ul>
                    <li><strong>Hotel:</strong> Waldorf Astoria Jeddah - Qasr Al Sharq - 2 nights in a Junior Suite with sea view</li>
                    <li>Includes: Welcome amenities, breakfast, and access to spa facilities</li>
                </ul>
                <p><strong>Dining Experiences ($400):</strong></p>
                <ul>
                    <li><strong>Friday Evening:</strong> Fine dining at Aromi Restaurant - Italian cuisine with seafood specialties</li>
                    <li><strong>Saturday Lunch:</strong> Beachfront dining at Byblos Sur Mer - Lebanese cuisine</li>
                    <li><strong>Saturday Evening:</strong> Private dinner on the hotel terrace with personalized menu</li>
                </ul>
                <p><strong>Activities & Experiences ($600):</strong></p>
                <ul>
                    <li><strong>Private city tour:</strong> Historical Jeddah (Al-Balad), Corniche, and King Fahd Fountain</li>
                    <li><strong>Couples spa treatment:</strong> 90-minute signature massage at the hotel spa</li>
                    <li><strong>Luxury yacht cruise:</strong> 3-hour private sunset cruise along the Red Sea coast</li>
                    <li><strong>VIP shopping experience:</strong> Personal shopper at Red Sea Mall</li>
                </ul>
                <p><strong>Transportation ($200):</strong></p>
                <ul>
                    <li>Private luxury car with driver for the entire weekend</li>
                </ul>
                <p>Total package: Approximately $2000 for an unforgettable luxury weekend in Jeddah. Would you like me to make any adjustments to this package?</p>
            `
        },
        cars: {
            default: "I can help you find the perfect rental car. What's your destination, rental dates, and preferred car type?",
            "I need an SUV in Dubai for 5 days starting next Friday": `
                <p>Here are some SUV options available in Dubai for 5 days starting next Friday:</p>
                <p><strong>Standard SUVs:</strong></p>
                <ul>
                    <li><strong>Toyota RAV4</strong> - $65/day ($325 total) <span class="provider-tag">Hertz</span> <a href="#" class="offer-link" data-car="hertz-rav4">View Rental Details</a></li>
                    <li><strong>Nissan X-Trail</strong> - $60/day ($300 total) <span class="provider-tag">Avis</span> <a href="#" class="offer-link" data-car="avis-xtrail">View Rental Details</a></li>
                    <li><strong>Hyundai Tucson</strong> - $55/day ($275 total) <span class="provider-tag">Budget</span> <a href="#" class="offer-link" data-car="budget-tucson">View Rental Details</a></li>
                </ul>
                <p><strong>Mid-Size SUVs:</strong></p>
                <ul>
                    <li><strong>Ford Explorer</strong> - $85/day ($425 total) <span class="provider-tag">Europcar</span> <a href="#" class="offer-link" data-car="europcar-explorer">View Rental Details</a></li>
                    <li><strong>Jeep Grand Cherokee</strong> - $90/day ($450 total) <span class="provider-tag">Thrifty</span> <a href="#" class="offer-link" data-car="thrifty-cherokee">View Rental Details</a></li>
                </ul>
                <p><strong>Luxury SUVs:</strong></p>
                <ul>
                    <li><strong>Range Rover Sport</strong> - $150/day ($750 total) <span class="provider-tag">Sixt</span> <a href="#" class="offer-link" data-car="sixt-rangerover">View Rental Details</a></li>
                    <li><strong>BMW X5</strong> - $140/day ($700 total) <span class="provider-tag">Enterprise</span> <a href="#" class="offer-link" data-car="enterprise-bmwx5">View Rental Details</a></li>
                </ul>
                <p>All options include basic insurance, unlimited mileage, and 24/7 roadside assistance. Would you like more details about any of these vehicles or help with the booking process?</p>
            `,
            "What's the cheapest compact car available in Riyadh this weekend?": `
                <p>Here are the most affordable compact cars available in Riyadh this weekend:</p>
                <p><strong>Economy/Compact Options (Lowest to Highest):</strong></p>
                <ul>
                    <li><strong>Kia Picanto</strong> - 120 SAR/day <span class="provider-tag">Budget Car Rental</span> <a href="#" class="offer-link" data-car="budget-picanto">View Rental Details</a></li>
                    <li><strong>Hyundai i10</strong> - 130 SAR/day <span class="provider-tag">Hanco</span> <a href="#" class="offer-link" data-car="hanco-i10">View Rental Details</a></li>
                    <li><strong>Toyota Yaris</strong> - 140 SAR/day <span class="provider-tag">Theeb Rent a Car</span> <a href="#" class="offer-link" data-car="theeb-yaris">View Rental Details</a></li>
                    <li><strong>Nissan Sunny</strong> - 150 SAR/day <span class="provider-tag">Key Rent a Car</span> <a href="#" class="offer-link" data-car="key-sunny">View Rental Details</a></li>
                    <li><strong>Chevrolet Spark</strong> - 155 SAR/day <span class="provider-tag">Avis</span> <a href="#" class="offer-link" data-car="avis-spark">View Rental Details</a></li>
                </ul>
                <p><strong>Special Weekend Offers:</strong></p>
                <ul>
                    <li>Budget Car Rental is offering a 15% discount on 2-day rentals</li>
                    <li>Hanco has a weekend special that includes free GPS navigation</li>
                </ul>
                <p>The <strong>Kia Picanto from Budget</strong> at 120 SAR/day is currently the cheapest option available. With the weekend discount, you would pay approximately 204 SAR for the entire weekend.</p>
                <p>Would you like me to provide more details or help you with the reservation?</p>
            `,
            "Find a luxury car rental in Jeddah with unlimited mileage": `
                <p>Here are luxury car rental options in Jeddah with unlimited mileage:</p>
                <p><strong>Luxury Sedans:</strong></p>
                <ul>
                    <li><strong>Mercedes-Benz E-Class</strong> - 650 SAR/day <span class="provider-tag">Sixt Premium</span> <a href="#" class="offer-link" data-car="sixt-eclass">View Rental Details</a></li>
                    <li><strong>BMW 5 Series</strong> - 600 SAR/day <span class="provider-tag">Hertz Prestige Collection</span> <a href="#" class="offer-link" data-car="hertz-bmw5">View Rental Details</a></li>
                    <li><strong>Audi A6</strong> - 580 SAR/day <span class="provider-tag">Enterprise Exotic Cars</span> <a href="#" class="offer-link" data-car="enterprise-audia6">View Rental Details</a></li>
                </ul>
                <p><strong>Luxury SUVs:</strong></p>
                <ul>
                    <li><strong>Range Rover Vogue</strong> - 950 SAR/day <span class="provider-tag">Hanco VIP</span> <a href="#" class="offer-link" data-car="hanco-rangerover">View Rental Details</a></li>
                    <li><strong>Mercedes-Benz GLE</strong> - 850 SAR/day <span class="provider-tag">Budget Signature Series</span> <a href="#" class="offer-link" data-car="budget-gle">View Rental Details</a></li>
                    <li><strong>BMW X7</strong> - 900 SAR/day <span class="provider-tag">Theeb Luxury Fleet</span> <a href="#" class="offer-link" data-car="theeb-x7">View Rental Details</a></li>
                </ul>
                <p><strong>Sports & Convertibles:</strong></p>
                <ul>
                    <li><strong>Porsche 911</strong> - 1,500 SAR/day <span class="provider-tag">Sixt Exclusive</span> <a href="#" class="offer-link" data-car="sixt-porsche911">View Rental Details</a></li>
                    <li><strong>Mercedes-Benz SL</strong> - 1,200 SAR/day <span class="provider-tag">Hertz Dream Collection</span> <a href="#" class="offer-link" data-car="hertz-sl">View Rental Details</a></li>
                </ul>
                <p>All these options include:</p>
                <ul>
                    <li>Unlimited mileage with no restrictions</li>
                    <li>Comprehensive insurance coverage</li>
                    <li>24/7 premium roadside assistance</li>
                    <li>Free delivery to your hotel or residence in Jeddah</li>
                </ul>
                <p>Would you like more information about any of these vehicles or assistance with booking?</p>
            `
        }
    };
    
    // Functions
    function startNewChat() {
        welcomeScreen.classList.add('active');
        chatMessages.innerHTML = '';
        conversationActive = false;
    }
    
    function setConversationType(type) {
        currentConversationType = type;
        
        // Update UI to reflect selected type
        conversationTypes.forEach(item => {
            if (item.dataset.type === type) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    function startConversation(type, initialPrompt = null) {
        welcomeScreen.classList.remove('active');
        chatMessages.innerHTML = '';
        conversationActive = true;
        setConversationType(type);
        
        // Show typing indicator first
        typingIndicator.classList.add('active');
        
        // Add initial AI message after a short delay to show typing
        setTimeout(() => {
            // Get appropriate message based on language
            const initialMessage = currentLanguage === 'en' 
                ? sampleResponses[type].default 
                : arSampleResponses[type].default;
                
            // Hide typing indicator and add message
            typingIndicator.classList.remove('active');
            addMessage('AI', initialMessage);
            
            // If there's an initial prompt, process it
            if (initialPrompt) {
                setTimeout(() => {
                    addMessage('Human', initialPrompt);
                    processUserInput(initialPrompt);
                }, 800);
            }
        }, 1200);
    }
    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender.toLowerCase()}`;
        
        // Create avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        
        // Set avatar based on sender
        if (sender === 'AI') {
            avatarDiv.innerHTML = `
                <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="15" cy="15" r="15" fill="#10a37f"/>
                    <path d="M8,15 L22,15 M15,8 L15,22" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
            `;
        } else {
            avatarDiv.innerHTML = `
                <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="15" cy="15" r="15" fill="#343541"/>
                    <circle cx="15" cy="10" r="5" fill="#6e6e80"/>
                    <path d="M15,16 C9,16 7,20 7,24 L23,24 C23,20 21,16 15,16 Z" fill="#6e6e80"/>
                </svg>
            `;
        }
        
        // Create message content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Create message header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'message-header';
        
        // Set sender name based on language
        const senderDiv = document.createElement('div');
        senderDiv.className = 'message-sender';
        
        if (sender === 'AI') {
            senderDiv.textContent = currentLanguage === 'ar' ? 'رحلة' : 'Rahalah';
        } else {
            senderDiv.textContent = currentLanguage === 'ar' ? 'أنت' : 'You';
        }
        
        // Add time
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        const now = new Date();
        timeDiv.textContent = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // Add sender and time to header
        headerDiv.appendChild(senderDiv);
        headerDiv.appendChild(timeDiv);
        
        // Add header to content
        contentDiv.appendChild(headerDiv);
        
        // Create message text
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.innerHTML = text;
        contentDiv.appendChild(textDiv);
        
        // Add View Offers button for AI responses that contain search results
        if (sender === 'AI' && 
            (text.includes('<ul>') || text.includes('<p><strong>')) && 
            !text.includes('view-offers-btn')) {
            
            // Create the button with appropriate text based on conversation type
            const viewOffersBtn = document.createElement('a');
            viewOffersBtn.className = 'view-offers-btn';
            viewOffersBtn.href = '#';
            
            // Set button text and icon based on conversation type
            let buttonText = 'View All Offers';
            let iconClass = 'fas fa-external-link-alt';
            
            switch(currentConversationType) {
                case 'flights':
                    buttonText = 'View Flight Options';
                    iconClass = 'fas fa-plane';
                    break;
                case 'hotels':
                    buttonText = 'Browse Hotels';
                    iconClass = 'fas fa-hotel';
                    break;
                case 'cars':
                    buttonText = 'Compare Car Rentals';
                    iconClass = 'fas fa-car';
                    break;
                case 'packages':
                    buttonText = 'Explore Packages';
                    iconClass = 'fas fa-suitcase';
                    break;
            }
            
            viewOffersBtn.innerHTML = `<i class="${iconClass}"></i> ${buttonText}`;
            
            // Add click event to simulate navigation to offers page
            viewOffersBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Show a message that this would navigate to a real page in a production app
                addMessage('AI', `In a production version, this button would take you to a dedicated page showing all available ${currentConversationType} offers with filtering options, booking capabilities, and payment processing.`);
            });
            
            contentDiv.appendChild(viewOffersBtn);
        }
        
        // Add avatar and content to message
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        // Add message to chat
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function processUserInput(text) {
        // Show typing indicator
        typingIndicator.classList.add('active');
        
        // For demo purposes, we'll use predefined responses
        // Calculate response time based on text length (more realistic)
        const thinkingTime = Math.min(1000 + text.length * 20, 3000);
        
        setTimeout(() => {
            let response;
            
            // Check if we have a specific response for this input
            if (sampleResponses[currentConversationType][text]) {
                response = sampleResponses[currentConversationType][text];
            } else {
                // Generate a generic response based on the input
                if (currentConversationType === 'flights') {
                    if (currentLanguage === 'ar') {
                        response = `سأبحث عن رحلات تطابق "${text}". يرجى ملاحظة أن هذا عرض توضيحي، لذلك أعرض ردودًا نموذجية. في التطبيق الحقيقي، سأتصل بواجهات برمجة تطبيقات الرحلات للحصول على بيانات في الوقت الفعلي.`;
                    } else {
                        response = `I'll search for flights matching "${text}". Please note that this is a demo, so I'm showing sample responses. In a real application, I would connect to flight APIs to get real-time data.`;
                    }
                } else if (currentConversationType === 'hotels') {
                    if (currentLanguage === 'ar') {
                        response = `سأبحث عن فنادق تطابق "${text}". يرجى ملاحظة أن هذا عرض توضيحي، لذلك أعرض ردودًا نموذجية. في التطبيق الحقيقي، سأتصل بواجهات برمجة تطبيقات الفنادق للحصول على بيانات في الوقت الفعلي.`;
                    } else {
                        response = `I'll search for hotels matching "${text}". Please note that this is a demo, so I'm showing sample responses. In a real application, I would connect to hotel APIs to get real-time data.`;
                    }
                } else if (currentConversationType === 'cars') {
                    if (currentLanguage === 'ar') {
                        response = `سأبحث عن سيارات للإيجار تطابق "${text}". يرجى ملاحظة أن هذا عرض توضيحي، لذلك أعرض ردودًا نموذجية. في التطبيق الحقيقي، سأتصل بواجهات برمجة تطبيقات تأجير السيارات للحصول على بيانات في الوقت الفعلي.`;
                    } else {
                        response = `I'll search for car rentals matching "${text}". Please note that this is a demo, so I'm showing sample responses. In a real application, I would connect to car rental APIs to get real-time data.`;
                    }
                } else if (currentConversationType === 'packages') {
                    if (currentLanguage === 'ar') {
                        response = `سأبحث عن باقات سفر تطابق "${text}". يرجى ملاحظة أن هذا عرض توضيحي، لذلك أعرض ردودًا نموذجية. في التطبيق الحقيقي، سأتصل بواجهات برمجة تطبيقات السفر للحصول على بيانات في الوقت الفعلي.`;
                    } else {
                        response = `I'll search for travel packages matching "${text}". Please note that this is a demo, so I'm showing sample responses. In a real application, I would connect to travel package APIs to get real-time data.`;
                    }
                }
            }
            
            // Hide typing indicator and add the message
            typingIndicator.classList.remove('active');
            addMessage('AI', response);
        }, thinkingTime);
    }
    
    // Language Functions
    function setLanguage(lang) {
        currentLanguage = lang;
        
        if (lang === 'ar') {
            document.body.classList.add('rtl');
            userInput.placeholder = userInput.dataset.arPlaceholder;
        } else {
            document.body.classList.remove('rtl');
            userInput.placeholder = 'Message Rahalah...';
        }
        
        // Update language buttons
        langButtons.forEach(btn => {
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update AI messages to use the correct language
        document.querySelectorAll('.message.ai').forEach(msg => {
            const messageText = msg.querySelector('.message-text');
            const senderName = msg.querySelector('.message-sender');
            
            if (lang === 'ar') {
                senderName.textContent = 'رحلة';
            } else {
                senderName.textContent = 'Rahalah';
            }
        });
    }
    
    // Event Listeners
    newChatBtn.addEventListener('click', startNewChat);
    newChatBtnAr.addEventListener('click', startNewChat);
    
    // Language toggle
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            setLanguage(lang);
        });
    });
    
    conversationTypes.forEach(item => {
        item.addEventListener('click', () => {
            const type = item.dataset.type;
            if (conversationActive) {
                setConversationType(type);
            } else {
                startConversation(type);
            }
        });
    });
    
    optionCards.forEach(card => {
        card.addEventListener('click', () => {
            const type = card.dataset.type;
            startConversation(type);
        });
    });
    
    examplePrompts.forEach(prompt => {
        prompt.addEventListener('click', () => {
            const promptText = prompt.dataset.prompt;
            const type = prompt.closest('.option-card').dataset.type;
            startConversation(type, promptText);
        });
    });
    
    sendBtn.addEventListener('click', () => {
        const text = userInput.value.trim();
        if (text) {
            if (!conversationActive) {
                startConversation(currentConversationType);
            }
            
            addMessage('Human', text);
            processUserInput(text);
            userInput.value = '';
        }
    });
    
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendBtn.click();
        }
    });
    

    
    // Auto-resize textarea as user types
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = (userInput.scrollHeight) + 'px';
    });
});
