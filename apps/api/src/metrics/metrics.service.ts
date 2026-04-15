import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('signallab_scenario_runs_total')
    private readonly runsCounter: Counter<string>,

    @InjectMetric('signallab_scenario_duration_ms')
    private readonly durationHistogram: Histogram<string>,

    @InjectMetric('signallab_memory_bytes')
    private readonly memoryGauge: Gauge<string>,

    @InjectMetric('signallab_http_errors_total')
    private readonly httpErrorsCounter: Counter<string>,
  ) {}

  recordRun(scenarioType: string, status: 'success' | 'error') {
    this.runsCounter.inc({ scenario_type: scenarioType, status });
  }

  recordDuration(scenarioType: string, durationMs: number) {
    this.durationHistogram.observe({ scenario_type: scenarioType }, durationMs);
  }

  setMemoryUsage(scenarioType: string, bytes: number) {
    this.memoryGauge.set({ scenario_type: scenarioType }, bytes);
  }

  recordHttpError(statusCode: number) {
    this.httpErrorsCounter.inc({ status_code: String(statusCode) });
  }
}
