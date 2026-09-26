# XAVITECH-2026 Backend Service

Scalable RESTful API backend service for the **XAVITECH-2026** Annual Tech Fest, built with Node.js, Express.js, Firebase Admin Authentication, and PostgreSQL via Supabase.

---

## 📋 Prerequisites

Before setting up the project, make sure you have the following installed:
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- A **Supabase** account and project (PostgreSQL)
- A **Firebase** project with Google Sign-In enabled

---

## ⚙️ Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## 🔐 Environment Setup

1. Copy the sample environment file to create `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and configure your environment variables:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000

   # PostgreSQL / Supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

   # Firebase Authentication (Google Login Verification)
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_key_here\n-----END PRIVATE KEY-----\n"
   ```

*(Brevo and Payment Gateway variables will be populated during subsequent phases).*

---

## 🛡️ Authentication Architecture (Phase 2)

XAVITECH-2026 uses Firebase Authentication strictly for identity verification (Google Sign-In), while PostgreSQL (Supabase) remains the primary application database:

```text
Frontend (Next.js / Web)
    ↓  Google Login (Firebase Client SDK)
Firebase ID Token (JWT)
    ↓  HTTP Request: "Authorization: Bearer <Firebase ID Token>"
Backend Express API
    ↓  Firebase Admin SDK (auth.verifyIdToken)
Decoded User Identity:
  • req.user.uid
  • req.user.email
  • req.user.name
  • req.user.picture
    ↓
Protected Route Handler (e.g. GET /api/auth/me)
```

### Security Rules:
1. **Never trust client-supplied user parameters**: The backend ignores `uid` or `email` provided directly in request bodies or query parameters. Identity is derived solely from the cryptographically verified Firebase ID token.
2. **Bearer Token Validation**: Requests to protected routes must include `Authorization: Bearer <token>`. Missing, malformed, invalid, or expired tokens receive a `401 Unauthorized` JSON response.

---

## 🚀 Running the Server

### Development Mode (with hot-reload via nodemon)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Once started, the server listens on `http://localhost:5000` (or configured `PORT`).

---

## 🩺 Core Endpoints

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Service health verification |
| `GET` | `/api/auth/me` | Bearer Token Required | Returns authenticated caller's profile verified by Firebase Admin |

---

## 📁 Directory Structure

```text
backend/
├── src/
│   ├── config/             # External service & environment configurations
│   │   ├── brevo.js        # Brevo transactional email configuration placeholder
│   │   ├── database.js     # PostgreSQL / Supabase connection & test function
│   │   ├── env.config.js   # Centralized environment variable loader & CORS origin parser
│   │   └── firebase.js     # Firebase Admin SDK configuration & singleton initializer
│   │
│   ├── controllers/        # HTTP request & response handlers
│   │   ├── admin.controller.js
│   │   ├── auth.controller.js         # GET /api/auth/me (returns verified req.user)
│   │   ├── event.controller.js
│   │   ├── pass.controller.js
│   │   ├── payment.controller.js
│   │   ├── registration.controller.js
│   │   └── user.controller.js
│   │
│   ├── middleware/         # Custom Express middlewares
│   │   ├── auth.js                    # Firebase Bearer ID Token verification middleware
│   │   ├── auth.middleware.js         # Re-export alias for auth.js
│   │   ├── error.middleware.js        # Centralized 404 & global error handling
│   │   ├── role.middleware.js         # Role-based access control
│   │   └── validate.middleware.js     # Request payload validation runner
│   │
│   ├── models/             # Database models and queries
│   │   ├── checkin.model.js
│   │   ├── event.model.js
│   │   ├── payment.model.js
│   │   ├── registration.model.js
│   │   ├── team.model.js
│   │   └── user.model.js
│   │
│   ├── routes/             # API route definitions
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js             # /api/auth endpoints (GET /me)
│   │   ├── event.routes.js
│   │   ├── index.js                   # API route aggregator with /api/health
│   │   ├── pass.routes.js
│   │   ├── payment.routes.js
│   │   ├── registration.routes.js
│   │   └── user.routes.js
│   │
│   ├── services/           # Core business logic
│   │   ├── auth.service.js
│   │   ├── email.service.js
│   │   ├── event.service.js
│   │   ├── payment.service.js
│   │   ├── qr.service.js
│   │   ├── registration.service.js
│   │   └── user.service.js
│   │
│   ├── utils/              # Reusable helpers & constants
│   │   ├── constants.util.js
│   │   ├── logger.util.js
│   │   └── response.util.js
│   │
│   ├── validators/         # Input validation schemas
│   │   ├── admin.validator.js
│   │   ├── auth.validator.js
│   │   ├── payment.validator.js
│   │   └── registration.validator.js
│   │
│   ├── app.js              # Express app setup (CORS, JSON parsing, routes, error handling)
│   └── server.js           # Server entry point (Port listener, startup checks, shutdown)
│
├── .env                    # Local environment configuration (git-ignored)
├── .env.example            # Environment variables template
├── package.json            # Project dependencies & npm scripts
└── README.md               # Backend documentation
```
