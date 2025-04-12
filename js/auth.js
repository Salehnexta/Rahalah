// Authentication Handler for Rahalah Travel App
document.addEventListener('DOMContentLoaded', function() {
    // Import the Supabase client
    // Make sure the supabase-client.js is loaded before this file
    // DOM Elements
    const loginBtn = document.getElementById('login-btn');
    const loginBtnAr = document.getElementById('login-btn-ar');
    const signupBtn = document.getElementById('signup-btn');
    const signupBtnAr = document.getElementById('signup-btn-ar');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutBtnAr = document.getElementById('logout-btn-ar');
    
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToSignupAr = document.getElementById('switch-to-signup-ar');
    const switchToLogin = document.getElementById('switch-to-login');
    const switchToLoginAr = document.getElementById('switch-to-login-ar');
    
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');
    
    const userProfile = document.getElementById('user-profile');
    const loggedInProfile = document.getElementById('logged-in-profile');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    
    // Add auth.css to the document
    const authStyles = document.createElement('link');
    authStyles.rel = 'stylesheet';
    authStyles.href = 'css/auth.css';
    document.head.appendChild(authStyles);
    
    // Show login modal
    function showLoginModal() {
        loginModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    // Show signup modal
    function showSignupModal() {
        signupModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    // Close modal
    function closeModal() {
        loginModal.style.display = 'none';
        signupModal.style.display = 'none';
        document.body.style.overflow = ''; // Enable scrolling
        
        // Clear form fields and errors
        loginForm.reset();
        signupForm.reset();
        loginError.textContent = '';
        signupError.textContent = '';
    }
    
    // Update UI based on authentication state
    function updateAuthUI(isAuthenticated, user) {
        if (isAuthenticated && user) {
            // Show logged in UI
            document.querySelectorAll('.auth-btn').forEach(btn => {
                btn.style.display = 'none';
            });
            loggedInProfile.style.display = 'block';
            
            // Update user info
            if (user.user_metadata && user.user_metadata.full_name) {
                userName.textContent = user.user_metadata.full_name;
            } else {
                userName.textContent = 'User';
            }
            userEmail.textContent = user.email;
            
            // Enable features that require authentication
            console.log('User authenticated:', user);
        } else {
            // Show logged out UI
            document.querySelectorAll('.auth-btn').forEach(btn => {
                btn.style.display = 'flex';
            });
            loggedInProfile.style.display = 'none';
            
            // Disable features that require authentication
            console.log('User not authenticated');
        }
    }
    
    // Handle login form submission
    async function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        loginError.textContent = '';
        
        try {
            const result = await supabase.login(email, password);
            
            if (result.success) {
                closeModal();
                // The UI will be updated by the onAuthStateChange callback
            } else {
                loginError.textContent = result.message || 'Login failed. Please try again.';
            }
        } catch (error) {
            loginError.textContent = error.message || 'An error occurred during login.';
        }
    }
    
    // Handle signup form submission
    async function handleSignup(e) {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        
        signupError.textContent = '';
        
        // Basic validation
        if (!name || !email || !password || !confirm) {
            signupError.textContent = 'All fields are required.';
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            signupError.textContent = 'Please enter a valid email address.';
            return;
        }
        
        // Validate password length
        if (password.length < 6) {
            signupError.textContent = 'Password must be at least 6 characters long.';
            return;
        }
        
        // Validate password match
        if (password !== confirm) {
            signupError.textContent = 'Passwords do not match.';
            return;
        }
        
        // Show loading state
        const submitBtn = document.querySelector('#signup-form .auth-submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;
        
        try {
            console.log('Attempting to sign up with:', { email, name });
            const result = await supabase.signUp(email, password, name);
            
            if (result.success) {
                closeModal();
                alert(result.message || 'Signup successful! Please check your email for verification.');
            } else {
                signupError.textContent = result.message || 'Signup failed. Please try again.';
            }
        } catch (error) {
            console.error('Signup error:', error);
            signupError.textContent = error.message || 'An error occurred during signup. Please try again later.';
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    // Handle logout
    async function handleLogout() {
        try {
            const result = await supabase.logout();
            
            if (result.success) {
                // The UI will be updated by the onAuthStateChange callback
            } else {
                alert('Logout failed. Please try again.');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    
    // Override the onAuthStateChange method in the SupabaseClient class
    supabase.onAuthStateChange = function(isAuthenticated, user) {
        updateAuthUI(isAuthenticated, user);
        
        // Update Sequential Thinking to use user data if available
        if (window.SequentialThinking && isAuthenticated) {
            SequentialThinking.setUserData(user);
        }
    };
    
    // Event Listeners
    loginBtn.addEventListener('click', showLoginModal);
    loginBtnAr.addEventListener('click', showLoginModal);
    signupBtn.addEventListener('click', showSignupModal);
    signupBtnAr.addEventListener('click', showSignupModal);
    
    logoutBtn.addEventListener('click', handleLogout);
    logoutBtnAr.addEventListener('click', handleLogout);
    
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal || e.target === signupModal) {
            closeModal();
        }
    });
    
    // Switch between login and signup
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
        showSignupModal();
    });
    
    switchToSignupAr.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
        showSignupModal();
    });
    
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
        showLoginModal();
    });
    
    switchToLoginAr.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
        showLoginModal();
    });
    
    // Form submissions
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    
    // Check authentication status on load
    // This is handled by the SupabaseClient constructor
});
