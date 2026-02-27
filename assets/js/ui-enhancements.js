// UI Enhancements
// Add floating action buttons and UI elements for new features

/**
 * Initialize UI enhancements on all pages
 */
function initUIEnhancements() {
    // Add floating action buttons
    addFloatingActionButtons();
    
    // Initialize theme toggle
    initThemeToggle();
    
    // Initialize voice assistant UI
    initVoiceAssistantUI();
    
    // Add PWA install prompt
    addPWAInstallPrompt();
}

/**
 * Add floating action buttons
 */
function addFloatingActionButtons() {
    const fabContainer = document.createElement('div');
    fabContainer.className = 'fab-container';
    fabContainer.innerHTML = `
        <button class="fab fab-voice" id="voice-fab" title="Voice Assistant" aria-label="Activate voice assistant">
            <i class="bi bi-mic-fill"></i>
        </button>
        <button class="fab fab-theme" id="theme-fab" title="Toggle Dark Mode" aria-label="Toggle dark mode">
            <i class="bi bi-moon-fill"></i>
        </button>
    `;
    
    document.body.appendChild(fabContainer);
    
    // Add CSS for FABs
    const style = document.createElement('style');
    style.textContent = `
        .fab-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 1000;
        }
        
        .fab {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            border: none;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .fab:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 12px rgba(0,0,0,0.3);
        }
        
        .fab-voice {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .fab-voice.listening {
            animation: pulse 1.5s infinite;
            background: #dc3545;
        }
        
        .fab-theme {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @media print {
            .fab-container { display: none !important; }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize theme toggle
 */
function initThemeToggle() {
    const themeFab = document.getElementById('theme-fab');
    if (themeFab && typeof themeManager !== 'undefined') {
        themeFab.addEventListener('click', () => {
            themeManager.toggleTheme();
            updateThemeIcon();
        });
        updateThemeIcon();
    }
}

/**
 * Update theme icon based on current theme
 */
function updateThemeIcon() {
    const themeFab = document.getElementById('theme-fab');
    if (themeFab && typeof themeManager !== 'undefined' && themeManager.getCurrentTheme) {
        const icon = themeFab.querySelector('i');
        if (themeManager.getCurrentTheme() === 'dark') {
            icon.className = 'bi bi-sun-fill';
            themeFab.title = 'Toggle Light Mode';
        } else {
            icon.className = 'bi bi-moon-fill';
            themeFab.title = 'Toggle Dark Mode';
        }
    }
}

/**
 * Initialize voice assistant UI
 */
function initVoiceAssistantUI() {
    console.log('[Voice UI] Initializing voice assistant UI...');
    
    const voiceFab = document.getElementById('voice-fab');
    console.log('[Voice UI] Voice FAB element:', voiceFab);
    
    if (!voiceFab) {
        console.warn('[Voice UI] Voice FAB button not found');
        return;
    }
    
    // Check both global scope and window object
    console.log('[Voice UI] Checking for voiceAssistant...');
    console.log('[Voice UI] typeof voiceAssistant:', typeof voiceAssistant);
    console.log('[Voice UI] window.voiceAssistant:', window.voiceAssistant);
    
    const assistant = typeof voiceAssistant !== 'undefined' ? voiceAssistant : window.voiceAssistant;
    
    if (!assistant) {
        console.error('[Voice UI] voiceAssistant is not defined');
        voiceFab.addEventListener('click', () => {
            alert('Voice assistant failed to load. Please refresh the page.');
        });
        return;
    }
    
    console.log('[Voice UI] Voice assistant instance found:', assistant);
    
    if (!assistant.isSupported) {
        console.warn('[Voice UI] Voice assistant not supported in this browser');
        voiceFab.style.opacity = '0.5';
        voiceFab.title = 'Voice commands not supported in this browser';
        voiceFab.addEventListener('click', () => {
            alert('Voice commands are not supported in this browser. Please use Chrome, Edge, or Safari.');
        });
        return;
    }
    
    // Add click handler
    console.log('[Voice UI] Setting up click handler...');
    voiceFab.addEventListener('click', () => {
        console.log('[Voice UI] ===== FAB CLICKED =====');
        console.log('[Voice UI] isListening:', assistant.isListening);
        
        try {
            if (assistant.isListening) {
                console.log('[Voice UI] Calling stopListening()...');
                assistant.stopListening();
            } else {
                console.log('[Voice UI] Calling startListening()...');
                assistant.startListening();
            }
        } catch (error) {
            console.error('[Voice UI] Error toggling voice:', error);
            alert('Failed to start voice assistant: ' + error.message);
        }
    });
    
    console.log('[Voice UI] Voice assistant initialized successfully');
}

/**
 * Add gamification quick view modal
 */
function addGamificationQuickView() {
    if (typeof gamificationService === 'undefined') return;
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'gamificationModal';
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                        <i class="bi bi-trophy-fill me-2"></i>Your Rewards
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row mb-4">
                        <div class="col-md-4 text-center">
                            <div class="display-4" id="modal-level">Level 1</div>
                            <div class="text-muted">Your Level</div>
                        </div>
                        <div class="col-md-4 text-center">
                            <div class="display-4 text-warning" id="modal-points">0</div>
                            <div class="text-muted">Total Points</div>
                        </div>
                        <div class="col-md-4 text-center">
                            <div class="display-4 text-success" id="modal-badges">0</div>
                            <div class="text-muted">Badges Earned</div>
                        </div>
                    </div>
                    
                    <ul class="nav nav-tabs mb-3" role="tablist">
                        <li class="nav-item">
                            <a class="nav-link active" data-bs-toggle="tab" href="#badges-tab">Badges</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-bs-toggle="tab" href="#rewards-tab">Rewards</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-bs-toggle="tab" href="#leaderboard-tab">Leaderboard</a>
                        </li>
                    </ul>
                    
                    <div class="tab-content">
                        <div class="tab-pane fade show active" id="badges-tab">
                            <div id="badges-list" class="row g-3"></div>
                        </div>
                        <div class="tab-pane fade" id="rewards-tab">
                            <div id="rewards-list"></div>
                        </div>
                        <div class="tab-pane fade" id="leaderboard-tab">
                            <div id="leaderboard-list"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add click handler to gamification display
    const gamDisplay = document.getElementById('gamification-display');
    if (gamDisplay) {
        gamDisplay.style.cursor = 'pointer';
        gamDisplay.addEventListener('click', () => {
            showGamificationModal();
        });
    }
}

/**
 * Show gamification modal
 */
function showGamificationModal() {
    if (typeof gamificationService === 'undefined') return;
    
    const profile = gamificationService.getUserProfile();
    const badges = gamificationService.getUserBadges();
    const rewards = gamificationService.getAvailableRewards();
    
    // Update stats
    document.getElementById('modal-level').textContent = `Level ${profile.level}`;
    document.getElementById('modal-points').textContent = profile.points;
    document.getElementById('modal-badges').textContent = badges.length;
    
    // Update badges list
    const badgesList = document.getElementById('badges-list');
    badgesList.innerHTML = badges.map(badge => `
        <div class="col-md-4">
            <div class="card text-center">
                <div class="card-body">
                    <div class="display-1">${badge.icon}</div>
                    <h6 class="mt-2">${badge.name}</h6>
                    <small class="text-muted">${badge.description}</small>
                </div>
            </div>
        </div>
    `).join('');
    
    // Update rewards list
    const rewardsList = document.getElementById('rewards-list');
    rewardsList.innerHTML = rewards.map(reward => `
        <div class="card mb-2">
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-0">${reward.name}</h6>
                    <small class="text-muted">${reward.description}</small>
                </div>
                <div>
                    <span class="badge bg-warning">${reward.pointsCost} pts</span>
                    <button class="btn btn-sm btn-primary ms-2" 
                            onclick="gamificationService.redeemReward('${reward.id}')"
                            ${profile.points < reward.pointsCost ? 'disabled' : ''}>
                        Redeem
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    const modal = new bootstrap.Modal(document.getElementById('gamificationModal'));
    modal.show();
}

/**
 * Update gamification display in navbar
 */
function updateGamificationDisplay() {
    if (typeof gamificationService === 'undefined') return;
    
    const profile = gamificationService.getUserProfile();
    const levelSpan = document.getElementById('user-level');
    const pointsSpan = document.getElementById('user-points');
    
    if (levelSpan) {
        levelSpan.textContent = `Level ${profile.level}`;
    }
    if (pointsSpan) {
        pointsSpan.textContent = `${profile.points} pts`;
    }
}

/**
 * Add PWA install prompt
 */
function addPWAInstallPrompt() {
    if (typeof pwaManager === 'undefined') return;
    
    window.addEventListener('showInstallPrompt', () => {
        const toast = document.createElement('div');
        toast.className = 'toast position-fixed bottom-0 start-50 translate-middle-x mb-3';
        toast.setAttribute('role', 'alert');
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            <div class="toast-header bg-primary text-white">
                <i class="bi bi-download me-2"></i>
                <strong class="me-auto">Install GW Pharmacy</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                Install our app for quick access and offline support!
                <div class="mt-2">
                    <button class="btn btn-sm btn-primary" onclick="pwaManager.promptInstall()">Install</button>
                    <button class="btn btn-sm btn-secondary" data-bs-dismiss="toast">Later</button>
                </div>
            </div>
        `;
        document.body.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    });
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast position-fixed top-0 end-0 m-3';
    toast.setAttribute('role', 'alert');
    toast.style.zIndex = '9999';
    
    const bgClass = {
        'success': 'bg-success',
        'error': 'bg-danger',
        'warning': 'bg-warning',
        'info': 'bg-info'
    }[type] || 'bg-info';
    
    toast.innerHTML = `
        <div class="toast-header ${bgClass} text-white">
            <strong class="me-auto">Notification</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Initialize UI enhancements when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUIEnhancements);
} else {
    initUIEnhancements();
}

// Listen for gamification updates
window.addEventListener('pointsAwarded', updateGamificationDisplay);
window.addEventListener('badgeUnlocked', updateGamificationDisplay);
window.addEventListener('levelUp', updateGamificationDisplay);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initUIEnhancements, showToast, showGamificationModal, updateGamificationDisplay };
}
