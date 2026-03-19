import { useState, useEffect, useMemo } from 'react';
import {
  RefreshCw,
  GitBranch,
  GitCommit,
  AlertTriangle,
  Search,
  X,
  Copy,
  Check,
  Terminal,
} from 'lucide-react';
import {
  stacksApi,
  deployApi,
  type Stack,
  type StackState,
  type DeployAction,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const APP_URL =
  (import.meta.env.PUBLIC_APP_URL as string | undefined)?.replace(/\/$/, '') ??
  (typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:4321');

const ACTIONS: { value: DeployAction; label: string }[] = [
  { value: 'pull', label: 'Pull' },
  { value: 'redeploy', label: 'Redeploy' },
  { value: 'pull-redeploy', label: 'Pull + Redeploy' },
];

const CURL_ACTIONS: { value: DeployAction; label: string }[] = [
  { value: 'pull', label: 'Pull' },
  { value: 'redeploy', label: 'Redeploy' },
  { value: 'pull-redeploy', label: 'Pull + Redeploy' },
];

const STATE_STYLES: Record<
  StackState,
  { dot: string; badge: string; label: string }
> = {
  running: {
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-950/40 border-emerald-800 text-emerald-400',
    label: 'Running',
  },
  deploying: {
    dot: 'bg-blue-400 animate-pulse',
    badge: 'bg-blue-950/40 border-blue-800 text-blue-400',
    label: 'Deploying',
  },
  stopped: {
    dot: 'bg-muted-foreground',
    badge: 'bg-secondary border-border text-muted-foreground',
    label: 'Stopped',
  },
  paused: {
    dot: 'bg-amber-400',
    badge: 'bg-amber-950/40 border-amber-800 text-amber-400',
    label: 'Paused',
  },
  created: {
    dot: 'bg-amber-400',
    badge: 'bg-amber-950/40 border-amber-800 text-amber-400',
    label: 'Created',
  },
  restarting: {
    dot: 'bg-amber-500 animate-pulse',
    badge: 'bg-amber-950/40 border-amber-800 text-amber-400',
    label: 'Restarting',
  },
  dead: {
    dot: 'bg-red-500',
    badge: 'bg-red-950/40 border-red-900 text-red-400',
    label: 'Dead',
  },
  removing: {
    dot: 'bg-red-400',
    badge: 'bg-red-950/40 border-red-900 text-red-400',
    label: 'Removing',
  },
  unhealthy: {
    dot: 'bg-red-500',
    badge: 'bg-red-950/40 border-red-900 text-red-400',
    label: 'Unhealthy',
  },
  down: {
    dot: 'bg-muted-foreground/40',
    badge: 'bg-secondary border-border text-muted-foreground',
    label: 'Down',
  },
  unknown: {
    dot: 'bg-muted-foreground/30',
    badge: 'bg-secondary border-border text-muted-foreground',
    label: 'Unknown',
  },
};

function StateBadge({ state }: { state: StackState }) {
  const s = STATE_STYLES[state] ?? STATE_STYLES.unknown;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${s.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function CurlSnippet({ stackName }: { stackName: string }) {
  const [open, setOpen] = useState(false);
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  const curl = (action: DeployAction) =>
    `curl -X POST ${APP_URL}/api/v0/deploy \\\n  -H "x-api-key: <tu-api-key>" \\\n  -H "Content-Type: application/json" \\\n  -d '{"stack":"${stackName}","action":"${action}"}'`;

  const copy = (action: DeployAction) => {
    navigator.clipboard.writeText(curl(action));
    setCopiedAction(action);
    setTimeout(() => setCopiedAction(null), 2000);
  };

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
      >
        <Terminal className="h-3.5 w-3.5" />
        {open ? 'Ocultar curls' : 'Ver curls'}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {CURL_ACTIONS.map((a) => (
            <div key={a.value} className="bg-muted rounded-md p-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  {a.label}
                </span>
                <button
                  onClick={() => copy(a.value)}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
                >
                  {copiedAction === a.value ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedAction === a.value ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <pre className="text-foreground overflow-x-auto font-mono text-xs leading-relaxed break-all whitespace-pre-wrap">
                {curl(a.value)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
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
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState<StackState | null>(null);

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

  const availableStates = useMemo(() => {
    const seen = new Set<StackState>();
    stacks.forEach((s) => seen.add(s.info.state));
    return Array.from(seen).sort();
  }, [stacks]);

  const filtered = useMemo(
    () =>
      stacks.filter((stack) => {
        const matchesSearch =
          search.trim() === '' ||
          stack.name.toLowerCase().includes(search.toLowerCase().trim());
        const matchesState =
          filterState === null || stack.info.state === filterState;
        return matchesSearch && matchesState;
      }),
    [stacks, search, filterState],
  );

  const hasFilters = search.trim() !== '' || filterState !== null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          Stacks
          {stacks.length > 0 && (
            <span className="text-muted-foreground text-sm font-normal">
              {hasFilters
                ? `${filtered.length} / ${stacks.length}`
                : stacks.length}
            </span>
          )}
        </CardTitle>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchStacks}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {error && <p className="text-destructive mb-3 text-sm">{error}</p>}

        {stacks.length > 0 && (
          <div className="mb-5 space-y-3">
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar stack..."
                className="pr-8 pl-9"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {availableStates.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {availableStates.map((state) => {
                  const s = STATE_STYLES[state] ?? STATE_STYLES.unknown;
                  const isActive = filterState === state;
                  const count = stacks.filter(
                    (st) => st.info.state === state,
                  ).length;
                  return (
                    <button
                      key={state}
                      onClick={() => setFilterState(isActive ? null : state)}
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${isActive ? s.badge : 'border-border text-muted-foreground hover:text-foreground bg-secondary'}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                      {s.label} <span className="opacity-60">({count})</span>
                    </button>
                  );
                })}
                {hasFilters && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setFilterState(null);
                    }}
                    className="border-border text-muted-foreground hover:text-foreground bg-secondary inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs transition-colors"
                  >
                    <X className="h-3 w-3" /> Limpiar
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {!error && stacks.length === 0 && !loading && (
          <p className="text-muted-foreground text-sm">
            No hay stacks o no hay credenciales configuradas.
          </p>
        )}
        {filtered.length === 0 && stacks.length > 0 && (
          <p className="text-muted-foreground text-sm">
            No hay stacks que coincidan con los filtros.
          </p>
        )}

        <div className="space-y-3">
          {filtered.map((stack) => {
            const { info } = stack;
            const isPending = !!pending[stack.name];
            const result = results[stack.name];
            const hasUpdate =
              info.latest_hash &&
              info.deployed_hash &&
              info.latest_hash !== info.deployed_hash;

            return (
              <div
                key={stack.id}
                className="border-border bg-card space-y-3 rounded-lg border p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{stack.name}</p>
                    {info.status && (
                      <p className="text-muted-foreground mt-0.5 text-sm">
                        {info.status}
                      </p>
                    )}
                  </div>
                  <StateBadge state={info.state} />
                </div>

                {info.repo && (
                  <div className="text-muted-foreground space-y-1 text-sm">
                    <div className="flex items-center gap-1.5">
                      <GitBranch className="h-3.5 w-3.5 shrink-0" />
                      <a
                        href={info.repo_link || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-foreground truncate transition-colors"
                      >
                        {info.repo}
                      </a>
                      <span className="text-border">·</span>
                      <span>{info.branch}</span>
                    </div>
                    {(info.deployed_hash || info.latest_hash) && (
                      <div className="flex items-center gap-1.5">
                        <GitCommit className="h-3.5 w-3.5 shrink-0" />
                        <span className="font-mono text-xs">
                          {info.deployed_hash ?? '—'}
                        </span>
                        {hasUpdate && (
                          <span className="text-primary text-xs font-medium">
                            → {info.latest_hash} (update disponible)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {(info.project_missing || info.missing_files?.length > 0) && (
                  <div className="text-destructive flex items-center gap-1.5 text-sm">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {info.project_missing
                      ? 'Proyecto no encontrado en el host'
                      : `Archivos ausentes: ${info.missing_files.join(', ')}`}
                  </div>
                )}

                {info.services?.length > 0 && (
                  <div className="space-y-1">
                    {info.services.map((svc) => (
                      <div
                        key={svc.service}
                        className="bg-muted flex items-center justify-between rounded-md px-3 py-1.5 text-sm"
                      >
                        <span className="font-medium">{svc.service}</span>
                        <div className="text-muted-foreground flex items-center gap-2">
                          <span className="max-w-[200px] truncate font-mono text-xs">
                            {svc.image}
                          </span>
                          {svc.update_available && (
                            <span className="text-primary text-xs font-medium">
                              update
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {ACTIONS.map((a) => (
                    <Button
                      key={a.value}
                      size="sm"
                      variant="outline"
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
                    className={`text-sm ${result.success ? 'text-emerald-400' : 'text-destructive'}`}
                  >
                    {result.message}
                  </p>
                )}

                <CurlSnippet stackName={stack.name} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
