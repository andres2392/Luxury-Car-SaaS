# Luxury-Car-SaaS

Premium luxury car dealer SaaS platform built as a monorepo with:

- `frontend`: Next.js 15 App Router + TypeScript + Tailwind CSS + shadcn/ui-style setup
- `backend`: FastAPI + SQLAlchemy + Alembic + PostgreSQL
- `infra`: Docker Compose for local PostgreSQL and backend

This repository currently includes:

- project setup and monorepo structure
- PostgreSQL schema, models, and Alembic migrations
- FastAPI auth and marketplace API routes
- Next.js marketplace pages and protected admin entry points
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
│   │   │       └── health.py
│   │   ├── core
│   │   │   ├── __init__.py
│   │   │   └── config.py
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
│   │   └── schemas
│   │       ├── __init__.py
│   │       └── health.py
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
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   └── ui
│   │       └── button.tsx
│   └── lib
│       └── utils.ts
└── infra
    └── docker-compose.yml
```

## Commands To Run The Project

### 1. Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Create frontend env if needed:

```bash
cp .env.example .env.local
npm run dev
```

Frontend runs at [http://localhost:3000](http://localhost:3000).

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

## How Frontend And Backend Connect

The frontend talks to FastAPI through `NEXT_PUBLIC_API_BASE_URL`, which defaults to `http://localhost:8000`. You can override it in [frontend/.env.example](/Users/andresg/Codex%20Prj/Luxury-Car-SaaS/frontend/.env.example) by creating `frontend/.env.local`.

The frontend uses a centralized API client under `frontend/lib/api/` so JSON handling, auth token attachment, and common error parsing stay in one place. Auth data is stored in localStorage and reused after refresh for protected flows like dashboard access and car creation.

The backend lives in `backend/` and uses FastAPI for HTTP, SQLAlchemy for data access, and Alembic for migrations. JWT authentication protects sensitive endpoints, while service functions keep business logic out of route handlers.

PostgreSQL is the system of record. The existing migration creates `users`, `dealers`, `cars`, `car_images`, and `inquiries`, and the seed script loads a starter luxury inventory so the frontend has meaningful data to display.
