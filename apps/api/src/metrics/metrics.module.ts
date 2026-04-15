import { Module } from '@nestjs/common';
import {
  makeCounterProvider,
  makeHistogramProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';

@Module({
  providers: [
    MetricsService,
    makeCounterProvider({
      name: 'signallab_scenario_runs_total',
      help: 'Total number of scenario runs',
      labelNames: ['scenario_type', 'status'],
    }),
    makeHistogramProvider({
      name: 'signallab_scenario_duration_ms',
      help: 'Scenario execution duration in milliseconds',
      labelNames: ['scenario_type'],
      buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
    }),
    makeGaugeProvider({
      name: 'signallab_memory_bytes',
      help: 'Simulated memory usage in bytes',
      labelNames: ['scenario_type'],
    }),
    makeCounterProvider({
      name: 'signallab_http_errors_total',
      help: 'Total simulated HTTP errors',
      labelNames: ['status_code'],
    }),
  ],
  exports: [MetricsService],
})
export class MetricsModule {}
