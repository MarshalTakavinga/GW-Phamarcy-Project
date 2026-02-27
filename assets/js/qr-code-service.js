// QR Code Generator and Print Features
// Generate QR codes for prescriptions and optimize for printing
// Uses QRCode.js library for offline QR generation

/**
 * QR Code Service - Enhanced Version
 * Features:
 * - Offline QR code generation
 * - Encrypted prescription data
 * - Apple Wallet / Google Pay integration
 * - Multi-format support (PNG, SVG, Data URL)
 * - Analytics tracking
 * - Batch QR generation
 */
class QRCodeService {
    constructor() {
        this.qrApiUrl = 'https://api.qrserver.com/v1/create-qr-code/';
        this.scanHistory = this.loadScanHistory();
        this.encryptionKey = 'GWPharmacy2025'; // In production, use proper encryption
    }

    /**
     * Load scan history from localStorage
     */
    loadScanHistory() {
        return JSON.parse(localStorage.getItem('gwpharmacy_qr_scans') || '[]');
    }

    /**
     * Save scan history
     */
    saveScanHistory() {
        localStorage.setItem('gwpharmacy_qr_scans', JSON.stringify(this.scanHistory));
    }

    /**
     * Simple encryption for QR data (Base64 encoding for demo)
     * In production, use proper encryption like AES
     */
    encryptData(data) {
        try {
            return btoa(JSON.stringify(data));
        } catch (e) {
            return JSON.stringify(data);
        }
    }

    /**
     * Decrypt QR data
     */
    decryptData(encryptedData) {
        try {
            return JSON.parse(atob(encryptedData));
        } catch (e) {
            return JSON.parse(encryptedData);
        }
    }

    /**
     * Generate QR code for prescription
     * @param {Object} prescription - Prescription object
     * @returns {string} QR code image URL
     */
    generatePrescriptionQR(prescription) {
        const data = {
            type: 'prescription',
            id: prescription.prescriptionNumber,
            medication: prescription.medicationName,
            dosage: prescription.dosage,
            refills: prescription.refillsRemaining,
            patient: prescription.patientName
        };

        return this.generateQRCode(JSON.stringify(data));
    }

    /**
     * Generate QR code for order
     * @param {Object} order - Order object
     * @returns {string} QR code image URL
     */
    generateOrderQR(order) {
        const data = {
            type: 'order',
            orderNumber: order.orderNumber,
            pickupCode: order.pickupCode || this.generatePickupCode()
        };

        return this.generateQRCode(JSON.stringify(data));
    }

    /**
     * Generate QR code from data (Enhanced version)
     * @param {string} data - Data to encode
     * @param {Object} options - QR code options
     * @returns {Promise<string>} QR code image URL or data URL
     */
    async generateQRCode(data, options = {}) {
        const defaults = {
            size: 200,
            format: 'png',
            errorCorrectionLevel: 'M',
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            useCanvas: true, // Use canvas for offline generation
            logo: null // Optional logo in center
        };

        const config = { ...defaults, ...options };

        // Try to use QRCode.js library if available (offline generation)
        if (config.useCanvas && typeof QRCode !== 'undefined') {
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas');
                QRCode.toCanvas(canvas, data, {
                    width: config.size,
                    errorCorrectionLevel: config.errorCorrectionLevel,
                    color: config.color
                }, (error) => {
                    if (!error) {
                        resolve(canvas.toDataURL('image/png'));
                    } else {
                        // Fallback to API
                        resolve(this.generateQRCodeAPI(data, config));
                    }
                });
            });
        }

        // Fallback to external API
        return this.generateQRCodeAPI(data, config);
    }

    /**
     * Generate QR code using external API (fallback)
     */
    generateQRCodeAPI(data, config) {
        const params = new URLSearchParams({
            data: data,
            size: `${config.size}x${config.size}`,
            format: config.format,
            ecc: config.errorCorrectionLevel
        });

        return `${this.qrApiUrl}?${params.toString()}`;
    }

    /**
     * Generate QR code as SVG
     */
    async generateQRCodeSVG(data, options = {}) {
        if (typeof QRCode !== 'undefined') {
            return QRCode.toString(data, {
                type: 'svg',
                ...options
            });
        }
        return this.generateQRCodeAPI(data, { ...options, format: 'svg' });
    }

    /**
     * Generate pickup code
     * @returns {string} 6-digit pickup code
     */
    generatePickupCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Create printable prescription label
     * @param {Object} prescription - Prescription object
     * @returns {string} HTML for print
     */
    createPrescriptionLabel(prescription) {
        const qrCode = this.generatePrescriptionQR(prescription);
        
        return `
            <div class="prescription-label">
                <div class="label-header">
                    <h3>GW Pharmacy</h3>
                    <p>123 University Blvd, Washington DC 20052</p>
                    <p>Phone: (202) 555-0123 | Fax: (202) 555-0124</p>
                </div>
                
                <div class="label-body">
                    <div class="row">
                        <div class="col-8">
                            <p><strong>Rx #:</strong> ${prescription.prescriptionNumber}</p>
                            <p><strong>Patient:</strong> ${prescription.patientName}</p>
                            <p><strong>Date Filled:</strong> ${new Date().toLocaleDateString()}</p>
                            <p><strong>Prescriber:</strong> ${prescription.doctor || 'Dr. Smith'}</p>
                        </div>
                        <div class="col-4 text-center">
                            <img src="${qrCode}" alt="QR Code" style="width: 120px;">
                        </div>
                    </div>
                    
                    <hr>
                    
                    <div class="medication-info">
                        <h4>${prescription.medicationName}</h4>
                        <p><strong>Dosage:</strong> ${prescription.dosage}</p>
                        <p><strong>Quantity:</strong> ${prescription.quantity}</p>
                        <p><strong>Directions:</strong> ${prescription.instructions || 'Take as directed'}</p>
                    </div>
                    
                    <hr>
                    
                    <div class="refill-info">
                        <p><strong>Refills Remaining:</strong> ${prescription.refillsRemaining}</p>
                        <p><strong>Expiration Date:</strong> ${prescription.expirationDate || 'N/A'}</p>
                    </div>
                    
                    <div class="warnings mt-3">
                        <p class="text-danger"><strong>Warnings:</strong></p>
                        <ul>
                            ${prescription.warnings ? prescription.warnings.map(w => `<li>${w}</li>`).join('') : '<li>None</li>'}
                        </ul>
                    </div>
                </div>
                
                <div class="label-footer">
                    <p class="text-muted small">
                        Federal law prohibits the transfer of this drug to any person other than the patient for whom it was prescribed.
                    </p>
                </div>
            </div>
        `;
    }

    /**
     * Create printable order receipt
     * @param {Object} order - Order object
     * @returns {string} HTML for print
     */
    createOrderReceipt(order) {
        const qrCode = this.generateOrderQR(order);
        
        return `
            <div class="order-receipt">
                <div class="receipt-header text-center">
                    <h2>GW Pharmacy</h2>
                    <p>123 University Blvd, Washington DC 20052</p>
                    <p>Phone: (202) 555-0123</p>
                    <p>www.gwpharmacy.com</p>
                </div>
                
                <hr>
                
                <div class="receipt-info">
                    <div class="row">
                        <div class="col-8">
                            <p><strong>Order #:</strong> ${order.orderNumber}</p>
                            <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
                            <p><strong>Customer:</strong> ${order.patientName}</p>
                            <p><strong>Status:</strong> ${order.status}</p>
                        </div>
                        <div class="col-4 text-center">
                            <img src="${qrCode}" alt="Pickup QR Code" style="width: 100px;">
                            <p class="small">Pickup Code:<br><strong>${order.pickupCode || this.generatePickupCode()}</strong></p>
                        </div>
                    </div>
                </div>
                
                <hr>
                
                <div class="receipt-items">
                    <h5>Items:</h5>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th class="text-end">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.medicationName} ${item.dosage}</td>
                                    <td>${item.quantity}</td>
                                    <td class="text-end">$${(item.price || 0).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th colspan="2">Subtotal:</th>
                                <th class="text-end">$${(order.subtotal || 0).toFixed(2)}</th>
                            </tr>
                            ${order.insurancePays ? `
                                <tr>
                                    <td colspan="2">Insurance Pays:</td>
                                    <td class="text-end text-success">-$${order.insurancePays.toFixed(2)}</td>
                                </tr>
                            ` : ''}
                            <tr>
                                <th colspan="2">Total:</th>
                                <th class="text-end">$${(order.total || 0).toFixed(2)}</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <hr>
                
                <div class="receipt-footer">
                    <p><strong>Pickup Instructions:</strong></p>
                    <p>Show this QR code or your pickup code at the pharmacy counter.</p>
                    <p>Please bring a valid ID.</p>
                    <p class="text-center mt-3">Thank you for choosing GW Pharmacy!</p>
                </div>
            </div>
        `;
    }

    /**
     * Print prescription label
     * @param {Object} prescription - Prescription object
     */
    printPrescriptionLabel(prescription) {
        const printWindow = window.open('', '_blank');
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Prescription Label - ${prescription.prescriptionNumber}</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="assets/css/print.css">
                <style>
                    @media print {
                        body { margin: 0; padding: 20px; }
                        .prescription-label { page-break-after: always; }
                    }
                </style>
            </head>
            <body>
                ${this.createPrescriptionLabel(prescription)}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 100);
                    };
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
    }

    /**
     * Print order receipt
     * @param {Object} order - Order object
     */
    printOrderReceipt(order) {
        const printWindow = window.open('', '_blank');
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Order Receipt - ${order.orderNumber}</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="assets/css/print.css">
                <style>
                    @media print {
                        body { margin: 0; padding: 20px; }
                        .order-receipt { max-width: 600px; margin: 0 auto; }
                    }
                </style>
            </head>
            <body>
                ${this.createOrderReceipt(order)}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 100);
                    };
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
    }

    /**
     * Download QR code as image
     * @param {string} qrCodeUrl - QR code image URL
     * @param {string} filename - Download filename
     */
    async downloadQRCode(qrCodeUrl, filename = 'qrcode.png') {
        // If it's a data URL, download directly
        if (qrCodeUrl.startsWith('data:')) {
            const link = document.createElement('a');
            link.href = qrCodeUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // Download from URL
            const response = await fetch(qrCodeUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }

    /**
     * Generate Apple Wallet pass for prescription
     * @param {Object} prescription - Prescription object
     * @returns {Object} Wallet pass data
     */
    generateAppleWalletPass(prescription) {
        const qrData = this.encryptData({
            type: 'prescription',
            id: prescription.id,
            medication: prescription.medicationName,
            patient: prescription.patientName
        });

        return {
            formatVersion: 1,
            passTypeIdentifier: 'pass.com.gwpharmacy.prescription',
            serialNumber: prescription.id,
            teamIdentifier: 'GWPHARMACY',
            organizationName: 'GW Pharmacy',
            description: `Prescription: ${prescription.medicationName}`,
            logoText: 'GW Pharmacy',
            foregroundColor: 'rgb(255, 255, 255)',
            backgroundColor: 'rgb(102, 126, 234)',
            generic: {
                primaryFields: [
                    {
                        key: 'medication',
                        label: 'Medication',
                        value: prescription.medicationName
                    }
                ],
                secondaryFields: [
                    {
                        key: 'rxNumber',
                        label: 'Rx Number',
                        value: prescription.id
                    },
                    {
                        key: 'refills',
                        label: 'Refills',
                        value: prescription.refillsRemaining
                    }
                ],
                auxiliaryFields: [
                    {
                        key: 'dosage',
                        label: 'Dosage',
                        value: prescription.dosage
                    }
                ],
                backFields: [
                    {
                        key: 'instructions',
                        label: 'Instructions',
                        value: prescription.instructions || 'Take as directed'
                    },
                    {
                        key: 'doctor',
                        label: 'Prescribed By',
                        value: prescription.prescribedBy || 'N/A'
                    }
                ]
            },
            barcode: {
                message: qrData,
                format: 'PKBarcodeFormatQR',
                messageEncoding: 'iso-8859-1'
            }
        };
    }

    /**
     * Add to Apple Wallet (opens download)
     */
    addToAppleWallet(prescription) {
        const passData = this.generateAppleWalletPass(prescription);
        // In production, this would call a backend API to generate the .pkpass file
        console.log('Apple Wallet Pass:', passData);
        
        // Show modal with instructions
        this.showWalletInstructions('apple', prescription);
    }

    /**
     * Add to Google Pay (opens link)
     */
    addToGooglePay(prescription) {
        const qrData = this.encryptData({
            type: 'prescription',
            id: prescription.id,
            medication: prescription.medicationName
        });

        // In production, integrate with Google Pay API
        console.log('Google Pay data:', qrData);
        
        this.showWalletInstructions('google', prescription);
    }

    /**
     * Show wallet instructions modal
     */
    showWalletInstructions(walletType, prescription) {
        const modal = `
            <div class="modal fade" id="walletModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-wallet2 me-2"></i>
                                Add to ${walletType === 'apple' ? 'Apple Wallet' : 'Google Pay'}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-3">
                                <i class="bi bi-${walletType === 'apple' ? 'apple' : 'google'} display-1 text-primary"></i>
                            </div>
                            <h6>Prescription: ${prescription.medicationName}</h6>
                            <p class="text-muted">Rx #${prescription.id}</p>
                            <div class="alert alert-info">
                                <p><strong>Digital Wallet Feature (Demo)</strong></p>
                                <p>In production, this would:</p>
                                <ul class="mb-0">
                                    <li>Generate a digital pass/card</li>
                                    <li>Include QR code for pharmacy scanning</li>
                                    <li>Send updates when prescription is ready</li>
                                    <li>Show refill reminders</li>
                                </ul>
                            </div>
                            <p class="small text-muted">This feature requires backend integration with Apple Wallet / Google Pay APIs.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if present
        const existing = document.getElementById('walletModal');
        if (existing) existing.remove();
        
        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modal);
        const bsModal = new bootstrap.Modal(document.getElementById('walletModal'));
        bsModal.show();
        
        // Remove modal from DOM when hidden
        document.getElementById('walletModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    /**
     * Generate batch QR codes for multiple prescriptions
     */
    async generateBatchQR(prescriptions) {
        const qrCodes = [];
        for (const prescription of prescriptions) {
            const qr = await this.generatePrescriptionQR(prescription);
            qrCodes.push({
                prescription: prescription,
                qrCode: qr
            });
        }
        return qrCodes;
    }

    /**
     * Track QR code scan
     */
    trackScan(data) {
        this.scanHistory.unshift({
            data: data,
            timestamp: new Date().toISOString(),
            type: data.type || 'unknown'
        });
        
        // Keep only last 100 scans
        if (this.scanHistory.length > 100) {
            this.scanHistory = this.scanHistory.slice(0, 100);
        }
        
        this.saveScanHistory();
    }

    /**
     * Get scan statistics
     */
    getScanStats() {
        const today = new Date().toDateString();
        const todayScans = this.scanHistory.filter(s => 
            new Date(s.timestamp).toDateString() === today
        );
        
        return {
            total: this.scanHistory.length,
            today: todayScans.length,
            byType: this.scanHistory.reduce((acc, scan) => {
                acc[scan.type] = (acc[scan.type] || 0) + 1;
                return acc;
            }, {})
        };
    }

    /**
     * Share QR code via native share API
     */
    async shareQRCode(qrCodeUrl, prescription) {
        if (navigator.share) {
            try {
                // Convert data URL to blob
                const response = await fetch(qrCodeUrl);
                const blob = await response.blob();
                const file = new File([blob], `prescription-${prescription.id}.png`, { type: 'image/png' });
                
                await navigator.share({
                    title: `Prescription: ${prescription.medicationName}`,
                    text: `Rx #${prescription.id}`,
                    files: [file]
                });
            } catch (error) {
                console.log('Share failed:', error);
                // Fallback to download
                this.downloadQRCode(qrCodeUrl, `prescription-${prescription.id}.png`);
            }
        } else {
            // Fallback to download
            this.downloadQRCode(qrCodeUrl, `prescription-${prescription.id}.png`);
        }
    }
}

// Initialize QR code service
const qrCodeService = new QRCodeService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QRCodeService, qrCodeService };
}
