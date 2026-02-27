// Insurance Calculator
// Calculate costs, deductibles, and suggest generic alternatives

/**
 * Insurance Coverage Calculator
 */
class InsuranceCalculator {
    constructor() {
        this.currentYear = new Date().getFullYear();
        this.insuranceData = this.loadInsuranceData();
    }

    /**
     * Load insurance data from user profile
     */
    loadInsuranceData() {
        const session = JSON.parse(localStorage.getItem('gwpharmacy_session'));
        if (session && session.user && session.user.insurance) {
            return {
                provider: session.user.insurance.provider,
                planType: 'Standard',
                deductible: 1000,
                deductibleMet: this.getDeductibleMet(),
                outOfPocketMax: 5000,
                outOfPocketMet: this.getOutOfPocketMet(),
                copayTier1: 10,  // Generic
                copayTier2: 30,  // Preferred brand
                copayTier3: 50,  // Non-preferred brand
                coinsurance: 0.20 // 20% after deductible
            };
        }
        return null;
    }

    /**
     * Get deductible amount met this year
     */
    getDeductibleMet() {
        const stored = localStorage.getItem('gwpharmacy_deductible_met');
        return stored ? parseFloat(stored) : 0;
    }

    /**
     * Get out-of-pocket amount met this year
     */
    getOutOfPocketMet() {
        const stored = localStorage.getItem('gwpharmacy_oop_met');
        return stored ? parseFloat(stored) : 0;
    }

    /**
     * Update deductible met amount
     * @param {number} amount - Amount to add
     */
    updateDeductibleMet(amount) {
        const currentMet = this.getDeductibleMet();
        const newMet = Math.min(currentMet + amount, this.insuranceData.deductible);
        localStorage.setItem('gwpharmacy_deductible_met', newMet.toString());
        this.insuranceData.deductibleMet = newMet;
    }

    /**
     * Calculate prescription cost with insurance
     * @param {Object} prescription - Prescription object
     * @returns {Object} Cost breakdown
     */
    calculateCost(prescription) {
        if (!this.insuranceData) {
            return {
                fullPrice: prescription.fullPrice,
                insurancePays: 0,
                youPay: prescription.fullPrice,
                tier: 'N/A',
                savings: 0
            };
        }

        const tier = this.getPrescriptionTier(prescription);
        const copay = this.getCopayForTier(tier);
        const fullPrice = prescription.fullPrice;

        let youPay, insurancePays;

        // If deductible not met, pay full price
        if (this.insuranceData.deductibleMet < this.insuranceData.deductible) {
            youPay = fullPrice;
            insurancePays = 0;
        } else {
            // After deductible, pay copay or coinsurance
            if (tier === 1) {
                youPay = copay;
                insurancePays = fullPrice - copay;
            } else {
                const coinsuranceAmount = fullPrice * this.insuranceData.coinsurance;
                youPay = Math.max(copay, coinsuranceAmount);
                insurancePays = fullPrice - youPay;
            }
        }

        return {
            fullPrice: fullPrice,
            insurancePays: Math.max(0, insurancePays),
            youPay: youPay,
            tier: tier,
            tierName: this.getTierName(tier),
            copay: copay,
            savings: Math.max(0, fullPrice - youPay),
            savingsPercent: Math.round(((fullPrice - youPay) / fullPrice) * 100)
        };
    }

    /**
     * Get prescription tier (1=Generic, 2=Preferred Brand, 3=Non-Preferred Brand)
     * @param {Object} prescription - Prescription object
     * @returns {number} Tier number
     */
    getPrescriptionTier(prescription) {
        // Simple logic - in production would check formulary
        const genericMeds = ['metformin', 'lisinopril', 'levothyroxine', 'omeprazole', 'sertraline'];
        const medName = prescription.medicationName.toLowerCase();
        
        if (genericMeds.some(gen => medName.includes(gen))) {
            return 1; // Generic
        } else if (prescription.fullPrice < 100) {
            return 2; // Preferred brand
        } else {
            return 3; // Non-preferred brand
        }
    }

    /**
     * Get copay amount for tier
     * @param {number} tier - Tier number
     * @returns {number} Copay amount
     */
    getCopayForTier(tier) {
        if (!this.insuranceData) return 0;
        
        switch (tier) {
            case 1: return this.insuranceData.copayTier1;
            case 2: return this.insuranceData.copayTier2;
            case 3: return this.insuranceData.copayTier3;
            default: return 0;
        }
    }

    /**
     * Get tier name
     * @param {number} tier - Tier number
     * @returns {string} Tier name
     */
    getTierName(tier) {
        const names = {
            1: 'Generic',
            2: 'Preferred Brand',
            3: 'Non-Preferred Brand'
        };
        return names[tier] || 'Unknown';
    }

    /**
     * Find generic alternative
     * @param {Object} prescription - Prescription object
     * @returns {Object|null} Generic alternative with savings
     */
    findGenericAlternative(prescription) {
        // Mock generic alternatives database
        const alternatives = {
            'atorvastatin': { name: 'Atorvastatin', savings: 30 },
            'lisinopril': null, // Already generic
            'metformin': null, // Already generic
            'omeprazole': null, // Already generic
            'sertraline': null, // Already generic
            'levothyroxine': null // Already generic
        };

        const medName = prescription.medicationName.toLowerCase();
        const baseNname = medName.split(' ')[0];

        if (alternatives[baseName]) {
            const alternative = alternatives[baseName];
            return {
                medicationName: alternative.name,
                dosage: prescription.dosage,
                estimatedCopay: this.insuranceData.copayTier1,
                savings: alternative.savings,
                savingsPercent: Math.round((alternative.savings / prescription.copay) * 100)
            };
        }

        return null;
    }

    /**
     * Calculate year-to-date spending
     * @returns {Object} Spending summary
     */
    calculateYearToDateSpending() {
        // Use MOCK_DATA as source of truth
        const orders = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.orders) 
            ? MOCK_DATA.orders 
            : JSON.parse(localStorage.getItem('gwpharmacy_orders') || '[]');
        const thisYearOrders = orders.filter(order => {
            const orderYear = new Date(order.orderDate).getFullYear();
            return orderYear === this.currentYear;
        });

        const totalSpent = thisYearOrders.reduce((sum, order) => sum + (order.total || 0), 0);

        return {
            totalOrders: thisYearOrders.length,
            totalSpent: totalSpent,
            deductibleMet: this.insuranceData?.deductibleMet || 0,
            deductibleRemaining: Math.max(0, (this.insuranceData?.deductible || 0) - (this.insuranceData?.deductibleMet || 0)),
            outOfPocketMet: this.insuranceData?.outOfPocketMet || 0,
            outOfPocketRemaining: Math.max(0, (this.insuranceData?.outOfPocketMax || 0) - (this.insuranceData?.outOfPocketMet || 0)),
            projectedYearlySpending: this.projectYearlySpending(totalSpent)
        };
    }

    /**
     * Project yearly spending based on current rate
     * @param {number} currentSpending - Current year-to-date spending
     * @returns {number} Projected yearly amount
     */
    projectYearlySpending(currentSpending) {
        const now = new Date();
        const startOfYear = new Date(this.currentYear, 0, 1);
        const daysElapsed = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
        const daysInYear = 365;

        if (daysElapsed === 0) return 0;

        return Math.round((currentSpending / daysElapsed) * daysInYear);
    }

    /**
     * Format cost breakdown HTML
     * @param {Object} costBreakdown - Cost calculation result
     * @returns {string} HTML string
     */
    formatCostBreakdownHTML(costBreakdown) {
        return `
            <div class="cost-breakdown card">
                <div class="card-body">
                    <h6 class="card-title">Cost Breakdown</h6>
                    <div class="row mb-2">
                        <div class="col-6">Full Price:</div>
                        <div class="col-6 text-end">$${costBreakdown.fullPrice.toFixed(2)}</div>
                    </div>
                    <div class="row mb-2">
                        <div class="col-6">Insurance Pays:</div>
                        <div class="col-6 text-end text-success">-$${costBreakdown.insurancePays.toFixed(2)}</div>
                    </div>
                    <hr>
                    <div class="row mb-2">
                        <div class="col-6"><strong>You Pay:</strong></div>
                        <div class="col-6 text-end"><strong>$${costBreakdown.youPay.toFixed(2)}</strong></div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <span class="badge bg-info">${costBreakdown.tierName}</span>
                            ${costBreakdown.savings > 0 ? 
                                `<span class="badge bg-success ms-2">Save ${costBreakdown.savingsPercent}%</span>` : 
                                ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get insurance coverage summary
     * @returns {Object} Summary object
     */
    getCoverageSummary() {
        if (!this.insuranceData) return null;

        const deductibleProgress = (this.insuranceData.deductibleMet / this.insuranceData.deductible) * 100;
        const oopProgress = (this.insuranceData.outOfPocketMet / this.insuranceData.outOfPocketMax) * 100;

        return {
            provider: this.insuranceData.provider,
            deductible: this.insuranceData.deductible,
            deductibleMet: this.insuranceData.deductibleMet,
            deductibleProgress: Math.min(100, deductibleProgress),
            outOfPocketMax: this.insuranceData.outOfPocketMax,
            outOfPocketMet: this.insuranceData.outOfPocketMet,
            outOfPocketProgress: Math.min(100, oopProgress),
            tier1Copay: this.insuranceData.copayTier1,
            tier2Copay: this.insuranceData.copayTier2,
            tier3Copay: this.insuranceData.copayTier3
        };
    }
}

// Initialize insurance calculator
const insuranceCalculator = new InsuranceCalculator();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InsuranceCalculator, insuranceCalculator };
}
