# Skill: Observability Check

Use this skill to verify that all observability signals are correctly wired after adding or modifying a scenario.

## When to use
- After adding a new scenario type
- After modifying an existing scenario handler
- Before submitting a PR that touches `scenario.service.ts`
- When a scenario runs but signals are missing

## Checklist

### 1. Prometheus metrics
```bash
# Check that the metric exists and has been incremented
curl -s http://localhost:3001/metrics | grep signallab_scenario_runs_total

# Expected output (after running a scenario):
# signallab_scenario_runs_total{scenario_type="system_error",status="error"} 1
```

Verify:
- [ ] `signallab_scenario_runs_total` counter incremented
- [ ] `signallab_scenario_duration_ms` histogram has observations
- [ ] Scenario-specific metric exists (e.g., `signallab_memory_bytes` for memory_leak)

### 2. Loki logs
Open Grafana → Explore → Loki datasource

Query: `{app="signallab-api"}`

Verify:
- [ ] Log entry exists with `scenario_id` field
- [ ] Log entry has `scenario_type` field matching the run
- [ ] Log level is correct (error for system_error/http_errors, warn for memory_leak, info for others)

### 3. Sentry (system_error only)
- [ ] Open Sentry dashboard
- [ ] Find event with message "Simulated system error — Signal Lab"
- [ ] Event has tag `scenario_id` matching the run ID
- [ ] Event has tag `scenario_type: system_error`

### 4. Database
```bash
# Check the run was persisted
curl http://localhost:3001/api/scenarios | jq '.items[0]'

# Verify:
# - status is SUCCESS or FAILED (not stuck at RUNNING)
# - durationMs is populated
# - errorMsg is set for FAILED runs
```

### 5. Grafana dashboard
- Open http://localhost:3002/d/signal-lab-overview
- [ ] "Scenario Runs" panel shows data
- [ ] "Error Count" panel shows non-zero for system_error
- [ ] "Application Logs" panel shows recent entries

## Common issues

### Metric not appearing
- Check `metrics.module.ts` — is the provider registered?
- Check `metrics.service.ts` — is the metric injected and method added?
- Check `scenario.service.ts` — is `this.metrics.recordRun()` called?

### Logs not in Loki
- Check `LOKI_URL` env var is set to `http://loki:3100`
- Check `winston-loki` transport is initialized in `winston.logger.ts`
- Check container logs: `docker compose logs api | grep loki`

### Sentry not receiving
- Check `SENTRY_DSN` env var is set
- Verify `Sentry.init()` is called in `main.ts`
- Check `Sentry.captureException()` is called in `runSystemError()`

### Run stuck at RUNNING
- Check `executeScenario()` — is the try/catch updating status to FAILED?
- Check for unhandled promise rejections in API logs
