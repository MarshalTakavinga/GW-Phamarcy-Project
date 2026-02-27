// Sample Data for GW Pharmacy Portal
// This file contains sample data for prescriptions, users, and orders

const MOCK_DATA = {
    users: [
        // DEMO USERS - Passwords removed for security
        {
            id: 1,
            email: 'patient@gwu.edu',
            // password: 'Demo123!',  // REMOVED
            firstName: 'Marshy',
            lastName: 'Demo',
            phone: '(202) 555-0123',
            dateOfBirth: '1995-06-15',
            address: {
                street: '2121 I Street NW',
                city: 'Washington',
                state: 'DC',
                zip: '20052'
            },
            insurance: {
                provider: 'Aetna Student Health',
                memberId: '****-****-5678',
                groupNumber: '****-1234',
                status: 'active'
            }
        },
        {
            id: 2,
            email: 'marshal.takavinga@gwu.edu',
            // password: 'Demo123!',  // REMOVED
            firstName: 'Marshy',
            lastName: 'Demo',
            phone: '(227) 254-5675',
            // carrier: 'Mint Mobile', // Mobile carrier for Email-to-SMS (REMOVED)
            dateOfBirth: '1998-03-20',
            address: {
                street: '2121 I Street NW',
                city: 'Washington',
                state: 'DC',
                zip: '20052'
            },
            insurance: {
                provider: 'Aetna Student Health',
                memberId: '****-****-9012',
                groupNumber: '****-1234',
                status: 'active'
            }
        }
    ],

    prescriptions: [
        {
            id: 'RX001',
            medicationName: 'Lisinopril 10mg',
            prescribedBy: 'Dr. Sarah Johnson',
            dosage: '10mg',
            quantity: 30,
            refillsRemaining: 3,
            prescribedDate: '2025-10-15',
            expiryDate: '2026-10-15',
            lastFilledDate: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(), // 23 days ago
            daysSupply: 30, // Will trigger refill reminder (7 days left)
            instructions: 'Take one tablet by mouth once daily',
            status: 'active',
            copay: 15.00,
            fullPrice: 45.00,
            category: 'Blood Pressure'
        },
        {
            id: 'RX002',
            medicationName: 'Metformin 500mg',
            prescribedBy: 'Dr. Michael Chen',
            dosage: '500mg',
            quantity: 60,
            refillsRemaining: 5,
            prescribedDate: '2025-09-20',
            expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 25 days - will trigger warning
            lastFilledDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
            daysSupply: 30,
            instructions: 'Take one tablet twice daily with meals',
            status: 'active',
            copay: 10.00,
            fullPrice: 30.00,
            category: 'Diabetes'
        },
        {
            id: 'RX003',
            medicationName: 'Atorvastatin 20mg',
            prescribedBy: 'Dr. Sarah Johnson',
            dosage: '20mg',
            quantity: 30,
            refillsRemaining: 2,
            prescribedDate: '2025-08-10',
            expiryDate: '2026-08-10',
            instructions: 'Take one tablet once daily in the evening',
            status: 'active',
            copay: 20.00,
            fullPrice: 60.00,
            category: 'Cholesterol'
        },
        {
            id: 'RX004',
            medicationName: 'Amoxicillin 500mg',
            prescribedBy: 'Dr. Emily Rodriguez',
            dosage: '500mg',
            quantity: 21,
            refillsRemaining: 0,
            prescribedDate: '2025-11-01',
            expiryDate: '2025-12-15',
            instructions: 'Take one capsule three times daily for 7 days',
            status: 'expiring-soon',
            copay: 12.00,
            fullPrice: 24.00,
            category: 'Antibiotic'
        },
        {
            id: 'RX005',
            medicationName: 'Levothyroxine 50mcg',
            prescribedBy: 'Dr. Michael Chen',
            dosage: '50mcg',
            quantity: 90,
            refillsRemaining: 6,
            prescribedDate: '2025-07-15',
            expiryDate: '2026-07-15',
            instructions: 'Take one tablet once daily on empty stomach',
            status: 'active',
            copay: 8.00,
            fullPrice: 20.00,
            category: 'Thyroid'
        },
        {
            id: 'RX006',
            medicationName: 'Albuterol Inhaler',
            prescribedBy: 'Dr. Sarah Johnson',
            dosage: '90mcg',
            quantity: 1,
            refillsRemaining: 4,
            prescribedDate: '2025-10-01',
            expiryDate: '2026-10-01',
            instructions: 'Inhale 2 puffs as needed for wheezing',
            status: 'active',
            copay: 35.00,
            fullPrice: 75.00,
            category: 'Respiratory'
        },
        {
            id: 'RX007',
            medicationName: 'Omeprazole 20mg',
            prescribedBy: 'Dr. Emily Rodriguez',
            dosage: '20mg',
            quantity: 30,
            refillsRemaining: 1,
            prescribedDate: '2025-09-05',
            expiryDate: '2026-09-05',
            instructions: 'Take one capsule daily before breakfast',
            status: 'active',
            copay: 14.00,
            fullPrice: 32.00,
            category: 'Gastric'
        },
        {
            id: 'RX008',
            medicationName: 'Sertraline 50mg',
            prescribedBy: 'Dr. Michael Chen',
            dosage: '50mg',
            quantity: 30,
            refillsRemaining: 11,
            prescribedDate: '2025-06-20',
            expiryDate: '2026-06-20',
            instructions: 'Take one tablet once daily',
            status: 'active',
            copay: 18.00,
            fullPrice: 45.00,
            category: 'Mental Health'
        }
    ],

    // Pickup locations
    pickupLocations: [
        {
            id: 'pharmacy',
            name: 'Main Pharmacy Counter',
            address: '2121 I Street NW, Washington, DC 20052',
            hours: 'Mon-Fri: 9:00 AM - 6:00 PM',
            availability: '2-4 hours',
            type: 'counter'
        },
        {
            id: 'kiosk-foggy',
            name: 'Foggy Bottom Kiosk',
            address: 'Foggy Bottom Metro Station',
            hours: '24/7',
            availability: '4-6 hours',
            type: 'kiosk'
        },
        {
            id: 'kiosk-mount',
            name: 'Mount Vernon Kiosk',
            address: 'Mount Vernon Campus Student Center',
            hours: '24/7',
            availability: '4-6 hours',
            type: 'kiosk'
        },
        {
            id: 'kiosk-science',
            name: 'Science & Engineering Kiosk',
            address: 'Science & Engineering Hall Lobby',
            hours: '24/7',
            availability: '4-6 hours',
            type: 'kiosk'
        }
    ],

    // Notification templates
    notifications: [
        {
            id: 1,
            type: 'refill-reminder',
            title: 'Refill Reminder',
            message: 'Your Lisinopril prescription has 3 refills remaining.',
            date: '2025-11-20',
            read: false,
            icon: 'bi-prescription2',
            variant: 'info'
        },
        {
            id: 2,
            type: 'expiring-soon',
            title: 'Prescription Expiring Soon',
            message: 'Your Amoxicillin prescription will expire on December 15, 2025.',
            date: '2025-11-19',
            read: false,
            icon: 'bi-exclamation-triangle',
            variant: 'warning'
        },
        {
            id: 3,
            type: 'order-ready',
            title: 'Order Ready for Pickup',
            message: 'Your order #ORD-2025-001 is ready at Main Pharmacy Counter.',
            date: '2025-11-18',
            read: true,
            icon: 'bi-check-circle',
            variant: 'success'
        }
    ],

    // Mock orders
    orders: [
        {
            id: 'ORD-2025-001',
            orderNumber: 'ORD-2025-001',
            date: '2025-11-25',
            status: 'ready',
            statusLabel: 'Ready for Pickup',
            items: [
                {
                    id: 'RX001',
                    medicationName: 'Lisinopril 10mg',
                    quantity: 30,
                    copay: 15.00
                }
            ],
            subtotal: 15.00,
            insuranceDiscount: 0.00,
            total: 15.00,
            pickupLocation: 'pharmacy',
            pickupLocationName: 'Main Pharmacy Counter',
            estimatedReady: '2025-11-25 2:00 PM',
            actualReady: '2025-11-25 1:45 PM'
        },
        {
            id: 'ORD-2025-002',
            orderNumber: 'ORD-2025-002',
            date: '2025-11-28',
            status: 'processing',
            statusLabel: 'Processing',
            items: [
                {
                    id: 'RX002',
                    medicationName: 'Metformin 500mg',
                    quantity: 60,
                    copay: 10.00
                },
                {
                    id: 'RX003',
                    medicationName: 'Atorvastatin 20mg',
                    quantity: 30,
                    copay: 20.00
                }
            ],
            subtotal: 30.00,
            insuranceDiscount: 5.00,
            total: 25.00,
            pickupLocation: 'kiosk-foggy',
            pickupLocationName: 'Foggy Bottom Kiosk',
            estimatedReady: '2025-11-29 3:00 PM'
        },
        {
            id: 'ORD-2025-003',
            orderNumber: 'ORD-2025-003',
            date: '2025-11-30',
            status: 'pending',
            statusLabel: 'Pending Insurance Verification',
            items: [
                {
                    id: 'RX005',
                    medicationName: 'Levothyroxine 50mcg',
                    quantity: 90,
                    copay: 8.00
                }
            ],
            subtotal: 8.00,
            insuranceDiscount: 0.00,
            total: 8.00,
            pickupLocation: 'pharmacy',
            pickupLocationName: 'Main Pharmacy Counter',
            estimatedReady: '2025-12-02 10:00 AM'
        },
        {
            id: 'ORD-2025-004',
            orderNumber: 'ORD-2025-004',
            date: '2025-11-15',
            status: 'completed',
            statusLabel: 'Completed',
            items: [
                {
                    id: 'RX006',
                    medicationName: 'Albuterol Inhaler',
                    quantity: 1,
                    copay: 35.00
                }
            ],
            subtotal: 35.00,
            insuranceDiscount: 10.00,
            total: 25.00,
            pickupLocation: 'kiosk-mount',
            pickupLocationName: 'Mount Vernon Kiosk',
            estimatedReady: '2025-11-16 12:00 PM',
            actualReady: '2025-11-16 11:30 AM',
            pickedUpDate: '2025-11-17 2:15 PM'
        }
    ],

    // Dashboard statistics
    dashboardStats: {
        activePrescriptions: 7,
        pendingOrders: 1,
        readyForPickup: 1,
        refillsNeeded: 2,
        expiringThisMonth: 1,
        totalSavings: 125.50,
        lastOrderDate: '2025-11-28',
        nextRefillDue: '2025-12-05'
    },

    // Recent activity
    recentActivity: [
        {
            id: 1,
            type: 'refill',
            action: 'Refill Requested',
            description: 'Lisinopril 10mg - 30 tablets',
            date: '2025-11-28 10:45 AM',
            icon: 'bi-arrow-repeat',
            color: 'primary'
        },
        {
            id: 2,
            type: 'pickup',
            action: 'Order Ready',
            description: 'Order #ORD-2025-001 ready at Main Pharmacy',
            date: '2025-11-25 1:45 PM',
            icon: 'bi-check-circle',
            color: 'success'
        },
        {
            id: 3,
            type: 'payment',
            action: 'Payment Processed',
            description: 'Paid $25.00 for Order #ORD-2025-002',
            date: '2025-11-28 10:50 AM',
            icon: 'bi-credit-card',
            color: 'info'
        },
        {
            id: 4,
            type: 'reminder',
            action: 'Refill Reminder',
            description: 'Metformin 500mg running low (7 days left)',
            date: '2025-11-27 9:00 AM',
            icon: 'bi-bell',
            color: 'warning'
        },
        {
            id: 5,
            type: 'pickup',
            action: 'Order Picked Up',
            description: 'Picked up Order #ORD-2025-004',
            date: '2025-11-17 2:15 PM',
            icon: 'bi-bag-check',
            color: 'secondary'
        }
    ],

    // Payment methods
    paymentMethods: [
        {
            id: 'card-1',
            type: 'credit',
            cardType: 'Visa',
            last4: '1234',
            expiryMonth: '12',
            expiryYear: '2026',
            cardholderName: 'John Doe',
            isDefault: true,
            billingZip: '20052'
        },
        {
            id: 'card-2',
            type: 'debit',
            cardType: 'Mastercard',
            last4: '5678',
            expiryMonth: '06',
            expiryYear: '2027',
            cardholderName: 'John Doe',
            isDefault: false,
            billingZip: '20052'
        }
    ],

    // Medication categories
    categories: [
        { id: 'all', name: 'All Medications', icon: 'bi-grid', count: 8 },
        { id: 'blood-pressure', name: 'Blood Pressure', icon: 'bi-heart-pulse', count: 1 },
        { id: 'diabetes', name: 'Diabetes', icon: 'bi-droplet', count: 1 },
        { id: 'cholesterol', name: 'Cholesterol', icon: 'bi-heart', count: 1 },
        { id: 'antibiotic', name: 'Antibiotics', icon: 'bi-shield-plus', count: 1 },
        { id: 'thyroid', name: 'Thyroid', icon: 'bi-capsule', count: 1 },
        { id: 'respiratory', name: 'Respiratory', icon: 'bi-lungs', count: 1 },
        { id: 'gastric', name: 'Gastric', icon: 'bi-stomach', count: 1 },
        { id: 'mental-health', name: 'Mental Health', icon: 'bi-brain', count: 1 }
    ],

    // Insurance providers
    insuranceProviders: [
        'Aetna Student Health',
        'Blue Cross Blue Shield',
        'Cigna',
        'UnitedHealthcare',
        'Humana',
        'Kaiser Permanente',
        'Medicare',
        'Medicaid'
    ],

    // Health tips and reminders
    healthTips: [
        {
            id: 1,
            title: 'Take Medications as Prescribed',
            description: 'Never skip doses or stop taking medication without consulting your doctor.',
            icon: 'bi-check2-circle',
            category: 'general'
        },
        {
            id: 2,
            title: 'Store Medications Properly',
            description: 'Keep medications in a cool, dry place away from direct sunlight.',
            icon: 'bi-thermometer-half',
            category: 'storage'
        },
        {
            id: 3,
            title: 'Check Expiration Dates',
            description: 'Regularly review your medications and dispose of expired ones safely.',
            icon: 'bi-calendar-x',
            category: 'safety'
        },
        {
            id: 4,
            title: 'Set Medication Reminders',
            description: 'Use our notification system to never miss a dose.',
            icon: 'bi-alarm',
            category: 'adherence'
        }
    ]
};

// Helper function to get prescription by ID
function getPrescriptionById(id) {
    return MOCK_DATA.prescriptions.find(rx => rx.id === id);
}

// Helper function to get active prescriptions
function getActivePrescriptions() {
    return MOCK_DATA.prescriptions.filter(rx => rx.status === 'active' || rx.status === 'expiring-soon');
}

// Helper function to get user by email
function getUserByEmail(email) {
    return MOCK_DATA.users.find(user => user.email === email);
}

// Helper function to get pickup location by ID
function getPickupLocationById(id) {
    return MOCK_DATA.pickupLocations.find(loc => loc.id === id);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MOCK_DATA;
}
