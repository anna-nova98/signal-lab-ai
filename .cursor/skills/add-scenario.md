# Skill: Add a New Scenario Type

Use this skill when you need to add a new scenario type end-to-end across the full stack.

## Prerequisites
- Understand the existing scenario types in `prisma/schema.prisma`
- Read `apps/api/src/scenario/scenario.service.ts` to understand the pattern

## Steps

### 1. Update Prisma schema
File: `prisma/schema.prisma`

Add the new value to the `ScenarioType` enum:
```prisma
enum ScenarioType {
  // ... existing values
  your_new_scenario
}
```

### 2. Create migration
```bash
cd apps/api
npx prisma migrate dev --name add_your_new_scenario
```

### 3. Add DTO enum value
File: `apps/api/src/scenario/dto/create-scenario.dto.ts`

```typescript
export enum ScenarioType {
  // ... existing
  your_new_scenario = 'your_new_scenario',
}
```

### 4. Register Prometheus metric
File: `apps/api/src/metrics/metrics.module.ts`

Add a provider:
```typescript
makeCounterProvider({
  name: 'signallab_your_new_scenario_total',
  help: 'Description of what this measures',
  labelNames: ['scenario_type'],
}),
```

### 5. Add metric method
File: `apps/api/src/metrics/metrics.service.ts`

```typescript
@InjectMetric('signallab_your_new_scenario_total')
private readonly yourCounter: Counter<string>,

recordYourScenario(type: string) {
  this.yourCounter.inc({ scenario_type: type });
}
```

### 6. Implement scenario handler
File: `apps/api/src/scenario/scenario.service.ts`

Add a case to the switch:
```typescript
case ScenarioType.your_new_scenario:
  await this.runYourScenario(id);
  break;
```

Add the handler method:
```typescript
private async runYourScenario(id: string) {
  const log = getLogger();
  log.info('Your scenario starting', {
    scenario_id: id,          // REQUIRED
    scenario_type: 'your_new_scenario',  // REQUIRED
  });

  // ... your simulation logic

  log.info('Your scenario complete', { scenario_id: id, scenario_type: 'your_new_scenario' });
}
```

### 7. Update frontend
File: `apps/web/src/components/ScenarioRunner.tsx`

Add to `SCENARIO_OPTIONS`:
```typescript
{ value: 'your_new_scenario', label: 'Your Scenario', description: 'What it does' },
```

Also update the Zod schema:
```typescript
const schema = z.object({
  type: z.enum([..., 'your_new_scenario']),
  // ...
});
```

### 8. Update Grafana dashboard (optional)
File: `infra/grafana/dashboards/signal-lab-overview.json`

Add a panel targeting `signallab_your_new_scenario_total`.

## Verification checklist
- [ ] `docker compose build api` succeeds
- [ ] `POST /api/scenarios` with `{ "type": "your_new_scenario" }` returns 200
- [ ] `GET /metrics` shows `signallab_your_new_scenario_total`
- [ ] Loki shows log with `scenario_type: your_new_scenario`
- [ ] Frontend dropdown shows new option
