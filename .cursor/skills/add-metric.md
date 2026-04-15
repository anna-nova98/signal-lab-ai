# Skill: Add a Prometheus Metric

Use this skill when you need to register and use a new Prometheus metric in the NestJS API.

## Metric types reference

| Type | Use case | NestJS provider |
|------|----------|----------------|
| Counter | Things that only go up (requests, errors) | `makeCounterProvider` |
| Gauge | Values that go up and down (memory, connections) | `makeGaugeProvider` |
| Histogram | Distributions (latency, sizes) | `makeHistogramProvider` |
| Summary | Similar to histogram, client-side quantiles | `makeSummaryProvider` |

## Step 1: Register in MetricsModule

File: `apps/api/src/metrics/metrics.module.ts`

```typescript
import { makeCounterProvider, makeHistogramProvider, makeGaugeProvider } from '@willsoto/nestjs-prometheus';

// Counter example
makeCounterProvider({
  name: 'signallab_<noun>_total',       // always end counters with _total
  help: 'Human-readable description',
  labelNames: ['label1', 'label2'],
}),

// Histogram example
makeHistogramProvider({
  name: 'signallab_<noun>_<unit>',      // e.g. signallab_request_duration_ms
  help: 'Human-readable description',
  labelNames: ['label1'],
  buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
}),

// Gauge example
makeGaugeProvider({
  name: 'signallab_<noun>_<unit>',      // e.g. signallab_memory_bytes
  help: 'Human-readable description',
  labelNames: ['label1'],
}),
```

Also add to `exports: [MetricsService]` — the module already exports the service.

## Step 2: Inject and use in MetricsService

File: `apps/api/src/metrics/metrics.service.ts`

```typescript
constructor(
  // ... existing injections
  @InjectMetric('signallab_your_metric_name')
  private readonly yourMetric: Counter<string>,  // or Histogram, Gauge
) {}

// Add a method
recordYourEvent(label: string) {
  this.yourMetric.inc({ label1: label });
}
```

## Step 3: Call from ScenarioService

```typescript
// In the relevant scenario handler
this.metrics.recordYourEvent('some_label_value');
```

## Step 4: Verify

```bash
curl http://localhost:3001/metrics | grep signallab_your_metric
```

## Step 5: Add to Grafana dashboard

In `infra/grafana/dashboards/signal-lab-overview.json`, add a panel:
```json
{
  "targets": [{
    "expr": "rate(signallab_your_metric_total[5m])",
    "legendFormat": "{{label1}}"
  }],
  "title": "Your Metric Title",
  "type": "timeseries"
}
```

## Naming conventions
- Prefix: always `signallab_`
- Counters: `signallab_<noun>_total`
- Histograms: `signallab_<noun>_<unit>` (e.g., `_ms`, `_bytes`, `_seconds`)
- Gauges: `signallab_<noun>_<unit>`
- Labels: snake_case, descriptive (e.g., `scenario_type`, `status_code`)
