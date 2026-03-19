import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { historyApi, type HistoryItem } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const ACTION_LABELS: Record<string, string> = {
  pull: 'Pull',
  redeploy: 'Redeploy',
  'pull-redeploy': 'Pull + Redeploy',
};

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-muted/60 animate-pulse rounded-md ${className}`} />
  );
}

export const HistoryPanel = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await historyApi.list();
      setHistory(res.data.history);
    } catch {
      setError('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const locale =
    typeof navigator !== 'undefined' ? navigator.language : 'es-ES';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Historial</CardTitle>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchHistory}
          disabled={loading}
          aria-label="Actualizar historial"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {error && <p className="text-destructive text-sm">{error}</p>}

        {/* Skeleton */}
        {loading && history.length === 0 && (
          <div className="space-y-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="border-border flex items-start gap-4 border-b py-3 last:border-0"
              >
                <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!error && !loading && history.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No hay acciones registradas.
          </p>
        )}

        <div className="space-y-0">
          {history.map((item, idx) => (
            <div
              key={item.id}
              className={`flex items-start gap-4 py-3 text-sm ${
                idx < history.length - 1 ? 'border-border border-b' : ''
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {item.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="text-destructive h-4 w-4" />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{item.stack}</span>
                  <span className="bg-secondary border-border text-muted-foreground rounded-md border px-2 py-0.5 text-xs">
                    {ACTION_LABELS[item.action] ?? item.action}
                  </span>
                </div>
                {item.message && (
                  <p className="text-muted-foreground truncate text-xs">
                    {item.message}
                  </p>
                )}
                <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                  <span>{item.userName ?? item.userEmail ?? item.userId}</span>
                  <span>·</span>
                  <span>
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    }).format(new Date(item.createdAt))}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
