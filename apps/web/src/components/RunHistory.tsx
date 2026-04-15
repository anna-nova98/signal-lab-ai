'use client';

import { useQuery } from '@tanstack/react-query';
import { RefreshCw, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchScenarios, type ScenarioRun, type RunStatus } from '@/lib/api';

function StatusBadge({ status }: { status: RunStatus }) {
  const map: Record<RunStatus, { variant: 'default' | 'success' | 'destructive' | 'secondary' | 'warning'; icon: React.ReactNode }> = {
    PENDING: { variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
    RUNNING: { variant: 'warning', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    SUCCESS: { variant: 'success', icon: <CheckCircle2 className="h-3 w-3" /> },
    FAILED: { variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  };
  const { variant, icon } = map[status];
  return (
    <Badge variant={variant} className="flex items-center gap-1">
      {icon}
      {status}
    </Badge>
  );
}

function ScenarioTypePill({ type }: { type: string }) {
  const colors: Record<string, string> = {
    cpu_spike: 'bg-orange-100 text-orange-800',
    memory_leak: 'bg-purple-100 text-purple-800',
    http_errors: 'bg-red-100 text-red-800',
    system_error: 'bg-rose-100 text-rose-800',
    latency_spike: 'bg-yellow-100 text-yellow-800',
    custom: 'bg-blue-100 text-blue-800',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
      {type.replace('_', ' ')}
    </span>
  );
}

export function RunHistory() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['scenarios'],
    queryFn: () => fetchScenarios(1, 50),
  });

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Run History</CardTitle>
          <CardDescription>
            {data ? `${data.total} total runs` : 'Loading…'}
          </CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading runs…
          </div>
        )}

        {isError && (
          <div className="py-12 text-center text-destructive text-sm">
            Could not load run history. Is the API running?
          </div>
        )}

        {data && data.items.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">
            No runs yet. Trigger a scenario to get started.
          </div>
        )}

        {data && data.items.length > 0 && (
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {data.items.map((run: ScenarioRun) => (
              <RunRow key={run.id} run={run} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RunRow({ run }: { run: ScenarioRun }) {
  const date = new Date(run.createdAt);
  const timeStr = date.toLocaleTimeString();
  const dateStr = date.toLocaleDateString();

  return (
    <div className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <ScenarioTypePill type={run.type} />
        <div className="min-w-0">
          <p className="font-medium truncate max-w-[200px]">{run.name}</p>
          <p className="text-xs text-muted-foreground">{dateStr} {timeStr}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {run.durationMs != null && (
          <span className="text-xs text-muted-foreground">{run.durationMs}ms</span>
        )}
        <StatusBadge status={run.status} />
      </div>
    </div>
  );
}
