// Dark Mode Theme Switcher
// Handles theme switching and persistence

/**
 * Theme Manager Class
 */
class ThemeManager {
    constructor() {
        this.currentTheme = this.loadTheme();
        this.initializeTheme();
    }

    /**
     * Load theme preference from localStorage
     */
    loadTheme() {
        const saved = localStorage.getItem('gwpharmacy_theme');
        if (saved) {
            return saved;
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    }

    /**
     * Initialize theme on page load
     */
    initializeTheme() {
        console.log('[Theme] Initializing with theme:', this.currentTheme);
        
        // Add no-transition class temporarily to prevent flash
        document.documentElement.classList.add('no-transition');
        
        this.applyTheme(this.currentTheme);
        
        // Remove no-transition class after a brief delay
        setTimeout(() => {
            document.documentElement.classList.remove('no-transition');
        }, 100);
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                const systemTheme = e.matches ? 'dark' : 'light';
                console.log('[Theme] System theme changed to:', systemTheme);
                // Only auto-switch if user hasn't set preference
                if (!localStorage.getItem('gwpharmacy_theme')) {
                    this.applyTheme(systemTheme);
                }
            });
        }
    }

    /**
     * Apply theme to document
     * @param {string} theme - 'light' or 'dark'
     */
    applyTheme(theme) {
        console.log('[Theme] Applying theme:', theme);
        this.currentTheme = theme;
        
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.classList.add('dark-mode');
        } else {
            document.documentElement.removeAttribute('data-theme');
            document.body.classList.remove('dark-mode');
        }

        // Update toggle button if it exists
        this.updateToggleButton();
        
        // Save preference
        localStorage.setItem('gwpharmacy_theme', theme);
        console.log('[Theme] Theme applied and saved:', theme);
        
        // Log audit
        if (typeof logAudit === 'function') {
            logAudit('THEME_CHANGE', `Theme changed to ${theme}`);
        }
    }

    /**
     * Set a specific theme
     * @param {string} theme - 'light' or 'dark'
     */
    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.applyTheme(theme);
        }
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    /**
     * Update toggle button state
     */
    updateToggleButton() {
        console.log('[Theme] Updating toggle button to:', this.currentTheme);
        
        // Update all theme icons
        const icons = document.querySelectorAll('.theme-icon');
        icons.forEach(icon => {
            if (this.currentTheme === 'dark') {
                icon.classList.remove('bi-moon-fill');
                icon.classList.add('bi-sun-fill');
            } else {
                icon.classList.remove('bi-sun-fill');
                icon.classList.add('bi-moon-fill');
            }
        });
        
        // Update button title/aria-label
        const toggleBtn = document.getElementById('theme-toggle-btn');
        if (toggleBtn) {
            const newLabel = this.currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
            toggleBtn.setAttribute('aria-label', newLabel);
            toggleBtn.setAttribute('title', newLabel);
        }
    }

    /**
     * Get current theme
     * @returns {string} Current theme
     */
    getTheme() {
        return this.currentTheme;
    }

    /**
     * Check if dark mode is active
     * @returns {boolean} True if dark mode
     */
    isDarkMode() {
        return this.currentTheme === 'dark';
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Add theme toggle functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Theme] Initializing theme toggle button...');
    
    // Add theme toggle to navigation (if navbar exists)
    const navbarRight = document.querySelector('.navbar .d-flex.align-items-center');
    if (navbarRight) {
        const themeToggleHTML = `
            <button class="btn btn-outline-light btn-sm rounded-circle me-2" 
                    onclick="themeManager.toggleTheme()" 
                    id="theme-toggle-btn"
                    title="Toggle dark mode"
                    aria-label="Toggle dark mode">
                <i class="bi theme-icon ${themeManager.isDarkMode() ? 'bi-sun-fill' : 'bi-moon-fill'}"></i>
            </button>
        `;
        navbarRight.insertAdjacentHTML('afterbegin', themeToggleHTML);
        console.log('[Theme] Theme toggle button added to navbar');
    }
    
    // For pages without navbar (like index.html), add a floating button
    if (!navbarRight) {
        const floatingToggleHTML = `
            <button class="btn btn-primary btn-sm rounded-circle shadow position-fixed" 
                    onclick="themeManager.toggleTheme()" 
                    id="theme-toggle-btn"
                    style="bottom: 90px; right: 20px; z-index: 1000; width: 45px; height: 45px;"
                    title="Toggle dark mode"
                    aria-label="Toggle dark mode">
                <i class="bi theme-icon ${themeManager.isDarkMode() ? 'bi-sun-fill' : 'bi-moon-fill'}"></i>
            </button>
        `;
        document.body.insertAdjacentHTML('beforeend', floatingToggleHTML);
        console.log('[Theme] Floating theme toggle button added');
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ThemeManager, themeManager };
}
