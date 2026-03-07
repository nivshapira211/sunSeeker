# SunSeeker Backend

Node.js + Express + TypeScript API for SunSeeker: auth, posts, comments, likes, and OpenRouter AI (recommendations, caption suggestions, assistant).

## Tech Stack

- **Node.js** with **Express 5** and **TypeScript**
- **MongoDB** via **Mongoose**
- **JWT** (access + refresh tokens) and **Passport** (Google OAuth)
- **OpenRouter** for AI (caption, recommendations, sunrise/sunset assistant, image detection)
- **express-validator** for request validation
- **Swagger** for API docs
- **multer** for file uploads

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Start server with ts-node-dev  |
| `npm run build`| Compile TypeScript to `dist/`  |
| `npm start`    | Run compiled `dist/server.js`  |
| `npm test`     | Run Jest tests                 |

## Environment

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | e.g. `development` |
| `PORT` | Server port (default `3000`) |
| `MONGO_URI` | MongoDB connection string (e.g. `mongodb://localhost:27017/posts-app`) |
| `JWT_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `OPENROUTER_API_KEY` | OpenRouter API key (starts with `sk-or-`). Required for AI features. Get one at [openrouter.ai](https://openrouter.ai). |
| `OPENROUTER_MODEL` | Optional. Model id (default `openai/gpt-4o-mini`) |
| `SSL_KEY_PATH` | Path to TLS key for HTTPS |
| `SSL_CERT_PATH` | Path to TLS certificate |
| `CORS_ORIGIN` | Allowed origin (e.g. `https://localhost:5173`) |

Do not commit `.env`; it is listed in `.gitignore`.

## API Documentation

When the server is running, Swagger UI is available at:

- `https://localhost:3000/api-docs`

## Testing

```bash
npm test
```

Tests use MongoDB Memory Server where possible. Some environments may see MongoMemoryServer issues; the test suite is designed to clean up defensively.

## Main Routes

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/google`
- **Users**: `/api/users/me` (get/update profile)
- **Posts**: `/api/posts` (CRUD, pagination), likes, comments
- **Recommendations**: `/api/recommendations` (AI), `/api/recommendations/caption` (GET/POST), `/api/recommendations/chat` (assistant)

Protected routes require a valid JWT in the `Authorization: Bearer <token>` header.
