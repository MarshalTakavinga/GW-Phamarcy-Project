/**
 * EmailJS Configuration
 * DISABLED FOR PUBLIC REPOSITORY - No actual emails will be sent
 * Get free account at https://www.emailjs.com
 * Free tier: 200 emails/month
 */
const EMAILJS_CONFIG = {
    // serviceId: 'service_tahi6r9',          // Your EmailJS Service ID (REMOVED)
    // templateId: 'template_4uo40nm',        // Your EmailJS Template ID (REMOVED)
    // publicKey: 'wc-R3igqXo0OxHINF',        // Your Public Key (REMOVED)
    enabled: false // Emails DISABLED for security
};

// Initialize EmailJS when DOM is ready
// DISABLED - Email service is not active in this public repository
// document.addEventListener('DOMContentLoaded', function() {
//     if (typeof emailjs !== 'undefined') {
//         emailjs.init(EMAILJS_CONFIG.publicKey);
//         console.log('✅ EmailJS initialized with public key');
//     } else {
//         console.warn('⚠️ EmailJS library not loaded - using fallback mode');
//     }
// });

/**
 * Email Configuration
 */
const EMAIL_CONFIG = {
    fromEmail: 'noreply@gwpharmacy.edu',
    fromName: 'GW Pharmacy',
    // replyTo: 'support@ndleleni.com',  // REMOVED for security
    useEmailJS: false,  // Emails disabled
    useFallback: false  // Fallback disabled
};

/**
 * Email Templates
 */
const EMAIL_TEMPLATES = {
    ORDER_CONFIRMATION: {
        subject: 'Order Confirmation - Order #{orderNumber}',
        template: `
            <h2>Thank you for your order!</h2>
            <p>Dear {name},</p>
            <p>Your prescription order has been received and is being processed.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Order Details</h3>
                <p><strong>Order Number:</strong> {orderNumber}</p>
                <p><strong>Order Date:</strong> {orderDate}</p>
                <p><strong>Total Amount:</strong> {total}</p>
                <p><strong>Estimated Ready Time:</strong> {readyTime}</p>
            </div>
            
            <h3>Pickup Information</h3>
            <p><strong>Location:</strong> {location}</p>
            <p><strong>Address:</strong> {address}</p>
            <p><strong>Hours:</strong> {hours}</p>
            
            <div style="background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0;">
                <p style="margin: 0;"><strong>📱 Track Your Order:</strong> You'll receive an SMS when your prescription is ready for pickup.</p>
            </div>
            
            <h3>Items Ordered</h3>
            {items}
            
            <p style="margin-top: 30px;">If you have any questions, please contact us at (202) 555-MEDS or reply to this email.</p>
            
            <p>Best regards,<br>GW Pharmacy Team</p>
        `
    },
    
    ORDER_READY: {
        subject: 'Your Prescription is Ready for Pickup - Order #{orderNumber}',
        template: `
            <h2>Your prescription is ready! 🎉</h2>
            <p>Dear {name},</p>
            <p>Great news! Your prescription order <strong>#{orderNumber}</strong> is now ready for pickup.</p>
            
            <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
                <h3 style="margin-top: 0; color: #2e7d32;">Pickup Details</h3>
                <p><strong>Location:</strong> {location}</p>
                <p><strong>Address:</strong> {address}</p>
                <p><strong>Pickup Code:</strong> <span style="font-size: 24px; font-weight: bold; color: #2e7d32;">{pickupCode}</span></p>
            </div>
            
            <h3>What to Bring</h3>
            <ul>
                <li>Valid government-issued ID</li>
                <li>Insurance card (if applicable)</li>
                <li>This pickup code: <strong>{pickupCode}</strong></li>
            </ul>
            
            <h3>Pickup Hours</h3>
            <p>{hours}</p>
            
            <div style="background: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
                <p style="margin: 0;"><strong>⚡ Kiosk Available 24/7:</strong> Use your pickup code for after-hours pickup at our automated kiosk.</p>
            </div>
            
            <p>Your prescription will be held for 14 days. Please pick up as soon as possible.</p>
            
            <p>Thank you for choosing GW Pharmacy!</p>
            
            <p>Best regards,<br>GW Pharmacy Team</p>
        `
    },
    
    REFILL_REMINDER: {
        subject: 'Time to Refill Your Prescription - {medication}',
        template: `
            <h2>Prescription Refill Reminder</h2>
            <p>Dear {name},</p>
            <p>This is a friendly reminder that your prescription for <strong>{medication}</strong> may need to be refilled soon.</p>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h3 style="margin-top: 0;">Prescription Details</h3>
                <p><strong>Medication:</strong> {medication}</p>
                <p><strong>Dosage:</strong> {dosage}</p>
                <p><strong>Refills Remaining:</strong> {refills}</p>
                <p><strong>Last Filled:</strong> {lastFilled}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://gwpharmacy.edu/prescriptions" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                    Order Refill Now
                </a>
            </div>
            
            <h3>Why Refill on Time?</h3>
            <ul>
                <li>Maintain consistent medication levels</li>
                <li>Avoid treatment interruptions</li>
                <li>Better health outcomes</li>
            </ul>
            
            <div style="background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0;">
                <p style="margin: 0;"><strong>💊 Pro Tip:</strong> Set up automatic refills to never miss a dose!</p>
            </div>
            
            <p>Need help? Contact us at (202) 555-MEDS or reply to this email.</p>
            
            <p>Stay healthy,<br>GW Pharmacy Team</p>
        `
    },
    
    EXPIRY_WARNING: {
        subject: 'Prescription Expiring Soon - {medication}',
        template: `
            <h2>Prescription Expiration Notice</h2>
            <p>Dear {name},</p>
            <p>Your prescription for <strong>{medication}</strong> is expiring soon and may need renewal from your doctor.</p>
            
            <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f44336;">
                <h3 style="margin-top: 0; color: #c62828;">Expiration Alert</h3>
                <p><strong>Medication:</strong> {medication}</p>
                <p><strong>Expires On:</strong> {expiryDate}</p>
                <p><strong>Days Remaining:</strong> {daysLeft}</p>
                <p><strong>Refills Remaining:</strong> {refills}</p>
            </div>
            
            <h3>What You Need to Do</h3>
            <ol>
                <li>Contact your doctor: {doctor}</li>
                <li>Request a prescription renewal</li>
                <li>Have your doctor send the new prescription to GW Pharmacy</li>
            </ol>
            
            <div style="background: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 20px 0;">
                <p style="margin: 0;"><strong>✅ We Can Help:</strong> Call us at (202) 555-MEDS and we'll contact your doctor for you!</p>
            </div>
            
            <p>Don't let your medication run out. Act now to ensure continuous treatment.</p>
            
            <p>Best regards,<br>GW Pharmacy Team</p>
        `
    }
};

/**
 * Email Service Class
 */
class EmailService {
    constructor(config) {
        this.config = config;
        this.emailHistory = this.loadHistory();
    }

    /**
     * Load email history from localStorage
     */
    loadHistory() {
        return JSON.parse(localStorage.getItem('gwpharmacy_email_history') || '[]');
    }

    /**
     * Save email history
     */
    saveHistory() {
        localStorage.setItem('gwpharmacy_email_history', JSON.stringify(this.emailHistory));
    }

    /**
     * Send email using EmailJS or fallback
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} html - HTML content
     * @returns {Promise<Object>} Send result
     */
    async sendEmail(to, subject, html) {
        // Try EmailJS if configured
        if (this.config.useEmailJS && typeof emailjs !== 'undefined') {
            try {
                const result = await this.sendViaEmailJS(to, subject, html);
                return result;
            } catch (error) {
                console.warn('⚠️ EmailJS failed, using fallback:', error);
                if (!this.config.useFallback) {
                    throw error;
                }
                // Fall through to simulation mode
            }
        }

        // Simulation mode
        return this.sendSimulatedEmail(to, subject, html);
    }

    /**
     * Send email via EmailJS
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} html - HTML content
     * @returns {Promise<Object>} Send result
     */
    async sendViaEmailJS(to, subject, html) {
        if (!EMAILJS_CONFIG.enabled) {
            throw new Error('EmailJS not configured');
        }

        console.log('🔵 Attempting EmailJS send with:', {
            serviceId: EMAILJS_CONFIG.serviceId,
            templateId: EMAILJS_CONFIG.templateId,
            to: to,
            subject: subject
        });

        const templateParams = {
            to_email: to,
            from_name: this.config.fromName,
            from_email: this.config.fromEmail,
            reply_to: this.config.replyTo,
            subject: subject,
            message_html: html
        };

        try {
            const response = await emailjs.send(
                EMAILJS_CONFIG.serviceId,
                EMAILJS_CONFIG.templateId,
                templateParams,
                EMAILJS_CONFIG.publicKey
            );

            console.log('✅ EmailJS API Response:', response);

            const emailRecord = {
                id: response.text || `email-${Date.now()}`,
                to: to,
                from: this.config.fromEmail,
                subject: subject,
                html: html,
                timestamp: new Date().toISOString(),
                status: 'sent',
                mock: false,
                provider: 'emailjs'
            };

            this.emailHistory.unshift(emailRecord);
            if (this.emailHistory.length > 100) {
                this.emailHistory = this.emailHistory.slice(0, 100);
            }
            this.saveHistory();

            console.log('📧 Real Email Sent via EmailJS:', {
                to: to,
                subject: subject,
                messageId: emailRecord.id
            });

            return {
                success: true,
                messageId: emailRecord.id,
                mock: false,
                provider: 'emailjs'
            };
        } catch (error) {
            console.error('❌ EmailJS send failed:', error);
            throw error;
        }

        return {
            success: true,
            messageId: emailRecord.id,
            mock: false,
            provider: 'emailjs'
        };
    }

    /**
     * Send simulated email for testing
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} html - HTML content
     * @returns {Promise<Object>} Send result
     */
    async sendSimulatedEmail(to, subject, html) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const emailRecord = {
                    id: `email-${Date.now()}`,
                    to: to,
                    from: this.config.fromEmail,
                    subject: subject,
                    html: html,
                    timestamp: new Date().toISOString(),
                    status: 'sent',
                    simulated: true
                };

                this.emailHistory.unshift(emailRecord);
                if (this.emailHistory.length > 100) {
                    this.emailHistory = this.emailHistory.slice(0, 100);
                }
                this.saveHistory();

                console.log('📧 Simulated Email:', {
                    to: to,
                    subject: subject,
                    simulated: true
                });

                resolve({
                    success: true,
                    messageId: emailRecord.id,
                    simulated: true
                });
            }, 500);
        });
    }

    /**
     * Send templated email
     * @param {string} to - Recipient email
     * @param {string} templateName - Template name
     * @param {Object} variables - Template variables
     * @returns {Promise<Object>} Send result
     */
    async sendTemplatedEmail(to, templateName, variables) {
        const template = EMAIL_TEMPLATES[templateName];
        if (!template) {
            throw new Error(`Template ${templateName} not found`);
        }

        let subject = template.subject;
        let html = template.template;

        // Replace variables
        for (const [key, value] of Object.entries(variables)) {
            subject = subject.replace(`{${key}}`, value);
            html = html.replace(new RegExp(`{${key}}`, 'g'), value);
        }

        // Wrap in email layout
        html = this.wrapEmailLayout(html);

        return this.sendEmail(to, subject, html);
    }

    /**
     * Wrap content in email layout
     * @param {string} content - Email content
     * @returns {string} Complete HTML
     */
    wrapEmailLayout(content) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GW Pharmacy</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">
                                🏥 GW Pharmacy
                            </h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Your Trusted Healthcare Partner</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            ${content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 0; color: #666; font-size: 12px;">
                                GW Pharmacy | 123 University Blvd, Washington DC 20052<br>
                                Phone: (202) 555-MEDS | Email: support@ndleleni.com<br>
                                <a href="#" style="color: #667eea;">Unsubscribe</a> | <a href="#" style="color: #667eea;">Privacy Policy</a>
                            </p>
                            <p style="margin: 10px 0 0 0; color: #999; font-size: 11px;">
                                © 2025 GW Pharmacy. All rights reserved. HIPAA Compliant.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
    }

    /**
     * Send order confirmation email
     * @param {Object} order - Order object
     * @param {Object} user - User object
     * @returns {Promise<Object>} Send result
     */
    async sendOrderConfirmation(order, user) {
        const itemsHtml = order.items.map(item => `
            <div style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
                <strong>${item.medicationName}</strong> - ${item.dosage}<br>
                Quantity: ${item.quantity || 1} | Copay: $${(item.copay || 0).toFixed(2)}
            </div>
        `).join('');

        // Ensure pickup location is available
        const pickupLocation = order.pickupLocation || {
            name: 'Main Pharmacy Counter',
            address: 'GW Hospital, 900 23rd St NW, Washington DC 20037',
            hours: 'Mon-Fri 9AM-6PM, Sat 10AM-4PM'
        };

        const variables = {
            name: user.firstName || user.name,
            orderNumber: order.orderNumber,
            orderDate: new Date(order.orderDate).toLocaleString(),
            total: `$${(order.total || 0).toFixed(2)}`,
            readyTime: new Date(order.estimatedReady).toLocaleString(),
            location: pickupLocation.name,
            address: pickupLocation.address,
            hours: pickupLocation.hours,
            items: itemsHtml
        };

        console.log('📧 Sending order confirmation email with pickup location:', pickupLocation.name);

        return this.sendTemplatedEmail(user.email, 'ORDER_CONFIRMATION', variables);
    }

    /**
     * Send order ready email
     * @param {Object} order - Order object
     * @param {Object} user - User object
     * @returns {Promise<Object>} Send result
     */
    async sendOrderReady(order, user) {
        const variables = {
            name: user.firstName || user.name,
            orderNumber: order.orderNumber,
            location: order.pickupLocation.name,
            address: order.pickupLocation.address,
            pickupCode: order.pickupCode || Math.floor(100000 + Math.random() * 900000).toString(),
            hours: order.pickupLocation.hours || 'Mon-Fri 9AM-6PM'
        };

        return this.sendTemplatedEmail(user.email, 'ORDER_READY', variables);
    }

    /**
     * Send refill reminder email
     * @param {Object} prescription - Prescription object
     * @param {Object} user - User object
     * @returns {Promise<Object>} Send result
     */
    async sendRefillReminder(prescription, user) {
        const variables = {
            name: user.firstName || user.name,
            medication: prescription.medicationName,
            dosage: prescription.dosage,
            refills: prescription.refillsRemaining,
            lastFilled: prescription.lastFilledDate ? new Date(prescription.lastFilledDate).toLocaleDateString() : 'N/A'
        };

        return this.sendTemplatedEmail(user.email, 'REFILL_REMINDER', variables);
    }

    /**
     * Send expiry warning email
     * @param {Object} prescription - Prescription object
     * @param {Object} user - User object
     * @returns {Promise<Object>} Send result
     */
    async sendExpiryWarning(prescription, user) {
        const expiryDate = new Date(prescription.expiryDate);
        const now = new Date();
        const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

        const variables = {
            name: user.firstName || user.name,
            medication: prescription.medicationName,
            expiryDate: expiryDate.toLocaleDateString(),
            daysLeft: daysLeft,
            refills: prescription.refillsRemaining,
            doctor: prescription.prescribedBy || 'your doctor'
        };

        return this.sendTemplatedEmail(user.email, 'EXPIRY_WARNING', variables);
    }

    /**
     * Get email history
     * @param {number} limit - Number of emails to return
     * @returns {Array} Email history
     */
    getEmailHistory(limit = 50) {
        return this.emailHistory.slice(0, limit);
    }

    /**
     * Get email statistics
     * @returns {Object} Email stats
     */
    getEmailStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        return {
            total: this.emailHistory.length,
            today: this.emailHistory.filter(e => new Date(e.timestamp) >= today).length,
            thisWeek: this.emailHistory.filter(e => new Date(e.timestamp) >= weekAgo).length,
            sent: this.emailHistory.filter(e => e.status === 'sent').length
        };
    }
}

// Initialize email service
const emailService = new EmailService(EMAIL_CONFIG);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EmailService, emailService, EMAIL_TEMPLATES };
}
