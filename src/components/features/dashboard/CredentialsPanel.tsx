import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Trash2,
  Plus,
  RefreshCw,
  Server,
  ShieldCheck,
  ExternalLink,
  KeyRound,
} from 'lucide-react';
import { credentialsApi, type Credential } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const saveSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  url: z.string().url('URL inválida'),
  key: z.string().min(1, 'Requerido'),
  secret: z.string().min(1, 'Requerido'),
});

type SaveFormValues = z.infer<typeof saveSchema>;

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-muted/60 animate-pulse rounded-md ${className}`} />
  );
}

export const CredentialsPanel = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const form = useForm<SaveFormValues>({
    resolver: zodResolver(saveSchema),
    defaultValues: { name: '', url: '', key: '', secret: '' },
  });

  const fetchCredentials = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await credentialsApi.list();
      setCredentials(res.data.credentials);
    } catch {
      setError('Error al cargar credenciales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  useEffect(() => {
    if (!confirmDeleteId) return;
    const t = setTimeout(() => setConfirmDeleteId(null), 3000);
    return () => clearTimeout(t);
  }, [confirmDeleteId]);

  const onSubmit = async (data: SaveFormValues) => {
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await credentialsApi.save(data);
      setSuccessMsg(res.data.message);
      form.reset();
      setShowForm(false);
      await fetchCredentials();
    } catch {
      setError('Error al guardar credenciales');
    }
  };

  const handleDelete = async (cred: Credential) => {
    if (!cred.name) return;
    if (confirmDeleteId !== cred.id) {
      setConfirmDeleteId(cred.id);
      return;
    }
    setConfirmDeleteId(null);
    setDeletingId(cred.id);
    setError(null);
    setSuccessMsg(null);
    try {
      await credentialsApi.delete(cred.name);
      setSuccessMsg(`Credencial "${cred.name}" eliminada`);
      await fetchCredentials();
    } catch {
      setError('Error al eliminar credencial');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3">
      {/* Left: list + add button */}
      <div className="space-y-4 lg:col-span-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div>
            <h2 className="text-xl font-semibold">Credenciales Komodo</h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Conexiones a instancias externas de Komodo
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              variant="outline"
              onClick={fetchCredentials}
              disabled={loading}
              className="w-full shrink-0 sm:w-auto"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              <span className="sm:hidden">Actualizar</span>
            </Button>
            <Button
              onClick={() => {
                setShowForm((v) => !v);
                setError(null);
                setSuccessMsg(null);
              }}
              className="w-full shrink-0 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              {showForm ? 'Cancelar' : 'Añadir credencial'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="text-destructive rounded-lg border border-red-900 bg-red-950/20 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="rounded-lg border border-emerald-800 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-400">
            {successMsg}
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nueva credencial</CardTitle>
              <CardDescription>
                Conecta una instancia de Komodo introduciendo sus datos de
                acceso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ej: production" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://komodo.example.com"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="tu-api-key" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="secret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secret</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="tu-secret"
                              type="password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        setShowForm(false);
                        form.reset();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="w-full sm:w-auto">
                      Guardar credencial
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Credentials list */}
        {loading && credentials.length === 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1 space-y-2 pt-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {credentials.length === 0 && !loading && !showForm && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                <Server className="text-muted-foreground h-6 w-6" />
              </div>
              <p className="text-muted-foreground text-sm">
                No hay credenciales guardadas
              </p>
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" />
                Añadir la primera
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {credentials.map((cred) => (
            <Card key={cred.id} className="group relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                      <Server className="text-primary h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {cred.name ?? '—'}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1">
                        <p className="text-muted-foreground truncate text-sm">
                          {cred.url ?? '—'}
                        </p>
                        {cred.url && (
                          <a
                            href={cred.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-primary shrink-0 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {confirmDeleteId === cred.id && (
                      <span className="text-destructive text-xs">
                        ¿Eliminar?
                      </span>
                    )}
                    <Button
                      variant={
                        confirmDeleteId === cred.id ? 'destructive' : 'ghost'
                      }
                      size="icon"
                      className={
                        confirmDeleteId === cred.id
                          ? 'shrink-0'
                          : 'text-muted-foreground hover:text-destructive shrink-0 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100'
                      }
                      disabled={deletingId === cred.id}
                      onClick={() => handleDelete(cred)}
                      aria-label={
                        confirmDeleteId === cred.id
                          ? 'Confirmar eliminación'
                          : 'Eliminar credencial'
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShieldCheck className="text-primary h-4 w-4" />
              ¿Qué son las credenciales?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm">
            <p>
              Las credenciales permiten conectar esta instancia con servidores
              remotos de Komodo para sincronizar y desplegar stacks.
            </p>
            <p>
              Cada credencial requiere una URL, una API key y un secret
              generados desde la instancia remota.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <KeyRound className="text-primary h-4 w-4" />
              Cómo obtener las claves
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm">
            <ol className="list-inside list-decimal space-y-2">
              <li>Accede a tu instancia remota de Komodo</li>
              <li>
                Ve a{' '}
                <span className="text-foreground font-medium">
                  Settings → API Keys
                </span>
              </li>
              <li>Crea una nueva key y copia el secret</li>
              <li>Pega ambos valores aquí junto con la URL</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
