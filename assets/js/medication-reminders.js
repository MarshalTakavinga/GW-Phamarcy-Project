// Medication Reminder System
// Web Notifications API for medication reminders

/**
 * Medication Reminder Service
 */
class MedicationReminderService {
    constructor() {
        this.reminders = this.loadReminders();
        this.notificationPermission = 'default';
        this.checkPermission();
    }

    /**
     * Check and request notification permission
     */
    async checkPermission() {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        this.notificationPermission = Notification.permission;

        if (this.notificationPermission === 'default') {
            // Will request when user sets first reminder
            return null;
        }

        return this.notificationPermission === 'granted';
    }

    /**
     * Request notification permission
     */
    async requestPermission() {
        if (!('Notification' in window)) {
            return false;
        }

        const permission = await Notification.requestPermission();
        this.notificationPermission = permission;
        return permission === 'granted';
    }

    /**
     * Load reminders from localStorage
     */
    loadReminders() {
        const stored = localStorage.getItem('gwpharmacy_reminders');
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Save reminders to localStorage
     */
    saveReminders() {
        localStorage.setItem('gwpharmacy_reminders', JSON.stringify(this.reminders));
    }

    /**
     * Add a new medication reminder
     * @param {Object} reminderData - Reminder configuration
     * @returns {Promise<Object>} Created reminder
     */
    async addReminder(reminderData) {
        // Request permission if not granted
        if (this.notificationPermission !== 'granted') {
            const granted = await this.requestPermission();
            if (!granted) {
                throw new Error('Notification permission denied');
            }
        }

        const reminder = {
            id: Date.now(),
            prescriptionId: reminderData.prescriptionId,
            medicationName: reminderData.medicationName,
            dosage: reminderData.dosage,
            times: reminderData.times, // Array of time strings ['09:00', '21:00']
            frequency: reminderData.frequency || 'daily', // daily, weekly, custom
            days: reminderData.days || [0, 1, 2, 3, 4, 5, 6], // Days of week (0=Sunday)
            startDate: reminderData.startDate || new Date().toISOString(),
            endDate: reminderData.endDate || null,
            enabled: true,
            adherence: {
                taken: [],
                missed: [],
                percentage: 100
            }
        };

        this.reminders.push(reminder);
        this.saveReminders();

        // Schedule notifications
        this.scheduleReminder(reminder);

        logAudit('REMINDER_CREATED', `Reminder created for ${reminder.medicationName}`);
        
        return reminder;
    }

    /**
     * Schedule reminder notifications
     * @param {Object} reminder - Reminder object
     */
    scheduleReminder(reminder) {
        if (!reminder.enabled) return;

        // For each scheduled time
        reminder.times.forEach(time => {
            this.scheduleTimeSlot(reminder, time);
        });
    }

    /**
     * Schedule specific time slot
     * @param {Object} reminder - Reminder object
     * @param {string} time - Time string (HH:MM)
     */
    scheduleTimeSlot(reminder, time) {
        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        let scheduledTime = new Date();
        
        scheduledTime.setHours(hours, minutes, 0, 0);

        // If time has passed today, schedule for tomorrow
        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const delay = scheduledTime.getTime() - now.getTime();

        setTimeout(() => {
            this.showNotification(reminder, time);
            // Reschedule for next occurrence
            this.scheduleTimeSlot(reminder, time);
        }, delay);
    }

    /**
     * Show browser notification
     * @param {Object} reminder - Reminder object
     * @param {string} time - Time string
     */
    showNotification(reminder, time) {
        if (this.notificationPermission !== 'granted') return;

        const notification = new Notification('💊 Medication Reminder', {
            body: `Time to take ${reminder.medicationName} (${reminder.dosage})`,
            icon: '/assets/images/pill-icon.png',
            badge: '/assets/images/badge-icon.png',
            tag: `reminder-${reminder.id}-${time}`,
            requireInteraction: true,
            actions: [
                { action: 'taken', title: 'Mark as Taken' },
                { action: 'snooze', title: 'Snooze 15 min' }
            ]
        });

        notification.onclick = () => {
            window.focus();
            window.location.href = '/pages/prescriptions.html';
            notification.close();
        };

        // Auto-mark as missed after 2 hours
        setTimeout(() => {
            this.markAsMissed(reminder.id, new Date().toISOString());
        }, 2 * 60 * 60 * 1000);
    }

    /**
     * Mark medication as taken
     * @param {number} reminderId - Reminder ID
     * @param {string} timestamp - ISO timestamp
     */
    markAsTaken(reminderId, timestamp = new Date().toISOString()) {
        const reminder = this.reminders.find(r => r.id === reminderId);
        if (!reminder) return;

        reminder.adherence.taken.push({
            timestamp: timestamp,
            onTime: this.wasOnTime(reminder, timestamp)
        });

        this.updateAdherencePercentage(reminder);
        this.saveReminders();

        logAudit('MEDICATION_TAKEN', `${reminder.medicationName} marked as taken`);
    }

    /**
     * Mark medication as missed
     * @param {number} reminderId - Reminder ID
     * @param {string} timestamp - ISO timestamp
     */
    markAsMissed(reminderId, timestamp) {
        const reminder = this.reminders.find(r => r.id === reminderId);
        if (!reminder) return;

        // Check if not already taken
        const alreadyTaken = reminder.adherence.taken.some(t => 
            new Date(t.timestamp).toDateString() === new Date(timestamp).toDateString()
        );

        if (!alreadyTaken) {
            reminder.adherence.missed.push(timestamp);
            this.updateAdherencePercentage(reminder);
            this.saveReminders();

            logAudit('MEDICATION_MISSED', `${reminder.medicationName} marked as missed`);
        }
    }

    /**
     * Check if medication was taken on time
     * @param {Object} reminder - Reminder object
     * @param {string} timestamp - ISO timestamp
     * @returns {boolean} True if on time
     */
    wasOnTime(reminder, timestamp) {
        const takenTime = new Date(timestamp);
        const takenHour = takenTime.getHours();
        const takenMinute = takenTime.getMinutes();

        // Check if within 1 hour of any scheduled time
        return reminder.times.some(time => {
            const [schedHour, schedMinute] = time.split(':').map(Number);
            const diff = Math.abs((takenHour * 60 + takenMinute) - (schedHour * 60 + schedMinute));
            return diff <= 60; // Within 1 hour
        });
    }

    /**
     * Update adherence percentage
     * @param {Object} reminder - Reminder object
     */
    updateAdherencePercentage(reminder) {
        const total = reminder.adherence.taken.length + reminder.adherence.missed.length;
        if (total === 0) {
            reminder.adherence.percentage = 100;
        } else {
            reminder.adherence.percentage = Math.round(
                (reminder.adherence.taken.length / total) * 100
            );
        }
    }

    /**
     * Get reminders for specific prescription
     * @param {string} prescriptionId - Prescription ID
     * @returns {Array} Reminders
     */
    getRemindersByPrescription(prescriptionId) {
        return this.reminders.filter(r => r.prescriptionId === prescriptionId);
    }

    /**
     * Get today's medication schedule
     * @returns {Array} Today's medications with times
     */
    getTodaySchedule() {
        const today = new Date().getDay();
        const todayStr = new Date().toDateString();

        return this.reminders
            .filter(r => r.enabled && r.days.includes(today))
            .flatMap(reminder => 
                reminder.times.map(time => ({
                    id: reminder.id,
                    medicationName: reminder.medicationName,
                    dosage: reminder.dosage,
                    time: time,
                    taken: reminder.adherence.taken.some(t => 
                        new Date(t.timestamp).toDateString() === todayStr
                    ),
                    prescriptionId: reminder.prescriptionId
                }))
            )
            .sort((a, b) => a.time.localeCompare(b.time));
    }

    /**
     * Get reminder statistics
     * @returns {Object} Statistics
     */
    getStatistics() {
        const allTaken = this.reminders.reduce((sum, r) => sum + r.adherence.taken.length, 0);
        const allMissed = this.reminders.reduce((sum, r) => sum + r.adherence.missed.length, 0);
        const total = allTaken + allMissed;

        // Current streak
        let currentStreak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toDateString();

            const dayTaken = this.reminders.some(r =>
                r.adherence.taken.some(t => new Date(t.timestamp).toDateString() === dateStr)
            );

            if (dayTaken) {
                currentStreak++;
            } else {
                break;
            }
        }

        return {
            totalReminders: this.reminders.length,
            activeReminders: this.reminders.filter(r => r.enabled).length,
            adherenceRate: total > 0 ? Math.round((allTaken / total) * 100) : 100,
            totalTaken: allTaken,
            totalMissed: allMissed,
            currentStreak: currentStreak,
            bestStreak: this.calculateBestStreak()
        };
    }

    /**
     * Calculate best adherence streak
     * @returns {number} Best streak in days
     */
    calculateBestStreak() {
        // Simplified calculation
        let bestStreak = 0;
        let currentStreak = 0;

        const allDates = this.reminders
            .flatMap(r => r.adherence.taken.map(t => new Date(t.timestamp).toDateString()))
            .sort();

        for (let i = 0; i < allDates.length; i++) {
            if (i === 0 || allDates[i] !== allDates[i - 1]) {
                currentStreak++;
                bestStreak = Math.max(bestStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return bestStreak;
    }

    /**
     * Delete reminder
     * @param {number} reminderId - Reminder ID
     */
    deleteReminder(reminderId) {
        this.reminders = this.reminders.filter(r => r.id !== reminderId);
        this.saveReminders();
        logAudit('REMINDER_DELETED', `Reminder ${reminderId} deleted`);
    }

    /**
     * Toggle reminder enabled/disabled
     * @param {number} reminderId - Reminder ID
     * @param {boolean} enabled - Enable or disable
     */
    toggleReminder(reminderId, enabled) {
        const reminder = this.reminders.find(r => r.id === reminderId);
        if (reminder) {
            reminder.enabled = enabled;
            this.saveReminders();

            if (enabled) {
                this.scheduleReminder(reminder);
            }
        }
    }
}

// Initialize medication reminder service
const medicationReminderService = new MedicationReminderService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MedicationReminderService, medicationReminderService };
}
