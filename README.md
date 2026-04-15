# Signal Lab

An observability playground that lets you trigger scenarios and watch the signals appear in Grafana, Loki, and Sentry in real time.

## Quick Start

```bash
git clone <repo-url>
cd signal-lab

# (Optional) Set your Sentry DSN
cp .env.example .env
# Edit .env and set SENTRY_DSN=https://...@sentry.io/...

# Start everything
docker compose up -d

# Wait ~30 seconds for all services to be healthy
# Then open the UI
open http://localhost:3000
```

## Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Signal Lab UI | http://localhost:3000 | — |
| NestJS API | http://localhost:3001 | — |
| API Metrics | http://localhost:3001/metrics | — |
| API Health | http://localhost:3001/health | — |
| Grafana | http://localhost:3002 | admin / admin |
| Prometheus | http://localhost:9090 | — |
| Loki | http://localhost:3100 | — |

## Demonstration

### 1. Trigger a system_error scenario
1. Open http://localhost:3000
2. Select **System Error** from the dropdown
3. Click **Run Scenario**
4. Watch the run appear in the history with status FAILED

### 2. Verify Prometheus metric
```bash
curl http://localhost:3001/metrics | grep signallab_scenario_runs_total
# Expected: signallab_scenario_runs_total{scenario_type="system_error",status="error"} 1
```

### 3. Verify Loki logs
1. Open http://localhost:3002/explore
2. Select **Loki** datasource
3. Query: `{app="signallab-api"} | json`
4. Look for entries with `scenario_type: system_error`

### 4. Verify Grafana dashboard
1. Open http://localhost:3002/d/signal-lab-overview
2. The **Scenario Runs** panel should show a spike
3. The **Error Count** panel should show 1
4. The **Application Logs** panel should show the error log

### 5. Verify Sentry
1. Open your Sentry project
2. Find the event: "Simulated system error — Signal Lab"
3. Check tags: `scenario_type: system_error`

## Stop

```bash
docker compose down

# Remove volumes (full reset)
docker compose down -v
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SENTRY_DSN` | (empty) | Sentry DSN for error tracking. Sentry is disabled if not set. |
| `DATABASE_URL` | set in compose | PostgreSQL connection string |
| `LOKI_URL` | `http://loki:3100` | Loki push endpoint |
| `PORT` | `3001` | API port |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Signal Lab UI                     │
│              (Next.js + shadcn/ui + TW)              │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Run Scenario│  │  Run History │  │  Obs Links │  │
│  │  (RHF form) │  │ (TanStack Q) │  │  Grafana…  │  │
│  └──────┬──────┘  └──────────────┘  └────────────┘  │
└─────────┼───────────────────────────────────────────┘
          │ POST /api/scenarios
          ▼
┌─────────────────────────────────────────────────────┐
│                   NestJS API                         │
│                                                     │
│  scenario.controller → scenario.service              │
│       │          │           │          │             │
│   Prisma/PG   Prometheus  Sentry    Structured       │
│   (persist)   (metrics)   (errors)  Logs → Loki      │
└─────────────────────────────────────────────────────┘
          │                    │
          ▼                    ▼
┌──────────────┐    ┌─────────────────────┐
│  PostgreSQL  │    │      Grafana        │
│   (Prisma)   │    │  dashboards:        │
└──────────────┘    │  metrics + logs     │
                    └─────────────────────┘
```

## Scenario Types

| Scenario | Signal | Sentry |
|----------|--------|--------|
| `cpu_spike` | Prometheus counter + info log | — |
| `memory_leak` | Prometheus gauge + warn log | — |
| `http_errors` | Prometheus counter per status code + error log | — |
| `system_error` | Prometheus counter + error log | ✅ |
| `latency_spike` | Prometheus histogram + info log | — |
| `custom` | Prometheus counter + info log | — |

## AI Layer (Cursor)

The `.cursor/` directory contains a full AI layer for working with this codebase in Cursor:

```
.cursor/
├── rules/          # Stack constraints, conventions, guardrails
├── skills/         # Step-by-step guides for common tasks
├── commands/       # Workflow commands
└── hooks/          # Automated checks
```

See [AI Layer Documentation](#ai-layer-documentation) below.

## AI Layer Documentation

### Rules
| File | Purpose |
|------|---------|
| `000-stack-constraints.mdc` | Hard rules: never replace the stack, always use shadcn/ui, TanStack Query, RHF |
| `001-nestjs-conventions.mdc` | Thin controllers, service-owned logic, DTO validation patterns |
| `002-nextjs-conventions.mdc` | App Router, Server Components, no useEffect+fetch |
| `003-observability-guardrails.mdc` | Three-signal rule: every scenario emits Prometheus + log + optional Sentry |
| `004-git-conventions.mdc` | Conventional Commits, branch naming |

### Skills
| File | Purpose |
|------|---------|
| `add-scenario.md` | End-to-end guide: add a new scenario type across all layers |
| `add-metric.md` | Register and use a new Prometheus metric |
| `observability-check.md` | Verify all obs signals are wired correctly |
| `orchestrator.md` | Multi-agent PRD executor for complex features |
| `marketplace-skills.md` | 6 marketplace skills: codebase-retrieval, test-generator, prisma-migration, docker-debug, api-contract-check, grafana-dashboard-builder |

### Commands
| File | Usage |
|------|-------|
| `new-scenario.md` | `/new-scenario <name> "<description>"` — scaffold a new scenario |
| `run-stack.md` | `/run-stack [start\|stop\|restart\|status\|logs]` — manage Docker stack |
| `check-obs.md` | `/check-obs [scenario_type]` — verify observability signals |

### Hooks
| File | Trigger | Action |
|------|---------|--------|
| `pre-commit-lint.json` | Before any file write | Checks stack constraints and observability rules |
| `post-scenario-verify.json` | After editing `scenario.service.ts` | Verifies three-signal rule compliance |

### Orchestrator
Open a new Cursor chat and paste:
```
Use skill: .cursor/skills/orchestrator.md

Feature Request: Add a new scenario type called "network_timeout" that simulates
slow network responses and records latency metrics.

Relevant PRD: PRD 002 (observability-demo)
```

The orchestrator will decompose this into atomic tasks with minimal context per task.
