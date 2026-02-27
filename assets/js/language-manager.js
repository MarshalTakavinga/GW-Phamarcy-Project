// Multi-language Support
// i18n system for Spanish and English

/**
 * Language Manager
 */
class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('gwpharmacy_language') || 'en';
        this.supportedLanguages = ['en', 'es'];
        this.translations = this.loadTranslations();
    }

    /**
     * Load all translations
     */
    loadTranslations() {
        return {
            en: {
                // Navigation
                'nav.home': 'Home',
                'nav.medications': 'Medications',
                'nav.cart': 'Cart',
                'nav.orders': 'My Orders',
                'nav.profile': 'Profile',
                'nav.logout': 'Logout',
                
                // Common
                'common.search': 'Search',
                'common.submit': 'Submit',
                'common.cancel': 'Cancel',
                'common.save': 'Save',
                'common.delete': 'Delete',
                'common.edit': 'Edit',
                'common.close': 'Close',
                'common.loading': 'Loading...',
                'common.error': 'Error',
                'common.success': 'Success',
                
                // Home Page
                'home.welcome': 'Welcome to GW Pharmacy',
                'home.tagline': 'Your trusted healthcare partner',
                'home.shopNow': 'Shop Now',
                'home.refillNow': 'Refill Prescription',
                'home.features': 'Our Features',
                'home.feature1': 'Fast Delivery',
                'home.feature2': '24/7 Support',
                'home.feature3': 'Secure Checkout',
                
                // Medications
                'meds.title': 'Medications',
                'meds.prescription': 'Prescription',
                'meds.otc': 'Over the Counter',
                'meds.addToCart': 'Add to Cart',
                'meds.dosage': 'Dosage',
                'meds.quantity': 'Quantity',
                'meds.price': 'Price',
                'meds.inStock': 'In Stock',
                'meds.outOfStock': 'Out of Stock',
                
                // Cart
                'cart.title': 'Shopping Cart',
                'cart.empty': 'Your cart is empty',
                'cart.total': 'Total',
                'cart.checkout': 'Checkout',
                'cart.continueShopping': 'Continue Shopping',
                'cart.remove': 'Remove',
                
                // Orders
                'orders.title': 'My Orders',
                'orders.orderNumber': 'Order #',
                'orders.date': 'Date',
                'orders.status': 'Status',
                'orders.total': 'Total',
                'orders.viewDetails': 'View Details',
                'orders.trackOrder': 'Track Order',
                
                // Order Status
                'status.received': 'Order Received',
                'status.processing': 'Processing',
                'status.filling': 'Filling Prescription',
                'status.quality_check': 'Quality Check',
                'status.ready': 'Ready for Pickup',
                'status.completed': 'Picked Up',
                
                // Profile
                'profile.title': 'My Profile',
                'profile.personal': 'Personal Information',
                'profile.insurance': 'Insurance Information',
                'profile.address': 'Address',
                'profile.phone': 'Phone',
                'profile.email': 'Email',
                
                // Reminders
                'reminders.title': 'Medication Reminders',
                'reminders.add': 'Add Reminder',
                'reminders.time': 'Time',
                'reminders.frequency': 'Frequency',
                'reminders.daily': 'Daily',
                'reminders.weekly': 'Weekly',
                'reminders.markTaken': 'Mark as Taken',
                
                // Gamification
                'game.points': 'Points',
                'game.level': 'Level',
                'game.badges': 'Badges',
                'game.rewards': 'Rewards',
                'game.leaderboard': 'Leaderboard',
                
                // Insurance
                'ins.coverage': 'Insurance Coverage',
                'ins.deductible': 'Deductible',
                'ins.outOfPocket': 'Out of Pocket Max',
                'ins.copay': 'Copay',
                'ins.savings': 'Savings',
                'ins.generic': 'Generic Alternative',
                
                // Voice Assistant
                'voice.listening': 'Listening...',
                'voice.speak': 'Speak a command',
                'voice.help': 'Say "help" for commands',
                
                // Notifications
                'notif.orderReady': 'Your order is ready for pickup!',
                'notif.reminder': 'Time to take your medication',
                'notif.lowStock': 'Medication running low - refill now',
                
                // Errors
                'error.login': 'Invalid username or password',
                'error.network': 'Network error - please try again',
                'error.notFound': 'Item not found',
                'error.permission': 'Permission denied'
            },
            
            es: {
                // Navigation
                'nav.home': 'Inicio',
                'nav.medications': 'Medicamentos',
                'nav.cart': 'Carrito',
                'nav.orders': 'Mis Pedidos',
                'nav.profile': 'Perfil',
                'nav.logout': 'Cerrar Sesión',
                
                // Common
                'common.search': 'Buscar',
                'common.submit': 'Enviar',
                'common.cancel': 'Cancelar',
                'common.save': 'Guardar',
                'common.delete': 'Eliminar',
                'common.edit': 'Editar',
                'common.close': 'Cerrar',
                'common.loading': 'Cargando...',
                'common.error': 'Error',
                'common.success': 'Éxito',
                
                // Home Page
                'home.welcome': 'Bienvenido a GW Pharmacy',
                'home.tagline': 'Su socio de confianza en salud',
                'home.shopNow': 'Comprar Ahora',
                'home.refillNow': 'Resurtir Receta',
                'home.features': 'Nuestras Características',
                'home.feature1': 'Entrega Rápida',
                'home.feature2': 'Soporte 24/7',
                'home.feature3': 'Pago Seguro',
                
                // Medications
                'meds.title': 'Medicamentos',
                'meds.prescription': 'Con Receta',
                'meds.otc': 'Sin Receta',
                'meds.addToCart': 'Agregar al Carrito',
                'meds.dosage': 'Dosis',
                'meds.quantity': 'Cantidad',
                'meds.price': 'Precio',
                'meds.inStock': 'En Stock',
                'meds.outOfStock': 'Agotado',
                
                // Cart
                'cart.title': 'Carrito de Compras',
                'cart.empty': 'Su carrito está vacío',
                'cart.total': 'Total',
                'cart.checkout': 'Finalizar Compra',
                'cart.continueShopping': 'Continuar Comprando',
                'cart.remove': 'Eliminar',
                
                // Orders
                'orders.title': 'Mis Pedidos',
                'orders.orderNumber': 'Pedido #',
                'orders.date': 'Fecha',
                'orders.status': 'Estado',
                'orders.total': 'Total',
                'orders.viewDetails': 'Ver Detalles',
                'orders.trackOrder': 'Rastrear Pedido',
                
                // Order Status
                'status.received': 'Pedido Recibido',
                'status.processing': 'Procesando',
                'status.filling': 'Surtiendo Receta',
                'status.quality_check': 'Control de Calidad',
                'status.ready': 'Listo para Recoger',
                'status.completed': 'Recogido',
                
                // Profile
                'profile.title': 'Mi Perfil',
                'profile.personal': 'Información Personal',
                'profile.insurance': 'Información de Seguro',
                'profile.address': 'Dirección',
                'profile.phone': 'Teléfono',
                'profile.email': 'Correo Electrónico',
                
                // Reminders
                'reminders.title': 'Recordatorios de Medicamentos',
                'reminders.add': 'Agregar Recordatorio',
                'reminders.time': 'Hora',
                'reminders.frequency': 'Frecuencia',
                'reminders.daily': 'Diario',
                'reminders.weekly': 'Semanal',
                'reminders.markTaken': 'Marcar como Tomado',
                
                // Gamification
                'game.points': 'Puntos',
                'game.level': 'Nivel',
                'game.badges': 'Insignias',
                'game.rewards': 'Recompensas',
                'game.leaderboard': 'Tabla de Líderes',
                
                // Insurance
                'ins.coverage': 'Cobertura de Seguro',
                'ins.deductible': 'Deducible',
                'ins.outOfPocket': 'Máximo de Bolsillo',
                'ins.copay': 'Copago',
                'ins.savings': 'Ahorros',
                'ins.generic': 'Alternativa Genérica',
                
                // Voice Assistant
                'voice.listening': 'Escuchando...',
                'voice.speak': 'Di un comando',
                'voice.help': 'Di "ayuda" para comandos',
                
                // Notifications
                'notif.orderReady': '¡Su pedido está listo para recoger!',
                'notif.reminder': 'Hora de tomar su medicamento',
                'notif.lowStock': 'Medicamento bajo - resurtir ahora',
                
                // Errors
                'error.login': 'Usuario o contraseña inválidos',
                'error.network': 'Error de red - intente de nuevo',
                'error.notFound': 'Artículo no encontrado',
                'error.permission': 'Permiso denegado'
            }
        };
    }

    /**
     * Get current language
     * @returns {string} Language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Set language
     * @param {string} langCode - Language code (en, es)
     */
    setLanguage(langCode) {
        if (this.supportedLanguages.includes(langCode)) {
            this.currentLanguage = langCode;
            localStorage.setItem('gwpharmacy_language', langCode);
            this.updatePageLanguage();
            logAudit('LANGUAGE_CHANGE', `Language changed to ${langCode}`);
        }
    }

    /**
     * Translate a key
     * @param {string} key - Translation key
     * @param {Object} params - Parameters for interpolation
     * @returns {string} Translated text
     */
    t(key, params = {}) {
        const translation = this.translations[this.currentLanguage][key] || key;
        
        // Replace parameters
        return translation.replace(/\{(\w+)\}/g, (match, param) => {
            return params[param] || match;
        });
    }

    /**
     * Update all page elements with data-i18n attribute
     */
    updatePageLanguage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update document language attribute
        document.documentElement.lang = this.currentLanguage;

        // Trigger custom event
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLanguage }
        }));
    }

    /**
     * Get language name
     * @param {string} langCode - Language code
     * @returns {string} Language name
     */
    getLanguageName(langCode) {
        const names = {
            'en': 'English',
            'es': 'Español'
        };
        return names[langCode] || langCode;
    }

    /**
     * Get language flag emoji
     * @param {string} langCode - Language code
     * @returns {string} Flag emoji
     */
    getLanguageFlag(langCode) {
        const flags = {
            'en': '🇺🇸',
            'es': '🇪🇸'
        };
        return flags[langCode] || '';
    }

    /**
     * Format number based on locale
     * @param {number} number - Number to format
     * @param {Object} options - Formatting options
     * @returns {string} Formatted number
     */
    formatNumber(number, options = {}) {
        const locale = this.currentLanguage === 'es' ? 'es-ES' : 'en-US';
        return new Intl.NumberFormat(locale, options).format(number);
    }

    /**
     * Format currency based on locale
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency
     */
    formatCurrency(amount) {
        return this.formatNumber(amount, {
            style: 'currency',
            currency: 'USD'
        });
    }

    /**
     * Format date based on locale
     * @param {Date} date - Date to format
     * @param {Object} options - Formatting options
     * @returns {string} Formatted date
     */
    formatDate(date, options = {}) {
        const locale = this.currentLanguage === 'es' ? 'es-ES' : 'en-US';
        return new Intl.DateTimeFormat(locale, options).format(date);
    }

    /**
     * Generate language switcher HTML
     * @returns {string} HTML string
     */
    generateLanguageSwitcherHTML() {
        return `
            <div class="language-switcher">
                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                        type="button" 
                        id="languageDropdown" 
                        data-bs-toggle="dropdown">
                    ${this.getLanguageFlag(this.currentLanguage)} ${this.getLanguageName(this.currentLanguage)}
                </button>
                <ul class="dropdown-menu" aria-labelledby="languageDropdown">
                    ${this.supportedLanguages.map(lang => `
                        <li>
                            <a class="dropdown-item ${lang === this.currentLanguage ? 'active' : ''}" 
                               href="#" 
                               onclick="languageManager.setLanguage('${lang}'); return false;">
                                ${this.getLanguageFlag(lang)} ${this.getLanguageName(lang)}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
}

// Initialize language manager
const languageManager = new LanguageManager();

// Auto-update page on load
document.addEventListener('DOMContentLoaded', () => {
    languageManager.updatePageLanguage();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LanguageManager, languageManager };
}
