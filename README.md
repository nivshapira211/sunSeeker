# SunSeeker

SunSeeker is a collaborative platform for discovering and planning sunrise and sunset viewing experiences. It combines photography with practical planning by providing the exact location and time data needed to recreate a captured moment.

## About the App

The app offers a visually immersive feed of sunrise/sunset photos plus actionable technical information. Users see where each photo was taken and when to be there for the same view. It also provides AI-powered suggestions for viewing spots and optimal times.

## Key Features

- **Sunrise & Sunset Feed** – Browse community photos with time and location; like and comment; infinite scroll.
- **Personal Content** – Upload your own sunrise/sunset photos; edit or delete your posts; view your posts on your profile.
- **AI-Powered Validation** – Uploaded images are validated as sunrise or sunset photos.
- **AI Caption Suggestions** – Get short, engaging caption ideas (text or from the uploaded image).
- **Sunrise & Sunset Assistant** – Chat with an AI that only recommends spots and times for sunrise/sunset viewing.
- **User Management** – Register, login (username/password or Google OAuth), logout; JWT with refresh token; profile with avatar and username edit.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, Passport (Google OAuth), OpenRouter AI, Swagger.
- **Frontend**: React, TypeScript, Vite, React Router, Zod.

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or `MONGO_URI`)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env: MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET, OPENROUTER_API_KEY (for AI), SSL paths, CORS_ORIGIN
npm install
npm run dev
```

API runs at `https://localhost:3000` (HTTPS). See [backend/README.md](backend/README.md) for env details and tests.

### Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env: VITE_API_BASE_URL=https://localhost:3000/api, optional VITE_GOOGLE_OAUTH_URL
npm install
npm run dev
```

App runs at `https://localhost:5173`. See [frontend/README.md](frontend/README.md) for details.

### AI (OpenRouter)

For caption suggestions, recommendations, and the assistant: set `OPENROUTER_API_KEY` in `backend/.env` (get a key at [openrouter.ai](https://openrouter.ai); key starts with `sk-or-`).

## Project Structure

```
sunSeeker/
├── backend/     # Express API, MongoDB, OpenRouter AI, Swagger
├── frontend/    # React + Vite SPA
└── README.md    # This file
```

## API Documentation

When the backend is running, Swagger UI is available at:

- `https://localhost:3000/api-docs`

## License

ISC
