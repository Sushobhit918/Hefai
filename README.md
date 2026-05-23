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

- Vercel deploys the React app using `vercel.json`.
- Render deploys the API, Postgres, and Redis using `render.yaml`.
- Set `VITE_API_URL` in Vercel to your Render API URL plus `/api`, for example `https://hefai-api.onrender.com/api`.
- Set `WEB_ORIGIN` in Render to your Vercel frontend URL, for example `https://hefai.vercel.app`.

## Domains Covered

- Customer quotation catalog, direct requirement submission, project/contact details
- Admin dashboard, realtime quotation refresh, full customer quotation details, product management, lead tracking, low-stock visibility
- Redis-backed product catalogue caching and quote/product event publishing
- Prisma schema for users, products, quotations, quotation items, inquiries, categories
- CI checks for lint, test, build, and Docker image builds
