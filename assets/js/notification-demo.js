// Notification Demo/Testing Module
// For presentation and demonstration purposes

/**
 * Initialize notification demo functionality
 */
function initNotificationDemo() {
    console.log('[DEMO] Notification demo initialized');
    
    // Add click handlers to dashboard stat cards
    const pendingRefillsCard = document.getElementById('pending-refills-card');
    const readyPickupCard = document.getElementById('ready-pickup-card');
    const expiringSoonCard = document.getElementById('expiring-soon-card');
    
    if (pendingRefillsCard) {
        pendingRefillsCard.addEventListener('click', () => sendRefillReminderDemo());
        pendingRefillsCard.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') sendRefillReminderDemo();
        });
    }
    
    if (readyPickupCard) {
        readyPickupCard.addEventListener('click', () => sendReadyForPickupDemo());
        readyPickupCard.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') sendReadyForPickupDemo();
        });
    }
    
    if (expiringSoonCard) {
        expiringSoonCard.addEventListener('click', () => sendExpiryWarningDemo());
        expiringSoonCard.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') sendExpiryWarningDemo();
        });
    }
}

/**
 * Send demo refill reminder notification
 */
async function sendRefillReminderDemo() {
    console.log('[DEMO] Sending refill reminder...');
    
    try {
        // Get a prescription that needs refill (low refills remaining)
        const prescriptions = MOCK_DATA.prescriptions.filter(p => 
            p.refillsRemaining <= 2 && p.refillsRemaining > 0
        );
        
        if (prescriptions.length === 0) {
            showDemoAlert('No prescriptions available for refill reminder demo', 'info');
            return;
        }
        
        const prescription = prescriptions[0];
        
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Refill Reminder', {
                body: `Time to refill ${prescription.medicationName}. You have ${prescription.refillsRemaining} refills remaining.`,
                icon: '../assets/images/icon-192x192.png',
                badge: '../assets/images/icon-192x192.png',
                tag: 'refill-reminder'
            });
        }
        
        // Send email notification
        const session = JSON.parse(localStorage.getItem('gwpharmacy_session'));
        if (session && session.user && typeof emailService !== 'undefined') {
            console.log('[DEMO] Sending email for refill reminder...');
            await API.sendNotification({
                type: 'refill-reminder',
                prescription: prescription
            });
            
            showDemoAlert(
                `📧 Refill reminder email sent to ${session.user.email}!<br>` +
                `<small class="d-block mt-2">Medication: ${prescription.medicationName}<br>` +
                `Refills Remaining: ${prescription.refillsRemaining}</small>`,
                'success'
            );
        } else {
            showDemoAlert('Email service not available', 'warning');
        }
        
    } catch (error) {
        console.error('[DEMO] Error sending refill reminder:', error);
        showDemoAlert('Error sending notification: ' + error.message, 'danger');
    }
}

/**
 * Send demo ready for pickup notification
 */
async function sendReadyForPickupDemo() {
    console.log('[DEMO] Sending ready for pickup notification...');
    
    try {
        // Get or create a ready order from MOCK_DATA
        let orders = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.orders) 
            ? [...MOCK_DATA.orders] 
            : JSON.parse(localStorage.getItem('gwpharmacy_orders') || '[]');
        let readyOrder = orders.find(o => o.status === 'ready' || o.status === 'Ready for Pickup');
        
        if (!readyOrder) {
            // Create a demo order
            const pickupLocation = MOCK_DATA.pickupLocations[0];
            readyOrder = {
                orderNumber: `ORD-DEMO-${Date.now()}`,
                items: [MOCK_DATA.prescriptions[0]],
                pickupLocation: pickupLocation,
                total: MOCK_DATA.prescriptions[0].copay,
                orderDate: new Date().toISOString(),
                status: 'Ready for Pickup',
                estimatedReady: new Date().toISOString(),
                pickupCode: Math.floor(100000 + Math.random() * 900000).toString()
            };
            
            orders.unshift(readyOrder);
            localStorage.setItem('gwpharmacy_orders', JSON.stringify(orders));
            
            // Update dashboard counts
            if (typeof loadDashboardStats === 'function') {
                loadDashboardStats();
            }
        }
        
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Prescription Ready for Pickup! 🎉', {
                body: `Order ${readyOrder.orderNumber} is ready at ${readyOrder.pickupLocation.name}. Pickup code: ${readyOrder.pickupCode}`,
                icon: '../assets/images/icon-192x192.png',
                badge: '../assets/images/icon-192x192.png',
                tag: 'order-ready',
                requireInteraction: true
            });
        }
        
        // Send email notification
        const session = JSON.parse(localStorage.getItem('gwpharmacy_session'));
        if (session && session.user && typeof emailService !== 'undefined') {
            console.log('[DEMO] Sending email for order ready...');
            await API.sendNotification({
                type: 'order-ready',
                order: readyOrder
            });
            
            showDemoAlert(
                `📧 Pickup notification email sent to ${session.user.email}!<br>` +
                `<small class="d-block mt-2">Order: ${readyOrder.orderNumber}<br>` +
                `Location: ${readyOrder.pickupLocation.name}<br>` +
                `Pickup Code: <strong>${readyOrder.pickupCode}</strong></small>`,
                'success'
            );
        } else {
            showDemoAlert('Email service not available', 'warning');
        }
        
        // Show order details modal
        showOrderDetailsModal(readyOrder);
        
    } catch (error) {
        console.error('[DEMO] Error sending pickup notification:', error);
        showDemoAlert('Error sending notification: ' + error.message, 'danger');
    }
}

/**
 * Send demo expiry warning notification
 */
async function sendExpiryWarningDemo() {
    console.log('[DEMO] Sending expiry warning...');
    
    try {
        // Get a prescription that's expiring soon
        const expiringPrescriptions = MOCK_DATA.prescriptions.filter(p => {
            const expiryDate = new Date(p.expirationDate);
            const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        });
        
        if (expiringPrescriptions.length === 0) {
            showDemoAlert('No prescriptions expiring soon for demo', 'info');
            return;
        }
        
        const prescription = expiringPrescriptions[0];
        const expiryDate = new Date(prescription.expirationDate);
        const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Prescription Expiring Soon! ⚠️', {
                body: `${prescription.medicationName} expires in ${daysLeft} days. Contact your doctor for renewal.`,
                icon: '../assets/images/icon-192x192.png',
                badge: '../assets/images/icon-192x192.png',
                tag: 'expiry-warning',
                requireInteraction: true
            });
        }
        
        // Send email notification
        const session = JSON.parse(localStorage.getItem('gwpharmacy_session'));
        if (session && session.user && typeof emailService !== 'undefined') {
            console.log('[DEMO] Sending email for expiry warning...');
            await API.sendNotification({
                type: 'expiry-warning',
                prescription: prescription
            });
            
            showDemoAlert(
                `📧 Expiry warning email sent to ${session.user.email}!<br>` +
                `<small class="d-block mt-2">Medication: ${prescription.medicationName}<br>` +
                `Expires: ${expiryDate.toLocaleDateString()}<br>` +
                `Days Left: ${daysLeft} days</small>`,
                'warning'
            );
        } else {
            showDemoAlert('Email service not available', 'warning');
        }
        
    } catch (error) {
        console.error('[DEMO] Error sending expiry warning:', error);
        showDemoAlert('Error sending notification: ' + error.message, 'danger');
    }
}

/**
 * Show order details modal
 */
function showOrderDetailsModal(order) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('orderDetailsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'orderDetailsModal';
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-check-circle-fill me-2"></i>Ready for Pickup
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="orderDetailsContent"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Populate modal content
    const content = document.getElementById('orderDetailsContent');
    content.innerHTML = `
        <div class="text-center mb-4">
            <div class="display-1 text-success mb-3">
                <i class="bi bi-check-circle-fill"></i>
            </div>
            <h4>Your order is ready!</h4>
        </div>
        
        <div class="alert alert-success mb-3">
            <strong>Order Number:</strong> ${order.orderNumber}
        </div>
        
        <div class="card mb-3">
            <div class="card-header bg-light">
                <strong><i class="bi bi-geo-alt-fill me-2"></i>Pickup Location</strong>
            </div>
            <div class="card-body">
                <h6>${order.pickupLocation.name}</h6>
                <p class="mb-1 text-muted"><i class="bi bi-geo-alt me-1"></i>${order.pickupLocation.address}</p>
                <p class="mb-1 text-muted"><i class="bi bi-clock me-1"></i>${order.pickupLocation.hours}</p>
                <p class="mb-0 text-success"><i class="bi bi-check me-1"></i>${order.pickupLocation.availability}</p>
            </div>
        </div>
        
        <div class="card mb-3">
            <div class="card-header bg-light">
                <strong><i class="bi bi-key-fill me-2"></i>Pickup Code</strong>
            </div>
            <div class="card-body text-center">
                <div class="display-4 fw-bold text-success">${order.pickupCode}</div>
                <small class="text-muted">Show this code at pickup</small>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header bg-light">
                <strong><i class="bi bi-box-seam me-2"></i>Items</strong>
            </div>
            <div class="card-body">
                ${order.items.map(item => `
                    <div class="d-flex justify-content-between mb-2">
                        <span>${item.medicationName} ${item.dosage || ''}</span>
                        <span class="text-muted">Qty: ${item.quantity || 1}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="alert alert-info mt-3 mb-0">
            <strong><i class="bi bi-info-circle me-2"></i>What to Bring:</strong>
            <ul class="mb-0 mt-2">
                <li>Valid government-issued ID</li>
                <li>Insurance card (if applicable)</li>
                <li>This pickup code: <strong>${order.pickupCode}</strong></li>
            </ul>
        </div>
    `;
    
    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

/**
 * Show demo alert
 */
function showDemoAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show alert-floating`;
    alert.setAttribute('role', 'alert');
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    }, 8000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotificationDemo);
} else {
    initNotificationDemo();
}
