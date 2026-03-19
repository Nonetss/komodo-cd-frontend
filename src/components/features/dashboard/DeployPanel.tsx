import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { deployApi, type DeployAction } from '@/lib/api';
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

const ACTIONS: { value: DeployAction; label: string }[] = [
  { value: 'build', label: 'Build' },
  { value: 'pull', label: 'Pull' },
  { value: 'redeploy', label: 'Redeploy' },
  { value: 'build-pull-redeploy', label: 'Build + Pull + Redeploy' },
];

const deploySchema = z.object({
  stack: z.string().min(1, 'Requerido'),
  action: z.enum(['build', 'pull', 'redeploy', 'build-pull-redeploy']),
});

type DeployFormValues = z.infer<typeof deploySchema>;

export const DeployPanel = () => {
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<DeployFormValues>({
    resolver: zodResolver(deploySchema),
    defaultValues: { stack: '', action: 'redeploy' },
  });

  const onSubmit = async (data: DeployFormValues) => {
    setResult(null);
    setLoading(true);
    try {
      const res = await deployApi.trigger(data);
      setResult({ success: res.data.success, message: res.data.message });
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Error al ejecutar el deploy';
      setResult({ success: false, message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Trigger Deploy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="stack"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stack</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="mi-stack"
                      className="rounded-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acción</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="bg-background focus:ring-ring w-full border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                    >
                      {ACTIONS.map((a) => (
                        <option key={a.value} value={a.value}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full rounded-none"
              disabled={loading}
            >
              {loading ? 'Ejecutando...' : 'Ejecutar'}
            </Button>
          </form>
        </Form>

        {result && (
          <div
            className={`border p-3 text-sm ${
              result.success
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-red-500 bg-red-50 text-red-700'
            }`}
          >
            {result.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
