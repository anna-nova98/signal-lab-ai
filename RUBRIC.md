# Signal Lab — Grading Rubric

## Total: 100 points

---

## 1. Application Works (30 points)

| Criterion | Points | Notes |
|-----------|--------|-------|
| `docker compose up -d` starts all services without errors | 10 | All 6 containers healthy |
| UI loads at http://localhost:3000 without console errors | 5 | Next.js renders correctly |
| `POST /api/scenarios` creates a run and returns 200 | 5 | Persisted in PostgreSQL |
| `GET /api/scenarios` returns paginated list | 5 | TanStack Query polling works |
| Run history updates automatically (polling) | 5 | No manual refresh needed |

---

## 2. Observability (30 points)

| Criterion | Points | Notes |
|-----------|--------|-------|
| Prometheus metrics appear at `/metrics` after a run | 8 | `signallab_` prefix, correct labels |
| Loki receives structured logs with `scenario_id` + `scenario_type` | 7 | JSON format, correct fields |
| Sentry captures exception for `system_error` scenario | 7 | With scenario tags |
| Grafana dashboard loads with live data | 5 | All 5 panels show data |
| Grafana datasources provisioned automatically | 3 | No manual setup needed |

---

## 3. Cursor AI Layer (25 points)

| Criterion | Points | Notes |
|-----------|--------|-------|
| 5 rules files present and well-written | 5 | Stack constraints, conventions, guardrails |
| 4 skills files present (including orchestrator) | 5 | Actionable, scoped, useful |
| 3 commands present and executable | 4 | new-scenario, run-stack, check-obs |
| 2 hooks present with real benefit | 4 | Pre-write lint, post-edit verify |
| 6 marketplace skills documented | 4 | Each explained with usage example |
| New chat can use skills without manual explanation | 3 | Self-contained skill files |

---

## 4. Orchestrator (10 points)

| Criterion | Points | Notes |
|-----------|--------|-------|
| Orchestrator skill file exists and is well-structured | 3 | Clear phases: plan, execute, assemble |
| Task decomposition is atomic (single concern per task) | 3 | No tasks with 4+ files |
| Context economy rules are explicit | 2 | Budget per task, summary passing |
| Running orchestrator in new chat produces valid task list | 2 | No manual explanation needed |

---

## 5. Code Quality (5 points)

| Criterion | Points | Notes |
|-----------|--------|-------|
| TypeScript types used correctly | 2 | No `any` in critical paths |
| Consistent code style | 1 | Follows conventions in rules |
| No hardcoded secrets | 1 | Env vars for DSN, DB URL |
| Git history is clean and conventional | 1 | Conventional Commits format |

---

## Penalties

| Violation | Penalty |
|-----------|---------|
| Replaced a mandatory stack element without justification | -10 per element |
| `docker compose up -d` requires manual steps | -15 |
| Grafana dashboard requires manual import | -5 |
| Sentry not integrated (no DSN attempt) | -5 |
| Skills are generic (not Signal Lab specific) | -5 |
