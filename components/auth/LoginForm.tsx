'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
// Shadcn form components are likely missing, using react-hook-form directly with HTML elements
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }).min(1, { message: 'Email is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).min(1, { message: 'Password is required' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'all', // Trigger validation on blur, change, and submit
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      // On successful login, Supabase client handles session.
      // Redirect to the main application page.
      router.push('/');
      // router.refresh(); //
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    // <Form {...form}> // Using standard form due to potential missing shadcn/ui form components
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <Input
            id="email-input"
            type="email"
            placeholder="you@example.com"
            {...form.register('email')}
            className="mt-1 block w-full"
            aria-invalid={form.formState.errors.email ? "true" : "false"}
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <Input
            id="password-input"
            type="password"
            placeholder="••••••••"
            {...form.register('password')}
            className="mt-1 block w-full"
            aria-invalid={form.formState.errors.password ? "true" : "false"}
          />
          {form.formState.errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{form.formState.errors.password.message}</p>
          )}
        </div>

        {errorMessage && (
          <p className="text-sm font-medium text-destructive">{errorMessage}</p>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    // </Form>
  );
}