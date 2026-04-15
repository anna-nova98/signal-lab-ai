import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum ScenarioType {
  cpu_spike = 'cpu_spike',
  memory_leak = 'memory_leak',
  http_errors = 'http_errors',
  system_error = 'system_error',
  latency_spike = 'latency_spike',
  custom = 'custom',
}

export class CreateScenarioDto {
  @IsEnum(ScenarioType)
  type: ScenarioType;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;
}
