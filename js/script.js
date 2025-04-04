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
    
    // State
    let currentConversationType = 'flights'; // Default conversation type
    let conversationActive = false;
    let currentLanguage = 'en'; // Default language
    
    // Arabic sample responses
    const arSampleResponses = {
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
                    <li><strong>flynas XY2103</strong> - 07:15 to 08:25 - 290 SAR</li>
                    <li><strong>Saudia SV1051</strong> - 08:30 to 09:40 - 320 SAR</li>
                    <li><strong>flyadeal F3 1201</strong> - 09:00 to 10:10 - 270 SAR</li>
                </ul>
                <p><strong>Afternoon Flights:</strong></p>
                <ul>
                    <li><strong>Saudia SV1055</strong> - 12:45 to 13:55 - 380 SAR</li>
                    <li><strong>flyadeal F3 1203</strong> - 14:00 to 15:10 - 300 SAR</li>
                </ul>
                <p><strong>Evening Flights:</strong></p>
                <ul>
                    <li><strong>flynas XY2107</strong> - 16:45 to 17:55 - 330 SAR</li>
                    <li><strong>Saudia SV1059</strong> - 18:00 to 19:10 - 420 SAR</li>
                </ul>
                <p>Would you like me to help you book any of these flights? I can provide you with direct links to airline websites.</p>
            `,
            "What's the cheapest flight from Jeddah to Dubai next week?": `
                <p>I've found the cheapest flights from Jeddah (JED) to Dubai (DXB) for next week:</p>
                <ul>
                    <li><strong>flydubai FZ 638</strong> - Monday - 08:25 to 12:10 - 450 SAR</li>
                    <li><strong>flynas XY 247</strong> - Tuesday - 14:30 to 18:05 - 420 SAR (Cheapest option)</li>
                    <li><strong>Air Arabia G9 332</strong> - Wednesday - 09:15 to 12:50 - 435 SAR</li>
                    <li><strong>flydubai FZ 638</strong> - Thursday - 08:25 to 12:10 - 490 SAR</li>
                    <li><strong>Emirates EK 804</strong> - Friday - 15:40 to 19:25 - 580 SAR</li>
                </ul>
                <p>The cheapest option is <strong>flynas XY 247</strong> on Tuesday at 420 SAR.</p>
                <p>Would you like more details about any of these flights or help with booking?</p>
            `,
            "I need a round-trip flight from Riyadh to London in June": `
                <p>I found several round-trip options from Riyadh (RUH) to London (LHR) in June:</p>
                <p><strong>Option 1: British Airways</strong></p>
                <ul>
                    <li><strong>Outbound:</strong> BA 108 - June 10 - 01:35 to 06:40 - Direct</li>
                    <li><strong>Return:</strong> BA 109 - June 17 - 08:55 to 16:45 - Direct</li>
                    <li><strong>Total Price:</strong> 3,850 SAR</li>
                </ul>
                <p><strong>Option 2: Emirates (via Dubai)</strong></p>
                <ul>
                    <li><strong>Outbound:</strong> EK 816 - June 10 - 04:10 to 15:45 - 1 stop</li>
                    <li><strong>Return:</strong> EK 31 - June 17 - 14:30 to 01:20 - 1 stop</li>
                    <li><strong>Total Price:</strong> 3,450 SAR</li>
                </ul>
                <p><strong>Option 3: Turkish Airlines (via Istanbul)</strong></p>
                <ul>
                    <li><strong>Outbound:</strong> TK 145 - June 10 - 02:10 to 12:50 - 1 stop</li>
                    <li><strong>Return:</strong> TK 1980 - June 17 - 16:30 to 04:15 - 1 stop</li>
                    <li><strong>Total Price:</strong> 3,200 SAR (Best value)</li>
                </ul>
                <p>Would you like to adjust the dates or see more options?</p>
            `
        },
        hotels: {
            default: "I can help you find hotels. What's your destination, check-in/check-out dates, and budget?",
            "Find 5-star hotels in Bangkok under $200 per night": `
                <p>Here are some excellent 5-star hotels in Bangkok under $200 per night:</p>
                <p><strong>1. Grande Centre Point Hotel Terminal 21</strong></p>
                <ul>
                    <li><strong>Price:</strong> $180 per night</li>
                    <li><strong>Rating:</strong> 9.1/10 (Exceptional)</li>
                    <li><strong>Location:</strong> Sukhumvit, near Terminal 21 Shopping Mall</li>
                    <li><strong>Amenities:</strong> Outdoor pool, spa, fitness center, free WiFi</li>
                </ul>
                <p><strong>2. Eastin Grand Hotel Sathorn</strong></p>
                <ul>
                    <li><strong>Price:</strong> $165 per night</li>
                    <li><strong>Rating:</strong> 9.3/10 (Exceptional)</li>
                    <li><strong>Location:</strong> Sathorn, direct access to BTS Skytrain</li>
                    <li><strong>Amenities:</strong> Infinity pool, multiple restaurants, fitness center</li>
                </ul>
                <p><strong>3. Shangri-La Bangkok</strong></p>
                <ul>
                    <li><strong>Price:</strong> $195 per night</li>
                    <li><strong>Rating:</strong> 9.2/10 (Exceptional)</li>
                    <li><strong>Location:</strong> Riverside, near Saphan Taksin BTS</li>
                    <li><strong>Amenities:</strong> Riverside pool, spa, 9 dining options, fitness center</li>
                </ul>
                <p>Would you like to know more about any of these hotels or see additional options?</p>
            `,
            "I need a family-friendly hotel in Jeddah near the beach": `
                <p>Here are some excellent family-friendly hotels in Jeddah near the beach:</p>
                <p><strong>1. Jeddah Hilton</strong></p>
                <ul>
                    <li><strong>Price:</strong> 850 SAR per night</li>
                    <li><strong>Rating:</strong> 8.7/10 (Excellent)</li>
                    <li><strong>Distance to Beach:</strong> 5-minute walk</li>
                    <li><strong>Family Features:</strong> Kids' pool, family rooms, children's playground</li>
                </ul>
                <p><strong>2. Rosewood Jeddah</strong></p>
                <ul>
                    <li><strong>Price:</strong> 1,200 SAR per night</li>
                    <li><strong>Rating:</strong> 9.1/10 (Exceptional)</li>
                    <li><strong>Distance to Beach:</strong> Beachfront</li>
                    <li><strong>Family Features:</strong> Kids' club, family suites, children's menu</li>
                </ul>
                <p><strong>3. Park Hyatt Jeddah</strong></p>
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
        
        // Add initial AI message
        const initialMessage = sampleResponses[type].default;
        addMessage('AI', initialMessage);
        
        // If there's an initial prompt, process it
        if (initialPrompt) {
            setTimeout(() => {
                addMessage('Human', initialPrompt);
                processUserInput(initialPrompt);
            }, 500);
        }
    }
    
    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender.toLowerCase()}`;
        
        const avatar = sender === 'AI' ? 'images/ai-avatar.png' : 'images/user-avatar.png';
        let senderName;
        
        if (sender === 'AI') {
            senderName = currentLanguage === 'ar' ? 'رحلة' : 'Rahalah';
        } else {
            senderName = currentLanguage === 'ar' ? 'أنت' : 'You';
        }
        
        const now = new Date();
        const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <img src="${avatar}" alt="${sender} Avatar">
            </div>
            <div class="message-content">
                <div class="message-header">
                    <div class="message-sender">${senderName}</div>
                    <div class="message-time">${time}</div>
                </div>
                <div class="message-text">${text}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function processUserInput(text) {
        // For demo purposes, we'll use predefined responses
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
                } else {
                    if (currentLanguage === 'ar') {
                        response = `سأبحث عن فنادق تطابق "${text}". يرجى ملاحظة أن هذا عرض توضيحي، لذلك أعرض ردودًا نموذجية. في التطبيق الحقيقي، سأتصل بواجهات برمجة تطبيقات الفنادق للحصول على بيانات في الوقت الفعلي.`;
                    } else {
                        response = `I'll search for hotels matching "${text}". Please note that this is a demo, so I'm showing sample responses. In a real application, I would connect to hotel APIs to get real-time data.`;
                    }
                }
            }
            
            addMessage('AI', response);
        }, 1000);
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
