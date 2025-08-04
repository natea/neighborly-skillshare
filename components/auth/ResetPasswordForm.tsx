'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation'; // useSearchParams to get query params

// Password complexity: at least 8 characters, one uppercase, one lowercase, one number
const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' });

const formSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], // path of error
  });

type FormData = z.infer<typeof formSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    let recoveryEventHandled = false; // Flag to track if PASSWORD_RECOVERY was processed by onAuthStateChange

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        recoveryEventHandled = true;
        if (session) {
          console.log('Password recovery event: Session established.');
          // Clear any potential error from checkInitialSession if recovery is successful
          setError(null);
        } else {
          setError('Invalid or expired password reset link. Please try requesting a new one.');
        }
      }
      // Only set sessionChecked to true here if it's relevant to PASSWORD_RECOVERY
      // or if we want to gate rendering until this specific listener fires.
      // For now, let checkInitialSession also control setSessionChecked for broader cases.
      // If PASSWORD_RECOVERY was handled, ensure sessionChecked is true.
      if (recoveryEventHandled) {
        setSessionChecked(true);
      }
    });

    const checkInitialSession = async () => {
      // If onAuthStateChange already handled a PASSWORD_RECOVERY and set an error, don't overwrite it.
      if (recoveryEventHandled && error) {
        setSessionChecked(true);
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error getting session:', sessionError.message);
        if (!recoveryEventHandled) setError('Could not verify session. Please try again.');
      } else if (data.session) {
        console.log('Initial session found.');
         if (!recoveryEventHandled) setError(null); // Clear error if session found and not from recovery
      } else {
        // Only set this error if onAuthStateChange hasn't already handled PASSWORD_RECOVERY
        if (!recoveryEventHandled) {
          const hash = window.location.hash;
          if (!hash.includes('access_token') && !hash.includes('refresh_token')) {
            setError('Invalid or expired password reset link. This page should be accessed via the link sent to your email.');
          }
        }
      }
      setSessionChecked(true); // Ensure sessionChecked is true after this path too.
    };

    checkInitialSession();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, router]); // `error` removed from dependency array to prevent re-running on setError from onSubmit

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    setMessage(null);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage('Your password has been reset successfully. You can now log in.');
      // Sign out the user after password update, as the session was temporary for reset
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000); // Delay for message visibility
    }
    setLoading(false); // Set loading to false after handling error or success
  };

  if (!sessionChecked) {
    return <div className="flex min-h-screen flex-col items-center justify-center"><p>Verifying reset link...</p></div>;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Enter your new password below.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="********"
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              placeholder="********"
              className={errors.confirmPassword ? 'border-red-500' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <Button type="submit" className="w-full" disabled={loading || !!error}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
          {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </CardFooter>
      </form>
    </Card>
  );
}