# Marketplace Skills

This document describes the 6 marketplace skills connected to Signal Lab and explains how to use each one.

---

## 1. codebase-retrieval

**What it does:** Semantic search across the entire Signal Lab repository. Finds relevant files, functions, and patterns without manually browsing the tree.

**Why it's useful:** When you need to understand how a feature is implemented or find where a specific pattern is used (e.g., "where are all Prometheus metrics registered?").

**How to use:**
```
Search the codebase for: "how are Prometheus metrics registered in NestJS"
```
The skill will return relevant file snippets from `metrics.module.ts`, `metrics.service.ts`, and usage sites.

**Best for:** Onboarding, debugging, finding patterns before adding new code.

---

## 2. test-generator

**What it does:** Generates Jest unit tests for NestJS services and controllers, and Vitest tests for React components.

**Why it's useful:** Signal Lab has no tests yet — this skill bootstraps test coverage for any module without writing boilerplate.

**How to use:**
```
Generate tests for: apps/api/src/scenario/scenario.service.ts
Focus on: create(), findAll(), and the system_error scenario handler
Mock: PrismaService, MetricsService
```

**Output:** A `scenario.service.spec.ts` file with mocked dependencies and test cases for happy path + error scenarios.

**Best for:** Adding test coverage to existing services, TDD for new features.

---

## 3. prisma-migration

**What it does:** Generates Prisma schema changes and creates migration SQL files. Understands the Signal Lab schema conventions.

**Why it's useful:** Prisma migrations require specific syntax and the migration SQL must match the schema exactly. This skill handles the boilerplate.

**How to use:**
```
Add a new field to ScenarioRun: tags String[] @default([])
Generate the migration SQL and update the schema.
```

**Output:** Updated `prisma/schema.prisma` + new migration file in `prisma/migrations/`.

**Best for:** Schema evolution, adding indexes, new models.

---

## 4. docker-debug

**What it does:** Inspects Docker container logs, health check status, and network connectivity between Signal Lab services.

**Why it's useful:** When `docker compose up` fails or a service is unhealthy, this skill diagnoses the issue systematically.

**How to use:**
```
The API container is unhealthy. Debug it.
```

The skill will:
1. Check `docker compose ps` for status
2. Read `docker compose logs api --tail=50`
3. Verify DB connectivity
4. Check environment variables
5. Suggest fixes

**Best for:** Debugging startup failures, network issues, migration errors.

---

## 5. api-contract-check

**What it does:** Validates that the NestJS controller request/response shapes match what the Next.js frontend expects.

**Why it's useful:** Type drift between API and frontend is a common source of bugs. This skill catches mismatches before they reach production.

**How to use:**
```
Check that the ScenarioRun response from GET /api/scenarios matches
the ScenarioRun interface in apps/web/src/lib/api.ts
```

The skill compares:
- DTO output fields vs TypeScript interface fields
- Optional vs required fields
- Enum values on both sides

**Best for:** Pre-PR validation, after adding new fields to the API.

---

## 6. grafana-dashboard-builder

**What it does:** Generates Grafana dashboard JSON panels from Prometheus metric names and PromQL expressions.

**Why it's useful:** Writing Grafana JSON by hand is tedious and error-prone. This skill generates valid panel JSON that can be dropped into `signal-lab-overview.json`.

**How to use:**
```
Add a panel to the Signal Lab dashboard for:
- Metric: signallab_disk_io_total
- Type: timeseries
- Title: "Disk I/O Operations"
- Query: rate(signallab_disk_io_total[5m])
- Legend: {{scenario_type}}
```

**Output:** A complete Grafana panel JSON object ready to paste into `infra/grafana/dashboards/signal-lab-overview.json`.

**Best for:** Adding new panels after adding new metrics, dashboard iteration.
