let allPrescriptions = [];
let filteredPrescriptions = [];

/**
 * Initialize prescriptions page
 */
async function initPrescriptionsPage() {
    try {
        updateUserName();
        updateCartCount();
        
        // Load prescriptions
        allPrescriptions = await API.getPrescriptions();
        filteredPrescriptions = [...allPrescriptions];
        
        // Display prescriptions
        displayPrescriptions(filteredPrescriptions);
        
        // Setup event listeners
        setupPrescriptionFilters();
        
    } catch (error) {
        console.error('Error loading prescriptions:', error);
        showAlert('Error loading prescriptions. Please refresh the page.', 'danger');
    }
}

/**
 * Display prescriptions
 * @param {Array} prescriptions - Array of prescriptions to display
 */
function displayPrescriptions(prescriptions) {
    const container = document.getElementById('prescriptions-container');
    
    if (prescriptions.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
                <h3 class="h5 text-muted">No prescriptions found</h3>
                <p class="text-muted">Try adjusting your filters or search term.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = prescriptions.map(rx => createPrescriptionCard(rx)).join('');
    
    // Add event listeners to buttons
    prescriptions.forEach(rx => {
        const addBtn = document.getElementById(`add-to-cart-${rx.id}`);
        if (addBtn) {
            addBtn.addEventListener('click', () => handleAddToCart(rx.id));
        }
    });
}

/**
 * Create prescription card HTML
 * @param {Object} rx - Prescription object
 * @returns {string} HTML string
 */
function createPrescriptionCard(rx) {
    const daysLeft = daysUntil(rx.expiryDate);
    const showExpiryWarning = daysLeft > 0 && daysLeft <= 30;
    
    return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100 shadow-sm prescription-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h3 class="h5 card-title mb-0">${rx.medicationName}</h3>
                        <span class="badge bg-${getStatusBadgeClass(rx.status)}">
                            ${getStatusLabel(rx.status)}
                        </span>
                    </div>
                    
                    <p class="text-muted small mb-3">
                        <i class="bi bi-person-badge me-1"></i>${rx.prescribedBy}
                    </p>
                    
                    <div class="prescription-details mb-3">
                        <div class="detail-row">
                            <span class="detail-label">Dosage:</span>
                            <span class="detail-value">${rx.dosage}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Quantity:</span>
                            <span class="detail-value">${rx.quantity}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Refills Left:</span>
                            <span class="detail-value ${rx.refillsRemaining === 0 ? 'text-danger' : ''}"}>
                                ${rx.refillsRemaining}
                            </span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Copay:</span>
                            <span class="detail-value text-primary fw-bold">${formatCurrency(rx.copay)}</span>
                        </div>
                    </div>
                    
                    ${showExpiryWarning ? `
                        <div class="alert alert-warning py-2 px-3 small mb-3">
                            <i class="bi bi-exclamation-triangle me-1"></i>
                            Expires in ${daysLeft} days
                        </div>
                    ` : ''}
                    
                    <div class="prescription-instructions mb-3">
                        <small class="text-muted">
                            <i class="bi bi-info-circle me-1"></i>${rx.instructions}
                        </small>
                    </div>
                </div>
                <div class="card-footer bg-white">
                    <div class="d-grid gap-2">
                        ${rx.refillsRemaining > 0 ? `
                            <button class="btn btn-primary" id="add-to-cart-${rx.id}">
                                <i class="bi bi-cart-plus me-2"></i>Add to Cart
                            </button>
                        ` : `
                            <button class="btn btn-secondary" disabled>
                                <i class="bi bi-x-circle me-2"></i>No Refills Available
                            </button>
                        `}
                        <div class="btn-group" role="group">
                            <button class="btn btn-outline-secondary btn-sm" onclick="showPrescriptionDetailsModal('${rx.id}')">
                                <i class="bi bi-eye me-1"></i>Details
                            </button>
                            <button class="btn btn-outline-primary btn-sm" onclick="showPrescriptionQR('${rx.id}')" title="View QR Code">
                                <i class="bi bi-qr-code"></i>
                            </button>
                            <button class="btn btn-outline-info btn-sm" onclick="printPrescriptionLabel('${rx.id}')" title="Print Label">
                                <i class="bi bi-printer"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Handle add to cart
 * @param {string} prescriptionId - Prescription ID
 */
async function handleAddToCart(prescriptionId) {
    try {
        const button = document.getElementById(`add-to-cart-${prescriptionId}`);
        if (!button) {
            console.error('Button not found for prescription:', prescriptionId);
            return;
        }
        
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Adding...';
        
        console.log('Adding prescription to cart:', prescriptionId);
        const success = await API.addToCart(prescriptionId);
        
        if (success) {
            button.innerHTML = '<i class="bi bi-check-circle me-2"></i>Added to Cart';
            button.classList.remove('btn-primary');
            button.classList.add('btn-success');
            
            // Update cart count
            if (typeof updateCartCount === 'function') {
                updateCartCount();
            }
            
            showAlert('Prescription added to cart successfully!', 'success');
            
            setTimeout(() => {
                button.innerHTML = '<i class="bi bi-cart-plus me-2"></i>Add to Cart';
                button.classList.remove('btn-success');
                button.classList.add('btn-primary');
                button.disabled = false;
            }, 2000);
        } else {
            button.innerHTML = '<i class="bi bi-cart-plus me-2"></i>Add to Cart';
            button.disabled = false;
            showAlert('This prescription is already in your cart.', 'warning');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        const button = document.getElementById(`add-to-cart-${prescriptionId}`);
        if (button) {
            button.innerHTML = '<i class="bi bi-cart-plus me-2"></i>Add to Cart';
            button.disabled = false;
        }
        showAlert('Error adding prescription to cart.', 'danger');
    }
}

/**
 * Get prescription by ID
 * @param {string} prescriptionId - Prescription ID
 * @returns {Object|null} Prescription object
 */
function getPrescriptionById(prescriptionId) {
    return allPrescriptions.find(rx => rx.id === prescriptionId);
}

/**
 * Show prescription details modal
 * @param {string} prescriptionId - Prescription ID
 */
function showPrescriptionDetailsModal(prescriptionId) {
    const rx = getPrescriptionById(prescriptionId);
    if (!rx) return;
    
    // Get current user info
    const session = JSON.parse(localStorage.getItem('gwpharmacy_session') || '{}');
    const userName = session.user ? `${session.user.firstName} ${session.user.lastName}` : 'Patient';
    
    // Calculate days until expiry
    const daysUntilExpiry = daysUntil(rx.expiryDate);
    const expiryWarning = daysUntilExpiry > 0 && daysUntilExpiry <= 30 
        ? `<div class="alert alert-warning mt-3"><i class="bi bi-exclamation-triangle me-2"></i>Expires in ${daysUntilExpiry} days</div>` 
        : '';
    
    // Create detailed modal
    const modal = `
        <div class="modal fade" id="detailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-prescription2 me-2"></i>Prescription Details
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h4 class="mb-3">${rx.medicationName}</h4>
                                <dl class="row">
                                    <dt class="col-sm-5">Prescription ID:</dt>
                                    <dd class="col-sm-7"><code>${rx.id}</code></dd>
                                    
                                    <dt class="col-sm-5">Dosage:</dt>
                                    <dd class="col-sm-7">${rx.dosage}</dd>
                                    
                                    <dt class="col-sm-5">Quantity:</dt>
                                    <dd class="col-sm-7">${rx.quantity}</dd>
                                    
                                    <dt class="col-sm-5">Category:</dt>
                                    <dd class="col-sm-7"><span class="badge bg-secondary">${rx.category}</span></dd>
                                    
                                    <dt class="col-sm-5">Status:</dt>
                                    <dd class="col-sm-7">
                                        <span class="badge bg-${getStatusBadgeClass(rx.status)}">
                                            ${getStatusLabel(rx.status)}
                                        </span>
                                    </dd>
                                </dl>
                            </div>
                            <div class="col-md-6">
                                <dl class="row">
                                    <dt class="col-sm-5">Prescribed By:</dt>
                                    <dd class="col-sm-7">${rx.prescribedBy}</dd>
                                    
                                    <dt class="col-sm-5">Prescribed Date:</dt>
                                    <dd class="col-sm-7">${formatDate(rx.prescribedDate)}</dd>
                                    
                                    <dt class="col-sm-5">Expiry Date:</dt>
                                    <dd class="col-sm-7">${formatDate(rx.expiryDate)}</dd>
                                    
                                    <dt class="col-sm-5">Refills Remaining:</dt>
                                    <dd class="col-sm-7">
                                        <strong class="${rx.refillsRemaining === 0 ? 'text-danger' : 'text-success'}">
                                            ${rx.refillsRemaining}
                                        </strong>
                                    </dd>
                                    
                                    <dt class="col-sm-5">Days Supply:</dt>
                                    <dd class="col-sm-7">${rx.daysSupply || 'N/A'}</dd>
                                </dl>
                            </div>
                        </div>
                        
                        ${expiryWarning}
                        
                        <div class="card mt-3">
                            <div class="card-header bg-light">
                                <strong><i class="bi bi-info-circle me-2"></i>Instructions</strong>
                            </div>
                            <div class="card-body">
                                ${rx.instructions}
                            </div>
                        </div>
                        
                        <div class="row mt-3">
                            <div class="col-md-6">
                                <div class="card bg-light">
                                    <div class="card-body">
                                        <h6 class="card-title">With Insurance</h6>
                                        <h3 class="text-primary mb-0">${formatCurrency(rx.copay)}</h3>
                                        <small class="text-muted">Copay</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card bg-light">
                                    <div class="card-body">
                                        <h6 class="card-title">Without Insurance</h6>
                                        <h3 class="text-secondary mb-0">${formatCurrency(rx.fullPrice)}</h3>
                                        <small class="text-muted">Full Price</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="alert alert-info mt-3">
                            <i class="bi bi-shield-check me-2"></i>
                            <strong>Your Savings:</strong> ${formatCurrency(rx.fullPrice - rx.copay)} with insurance
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-outline-primary" onclick="showPrescriptionQR('${rx.id}'); bootstrap.Modal.getInstance(document.getElementById('detailsModal')).hide();">
                            <i class="bi bi-qr-code me-2"></i>View QR Code
                        </button>
                        <button type="button" class="btn btn-outline-success" onclick="printPrescriptionLabel('${rx.id}')">
                            <i class="bi bi-printer me-2"></i>Print Label
                        </button>
                        ${rx.refillsRemaining > 0 ? `
                            <button type="button" class="btn btn-primary" onclick="handleAddToCart('${rx.id}'); bootstrap.Modal.getInstance(document.getElementById('detailsModal')).hide();">
                                <i class="bi bi-cart-plus me-2"></i>Add to Cart
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existing = document.getElementById('detailsModal');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', modal);
    const bsModal = new bootstrap.Modal(document.getElementById('detailsModal'));
    bsModal.show();
    
    document.getElementById('detailsModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

/**
 * Setup prescription filters
 */
function setupPrescriptionFilters() {
    const searchInput = document.getElementById('search-input');
    const filterStatus = document.getElementById('filter-status');
    
    searchInput.addEventListener('input', debounce(function() {
    }, 300));
    
    filterStatus.addEventListener('change', function() {
        applyFilters();
    });
}

/**
 * Apply filters to prescriptions
 */
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;
    
    filteredPrescriptions = allPrescriptions.filter(rx => {
        const matchesSearch = !searchTerm || 
            rx.medicationName.toLowerCase().includes(searchTerm) ||
            rx.id.toLowerCase().includes(searchTerm) ||
            rx.prescribedBy.toLowerCase().includes(searchTerm);
        
        // Status filter
        const matchesStatus = statusFilter === 'all' || rx.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    displayPrescriptions(filteredPrescriptions);
}

/**
 * Get status badge class
 * @param {string} status - Prescription status
 * @returns {string} Bootstrap badge class
 */
function getStatusBadgeClass(status) {
    const classes = {
        'active': 'success',
        'pending': 'warning',
        'ready': 'info',
        'expired': 'danger',
        'completed': 'secondary'
    };
    return classes[status] || 'secondary';
}

/**
 * Get status label
 * @param {string} status - Prescription status
 * @returns {string} Display label
 */
function getStatusLabel(status) {
    const labels = {
        'active': 'Active',
        'pending': 'Pending',
        'ready': 'Ready',
        'expired': 'Expired',
        'completed': 'Completed'
    };
    return labels[status] || status;
}

/**
 * Show prescription QR code modal
 * @param {string} prescriptionId - Prescription ID
 */
function showPrescriptionQR(prescriptionId) {
    const prescription = getPrescriptionById(prescriptionId);
    if (!prescription) return;
    
    const session = JSON.parse(localStorage.getItem('gwpharmacy_session') || '{}');
    const userName = session.user ? `${session.user.firstName} ${session.user.lastName}` : 'John Doe';
    
    // Generate QR code data as a formatted string for better readability when scanned
    const qrDataString = `GW PHARMACY PRESCRIPTION
Rx #: ${prescription.id}
Patient: ${userName}
Medication: ${prescription.medicationName}
Dosage: ${prescription.dosage}
Quantity: ${prescription.quantity}
Prescribed By: ${prescription.prescribedBy}
Date: ${formatDate(prescription.prescribedDate)}
Expires: ${formatDate(prescription.expiryDate)}
Refills: ${prescription.refillsRemaining}`;
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrDataString)}`;
    
    const modal = `
        <div class="modal fade" id="qrModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-qr-code me-2"></i>Prescription QR Code
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <h6>${prescription.medicationName}</h6>
                        <p class="text-muted small mb-1">Rx #${prescription.id}</p>
                        <p class="text-muted small">Patient: ${userName}</p>
                        <div class="my-4 p-3 bg-light rounded">
                            <img src="${qrCodeUrl}" alt="QR Code" class="img-fluid" style="max-width: 300px;">
                        </div>
                        <p class="small text-muted mb-3">
                            <i class="bi bi-info-circle me-1"></i>
                            Scan this code at the pharmacy counter for quick pickup
                        </p>
                        
                        <div class="card text-start mb-3">
                            <div class="card-body small">
                                <div class="row">
                                    <div class="col-6">
                                        <strong>Dosage:</strong> ${prescription.dosage}
                                    </div>
                                    <div class="col-6">
                                        <strong>Quantity:</strong> ${prescription.quantity}
                                    </div>
                                    <div class="col-6 mt-2">
                                        <strong>Prescribed By:</strong><br>
                                        ${prescription.prescribedBy}
                                    </div>
                                    <div class="col-6 mt-2">
                                        <strong>Refills Left:</strong><br>
                                        ${prescription.refillsRemaining}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button class="btn btn-primary" onclick="downloadQRImage('${qrCodeUrl}', 'prescription-${prescription.id}-qr.png')">
                                <i class="bi bi-download me-2"></i>Download QR Code
                            </button>
                            <button class="btn btn-outline-primary" onclick="window.print()">
                                <i class="bi bi-printer me-2"></i>Print QR Code
                            </button>
                            <button class="btn btn-outline-success" onclick="printPrescriptionLabel('${prescription.id}')">
                                <i class="bi bi-tag me-2"></i>Print Prescription Label
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existing = document.getElementById('qrModal');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', modal);
    const bsModal = new bootstrap.Modal(document.getElementById('qrModal'));
    bsModal.show();
    
    document.getElementById('qrModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

/**
 * Print prescription label
 * @param {string} prescriptionId - Prescription ID
 */
function printPrescriptionLabel(prescriptionId) {
    const prescription = getPrescriptionById(prescriptionId);
    if (!prescription) return;
    
    const session = JSON.parse(localStorage.getItem('gwpharmacy_session') || '{}');
    const userName = session.user ? `${session.user.firstName} ${session.user.lastName}` : 'John Doe';
    
    const printData = {
        ...prescription,
        prescriptionNumber: prescription.id,
        patientName: userName,
        doctor: prescription.prescribedBy,
        expirationDate: prescription.expiryDate,
        warnings: ['Take with food if stomach upset occurs', 'Do not crush or chew', 'Complete full course as directed']
    };
    
    // Check if QR code service is available
    if (typeof qrCodeService !== 'undefined' && qrCodeService.printPrescriptionLabel) {
        qrCodeService.printPrescriptionLabel(printData);
    } else {
        // Fallback to basic print
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Prescription Label - ${prescription.id}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        font-size: 14px;
                    }
                    .label {
                        border: 2px solid #000;
                        padding: 20px;
                        max-width: 400px;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #000;
                        padding-bottom: 10px;
                        margin-bottom: 15px;
                    }
                    .section {
                        margin-bottom: 15px;
                    }
                    .label-title {
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .warnings {
                        background: #fff3cd;
                        border: 1px solid #ffc107;
                        padding: 10px;
                        margin-top: 15px;
                    }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="label">
                    <div class="header">
                        <h2 style="margin: 0;">GW PHARMACY</h2>
                        <p style="margin: 5px 0;">2121 I Street NW, Washington, DC 20052</p>
                        <p style="margin: 5px 0;">(202) 555-MEDS</p>
                    </div>
                    
                    <div class="section">
                        <div class="label-title">Prescription #:</div>
                        <div>${prescription.id}</div>
                    </div>
                    
                    <div class="section">
                        <div class="label-title">Patient Name:</div>
                        <div>${userName}</div>
                    </div>
                    
                    <div class="section">
                        <div class="label-title">Medication:</div>
                        <div style="font-size: 16px; font-weight: bold;">${prescription.medicationName}</div>
                    </div>
                    
                    <div class="section">
                        <div class="label-title">Dosage & Quantity:</div>
                        <div>${prescription.dosage} - Quantity: ${prescription.quantity}</div>
                    </div>
                    
                    <div class="section">
                        <div class="label-title">Instructions:</div>
                        <div>${prescription.instructions}</div>
                    </div>
                    
                    <div class="section">
                        <div class="label-title">Prescribed By:</div>
                        <div>${prescription.prescribedBy}</div>
                    </div>
                    
                    <div class="section">
                        <div class="label-title">Prescribed Date:</div>
                        <div>${new Date(prescription.prescribedDate).toLocaleDateString()}</div>
                    </div>
                    
                    <div class="section">
                        <div class="label-title">Expiration Date:</div>
                        <div>${new Date(prescription.expiryDate).toLocaleDateString()}</div>
                    </div>
                    
                    <div class="section">
                        <div class="label-title">Refills Remaining:</div>
                        <div>${prescription.refillsRemaining}</div>
                    </div>
                    
                    <div class="warnings">
                        <div class="label-title">⚠️ IMPORTANT WARNINGS:</div>
                        <ul style="margin: 5px 0; padding-left: 20px;">
                            <li>Take with food if stomach upset occurs</li>
                            <li>Do not crush or chew</li>
                            <li>Complete full course as directed</li>
                        </ul>
                    </div>
                </div>
                
                <div class="no-print" style="margin-top: 20px;">
                    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px;">
                        Print Label
                    </button>
                    <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; margin-left: 10px;">
                        Close
                    </button>
                </div>
                
                <script>
                    // Auto-print after page loads
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
}

/**
 * Download QR code image
 * @param {string} imageUrl - QR code image URL
 * @param {string} filename - Download filename
 */
function downloadQRImage(imageUrl, filename) {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.target = '_blank';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showAlert('QR Code download started!', 'success');
}

