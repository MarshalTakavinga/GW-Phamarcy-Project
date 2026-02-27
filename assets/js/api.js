const API = {
    /**
     * Get all prescriptions for current user
     * @returns {Promise<Array>} List of prescriptions
     */
    getPrescriptions: function() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Get prescriptions from data source
                const prescriptions = typeof MOCK_DATA !== 'undefined' ? MOCK_DATA.prescriptions : [];
                
                // Also store in localStorage for offline access
                localStorage.setItem('gwpharmacy_prescriptions', JSON.stringify(prescriptions));
                
                logAudit('API_CALL', 'Fetched prescriptions list');
                resolve(prescriptions);
            }, 500);
        });
    },

    /**
     * Get prescription by ID
     * @param {string} id - Prescription ID
     * @returns {Promise<Object>} Prescription object
     */
    getPrescriptionById: function(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const prescription = MOCK_DATA.prescriptions.find(p => p.id === id);
                if (prescription) {
                    logAudit('API_CALL', `Fetched prescription ${id}`);
                    resolve(prescription);
                } else {
                    reject(new Error('Prescription not found'));
                }
            }, 300);
        });
    },

    /**
     * Add prescription to cart
     * @param {string} prescriptionId - Prescription ID
     * @returns {Promise<boolean>} Success status
     */
    addToCart: function(prescriptionId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const prescription = MOCK_DATA.prescriptions.find(p => p.id === prescriptionId);
                if (!prescription) {
                    console.error('Prescription not found:', prescriptionId);
                    resolve(false);
                    return;
                }

                let cart = JSON.parse(localStorage.getItem('gwpharmacy_cart') || '[]');
                
                const existingItem = cart.find(item => item.id === prescriptionId);
                
                if (existingItem) {
                    existingItem.quantity = (existingItem.quantity || 1) + 1;
                    existingItem.updatedAt = new Date().toISOString();
                    console.log('Increased quantity for:', prescription.medicationName, 'New quantity:', existingItem.quantity);
                } else {
                    cart.push({
                        id: prescription.id,
                        medicationName: prescription.medicationName,
                        dosage: prescription.dosage,
                        quantity: 1,
                        prescriptionQuantity: prescription.quantity,
                        copay: prescription.copay,
                        fullPrice: prescription.fullPrice,
                        addedAt: new Date().toISOString()
                    });
                    console.log('Added to cart:', prescription.medicationName);
                }

                localStorage.setItem('gwpharmacy_cart', JSON.stringify(cart));
                logAudit('CART_ADD', `Added/Updated ${prescription.medicationName} in cart`);
                
                if (typeof updateCartCount === 'function') {
                    updateCartCount();
                }
                
                resolve(true);
            }, 300);
        });
    },

    /**
     * Remove prescription from cart
     * @param {string} prescriptionId - Prescription ID
     * @returns {Promise<boolean>} Success status
     */
    removeFromCart: function(prescriptionId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let cart = JSON.parse(localStorage.getItem('gwpharmacy_cart') || '[]');
                cart = cart.filter(item => item.id !== prescriptionId);
                localStorage.setItem('gwpharmacy_cart', JSON.stringify(cart));
                logAudit('CART_REMOVE', `Removed prescription ${prescriptionId} from cart`);
                updateCartCount();
                resolve(true);
            }, 200);
        });
    },

    /**
     * Get cart items
     * @returns {Promise<Array>} Cart items
     */
    getCart: function() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const cart = JSON.parse(localStorage.getItem('gwpharmacy_cart') || '[]');
                resolve(cart);
            }, 200);
        });
    },

    /**
     * Clear cart
     * @returns {Promise<boolean>} Success status
     */
    clearCart: function() {
        return new Promise((resolve) => {
            setTimeout(() => {
                localStorage.removeItem('gwpharmacy_cart');
                localStorage.removeItem('gwpharmacy_pickup_location');
                updateCartCount();
                logAudit('CART_CLEAR', 'Cart cleared');
                resolve(true);
            }, 200);
        });
    },

    /**
     * Process payment
     * @param {Object} paymentData - Payment information
     * @returns {Promise<Object>} Order confirmation
     */
    processPayment: function(paymentData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Validate card number (basic check)
                if (!validateCardNumber(paymentData.cardNumber)) {
                    reject(new Error('Invalid card number'));
                    return;
                }

                // Generate order number
                const orderNumber = generateOrderNumber();
                const cart = JSON.parse(localStorage.getItem('gwpharmacy_cart') || '[]');
                const pickupLocation = localStorage.getItem('gwpharmacy_pickup_location');

                const order = {
                    orderNumber,
                    items: cart,
                    pickupLocation: getPickupLocationById(pickupLocation),
                    total: paymentData.amount,
                    paymentMethod: `Card ending in ${paymentData.cardNumber.slice(-4)}`,
                    orderDate: new Date().toISOString(),
                    status: 'processing',
                    estimatedReady: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours
                };

                // Save order to history
                let orderHistory = JSON.parse(localStorage.getItem('gwpharmacy_orders') || '[]');
                orderHistory.unshift(order);
                localStorage.setItem('gwpharmacy_orders', JSON.stringify(orderHistory));

                logAudit('PAYMENT_SUCCESS', `Order ${orderNumber} created successfully`);
                
                // Send notification with order details for SMS
                API.sendNotification({
                    type: 'order-confirmation',
                    orderId: orderNumber,
                    order: order
                });

                resolve(order);
            }, 2000);
        });
    },

    /**
     * Get pickup locations
     * @returns {Promise<Array>} List of pickup locations
     */
    getPickupLocations: function() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_DATA.pickupLocations);
            }, 300);
        });
    },

    /**
     * Save pickup location
     * @param {string} locationId - Location ID
     * @returns {Promise<boolean>} Success status
     */
    savePickupLocation: function(locationId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                localStorage.setItem('gwpharmacy_pickup_location', locationId);
                logAudit('PICKUP_LOCATION', `Pickup location set to ${locationId}`);
                resolve(true);
            }, 200);
        });
    },

    /**
     * Get notifications
     * @returns {Promise<Array>} List of notifications
     */
    getNotifications: function() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Check if notifications exist in localStorage
                let notifications = localStorage.getItem('gwpharmacy_notifications');
                
                if (!notifications) {
                // Initialize notifications if needed
                console.log('[API] Initializing notifications');
                const initialNotifications = JSON.parse(JSON.stringify(MOCK_DATA.notifications));
                    localStorage.setItem('gwpharmacy_notifications', JSON.stringify(initialNotifications));
                    resolve(initialNotifications);
                } else {
                    // Return existing notifications
                    resolve(JSON.parse(notifications));
                }
            }, 300);
        });
    },

    /**
     * Mark notification as read
     * @param {number} notificationId - Notification ID
     * @returns {Promise<boolean>} Success status
     */
    markNotificationRead: function(notificationId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let notifications = localStorage.getItem('gwpharmacy_notifications');
                
                if (!notifications) {
                    // Initialize if not exists
                    notifications = JSON.stringify(MOCK_DATA.notifications);
                    localStorage.setItem('gwpharmacy_notifications', notifications);
                }
                
                const notificationList = JSON.parse(notifications);
                const notification = notificationList.find(n => n.id === notificationId);
                
                if (notification) {
                    notification.read = true;
                    localStorage.setItem('gwpharmacy_notifications', JSON.stringify(notificationList));
                }
                
                resolve(true);
            }, 200);
        });
    },

    /**
     * Generate notifications based on current prescriptions and orders
     * @returns {Promise<Array>} Generated notifications
     */
    generateNotifications: function() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const notifications = [];
                const now = new Date();
                let notificationId = Date.now();
                
                // Check prescriptions for notifications
                MOCK_DATA.prescriptions.forEach(prescription => {
                    // Check for expiring prescriptions (within 30 days)
                    const expiryDate = new Date(prescription.expiryDate);
                    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
                    
                    if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
                        notifications.push({
                            id: notificationId++,
                            type: 'expiring-soon',
                            title: 'Prescription Expiring Soon',
                            message: `Your ${prescription.medicationName} prescription will expire in ${daysUntilExpiry} days.`,
                            date: now.toISOString(),
                            read: false,
                            icon: 'bi-exclamation-triangle',
                            variant: 'warning'
                        });
                    }
                    
                    // Check for refills needed
                    if (prescription.refillsRemaining > 0 && prescription.lastFilledDate) {
                        const lastFilled = new Date(prescription.lastFilledDate);
                        const daysSinceLastFill = Math.floor((now - lastFilled) / (1000 * 60 * 60 * 24));
                        const daysSupply = prescription.daysSupply || 30;
                        const daysLeft = daysSupply - daysSinceLastFill;
                        
                        if (daysLeft <= 7 && daysLeft > 0) {
                            notifications.push({
                                id: notificationId++,
                                type: 'refill-reminder',
                                title: 'Refill Reminder',
                                message: `Your ${prescription.medicationName} has ${daysLeft} days of supply left. ${prescription.refillsRemaining} refills remaining.`,
                                date: now.toISOString(),
                                read: false,
                                icon: 'bi-prescription2',
                                variant: 'info'
                            });
                        }
                    }
                });
                
                // Check orders for ready status
                if (MOCK_DATA.orders) {
                    MOCK_DATA.orders.forEach(order => {
                        if (order.status === 'ready') {
                            notifications.push({
                                id: notificationId++,
                                type: 'order-ready',
                                title: 'Order Ready for Pickup',
                                message: `Your order ${order.orderNumber} is ready at ${order.pickupLocationName}.`,
                                date: order.actualReady || now.toISOString(),
                                read: false,
                                icon: 'bi-check-circle',
                                variant: 'success'
                            });
                        }
                    });
                }
                
                // Save generated notifications
                if (notifications.length > 0) {
                    localStorage.setItem('gwpharmacy_notifications', JSON.stringify(notifications));
                }
                
                console.log('[API] Generated', notifications.length, 'notifications');
                resolve(notifications);
            }, 200);
        });
    },

    /**
     * Send notification (email and SMS)
     * @param {Object} notificationData - Notification data
     * @returns {Promise<boolean>} Success status
     */
    sendNotification: function(notificationData) {
        return new Promise(async (resolve) => {
            setTimeout(async () => {
                logAudit('NOTIFICATION_SENT', `Notification sent: ${notificationData.type}`);
                console.log('[NOTIFICATION]', notificationData);
                
                // Get notification preferences and user session
                const defaultPrefs = {
                    emailNotifications: true,
                    smsNotifications: false,
                    pushNotifications: true
                };
                const prefs = JSON.parse(localStorage.getItem('gwpharmacy_notification_prefs') || JSON.stringify(defaultPrefs));
                const session = JSON.parse(localStorage.getItem('gwpharmacy_session'));
                
                if (session && session.user) {
                    const user = session.user;
                    
                    // Send EMAIL notification if enabled
                    if (prefs.emailNotifications !== false && user.email && typeof emailService !== 'undefined') {
                        try {
                            console.log('[EMAIL] Sending notification type:', notificationData.type);
                            if (notificationData.type === 'order-confirmation' && notificationData.order) {
                                await emailService.sendOrderConfirmation(notificationData.order, user);
                            } else if (notificationData.type === 'order-ready' && notificationData.order) {
                                await emailService.sendOrderReady(notificationData.order, user);
                            } else if (notificationData.type === 'refill-reminder' && notificationData.prescription) {
                                await emailService.sendRefillReminder(notificationData.prescription, user);
                            } else if (notificationData.type === 'expiry-warning' && notificationData.prescription) {
                                await emailService.sendExpiryWarning(notificationData.prescription, user);
                            }
                        } catch (error) {
                            console.error('[EMAIL ERROR]', error);
                        }
                    }
                    
                    // Send SMS notification if enabled
                    if (prefs.smsNotifications && user.phone && typeof twilioService !== 'undefined') {
                        try {
                            if (notificationData.type === 'order-confirmation' && notificationData.order) {
                                await twilioService.sendOrderConfirmation(notificationData.order, user);
                            } else if (notificationData.type === 'order-ready' && notificationData.order) {
                                await twilioService.sendOrderReady(notificationData.order, user);
                            } else if (notificationData.type === 'refill-reminder' && notificationData.prescription) {
                                await twilioService.sendRefillReminder(notificationData.prescription, user);
                            } else if (notificationData.type === 'expiry-warning' && notificationData.prescription) {
                                await twilioService.sendExpiryWarning(notificationData.prescription, user);
                            }
                        } catch (error) {
                            console.error('[SMS ERROR]', error);
                        }
                    }
                }
                
                resolve(true);
            }, 100);
        });
    },

    /**
     * Update user profile
     * @param {Object} profileData - Profile data
     * @returns {Promise<boolean>} Success status
     */
    updateProfile: function(profileData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const session = JSON.parse(localStorage.getItem('gwpharmacy_session'));
                if (session && session.user) {
                    // Update user data in session
                    Object.assign(session.user, profileData);
                    localStorage.setItem('gwpharmacy_session', JSON.stringify(session));
                    
                    // Update in data store for session persistence
                    if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.users) {
                        const userIndex = MOCK_DATA.users.findIndex(u => u.email === session.user.email);
                        if (userIndex !== -1) {
                            Object.assign(MOCK_DATA.users[userIndex], profileData);
                        }
                    }
                    
                    logAudit('PROFILE_UPDATE', 'User profile updated');
                }
                resolve(true);
            }, 500);
        });
    },

    /**
     * Update notification preferences
     * @param {Object} preferences - Notification preferences
     * @returns {Promise<boolean>} Success status
     */
    updateNotificationPreferences: function(preferences) {
        return new Promise((resolve) => {
            setTimeout(() => {
                localStorage.setItem('gwpharmacy_notification_prefs', JSON.stringify(preferences));
                logAudit('NOTIFICATION_PREFS', 'Notification preferences updated');
                resolve(true);
            }, 300);
        });
    }
};
