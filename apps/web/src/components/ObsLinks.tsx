'use client';

import { ExternalLink, BarChart3, FileText, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GRAFANA_URL = process.env.NEXT_PUBLIC_GRAFANA_URL || 'http://localhost:3002';
const PROMETHEUS_URL = 'http://localhost:9090';
const LOKI_URL = 'http://localhost:3100';
const SENTRY_URL = 'https://sentry.io';

const links = [
  {
    label: 'Grafana Dashboard',
    description: 'Metrics + logs overview',
    href: `${GRAFANA_URL}/d/signal-lab-overview`,
    icon: BarChart3,
    color: 'text-orange-500',
  },
  {
    label: 'Prometheus',
    description: 'Raw metrics explorer',
    href: PROMETHEUS_URL,
    icon: Activity,
    color: 'text-red-500',
  },
  {
    label: 'Loki / Logs',
    description: 'Structured log stream',
    href: `${GRAFANA_URL}/explore`,
    icon: FileText,
    color: 'text-blue-500',
  },
  {
    label: 'Sentry',
    description: 'Error tracking',
    href: SENTRY_URL,
    icon: AlertTriangle,
    color: 'text-purple-500',
  },
];

export function ObsLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Observability</CardTitle>
        <CardDescription>Jump to monitoring tools</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {links.map((link) => (
          <Button
            key={link.label}
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-3"
            asChild
          >
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              <link.icon className={`h-4 w-4 shrink-0 ${link.color}`} />
              <div className="text-left">
                <div className="text-sm font-medium">{link.label}</div>
                <div className="text-xs text-muted-foreground">{link.description}</div>
              </div>
              <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
            </a>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
