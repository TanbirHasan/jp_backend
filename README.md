# Node.js Express PostgreSQL Practice

Small backend project for practicing Node.js, Express, and PostgreSQL interview topics.

## Scripts

```bash
npm run dev
npm start
```

## Setup

1. Copy `.env.example` to `.env`.
2. Update `DATABASE_URL` with your local PostgreSQL username, password, host, port, and database name.
3. Create the table with `src/db/schema.sql`.
4. Start the app with `npm run dev`.

## Starter Endpoints

- `GET /health`
- `GET /api/v1/users`
- `POST /api/v1/users`
