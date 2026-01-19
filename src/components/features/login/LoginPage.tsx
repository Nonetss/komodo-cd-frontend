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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

  return (
    <div className="bg-background text-foreground flex min-h-screen w-full items-center justify-center px-4 font-sans">
      <Card className="w-full max-w-md rounded-none">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-none" />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full rounded-none">
                Login
              </Button>
            </form>
          </Form>
          <Button
            variant="outline"
            className="mt-4 w-full rounded-none"
            onClick={handleGoogleLogin}
          >
            <img src="/icons/google.svg" alt="Google" className="h-4 w-4" />
            <p>Google</p>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
