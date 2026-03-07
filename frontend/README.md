# SunSeeker Frontend

React + TypeScript + Vite client for SunSeeker: sunrise/sunset feed, uploads, profile, and AI assistant.

## Tech Stack

- **React 19** with **TypeScript**
- **Vite** for dev server and build
- **React Router** for routing
- **Zod** for form validation
- **Lucide React** for icons

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server (HMR)   |
| `npm run build`| TypeScript + Vite build  |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint               |
| `npm test`     | Run tests                |

## Environment

Copy `.env.example` to `.env` and set:

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base (e.g. `https://localhost:3000/api`). Required for auth and data. |
| `VITE_GOOGLE_OAUTH_URL` | Optional. When set, Login uses Google OAuth by redirecting to this URL (e.g. backend `/auth/google`). |

## Development

1. Ensure the backend is running and reachable at `VITE_API_BASE_URL`.
2. Run `npm run dev`; app is served at `https://localhost:5173` (or the port Vite prints).
3. Use Register/Login; the app uses JWT with automatic refresh on 401.

## Build

```bash
npm run build
```

Output is in `dist/`. Use `npm run preview` to serve the production build locally.
