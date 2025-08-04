'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type FormData = z.infer<typeof formSchema>;

export default function ForgotPasswordForm() {
  // supabase is already initialized and exported from @/lib/supabase
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'all', // Trigger validation eagerly for testing
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    setMessage(null);
    setError(null);

    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`;

    const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo,
    });

    setLoading(false);
    if (supabaseError) {
      setError(supabaseError.message);
    } else {
      // setMessage('If an account exists for this email, a password reset link has been sent.');
      router.push('/auth/check-email-password-reset');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>Enter your email address to receive a password reset link.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="you@example.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
          {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </CardFooter>
      </form>
    </Card>
  );
}