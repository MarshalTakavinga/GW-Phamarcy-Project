// SMS Service Module via Email-to-SMS Gateway
// DISABLED FOR PUBLIC REPOSITORY - No actual SMS messages will be sent
// Uses EmailJS to send emails to carrier SMS gateways

/**
 * Email-to-SMS Gateway Configuration
 * Carrier email gateways for SMS delivery
 * DISABLED - SMS service is not active in this public repository
 */
const SMS_CONFIG = {
    enabled: false,  // SMS DISABLED
    useEmailJS: false,  // Uses your existing EmailJS setup (DISABLED)
    carriers: {
        'Verizon': '@vtext.com',
        'AT&T': '@txt.att.net',
        'T-Mobile': '@tmomail.net',
        'Sprint': '@messaging.sprintpcs.com',
        'US Cellular': '@email.uscc.net',
        'Boost Mobile': '@sms.myboostmobile.com',
        'Cricket': '@sms.cricketwireless.net',
        'Metro PCS': '@mymetropcs.com',
        'Mint Mobile': '@tmomail.net' // Mint uses T-Mobile network
    }
};

/**
 * SMS Template Types
 */
const SMS_TEMPLATES = {
    REFILL_REMINDER: {
        template: 'Hi {name}, your {medication} prescription has {refills} refills remaining. Order at gwpharmacy.edu or reply REFILL.',
        type: 'reminder'
    },
    ORDER_CONFIRMATION: {
        template: 'Order #{orderNumber} confirmed! Your medications will be ready for pickup at {location} in {time}. - GW Pharmacy',
        type: 'confirmation'
    },
    ORDER_READY: {
        template: 'Hi {name}, your order #{orderNumber} is ready for pickup at {location}. Bring your student ID. - GW Pharmacy',
        type: 'notification'
    },
    EXPIRY_WARNING: {
        template: 'Reminder: Your {medication} prescription expires on {date}. Contact your doctor for renewal. - GW Pharmacy',
        type: 'warning'
    },
    APPOINTMENT_REMINDER: {
        template: 'Reminder: Pharmacy consultation on {date} at {time}. Reply CONFIRM or CANCEL. - GW Pharmacy',
        type: 'reminder'
    },
    PRICE_DROP: {
        template: 'Good news! {medication} copay reduced to ${price}. Order now at gwpharmacy.edu. - GW Pharmacy',
        type: 'notification'
    }
};

/**
 * SMS Service Class (via Email-to-SMS)
 */
class TwilioService {
    constructor(config) {
        this.config = config;
        this.sentMessages = [];
        this.loadSentMessages();
    }

    /**
     * Load sent messages from localStorage
     */
    loadSentMessages() {
        const stored = localStorage.getItem('gwpharmacy_sms_log');
        if (stored) {
            this.sentMessages = JSON.parse(stored);
        }
    }

    /**
     * Save sent messages to localStorage
     */
    saveSentMessages() {
        localStorage.setItem('gwpharmacy_sms_log', JSON.stringify(this.sentMessages));
    }

    /**
     * Convert phone number and carrier to SMS email gateway
     * @param {string} phone - Phone number (e.g., "2025551234")
     * @param {string} carrier - Carrier name (e.g., "Verizon")
     * @returns {string} Email address for SMS gateway
     */
    phoneToEmail(phone, carrier) {
        // Remove any formatting from phone number
        const cleanPhone = phone.replace(/\D/g, '');
        const gateway = this.config.carriers[carrier];
        
        if (!gateway) {
            throw new Error(`Unknown carrier: ${carrier}`);
        }
        
        return cleanPhone + gateway;
    }

    /**
     * Send SMS via Email-to-SMS gateway (using EmailJS)
     * @param {string} to - Recipient phone number
     * @param {string} message - Message body
     * @param {string} carrier - Mobile carrier name (optional, defaults to Verizon)
     * @returns {Promise<Object>} Send result
     */
    async sendSMS(to, message, carrier = 'Verizon') {
        if (!this.config.enabled) {
            return {
                success: false,
                error: 'SMS service is disabled'
            };
        }

        try {
            // Convert phone + carrier to email address
            const smsEmail = this.phoneToEmail(to, carrier);
            
            console.log('📱 Sending SMS via Email-to-SMS:', {
                phone: to,
                carrier: carrier,
                gateway: smsEmail
            });

            // Use EmailJS to send to SMS gateway
            if (typeof emailService !== 'undefined' && this.config.useEmailJS) {
                const result = await emailService.sendEmail(
                    smsEmail,
                    '', // SMS gateways ignore subject
                    message // Plain text message (no HTML for SMS)
                );

                // Log successful send
                const messageLog = {
                    id: `sms-${Date.now()}`,
                    to: to,
                    carrier: carrier,
                    gateway: smsEmail,
                    message: message,
                    timestamp: new Date().toISOString(),
                    status: 'sent',
                    method: 'email-to-sms',
                    mock: false
                };

                this.sentMessages.unshift(messageLog);
                if (this.sentMessages.length > 100) {
                    this.sentMessages = this.sentMessages.slice(0, 100);
                }
                this.saveSentMessages();

                console.log('✅ SMS sent successfully via email gateway');

                return {
                    success: true,
                    messageId: messageLog.id,
                    simulated: false,
                    method: 'email-to-sms'
                };
            } else {
                // Fallback to simulation
                return this.sendSimulatedSMS(to, message);
            }

        } catch (error) {
            console.error('❌ SMS send failed:', error);
            
            // Fallback to simulation
            return this.sendSimulatedSMS(to, message);
        }
    }

    /**
     * Send simulated SMS for testing
     * @param {string} to - Recipient phone number
     * @param {string} message - Message body
     * @returns {Promise<Object>} Send result
     */
    async sendSimulatedSMS(to, message) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const messageLog = {
            id: this.generateMessageId(),
            to: to,
            body: message,
            status: 'delivered',
            timestamp: new Date().toISOString(),
            simulated: true
        };

        this.sentMessages.unshift(messageLog);
        this.saveSentMessages();

        console.log('📱 [Simulated SMS]', messageLog);
        logAudit('SMS_SENT', `Simulated SMS sent to ${this.maskPhoneNumber(to)}`);

        return {
            success: true,
            messageId: messageLog.id,
            status: 'delivered',
            to: to,
            simulated: true
        };
    }

    /**
     * Send SMS using template
     * @param {string} to - Recipient phone number
     * @param {string} templateName - Template name from SMS_TEMPLATES
     * @param {Object} variables - Variables to replace in template
     * @returns {Promise<Object>} Send result
     */
    async sendTemplatedSMS(to, templateName, variables, carrier = 'Verizon') {
        const template = SMS_TEMPLATES[templateName];
        
        if (!template) {
            throw new Error(`Template ${templateName} not found`);
        }

        // Replace variables in template
        let message = template.template;
        for (const [key, value] of Object.entries(variables)) {
            message = message.replace(`{${key}}`, value);
        }

        return this.sendSMS(to, message, carrier);
    }

    /**
     * Send test SMS message
     * @param {Object} user - User object
     * @returns {Promise<Object>} Send result
     */
    async sendTestMessage(user) {
        const phone = user.phone || user.phoneNumber || '2025551234';
        const carrier = user.carrier || 'Verizon'; // Default to Verizon
        const message = `Test from GW Pharmacy: Hello ${user.firstName || user.name}! SMS notifications are active. You'll receive order updates and reminders.`;
        
        return this.sendSMS(phone, message, carrier);
    }

    /**
     * Send refill reminder
     * @param {Object} prescription - Prescription object
     * @param {Object} user - User object
     * @returns {Promise<Object>} Send result
     */
    async sendRefillReminder(prescription, user) {
        return this.sendTemplatedSMS(user.phone, 'REFILL_REMINDER', {
            name: user.firstName,
            medication: prescription.medicationName,
            refills: prescription.refillsRemaining
        }, user.carrier || 'Verizon');
    }

    /**
     * Send order confirmation
     * @param {Object} order - Order object
     * @param {Object} user - User object
     * @returns {Promise<Object>} Send result
     */
    async sendOrderConfirmation(order, user) {
        const readyTime = this.calculateReadyTime(order.pickupLocation.availability);
        
        return this.sendTemplatedSMS(user.phone, 'ORDER_CONFIRMATION', {
            orderNumber: order.orderNumber,
            location: order.pickupLocation.name,
            time: readyTime
        }, user.carrier || 'Verizon');
    }

    /**
     * Send order ready notification
     * @param {Object} order - Order object
     * @param {Object} user - User object
     * @returns {Promise<Object>} Send result
     */
    async sendOrderReady(order, user) {
        return this.sendTemplatedSMS(user.phone, 'ORDER_READY', {
            name: user.firstName,
            orderNumber: order.orderNumber,
            location: order.pickupLocation.name
        }, user.carrier || 'Verizon');
    }

    /**
     * Send prescription expiry warning
     * @param {Object} prescription - Prescription object
     * @param {Object} user - User object
     * @returns {Promise<Object>} Send result
     */
    async sendExpiryWarning(prescription, user) {
        return this.sendTemplatedSMS(user.phone, 'EXPIRY_WARNING', {
            medication: prescription.medicationName,
            date: formatDate(prescription.expiryDate)
        });
    }

    /**
     * Schedule reminder
     * @param {string} to - Recipient phone number
     * @param {string} message - Message body
     * @param {Date} scheduledTime - When to send
     * @returns {Promise<Object>} Schedule result
     */
    async scheduleReminder(to, message, scheduledTime) {
        const scheduled = {
            id: this.generateMessageId(),
            to: to,
            message: message,
            scheduledFor: scheduledTime.toISOString(),
            status: 'scheduled',
            createdAt: new Date().toISOString()
        };

        // Save to scheduled messages
        let scheduledMessages = JSON.parse(localStorage.getItem('gwpharmacy_scheduled_sms') || '[]');
        scheduledMessages.push(scheduled);
        localStorage.setItem('gwpharmacy_scheduled_sms', JSON.stringify(scheduledMessages));

        console.log('📅 [SMS SCHEDULED]', scheduled);
        
        return {
            success: true,
            scheduleId: scheduled.id,
            scheduledFor: scheduledTime.toISOString()
        };
    }

    /**
     * Get SMS history
     * @param {number} limit - Number of messages to return
     * @returns {Array} Sent messages
     */
    getSMSHistory(limit = 50) {
        return this.sentMessages.slice(0, limit);
    }

    /**
     * Get SMS statistics
     * @returns {Object} Statistics
     */
    getSMSStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        return {
            total: this.sentMessages.length,
            today: this.sentMessages.filter(msg => new Date(msg.timestamp) >= today).length,
            thisWeek: this.sentMessages.filter(msg => {
                const msgDate = new Date(msg.timestamp);
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return msgDate >= weekAgo;
            }).length,
            delivered: this.sentMessages.filter(msg => msg.status === 'delivered').length,
            failed: this.sentMessages.filter(msg => msg.status === 'failed').length
        };
    }

    /**
     * Validate phone number format
     * @param {string} phone - Phone number
     * @returns {boolean} Valid or not
     */
    validatePhoneNumber(phone) {
        // Remove all non-digit characters
        const cleaned = phone.replace(/\D/g, '');
        
        // Check if it's 10 or 11 digits (US format)
        return cleaned.length === 10 || cleaned.length === 11;
    }

    /**
     * Format phone number for display
     * @param {string} phone - Phone number
     * @returns {string} Formatted phone
     */
    formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        } else if (cleaned.length === 11) {
            return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        }
        
        return phone;
    }

    /**
     * Mask phone number for privacy
     * @param {string} phone - Phone number
     * @returns {string} Masked phone
     */
    maskPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length >= 4) {
            return `***-***-${cleaned.slice(-4)}`;
        }
        return '***-***-****';
    }

    /**
     * Generate unique message ID
     * @returns {string} Message ID
     */
    generateMessageId() {
        return `SM${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Calculate ready time from availability string
     * @param {string} availability - e.g., "2-4 hours"
     * @returns {string} Formatted ready time
     */
    calculateReadyTime(availability) {
        const match = availability.match(/(\d+)-(\d+)/);
        if (match) {
            const hours = parseInt(match[2]); // Use max time
            const readyDate = new Date(Date.now() + hours * 60 * 60 * 1000);
            return readyDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
        }
        return availability;
    }

    /**
     * Production SMS sending (requires backend)
     * @param {string} to - Recipient phone number
     * @param {string} message - Message body
     * @returns {Promise<Object>} Send result
     */
    async sendProductionSMS(to, message) {
        // This would call your backend API endpoint
        // which then calls Twilio securely with server-side credentials
        
        try {
            const response = await fetch('/api/sms/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({
                    to: to,
                    message: message
                })
            });

            const result = await response.json();
            
            if (result.success) {
                logAudit('SMS_SENT', `SMS sent to ${this.maskPhoneNumber(to)}`);
            }
            
            return result;
        } catch (error) {
            console.error('SMS send failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Enable/disable SMS service
     * @param {boolean} enabled - Enable or disable
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        localStorage.setItem('gwpharmacy_sms_enabled', enabled.toString());
    }

    /**
     * Check if SMS is enabled
     * @returns {boolean} Enabled status
     */
    isEnabled() {
        return this.config.enabled;
    }
}

// Initialize SMS service (Email-to-SMS via EmailJS)
const twilioService = new TwilioService(SMS_CONFIG);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TwilioService, twilioService, SMS_TEMPLATES };
}
