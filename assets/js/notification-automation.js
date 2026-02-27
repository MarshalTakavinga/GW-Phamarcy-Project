// Notification Automation Service
// Automatically checks for and sends refill reminders and prescription expiry warnings

/**
 * Notification Automation Configuration
 */
const AUTOMATION_CONFIG = {
    refillCheckInterval: 24 * 60 * 60 * 1000, // Check daily (24 hours)
    refillReminderDays: 7, // Send reminder when 7 days of medication left
    expiryWarningDays: 30, // Warn when prescription expires in 30 days
    autoCheckOnLoad: true, // Check when page loads
    enableBackgroundChecks: true // Enable periodic background checks
};

/**
 * Notification Automation Service Class
 */
class NotificationAutomation {
    constructor(config) {
        this.config = config;
        this.intervalId = null;
        this.lastCheckTime = null;
        this.loadLastCheckTime();
    }

    /**
     * Load last check time from localStorage
     */
    loadLastCheckTime() {
        const stored = localStorage.getItem('gwpharmacy_last_notification_check');
        this.lastCheckTime = stored ? new Date(stored) : null;
    }

    /**
     * Save last check time to localStorage
     */
    saveLastCheckTime() {
        const now = new Date().toISOString();
        localStorage.setItem('gwpharmacy_last_notification_check', now);
        this.lastCheckTime = new Date(now);
    }

    /**
     * Initialize automation service
     */
    init() {
        console.log('📬 Notification Automation Service initialized');
        
        // Run initial check if enabled
        if (this.config.autoCheckOnLoad) {
            this.checkAndNotify();
        }
        
        // Start background checks if enabled
        if (this.config.enableBackgroundChecks) {
            this.startBackgroundChecks();
        }
    }

    /**
     * Start periodic background checks
     */
    startBackgroundChecks() {
        // Clear existing interval
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        // Set up new interval
        this.intervalId = setInterval(() => {
            this.checkAndNotify();
        }, this.config.refillCheckInterval);
        
        console.log('⏰ Background notification checks started (every 24 hours)');
    }

    /**
     * Stop background checks
     */
    stopBackgroundChecks() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('⏸️ Background notification checks stopped');
        }
    }

    /**
     * Main check and notify function
     */
    async checkAndNotify() {
        console.log('🔍 Checking for notification triggers...');
        
        // Check if user is logged in
        const session = JSON.parse(localStorage.getItem('gwpharmacy_session'));
        if (!session || !session.user) {
            console.log('❌ User not logged in, skipping checks');
            return;
        }

        const user = session.user;
        const prefs = JSON.parse(localStorage.getItem('gwpharmacy_notification_prefs') || '{}');
        
        // Skip if notifications are disabled
        if (!prefs.emailNotifications && !prefs.smsNotifications) {
            console.log('❌ Notifications disabled, skipping checks');
            return;
        }

        // Check prescriptions
        await this.checkPrescriptions(user);
        
        // Check pending orders
        await this.checkPendingOrders(user);
        
        // Update last check time
        this.saveLastCheckTime();
    }

    /**
     * Check prescriptions for refill reminders and expiry warnings
     * @param {Object} user - User object
     */
    async checkPrescriptions(user) {
        // Check prescriptions from data source
        const prescriptions = typeof MOCK_DATA !== 'undefined' ? MOCK_DATA.prescriptions : [];
        const now = new Date();
        
        for (const prescription of prescriptions) {
            // Skip if already expired or no refills
            if (prescription.status === 'Expired' || prescription.refillsRemaining <= 0) {
                continue;
            }
            
            // Check for expiry warning
            if (prescription.expiryDate) {
                const expiryDate = new Date(prescription.expiryDate);
                const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
                
                if (daysUntilExpiry > 0 && daysUntilExpiry <= this.config.expiryWarningDays) {
                    // Check if warning already sent
                    if (!this.wasNotificationSent(prescription.id, 'expiry-warning')) {
                        console.log(`⚠️ Sending expiry warning for ${prescription.medicationName}`);
                        
                        await API.sendNotification({
                            type: 'expiry-warning',
                            prescription: prescription
                        });
                        
                        this.markNotificationSent(prescription.id, 'expiry-warning');
                    }
                }
            }
            
            // Check for refill reminder
            if (this.needsRefillReminder(prescription)) {
                // Check if reminder already sent recently
                if (!this.wasNotificationSent(prescription.id, 'refill-reminder')) {
                    console.log(`💊 Sending refill reminder for ${prescription.medicationName}`);
                    
                    await API.sendNotification({
                        type: 'refill-reminder',
                        prescription: prescription
                    });
                    
                    this.markNotificationSent(prescription.id, 'refill-reminder');
                }
            }
        }
    }

    /**
     * Check if prescription needs refill reminder
     * @param {Object} prescription - Prescription object
     * @returns {boolean} Needs reminder
     */
    needsRefillReminder(prescription) {
        // If no last filled date, send reminder
        if (!prescription.lastFilledDate) {
            return true;
        }
        
        const lastFilled = new Date(prescription.lastFilledDate);
        const now = new Date();
        const daysSinceLastFill = Math.floor((now - lastFilled) / (1000 * 60 * 60 * 24));
        
        // Estimate days supply based on quantity and dosage
        // Default to 30 days if not specified
        const daysSupply = prescription.daysSupply || 30;
        const daysLeft = daysSupply - daysSinceLastFill;
        
        // Send reminder when running low
        return daysLeft <= this.config.refillReminderDays && daysLeft > 0;
    }

    /**
     * Check pending orders for status updates
     * @param {Object} user - User object
     */
    async checkPendingOrders(user) {
        // Check pending orders from data source
        const orders = typeof MOCK_DATA !== 'undefined' && MOCK_DATA.orders ? MOCK_DATA.orders : [];
        const now = new Date();
        
        for (const order of orders) {
            // Check if order is ready for pickup (simulated)
            if (order.status === 'Processing') {
                const orderDate = new Date(order.orderDate);
                const hoursElapsed = (now - orderDate) / (1000 * 60 * 60);
                
                // Simulate order being ready after 2 hours
                if (hoursElapsed >= 2) {
                    // Update order status
                    order.status = 'Ready';
                    order.estimatedReady = now.toISOString();
                    
                    // Generate pickup code if not exists
                    if (!order.pickupCode) {
                        order.pickupCode = Math.floor(100000 + Math.random() * 900000).toString();
                    }
                    
                    // Save updated order
                    const orderIndex = orders.findIndex(o => o.orderNumber === order.orderNumber);
                    if (orderIndex !== -1) {
                        orders[orderIndex] = order;
                        localStorage.setItem('gwpharmacy_orders', JSON.stringify(orders));
                    }
                    
                    // Send notification if not already sent
                    if (!this.wasNotificationSent(order.orderNumber, 'order-ready')) {
                        console.log(`✅ Order ${order.orderNumber} is ready for pickup`);
                        
                        await API.sendNotification({
                            type: 'order-ready',
                            order: order
                        });
                        
                        this.markNotificationSent(order.orderNumber, 'order-ready');
                    }
                }
            }
        }
    }

    /**
     * Check if notification was already sent
     * @param {string} itemId - Prescription ID or Order Number
     * @param {string} notificationType - Type of notification
     * @returns {boolean} Was sent
     */
    wasNotificationSent(itemId, notificationType) {
        const sentNotifications = JSON.parse(localStorage.getItem('gwpharmacy_sent_notifications') || '{}');
        const key = `${itemId}-${notificationType}`;
        
        if (!sentNotifications[key]) {
            return false;
        }
        
        const sentDate = new Date(sentNotifications[key]);
        const now = new Date();
        const daysSinceSent = Math.floor((now - sentDate) / (1000 * 60 * 60 * 24));
        
        // Resend reminder if it's been more than 7 days for refill reminders
        if (notificationType === 'refill-reminder' && daysSinceSent > 7) {
            return false;
        }
        
        // Don't resend other notifications
        return true;
    }

    /**
     * Mark notification as sent
     * @param {string} itemId - Prescription ID or Order Number
     * @param {string} notificationType - Type of notification
     */
    markNotificationSent(itemId, notificationType) {
        const sentNotifications = JSON.parse(localStorage.getItem('gwpharmacy_sent_notifications') || '{}');
        const key = `${itemId}-${notificationType}`;
        sentNotifications[key] = new Date().toISOString();
        localStorage.setItem('gwpharmacy_sent_notifications', JSON.stringify(sentNotifications));
    }

    /**
     * Manual trigger for refill reminder
     * @param {string} prescriptionId - Prescription ID
     */
    async sendRefillReminderNow(prescriptionId) {
        // Get prescription from data source
        const prescriptions = (typeof MOCK_DATA !== 'undefined') 
            ? MOCK_DATA.prescriptions 
            : JSON.parse(localStorage.getItem('gwpharmacy_prescriptions') || '[]');
        const prescription = prescriptions.find(p => p.id === prescriptionId);
        
        if (!prescription) {
            console.error('Prescription not found:', prescriptionId);
            return;
        }
        
        await API.sendNotification({
            type: 'refill-reminder',
            prescription: prescription
        });
        
        this.markNotificationSent(prescriptionId, 'refill-reminder');
        
        return { success: true, message: 'Refill reminder sent' };
    }

    /**
     * Get notification statistics
     * @returns {Object} Stats
     */
    getStats() {
        const sentNotifications = JSON.parse(localStorage.getItem('gwpharmacy_sent_notifications') || '{}');
        const total = Object.keys(sentNotifications).length;
        
        const byType = {};
        for (const key of Object.keys(sentNotifications)) {
            const type = key.split('-').slice(1).join('-');
            byType[type] = (byType[type] || 0) + 1;
        }
        
        return {
            total: total,
            lastCheck: this.lastCheckTime ? this.lastCheckTime.toLocaleString() : 'Never',
            byType: byType,
            backgroundChecksEnabled: this.config.enableBackgroundChecks
        };
    }
}

// Initialize automation service
const notificationAutomation = new NotificationAutomation(AUTOMATION_CONFIG);

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        notificationAutomation.init();
    });
} else {
    notificationAutomation.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NotificationAutomation, notificationAutomation, AUTOMATION_CONFIG };
}
