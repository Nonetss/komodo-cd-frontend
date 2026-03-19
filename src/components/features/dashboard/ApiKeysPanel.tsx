import { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Plus, Copy, Check } from 'lucide-react';
import { apiKeysApi, type ApiKey } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const APP_URL =
  (import.meta.env.PUBLIC_APP_URL as string | undefined)?.replace(/\/$/, '') ??
  (typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:4321');

export const ApiKeysPanel = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiKeysApi.list();
      setKeys(res.data.keys);
    } catch {
      setError('Error al cargar las API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setError(null);
    try {
      const res = await apiKeysApi.create(newKeyName.trim());
      setCreatedKey(res.data.key);
      setNewKeyName('');
      setShowForm(false);
      await fetchKeys();
    } catch {
      setError('Error al crear la API key');
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await apiKeysApi.delete(id);
      await fetchKeys();
    } catch {
      setError('Error al eliminar la API key');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>API Keys</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchKeys}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setShowForm((v) => !v);
              setCreatedKey(null);
            }}
          >
            <Plus className="h-4 w-4" />
            {showForm ? 'Cancelar' : 'Nueva'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-destructive text-sm">{error}</p>}

        {createdKey && (
          <div className="space-y-3 rounded-lg border border-emerald-800 bg-emerald-950/20 p-4">
            <p className="text-sm font-medium text-emerald-400">
              Key creada. Cópiala ahora, no se mostrará de nuevo.
            </p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={createdKey}
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => handleCopy(createdKey)}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Úsala en GitHub Actions:
            </p>
            <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
              {`curl -X POST ${APP_URL}/api/v0/deploy \\
  -H "x-api-key: ${createdKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"stack":"mi-stack","action":"redeploy"}'`}
            </pre>
          </div>
        )}

        {showForm && (
          <div className="flex gap-2">
            <Input
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="nombre (ej: github-actions)"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button className="shrink-0" onClick={handleCreate}>
              Crear
            </Button>
          </div>
        )}

        {keys.length === 0 && !loading && (
          <p className="text-muted-foreground text-sm">No hay API keys.</p>
        )}

        <div className="space-y-2">
          {keys.map((k) => (
            <div
              key={k.id}
              className="border-border bg-card flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">{k.name ?? '—'}</p>
                <p className="text-muted-foreground font-mono text-xs">
                  {k.start ? `${k.start}...` : k.id}
                </p>
                <p className="text-muted-foreground text-xs">
                  {new Date(k.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDelete(k.id)}
              >
                <Trash2 className="text-destructive h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
