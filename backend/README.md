# XAVITECH-2026 Backend Service

Scalable RESTful API backend service for the **XAVITECH-2026** Annual Tech Fest, built with Node.js, Express.js, and PostgreSQL via Supabase.

---

## 📋 Prerequisites

Before setting up the project, make sure you have the following installed:
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- A **Supabase** account and project (PostgreSQL)

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
   ```

*(Other variables for Firebase, Brevo, and Payment Gateways will be populated during subsequent phases).*

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

Once started, the server listens on `http://localhost:5000` (or the configured `PORT`).

---

## 🩺 Health Check Endpoints

| Method | Endpoint | Description | Expected Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Primary API health verification | `{"success": true, "message": "XAVITECH backend is running"}` |
| `GET` | `/health` | Root server health check | `{"success": true, "message": "XAVITECH backend is running"}` |

---

## 📁 Directory Structure

```text
backend/
├── src/
│   ├── config/             # External service & environment configurations
│   │   ├── brevo.js        # Brevo transactional email configuration placeholder
│   │   ├── database.js     # PostgreSQL / Supabase connection & test function
│   │   ├── env.config.js   # Centralized environment variable loader & CORS origin parser
│   │   └── firebase.js     # Firebase Admin SDK configuration placeholder
│   │
│   ├── controllers/        # HTTP request & response handlers
│   │   ├── admin.controller.js
│   │   ├── auth.controller.js
│   │   ├── event.controller.js
│   │   ├── pass.controller.js
│   │   ├── payment.controller.js
│   │   ├── registration.controller.js
│   │   └── user.controller.js
│   │
│   ├── middleware/         # Custom Express middlewares
│   │   ├── auth.middleware.js         # Firebase Bearer token verification
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
│   │   ├── auth.routes.js
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
