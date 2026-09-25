# XAVITECH 2026

Annual Tech Fest Platform for XAVITECH 2026.

## Project Structure

```text
XAVITECH-2026/
├── frontend/             # Next.js 14 frontend application (React, Three.js, Tailwind CSS)
│   ├── app/              # App router pages, layouts, and global styles
│   ├── components/       # UI, 3D experience, effects, and layout components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and static event data
│   ├── public/           # Static assets, images, and media
│   ├── package.json      # Frontend package configuration and scripts
│   ├── next.config.mjs   # Next.js configuration
│   ├── tailwind.config.ts# Tailwind CSS configuration
│   └── tsconfig.json     # TypeScript configuration
├── backend/              # Placeholder for future backend API service
│   └── README.md         # Backend documentation and roadmap
└── README.md             # Project documentation
```

## Getting Started

### Frontend Development

To run the Next.js frontend development server:

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

#### Available Scripts in `frontend/`

- `npm run dev` - Starts the development server with Hot Module Replacement.
- `npm run build` - Builds the application for production (static HTML export).
- `npm run start` - Starts the Next.js production server.
- `npm run lint` - Runs ESLint checks.

### Backend

The backend directory (`backend/`) is designated for the upcoming API services and backend implementation. See [`backend/README.md`](backend/README.md) for planned features and architecture.
