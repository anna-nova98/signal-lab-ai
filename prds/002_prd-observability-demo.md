# PRD 002 — Observability Demo

## Overview
Signal Lab must generate real observability signals: Prometheus metrics, structured logs shipped to Loki, and Sentry error captures. Each scenario type produces a distinct, verifiable signal.

## Scenario Types & Signals

| Scenario | Prometheus | Loki | Sentry |
|----------|-----------|------|--------|
| `cpu_spike` | `scenario_cpu_spike_total` counter++ | log `level=info` | — |
| `memory_leak` | `scenario_memory_bytes` gauge set | log `level=warn` | — |
| `http_errors` | `scenario_http_errors_total` counter++ | log `level=error` | — |
| `system_error` | `scenario_runs_total{status="error"}` | log `level=error` | ✅ Sentry.captureException |
| `latency_spike` | `scenario_latency_ms` histogram observe | log `level=info` | — |
| `custom` | `scenario_custom_total` counter++ | log `level=info` | — |

## Prometheus
- Endpoint: `GET /metrics` on port 3001
- Library: `@willsoto/nestjs-prometheus` + `prom-client`
- Metrics prefix: `signallab_`
- Labels: `scenario_type`, `status`

## Loki
- NestJS uses `winston` + `winston-loki` transport
- Log format: JSON with fields `{ level, message, scenario_id, scenario_type, timestamp }`
- Loki push URL: `http://loki:3100/loki/api/v1/push`

## Sentry
- DSN injected via `SENTRY_DSN` env var
- `system_error` scenario calls `Sentry.captureException(new Error("Simulated system error"))`
- Breadcrumbs include scenario_id and type

## Grafana
- Datasources provisioned automatically: Prometheus + Loki
- Dashboard: `Signal Lab Overview`
  - Panel 1: Scenario runs by type (Prometheus counter)
  - Panel 2: Error rate (Prometheus)
  - Panel 3: Latency histogram (Prometheus)
  - Panel 4: Log stream (Loki)

## Acceptance Criteria
- [ ] After running `system_error`, Sentry shows a new error event
- [ ] `GET http://localhost:3001/metrics` shows `signallab_` metrics
- [ ] Grafana dashboard loads with live data
- [ ] Loki log stream shows scenario logs
