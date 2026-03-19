import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { stacksApi, type Stack } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const StacksPanel = () => {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await stacksApi.list();
      setStacks(res.data.stacks);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Error al cargar stacks';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStacks();
  }, []);

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
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!error && stacks.length === 0 && !loading && (
          <p className="text-sm text-slate-400">
            No hay stacks o no hay credenciales configuradas.
          </p>
        )}
        <div className="space-y-2">
          {stacks.map((stack) => (
            <div key={stack.id} className="border p-3">
              <p className="font-medium">{stack.name}</p>
              <p className="font-mono text-xs text-slate-400">{stack.id}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
