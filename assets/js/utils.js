// Utility Functions for GW Pharmacy Portal
// Common helper functions used throughout the application

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is logged in
 */
function isAuthenticated() {
    const session = localStorage.getItem('gwpharmacy_session');
    if (!session) return false;
    
    try {
        const sessionData = JSON.parse(session);
        // Check if session is expired (24 hours)
        const sessionAge = Date.now() - sessionData.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (sessionAge > maxAge) {
            localStorage.removeItem('gwpharmacy_session');
            return false;
        }
        
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Get current user from session
 * @returns {Object|null} User object or null
 */
function getCurrentUser() {
    const session = localStorage.getItem('gwpharmacy_session');
    if (!session) return null;
    
    try {
        const sessionData = JSON.parse(session);
        // Always sync with latest MOCK_DATA to reflect any updates
        if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.users) {
            const updatedUser = MOCK_DATA.users.find(u => u.email === sessionData.user.email);
            if (updatedUser) {
                // Update session with latest user data
                sessionData.user = updatedUser;
                localStorage.setItem('gwpharmacy_session', JSON.stringify(sessionData));
                return updatedUser;
            }
        }
        return sessionData.user;
    } catch (e) {
        return null;
    }
}

/**
 * Get user by email from mock data
 * @param {string} email - User email address
 * @returns {Object|null} User object or null if not found
 */
function getUserByEmail(email) {
    if (!MOCK_DATA || !MOCK_DATA.users) return null;
    return MOCK_DATA.users.find(user => user.email === email) || null;
}

/**
 * Save user session and initialize user data
 * @param {Object} user - User object
 */
function saveSession(user) {
    const sessionData = {
        user: user,
        timestamp: Date.now()
    };
    localStorage.setItem('gwpharmacy_session', JSON.stringify(sessionData));
    
    // Initialize user data from MOCK_DATA for consistent experience
    initializeUserData();
    
    logAudit('LOGIN', `User ${user.email} logged in`);
}

/**
 * Initialize user data from MOCK_DATA
 * Ensures consistent data across sessions
 */
function initializeUserData() {
    console.log('[INIT] Initializing user data...');
    
    // Initialize prescriptions from MOCK_DATA
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.prescriptions) {
        localStorage.setItem('gwpharmacy_prescriptions', JSON.stringify(MOCK_DATA.prescriptions));
        console.log('[INIT] Prescriptions initialized:', MOCK_DATA.prescriptions.length);
    }
    
    // Initialize orders from MOCK_DATA
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.orders) {
        localStorage.setItem('gwpharmacy_orders', JSON.stringify(MOCK_DATA.orders));
        console.log('[INIT] Orders initialized:', MOCK_DATA.orders.length);
    }
    
    // Initialize notifications from MOCK_DATA
    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.notifications) {
        localStorage.setItem('gwpharmacy_notifications', JSON.stringify(MOCK_DATA.notifications));
        console.log('[INIT] Notifications initialized:', MOCK_DATA.notifications.length);
    }
    
    // Clear cart for fresh start (optional - comment out if you want to preserve cart)
    // localStorage.removeItem('gwpharmacy_cart');
    
    console.log('[INIT] ✅ User data initialization complete');
}

/**
 * Clear user session
 */
function clearSession() {
    const user = getCurrentUser();
    if (user) {
        logAudit('LOGOUT', `User ${user.email} logged out`);
    }
    localStorage.removeItem('gwpharmacy_session');
}

/**
 * Show alert message
 * @param {string} message - Alert message
 * @param {string} type - Alert type (success, danger, warning, info)
 * @param {string} containerId - Container element ID
 */
function showAlert(message, type = 'info', containerId = 'alert-container') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    container.innerHTML = '';
    container.appendChild(alert);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 150);
    }, 5000);
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * Format date
 * @param {string} dateString - Date string to format
 * @param {boolean} includeTime - Include time in format
 * @returns {string} Formatted date string
 */
function formatDate(dateString, includeTime = false) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Calculate days until date
 * @param {string} dateString - Target date
 * @returns {number} Days until date
 */
function daysUntil(dateString) {
    const target = new Date(dateString);
    const today = new Date();
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const isValid = password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
    
    return {
        isValid,
        errors: [
            password.length < minLength ? 'Password must be at least 8 characters' : null,
            !hasUpperCase ? 'Password must contain uppercase letter' : null,
            !hasLowerCase ? 'Password must contain lowercase letter' : null,
            !hasNumbers ? 'Password must contain number' : null
        ].filter(Boolean)
    };
}

/**
 * Mask sensitive data (e.g., insurance ID)
 * @param {string} data - Data to mask
 * @param {number} visibleChars - Number of visible characters at end
 * @returns {string} Masked string
 */
function maskData(data, visibleChars = 4) {
    if (!data || data.length <= visibleChars) return data;
    const masked = '*'.repeat(data.length - visibleChars);
    return masked + data.slice(-visibleChars);
}

/**
 * Format credit card number
 * @param {string} cardNumber - Card number to format
 * @returns {string} Formatted card number
 */
function formatCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ');
}

/**
 * Validate credit card number (Luhn algorithm)
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} True if valid
 */
function validateCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    // Check if it's only digits
    if (!/^\d+$/.test(cleaned)) return false;
    
    // Check length (13-19 digits for most cards)
    if (cleaned.length < 13 || cleaned.length > 19) return false;
    
    // Accept test card numbers for development
    const testCards = [
        '4532123456789010',
        '4111111111111111',
        '5555555555554444',
        '378282246310005'
    ];
    
    if (testCards.includes(cleaned)) {
        return true;
    }
    
    // Luhn algorithm validation for real cards
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i]);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    const isValid = sum % 10 === 0;
    console.log('[VALIDATION] Card validation result:', isValid ? 'Valid' : 'Invalid');
    return isValid;
}

/**
 * Generate unique order number
 * @returns {string} Order number
 */
function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${year}-${random}`;
}

/**
 * Log audit trail
 * @param {string} action - Action performed
 * @param {string} details - Action details
 */
function logAudit(action, details) {
    const timestamp = new Date().toISOString();
    const user = getCurrentUser();
    const logEntry = {
        timestamp,
        user: user ? user.email : 'anonymous',
        action,
        details
    };
    
    console.log('[AUDIT]', logEntry);
    
    // Store audit log in sessionStorage
    try {
        const auditLog = JSON.parse(sessionStorage.getItem('audit_log') || '[]');
        auditLog.push(logEntry);
        // Keep only last 100 entries
        if (auditLog.length > 100) auditLog.shift();
        sessionStorage.setItem('audit_log', JSON.stringify(auditLog));
    } catch (e) {
        console.error('Failed to log audit entry', e);
    }
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show loading spinner on button
 * @param {HTMLElement} button - Button element
 * @param {boolean} show - Show or hide spinner
 */
function toggleButtonLoading(button, show) {
    const text = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner-border');
    
    if (show) {
        button.disabled = true;
        if (text) text.classList.add('d-none');
        if (spinner) spinner.classList.remove('d-none');
    } else {
        button.disabled = false;
        if (text) text.classList.remove('d-none');
        if (spinner) spinner.classList.add('d-none');
    }
}

/**
 * Scroll to top of page
 */
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Update cart count badge in navigation
 */
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('gwpharmacy_cart') || '[]');
    const badges = document.querySelectorAll('#cart-count');
    badges.forEach(badge => {
        badge.textContent = cart.length;
        badge.style.display = cart.length > 0 ? 'inline' : 'none';
    });
}

/**
 * Update user name in navigation
 */
function updateUserName() {
    const user = getCurrentUser();
    if (user) {
        const nameElements = document.querySelectorAll('#user-name, #welcome-name');
        nameElements.forEach(el => {
            el.textContent = user.firstName;
        });
    }
}

// Initialize common functionality
document.addEventListener('DOMContentLoaded', function() {
    // Update cart count and user name if elements exist
    updateCartCount();
    updateUserName();
    
    // Setup logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            clearSession();
            window.location.href = '../index.html';
        });
    }
});
