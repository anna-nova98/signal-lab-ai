import { ScenarioRunner } from '@/components/ScenarioRunner';
import { RunHistory } from '@/components/RunHistory';
import { ObsLinks } from '@/components/ObsLinks';
import { Activity } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center gap-3">
          <Activity className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Signal Lab</h1>
            <p className="text-xs text-muted-foreground">Observability playground</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <ScenarioRunner />
          <ObsLinks />
        </div>

        {/* Right column */}
        <div className="lg:col-span-2">
          <RunHistory />
        </div>
      </div>
    </main>
  );
}
