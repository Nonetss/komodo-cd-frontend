import { authClient } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { navigate } from 'astro/virtual-modules/transitions-router.js';

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    await authClient.signIn
      .email({
        email: data.email,
        password: data.password,
      })
      .then(() => {
        navigate('/');
      });
  };

  const handleGoogleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      });
    } catch (error) {
      console.error('Error en login con Google:', error);
    }
  };

  const handleSSOLogin = async () => {
    try {
      await authClient.signIn.sso({
        providerId: 'authentik',
        callbackURL: '/',
      });
    } catch (error) {
      console.error('Error en login con SSO:', error);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="bg-primary/6 absolute -top-48 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <div className="bg-primary/15 border-primary/20 flex h-12 w-12 items-center justify-center rounded-xl border">
            <div className="bg-primary h-5 w-5 rounded-sm" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Komodo</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Inicia sesión en tu cuenta
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 pb-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="tu@email.com"
                          autoComplete="email"
                          spellCheck={false}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          autoComplete="current-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="mt-2 w-full">
                  Iniciar sesión
                </Button>
              </form>
            </Form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="border-border w-full border-t" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card text-muted-foreground px-2 text-xs">
                  o continúa con
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
              >
                <img
                  src="/icons/google.svg"
                  alt=""
                  aria-hidden="true"
                  className="h-4 w-4"
                />
                Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSSOLogin}
              >
                SSO
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
