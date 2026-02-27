async function initCartPage() {
    try {
        updateUserName();
        updateCartCount();
        
        await loadCartItems();
        setupPickupLocationSelector();
        setupCheckoutButton();
        
    } catch (error) {
        console.error('Error loading cart:', error);
        showAlert('Error loading cart. Please refresh the page.', 'danger');
    }
}

/**
 * Load cart items and display
 */
async function loadCartItems() {
    const cart = await API.getCart();
    const container = document.getElementById('cart-items-container');
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="bi bi-cart-x fs-1 d-block mb-3"></i>
                <p>Your cart is empty</p>
                <a href="prescriptions.html" class="btn btn-primary">Browse Prescriptions</a>
            </div>
        `;
        updateOrderSummary(cart);
        return;
    }
    
    container.innerHTML = cart.map((item, index) => {
        const quantity = item.quantity || 1;
        const itemTotal = item.copay * quantity;
        const fullPriceTotal = item.fullPrice * quantity;
        
        return `
        <div class="cart-item mb-3 p-3 border rounded">
            <div class="row align-items-center">
                <div class="col-md-5">
                    <h3 class="h6 mb-1">${item.medicationName}</h3>
                    <p class="text-muted small mb-0">Dosage: ${item.dosage}</p>
                    <p class="text-muted small mb-0">Prescription Qty: ${item.prescriptionQuantity || item.quantity}</p>
                </div>
                <div class="col-md-3 text-center">
                    <div class="d-flex align-items-center justify-content-center gap-2">
                        <button class="btn btn-sm btn-outline-secondary" onclick="decreaseQuantity('${item.id}')">
                            <i class="bi bi-dash"></i>
                        </button>
                        <span class="fw-bold" style="min-width: 30px; text-align: center;">${quantity}</span>
                        <button class="btn btn-sm btn-outline-secondary" onclick="increaseQuantity('${item.id}')">
                            <i class="bi bi-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="col-md-2 text-center">
                    <div class="price-info">
                        <div class="text-muted small text-decoration-line-through">
                            ${formatCurrency(fullPriceTotal)}
                        </div>
                        <div class="h6 text-primary mb-0">
                            ${formatCurrency(itemTotal)}
                        </div>
                        <small class="text-success">Copay</small>
                    </div>
                </div>
                <div class="col-md-2 text-end">
                    <button class="btn btn-outline-danger btn-sm" onclick="removeCartItem('${item.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    updateOrderSummary(cart);
}

/**
 * Remove item from cart
 * @param {string} itemId - Item ID to remove
 */
async function removeCartItem(itemId) {
    try {
        await API.removeFromCart(itemId);
        showAlert('Item removed from cart', 'info');
        await loadCartItems();
        updateCartCount();
    } catch (error) {
        showAlert('Error removing item from cart', 'danger');
    }
}

/**
 * Increase item quantity in cart
 * @param {string} itemId - Item ID
 */
async function increaseQuantity(itemId) {
    try {
        const cart = JSON.parse(localStorage.getItem('gwpharmacy_cart') || '[]');
        const item = cart.find(i => i.id === itemId);
        
        if (item) {
            item.quantity = (item.quantity || 1) + 1;
            item.updatedAt = new Date().toISOString();
            localStorage.setItem('gwpharmacy_cart', JSON.stringify(cart));
            await loadCartItems();
        }
    } catch (error) {
        console.error('Error increasing quantity:', error);
        showAlert('Error updating quantity', 'danger');
    }
}

/**
 * Decrease item quantity in cart
 * @param {string} itemId - Item ID
 */
async function decreaseQuantity(itemId) {
    try {
        const cart = JSON.parse(localStorage.getItem('gwpharmacy_cart') || '[]');
        const item = cart.find(i => i.id === itemId);
        
        if (item) {
            if (item.quantity > 1) {
                item.quantity = item.quantity - 1;
                item.updatedAt = new Date().toISOString();
                localStorage.setItem('gwpharmacy_cart', JSON.stringify(cart));
                await loadCartItems();
            } else {
                // If quantity is 1, remove the item instead
                await removeCartItem(itemId);
            }
        }
    } catch (error) {
        console.error('Error decreasing quantity:', error);
        showAlert('Error updating quantity', 'danger');
    }
}

/**
 * Update order summary
 * @param {Array} cart - Cart items
 */
function updateOrderSummary(cart) {
    const subtotal = cart.reduce((sum, item) => {
        const quantity = item.quantity || 1;
        return sum + (item.fullPrice * quantity);
    }, 0);
    
    const insuranceCoverage = cart.reduce((sum, item) => {
        const quantity = item.quantity || 1;
        return sum + ((item.fullPrice - item.copay) * quantity);
    }, 0);
    
    const processingFee = cart.length > 0 ? 2.50 : 0;
    
    const totalCopay = cart.reduce((sum, item) => {
        const quantity = item.quantity || 1;
        return sum + (item.copay * quantity);
    }, 0) + processingFee;
    
    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('insurance-coverage').textContent = '-' + formatCurrency(insuranceCoverage);
    document.getElementById('processing-fee').textContent = formatCurrency(processingFee);
    document.getElementById('total-copay').textContent = formatCurrency(totalCopay);
}

/**
 * Setup pickup location selector
 */
function setupPickupLocationSelector() {
    const selector = document.getElementById('pickup-location');
    const checkoutBtn = document.getElementById('proceed-checkout-btn');
    
    // Load saved location
    const savedLocation = localStorage.getItem('gwpharmacy_pickup_location');
    if (savedLocation) {
        selector.value = savedLocation;
        checkoutBtn.disabled = false;
    }
    
    selector.addEventListener('change', async function() {
        if (this.value) {
            await API.savePickupLocation(this.value);
            checkoutBtn.disabled = false;
        } else {
            checkoutBtn.disabled = true;
        }
    });
}

/**
 * Setup checkout button
 */
function setupCheckoutButton() {
    const checkoutBtn = document.getElementById('proceed-checkout-btn');
    
    checkoutBtn.addEventListener('click', function() {
        const cart = JSON.parse(localStorage.getItem('gwpharmacy_cart') || '[]');
        const pickupLocation = localStorage.getItem('gwpharmacy_pickup_location');
        
        if (cart.length === 0) {
            showAlert('Your cart is empty', 'warning');
            return;
        }
        
        if (!pickupLocation) {
            showAlert('Please select a pickup location', 'warning');
            return;
        }
        
        window.location.href = 'checkout.html';
    });
}

/**
 * Initialize checkout page
 */
async function initCheckoutPage() {
    try {
        updateUserName();
        
        await loadCheckoutSummary();
        setupPaymentForm();
        
    } catch (error) {
        console.error('Error loading checkout:', error);
        showAlert('Error loading checkout. Please try again.', 'danger');
    }
}

/**
 * Load checkout summary
 */
async function loadCheckoutSummary() {
    const cart = await API.getCart();
    const pickupLocationId = localStorage.getItem('gwpharmacy_pickup_location');
    const pickupLocation = getPickupLocationById(pickupLocationId);
    
    // Display pickup information
    const pickupInfoContainer = document.getElementById('pickup-info-container');
    if (pickupLocation) {
        pickupInfoContainer.innerHTML = `
            <div class="d-flex align-items-start">
                <i class="bi bi-geo-alt-fill text-primary fs-4 me-3"></i>
                <div>
                    <strong>${pickupLocation.name}</strong><br>
                    <small class="text-muted">${pickupLocation.address}</small><br>
                    <small class="text-muted">Hours: ${pickupLocation.hours}</small><br>
                    <small class="text-success">Ready for pickup in ${pickupLocation.availability}</small>
                </div>
            </div>
        `;
    }
    
    // Display order items summary
    const summaryContainer = document.getElementById('order-items-summary');
    summaryContainer.innerHTML = cart.map(item => {
        const quantity = item.quantity || 1;
        const itemTotal = item.copay * quantity;
        return `
        <div class="d-flex justify-content-between mb-2">
            <span>${item.medicationName} <small class="text-muted">(x${quantity})</small></span>
            <span>${formatCurrency(itemTotal)}</span>
        </div>
        `;
    }).join('');
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => {
        const quantity = item.quantity || 1;
        return sum + (item.fullPrice * quantity);
    }, 0);
    
    const insuranceCoverage = cart.reduce((sum, item) => {
        const quantity = item.quantity || 1;
        return sum + ((item.fullPrice - item.copay) * quantity);
    }, 0);
    
    const processingFee = 2.50;
    
    const totalCopay = cart.reduce((sum, item) => {
        const quantity = item.quantity || 1;
        return sum + (item.copay * quantity);
    }, 0) + processingFee;
    
    document.getElementById('summary-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('summary-insurance').textContent = '-' + formatCurrency(insuranceCoverage);
    document.getElementById('summary-fee').textContent = formatCurrency(processingFee);
    document.getElementById('summary-total').textContent = formatCurrency(totalCopay);
}

/**
 * Setup payment form
 */
function setupPaymentForm() {
    const form = document.getElementById('payment-form');
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    const cardCvvInput = document.getElementById('card-cvv');
    
    // Format card number input
    cardNumberInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = formatCardNumber(value);
        e.target.value = formattedValue;
    });
    
    // Format expiry date
    cardExpiryInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });
    
    // CVV input validation
    cardCvvInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
    });
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('[CHECKOUT] Form submitted');
        
        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            console.log('[CHECKOUT] Form validation failed');
            
            // Show which fields are invalid
            const invalidFields = form.querySelectorAll(':invalid');
            console.log('[CHECKOUT] Invalid fields:', invalidFields);
            invalidFields.forEach(field => {
                console.log('- Invalid field:', field.id || field.name, field.validationMessage);
            });
            return;
        }
        
        console.log('[CHECKOUT] Form valid, processing payment...');
        await processCheckout();
    });
}

console.log('[CART] Payment form setup complete');

/**
 * Process checkout
 */
async function processCheckout() {
    const submitBtn = document.getElementById('submit-payment-btn');
    console.log('[CHECKOUT] Starting payment processing...');
    
    try {
        toggleButtonLoading(submitBtn, true);
        
        const cart = await API.getCart();
        console.log('[CHECKOUT] Cart items:', cart.length);
        
        if (cart.length === 0) {
            console.error('[CHECKOUT] Cart is empty!');
            toggleButtonLoading(submitBtn, false);
            showAlert('Your cart is empty. Please add items before checking out.', 'warning');
            return;
        }
        
        const totalCopay = cart.reduce((sum, item) => {
            const quantity = item.quantity || 1;
            return sum + (item.copay * quantity);
        }, 0) + 2.50;
        
        console.log('[CHECKOUT] Total amount:', totalCopay);
        
        const paymentData = {
            cardNumber: document.getElementById('card-number').value.replace(/\s/g, ''),
            cardName: document.getElementById('card-name').value,
            cardExpiry: document.getElementById('card-expiry').value,
            cardCvv: document.getElementById('card-cvv').value,
            billingZip: document.getElementById('billing-zip').value,
            amount: totalCopay
        };
        
        console.log('[CHECKOUT] Payment data prepared:', {
            cardName: paymentData.cardName,
            cardLast4: paymentData.cardNumber.slice(-4),
            amount: paymentData.amount
        });
        
        console.log('[CHECKOUT] Calling API.processPayment...');
        const order = await API.processPayment(paymentData);
        console.log('[CHECKOUT] Order created:', order.orderNumber);
        
        // Clear cart
        console.log('[CHECKOUT] Clearing cart...');
        await API.clearCart();
        
        // Show success modal
        console.log('[CHECKOUT] Showing success modal...');
        document.getElementById('order-number').textContent = order.orderNumber;
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
        
        console.log('[CHECKOUT] ✅ Checkout complete!');
        logAudit('CHECKOUT_SUCCESS', `Order ${order.orderNumber} completed`);
        
        toggleButtonLoading(submitBtn, false);
        
    } catch (error) {
        console.error('[CHECKOUT] ❌ Error:', error);
        toggleButtonLoading(submitBtn, false);
        showAlert('Payment failed: ' + error.message, 'danger');
    }
}
