# GW Pharmacy Patient Portal

A secure, HIPAA-aligned patient web portal for managing prescriptions online.

## Project Overview

The GW Pharmacy Patient Portal enables patients to:
- View active prescriptions
- Request refills
- Select pickup locations (pharmacy or kiosks)
- Pay copays securely
- Manage profile and insurance information
- Receive notifications for prescription status

## Key Features

- **Prescription Management**: View, search, and refill prescriptions
- **Smart Cart System**: Add multiple prescriptions and select pickup locations
- **Secure Checkout**: Payment integration with copay calculation
- **Profile Management**: Masked insurance data and notification preferences
- **Accessibility**: WCAG 2.1 AA compliant, mobile-first design
- **Privacy First**: HIPAA-aligned workflows with secure authentication

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, or Edge)

### Quick Start
1. Download or extract the project folder
2. Open the project folder
3. Double-click `index.html` to open in your browser
4. Sign in with the test credentials below

## Project Structure

```
GW-Pharmacy/
├── index.html
├── pages/
│   ├── auth/
│   │   ├── forgot-password.html
│   │   └── register.html
│   ├── dashboard.html
│   ├── prescriptions.html
│   ├── cart.html
│   ├── checkout.html
│   └── profile.html
├── assets/
│   ├── css/
│   ├── data/
│   └── js/
├── manifest.json
└── service-worker.js
```

## Security and Privacy

- HIPAA-aligned handling of patient workflows
- Masked insurance information (for example: `****-1234`)
- Session-based authentication patterns
- Audit-friendly activity handling for sensitive actions
- HTTPS required for production deployment

## Accessibility

- WCAG 2.1 AA compliance target
- Keyboard navigation support
- Screen reader support
- High-contrast compatibility
- Responsive typography and layout

## Test Credentials

**Patient Account:**
- Email: `patient@gwu.edu`
- Password: `Demo123!`

**Test Credit Card:**
- Number: `4532 1234 5678 9010`
- CVV: `123`
- Expiry: Any future date

## Milestones

- [x] M1 Foundations: project setup, component library, auth shell
- [x] M2 Core Flows: prescriptions list, refill to cart, pickup selector
- [x] M3 Payments and Profile: checkout, insurance masking, notifications
- [x] M4 QA and Accessibility: WCAG compliance and error handling
- [ ] M5 Production Deployment: hosted deployment and final documentation

## Technology Stack

- Frontend: HTML5, CSS3, Bootstrap 5.3
- JavaScript: Vanilla JS (ES6+)
- Icons: Bootstrap Icons
- Storage: LocalStorage for session and demo persistence
- APIs: Integration layer (EHR, POS, payment gateway)

## Support

For technical issues or questions:
- Email: marshal.takavinga@gwu.edu

---

This is a prototype application with sample data. Production deployment requires backend implementation, database integration, and security hardening.
