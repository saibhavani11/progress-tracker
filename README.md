# Progress Tracker

A daily task / habit tracker — log what you plan to do each day, check it off,
and watch your streak grow. Built as a full-stack project with a real CI/CD
and deployment story (not just a localhost demo).

## Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Planned next:** Terraform (cloud provisioning), Prometheus + Grafana (monitoring)

## Running locally with Docker (recommended)
```bash
docker-compose up --build
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Postgres: localhost:5432

## Running without Docker
```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend (in a second terminal)
cd frontend
npm install
npm run dev
```
You'll need a local Postgres instance running and the `init.sql` schema applied manually.

## API endpoints
| Method | Route                | Description                          |
|--------|-----------------------|---------------------------------------|
| GET    | /health               | Health check                          |
| GET    | /tasks?date=YYYY-MM-DD| List tasks for a day (default: today) |
| POST   | /tasks                | Create a task `{ title, task_date }`  |
| PATCH  | /tasks/:id/toggle      | Toggle a task's completed state       |
| GET    | /tasks/streak          | Current consecutive-day streak        |

## Roadmap
- [x] Working full-stack MVP (local)
- [x] Dockerized with Docker Compose
- [x] CI pipeline (tests on every push)
- [x] User accounts / auth (JWT-based, multi-user support)
- [x] Calendar heatmap view
- [x] Dark mode + redesigned UI (Tailwind CSS)
- [ ] Deploy to the cloud (Terraform + EC2, or Render)
- [ ] Monitoring with Prometheus + Grafana
- [ ] Friend accountability / shared streaks
- [ ] AI weekly insights

## Architecture
```
Browser → Frontend (React, Nginx container)
              │
              ▼
        Backend API (Express container)
              │
              ▼
        PostgreSQL (container)
```
Every push to `main` runs tests via GitHub Actions and builds the backend
Docker image — see `.github/workflows/ci.yml`.
