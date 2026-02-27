<<<<<<< HEAD
# GW Pharmacy Patient Portal

A secure, HIPAA-aligned patient web portal for managing prescriptions online.

## 🎯 Project Overview

The GW Pharmacy Patient Portal enables patients to:
- View active prescriptions
- Request refills
- Select pickup locations (pharmacy or kiosks)
- Pay copays securely
- Manage profile and insurance information
- Receive notifications for prescription status

## ✨ Key Features

- **Prescription Management**: View, search, and refill prescriptions
- **Smart Cart System**: Add multiple prescriptions, select pickup locations
- **Secure Checkout**: Payment integration with copay calculation
- **Profile Management**: Masked insurance data, notification preferences
- **Accessibility**: WCAG 2.1 AA compliant, mobile-first design
- **Privacy-First**: HIPAA-aligned workflows, secure authentication

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Quick Start
1. Download/extract the project folder
2. Navigate to the project folder
3. Double-click `index.html` to open in your browser
4. Login with the test credentials below





## 📁 Project Structure

```
GW-Pharmacy/
├── index.html                 # Landing/login page
├── pages/                     # HTML pages
│   ├── auth/                  # Authentication pages
│   │   ├── login.html
│   │   ├── register.html
│   │   └── forgot-password.html
│   ├── dashboard.html         # Main dashboard
│   ├── prescriptions.html     # Prescription list
│   ├── prescription-detail.html
│   ├── cart.html              # Shopping cart
│   ├── checkout.html          # Payment checkout
│   └── profile.html           # User profile
├── assets/                    # Static assets
│   ├── css/                   # Stylesheets
│   │   ├── main.css          # Global styles
│   │   ├── components.css    # Reusable components
│   │   └── accessibility.css # A11y enhancements
│   ├── js/                    # JavaScript modules
│   │   ├── app.js            # Main application
│   │   ├── auth.js           # Authentication logic
│   │   ├── prescriptions.js  # Prescription management
│   │   ├── cart.js           # Cart functionality
│   │   ├── profile.js        # Profile management
│   │   ├── api.js            # API facade
│   │   ├── utils.js          # Utility functions
│   │   ├── twilio-service.js # SMS notifications
│   │   └── notifications.js  # Notification service
│   ├── data/                  # Sample data
│   │   └── mock-data.js      # Sample data
│   └── images/                # Images and icons
├── components/                # Reusable HTML components
│   ├── header.html
│   ├── footer.html
│   └── navigation.html
└── docs/                      # Documentation
    ├── API.md                 # API documentation
    ├── ACCESSIBILITY.md       # Accessibility guide
    ├── TWILIO_SMS.md          # Twilio SMS integration guide
    └── DEPLOYMENT.md          # Deployment guide
```

## 🔐 Security & Privacy

- **HIPAA Compliance**: Role-based access, PHI protection
- **Data Masking**: Insurance information masked (e.g., ****-1234)
- **Secure Authentication**: Session management with secure sessions
- **Audit Logging**: All sensitive actions logged for compliance
- **HTTPS Ready**: Production deployment requires SSL/TLS

## ♿ Accessibility Features

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader optimized
- High contrast mode
- Responsive font sizing
- ARIA labels and roles

## 🧪 Test Credentials

**Patient Account:**
- Email: `patient@gwu.edu`
- Password: `Demo123!`

**Test Credit Card:**
- Number: `4532 1234 5678 9010`
- CVV: `123`
- Expiry: Any future date

## 📋 Milestones

- [x] **M1 - Foundations**: Project setup, component library, auth shell
- [x] **M2 - Core Flows**: Prescriptions list, refill to cart, pickup selector
- [x] **M3 - Payments & Profile**: Checkout, insurance masking, notifications
- [x] **M4 - QA & Accessibility**: WCAG compliance, error handling
- [ ] **M5 - Production Deployment**: Hosted deployment, documentation

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Bootstrap 5.3
- **JavaScript**: Vanilla JS (ES6+)
- **Icons**: Bootstrap Icons
- **Storage**: LocalStorage for session/data persistence
- **APIs**: Integration layer (EHR, POS, Payment Gateway)

## 📊 Key Metrics (Planned)

- Page load time < 2 seconds
- Mobile responsiveness: 100%
- Accessibility score: 95+
- User satisfaction: Target 4.5/5

## 🤝 Contributing

This is a course project. For questions or feedback, contact the development team.

## 📄 License

Educational project for GWU Web Development Course (6205)

## 📞 Support

For technical issues or questions:
- Email: marshal.takavinga@gwu.edu


---

**Note**: This is a prototype application with sample data. Production deployment requires backend implementation, database integration, and security hardening.
=======
# GW-Phamarcy-Project
MSIT Web development GWU Project
>>>>>>> 1f302401beb0f6a52b6024f810b60b752a6484b2
