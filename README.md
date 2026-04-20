# Luxury-Car-SaaS

Premium luxury car dealer SaaS foundation built as a monorepo with:

- `frontend`: Next.js 15 App Router + TypeScript + Tailwind CSS + shadcn/ui-style setup
- `backend`: FastAPI + SQLAlchemy + Alembic + PostgreSQL
- `infra`: Docker Compose for local PostgreSQL and backend

This repository intentionally includes only Phase 1 and Phase 2:

- project setup
- database foundation
- initial schema and migration
- sample seed data

It does **not** include auth, dashboards, or full feature pages yet.

## Final Folder Structure

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
npm install
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

## How Everything Connects

The frontend is a standalone Next.js app inside `frontend/`, ready for future pages and API integration. For now it provides a polished starter landing page so the UI foundation is confirmed working.

The backend lives in `backend/` and uses FastAPI for HTTP, SQLAlchemy for models and relationships, and Alembic for schema migrations. Configuration is loaded from environment variables via `pydantic-settings`, and the database session is shared through dependency injection.

PostgreSQL is the system of record. The initial migration creates `users`, `dealers`, `cars`, `car_images`, and `inquiries` with indexes and foreign keys. The seed script inserts a small realistic luxury inventory so the database foundation is usable immediately for future phases.
