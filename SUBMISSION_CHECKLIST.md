# Submission Checklist

Fill this out before submitting. Check each item you've completed.

## Application

- [ ] `docker compose up -d` starts all services with no manual steps
- [ ] All containers reach healthy status within 60 seconds
- [ ] UI loads at http://localhost:3000
- [ ] `POST /api/scenarios` with `{"type":"system_error"}` returns 200
- [ ] `GET /api/scenarios` returns a list of runs
- [ ] Run history auto-refreshes every 5 seconds

## Observability

- [ ] `curl http://localhost:3001/metrics | grep signallab_` shows metrics
- [ ] After running `system_error`, Sentry shows a new error event
- [ ] Grafana dashboard at http://localhost:3002/d/signal-lab-overview loads with data
- [ ] Loki log stream shows entries with `scenario_id` and `scenario_type` fields
- [ ] Prometheus scrape target for `signallab-api` is UP

## Cursor AI Layer

- [ ] `.cursor/rules/` contains 5 rule files
- [ ] `.cursor/skills/` contains 4 skill files (add-scenario, add-metric, observability-check, orchestrator)
- [ ] `.cursor/skills/marketplace-skills.md` documents 6 marketplace skills
- [ ] `.cursor/commands/` contains 3 command files
- [ ] `.cursor/hooks/` contains 2 hook files
- [ ] Opening a new Cursor chat and referencing a skill works without manual explanation

## Orchestrator

- [ ] `.cursor/skills/orchestrator.md` exists
- [ ] Running orchestrator in a new chat produces a task list
- [ ] Each task in the list is atomic (1-3 files max)
- [ ] Context budget is specified per task

## Documentation

- [ ] README has start/check/stop instructions
- [ ] README describes the AI layer
- [ ] README has demonstration instructions ("click here, look there")
- [ ] RUBRIC.md is present
- [ ] SUBMISSION_CHECKLIST.md is filled out (this file)

## Notes

_Add any notes about trade-offs, known issues, or things you'd do differently:_

```
[Your notes here]
```

## Time spent

```
Total: ~X hours
- Infrastructure setup: X hours
- NestJS API: X hours
- Next.js frontend: X hours
- Cursor AI layer: X hours
- Documentation: X hours
```
