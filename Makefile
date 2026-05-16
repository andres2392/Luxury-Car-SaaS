.PHONY: setup dev dev-frontend dev-backend build lint typecheck test format verify backend-check frontend-check migrate seed

setup:
	cd frontend && npm install --legacy-peer-deps
	cd backend && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt

dev:
	@echo "Run frontend and backend in separate terminals with make dev-frontend and make dev-backend."

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && . .venv/bin/activate && uvicorn app.main:app --reload

build:
	cd frontend && npm run build

lint:
	cd frontend && npm run lint

typecheck:
	cd frontend && npm run typecheck

test:
	cd backend && . .venv/bin/activate && pytest

format:
	cd frontend && npm run format

verify: frontend-check backend-check

backend-check:
	cd backend && . .venv/bin/activate && python -m compileall app
	cd backend && . .venv/bin/activate && alembic current
	cd backend && . .venv/bin/activate && alembic upgrade head

frontend-check:
	cd frontend && npm run verify

migrate:
	cd backend && . .venv/bin/activate && alembic upgrade head

seed:
	cd backend && . .venv/bin/activate && python -m scripts.seed
