# ai-budget-backend

Backend API for the AI Budget app. Node.js + TypeScript, [Fastify](https://fastify.io).

## Tech stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Fastify
- **Env:** dotenv
- **Dev:** ESLint, Prettier, tsx

## Project structure

```
src/
├── server.ts      # Entry point
├── routes/        # API route handlers
├── plugins/       # Fastify plugins
├── services/      # Business logic
└── utils/         # Helpers
```

## Prerequisites

- Node.js (v20+ recommended)
- npm

## Setup

1. **Clone and install**

   ```bash
   git clone https://github.com/Oldu8/ai-budget-backend.git
   cd ai-budget-backend
   npm install
   ```

2. **Environment**

   Copy the example env file and set your values:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` if you need to change `PORT`, `HOST`, or `NODE_ENV`. Defaults: port `3000`, host `0.0.0.0`.

## Scripts

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `npm run dev`      | Run dev server (tsx watch)     |
| `npm run build`    | Compile TypeScript to `dist/`  |
| `npm run start`    | Run compiled app (`node dist`) |
| `npm run lint`     | Run ESLint on `src/`           |
| `npm run format`   | Format code with Prettier      |
| `npm run format:check` | Check formatting (no write) |
| `npm test`         | Run tests (placeholder)        |

## Environment variables

| Variable   | Description        | Default     |
| ---------- | ------------------ | ----------- |
| `NODE_ENV` | Environment mode   | `development` |
| `PORT`     | HTTP port          | `3000`      |
| `HOST`     | Bind address       | `0.0.0.0`   |

## API

- **GET `/health`** — Health check. Returns `{ "status": "ok" }`.

## License

ISC
