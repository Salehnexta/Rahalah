/**
 * Rahalah Authentication Test Page
 * This script handles user registration, login, and authentication testing with Supabase
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const userProfile = document.getElementById('user-profile');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const configPanel = document.getElementById('config-panel');
    const debugPanel = document.getElementById('debug-panel');
    const debugConsole = document.getElementById('debug-console');
    
    // Form Elements
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const registerName = document.getElementById('register-name');
    const registerEmail = document.getElementById('register-email');
    const registerPassword = document.getElementById('register-password');
    const termsCheckbox = document.getElementById('terms-checkbox');
    
    // Button Elements
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const mainAppBtn = document.getElementById('main-app-btn');
    const saveConfigBtn = document.getElementById('save-config-btn');
    const connectBtn = document.getElementById('connect-btn');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const facebookLoginBtn = document.getElementById('facebook-login-btn');
    const googleRegisterBtn = document.getElementById('google-register-btn');
    const facebookRegisterBtn = document.getElementById('facebook-register-btn');
    const debugClearStorage = document.getElementById('debug-clear-storage');
    const debugTestApi = document.getElementById('debug-test-api');
    
    // Status Elements
    const loginStatus = document.getElementById('login-status');
    const registerStatus = document.getElementById('register-status');
    const connectionIndicator = document.getElementById('connection-indicator');
    const connectionText = document.getElementById('connection-text');
    const authDebugInfo = document.getElementById('auth-debug-info');
    
    // Supabase client
    let supabaseClient = null;
    let currentUser = null;
    
    // Initialize the app
    init();
    
    function init() {
        // Load saved configuration if available
        loadSavedConfig();
        
        // Add event listeners
        setupEventListeners();
        
        // Check for pre-filled credentials
        const supabaseUrlInput = document.getElementById('supabase-url');
        const supabaseKeyInput = document.getElementById('supabase-key');
        
        if (supabaseUrlInput.value && supabaseKeyInput.value) {
            // Save the pre-filled credentials
            localStorage.setItem('supabase_url', supabaseUrlInput.value);
            localStorage.setItem('supabase_key', supabaseKeyInput.value);
            
            // Initialize Supabase with pre-filled credentials
            initializeSupabase(supabaseUrlInput.value, supabaseKeyInput.value);
            configPanel.style.display = 'none';
        }
        // If no pre-filled credentials, check localStorage
        else if (localStorage.getItem('supabase_url') && localStorage.getItem('supabase_key')) {
            initializeSupabase(
                localStorage.getItem('supabase_url'),
                localStorage.getItem('supabase_key')
            );
        }
        // Otherwise show config panel
        else {
            configPanel.style.display = 'block';
        }
    }
    
    function setupEventListeners() {
        // Tab switching
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const tabName = button.getAttribute('data-tab');
                if (tabName === 'login') {
                    loginForm.style.display = 'block';
                    registerForm.style.display = 'none';
                } else if (tabName === 'register') {
                    loginForm.style.display = 'none';
                    registerForm.style.display = 'block';
                }
            });
        });
        
        // Connect button
        connectBtn.addEventListener('click', () => {
            configPanel.style.display = 'block';
        });
        
        // Save configuration
        saveConfigBtn.addEventListener('click', saveConfiguration);
        
        // Login
        loginBtn.addEventListener('click', handleLogin);
        
        // Register
        registerBtn.addEventListener('click', handleRegister);
        termsCheckbox.addEventListener('change', () => {
            registerBtn.disabled = !termsCheckbox.checked;
        });
        
        // Logout
        logoutBtn.addEventListener('click', handleLogout);
        
        // Main app button
        mainAppBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        
        // Social login buttons
        googleLoginBtn.addEventListener('click', () => handleSocialLogin('google'));
        facebookLoginBtn.addEventListener('click', () => handleSocialLogin('facebook'));
        googleRegisterBtn.addEventListener('click', () => handleSocialLogin('google'));
        facebookRegisterBtn.addEventListener('click', () => handleSocialLogin('facebook'));
        
        // Debug panel toggle (Ctrl+D)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                debugPanel.classList.toggle('open');
            }
        });
        
        document.querySelector('.debug-header').addEventListener('click', () => {
            debugPanel.classList.toggle('open');
        });
        
        // Debug actions
        debugClearStorage.addEventListener('click', () => {
            localStorage.removeItem('supabase_url');
            localStorage.removeItem('supabase_key');
            logDebug('Local storage cleared', 'info');
        });
        
        debugTestApi.addEventListener('click', testApiConnection);
    }
    
    function loadSavedConfig() {
        const supabaseUrl = localStorage.getItem('supabase_url');
        const supabaseKey = localStorage.getItem('supabase_key');
        
        if (supabaseUrl) {
            document.getElementById('supabase-url').value = supabaseUrl;
        }
        
        if (supabaseKey) {
            document.getElementById('supabase-key').value = supabaseKey;
        }
    }
    
    function saveConfiguration() {
        const supabaseUrl = document.getElementById('supabase-url').value.trim();
        const supabaseKey = document.getElementById('supabase-key').value.trim();
        
        if (!supabaseUrl || !supabaseKey) {
            logDebug('Please provide both URL and API key', 'error');
            return;
        }
        
        localStorage.setItem('supabase_url', supabaseUrl);
        localStorage.setItem('supabase_key', supabaseKey);
        
        // Initialize Supabase with new config
        initializeSupabase(supabaseUrl, supabaseKey);
        
        configPanel.style.display = 'none';
        logDebug('Configuration saved', 'info');
    }
    
    function initializeSupabase(url, key) {
        try {
            // Check if the Supabase library is loaded
            if (typeof supabase === 'undefined') {
                updateConnectionStatus(false, 'Supabase library not loaded');
                logDebug('Supabase JS library not found. Make sure it is properly included.', 'error');
                return;
            }
            
            // Create supabase client
            supabaseClient = supabase.createClient(url, key);
            
            // Check for existing session
            checkSession();
            
            // Set up auth state listener
            supabaseClient.auth.onAuthStateChange((event, session) => {
                logDebug(`Auth state changed: ${event}`, 'info');
                
                if (event === 'SIGNED_IN') {
                    updateUserProfile(session.user);
                    showUserProfile();
                } else if (event === 'SIGNED_OUT') {
                    hideUserProfile();
                }
                
                updateAuthDebugInfo(session);
            });
            
            updateConnectionStatus(true, 'Connected to Supabase');
            logDebug('Supabase client initialized successfully', 'info');
            
        } catch (error) {
            updateConnectionStatus(false, 'Connection failed');
            logDebug(`Failed to initialize Supabase: ${error.message}`, 'error');
        }
    }
    
    async function checkSession() {
        try {
            const { data, error } = await supabaseClient.auth.getSession();
            
            if (error) {
                throw error;
            }
            
            if (data.session) {
                currentUser = data.session.user;
                updateUserProfile(currentUser);
                showUserProfile();
                updateConnectionStatus(true, 'Authenticated');
                updateAuthDebugInfo(data.session);
            }
        } catch (error) {
            logDebug(`Session check failed: ${error.message}`, 'error');
        }
    }
    
    async function handleLogin() {
        if (!supabaseClient) {
            showLoginMessage('Please connect to Supabase first.', 'error');
            return;
        }
        
        const email = loginEmail.value.trim();
        const password = loginPassword.value;
        
        if (!email || !password) {
            showLoginMessage('Please enter both email and password.', 'error');
            return;
        }
        
        try {
            showLoginMessage('Signing in...', 'info');
            
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) throw error;
            
            currentUser = data.user;
            showLoginMessage('Login successful!', 'success');
            
            // Show user profile after successful login
            updateUserProfile(currentUser);
            showUserProfile();
            
        } catch (error) {
            showLoginMessage(`Login failed: ${error.message}`, 'error');
            logDebug(`Login error: ${error.message}`, 'error');
        }
    }
    
    async function handleRegister() {
        if (!supabaseClient) {
            showRegisterMessage('Please connect to Supabase first.', 'error');
            return;
        }
        
        const name = registerName.value.trim();
        const email = registerEmail.value.trim();
        const password = registerPassword.value;
        
        if (!name || !email || !password) {
            showRegisterMessage('Please fill in all fields.', 'error');
            return;
        }
        
        if (password.length < 8) {
            showRegisterMessage('Password must be at least 8 characters.', 'error');
            return;
        }
        
        try {
            showRegisterMessage('Creating account...', 'info');
            
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            });
            
            if (error) throw error;
            
            showRegisterMessage(
                'Registration successful! Check your email for verification instructions.', 
                'success'
            );
            
            // Create user profile in database
            if (data.user) {
                try {
                    const { error: profileError } = await supabaseClient
                        .from('user_profiles')
                        .insert({
                            user_id: data.user.id,
                            full_name: name,
                            email: email,
                            preferences: {}
                        });
                    
                    if (profileError) {
                        logDebug(`Failed to create profile: ${profileError.message}`, 'error');
                    }
                } catch (profileError) {
                    logDebug(`Profile creation error: ${profileError.message}`, 'error');
                }
            }
            
        } catch (error) {
            showRegisterMessage(`Registration failed: ${error.message}`, 'error');
            logDebug(`Registration error: ${error.message}`, 'error');
        }
    }
    
    async function handleLogout() {
        if (!supabaseClient) return;
        
        try {
            const { error } = await supabaseClient.auth.signOut();
            
            if (error) throw error;
            
            currentUser = null;
            hideUserProfile();
            
            // Switch to login tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabButtons[0].classList.add('active');
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            
            logDebug('User signed out', 'info');
            
        } catch (error) {
            logDebug(`Logout error: ${error.message}`, 'error');
        }
    }
    
    async function handleSocialLogin(provider) {
        if (!supabaseClient) {
            showLoginMessage('Please connect to Supabase first.', 'error');
            return;
        }
        
        try {
            const { data, error } = await supabaseClient.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/auth-callback.html`
                }
            });
            
            if (error) throw error;
            
            logDebug(`Redirecting to ${provider} login...`, 'info');
            
        } catch (error) {
            showLoginMessage(`Social login failed: ${error.message}`, 'error');
            logDebug(`Social login error: ${error.message}`, 'error');
        }
    }
    
    async function testApiConnection() {
        if (!supabaseClient) {
            logDebug('No Supabase connection', 'error');
            return;
        }
        
        try {
            logDebug('Testing API connection...', 'info');
            
            // Try to fetch some data from a table
            const { data, error } = await supabaseClient
                .from('user_profiles')
                .select('count')
                .limit(1);
            
            if (error) throw error;
            
            logDebug('API connection successful', 'info');
            
        } catch (error) {
            logDebug(`API test failed: ${error.message}`, 'error');
        }
    }
    
    function showUserProfile() {
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        userProfile.style.display = 'block';
        
        // Hide tab buttons
        document.querySelector('.tabs').style.display = 'none';
    }
    
    function hideUserProfile() {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        userProfile.style.display = 'none';
        
        // Show tab buttons
        document.querySelector('.tabs').style.display = 'flex';
    }
    
    function updateUserProfile(user) {
        if (!user) return;
        
        // Set name and email
        document.getElementById('profile-name').textContent = user.user_metadata?.full_name || 'User';
        document.getElementById('profile-email').textContent = user.email;
        
        // Set avatar (initials)
        const initials = (user.user_metadata?.full_name || user.email[0]).charAt(0).toUpperCase();
        document.getElementById('user-avatar').textContent = initials;
        
        // Set user details
        document.getElementById('profile-id').textContent = user.id;
        document.getElementById('profile-created').textContent = new Date(user.created_at).toLocaleString();
        document.getElementById('profile-last-signin').textContent = new Date(user.last_sign_in_at).toLocaleString();
    }
    
    function updateConnectionStatus(connected, message) {
        if (connected) {
            connectionIndicator.className = 'connected';
            connectionText.textContent = message || 'Connected';
            connectBtn.style.display = 'none';
        } else {
            connectionIndicator.className = 'disconnected';
            connectionText.textContent = message || 'Disconnected';
            connectBtn.style.display = 'inline-block';
        }
    }
    
    function updateAuthDebugInfo(session) {
        if (!session) {
            authDebugInfo.textContent = 'Not authenticated';
            return;
        }
        
        const debugInfo = {
            userId: session.user.id,
            email: session.user.email,
            lastSignIn: session.user.last_sign_in_at,
            metadata: session.user.user_metadata,
            expiresAt: new Date(session.expires_at * 1000).toLocaleString()
        };
        
        authDebugInfo.textContent = JSON.stringify(debugInfo, null, 2);
    }
    
    function showLoginMessage(message, type) {
        loginStatus.textContent = message;
        loginStatus.className = `status-message ${type}`;
        
        if (type !== 'info') {
            setTimeout(() => {
                loginStatus.className = 'status-message';
            }, 5000);
        }
    }
    
    function showRegisterMessage(message, type) {
        registerStatus.textContent = message;
        registerStatus.className = `status-message ${type}`;
        
        if (type !== 'info') {
            setTimeout(() => {
                registerStatus.className = 'status-message';
            }, 5000);
        }
    }
    
    function logDebug(message, type = 'log') {
        const logElement = document.createElement('div');
        logElement.className = `log ${type}`;
        logElement.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        
        debugConsole.appendChild(logElement);
        debugConsole.scrollTop = debugConsole.scrollHeight;
        
        console[type] ? console[type](message) : console.log(message);
    }
});
