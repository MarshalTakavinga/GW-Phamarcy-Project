// Push Notification Service for GW Pharmacy Portal
// Provides browser notifications for prescription updates

class PushNotificationService {
    constructor() {
        this.permission = 'default';
        this.supported = 'Notification' in window;
        this.enabled = false;
        this.loadSettings();
    }

    /**
     * Load notification settings from localStorage
     */
    loadSettings() {
        const settings = localStorage.getItem('gwpharmacy_notification_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.enabled = parsed.enabled || false;
        }
        if (this.supported) {
            this.permission = Notification.permission;
        }
    }

    /**
     * Save notification settings to localStorage
     */
    saveSettings() {
        localStorage.setItem('gwpharmacy_notification_settings', JSON.stringify({
            enabled: this.enabled,
            permission: this.permission
        }));
    }

    /**
     * Check if notifications are supported
     */
    isSupported() {
        return this.supported;
    }

    /**
     * Request notification permission from user
     */
    async requestPermission() {
        if (!this.supported) {
            return {
                success: false,
                error: 'Push notifications are not supported in this browser'
            };
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            
            if (permission === 'granted') {
                this.enabled = true;
                this.saveSettings();
                
                // Send test notification
                this.sendNotification(
                    'Notifications Enabled',
                    'You will now receive prescription updates',
                    'success'
                );

                return { success: true, permission };
            } else {
                this.enabled = false;
                this.saveSettings();
                return { success: false, error: 'Permission denied' };
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send a push notification
     * @param {string} title - Notification title
     * @param {string} body - Notification body text
     * @param {string} type - Notification type (success, info, warning, error)
     * @param {object} options - Additional notification options
     */
    sendNotification(title, body, type = 'info', options = {}) {
        if (!this.supported || !this.enabled || this.permission !== 'granted') {
            console.log('Notifications not enabled:', { supported: this.supported, enabled: this.enabled, permission: this.permission });
            return false;
        }

        try {
            // Icon based on notification type
            const icons = {
                success: 'assets/images/icon-192x192.png',
                info: 'assets/images/icon-192x192.png',
                warning: 'assets/images/icon-192x192.png',
                error: 'assets/images/icon-192x192.png'
            };

            const notificationOptions = {
                body: body,
                icon: icons[type] || icons.info,
                badge: 'assets/images/icon-192x192.png',
                tag: `gwpharmacy-${type}-${Date.now()}`,
                requireInteraction: false,
                silent: false,
                timestamp: Date.now(),
                ...options
            };

            const notification = new Notification(title, notificationOptions);

            // Auto close after 10 seconds
            setTimeout(() => {
                notification.close();
            }, 10000);

            // Handle notification click
            notification.onclick = function(event) {
                event.preventDefault();
                window.focus();
                notification.close();
            };

            console.log('✅ Push notification sent:', title);
            return true;
        } catch (error) {
            console.error('Error sending notification:', error);
            return false;
        }
    }

    /**
     * Send refill reminder notification
     */
    sendRefillReminder(prescription) {
        return this.sendNotification(
            '💊 Refill Reminder',
            `Time to refill ${prescription.medicationName}. You have ${prescription.refillsRemaining} refills remaining.`,
            'info'
        );
    }

    /**
     * Send order confirmation notification
     */
    sendOrderConfirmation(orderNumber, medication) {
        return this.sendNotification(
            '✅ Order Confirmed',
            `Order #${orderNumber} for ${medication} has been confirmed. We'll notify you when it's ready.`,
            'success'
        );
    }

    /**
     * Send order ready notification
     */
    sendOrderReady(orderNumber, location) {
        return this.sendNotification(
            '📦 Prescription Ready',
            `Order #${orderNumber} is ready for pickup at ${location}.`,
            'success',
            { requireInteraction: true }
        );
    }

    /**
     * Send payment confirmation notification
     */
    sendPaymentConfirmation(amount, orderNumber) {
        return this.sendNotification(
            '💳 Payment Confirmed',
            `Payment of $${amount.toFixed(2)} processed for Order #${orderNumber}.`,
            'success'
        );
    }

    /**
     * Send general notification
     */
    sendGeneralNotification(title, message) {
        return this.sendNotification(title, message, 'info');
    }

    /**
     * Disable notifications
     */
    disable() {
        this.enabled = false;
        this.saveSettings();
    }

    /**
     * Enable notifications (requires permission)
     */
    async enable() {
        if (this.permission === 'granted') {
            this.enabled = true;
            this.saveSettings();
            return { success: true };
        } else {
            return await this.requestPermission();
        }
    }

    /**
     * Get current notification status
     */
    getStatus() {
        return {
            supported: this.supported,
            permission: this.permission,
            enabled: this.enabled
        };
    }
}

// Create global instance
const pushNotificationService = new PushNotificationService();

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📱 Push Notification Service initialized:', pushNotificationService.getStatus());
    });
} else {
    console.log('📱 Push Notification Service initialized:', pushNotificationService.getStatus());
}
