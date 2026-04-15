# PRD 003 — Cursor AI Layer

## Overview
Transform the Signal Lab repository into a Cursor-native environment where any engineer (or AI agent) can work predictably without manual onboarding. The AI layer consists of rules, skills, commands, hooks, and marketplace integrations.

## Directory Layout
```
.cursor/
├── rules/
│   ├── 000-stack-constraints.mdc       # Hard stack rules
│   ├── 001-nestjs-conventions.mdc      # NestJS patterns
│   ├── 002-nextjs-conventions.mdc      # Next.js patterns
│   ├── 003-observability-guardrails.mdc # Obs instrumentation rules
│   └── 004-git-conventions.mdc         # Commit / branch rules
├── skills/
│   ├── add-scenario.md                 # Add a new scenario type end-to-end
│   ├── add-metric.md                   # Add a Prometheus metric
│   ├── observability-check.md          # Verify obs signals are wired
│   └── orchestrator.md                 # Multi-agent PRD executor
├── commands/
│   ├── new-scenario.md                 # Scaffold new scenario
│   ├── run-stack.md                    # Start/stop docker stack
│   └── check-obs.md                    # Verify observability signals
└── hooks/
    ├── pre-commit-lint.json            # Lint before commit
    └── post-scenario-verify.json       # Verify obs after scenario run
```

## Rules Spec

### 000-stack-constraints
- NEVER replace Next.js, NestJS, Prisma, Prometheus, Grafana, Loki, Sentry
- ALWAYS use shadcn/ui components, never raw HTML inputs
- ALWAYS use TanStack Query for server state, never useEffect+fetch
- ALWAYS use React Hook Form for forms

### 001-nestjs-conventions
- Controllers are thin: delegate to services
- Services own business logic and observability calls
- DTOs use class-validator decorators
- Modules follow feature-based structure

### 002-nextjs-conventions
- Use App Router, never Pages Router
- Server Components by default, Client Components only when needed
- API routes only for BFF patterns; prefer direct NestJS calls

### 003-observability-guardrails
- Every new scenario MUST emit: 1 Prometheus metric, 1 structured log, optionally 1 Sentry event
- Metric names follow pattern: `signallab_<scenario>_<unit>`
- Logs MUST include `scenario_id` and `scenario_type` fields

### 004-git-conventions
- Commits: `type(scope): message` (Conventional Commits)
- Branch: `feat/`, `fix/`, `chore/`
- No direct commits to `main`

## Skills Spec

### add-scenario.md
Step-by-step guide to add a new scenario type:
1. Add enum value to Prisma schema
2. Add handler in `scenario.service.ts`
3. Register Prometheus metric
4. Add Loki log call
5. Update frontend scenario selector

### add-metric.md
How to register and use a new Prometheus metric in NestJS.

### observability-check.md
Checklist skill: verifies all obs signals are wired for a given scenario.

### orchestrator.md
Multi-agent PRD executor — see PRD 004.

## Commands Spec

### new-scenario
Scaffolds a complete new scenario: Prisma enum + service handler + metric + log.

### run-stack
`docker compose up -d` with health check polling.

### check-obs
Curls `/metrics`, queries Loki, and reports signal status.

## Hooks Spec

### pre-commit-lint
Runs ESLint + Prettier check before every commit.

### post-scenario-verify
After a scenario run completes, automatically verifies the Prometheus counter incremented.

## Marketplace Skills (minimum 6)
1. `codebase-retrieval` — semantic search across the repo
2. `test-generator` — generate Jest/Vitest tests for a service
3. `prisma-migration` — generate and apply Prisma migrations
4. `docker-debug` — inspect container logs and health
5. `api-contract-check` — validate request/response against OpenAPI spec
6. `grafana-dashboard-builder` — generate Grafana dashboard JSON from metric names

## Acceptance Criteria
- [ ] New chat with Cursor can use skills without manual explanation
- [ ] Rules prevent stack violations
- [ ] Commands execute end-to-end workflows
- [ ] Hooks fire on correct events
- [ ] All 6 marketplace skills documented and connected
