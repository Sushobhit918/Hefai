# HEFAI: A Unit by Haryana Furniture

Full-stack quotation management system for office, educational, and domestic almirah furniture. HEFAI is modeled as an organization-first inquiry and quotation platform, not a traditional e-commerce checkout.

## Stack

- React + Vite frontend
- Node.js + Express API
- PostgreSQL + Prisma ORM
- Redis for product caching and realtime event fanout
- Docker and Docker Compose
- GitHub Actions CI/CD

## Run Locally

```bash
npm install
cp .env.example .env
docker compose up -d db
docker compose up -d redis
npm run prisma:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:4000/api/health

Seed admin:

- Email: `hefai137@gmail.com`
- Password: `Admin@12345`

## Docker

```bash
docker compose up --build
```

Frontend: http://localhost:8081  
API: http://localhost:4000
Redis: localhost:6379

Realtime event stream:

```bash
curl -N http://localhost:4000/api/events
```

## Deployment

### Vercel Frontend

Use either setup:

- Recommended: set Vercel Root Directory to `apps/web`. Build Command: `npm run build`. Output Directory: `dist`.
- Alternative: keep Vercel Root Directory as repository root. Build Command: `npm --workspace apps/web run build`. Output Directory: `apps/web/dist`.

Set this Vercel environment variable:

- `VITE_API_URL=https://YOUR_RENDER_API_URL/api`

### Render API

Render free deployment should host only the API service from `render.yaml`.

Use external free services for data:

- PostgreSQL: Neon or Supabase. Put the connection string in Render as `DATABASE_URL`.
- Redis: Upstash Redis or another Redis provider. Put the Redis connection string in Render as `REDIS_URL`.

Set these Render environment variables:

- `DATABASE_URL=postgresql://...`
- `REDIS_URL=redis://...` or `rediss://...`
- `WEB_ORIGIN=https://YOUR_VERCEL_FRONTEND_URL`
- `ALLOW_VERCEL_ORIGINS=true`

After Render deploys, set Vercel `VITE_API_URL` to the Render API URL plus `/api`.

## Domains Covered

- Customer quotation catalog, direct requirement submission, project/contact details
- Admin dashboard, realtime quotation refresh, full customer quotation details, product management, lead tracking, low-stock visibility
- Redis-backed product catalogue caching and quote/product event publishing
- Prisma schema for users, products, quotations, quotation items, inquiries, categories
- CI checks for lint, test, build, and Docker image builds
