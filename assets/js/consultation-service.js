// Virtual Consultation Booking System
// Schedule appointments with pharmacists and doctors

/**
 * Consultation Booking Service
 */
class ConsultationService {
    constructor() {
        this.consultations = this.loadConsultations();
        this.availableSlots = this.generateAvailableSlots();
    }

    /**
     * Load consultations from localStorage
     */
    loadConsultations() {
        return JSON.parse(localStorage.getItem('gwpharmacy_consultations') || '[]');
    }

    /**
     * Save consultations to localStorage
     */
    saveConsultations() {
        localStorage.setItem('gwpharmacy_consultations', JSON.stringify(this.consultations));
    }

    /**
     * Generate available consultation slots
     * @returns {Array} Array of available slots
     */
    generateAvailableSlots() {
        const slots = [];
        const today = new Date();
        const daysAhead = 14; // 2 weeks availability

        for (let day = 1; day <= daysAhead; day++) {
            const date = new Date(today);
            date.setDate(today.getDate() + day);

            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;

            // Generate slots from 9 AM to 5 PM
            for (let hour = 9; hour < 17; hour++) {
                for (let minute of [0, 30]) {
                    const slotTime = new Date(date);
                    slotTime.setHours(hour, minute, 0, 0);

                    slots.push({
                        datetime: slotTime.toISOString(),
                        available: true,
                        provider: this.getRandomProvider()
                    });
                }
            }
        }

        return slots;
    }

    /**
     * Get random provider for demo
     * @returns {Object} Provider object
     */
    getRandomProvider() {
        const providers = [
            { id: 'dr-smith', name: 'Dr. Sarah Smith', type: 'Pharmacist', specialty: 'Clinical Pharmacy' },
            { id: 'dr-jones', name: 'Dr. Michael Jones', type: 'Physician', specialty: 'General Practice' },
            { id: 'dr-wilson', name: 'Dr. Emily Wilson', type: 'Pharmacist', specialty: 'Medication Therapy Management' },
            { id: 'dr-brown', name: 'Dr. James Brown', type: 'Physician', specialty: 'Internal Medicine' }
        ];

        return providers[Math.floor(Math.random() * providers.length)];
    }

    /**
     * Get available slots for a specific date
     * @param {Date} date - Date to check
     * @returns {Array} Available slots
     */
    getAvailableSlots(date) {
        const dateStr = date.toDateString();
        
        return this.availableSlots.filter(slot => {
            const slotDate = new Date(slot.datetime);
            return slotDate.toDateString() === dateStr && slot.available;
        });
    }

    /**
     * Book a consultation
     * @param {Object} bookingData - Booking details
     * @returns {Object} Confirmation object
     */
    bookConsultation(bookingData) {
        const consultation = {
            id: `CONS-${Date.now()}`,
            patientName: bookingData.patientName,
            email: bookingData.email,
            phone: bookingData.phone,
            datetime: bookingData.datetime,
            provider: bookingData.provider,
            type: bookingData.type, // 'virtual' or 'in-person'
            reason: bookingData.reason,
            status: 'scheduled',
            createdAt: new Date().toISOString(),
            meetingLink: bookingData.type === 'virtual' ? this.generateMeetingLink() : null
        };

        this.consultations.push(consultation);
        this.saveConsultations();

        // Mark slot as unavailable
        const slot = this.availableSlots.find(s => s.datetime === bookingData.datetime);
        if (slot) {
            slot.available = false;
        }

        // Send confirmation
        this.sendConfirmation(consultation);

        logAudit('CONSULTATION_BOOKED', `Consultation ${consultation.id} booked`);

        return consultation;
    }

    /**
     * Generate virtual meeting link
     * @returns {string} Meeting link
     */
    generateMeetingLink() {
        const meetingId = Math.random().toString(36).substring(2, 15);
        return `https://meet.gwpharmacy.com/${meetingId}`;
    }

    /**
     * Send consultation confirmation
     * @param {Object} consultation - Consultation object
     */
    sendConfirmation(consultation) {
        const dateTime = new Date(consultation.datetime);
        const message = `Your consultation with ${consultation.provider.name} is scheduled for ${dateTime.toLocaleString()}.`;

        if (typeof API !== 'undefined') {
            API.sendNotification({
                type: 'consultation-confirmation',
                consultationId: consultation.id,
                message: message
            });
        }

        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Consultation Confirmed', {
                body: message,
                icon: '/assets/images/icon-192x192.png'
            });
        }
    }

    /**
     * Cancel consultation
     * @param {string} consultationId - Consultation ID
     * @returns {boolean} Success status
     */
    cancelConsultation(consultationId) {
        const consultation = this.consultations.find(c => c.id === consultationId);
        
        if (consultation) {
            consultation.status = 'cancelled';
            consultation.cancelledAt = new Date().toISOString();
            this.saveConsultations();

            // Make slot available again
            const slot = this.availableSlots.find(s => s.datetime === consultation.datetime);
            if (slot) {
                slot.available = true;
            }

            logAudit('CONSULTATION_CANCELLED', `Consultation ${consultationId} cancelled`);
            return true;
        }

        return false;
    }

    /**
     * Reschedule consultation
     * @param {string} consultationId - Consultation ID
     * @param {string} newDatetime - New datetime
     * @returns {Object} Updated consultation
     */
    rescheduleConsultation(consultationId, newDatetime) {
        const consultation = this.consultations.find(c => c.id === consultationId);
        
        if (consultation) {
            const oldDatetime = consultation.datetime;
            
            // Make old slot available
            const oldSlot = this.availableSlots.find(s => s.datetime === oldDatetime);
            if (oldSlot) {
                oldSlot.available = true;
            }

            // Update consultation
            consultation.datetime = newDatetime;
            consultation.rescheduledAt = new Date().toISOString();
            
            // Mark new slot as unavailable
            const newSlot = this.availableSlots.find(s => s.datetime === newDatetime);
            if (newSlot) {
                slot.available = false;
                consultation.provider = newSlot.provider;
            }

            this.saveConsultations();
            this.sendConfirmation(consultation);

            logAudit('CONSULTATION_RESCHEDULED', `Consultation ${consultationId} rescheduled`);
            
            return consultation;
        }

        return null;
    }

    /**
     * Get upcoming consultations
     * @returns {Array} Upcoming consultations
     */
    getUpcomingConsultations() {
        const now = new Date();
        
        return this.consultations.filter(consultation => {
            return consultation.status === 'scheduled' && 
                   new Date(consultation.datetime) > now;
        }).sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    }

    /**
     * Get past consultations
     * @returns {Array} Past consultations
     */
    getPastConsultations() {
        const now = new Date();
        
        return this.consultations.filter(consultation => {
            return new Date(consultation.datetime) < now ||
                   consultation.status === 'completed';
        }).sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
    }

    /**
     * Send reminder before consultation
     * @param {Object} consultation - Consultation object
     */
    sendReminder(consultation) {
        const dateTime = new Date(consultation.datetime);
        const message = `Reminder: Your consultation with ${consultation.provider.name} is in 1 hour.`;

        if (typeof API !== 'undefined') {
            API.sendNotification({
                type: 'consultation-reminder',
                consultationId: consultation.id,
                message: message
            });
        }
    }

    /**
     * Check for upcoming consultations and send reminders
     */
    checkReminders() {
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

        this.consultations.forEach(consultation => {
            if (consultation.status === 'scheduled') {
                const consultTime = new Date(consultation.datetime);
                
                if (consultTime > now && consultTime <= oneHourFromNow) {
                    if (!consultation.reminderSent) {
                        this.sendReminder(consultation);
                        consultation.reminderSent = true;
                        this.saveConsultations();
                    }
                }
            }
        });
    }

    /**
     * Format consultation card HTML
     * @param {Object} consultation - Consultation object
     * @returns {string} HTML string
     */
    formatConsultationCard(consultation) {
        const dateTime = new Date(consultation.datetime);
        const isVirtual = consultation.type === 'virtual';

        return `
            <div class="consultation-card card mb-3" data-consultation-id="${consultation.id}">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h5 class="card-title">
                                <i class="bi ${isVirtual ? 'bi-camera-video' : 'bi-person'}"></i>
                                ${consultation.provider.name}
                            </h5>
                            <p class="card-text">
                                <strong>${consultation.provider.specialty}</strong><br>
                                <i class="bi bi-calendar"></i> ${dateTime.toLocaleDateString()}<br>
                                <i class="bi bi-clock"></i> ${dateTime.toLocaleTimeString()}<br>
                                <i class="bi bi-chat-text"></i> ${consultation.reason}
                            </p>
                            ${consultation.status === 'scheduled' ? `
                                <span class="badge bg-success">Scheduled</span>
                            ` : `
                                <span class="badge bg-secondary">${consultation.status}</span>
                            `}
                        </div>
                        <div class="col-md-4 text-end">
                            ${consultation.status === 'scheduled' ? `
                                ${isVirtual && consultation.meetingLink ? `
                                    <a href="${consultation.meetingLink}" 
                                       class="btn btn-primary btn-sm mb-2" 
                                       target="_blank">
                                        <i class="bi bi-camera-video"></i> Join Meeting
                                    </a>
                                ` : ''}
                                <button class="btn btn-outline-secondary btn-sm mb-2" 
                                        onclick="consultationService.showRescheduleModal('${consultation.id}')">
                                    <i class="bi bi-calendar-event"></i> Reschedule
                                </button>
                                <button class="btn btn-outline-danger btn-sm" 
                                        onclick="consultationService.cancelConsultation('${consultation.id}')">
                                    <i class="bi bi-x-circle"></i> Cancel
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate calendar view HTML
     * @param {Date} month - Month to display
     * @returns {string} HTML string
     */
    generateCalendarHTML(month) {
        const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
        const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        let html = '<div class="calendar">';
        html += '<div class="calendar-header">';
        html += '<button class="btn btn-sm" onclick="consultationService.previousMonth()"><i class="bi bi-chevron-left"></i></button>';
        html += `<h5>${month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h5>`;
        html += '<button class="btn btn-sm" onclick="consultationService.nextMonth()"><i class="bi bi-chevron-right"></i></button>';
        html += '</div>';

        html += '<div class="calendar-grid">';
        html += '<div class="calendar-day-names">';
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            html += `<div class="day-name">${day}</div>`;
        });
        html += '</div>';

        html += '<div class="calendar-dates">';
        const currentDate = new Date(startDate);
        for (let i = 0; i < 42; i++) {
            const isCurrentMonth = currentDate.getMonth() === month.getMonth();
            const hasSlots = this.getAvailableSlots(currentDate).length > 0;
            
            html += `<div class="calendar-date ${isCurrentMonth ? '' : 'other-month'} ${hasSlots ? 'has-slots' : ''}" 
                          onclick="consultationService.selectDate('${currentDate.toISOString()}')">
                        ${currentDate.getDate()}
                    </div>`;
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        html += '</div>';
        html += '</div>';
        html += '</div>';

        return html;
    }
}

// Initialize consultation service
const consultationService = new ConsultationService();

// Check for reminders every 5 minutes
setInterval(() => {
    consultationService.checkReminders();
}, 5 * 60 * 1000);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ConsultationService, consultationService };
}
