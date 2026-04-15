# Command: check-obs

Verify that all observability signals are working correctly.

## Usage
```
/check-obs [scenario_type]
```

Example:
```
/check-obs system_error
/check-obs          # checks all signals
```

## Full observability check script

```bash
#!/bin/bash
set -e

API="http://localhost:3001"
GRAFANA="http://localhost:3002"
PROMETHEUS="http://localhost:9090"
LOKI="http://localhost:3100"

echo "=== Signal Lab Observability Check ==="
echo ""

# 1. API health
echo "1. API Health..."
STATUS=$(curl -sf "$API/health" | jq -r '.status' 2>/dev/null || echo "FAIL")
if [ "$STATUS" = "ok" ]; then
  echo "   ✅ API healthy"
else
  echo "   ❌ API health check failed"
fi

# 2. Trigger a test run
echo ""
echo "2. Triggering system_error scenario..."
RUN=$(curl -sf -X POST "$API/api/scenarios" \
  -H "Content-Type: application/json" \
  -d '{"type":"system_error","name":"obs-check"}')
RUN_ID=$(echo $RUN | jq -r '.id')
echo "   Run ID: $RUN_ID"
sleep 2

# 3. Check Prometheus metrics
echo ""
echo "3. Prometheus metrics..."
METRICS=$(curl -sf "$API/metrics")

if echo "$METRICS" | grep -q "signallab_scenario_runs_total"; then
  echo "   ✅ signallab_scenario_runs_total present"
else
  echo "   ❌ signallab_scenario_runs_total missing"
fi

if echo "$METRICS" | grep -q "signallab_scenario_duration_ms"; then
  echo "   ✅ signallab_scenario_duration_ms present"
else
  echo "   ❌ signallab_scenario_duration_ms missing"
fi

# 4. Check Prometheus scraping
echo ""
echo "4. Prometheus scrape targets..."
TARGETS=$(curl -sf "$PROMETHEUS/api/v1/targets" | jq -r '.data.activeTargets[0].health' 2>/dev/null || echo "unknown")
if [ "$TARGETS" = "up" ]; then
  echo "   ✅ Prometheus scraping API"
else
  echo "   ⚠️  Prometheus target health: $TARGETS"
fi

# 5. Check Loki
echo ""
echo "5. Loki readiness..."
LOKI_STATUS=$(curl -sf "$LOKI/ready" 2>/dev/null || echo "not ready")
if echo "$LOKI_STATUS" | grep -q "ready"; then
  echo "   ✅ Loki is ready"
else
  echo "   ❌ Loki not ready: $LOKI_STATUS"
fi

# 6. Check Grafana
echo ""
echo "6. Grafana..."
GRAFANA_STATUS=$(curl -sf "$GRAFANA/api/health" | jq -r '.database' 2>/dev/null || echo "unknown")
if [ "$GRAFANA_STATUS" = "ok" ]; then
  echo "   ✅ Grafana healthy"
else
  echo "   ⚠️  Grafana status: $GRAFANA_STATUS"
fi

# 7. Check run status
echo ""
echo "7. Run status in DB..."
sleep 1
RUN_STATUS=$(curl -sf "$API/api/scenarios/$RUN_ID" | jq -r '.status' 2>/dev/null || echo "unknown")
echo "   Run $RUN_ID status: $RUN_STATUS"
if [ "$RUN_STATUS" = "FAILED" ]; then
  echo "   ✅ system_error correctly marked as FAILED"
fi

echo ""
echo "=== Check complete ==="
echo "Open Grafana: $GRAFANA/d/signal-lab-overview"
echo "Check Sentry for the captured exception."
```

## Manual verification steps

### Prometheus
```bash
curl http://localhost:3001/metrics | grep signallab_
```

### Loki (via Grafana)
1. Open http://localhost:3002/explore
2. Select Loki datasource
3. Query: `{app="signallab-api"} | json`
4. Look for `scenario_id` and `scenario_type` fields

### Sentry
1. Open your Sentry project
2. Filter by tag: `scenario_type:system_error`
3. Verify breadcrumbs include scenario context

### Grafana dashboard
1. Open http://localhost:3002/d/signal-lab-overview
2. Verify all 5 panels show data
3. Check the "Application Logs" panel for recent entries
