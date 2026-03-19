import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, Plus, RefreshCw } from 'lucide-react';
import { credentialsApi, type Credential } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

export const CredentialsPanel = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

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

  const handleDelete = async (name: string) => {
    setError(null);
    setSuccessMsg(null);
    try {
      await credentialsApi.delete(name);
      setSuccessMsg(`Credencial "${name}" eliminada`);
      await fetchCredentials();
    } catch {
      setError('Error al eliminar credencial');
    }
  };

  return (
    <Card className="rounded-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Credenciales Komodo</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-none"
            onClick={fetchCredentials}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            className="rounded-none"
            size="sm"
            onClick={() => setShowForm((v) => !v)}
          >
            <Plus className="h-4 w-4" />
            {showForm ? 'Cancelar' : 'Añadir'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-red-500">{error}</p>}
        {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}

        {showForm && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3 border p-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="production"
                        className="rounded-none"
                      />
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
                        className="rounded-none"
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
                      <Input
                        {...field}
                        placeholder="tu-api-key"
                        className="rounded-none"
                      />
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
                        className="rounded-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full rounded-none">
                Guardar
              </Button>
            </form>
          </Form>
        )}

        {credentials.length === 0 && !loading && (
          <p className="text-sm text-slate-400">
            No hay credenciales guardadas.
          </p>
        )}

        <div className="space-y-2">
          {credentials.map((cred) => (
            <div
              key={cred.id}
              className="flex items-center justify-between border p-3"
            >
              <div>
                <p className="font-medium">{cred.name ?? '—'}</p>
                <p className="text-sm text-slate-400">{cred.url ?? '—'}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-none"
                onClick={() => cred.name && handleDelete(cred.name)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
