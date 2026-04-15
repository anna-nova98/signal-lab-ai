# PRD 004 — Orchestrator Skill

## Overview
The orchestrator skill enables a small model (e.g., GPT-4o-mini or Claude Haiku) to execute complex, multi-file features by decomposing them into atomic tasks, delegating each task to a focused sub-agent, and assembling the results — all while minimizing context window usage.

## Problem
Large features require reading many files simultaneously, which exhausts context windows and degrades output quality. A single large model doing everything is expensive and slow.

## Solution: Hierarchical Task Decomposition

```
User Request
     │
     ▼
┌─────────────────┐
│   Orchestrator  │  ← reads PRD, creates task graph
│   (planner)     │
└────────┬────────┘
         │ emits TaskList[]
         ▼
┌─────────────────────────────────────────┐
│              Task Queue                  │
│  [T1: schema] [T2: service] [T3: route] │
└──────┬──────────────┬───────────────────┘
       │              │
       ▼              ▼
┌──────────┐   ┌──────────┐
│ Agent A  │   │ Agent B  │   ← each gets minimal context
│ (schema) │   │(service) │
└──────────┘   └──────────┘
       │              │
       └──────┬───────┘
              ▼
       ┌─────────────┐
       │  Assembler  │  ← merges outputs, runs validation
       └─────────────┘
```

## Orchestrator Protocol

### Input
```markdown
## Feature Request
<description of what to build>

## Relevant PRD
<PRD number or inline content>
```

### Phase 1: Planning
The orchestrator reads the PRD and emits a structured task list:
```json
[
  {
    "id": "T1",
    "title": "Update Prisma schema",
    "files": ["prisma/schema.prisma"],
    "skill": "prisma-migration",
    "depends_on": [],
    "context_budget": 2000
  },
  {
    "id": "T2",
    "title": "Implement service handler",
    "files": ["apps/api/src/scenario/scenario.service.ts"],
    "skill": "add-scenario",
    "depends_on": ["T1"],
    "context_budget": 3000
  }
]
```

### Phase 2: Execution
For each task (respecting `depends_on` order):
1. Load ONLY the files listed in `files` (context budget enforced)
2. Apply the referenced skill
3. Output a diff or new file content
4. Mark task complete

### Phase 3: Assembly
1. Apply all diffs in dependency order
2. Run `docker compose build` to verify no build errors
3. Report completion summary

## Context Economy Rules
- Each sub-agent receives ONLY its `files` list — no full repo dump
- `context_budget` is a soft token limit per task
- Orchestrator itself only reads PRD + task graph, never full source files
- Completed task outputs are summarized (not raw) before passing to dependents

## Skill File: orchestrator.md
```markdown
# Orchestrator Skill

## When to use
Use this skill when implementing a feature that spans 3+ files or requires
coordinating multiple concerns (schema + service + API + frontend).

## How to invoke
1. Paste the feature description
2. Reference the relevant PRD number
3. The orchestrator will emit a task list — review and approve
4. Execute tasks in order, using the referenced skill for each

## Task Template
For each task, open a NEW chat with:
- The task title as the first line
- Only the files listed in `files`
- The skill referenced in `skill`
- The output of any `depends_on` tasks (summarized)

## Anti-patterns
- DO NOT load the entire codebase into one chat
- DO NOT skip the planning phase
- DO NOT merge tasks that touch different layers
```

## Acceptance Criteria
- [ ] Orchestrator skill file exists at `.cursor/skills/orchestrator.md`
- [ ] Running orchestrator in a new chat produces a valid task list
- [ ] Each task is atomic (single file or single concern)
- [ ] Context budget is respected (no task exceeds its budget)
- [ ] Assembler phase produces working code
