// PWA Registration and Management
// Registers service worker and handles PWA installation

/**
 * PWA Manager Class
 */
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    /**
     * Initialize PWA functionality
     */
    async init() {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            console.log('[PWA] App is running in standalone mode');
        }

        // Register service worker
        if ('serviceWorker' in navigator) {
            await this.registerServiceWorker();
        }

        // Listen for install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
            console.log('[PWA] Install prompt available');
        });

        // Detect when app is installed
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.hideInstallButton();
            console.log('[PWA] App installed successfully');
            this.showInstallSuccess();
        });

        // Check for updates
        this.checkForUpdates();
    }

    /**
     * Register service worker
     */
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('[PWA] Service Worker registered:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('[PWA] New Service Worker found');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('[PWA] New version available');
                        this.showUpdateNotification();
                    }
                });
            });

            return registration;
        } catch (error) {
            console.error('[PWA] Service Worker registration failed:', error);
            return null;
        }
    }

    /**
     * Prompt user to install PWA
     */
    async promptInstall() {
        if (!this.deferredPrompt) {
            console.log('[PWA] No install prompt available');
            return false;
        }

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        console.log('[PWA] User choice:', outcome);
        
        this.deferredPrompt = null;
        return outcome === 'accepted';
    }

    /**
     * Show install button in UI
     */
    showInstallButton() {
        const installBtns = document.querySelectorAll('.pwa-install-btn');
        installBtns.forEach(btn => {
            btn.style.display = 'block';
            btn.addEventListener('click', () => this.promptInstall());
        });

        // Show install banner if on landing page
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            this.showInstallBanner();
        }
    }

    /**
     * Hide install button
     */
    hideInstallButton() {
        const installBtns = document.querySelectorAll('.pwa-install-btn');
        installBtns.forEach(btn => {
            btn.style.display = 'none';
        });

        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
            banner.remove();
        }
    }

    /**
     * Show install banner
     */
    showInstallBanner() {
        // Check if banner was dismissed
        if (localStorage.getItem('gwpharmacy_install_banner_dismissed')) {
            return;
        }

        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.className = 'alert alert-info alert-dismissible fade show position-fixed bottom-0 start-50 translate-middle-x m-3';
        banner.style.zIndex = '1050';
        banner.style.maxWidth = '500px';
        banner.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-phone me-3 fs-4"></i>
                <div class="flex-grow-1">
                    <strong>Install GW Pharmacy App</strong>
                    <p class="mb-0 small">Get quick access with our mobile app experience</p>
                </div>
                <button class="btn btn-sm btn-primary ms-2" onclick="pwaManager.promptInstall()">
                    Install
                </button>
                <button type="button" class="btn-close ms-2" data-bs-dismiss="alert" onclick="localStorage.setItem('gwpharmacy_install_banner_dismissed', 'true')"></button>
            </div>
        `;
        document.body.appendChild(banner);
    }

    /**
     * Show install success message
     */
    showInstallSuccess() {
        if (typeof showAlert === 'function') {
            showAlert('GW Pharmacy app installed successfully! You can now access it from your home screen.', 'success');
        }
    }

    /**
     * Show update notification
     */
    showUpdateNotification() {
        const banner = document.createElement('div');
        banner.className = 'alert alert-warning alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
        banner.style.zIndex = '1050';
        banner.style.maxWidth = '500px';
        banner.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-arrow-clockwise me-3"></i>
                <div class="flex-grow-1">
                    <strong>Update Available</strong>
                    <p class="mb-0 small">A new version is ready</p>
                </div>
                <button class="btn btn-sm btn-warning" onclick="pwaManager.updateApp()">
                    Update Now
                </button>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        document.body.appendChild(banner);
    }

    /**
     * Update app (reload with new service worker)
     */
    async updateApp() {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }

    /**
     * Check for app updates periodically
     */
    checkForUpdates() {
        // Check every hour
        setInterval(async () => {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                registration.update();
            }
        }, 60 * 60 * 1000);
    }

    /**
     * Check if app is installed
     */
    isAppInstalled() {
        return this.isInstalled;
    }

    /**
     * Clear all caches
     */
    async clearCache() {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            console.log('[PWA] All caches cleared');
            return true;
        }
        return false;
    }

    /**
     * Check online status
     */
    isOnline() {
        return navigator.onLine;
    }

    /**
     * Get cache size
     */
    async getCacheSize() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            return {
                usage: estimate.usage,
                quota: estimate.quota,
                usageInMB: (estimate.usage / (1024 * 1024)).toFixed(2),
                quotaInMB: (estimate.quota / (1024 * 1024)).toFixed(2),
                percentUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2)
            };
        }
        return null;
    }
}

// Initialize PWA Manager
const pwaManager = new PWAManager();

// Handle online/offline events
window.addEventListener('online', () => {
    console.log('[PWA] Back online');
    if (typeof showAlert === 'function') {
        showAlert('You are back online!', 'success');
    }
});

window.addEventListener('offline', () => {
    console.log('[PWA] Gone offline');
    if (typeof showAlert === 'function') {
        showAlert('You are offline. Some features may be limited.', 'warning');
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PWAManager, pwaManager };
}
