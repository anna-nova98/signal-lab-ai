# PRD 001 — Platform Foundation

## Overview
Signal Lab is an observability playground. This PRD covers the core platform: monorepo structure, Next.js frontend, NestJS backend, PostgreSQL via Prisma, and Docker Compose orchestration.

## Goals
- Single `docker compose up -d` starts the entire stack
- Frontend reachable at http://localhost:3000
- Backend API reachable at http://localhost:3001
- Database migrations run automatically on startup

## Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), shadcn/ui, Tailwind CSS, TanStack Query, React Hook Form |
| Backend | NestJS 10, class-validator, class-transformer |
| Database | PostgreSQL 15, Prisma ORM |
| Infra | Docker Compose v2 |

## Data Model

### Scenario
```prisma
model Scenario {
  id          String   @id @default(cuid())
  name        String
  type        ScenarioType
  status      RunStatus @default(PENDING)
  durationMs  Int?
  errorMsg    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum ScenarioType {
  cpu_spike
  memory_leak
  http_errors
  system_error
  latency_spike
  custom
}

enum RunStatus {
  PENDING
  RUNNING
  SUCCESS
  FAILED
}
```

## API Contracts

### POST /api/scenarios
Request:
```json
{ "type": "system_error", "name": "My run" }
```
Response:
```json
{ "id": "...", "type": "system_error", "status": "RUNNING", "createdAt": "..." }
```

### GET /api/scenarios
Returns paginated list of scenario runs, newest first.

### GET /api/scenarios/:id
Returns single run with full details.

## Acceptance Criteria
- [ ] `docker compose up -d` succeeds with no manual steps
- [ ] `GET /api/scenarios` returns 200
- [ ] Prisma migrations applied on container start
- [ ] Frontend renders without console errors
