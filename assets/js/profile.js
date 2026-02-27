async function initProfilePage() {
    updateUserName();
    updateCartCount();
    
    setupTabNavigation();
    loadUserProfile();
    setupProfileForms();
}

/**
 * Setup tab navigation
 */
function setupTabNavigation() {
    const tabLinks = document.querySelectorAll('[data-tab]');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs and links
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.list-group-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked link and corresponding tab
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

/**
 * Load user profile data
 */
function loadUserProfile() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Personal Information
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const dobInput = document.getElementById('dob');
    const addressInput = document.getElementById('address');
    
    if (firstNameInput) firstNameInput.value = user.firstName || '';
    if (lastNameInput) lastNameInput.value = user.lastName || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (dobInput) dobInput.value = user.dateOfBirth || '';
    if (addressInput && user.address) addressInput.value = user.address.street || '';
    
    // Load notification preferences
    loadNotificationPreferences();
}

/**
 * Load notification preferences
 */
function loadNotificationPreferences() {
    const savedPrefs = localStorage.getItem('gwpharmacy_notification_prefs');
    
    if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        
        // Email preferences
        document.getElementById('email-refill').checked = prefs.emailRefill !== false;
        document.getElementById('email-ready').checked = prefs.emailReady !== false;
        document.getElementById('email-expiring').checked = prefs.emailExpiring !== false;
        document.getElementById('email-promotions').checked = prefs.emailPromotions === true;
        
        // SMS preferences
        document.getElementById('sms-refill').checked = prefs.smsRefill !== false;
        document.getElementById('sms-ready').checked = prefs.smsReady !== false;
        document.getElementById('sms-urgent').checked = prefs.smsUrgent === true;
    } else {
        // Default preferences - all enabled except promotions
        document.getElementById('email-refill').checked = true;
        document.getElementById('email-ready').checked = true;
        document.getElementById('email-expiring').checked = true;
        document.getElementById('email-promotions').checked = false;
        document.getElementById('sms-refill').checked = true;
        document.getElementById('sms-ready').checked = true;
        document.getElementById('sms-urgent').checked = false;
    }
}

/**
 * Setup profile forms
 */
function setupProfileForms() {
    // Personal Information Form
    const personalInfoForm = document.getElementById('personal-info-form');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const profileData = {
                firstName: document.getElementById('first-name').value,
                lastName: document.getElementById('last-name').value,
                phone: document.getElementById('phone').value
            };
            
            try {
                await API.updateProfile(profileData);
                showAlert('Profile updated successfully!', 'success');
                updateUserName();
            } catch (error) {
                showAlert('Error updating profile. Please try again.', 'danger');
            }
        });
    }
    
    // Notifications Form
    const notificationsForm = document.getElementById('notifications-form');
    if (notificationsForm) {
        notificationsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const preferences = {
                emailRefill: document.getElementById('email-refill').checked,
                emailReady: document.getElementById('email-ready').checked,
                emailExpiring: document.getElementById('email-expiring').checked,
                emailPromotions: document.getElementById('email-promotions').checked,
                smsNotifications: document.getElementById('sms-enabled').checked,
                smsRefill: document.getElementById('sms-refill').checked,
                smsReady: document.getElementById('sms-ready').checked,
                smsExpiring: document.getElementById('sms-expiring').checked,
                smsUrgent: document.getElementById('sms-urgent').checked
            };
            
            try {
                await API.updateNotificationPreferences(preferences);
                
                // Update Twilio service enabled state
                if (typeof twilioService !== 'undefined') {
                    twilioService.setEnabled(preferences.smsNotifications);
                }
                
                showAlert('Notification preferences updated successfully!', 'success');
                logAudit('NOTIFICATION_PREFS', 'Updated notification preferences including SMS');
            } catch (error) {
                showAlert('Error updating preferences. Please try again.', 'danger');
            }
        });
        
        // SMS enabled toggle
        const smsEnabledCheckbox = document.getElementById('sms-enabled');
        const smsOptions = document.getElementById('sms-options');
        
        if (smsEnabledCheckbox && smsOptions) {
            smsEnabledCheckbox.addEventListener('change', function() {
                const checkboxes = smsOptions.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(cb => {
                    cb.disabled = !this.checked;
                });
                smsOptions.style.opacity = this.checked ? '1' : '0.5';
            });
        }
    }
    
    // Password Form
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!passwordForm.checkValidity()) {
                e.stopPropagation();
                passwordForm.classList.add('was-validated');
                return;
            }
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-new-password').value;
            
            // Validate password match
            if (newPassword !== confirmPassword) {
                showAlert('New passwords do not match.', 'danger');
                return;
            }
            
            // Validate password strength
            const validation = validatePassword(newPassword);
            if (!validation.isValid) {
                showAlert(validation.errors.join('. '), 'danger');
                return;
            }
            
            try {
                // In real app, would verify current password with backend
                showAlert('Password updated successfully!', 'success');
                passwordForm.reset();
                passwordForm.classList.remove('was-validated');
                logAudit('PASSWORD_CHANGE', 'User changed password');
            } catch (error) {
                showAlert('Error updating password. Please try again.', 'danger');
            }
        });
    }
}
