/**
 * Sequential Thinking Module for Rahalah Travel App
 * Implements a structured conversation flow for travel planning
 * Integrated with Supabase for user data persistence
 */

const SequentialThinking = {
    // Current conversation state
    state: {
        currentService: null, // 'flights', 'hotels', 'cars', 'trains'
        currentStep: 0,
        answers: {},
        completed: false
    },
    
    // User data
    userData: null,

    // Conversation flows for different services
    conversationFlows: {
        flights: [
            { question: "Where would you like to depart from?", key: "origin" },
            { question: "Where would you like to go?", key: "destination" },
            { question: "When would you like to travel?", key: "departDate" },
            { 
                question: "Will this be a one-way or round trip?", 
                key: "tripType",
                options: ["One-way", "Round trip"]
            },
            { 
                question: "When would you like to return?", 
                key: "returnDate",
                condition: (answers) => answers.tripType === "Round trip"
            },
            { question: "How many travelers will be joining?", key: "travelers" }
        ],
        
        hotels: [
            { question: "Which city are you looking for accommodation in?", key: "city" },
            { question: "What is your check-in date?", key: "checkIn" },
            { question: "What is your check-out date?", key: "checkOut" },
            { question: "How many guests will be staying?", key: "guests" },
            { 
                question: "Do you have any preferences for hotel amenities?", 
                key: "amenities",
                options: ["Pool", "Gym", "Free breakfast", "Free WiFi", "No preference"]
            },
            { 
                question: "What's your budget range per night?", 
                key: "budget",
                options: ["Budget", "Mid-range", "Luxury"]
            }
        ],
        
        cars: [
            { question: "In which city do you need a rental car?", key: "city" },
            { question: "What is your pick-up date?", key: "pickupDate" },
            { question: "What is your return date?", key: "returnDate" },
            { 
                question: "What type of vehicle are you looking for?", 
                key: "carType",
                options: ["Economy", "Mid-size", "SUV", "Luxury", "Sports"]
            },
            { question: "Do you have a preferred car rental company?", key: "company" }
        ],
        
        trains: [
            { question: "What is your departure city?", key: "origin" },
            { question: "What is your destination city?", key: "destination" },
            { question: "When would you like to travel?", key: "departDate" },
            { 
                question: "Do you have a preferred class of service?", 
                key: "class",
                options: ["Economy", "Business", "First Class"]
            },
            { question: "How many passengers will be traveling?", key: "passengers" }
        ]
    },
    
    // Initialize the conversation for a specific service
    startConversation: function(service) {
        this.state = {
            currentService: service,
            currentStep: 0,
            answers: {},
            completed: false
        };
        
        return this.getNextQuestion();
    },
    
    // Process user response and get next question
    processResponse: function(userResponse) {
        const service = this.state.currentService;
        const currentFlow = this.conversationFlows[service];
        const currentQuestion = currentFlow[this.state.currentStep];
        
        // Save the user's answer
        this.state.answers[currentQuestion.key] = userResponse;
        
        // Move to the next step
        this.state.currentStep++;
        
        // Check if we've reached the end of the conversation
        if (this.state.currentStep >= currentFlow.length) {
            this.state.completed = true;
            return this.generateSummary();
        }
        
        // Check if the next question should be skipped based on conditions
        while (
            this.state.currentStep < currentFlow.length && 
            currentFlow[this.state.currentStep].condition && 
            !currentFlow[this.state.currentStep].condition(this.state.answers)
        ) {
            this.state.currentStep++;
        }
        
        // Check again if we've reached the end after skipping conditional questions
        if (this.state.currentStep >= currentFlow.length) {
            this.state.completed = true;
            return this.generateSummary();
        }
        
        return this.getNextQuestion();
    },
    
    // Get the current question to ask the user
    getNextQuestion: function() {
        const service = this.state.currentService;
        const currentFlow = this.conversationFlows[service];
        const currentQuestion = currentFlow[this.state.currentStep];
        
        let response = {
            question: currentQuestion.question,
            options: currentQuestion.options || null,
            step: this.state.currentStep + 1,
            totalSteps: this.getVisibleStepsCount(),
            isLastStep: this.state.currentStep === currentFlow.length - 1
        };
        
        return response;
    },
    
    // Count the number of steps that will be visible based on conditions
    getVisibleStepsCount: function() {
        const service = this.state.currentService;
        const currentFlow = this.conversationFlows[service];
        
        let count = 0;
        for (let i = 0; i < currentFlow.length; i++) {
            if (!currentFlow[i].condition || currentFlow[i].condition(this.state.answers)) {
                count++;
            }
        }
        
        return count;
    },
    
    // Generate a summary of the conversation
    generateSummary: function() {
        const service = this.state.currentService;
        const answers = this.state.answers;
        
        let summary = {
            service: service,
            completed: true,
            details: answers
        };
        
        // If user is authenticated, save the conversation data
        if (this.userData) {
            this.saveConversationData()
                .then(result => {
                    if (result.success) {
                        console.log('Sequential Thinking: Conversation data saved successfully');
                    }
                })
                .catch(error => {
                    console.error('Sequential Thinking: Error saving conversation data', error);
                });
        }
        
        return summary;
    },
    
    // Check if the conversation is in progress
    isConversationActive: function() {
        return this.state.currentService !== null && !this.state.completed;
    },
    
    // Reset the conversation
    resetConversation: function() {
        this.state = {
            currentService: null,
            currentStep: 0,
            answers: {},
            completed: false
        };
    },
    
    // Set user data from authentication
    setUserData: function(user) {
        this.userData = user;
        console.log('Sequential Thinking: User data set', user.id);
    },
    
    // Clear user data on logout
    clearUserData: function() {
        this.userData = null;
    },
    
    // Save conversation data to Supabase
    saveConversationData: async function() {
        if (!this.userData || !this.state.completed) {
            return { success: false, message: 'Cannot save: User not authenticated or conversation not completed' };
        }
        
        try {
            // Use the supabase client to save the data
            const result = await supabase.saveSequentialThinkingData(
                this.state.currentService,
                this.state.answers
            );
            
            console.log('Sequential Thinking: Saved conversation data', result);
            return result;
        } catch (error) {
            console.error('Sequential Thinking: Error saving data', error);
            return { success: false, message: error.message };
        }
    },
    
    // Load conversation history from Supabase
    loadConversationHistory: async function() {
        if (!this.userData) {
            return { success: false, message: 'Cannot load: User not authenticated' };
        }
        
        try {
            // Use the supabase client to load the history
            const result = await supabase.getSequentialThinkingHistory();
            
            console.log('Sequential Thinking: Loaded conversation history', result);
            return result;
        } catch (error) {
            console.error('Sequential Thinking: Error loading history', error);
            return { success: false, message: error.message };
        }
    }
};

// Export the SequentialThinking object
window.SequentialThinking = SequentialThinking;
