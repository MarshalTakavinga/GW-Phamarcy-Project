class VoiceAssistant {
    constructor() {
        console.log('[Voice] Initializing Voice Assistant...');
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSupported = this.checkSupport();
        // Check if permission was granted in this session
        this.permissionGranted = sessionStorage.getItem('voicePermissionGranted') === 'true';
        
        console.log('[Voice] Browser support:', this.isSupported);
        console.log('[Voice] Session permission:', this.permissionGranted);
        
        if (this.isSupported) {
            this.initRecognition();
            console.log('[Voice] Speech recognition initialized');
            
            // Check permission status on load (don't request yet)
            this.checkPermissionStatus();
        } else {
            console.warn('[Voice] Speech recognition not supported in this browser');
        }
    }

    /**
     * Check if Web Speech API is supported
     */
    checkSupport() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }
    
    /**
     * Check microphone permission status without requesting
     */
    async checkPermissionStatus() {
        try {
            if (navigator.permissions && navigator.permissions.query) {
                const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
                this.permissionGranted = permissionStatus.state === 'granted';
                console.log('[Voice] Initial permission status:', permissionStatus.state);
                
                // Store in session if granted
                if (permissionStatus.state === 'granted') {
                    sessionStorage.setItem('voicePermissionGranted', 'true');
                }
                
                // Listen for permission changes
                permissionStatus.onchange = () => {
                    this.permissionGranted = permissionStatus.state === 'granted';
                    console.log('[Voice] Permission changed to:', permissionStatus.state);
                    
                    // Update session storage
                    if (permissionStatus.state === 'granted') {
                        sessionStorage.setItem('voicePermissionGranted', 'true');
                    } else {
                        sessionStorage.removeItem('voicePermissionGranted');
                    }
                };
            }
        } catch (err) {
            console.log('[Voice] Permission API not available');
        }
    }

    /**
     * Initialize speech recognition
     */
    initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1; // Reduced for faster processing

        this.recognition.onstart = () => {
            this.isListening = true;
            this.permissionGranted = true; // Mark permission as granted when recognition starts successfully
            sessionStorage.setItem('voicePermissionGranted', 'true'); // Persist for this session
            this.updateVoiceButton(true);
            this.showListeningIndicator();
            console.log('[Voice] Listening...');
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Update UI with interim results
            if (interimTranscript) {
                this.showTranscript(interimTranscript, false);
            }
            
            // Process final result immediately
            if (finalTranscript) {
                this.showTranscript(finalTranscript, true);
                console.log('[Voice] Heard:', finalTranscript);
                
                // Stop recognition immediately to reduce delay
                this.recognition.stop();
                
                // Process command without waiting
                this.processCommand(finalTranscript.toLowerCase());
            }
        };

        this.recognition.onerror = (event) => {
            console.error('[Voice] Error:', event.error);
            this.isListening = false;
            this.updateVoiceButton(false);
            this.hideListeningIndicator();
            
            if (event.error === 'not-allowed' || event.error === 'permission-denied') {
                this.permissionGranted = false; // Reset permission flag
                sessionStorage.removeItem('voicePermissionGranted'); // Clear session permission
                this.showPermissionError();
            } else if (event.error === 'no-speech') {
                this.speak('I didn\'t hear anything. Please try again.');
            } else if (event.error === 'network') {
                this.showError('Network error. Please check your connection.');
            } else if (event.error === 'aborted') {
                // User stopped, don't show error
                console.log('[Voice] Recognition aborted by user');
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceButton(false);
            this.hideListeningIndicator();
            console.log('[Voice] Stopped listening');
        };
    }

    /**
     * Start listening for voice commands
     */
    async startListening() {
        console.log('[Voice] startListening called');
        
        if (!this.isSupported) {
            alert('Voice commands are not supported in this browser. Please use Chrome, Edge, or Safari.');
            console.error('[Voice] Not supported');
            return;
        }

        if (this.isListening) {
            console.log('[Voice] Already listening, stopping first');
            this.stopListening();
            return;
        }

        // Check if permission was previously denied
        try {
            if (navigator.permissions && navigator.permissions.query) {
                const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
                console.log('[Voice] Microphone permission status:', permissionStatus.state);
                
                if (permissionStatus.state === 'denied') {
                    this.showPermissionError();
                    return;
                }
                
                // If permission is already granted, start immediately
                if (permissionStatus.state === 'granted') {
                    this.permissionGranted = true;
                    console.log('[Voice] Permission already granted, starting immediately');
                }
            }
        } catch (err) {
            console.log('[Voice] Permission API not available, continuing...');
        }

        try {
            console.log('[Voice] Starting recognition...');
            this.recognition.start();
            
            // Mark permission as granted after first successful start
            if (!this.permissionGranted) {
                this.permissionGranted = true;
                sessionStorage.setItem('voicePermissionGranted', 'true');
                console.log('[Voice] Permission granted by user');
            }
        } catch (error) {
            console.error('[Voice] Failed to start:', error);
            
            // Handle specific errors
            if (error.name === 'InvalidStateError') {
                // Recognition already started, try stopping and restarting
                console.log('[Voice] InvalidStateError, restarting...');
                this.recognition.stop();
                setTimeout(() => {
                    this.recognition.start();
                }, 100);
            } else if (error.name === 'NotAllowedError') {
                this.permissionGranted = false;
                this.showPermissionError();
            } else {
                alert('Failed to start voice recognition: ' + error.message);
            }
        }
    }
    
    /**
     * Show permission error message
     */
    showPermissionError() {
        const message = `
            <div class="alert alert-warning alert-dismissible fade show" role="alert" style="position: fixed; top: 70px; right: 20px; z-index: 9999; max-width: 450px;">
                <h6><i class="bi bi-mic-mute-fill me-2"></i>Microphone Access Required</h6>
                <p class="mb-2">To use voice commands:</p>
                <ol class="mb-2 ps-3">
                    <li>Click the <strong>microphone button</strong> again</li>
                    <li>When the browser asks, click <strong>"Allow while visiting the site"</strong></li>
                    <li>Start speaking your command</li>
                </ol>
                <small class="text-muted"><i class="bi bi-info-circle me-1"></i>Note: Permission is remembered during your current browsing session. To make it permanent, the site must be served over HTTPS.</small>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        // Remove existing permission alerts
        document.querySelectorAll('.alert-warning').forEach(alert => {
            if (alert.textContent.includes('Microphone Access')) {
                alert.remove();
            }
        });
        
        document.body.insertAdjacentHTML('beforeend', message);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            document.querySelectorAll('.alert-warning').forEach(alert => {
                if (alert.textContent.includes('Microphone Access')) {
                    alert.remove();
                }
            });
        }, 10000);
    }

    /**
     * Stop listening
     */
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    /**
     * Process voice command
     * @param {string} command - Voice command text
     */
    async processCommand(command) {
        console.log('[Voice] Processing:', command);
        
        // Cache prescriptions once at the start for faster access
        const prescriptions = this.getUserPrescriptions();
        
        // ANALYTICAL QUERIES
        
        // Active prescriptions query (check this FIRST before general count)
        if (command.includes('active') && (command.includes('prescription') || command.includes('medication'))) {
            const active = prescriptions.filter(p => p.status && p.status.toLowerCase() === 'active');
            const count = active.length;
            if (count === 0) {
                this.speak('You have no active prescriptions');
            } else if (count === 1) {
                this.speak('You have 1 active prescription');
            } else {
                this.speak(`You have ${count} active prescriptions`);
            }
            return;
        }
        
        // General prescription count queries (all statuses)
        if (command.includes('prescription') && 
            (command.includes('how many') || 
             command.includes('count') || 
             command.includes('number of') ||
             command.includes('total'))) {
            const count = prescriptions.length;
            if (count === 0) {
                this.speak('You have no prescriptions on file');
            } else if (count === 1) {
                this.speak('You have 1 prescription');
            } else {
                this.speak(`You have ${count} prescriptions`);
            }
            return;
        }
        
        // Expiring prescriptions query
        if (command.includes('expiring') || command.includes('expire') || command.includes('expiration') || command.includes('about to expire')) {
            const expiring = this.getExpiringPrescriptions(prescriptions);
            if (expiring.length === 0) {
                this.speak('No prescriptions are expiring soon');
            } else if (expiring.length === 1) {
                const rx = expiring[0];
                const daysLeft = this.getDaysUntilExpiration(rx.expiryDate);
                const medName = rx.medicationName.split(' ')[0];
                this.speak(`You have 1 prescription expiring soon: ${medName}, which expires in ${daysLeft} days`);
            } else {
                const medNames = expiring.map(rx => rx.medicationName.split(' ')[0]);
                const medications = medNames.length > 1 
                    ? medNames.slice(0, -1).join(', ') + ' and ' + medNames.slice(-1)
                    : medNames[0];
                this.speak(`You have ${expiring.length} prescriptions expiring soon: ${medications}`);
            }
            return;
        }
        
        // Refills remaining query
        if (command.includes('refill') && 
            (command.includes('remaining') || 
             command.includes('left') || 
             command.includes('how many') ||
             command.includes('do i have'))) {
            const withRefills = prescriptions.filter(p => p.refillsRemaining > 0);
            if (withRefills.length === 0) {
                this.speak('None of your prescriptions have refills remaining');
            } else {
                const total = withRefills.reduce((sum, p) => sum + p.refillsRemaining, 0);
                this.speak(`You have ${total} refills remaining across ${withRefills.length} prescriptions`);
            }
            return;
        }
        
        // Medications by doctor query
        if ((command.includes('prescribed by') || 
             (command.includes('doctor') && (command.includes('how many') || command.includes('what') || command.includes('which')))) &&
            !command.includes('tell me about')) {
            const doctors = this.getPrescriptionsByDoctor(prescriptions);
            if (doctors.length === 0) {
                this.speak('No prescription data available');
            } else if (doctors.length === 1) {
                this.speak(`All your prescriptions are from ${doctors[0].doctor}`);
            } else {
                const doctorList = doctors.map(d => `${d.count} from ${d.doctor}`).join(', ');
                this.speak(`You have prescriptions from ${doctors.length} doctors: ${doctorList}`);
            }
            return;
        }
        
        // Most expensive medication query
        if (command.includes('most expensive') || command.includes('highest cost') || command.includes('expensive medication')) {
            if (prescriptions.length === 0) {
                this.speak('No prescriptions found');
            } else {
                const mostExpensive = prescriptions.reduce((max, p) => 
                    (p.insuranceInfo?.copay || 0) > (max.insuranceInfo?.copay || 0) ? p : max
                );
                const cost = mostExpensive.insuranceInfo?.copay || 0;
                this.speak(`Your most expensive prescription is ${mostExpensive.medicationName} at $${cost} copay`);
            }
            return;
        }
        
        // Total medication cost query
        if (command.includes('total cost') || command.includes('how much') && command.includes('all')) {
            const total = prescriptions.reduce((sum, p) => sum + (p.insuranceInfo?.copay || 0), 0);
            if (total === 0) {
                this.speak('No cost information available');
            } else {
                this.speak(`Your total copay for all prescriptions is $${total.toFixed(2)}`);
            }
            return;
        }
        
        // Specific medication query
        if (command.includes('when does') || command.includes('tell me about') || command.includes('info about') || command.includes('information on')) {
            const medicationName = this.extractMedicationName(command);
            if (medicationName) {
                const medication = prescriptions.find(p => 
                    p.medicationName.toLowerCase().includes(medicationName.toLowerCase())
                );
                if (medication) {
                    const info = this.getMedicationInfo(medication);
                    this.speak(info);
                } else {
                    this.speak(`Could not find ${medicationName} in your prescriptions`);
                }
            } else {
                this.speak('Please specify which medication you want to know about');
            }
            return;
        }
        
        // Ready for pickup query
        if (command.includes('ready for pickup') || command.includes('ready to pick')) {
            const orders = this.getUserOrders();
            const ready = orders.filter(o => {
                const status = o.status ? o.status.toLowerCase() : '';
                return status === 'ready' || status === 'ready for pickup';
            });
            if (ready.length === 0) {
                this.speak('No orders are ready for pickup');
            } else if (ready.length === 1) {
                const order = ready[0];
                const medications = order.items.map(item => item.medicationName.split(' ')[0]).join(', ');
                const location = order.pickupLocationName || order.pickupLocation;
                this.speak(`Your order containing ${medications} is ready for pickup at ${location}`);
            } else {
                this.speak(`You have ${ready.length} orders ready for pickup`);
            }
            return;
        }
        
        // Pending orders query
        if (command.includes('pending') || command.includes('processing')) {
            const orders = this.getUserOrders();
            const pending = orders.filter(o => {
                const status = o.status ? o.status.toLowerCase() : '';
                return status === 'processing' || status === 'pending';
            });
            if (pending.length === 0) {
                this.speak('No pending orders');
            } else if (pending.length === 1) {
                this.speak(`Order ${pending[0].orderNumber} is currently ${pending[0].status.toLowerCase()}`);
            } else {
                this.speak(`You have ${pending.length} orders being processed`);
            }
            return;
        }
        
        // Cart status query - MUST come before navigation commands
        if (command.includes('cart') && 
            (command.includes('how many') || 
             command.includes('what') || 
             command.includes('items') ||
             command.includes('in my cart') ||
             command.includes('what\'s in') ||
             command.includes('check cart') ||
             command.includes('view cart'))) {
            const cart = this.getCartItems();
            if (cart.length === 0) {
                this.speak('Your cart is empty');
            } else {
                // Calculate total items (sum of all quantities)
                const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
                
                if (cart.length === 1) {
                    const item = cart[0];
                    const itemName = item.medicationName || item.name || 'Unknown item';
                    const quantity = item.quantity || 1;
                    if (quantity === 1) {
                        this.speak(`You have 1 item in your cart: ${itemName}`);
                    } else {
                        this.speak(`You have ${quantity} ${itemName} in your cart`);
                    }
                } else if (cart.length <= 3) {
                    // List all items for small carts
                    const items = cart.map(item => {
                        const name = (item.medicationName || item.name || 'Unknown').split(' ')[0];
                        return item.quantity > 1 ? `${item.quantity} ${name}` : name;
                    }).join(', ');
                    this.speak(`You have ${totalItems} items in your cart: ${items}`);
                } else {
                    // List first 3 items for larger carts
                    const first3 = cart.slice(0, 3).map(item => {
                        const name = (item.medicationName || item.name || 'Unknown').split(' ')[0];
                        return item.quantity > 1 ? `${item.quantity} ${name}` : name;
                    }).join(', ');
                    this.speak(`You have ${totalItems} items in your cart including ${first3} and ${cart.length - 3} more`);
                }
            }
            return;
        }
        
        // List all medications query
        if (command.includes('list') && (command.includes('medication') || command.includes('prescription') || command.includes('my meds'))) {
            if (prescriptions.length === 0) {
                this.speak('You have no prescriptions');
            } else if (prescriptions.length <= 3) {
                const medications = prescriptions.map(p => p.medicationName).join(', ');
                this.speak(`Your medications are: ${medications}`);
            } else {
                const first3 = prescriptions.slice(0, 3).map(p => p.medicationName.split(' ')[0]).join(', ');
                this.speak(`You have ${prescriptions.length} medications including ${first3} and others`);
            }
            return;
        }
        
        // NAVIGATION COMMANDS
        
        if (command.includes('dashboard') || command.includes('home')) {
            this.speak('Opening dashboard');
            setTimeout(() => window.location.href = '../pages/dashboard.html', 300);
        }
        else if (command.includes('prescription') && !command.includes('how many') && !command.includes('what')) {
            this.speak('Opening prescriptions');
            setTimeout(() => window.location.href = '../pages/prescriptions.html', 300);
        }
        else if ((command.includes('open cart') || command.includes('go to cart') || command.includes('shopping cart')) && 
                 !command.includes('what') && !command.includes('how many') && !command.includes('items')) {
            this.speak('Opening shopping cart');
            setTimeout(() => window.location.href = '../pages/cart.html', 300);
        }
        else if (command.includes('profile') || command.includes('account') || command.includes('settings')) {
            this.speak('Opening your profile');
            setTimeout(() => window.location.href = '../pages/profile.html', 300);
        }
        else if (command.includes('log out') || command.includes('sign out') || command.includes('logout')) {
            this.speak('Logging you out');
            setTimeout(() => {
                localStorage.removeItem('gwpharmacy_session');
                window.location.href = '../index.html';
            }, 500);
        }
        
        // Search commands
        else if (command.includes('search for') || command.includes('find') || command.includes('look for')) {
            const medication = command.replace(/search for|find|look for/g, '').trim();
            this.speak(`Searching for ${medication}`);
            this.searchMedication(medication);
        }
        
        // Add to cart commands
        else if (command.includes('add') && (command.includes('cart') || command.includes('basket'))) {
            const medication = command.replace(/add|to cart|to basket/g, '').trim();
            this.speak(`Adding ${medication} to your cart`);
            this.addMedicationToCart(medication);
        }
        
        // Refill commands
        else if (command.includes('refill') || command.includes('reorder')) {
            this.speak('Loading your prescriptions for refill');
            setTimeout(() => window.location.href = '../pages/prescriptions.html', 300);
        }
        
        // Order status
        else if (command.includes('order status') || command.includes('my orders') || command.includes('order history')) {
            this.speak('Checking your order status');
            this.checkOrderStatus();
        }
        
        // Medication reminders
        else if (command.includes('reminder') || command.includes('medication reminder')) {
            this.speak('Your medication reminders are active. Check your notifications for details.');
            this.showReminders();
        }
        
        // Dark mode toggle
        else if (command.includes('dark mode') || command.includes('light mode') || (command.includes('theme') && !command.includes('system'))) {
            if (command.includes('enable') || command.includes('turn on') || command.includes('activate') || command.includes('dark')) {
                this.speak('Enabling dark mode');
                if (typeof themeManager !== 'undefined') {
                    themeManager.setTheme('dark');
                } else {
                    this.speak('Theme manager not available');
                }
            } else if (command.includes('disable') || command.includes('turn off') || command.includes('deactivate') || command.includes('light')) {
                this.speak('Enabling light mode');
                if (typeof themeManager !== 'undefined') {
                    themeManager.setTheme('light');
                } else {
                    this.speak('Theme manager not available');
                }
            } else {
                this.speak('Toggling theme');
                if (typeof themeManager !== 'undefined') {
                    themeManager.toggleTheme();
                } else {
                    this.speak('Theme manager not available');
                }
            }
        }
        
        // Checkout command
        else if (command.includes('checkout') || command.includes('pay') || command.includes('complete order')) {
            this.speak('Proceeding to checkout');
            setTimeout(() => window.location.href = '../pages/cart.html', 300);
        }
        
        // View details
        else if (command.includes('show details') || command.includes('more info') || command.includes('information')) {
            this.speak('Please specify what you would like details about');
        }
        
        // Help command
        else if (command.includes('help') || command.includes('what can you do') || command.includes('commands')) {
            this.showHelpModal();
        }
        
        // Gratitude
        else if (command.includes('thank you') || command.includes('thanks')) {
            this.speak('You\'re welcome! Let me know if you need anything else.');
        }
        
        // Unknown command
        else {
            this.speak('I didn\'t quite understand that. Say "help" to see what I can do.');
            this.showCommandSuggestion();
        }
    }

    /**
     * Text-to-speech
     * @param {string} text - Text to speak
     */
    speak(text) {
        if (!this.synthesis) return;

        // Cancel any ongoing speech for instant response
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1; // Slightly faster for quicker response
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';

        // Speak immediately without delay
        this.synthesis.speak(utterance);
        console.log('[Voice] Speaking:', text);
    }

    /**
     * Search for medication
     * @param {string} medicationName - Medication to search
     */
    searchMedication(medicationName) {
        const searchInput = document.getElementById('search-prescriptions');
        if (searchInput) {
            searchInput.value = medicationName;
            searchInput.dispatchEvent(new Event('input'));
        }
    }

    /**
     * Add medication to cart by name
     * @param {string} medicationName - Medication name
     */
    async addMedicationToCart(medicationName) {
        if (typeof MOCK_DATA === 'undefined') {
            this.speak('Unable to access prescription data');
            return;
        }

        const prescription = MOCK_DATA.prescriptions.find(rx => 
            rx.medicationName.toLowerCase().includes(medicationName.toLowerCase())
        );

        if (prescription) {
            if (typeof API !== 'undefined') {
                await API.addToCart(prescription.id);
                this.speak(`${prescription.medicationName} added to cart`);
            }
        } else {
            this.speak(`Could not find ${medicationName} in your prescriptions`);
        }
    }

    /**
     * Check order status
     */
    checkOrderStatus() {
        // Use MOCK_DATA as source of truth
        const orders = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.orders) ? MOCK_DATA.orders : [];
        
        if (orders.length === 0) {
            this.speak('You have no recent orders');
        } else {
            const latestOrder = orders[0];
            this.speak(`Your latest order ${latestOrder.orderNumber} is ${latestOrder.status}`);
        }
    }

    /**
     * Update voice button UI
     * @param {boolean} listening - Is listening
     */
    updateVoiceButton(listening) {
        const voiceFab = document.getElementById('voice-fab');
        
        if (voiceFab) {
            if (listening) {
                voiceFab.classList.add('listening');
                voiceFab.title = 'Stop Listening';
                voiceFab.innerHTML = '<i class="bi bi-mic-fill"></i>';
            } else {
                voiceFab.classList.remove('listening');
                voiceFab.title = 'Voice Assistant';
                voiceFab.innerHTML = '<i class="bi bi-mic-fill"></i>';
            }
        }
        
        // Also update any other voice buttons
        const voiceBtns = document.querySelectorAll('.voice-assistant-btn');
        voiceBtns.forEach(btn => {
            if (listening) {
                btn.classList.add('listening');
                btn.innerHTML = '<i class="bi bi-mic-fill"></i>';
            } else {
                btn.classList.remove('listening');
                btn.innerHTML = '<i class="bi bi-mic"></i>';
            }
        });
        
        console.log('[Voice] Button updated, listening:', listening);
    }

    /**
     * Get command suggestions
     */
    getCommandSuggestions() {
        return [
            // Navigation
            { command: 'Open dashboard', category: 'Navigation' },
            { command: 'Show prescriptions', category: 'Navigation' },
            { command: 'Open cart', category: 'Navigation' },
            { command: 'Go to profile', category: 'Navigation' },
            { command: 'Go to checkout', category: 'Navigation' },
            
            // Prescription Queries
            { command: 'How many prescriptions do I have', category: 'Prescription Queries' },
            { command: 'How many active prescriptions', category: 'Prescription Queries' },
            { command: 'Which prescriptions are expiring', category: 'Prescription Queries' },
            { command: 'How many prescriptions are expiring soon', category: 'Prescription Queries' },
            { command: 'How many refills remaining', category: 'Prescription Queries' },
            { command: 'List my medications', category: 'Prescription Queries' },
            { command: 'What is my most expensive medication', category: 'Prescription Queries' },
            { command: 'What is the total cost', category: 'Prescription Queries' },
            { command: 'Tell me about [medication name]', category: 'Prescription Queries' },
            { command: 'Which doctor prescribed my medications', category: 'Prescription Queries' },
            
            // Cart & Order Queries
            { command: 'How many items in cart', category: 'Cart & Orders' },
            { command: 'What is in my cart', category: 'Cart & Orders' },
            { command: 'Check my cart', category: 'Cart & Orders' },
            { command: 'How many orders are ready for pickup', category: 'Cart & Orders' },
            { command: 'What is ready for pickup', category: 'Cart & Orders' },
            { command: 'How many pending orders', category: 'Cart & Orders' },
            { command: 'Check pending orders', category: 'Cart & Orders' },
            { command: 'Order status', category: 'Cart & Orders' },
            
            // Actions
            { command: 'Search for [medication]', category: 'Actions' },
            { command: 'Add [medication] to cart', category: 'Actions' },
            { command: 'Refill prescriptions', category: 'Actions' },
            { command: 'Checkout', category: 'Actions' },
            
            // Settings
            { command: 'Enable dark mode', category: 'Settings' },
            { command: 'Disable dark mode', category: 'Settings' },
            { command: 'Toggle dark mode', category: 'Settings' },
            
            // Account
            { command: 'Log out', category: 'Account' },
            
            // Support
            { command: 'Help', category: 'Support' }
        ];
    }
    
    /**
     * Show listening indicator
     */
    showListeningIndicator() {
        let indicator = document.getElementById('voice-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'voice-indicator';
            indicator.innerHTML = `
                <div class="voice-listening-popup">
                    <div class="pulse-ring"></div>
                    <i class="bi bi-mic-fill"></i>
                    <p class="listening-text">Listening...</p>
                    <p class="transcript-text" id="interim-transcript"></p>
                </div>
            `;
            document.body.appendChild(indicator);
            
            // Add styles
            const style = document.createElement('style');
            style.innerHTML = `
                .voice-listening-popup {
                    position: fixed;
                    bottom: 100px;
                    right: 30px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 15px;
                    box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
                    z-index: 10000;
                    text-align: center;
                    min-width: 200px;
                    animation: slideUp 0.3s ease;
                }
                
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                .pulse-ring {
                    width: 60px;
                    height: 60px;
                    border: 3px solid rgba(255,255,255,0.5);
                    border-radius: 50%;
                    margin: 0 auto 10px;
                    animation: pulse 1.5s ease-in-out infinite;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .pulse-ring i {
                    font-size: 24px;
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
                
                .listening-text {
                    margin: 10px 0 5px;
                    font-weight: 600;
                    font-size: 16px;
                }
                
                .transcript-text {
                    margin: 5px 0 0;
                    font-size: 14px;
                    opacity: 0.9;
                    font-style: italic;
                    min-height: 20px;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Hide listening indicator
     */
    hideListeningIndicator() {
        const indicator = document.getElementById('voice-indicator');
        if (indicator) {
            indicator.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => indicator.remove(), 300);
        }
    }
    
    /**
     * Show transcript
     */
    showTranscript(text, isFinal) {
        const transcript = document.getElementById('interim-transcript');
        if (transcript) {
            transcript.textContent = text;
            if (isFinal) {
                transcript.style.fontWeight = 'bold';
            }
        }
    }
    
    /**
     * Show error message
     */
    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast position-fixed top-0 end-0 m-3';
        toast.setAttribute('role', 'alert');
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            <div class="toast-header bg-danger text-white">
                <i class="bi bi-exclamation-triangle me-2"></i>
                <strong class="me-auto">Voice Assistant Error</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">${message}</div>
        `;
        document.body.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast, { delay: 5000 });
        bsToast.show();
        toast.addEventListener('hidden.bs.toast', () => toast.remove());
    }
    
    /**
     * Show command suggestion
     */
    showCommandSuggestion() {
        const suggestions = [
            'Try saying "Show prescriptions"',
            'Try saying "Open cart"',
            'Try saying "Search for medication"',
            'Try saying "Help" for more commands'
        ];
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        
        setTimeout(() => {
            const toast = document.createElement('div');
            toast.className = 'toast position-fixed top-0 end-0 m-3';
            toast.setAttribute('role', 'alert');
            toast.style.zIndex = '9999';
            toast.innerHTML = `
                <div class="toast-header bg-info text-white">
                    <i class="bi bi-lightbulb me-2"></i>
                    <strong class="me-auto">Suggestion</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">${randomSuggestion}</div>
            `;
            document.body.appendChild(toast);
            const bsToast = new bootstrap.Toast(toast, { delay: 4000 });
            bsToast.show();
            toast.addEventListener('hidden.bs.toast', () => toast.remove());
        }, 1000);
    }
    
    /**
     * Show help modal with all commands
     */
    showHelpModal() {
        const commands = this.getCommandSuggestions();
        const groupedCommands = commands.reduce((acc, cmd) => {
            if (!acc[cmd.category]) acc[cmd.category] = [];
            acc[cmd.category].push(cmd.command);
            return acc;
        }, {});
        
        let commandsHTML = '';
        for (const [category, cmds] of Object.entries(groupedCommands)) {
            commandsHTML += `
                <div class="mb-3">
                    <h6 class="text-primary"><i class="bi bi-folder me-2"></i>${category}</h6>
                    <ul class="list-unstyled ms-3">
                        ${cmds.map(cmd => `
                            <li class="mb-2">
                                <i class="bi bi-chevron-right me-2"></i>
                                <code>${cmd}</code>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        
        const modal = `
            <div class="modal fade" id="voiceHelpModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-gradient" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                            <h5 class="modal-title">
                                <i class="bi bi-mic-fill me-2"></i>Voice Assistant Commands
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-info">
                                <i class="bi bi-info-circle me-2"></i>
                                <strong>How to use:</strong> Click the microphone button and speak any of these commands clearly.
                            </div>
                            
                            <div class="alert alert-success">
                                <i class="bi bi-stars me-2"></i>
                                <strong>Smart Features!</strong> I can analyze your prescriptions and answer questions like:
                                <ul class="mb-0 mt-2">
                                    <li>"How many active prescriptions?" - Get count of active medications</li>
                                    <li>"Which medications are expiring soon?" - Check medications expiring within 30 days</li>
                                    <li>"What is my most expensive prescription?" - Find highest copay medication</li>
                                    <li>"How many refills are remaining?" - Check total refills across all prescriptions</li>
                                    <li>"How many orders are ready for pickup?" - See ready orders with medication names</li>
                                    <li>"How many pending orders?" - Check processing and pending orders</li>
                                    <li>"Tell me about [medication name]" - Get detailed info about specific medication</li>
                                </ul>
                            </div>
                            
                            ${commandsHTML}
                            
                            <div class="alert alert-warning mt-3">
                                <i class="bi bi-lightbulb me-2"></i>
                                <strong>Quick Examples:</strong>
                                <ul class="mb-0">
                                    <li>"How many items in cart?" - Check cart item count</li>
                                    <li>"What's in my cart?" - List all cart items with quantities</li>
                                    <li>"List my medications" - Hear all your prescription names</li>
                                    <li>"Open cart" - Navigate to shopping cart page</li>
                                    <li>"Go to checkout" - Navigate to checkout page</li>
                                    <li>"Enable dark mode" - Switch to dark theme</li>
                                    <li>"Toggle dark mode" - Switch between light and dark</li>
                                </ul>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onclick="voiceAssistant.startListening()">
                                <i class="bi bi-mic me-2"></i>Try Now
                            </button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal
        const existing = document.getElementById('voiceHelpModal');
        if (existing) existing.remove();
        
        // Add and show modal
        document.body.insertAdjacentHTML('beforeend', modal);
        const bsModal = new bootstrap.Modal(document.getElementById('voiceHelpModal'));
        bsModal.show();
        
        // Speak the help
        this.speak('Here are all the commands I can understand. You can also see them on screen.');
        
        // Cleanup
        document.getElementById('voiceHelpModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    /**
     * Show reminders
     */
    showReminders() {
        if (typeof medicationReminders !== 'undefined') {
            const reminders = medicationReminders.getReminders();
            if (reminders.length > 0) {
                this.speak(`You have ${reminders.length} medication reminders active`);
            } else {
                this.speak('You have no active medication reminders');
            }
        }
    }
    
    /**
     * Get user's prescriptions from localStorage
     * @returns {Array} Array of prescriptions
     */
    getUserPrescriptions() {
        try {
            // Always use MOCK_DATA as source of truth
            if (typeof MOCK_DATA !== 'undefined') {
                return MOCK_DATA.prescriptions;
            }
            
            // Fallback to localStorage (for offline)
            return JSON.parse(localStorage.getItem('gwpharmacy_prescriptions') || '[]');
        } catch (error) {
            console.error('[Voice] Error getting prescriptions:', error);
            return [];
        }
    }
    
    /**
     * Get user's orders from localStorage
     * @returns {Array} Array of orders
     */
    getUserOrders() {
        try {
            // Always use MOCK_DATA as source of truth
            if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.orders) {
                return MOCK_DATA.orders;
            }
            // Fallback to localStorage (for offline)
            return JSON.parse(localStorage.getItem('gwpharmacy_orders') || '[]');
        } catch (error) {
            console.error('[Voice] Error getting orders:', error);
            return [];
        }
    }
    
    /**
     * Get cart items
     * @returns {Array} Cart items
     */
    getCartItems() {
        try {
            return JSON.parse(localStorage.getItem('gwpharmacy_cart') || '[]');
        } catch (error) {
            console.error('[Voice] Error getting cart:', error);
            return [];
        }
    }
    
    /**
     * Get prescriptions expiring within 30 days
     * @param {Array} prescriptions - All prescriptions
     * @returns {Array} Expiring prescriptions
     */
    getExpiringPrescriptions(prescriptions) {
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        return prescriptions.filter(p => {
            const expiryDate = new Date(p.expiryDate);
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
        }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    }
    
    /**
     * Get days until prescription expires
     * @param {string} expiryDate - Expiration date
     * @returns {number} Days until expiration
     */
    getDaysUntilExpiration(expiryDate) {
        const expiration = new Date(expiryDate);
        const today = new Date();
        const diffTime = expiration - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    
    /**
     * Group prescriptions by doctor
     * @param {Array} prescriptions - All prescriptions
     * @returns {Array} Doctors with prescription counts
     */
    getPrescriptionsByDoctor(prescriptions) {
        const doctorMap = {};
        
        prescriptions.forEach(p => {
            const doctor = p.prescribedBy || 'Unknown Doctor';
            if (!doctorMap[doctor]) {
                doctorMap[doctor] = { doctor, count: 0 };
            }
            doctorMap[doctor].count++;
        });
        
        return Object.values(doctorMap).sort((a, b) => b.count - a.count);
    }
    
    /**
     * Extract medication name from command
     * @param {string} command - Voice command
     * @returns {string|null} Medication name
     */
    extractMedicationName(command) {
        // Remove common phrases
        let cleaned = command.replace(/(when does|tell me about|info about|information on|search for|find|look for|add|to cart)/gi, '').trim();
        
        // If something remains, return it
        if (cleaned.length > 2) {
            return cleaned;
        }
        
        return null;
    }
    
    /**
     * Get detailed medication information
     * @param {Object} medication - Prescription object
     * @returns {string} Information string
     */
    getMedicationInfo(medication) {
        const daysUntilExpiration = this.getDaysUntilExpiration(medication.expirationDate);
        const parts = [];
        
        parts.push(`${medication.medicationName}, ${medication.dosage}`);
        
        if (medication.refillsRemaining > 0) {
            parts.push(`${medication.refillsRemaining} refills remaining`);
        } else {
            parts.push('No refills remaining');
        }
        
        if (daysUntilExpiration > 0) {
            if (daysUntilExpiration <= 30) {
                parts.push(`Expires in ${daysUntilExpiration} days`);
            }
        } else {
            parts.push('This prescription has expired');
        }
        
        if (medication.insuranceInfo?.copay) {
            parts.push(`Copay is $${medication.insuranceInfo.copay}`);
        }
        
        parts.push(`Prescribed by ${medication.prescribedBy || 'your doctor'}`);
        
        return parts.join('. ') + '.';
    }
}

// Initialize voice assistant
const voiceAssistant = new VoiceAssistant();

// Make it globally accessible for debugging
window.voiceAssistant = voiceAssistant;

console.log('[Voice] Voice assistant instance created and available globally');

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VoiceAssistant, voiceAssistant };
}
