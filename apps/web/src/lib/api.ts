const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type ScenarioType =
  | 'cpu_spike'
  | 'memory_leak'
  | 'http_errors'
  | 'system_error'
  | 'latency_spike'
  | 'custom';

export type RunStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';

export interface ScenarioRun {
  id: string;
  name: string;
  type: ScenarioType;
  status: RunStatus;
  durationMs: number | null;
  errorMsg: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedRuns {
  items: ScenarioRun[];
  total: number;
  page: number;
  limit: number;
}

export async function createScenario(data: {
  type: ScenarioType;
  name?: string;
}): Promise<ScenarioRun> {
  const res = await fetch(`${API_URL}/api/scenarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchScenarios(page = 1, limit = 20): Promise<PaginatedRuns> {
  const res = await fetch(`${API_URL}/api/scenarios?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchScenario(id: string): Promise<ScenarioRun> {
  const res = await fetch(`${API_URL}/api/scenarios/${id}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
