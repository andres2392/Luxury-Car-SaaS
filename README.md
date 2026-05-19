# Luxury-Car-SaaS

Luxury-Car-SaaS is a premium vehicle marketplace and dealer operations platform. It is built as a monorepo with a public inventory experience, role-protected dashboard tools, backend APIs, PostgreSQL persistence, Alembic migrations, and Supabase-backed vehicle image storage.

## Stack

- Frontend: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, app-owned UI primitives
- Backend: FastAPI, SQLAlchemy, Pydantic, Alembic
- Database: PostgreSQL
- Storage: Supabase Storage for uploaded car images
- Local infrastructure: Docker Compose for PostgreSQL and backend services

## Current Features

- Public luxury inventory browsing
- Vehicle detail pages with inquiry submission
- JWT authentication
- Role-aware dashboard access for admins and dealers
- Admin/dealer inventory management
- Dashboard listing create/edit/delete workflows
- Dashboard image upload, removal, and featured-image selection
- Dealer-scoped inventory and inquiry visibility
- Centralized frontend API client and auth helpers
- Seed data for a larger luxury inventory catalog

## Repository Structure

```text
Luxury-Car-SaaS/
├── backend/
│   ├── alembic/              # Database migrations
│   ├── app/
│   │   ├── api/routes/       # FastAPI route modules
│   │   ├── core/             # Config, security, storage helpers
│   │   ├── db/               # SQLAlchemy session/base setup
│   │   ├── models/           # ORM models
│   │   ├── schemas/          # Pydantic schemas
│   │   └── services/         # Business logic
│   ├── scripts/              # Seed/upload utilities
│   └── requirements.txt
├── frontend/
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # UI and feature components
│   ├── hooks/                # Client hooks
│   ├── lib/                  # API, auth, types, utilities
│   ├── public/               # Static visual assets
│   └── src/                  # Production tokens, primitives, and layout helpers
└── infra/
    └── docker-compose.yml
```

## Prerequisites

- Node.js and npm
- Python 3.11+
- PostgreSQL, or Docker for the included local database setup
- Supabase project and storage bucket for production-style image uploads

## Environment
Create frontend and backend environment files from the examples:

```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Only `NEXT_PUBLIC_*` values are exposed to browser code. Do not place backend secrets in
`frontend/.env.local`.

Backend Supabase image storage:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=car-images
```

Backend admin bootstrap:

```env
ADMIN_EMAIL=admin@luxury.owner
```

The Supabase service role key is used only by the backend and must not be exposed to the frontend.

Backend security-critical values:

```env
SECRET_KEY=replace-with-a-long-random-secret-at-least-32-characters
BACKEND_CORS_ORIGINS=http://localhost:3000
DATABASE_URL=postgresql+psycopg://...
```

## Run Locally

Install and start the frontend:

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

The frontend usually runs at [http://localhost:3000](http://localhost:3000).

Set up and start the backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload
```

The backend runs at [http://localhost:8000](http://localhost:8000).

Health check:

```bash
curl http://localhost:8000/health
```

## Database Workflow

Run migrations and seed data from `backend/`:

```bash
source .venv/bin/activate
alembic upgrade head
python -m scripts.seed
```

The database stores users, dealers, cars, car images, and inquiries. Vehicle image metadata is stored in PostgreSQL while uploaded image files live in Supabase Storage.

## Roles

- `admin`: can view and manage all cars and all inquiries.
- `dealer`: can manage only their own cars and inquiries tied to those cars.
- Public visitors can browse the marketplace and submit inquiries without an account.

In the current MVP, dealer ownership is linked by matching the signed-in user's email to `dealers.contact_email`.

The application currently exposes login only. Admin and dealer users are expected to be provisioned directly in the database or through a future admin flow.

## Main Routes

Frontend routes:

- `/`
- `/cars`
- `/cars/[id]`
- `/login`
- `/dashboard`
- `/dashboard/cars`
- `/dashboard/cars/new`
- `/dashboard/cars/[id]/edit`
- `/dashboard/inquiries`

API routes:

- `GET /health`
- `POST /auth/login`
- `GET /cars`
- `GET /cars/{id}`
- `GET /cars/mine`
- `POST /cars`
- `PUT /cars/{id}`
- `DELETE /cars/{id}`
- `POST /cars/{id}/images`
- `DELETE /cars/{id}/images/{image_id}`
- `PATCH /cars/{id}/images/{image_id}/featured`
- `GET /dealers` (admin)
- `POST /inquiries`
- `GET /inquiries`
- `PATCH /inquiries/{id}`
- `PATCH /inquiries/{id}/status`
- `DELETE /inquiries/{id}`
- `PATCH /inquiries/bulk-status`
- `DELETE /inquiries/bulk`

## Dashboard Image Uploads

The dashboard listing editor supports drag-and-drop or click-to-browse image uploads.

- Create flow: create the car first, then upload images to `/cars/{car_id}/images`.
- Edit flow: upload directly into an existing car.
- Uploaded images can be removed.
- One image can be marked as featured.
- The featured image updates `cars.main_image_url`.

## Verification

Frontend checks:

```bash
cd frontend
npm run format:check
npm run lint
npm run typecheck
npm run build
npm run verify
```

Backend checks:

```bash
cd backend
python -m compileall app
alembic current
alembic upgrade head
pytest
```

Root Makefile shortcuts:

```bash
make dev-frontend
make dev-backend
make frontend-check
make backend-check
make verify
```

`pytest` currently reports no collected tests unless test files are added.

## Design System

The frontend keeps production design foundations in:

- `frontend/src/theme/tokens.ts`
- `frontend/app/globals.css`
- `frontend/tailwind.config.ts`
- `frontend/src/components/ui`
- `frontend/src/components/layout`

The active visual direction remains the same dark collector green, black, ivory,
warm muted text, and champagne accent palette. Prefer semantic variables and
tokens for new code instead of introducing new hex values.

## Troubleshooting

- If Alembic fails under Python 3.14, use Python 3.12 for the backend environment.
- If image uploads fail, confirm `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and
  `SUPABASE_STORAGE_BUCKET` are present in `backend/.env`.
- If the frontend cannot reach the API, confirm `NEXT_PUBLIC_API_URL` points to the
  FastAPI origin and that `BACKEND_CORS_ORIGINS` includes the frontend origin.
