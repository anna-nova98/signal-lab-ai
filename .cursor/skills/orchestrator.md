# Skill: Orchestrator — Multi-Agent PRD Executor

Use this skill when implementing a feature that spans 3+ files or requires coordinating multiple concerns. The orchestrator decomposes work into atomic tasks, each handled in a focused sub-agent chat with minimal context.

## When to use
- Implementing a new scenario type end-to-end
- Adding a new observability integration
- Refactoring a module that touches API + frontend + infra
- Any feature described in a PRD document

## Phase 1: Planning

Paste this template into a new chat:

```
## Feature Request
<describe what you want to build in 2-3 sentences>

## Relevant PRD
<PRD number, e.g., PRD 002, or paste the relevant section>

## Repo context
- Backend: NestJS in apps/api/src/
- Frontend: Next.js in apps/web/src/
- DB: Prisma schema in prisma/schema.prisma
- Infra: Docker configs in infra/
```

The orchestrator will respond with a task list in this format:

```json
[
  {
    "id": "T1",
    "title": "Update Prisma schema",
    "files": ["prisma/schema.prisma"],
    "skill": "prisma-migration",
    "depends_on": [],
    "context_budget": 1500
  },
  {
    "id": "T2",
    "title": "Add metric registration",
    "files": ["apps/api/src/metrics/metrics.module.ts", "apps/api/src/metrics/metrics.service.ts"],
    "skill": "add-metric",
    "depends_on": ["T1"],
    "context_budget": 2000
  },
  {
    "id": "T3",
    "title": "Implement scenario handler",
    "files": ["apps/api/src/scenario/scenario.service.ts", "apps/api/src/scenario/dto/create-scenario.dto.ts"],
    "skill": "add-scenario",
    "depends_on": ["T1", "T2"],
    "context_budget": 3000
  },
  {
    "id": "T4",
    "title": "Update frontend scenario selector",
    "files": ["apps/web/src/components/ScenarioRunner.tsx", "apps/web/src/lib/api.ts"],
    "skill": null,
    "depends_on": ["T3"],
    "context_budget": 2000
  }
]
```

## Phase 2: Execution

For each task (in dependency order):

1. Open a **NEW chat**
2. First line: `## Task: <task title>`
3. Attach ONLY the files listed in `files`
4. Reference the skill: `Use skill: .cursor/skills/<skill>.md`
5. Include a summary of completed dependent tasks (not raw diffs)

### Task chat template
```
## Task: T2 — Add metric registration
Skill: .cursor/skills/add-metric.md

Context from T1 (completed):
- Added `your_new_scenario` to ScenarioType enum in prisma/schema.prisma
- Migration created: 20240101_add_your_new_scenario

Files to modify:
- apps/api/src/metrics/metrics.module.ts
- apps/api/src/metrics/metrics.service.ts

Goal: Register signallab_your_new_scenario_total counter and expose recordYourScenario() method.
```

## Phase 3: Assembly

After all tasks complete:
1. Apply changes in dependency order
2. Run: `docker compose build api web`
3. Run: `docker compose up -d`
4. Run the observability-check skill to verify all signals

## Context economy rules
- Each sub-agent chat gets ONLY its task's files — no full repo dump
- Pass completed task outputs as SHORT summaries (2-3 bullet points), not raw code
- The orchestrator itself never reads full source files — only PRD + task graph
- If a task exceeds its `context_budget`, split it into two tasks

## Anti-patterns to avoid
- ❌ Loading the entire codebase into one chat
- ❌ Skipping the planning phase and jumping straight to coding
- ❌ Merging tasks that touch different architectural layers
- ❌ Passing raw diffs between tasks (use summaries)
- ❌ Tasks with more than 3 files in scope

## Task sizing guide
| Scope | Max files | Context budget |
|-------|-----------|----------------|
| Schema change | 1 | 1500 tokens |
| Single service method | 1-2 | 2000 tokens |
| Module + service | 2-3 | 3000 tokens |
| Full feature slice | 3-4 | 4000 tokens |
