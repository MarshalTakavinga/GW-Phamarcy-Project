async function loadDashboard() {
    try {
        updateUserName();
        
        // Ensure data is initialized
        if (typeof MOCK_DATA !== 'undefined') {
            // Check if notifications exist, if not initialize
            const existingNotifications = localStorage.getItem('gwpharmacy_notifications');
            if (!existingNotifications) {
                console.log('[Dashboard] Initializing notifications');
                localStorage.setItem('gwpharmacy_notifications', JSON.stringify(MOCK_DATA.notifications));
            }
            
            // Ensure prescriptions and orders are synchronized
            localStorage.setItem('gwpharmacy_prescriptions', JSON.stringify(MOCK_DATA.prescriptions));
            if (MOCK_DATA.orders) {
                localStorage.setItem('gwpharmacy_orders', JSON.stringify(MOCK_DATA.orders));
            }
        }
        
        await loadDashboardStats();
        await loadNotifications();
        await loadRecentPrescriptions();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showAlert('Error loading dashboard data. Please refresh the page.', 'danger');
    }
}

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
    const prescriptions = await API.getPrescriptions();
    
    // Count only active prescriptions (not expiring-soon)
    const activePrescriptions = prescriptions.filter(rx => 
        rx.status && rx.status.toLowerCase() === 'active'
    ).length;
    
    const orders = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.orders) ? MOCK_DATA.orders : [];
    
    // Handle different status formats (lowercase vs proper case)
    const pendingRefills = orders.filter(order => {
        const status = order.status ? order.status.toLowerCase() : '';
        return status === 'processing' || status === 'pending';
    }).length;
    
    const readyPickup = orders.filter(order => {
        const status = order.status ? order.status.toLowerCase() : '';
        return status === 'ready' || status === 'ready for pickup';
    }).length;
    
    // Count prescriptions expiring within 30 days
    const expiringSoon = prescriptions.filter(rx => {
        const expiryDate = new Date(rx.expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    }).length;
    
    document.getElementById('active-prescriptions-count').textContent = activePrescriptions;
    document.getElementById('pending-refills-count').textContent = pendingRefills;
    document.getElementById('ready-pickup-count').textContent = readyPickup;
    document.getElementById('expiring-soon-count').textContent = expiringSoon;
}

/**
 * Load notifications
 */
async function loadNotifications() {
    const notifications = await API.getNotifications();
    const container = document.getElementById('notifications-container');
    
    const unreadNotifications = notifications.filter(n => !n.read);
    
    if (unreadNotifications.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-3">
                <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                No new notifications
            </div>
        `;
        return;
    }
    
    container.innerHTML = unreadNotifications.map(notification => `
        <div class="alert alert-${notification.variant} alert-dismissible fade show" role="alert">
            <i class="${notification.icon} me-2"></i>
            <strong>${notification.title}:</strong> ${notification.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" 
                    onclick="markNotificationRead(${notification.id})"></button>
        </div>
    `).join('');
}

/**
 * Mark notification as read
 * @param {number} notificationId - Notification ID
 */
async function markNotificationRead(notificationId) {
    await API.markNotificationRead(notificationId);
}

/**
 * Load recent prescriptions
 */
async function loadRecentPrescriptions() {
    const prescriptions = await API.getPrescriptions();
    const container = document.getElementById('recent-prescriptions-container');
    
    const recentPrescriptions = prescriptions.slice(0, 5);
    
    if (recentPrescriptions.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-3">
                <p>No prescriptions found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Medication</th>
                        <th>Dosage</th>
                        <th>Refills Left</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentPrescriptions.map(rx => {
                        // Dynamically calculate status based on expiry date
                        const expiryDate = new Date(rx.expiryDate);
                        const today = new Date();
                        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                        
                        let displayStatus = rx.status;
                        if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
                            displayStatus = 'expiring-soon';
                        } else if (daysUntilExpiry <= 0) {
                            displayStatus = 'expired';
                        }
                        
                        return `
                        <tr>
                            <td>
                                <strong>${rx.medicationName}</strong><br>
                                <small class="text-muted">Prescribed by ${rx.prescribedBy}</small>
                            </td>
                            <td>${rx.dosage}</td>
                            <td>${rx.refillsRemaining}</td>
                            <td>
                                <span class="badge bg-${getStatusBadgeClass(displayStatus)}">
                                    ${getStatusLabel(displayStatus)}
                                </span>
                            </td>
                            <td>
                                ${rx.refillsRemaining > 0 ? `
                                    <button class="btn btn-sm btn-primary" onclick="quickAddToCart('${rx.id}')">
                                        <i class="bi bi-cart-plus"></i> Refill
                                    </button>
                                ` : `
                                    <button class="btn btn-sm btn-secondary" disabled>
                                        No Refills
                                    </button>
                                `}
                            </td>
                        </tr>
                    `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Quick add to cart from dashboard
 * @param {string} prescriptionId - Prescription ID
 */
async function quickAddToCart(prescriptionId) {
    try {
        const button = event.target.closest('button');
        const originalContent = button.innerHTML;
        
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
        
        const success = await API.addToCart(prescriptionId);
        
        if (success) {
            button.innerHTML = '<i class="bi bi-check-circle"></i> Added';
            button.classList.remove('btn-primary');
            button.classList.add('btn-success');
            
            showAlert('Prescription added to cart successfully!', 'success');
            updateCartCount();
            
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.classList.remove('btn-success');
                button.classList.add('btn-primary');
                button.disabled = false;
            }, 2000);
        } else {
            button.innerHTML = originalContent;
            button.disabled = false;
            showAlert('Error adding prescription to cart.', 'danger');
        }
    } catch (error) {
        console.error('Error in quickAddToCart:', error);
        showAlert('Error adding prescription to cart.', 'danger');
    }
}

/**
 * Get status badge CSS class
 * @param {string} status - Prescription status
 * @returns {string} Badge class
 */
function getStatusBadgeClass(status) {
    const classes = {
        'active': 'success',
        'pending': 'warning',
        'ready': 'info',
        'expired': 'danger',
        'expiring-soon': 'warning'
    };
    return classes[status] || 'secondary';
}

/**
 * Get status label
 * @param {string} status - Prescription status
 * @returns {string} Status label
 */
function getStatusLabel(status) {
    const labels = {
        'active': 'Active',
        'pending': 'Pending',
        'ready': 'Ready',
        'expired': 'Expired',
        'expiring-soon': 'Expiring Soon'
    };
    return labels[status] || status;
}
