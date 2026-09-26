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
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

   # Firebase Authentication (Google Login Verification)
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_key_here\n-----END PRIVATE KEY-----\n"
   ```

*(Brevo and Payment Gateway variables will be populated during subsequent phases).*

---

## 🗄️ Database Migrations

Database schema changes are managed via clean, reproducible SQL migrations tracked in the `schema_migrations` table:

```bash
npm run migrate
```

- Migrations directory: [`src/database/migrations/`](file:///C:/Users/rites/tech-fest-2026-redesign-v2/XAVITECH-2026/backend/src/database/migrations/)
- Migration runner: [`src/database/migrate.js`](file:///C:/Users/rites/tech-fest-2026-redesign-v2/XAVITECH-2026/backend/src/database/migrate.js)

### `users` Table Schema
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique database identifier |
| `firebase_uid` | `VARCHAR(128)` | `NOT NULL UNIQUE` | Firebase Authentication UID |
| `email` | `VARCHAR(255)` | `NOT NULL` (Indexed) | User email from Google Auth |
| `name` | `VARCHAR(255)` | | Participant display name |
| `profile_image` | `TEXT` | | Google profile picture URL |
| `phone` | `VARCHAR(32)` | | Contact number (user editable) |
| `college_name` | `VARCHAR(255)` | | College / Institution name |
| `role` | `VARCHAR(32)` | `DEFAULT 'USER'` (`USER`, `ADMIN`, `VOLUNTEER`) | System authorization role |
| `is_active` | `BOOLEAN` | `DEFAULT true` | Account active state |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Registration timestamp |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` (Auto trigger) | Last update timestamp |

---

## 🛡️ Authentication & User Layer (Phases 2 & 3)

XAVITECH-2026 uses Firebase Authentication strictly for identity verification (Google Sign-In), while PostgreSQL (Supabase) serves as the persistent application database:

```text
Frontend (Next.js / Web)
    ↓  Google Login (Firebase Client SDK)
Firebase ID Token (JWT)
    ↓  HTTP Request: "Authorization: Bearer <Firebase ID Token>"
Backend Express API
    ↓  Firebase Admin SDK (auth.verifyIdToken)
req.user (Verified: uid, email, name, picture)
    ↓
User Service (getOrCreateUserFromFirebase / updateUserProfile)
    ↓
PostgreSQL `users` table (Supabase)
    ↓
Response: Standardized JSON payload with full user profile
```

### Security Rules:
1. **Never trust client-supplied user parameters**: The backend ignores `uid` or `email` provided in request bodies or query parameters. Identity is derived solely from the cryptographically verified Firebase ID token.
2. **Bearer Token Validation**: Requests to protected routes must include `Authorization: Bearer <token>`. Missing, malformed, invalid, or expired tokens receive a `401 Unauthorized` JSON response.
3. **Self Profile Updates Only**: `PATCH /api/auth/profile` updates only the caller's record based on `req.user.uid`.

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

## 🩺 API Endpoints

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Service health verification |
| `GET` | `/api/auth/me` | Bearer Token Required | Authenticates caller, synchronizes with PostgreSQL, and returns user profile |
| `PATCH` | `/api/auth/profile` | Bearer Token Required | Updates safe profile fields (`name`, `phone`, `college_name`, `profile_image`) |

### Example Responses

#### `GET /api/auth/me`
```json
{
  "success": true,
  "data": {
    "id": "e2a3c4b1-8b77-4b71-872e-3c582e0df401",
    "firebaseUid": "W7gN9872nksd82K...",
    "email": "student@college.edu",
    "name": "Jane Doe",
    "profileImage": "https://lh3.googleusercontent.com/...",
    "phone": null,
    "collegeName": null,
    "role": "USER",
    "isActive": true
  }
}
```

#### `PATCH /api/auth/profile`
Request body:
```json
{
  "name": "Jane Doe",
  "phone": "+919876543210",
  "college_name": "St. Xavier's College"
}
```
Response:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "e2a3c4b1-8b77-4b71-872e-3c582e0df401",
    "firebaseUid": "W7gN9872nksd82K...",
    "email": "student@college.edu",
    "name": "Jane Doe",
    "profileImage": "https://lh3.googleusercontent.com/...",
    "phone": "+919876543210",
    "collegeName": "St. Xavier's College",
    "role": "USER",
    "isActive": true
  }
}
```

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
│   │   ├── auth.controller.js         # GET /api/auth/me & PATCH /api/auth/profile
│   │   ├── event.controller.js
│   │   ├── pass.controller.js
│   │   ├── payment.controller.js
│   │   ├── registration.controller.js
│   │   └── user.controller.js
│   │
│   ├── database/           # Database migrations and scripts
│   │   ├── migrations/
│   │   │   └── 001_create_users_table.sql # Users table schema
│   │   └── migrate.js                 # Database migration runner (npm run migrate)
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
│   │   └── user.model.js              # PostgreSQL UserModel queries for `users` table
│   │
│   ├── routes/             # API route definitions
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js             # /api/auth endpoints (GET /me, PATCH /profile)
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
│   │   └── user.service.js            # User synchronization & profile update logic
│   │
│   ├── utils/              # Reusable helpers & constants
│   │   ├── constants.util.js
│   │   ├── logger.util.js
│   │   └── response.util.js
│   │
│   ├── validators/         # Input validation schemas
│   │   ├── admin.validator.js
│   │   ├── auth.validator.js          # Profile update validation (name, phone, college)
│   │   ├── payment.validator.js
│   │   └── registration.validator.js
│   │
│   ├── app.js              # Express app setup (CORS, JSON parsing, routes, error handling)
│   └── server.js           # Server entry point (Port listener, startup checks, shutdown)
│
├── .env                    # Local environment configuration (git-ignored)
├── .env.example            # Environment variables template
├── package.json            # Project dependencies & npm scripts (including npm run migrate)
└── README.md               # Backend documentation
```
