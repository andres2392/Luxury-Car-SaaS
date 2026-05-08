# Luxury-Car-SaaS

Premium luxury car dealer SaaS platform built as a monorepo with:

- `frontend`: Next.js 15 App Router + TypeScript + Tailwind CSS + shadcn/ui-style setup
- `backend`: FastAPI + SQLAlchemy + Alembic + PostgreSQL
- `infra`: Docker Compose for local PostgreSQL and backend

This repository currently includes:

- project setup and monorepo structure
- PostgreSQL schema, models, and Alembic migrations
- FastAPI auth, marketplace API routes, and role-based dashboard permissions
- Next.js marketplace pages plus an admin/dealer dashboard MVP
- customer account pages with saved cars and personal inquiry history
- dashboard image uploads through the backend into Supabase Storage
- shared frontend API/auth helpers and UI polish

## Project Structure

```text
Luxury-Car-SaaS/
├── .gitignore
├── README.md
├── backend
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   ├── alembic.ini
│   ├── alembic
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions
│   │       └── 20260420_0001_initial_schema.py
│   ├── app
│   │   ├── __init__.py
│   │   ├── api
│   │   │   ├── __init__.py
│   │   │   ├── deps.py
│   │   │   └── routes
│   │   │       ├── __init__.py
│   │   │       ├── auth.py
│   │   │       ├── cars.py
│   │   │       ├── dealers.py
│   │   │       ├── health.py
│   │   │       └── inquiries.py
│   │   ├── core
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── db
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── base_class.py
│   │   │   ├── init_db.py
│   │   │   └── session.py
│   │   ├── main.py
│   │   ├── models
│   │   │   ├── __init__.py
│   │   │   ├── car.py
│   │   │   ├── car_image.py
│   │   │   ├── dealer.py
│   │   │   ├── inquiry.py
│   │   │   └── user.py
│   │   ├── schemas
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── car.py
│   │   │   ├── common.py
│   │   │   ├── dealer.py
│   │   │   ├── health.py
│   │   │   ├── inquiry.py
│   │   │   └── user.py
│   │   └── services
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       ├── cars.py
│   │       ├── dealers.py
│   │       └── inquiries.py
│   ├── requirements.txt
│   └── scripts
│       └── seed.py
├── frontend
│   ├── .gitignore
│   ├── components.json
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   ├── app
│   │   ├── cars
│   │   │   ├── [id]
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── dashboard
│   │   │   ├── cars
│   │   │   │   ├── [id]
│   │   │   │   │   └── edit
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── new
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── inquiries
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── login
│   │   │   └── page.tsx
│   │   ├── signup
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   └── textarea.tsx
│   │   ├── dashboard-car-form.tsx
│   │   ├── dashboard-cars-content.tsx
│   │   ├── dashboard-inquiries-content.tsx
│   │   ├── dashboard-overview-content.tsx
│   │   ├── dashboard-shell.tsx
│   │   ├── dashboard-summary-card.tsx
│   │   ├── empty-state.tsx
│   │   ├── loading-state.tsx
│   │   ├── protected-content.tsx
│   │   ├── section-heading.tsx
│   │   └── site-header.tsx
│   └── lib
│       ├── api
│       │   ├── auth.ts
│       │   ├── cars.ts
│       │   ├── client.ts
│       │   ├── dealers.ts
│       │   ├── index.ts
│       │   └── inquiries.ts
│       ├── auth.ts
│       ├── types.ts
│       └── utils.ts
└── infra
    └── docker-compose.yml
```

## Commands To Run The Project

### 1. Frontend

```bash
cd frontend
npm install --legacy-peer-deps
cp .env.example .env.local
npm run dev
```

Frontend reads the backend from:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Frontend usually runs at [http://localhost:3000](http://localhost:3000), but Next.js may pick another open port during local development.

### 2. Backend locally with a Python virtual environment

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload
```

Backend runs at [http://localhost:8000](http://localhost:8000).

Health check:

```bash
curl http://localhost:8000/health
```

### 3. PostgreSQL + backend with Docker Compose

If Docker is installed:

```bash
cd infra
docker compose up --build
```

This starts:

- PostgreSQL on `localhost:5432`
- FastAPI backend on `localhost:8000`

### 4. Optional migration and seed workflow

```bash
cd backend
source .venv/bin/activate
alembic upgrade head
python -m scripts.seed
```

### 5. Supabase Storage for car uploads

The dashboard create/edit listing flow now uploads vehicle images through the FastAPI backend into Supabase Storage.

Set these values in `backend/.env` before testing image uploads:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=car-images
```

Important:

- uploads happen from the backend, not the browser
- PostgreSQL stores only image URLs and metadata
- the Supabase service role key must never be exposed to the frontend

## How Frontend And Backend Connect

The frontend talks to FastAPI through `NEXT_PUBLIC_API_URL`, which defaults to `http://localhost:8000`. You can override it in [frontend/.env.example](/Users/andresg/Codex%20Prj/Luxury-Car-SaaS/frontend/.env.example) by creating `frontend/.env.local`.

The frontend uses a centralized API client under `frontend/lib/api/` so JSON handling, auth token attachment, and common error parsing stay in one place. Auth data is stored in localStorage and reused after refresh for protected flows like dashboard access and car creation.

The backend lives in `backend/` and uses FastAPI for HTTP, SQLAlchemy for data access, and Alembic for migrations. JWT authentication protects sensitive endpoints, while service functions keep business logic out of route handlers.

PostgreSQL is the system of record. The existing migrations create `users`, `dealers`, `cars`, `car_images`, `inquiries`, and `favorites`, and the seed script loads a larger luxury inventory catalog so the frontend has meaningful data to display.

## Dashboard Access

The dashboard is available only to `admin` and `dealer` users.

- `admin` can view all cars and all inquiries, and can create, edit, or delete inventory across dealerships.
- `dealer` can view and manage only their own cars and the inquiries tied to those cars.
- `customer` users can browse the marketplace but will see an access-restricted message on dashboard pages.

In the current MVP, dealer ownership is linked by matching the signed-in user's email to `dealers.contact_email`. This keeps the model simple without adding another ownership table yet.

## Role Notes And Testing

New signups are always created as `customer`, except for the reserved admin email configured in [backend/.env.example](/Users/andresg/Codex%20Prj/Luxury-Car-SaaS/backend/.env.example):

- `ADMIN_EMAIL=admin@luxury.owner`

That email becomes the application admin when it signs up. Dealers are expected to be provisioned later through the admin flow.

Current seed behavior:

- all seeded cars are normalized to one dealer: `Aurelius Motor Gallery`
- the catalog includes the original seed inventory plus 25 additional luxury cars
- the seed reuses the existing image URLs already in the project

Suggested Phase 6 flow:

1. Sign up or log in as `admin@luxury.owner`
2. Open `/dashboard`
3. Visit `/dashboard/cars` to review inventory
4. Create a car from `/dashboard/cars/new`
5. Edit or delete an existing car from `/dashboard/cars`
6. Visit `/dashboard/inquiries` to review incoming leads

### Dashboard image upload flow

The dashboard listing editor supports drag-and-drop or click-to-browse uploads.

- create flow: create the car first, then upload images to `/cars/{car_id}/images`
- edit flow: upload directly into the existing car
- uploaded images can be removed
- one uploaded image can be marked as featured
- the featured image updates `cars.main_image_url`

## Customer Account Features

Authenticated users can save cars and revisit them later from the account area.

- `POST /favorites/{car_id}` saves a car for the current user
- `DELETE /favorites/{car_id}` removes a saved car
- `GET /favorites` returns the current user's saved cars
- `GET /inquiries/mine` returns inquiries submitted while logged in

Account pages:

- `/account`
- `/account/favorites`
- `/account/inquiries`

Suggested Phase 7 flow:

1. Sign up or log in as a customer account
2. Browse `/cars` and click `Save` on one or more listings
3. Open `/account/favorites` to confirm the saved cars appear
4. Open a car detail page and submit an inquiry while signed in
5. Visit `/account/inquiries` to confirm the inquiry appears in your history

## Useful API Endpoints

Cars:

- `GET /cars`
- `GET /cars/{id}`
- `GET /cars/mine`
- `POST /cars`
- `PUT /cars/{id}`
- `DELETE /cars/{id}`
- `POST /cars/{id}/images`
- `DELETE /cars/{id}/images/{image_id}`
- `PATCH /cars/{id}/images/{image_id}/featured`

Favorites:

- `GET /favorites`
- `POST /favorites/{car_id}`
- `DELETE /favorites/{car_id}`

Inquiries:

- `POST /inquiries`
- `GET /inquiries`
- `GET /inquiries/mine`
