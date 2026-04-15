# Command: new-scenario

Scaffolds a complete new scenario type across the full stack.

## Usage
```
/new-scenario <scenario_name> "<description>"
```

Example:
```
/new-scenario disk_io "Simulates high disk I/O operations"
```

## What this command does

1. Adds `disk_io` to `ScenarioType` enum in `prisma/schema.prisma`
2. Adds `disk_io = 'disk_io'` to the DTO enum in `create-scenario.dto.ts`
3. Registers `signallab_disk_io_total` counter in `metrics.module.ts`
4. Adds `recordDiskIo()` method to `metrics.service.ts`
5. Adds `case ScenarioType.disk_io:` to the switch in `scenario.service.ts`
6. Implements `runDiskIo(id)` private method with:
   - `log.info('...', { scenario_id: id, scenario_type: 'disk_io' })`
   - `this.metrics.recordDiskIo('disk_io')`
   - Simulated work (sleep or computation)
7. Adds `{ value: 'disk_io', label: 'Disk I/O', description: '...' }` to `SCENARIO_OPTIONS` in `ScenarioRunner.tsx`
8. Updates the Zod schema in `ScenarioRunner.tsx` to include `'disk_io'`

## Files modified
- `prisma/schema.prisma`
- `apps/api/src/scenario/dto/create-scenario.dto.ts`
- `apps/api/src/metrics/metrics.module.ts`
- `apps/api/src/metrics/metrics.service.ts`
- `apps/api/src/scenario/scenario.service.ts`
- `apps/web/src/components/ScenarioRunner.tsx`

## Post-scaffold steps
```bash
# Generate and apply migration
cd apps/api && npx prisma migrate dev --name add_disk_io

# Rebuild and restart
docker compose build api web
docker compose up -d api web

# Verify
curl -X POST http://localhost:3001/api/scenarios \
  -H "Content-Type: application/json" \
  -d '{"type":"disk_io","name":"test run"}'
```

## Verification
Use the `check-obs` command to verify all signals are emitting correctly.
