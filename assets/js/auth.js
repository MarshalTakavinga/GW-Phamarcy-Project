document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        initLoginForm(loginForm);
    }
    
    // Registration form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        initRegisterForm(registerForm);
    }
    
    // Forgot password form
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        initForgotPasswordForm(forgotPasswordForm);
    }
    
    // Password toggle
    const togglePassword = document.getElementById('toggle-password');
    if (togglePassword) {
        initPasswordToggle(togglePassword);
    }
});

/**
 * Initialize login form
 * @param {HTMLFormElement} form - Login form element
 */
function initLoginForm(form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        const submitBtn = document.getElementById('login-btn');
        
        // Show loading
        toggleButtonLoading(submitBtn, true);
        
        // Simulate API call
        setTimeout(() => {
            // Validate credentials
            console.log('🔍 Login attempt:', email);
            console.log('📋 Available users:', MOCK_DATA.users);
            
            const user = getUserByEmail(email);
            console.log('👤 Found user:', user);
            
            if (user && user.password === password) {
                // Successful login
                console.log('✅ Login successful for:', email);
                saveSession(user);
                
                if (rememberMe) {
                    localStorage.setItem('gwpharmacy_remember', email);
                }
                
                logAudit('LOGIN_SUCCESS', `User ${email} logged in successfully`);
                
                // Redirect to dashboard
                window.location.href = 'pages/dashboard.html';
            } else {
                // Failed login
                console.log('❌ Login failed:', { user: user ? 'found' : 'not found', passwordMatch: user ? user.password === password : false });
                logAudit('LOGIN_FAILED', `Failed login attempt for ${email}`);
                toggleButtonLoading(submitBtn, false);
                showAlert('Invalid email or password. Please try again.', 'danger');
            }
        }, 1000);
    });
    
    // Pre-fill email if remembered
    const rememberedEmail = localStorage.getItem('gwpharmacy_remember');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('remember-me').checked = true;
    }
}

/**
 * Initialize registration form
 * @param {HTMLFormElement} form - Registration form element
 */
function initRegisterForm(form) {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Real-time password validation
    passwordInput.addEventListener('input', function() {
        const validation = validatePassword(this.value);
        if (!validation.isValid) {
            this.setCustomValidity(validation.errors.join('. '));
        } else {
            this.setCustomValidity('');
        }
    });
    
    // Confirm password validation
    confirmPasswordInput.addEventListener('input', function() {
        if (this.value !== passwordInput.value) {
            this.setCustomValidity('Passwords do not match');
        } else {
            this.setCustomValidity('');
        }
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }
        
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            dateOfBirth: document.getElementById('dateOfBirth').value,
            password: passwordInput.value
        };
        
        const submitBtn = document.getElementById('register-btn');
        toggleButtonLoading(submitBtn, true);
        
        // Simulate API call
        setTimeout(() => {
            // Check if email already exists
            const existingUser = getUserByEmail(formData.email);
            
            if (existingUser) {
                toggleButtonLoading(submitBtn, false);
                showAlert('An account with this email already exists.', 'danger');
                return;
            }
            
            // Create new user (in demo, just show success)
            logAudit('REGISTRATION', `New user registered: ${formData.email}`);
            
            showAlert('Account created successfully! Redirecting to login...', 'success');
            
            setTimeout(() => {
                window.location.href = '../../index.html';
            }, 2000);
        }, 1500);
    });
}

/**
 * Initialize forgot password form
 * @param {HTMLFormElement} form - Forgot password form element
 */
function initForgotPasswordForm(form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }
        
        const email = document.getElementById('email').value;
        const submitBtn = document.getElementById('reset-btn');
        
        toggleButtonLoading(submitBtn, true);
        
        // Simulate API call
        setTimeout(() => {
            logAudit('PASSWORD_RESET_REQUEST', `Password reset requested for ${email}`);
            
            toggleButtonLoading(submitBtn, false);
            
            showAlert(
                'If an account exists with this email, you will receive password reset instructions shortly.',
                'success'
            );
            
            // Clear form
            form.reset();
            form.classList.remove('was-validated');
        }, 1500);
    });
}

/**
 * Initialize password visibility toggle
 * @param {HTMLElement} toggleBtn - Toggle button element
 */
function initPasswordToggle(toggleBtn) {
    toggleBtn.addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
            this.setAttribute('aria-label', 'Hide password');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
            this.setAttribute('aria-label', 'Show password');
        }
    });
}
