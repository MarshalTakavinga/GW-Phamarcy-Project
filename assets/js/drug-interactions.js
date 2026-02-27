// Drug Interaction Checker Module
// Uses OpenFDA API and local database for interaction checking

/**
 * Drug Interaction Service
 */
class DrugInteractionChecker {
    constructor() {
        this.openFdaBaseUrl = 'https://api.fda.gov/drug';
        this.interactionCache = new Map();
        this.localInteractions = this.loadLocalInteractionDatabase();
    }

    /**
     * Local interaction database (common medications)
     * In production, this would be much more comprehensive
     */
    loadLocalInteractionDatabase() {
        return {
            // Blood thinners
            'warfarin': {
                interactions: ['aspirin', 'ibuprofen', 'naproxen', 'vitamin k'],
                severity: 'severe',
                effects: 'Increased bleeding risk'
            },
            // Blood pressure medications
            'lisinopril': {
                interactions: ['potassium', 'ibuprofen', 'lithium'],
                severity: 'moderate',
                effects: 'May increase potassium levels or reduce effectiveness'
            },
            'atorvastatin': {
                interactions: ['grapefruit', 'gemfibrozil', 'cyclosporine'],
                severity: 'moderate',
                effects: 'Increased risk of muscle damage'
            },
            // Diabetes medications
            'metformin': {
                interactions: ['alcohol', 'contrast dye'],
                severity: 'moderate',
                effects: 'Risk of lactic acidosis'
            },
            // Antibiotics
            'amoxicillin': {
                interactions: ['methotrexate', 'warfarin'],
                severity: 'mild',
                effects: 'May affect drug levels'
            },
            // Thyroid medications
            'levothyroxine': {
                interactions: ['calcium', 'iron', 'antacids'],
                severity: 'moderate',
                effects: 'Reduced absorption - take 4 hours apart'
            },
            // Respiratory
            'albuterol': {
                interactions: ['beta-blockers', 'digoxin'],
                severity: 'moderate',
                effects: 'May reduce effectiveness or increase heart rate'
            },
            // Gastric
            'omeprazole': {
                interactions: ['clopidogrel', 'warfarin'],
                severity: 'moderate',
                effects: 'May reduce antiplatelet effect'
            },
            // Mental health
            'sertraline': {
                interactions: ['maois', 'tramadol', 'aspirin', 'warfarin'],
                severity: 'severe',
                effects: 'Risk of serotonin syndrome or bleeding'
            },
            // Pain medications
            'ibuprofen': {
                interactions: ['aspirin', 'warfarin', 'lisinopril', 'methotrexate'],
                severity: 'moderate',
                effects: 'Increased bleeding risk or reduced blood pressure control'
            },
            'aspirin': {
                interactions: ['warfarin', 'ibuprofen', 'sertraline'],
                severity: 'moderate',
                effects: 'Increased bleeding risk'
            }
        };
    }

    /**
     * Check interactions for a list of medications
     * @param {Array<string>} medications - Array of medication names
     * @returns {Promise<Object>} Interaction results
     */
    async checkInteractions(medications) {
        const interactions = [];
        const warnings = [];
        
        // Normalize medication names
        const normalizedMeds = medications.map(med => 
            this.normalizeMedicationName(med).toLowerCase()
        );

        // Check each medication against others
        for (let i = 0; i < normalizedMeds.length; i++) {
            const med1 = normalizedMeds[i];
            const med1Data = this.localInteractions[med1];

            if (!med1Data) continue;

            for (let j = i + 1; j < normalizedMeds.length; j++) {
                const med2 = normalizedMeds[j];
                
                // Check if med2 is in med1's interaction list
                if (med1Data.interactions.some(int => med2.includes(int) || int.includes(med2))) {
                    interactions.push({
                        drug1: medications[i],
                        drug2: medications[j],
                        severity: med1Data.severity,
                        effects: med1Data.effects,
                        recommendation: this.getRecommendation(med1Data.severity)
                    });
                }
            }

            // Check for food/alcohol interactions
            const foodInteractions = this.checkFoodInteractions(med1, medications[i]);
            if (foodInteractions.length > 0) {
                warnings.push(...foodInteractions);
            }
        }

        return {
            hasInteractions: interactions.length > 0 || warnings.length > 0,
            interactionCount: interactions.length,
            warningCount: warnings.length,
            interactions: interactions,
            warnings: warnings,
            summary: this.generateSummary(interactions, warnings)
        };
    }

    /**
     * Check for food and alcohol interactions
     * @param {string} medication - Medication name
     * @param {string} displayName - Display name
     * @returns {Array} Food/alcohol warnings
     */
    checkFoodInteractions(medication, displayName) {
        const warnings = [];
        const foodInteractionRules = {
            'atorvastatin': {
                item: 'Grapefruit',
                effect: 'Grapefruit can increase drug levels and side effects',
                severity: 'moderate'
            },
            'metformin': {
                item: 'Alcohol',
                effect: 'Alcohol increases risk of lactic acidosis',
                severity: 'severe'
            },
            'levothyroxine': {
                item: 'Caffeine/Soy',
                effect: 'Take on empty stomach, avoid soy and high-fiber foods',
                severity: 'mild'
            },
            'warfarin': {
                item: 'Vitamin K foods',
                effect: 'Leafy greens can affect blood thinning',
                severity: 'moderate'
            },
            'sertraline': {
                item: 'Alcohol',
                effect: 'Alcohol may increase drowsiness and dizziness',
                severity: 'moderate'
            }
        };

        if (foodInteractionRules[medication]) {
            const rule = foodInteractionRules[medication];
            warnings.push({
                medication: displayName,
                type: 'food',
                item: rule.item,
                effect: rule.effect,
                severity: rule.severity
            });
        }

        return warnings;
    }

    /**
     * Normalize medication name (remove dosage, generic name)
     * @param {string} medicationName - Full medication name
     * @returns {string} Normalized name
     */
    normalizeMedicationName(medicationName) {
        // Remove dosage (e.g., "10mg", "500mg")
        let normalized = medicationName.replace(/\d+\s*(mg|mcg|g|ml)/gi, '').trim();
        
        // Remove common brand name indicators
        normalized = normalized.split(' ')[0]; // Take first word
        
        return normalized;
    }

    /**
     * Get recommendation based on severity
     * @param {string} severity - Interaction severity
     * @returns {string} Recommendation text
     */
    getRecommendation(severity) {
        const recommendations = {
            'severe': 'Contact your doctor immediately. Do not take these medications together without medical supervision.',
            'moderate': 'Consult your pharmacist or doctor. These medications may require dosage adjustment or timing changes.',
            'mild': 'Be aware of this interaction. Monitor for side effects and inform your healthcare provider.'
        };
        return recommendations[severity] || recommendations['mild'];
    }

    /**
     * Generate summary text
     * @param {Array} interactions - Drug interactions
     * @param {Array} warnings - Food/alcohol warnings
     * @returns {string} Summary text
     */
    generateSummary(interactions, warnings) {
        if (interactions.length === 0 && warnings.length === 0) {
            return 'No known interactions detected among your medications.';
        }

        const severeCount = interactions.filter(i => i.severity === 'severe').length;
        const moderateCount = interactions.filter(i => i.severity === 'moderate').length;

        let summary = '';
        
        if (severeCount > 0) {
            summary += `⚠️ ${severeCount} SEVERE interaction(s) detected. Immediate medical consultation required. `;
        }
        
        if (moderateCount > 0) {
            summary += `${moderateCount} moderate interaction(s) found. `;
        }

        if (warnings.length > 0) {
            summary += `${warnings.length} food/alcohol interaction(s) to be aware of.`;
        }

        return summary || 'Minor interactions detected. Review details below.';
    }

    /**
     * Get severity badge class
     * @param {string} severity - Severity level
     * @returns {string} Bootstrap badge class
     */
    getSeverityBadgeClass(severity) {
        const classes = {
            'severe': 'bg-danger',
            'moderate': 'bg-warning text-dark',
            'mild': 'bg-info'
        };
        return classes[severity] || 'bg-secondary';
    }

    /**
     * Get severity icon
     * @param {string} severity - Severity level
     * @returns {string} Bootstrap icon class
     */
    getSeverityIcon(severity) {
        const icons = {
            'severe': 'bi-exclamation-triangle-fill',
            'moderate': 'bi-exclamation-circle-fill',
            'mild': 'bi-info-circle-fill'
        };
        return icons[severity] || 'bi-info-circle';
    }

    /**
     * Check interactions using OpenFDA API (optional, requires internet)
     * @param {string} drugName - Drug name to check
     * @returns {Promise<Array>} FDA interaction data
     */
    async checkOpenFDA(drugName) {
        try {
            const normalized = this.normalizeMedicationName(drugName);
            
            // Check cache first
            if (this.interactionCache.has(normalized)) {
                return this.interactionCache.get(normalized);
            }

            const response = await fetch(
                `${this.openFdaBaseUrl}/label.json?search=openfda.generic_name:"${normalized}"&limit=1`
            );

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            
            if (data.results && data.results[0]) {
                const result = data.results[0];
                const interactions = {
                    drugInteractions: result.drug_interactions || [],
                    warnings: result.warnings || [],
                    contraindications: result.contraindications || []
                };

                this.interactionCache.set(normalized, interactions);
                return interactions;
            }

            return null;
        } catch (error) {
            console.warn('OpenFDA API unavailable, using local database only:', error);
            return null;
        }
    }

    /**
     * Format interaction results for display
     * @param {Object} results - Interaction check results
     * @returns {string} HTML string
     */
    formatResultsHTML(results) {
        if (!results.hasInteractions) {
            return `
                <div class="alert alert-success">
                    <i class="bi bi-check-circle me-2"></i>
                    <strong>All Clear!</strong> No known interactions detected.
                </div>
            `;
        }

        let html = `<div class="interaction-results">`;

        // Summary
        html += `
            <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                <strong>Interactions Detected</strong><br>
                <small>${results.summary}</small>
            </div>
        `;

        // Drug-drug interactions
        if (results.interactions.length > 0) {
            html += `<h6 class="mt-3">Drug-Drug Interactions:</h6>`;
            results.interactions.forEach(interaction => {
                const badgeClass = this.getSeverityBadgeClass(interaction.severity);
                const icon = this.getSeverityIcon(interaction.severity);
                
                html += `
                    <div class="card mb-2 border-${interaction.severity === 'severe' ? 'danger' : 'warning'}">
                        <div class="card-body p-3">
                            <div class="d-flex align-items-start">
                                <i class="${icon} text-${interaction.severity === 'severe' ? 'danger' : 'warning'} me-2 mt-1"></i>
                                <div class="flex-grow-1">
                                    <div class="d-flex justify-content-between align-items-start mb-1">
                                        <strong>${interaction.drug1} + ${interaction.drug2}</strong>
                                        <span class="badge ${badgeClass}">${interaction.severity.toUpperCase()}</span>
                                    </div>
                                    <p class="mb-1 small">${interaction.effects}</p>
                                    <p class="mb-0 small text-muted">
                                        <i class="bi bi-lightbulb me-1"></i>${interaction.recommendation}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        // Food/alcohol warnings
        if (results.warnings.length > 0) {
            html += `<h6 class="mt-3">Food & Lifestyle Warnings:</h6>`;
            results.warnings.forEach(warning => {
                const badgeClass = this.getSeverityBadgeClass(warning.severity);
                
                html += `
                    <div class="card mb-2 border-info">
                        <div class="card-body p-3">
                            <div class="d-flex align-items-start">
                                <i class="bi bi-info-circle-fill text-info me-2 mt-1"></i>
                                <div class="flex-grow-1">
                                    <div class="d-flex justify-content-between align-items-start mb-1">
                                        <strong>${warning.medication} + ${warning.item}</strong>
                                        <span class="badge ${badgeClass}">${warning.severity.toUpperCase()}</span>
                                    </div>
                                    <p class="mb-0 small">${warning.effect}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        html += `</div>`;
        return html;
    }
}

// Initialize drug interaction checker
const drugInteractionChecker = new DrugInteractionChecker();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DrugInteractionChecker, drugInteractionChecker };
}
