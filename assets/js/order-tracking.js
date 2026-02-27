// Order Tracking System
// Real-time prescription order tracking with status updates

/**
 * Order Tracking Service
 */
class OrderTrackingService {
    constructor() {
        this.statusStages = [
            { id: 'received', name: 'Order Received', icon: 'bi-check-circle' },
            { id: 'processing', name: 'Processing', icon: 'bi-hourglass-split' },
            { id: 'filling', name: 'Filling Prescription', icon: 'bi-capsule' },
            { id: 'quality_check', name: 'Quality Check', icon: 'bi-shield-check' },
            { id: 'ready', name: 'Ready for Pickup', icon: 'bi-box-seam' },
            { id: 'completed', name: 'Picked Up', icon: 'bi-check-circle-fill' }
        ];
    }

    /**
     * Get order by ID
     * @param {string} orderId - Order number
     * @returns {Object} Order object
     */
    getOrder(orderId) {
        // Use MOCK_DATA as source of truth, fallback to localStorage
        const orders = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.orders) 
            ? MOCK_DATA.orders 
            : JSON.parse(localStorage.getItem('gwpharmacy_orders') || '[]');
        return orders.find(order => order.orderNumber === orderId);
    }

    /**
     * Update order status
     * @param {string} orderId - Order number
     * @param {string} newStatus - New status
     */
    updateOrderStatus(orderId, newStatus) {
        // Use MOCK_DATA as source of truth, fallback to localStorage
        let orders = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.orders) 
            ? [...MOCK_DATA.orders] 
            : JSON.parse(localStorage.getItem('gwpharmacy_orders') || '[]');
        const order = orders.find(o => o.orderNumber === orderId);
        
        if (order) {
            const oldStatus = order.status;
            order.status = newStatus;
            order.statusHistory = order.statusHistory || [];
            order.statusHistory.push({
                status: newStatus,
                timestamp: new Date().toISOString()
            });

            localStorage.setItem('gwpharmacy_orders', JSON.stringify(orders));
            
            // Send notification
            this.sendStatusNotification(order, oldStatus, newStatus);
            
            logAudit('ORDER_STATUS_UPDATE', `Order ${orderId} updated to ${newStatus}`);
        }
    }

    /**
     * Send status update notification
     * @param {Object} order - Order object
     * @param {string} oldStatus - Previous status
     * @param {string} newStatus - New status
     */
    sendStatusNotification(order, oldStatus, newStatus) {
        if (typeof API !== 'undefined') {
            let message = '';
            
            if (newStatus === 'ready') {
                message = `Your order ${order.orderNumber} is ready for pickup!`;
                
                // Send SMS if enabled
                API.sendNotification({
                    type: 'order-ready',
                    orderId: order.orderNumber,
                    order: order
                });
            } else if (newStatus === 'processing') {
                message = `Your order ${order.orderNumber} is being processed.`;
            } else if (newStatus === 'filling') {
                message = `Your prescription is being filled.`;
            }

            if (message) {
                this.showNotification('Order Update', message);
            }
        }
    }

    /**
     * Show browser notification
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     */
    showNotification(title, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/assets/images/icon-192x192.png',
                badge: '/assets/images/badge-icon.png'
            });
        }
    }

    /**
     * Get current status stage index
     * @param {string} status - Current status
     * @returns {number} Stage index
     */
    getStatusIndex(status) {
        return this.statusStages.findIndex(stage => stage.id === status);
    }

    /**
     * Check if status is completed
     * @param {string} currentStatus - Current order status
     * @param {string} checkStatus - Status to check
     * @returns {boolean} True if completed
     */
    isStatusCompleted(currentStatus, checkStatus) {
        const currentIndex = this.getStatusIndex(currentStatus);
        const checkIndex = this.getStatusIndex(checkStatus);
        return currentIndex >= checkIndex;
    }

    /**
     * Get estimated time for status
     * @param {string} status - Status stage
     * @returns {string} Estimated time
     */
    getEstimatedTime(status) {
        const times = {
            'received': 'Just now',
            'processing': '15-30 minutes',
            'filling': '1-2 hours',
            'quality_check': '2-3 hours',
            'ready': '3-4 hours',
            'completed': 'Completed'
        };
        return times[status] || 'Unknown';
    }

    /**
     * Simulate order progress (for demo)
     * @param {string} orderId - Order number
     */
    simulateProgress(orderId) {
        let currentStage = 0;
        
        const interval = setInterval(() => {
            if (currentStage < this.statusStages.length) {
                this.updateOrderStatus(orderId, this.statusStages[currentStage].id);
                currentStage++;
            } else {
                clearInterval(interval);
            }
        }, 10000); // Update every 10 seconds for demo

        return interval;
    }

    /**
     * Format status timeline HTML
     * @param {Object} order - Order object
     * @returns {string} HTML string
     */
    formatStatusTimelineHTML(order) {
        const currentIndex = this.getStatusIndex(order.status);
        
        let html = '<div class="order-timeline">';
        
        this.statusStages.forEach((stage, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const stateClass = isCompleted ? 'completed' : 'pending';
            
            html += `
                <div class="timeline-item ${stateClass} ${isCurrent ? 'current' : ''}">
                    <div class="timeline-marker">
                        <i class="${stage.icon} ${isCompleted ? 'text-success' : 'text-muted'}"></i>
                    </div>
                    <div class="timeline-content">
                        <h6 class="mb-0">${stage.name}</h6>
                        <small class="text-muted">
                            ${isCompleted ? this.getStatusTimestamp(order, stage.id) : this.getEstimatedTime(stage.id)}
                        </small>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Get timestamp for status from history
     * @param {Object} order - Order object
     * @param {string} statusId - Status ID
     * @returns {string} Formatted timestamp
     */
    getStatusTimestamp(order, statusId) {
        if (!order.statusHistory) return '';
        
        const history = order.statusHistory.find(h => h.status === statusId);
        if (history) {
            const date = new Date(history.timestamp);
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        }
        return '';
    }

    /**
     * Get estimated completion time
     * @param {Object} order - Order object
     * @returns {Date} Estimated completion date
     */
    getEstimatedCompletion(order) {
        if (order.estimatedReady) {
            return new Date(order.estimatedReady);
        }
        
        // Default to 4 hours from order time
        const orderTime = new Date(order.orderDate);
        return new Date(orderTime.getTime() + 4 * 60 * 60 * 1000);
    }

    /**
     * Get time remaining until ready
     * @param {Object} order - Order object
     * @returns {string} Formatted time remaining
     */
    getTimeRemaining(order) {
        if (order.status === 'ready' || order.status === 'completed') {
            return 'Ready now';
        }

        const completion = this.getEstimatedCompletion(order);
        const now = new Date();
        const diff = completion.getTime() - now.getTime();

        if (diff <= 0) {
            return 'Ready soon';
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m remaining`;
        } else {
            return `${minutes}m remaining`;
        }
    }
}

// Initialize order tracking service
const orderTrackingService = new OrderTrackingService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OrderTrackingService, orderTrackingService };
}
