import { Injectable, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsService } from '../metrics/metrics.service';
import { getLogger } from '../logger/winston.logger';
import { CreateScenarioDto, ScenarioType } from './dto/create-scenario.dto';

@Injectable()
export class ScenarioService {
  private readonly logger = new Logger(ScenarioService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService,
  ) {}

  async create(dto: CreateScenarioDto) {
    const name = dto.name || `${dto.type} — ${new Date().toISOString()}`;

    // Persist as RUNNING
    const run = await this.prisma.scenarioRun.create({
      data: { name, type: dto.type, status: 'RUNNING' },
    });

    // Execute asynchronously so the HTTP response returns immediately
    this.executeScenario(run.id, dto.type).catch((err) => {
      this.logger.error(`Scenario ${run.id} failed: ${err.message}`);
    });

    return run;
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.scenarioRun.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.scenarioRun.count(),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    return this.prisma.scenarioRun.findUniqueOrThrow({ where: { id } });
  }

  // ─── Scenario Handlers ───────────────────────────────────────────────────────

  private async executeScenario(id: string, type: ScenarioType) {
    const start = Date.now();
    const log = getLogger();

    try {
      switch (type) {
        case ScenarioType.cpu_spike:
          await this.runCpuSpike(id);
          break;
        case ScenarioType.memory_leak:
          await this.runMemoryLeak(id);
          break;
        case ScenarioType.http_errors:
          await this.runHttpErrors(id);
          break;
        case ScenarioType.system_error:
          await this.runSystemError(id);
          break;
        case ScenarioType.latency_spike:
          await this.runLatencySpike(id);
          break;
        case ScenarioType.custom:
          await this.runCustom(id);
          break;
      }

      const durationMs = Date.now() - start;
      this.metrics.recordRun(type, 'success');
      this.metrics.recordDuration(type, durationMs);

      await this.prisma.scenarioRun.update({
        where: { id },
        data: { status: 'SUCCESS', durationMs },
      });

      log.info('Scenario completed', { scenario_id: id, scenario_type: type, durationMs });
    } catch (err) {
      const durationMs = Date.now() - start;
      this.metrics.recordRun(type, 'error');
      this.metrics.recordDuration(type, durationMs);

      await this.prisma.scenarioRun.update({
        where: { id },
        data: { status: 'FAILED', durationMs, errorMsg: err.message },
      });

      log.error('Scenario failed', { scenario_id: id, scenario_type: type, error: err.message });
    }
  }

  private async runCpuSpike(id: string) {
    const log = getLogger();
    log.info('Starting CPU spike scenario', { scenario_id: id, scenario_type: 'cpu_spike' });

    // Simulate CPU work for ~200ms
    const end = Date.now() + 200;
    let x = 0;
    while (Date.now() < end) {
      x = Math.sqrt(x + Math.random());
    }

    log.info('CPU spike complete', { scenario_id: id, scenario_type: 'cpu_spike', iterations: x });
  }

  private async runMemoryLeak(id: string) {
    const log = getLogger();
    log.warn('Starting memory leak scenario', { scenario_id: id, scenario_type: 'memory_leak' });

    // Allocate ~10MB and release
    const buf = Buffer.alloc(10 * 1024 * 1024);
    const bytes = buf.length;
    this.metrics.setMemoryUsage('memory_leak', bytes);

    await this.sleep(300);

    // Release
    this.metrics.setMemoryUsage('memory_leak', 0);
    log.warn('Memory leak scenario complete', { scenario_id: id, scenario_type: 'memory_leak', bytes });
  }

  private async runHttpErrors(id: string) {
    const log = getLogger();
    const codes = [400, 401, 403, 404, 500, 502, 503];

    for (const code of codes) {
      this.metrics.recordHttpError(code);
      log.error(`Simulated HTTP ${code}`, { scenario_id: id, scenario_type: 'http_errors', status_code: code });
      await this.sleep(50);
    }
  }

  private async runSystemError(id: string) {
    const log = getLogger();
    log.error('System error scenario triggered', { scenario_id: id, scenario_type: 'system_error' });

    const error = new Error('Simulated system error — Signal Lab');
    (error as any).scenarioId = id;

    // Capture in Sentry
    Sentry.withScope((scope) => {
      scope.setTag('scenario_id', id);
      scope.setTag('scenario_type', 'system_error');
      scope.setContext('scenario', { id, type: 'system_error' });
      Sentry.captureException(error);
    });

    // Re-throw so the run is marked FAILED
    throw error;
  }

  private async runLatencySpike(id: string) {
    const log = getLogger();
    const delayMs = 800 + Math.floor(Math.random() * 1200); // 800–2000ms
    log.info('Latency spike scenario starting', { scenario_id: id, scenario_type: 'latency_spike', delayMs });

    await this.sleep(delayMs);

    log.info('Latency spike complete', { scenario_id: id, scenario_type: 'latency_spike', delayMs });
  }

  private async runCustom(id: string) {
    const log = getLogger();
    log.info('Custom scenario running', { scenario_id: id, scenario_type: 'custom' });
    await this.sleep(100);
    log.info('Custom scenario complete', { scenario_id: id, scenario_type: 'custom' });
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
