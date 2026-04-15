'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { createScenario, type ScenarioType } from '@/lib/api';

const SCENARIO_OPTIONS: { value: ScenarioType; label: string; description: string }[] = [
  { value: 'cpu_spike', label: 'CPU Spike', description: 'Simulates high CPU usage' },
  { value: 'memory_leak', label: 'Memory Leak', description: 'Allocates and releases memory' },
  { value: 'http_errors', label: 'HTTP Errors', description: 'Generates 4xx/5xx error metrics' },
  { value: 'system_error', label: 'System Error', description: 'Triggers a Sentry exception' },
  { value: 'latency_spike', label: 'Latency Spike', description: 'Adds artificial delay (800–2000ms)' },
  { value: 'custom', label: 'Custom', description: 'Generic custom scenario' },
];

const schema = z.object({
  type: z.enum(['cpu_spike', 'memory_leak', 'http_errors', 'system_error', 'latency_spike', 'custom']),
  name: z.string().max(120).optional(),
});

type FormValues = z.infer<typeof schema>;

export function ScenarioRunner() {
  const queryClient = useQueryClient();

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'system_error', name: '' },
  });

  const mutation = useMutation({
    mutationFn: createScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      reset({ type: 'system_error', name: '' });
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate({ type: data.type, name: data.name || undefined });
  };

  const selectedOption = SCENARIO_OPTIONS.find(
    (o) => o.value === (control._formValues.type as ScenarioType),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Run Scenario
        </CardTitle>
        <CardDescription>Trigger an observability signal</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Scenario type */}
          <div className="space-y-2">
            <Label htmlFor="type">Scenario Type</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select scenario…" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCENARIO_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {selectedOption && (
              <p className="text-xs text-muted-foreground">{selectedOption.description}</p>
            )}
            {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
          </div>

          {/* Optional name */}
          <div className="space-y-2">
            <Label htmlFor="name">Run Name (optional)</Label>
            <Input
              id="name"
              placeholder="e.g. pre-deploy check"
              {...register('name')}
            />
          </div>

          {/* Error feedback */}
          {mutation.isError && (
            <p className="text-xs text-destructive">
              Failed to start scenario. Is the API running?
            </p>
          )}

          {mutation.isSuccess && (
            <p className="text-xs text-green-600">
              Scenario started — check the run history.
            </p>
          )}

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting…
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Scenario
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
