# Command: run-stack

Start, stop, or restart the Signal Lab Docker stack.

## Usage
```
/run-stack [start|stop|restart|status|logs]
```

## start
```bash
# Start all services
docker compose up -d

# Wait for health checks
echo "Waiting for services..."
until curl -sf http://localhost:3001/health > /dev/null; do
  echo "  API not ready, waiting..."
  sleep 3
done

echo "✅ Stack is up!"
echo "  UI:         http://localhost:3000"
echo "  API:        http://localhost:3001"
echo "  Metrics:    http://localhost:3001/metrics"
echo "  Grafana:    http://localhost:3002  (admin/admin)"
echo "  Prometheus: http://localhost:9090"
echo "  Loki:       http://localhost:3100"
```

## stop
```bash
docker compose down
```

## restart (specific service)
```bash
# Restart just the API (after code changes)
docker compose build api && docker compose up -d api

# Restart just the web
docker compose build web && docker compose up -d web

# Full restart
docker compose down && docker compose up -d
```

## status
```bash
docker compose ps
```

## logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f web
docker compose logs -f loki
docker compose logs -f grafana
```

## Troubleshooting

### API won't start
```bash
docker compose logs api
# Common issues:
# - DB not ready: wait for postgres healthcheck
# - Migration failed: check prisma/migrations/
# - Port conflict: check if 3001 is in use
```

### Grafana shows no data
```bash
# Check Prometheus is scraping
curl http://localhost:9090/api/v1/targets
# Check Loki is receiving logs
curl http://localhost:3100/ready
```

### Reset everything (nuclear option)
```bash
docker compose down -v  # removes volumes too
docker compose up -d
```
