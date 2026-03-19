import { useState, useEffect } from 'react';
import { RefreshCw, GitBranch, GitCommit, AlertTriangle } from 'lucide-react';
import {
  stacksApi,
  deployApi,
  type Stack,
  type StackState,
  type DeployAction,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const ACTIONS: { value: DeployAction; label: string }[] = [
  { value: 'pull', label: 'Pull' },
  { value: 'redeploy', label: 'Redeploy' },
];

const STATE_STYLES: Record<
  StackState,
  { dot: string; badge: string; label: string }
> = {
  running: {
    dot: 'bg-green-500',
    badge: 'bg-green-50 text-green-700 border-green-200',
    label: 'Running',
  },
  deploying: {
    dot: 'bg-blue-500 animate-pulse',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    label: 'Deploying',
  },
  stopped: {
    dot: 'bg-slate-400',
    badge: 'bg-slate-50 text-slate-600 border-slate-200',
    label: 'Stopped',
  },
  paused: {
    dot: 'bg-yellow-400',
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    label: 'Paused',
  },
  created: {
    dot: 'bg-yellow-400',
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    label: 'Created',
  },
  restarting: {
    dot: 'bg-yellow-500 animate-pulse',
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    label: 'Restarting',
  },
  dead: {
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border-red-200',
    label: 'Dead',
  },
  removing: {
    dot: 'bg-red-400',
    badge: 'bg-red-50 text-red-600 border-red-200',
    label: 'Removing',
  },
  unhealthy: {
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border-red-200',
    label: 'Unhealthy',
  },
  down: {
    dot: 'bg-slate-300',
    badge: 'bg-slate-50 text-slate-500 border-slate-200',
    label: 'Down',
  },
  unknown: {
    dot: 'bg-slate-300',
    badge: 'bg-slate-50 text-slate-500 border-slate-200',
    label: 'Unknown',
  },
};

function StateBadge({ state }: { state: StackState }) {
  const s = STATE_STYLES[state] ?? STATE_STYLES.unknown;
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-xs font-medium ${s.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

type ActionResult = { success: boolean; message: string };

export const StacksPanel = () => {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Record<string, DeployAction | null>>(
    {},
  );
  const [results, setResults] = useState<
    Record<string, ActionResult | undefined>
  >({});

  const fetchStacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await stacksApi.list();
      setStacks(res.data.stacks);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Error al cargar stacks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStacks();
  }, []);

  const handleAction = async (stackName: string, action: DeployAction) => {
    setPending((p) => ({ ...p, [stackName]: action }));
    setResults((r) => ({ ...r, [stackName]: undefined }));
    try {
      const res = await deployApi.trigger({ stack: stackName, action });
      setResults((r) => ({
        ...r,
        [stackName]: { success: true, message: res.data.message },
      }));
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Error al ejecutar la acción';
      setResults((r) => ({
        ...r,
        [stackName]: { success: false, message: msg },
      }));
    } finally {
      setPending((p) => ({ ...p, [stackName]: null }));
    }
  };

  return (
    <Card className="rounded-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Stacks</CardTitle>
        <Button
          variant="outline"
          size="icon"
          className="rounded-none"
          onClick={fetchStacks}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
        {!error && stacks.length === 0 && !loading && (
          <p className="text-sm text-slate-400">
            No hay stacks o no hay credenciales configuradas.
          </p>
        )}
        <div className="space-y-4">
          {stacks.map((stack) => {
            const { info } = stack;
            const isPending = !!pending[stack.name];
            const result = results[stack.name];
            const hasUpdate =
              info.latest_hash &&
              info.deployed_hash &&
              info.latest_hash !== info.deployed_hash;

            return (
              <div key={stack.id} className="space-y-3 border p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{stack.name}</p>
                    {info.status && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        {info.status}
                      </p>
                    )}
                  </div>
                  <StateBadge state={info.state} />
                </div>

                {/* Repo / branch / commits */}
                {info.repo && (
                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <GitBranch className="h-3 w-3 shrink-0" />
                      <a
                        href={info.repo_link || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate hover:underline"
                      >
                        {info.repo}
                      </a>
                      <span className="text-slate-300">·</span>
                      <span>{info.branch}</span>
                    </div>
                    {(info.deployed_hash || info.latest_hash) && (
                      <div className="flex items-center gap-1.5">
                        <GitCommit className="h-3 w-3 shrink-0" />
                        <span className="font-mono">
                          {info.deployed_hash ?? '—'}
                        </span>
                        {hasUpdate && (
                          <span className="font-medium text-amber-500">
                            → {info.latest_hash} (update available)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Warnings */}
                {(info.project_missing || info.missing_files?.length > 0) && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    {info.project_missing
                      ? 'Proyecto no encontrado en el host'
                      : `Archivos ausentes: ${info.missing_files.join(', ')}`}
                  </div>
                )}

                {/* Services */}
                {info.services?.length > 0 && (
                  <div className="space-y-1">
                    {info.services.map((svc) => (
                      <div
                        key={svc.service}
                        className="flex items-center justify-between rounded bg-slate-50 px-2 py-1 text-xs"
                      >
                        <span className="font-medium">{svc.service}</span>
                        <div className="flex items-center gap-2 text-slate-400">
                          <span className="max-w-[180px] truncate font-mono">
                            {svc.image}
                          </span>
                          {svc.update_available && (
                            <span className="font-medium text-amber-500">
                              update
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {ACTIONS.map((a) => (
                    <Button
                      key={a.value}
                      size="sm"
                      variant="outline"
                      className="rounded-none text-xs"
                      disabled={isPending}
                      onClick={() => handleAction(stack.name, a.value)}
                    >
                      {isPending && pending[stack.name] === a.value
                        ? '...'
                        : a.label}
                    </Button>
                  ))}
                </div>

                {result && (
                  <p
                    className={`text-xs ${result.success ? 'text-green-600' : 'text-red-500'}`}
                  >
                    {result.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
