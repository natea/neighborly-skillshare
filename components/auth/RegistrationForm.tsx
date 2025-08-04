'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const registrationFormSchema = z.object({
  email: z.string().min(1, { message: 'Email is required.' }).email({ message: 'Invalid email format.' }),
  password: z.string()
    .min(1, { message: 'Password is required.' })
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' }),
  confirmPassword: z.string().min(1, { message: 'Confirm Password is required.' }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'], // Path to field to attach the error to
});

type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

const RegistrationForm: React.FC = () => {
  const router = useRouter(); // Initialize useRouter
  const [formError, setFormError] = useState<string | null>(null);
  // const [successMessage, setSuccessMessage] = useState<string | null>(null); // No longer needed
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    mode: 'onBlur', // Validate on blur
  });

  const onSubmit = async (data: RegistrationFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    // setSuccessMessage(null); // No longer needed

    const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (signUpError) {
      setFormError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    if (signUpData.user) {
      // User signed up successfully, now create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: signUpData.user.id, email: signUpData.user.email });

      if (profileError) {
        // This is a tricky state: user exists in auth.users but not profiles
        // For now, inform the user. In a real app, might need a retry or admin alert.
        setFormError('Registration succeeded, but failed to create user profile. Please contact support.');
        setIsSubmitting(false);
        return;
      }
      // setSuccessMessage('Registration successful! Please check your email to verify your account.'); // Replaced by redirect
      router.push('/auth/check-email'); // Redirect to check-email page
    } else {
      // Should not happen if signUpError is null, but as a safeguard
      setFormError('An unexpected error occurred during registration.');
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create your Neighborly Skillshare account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className={`mt-1 block w-full ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && <p className="mt-2 text-sm text-red-600" role="alert">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              className={`mt-1 block w-full ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              aria-invalid={errors.password ? "true" : "false"}
            />
            {errors.password && <p className="mt-2 text-sm text-red-600" role="alert">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className={`mt-1 block w-full ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
              aria-invalid={errors.confirmPassword ? "true" : "false"}
            />
            {errors.confirmPassword && <p className="mt-2 text-sm text-red-600" role="alert">{errors.confirmPassword.message}</p>}
          </div>

          {formError && <p className="mt-2 text-sm text-red-600" role="alert">{formError}</p>}
          {/* {successMessage && <p className="mt-2 text-sm text-green-600" role="alert">{successMessage}</p>} */} {/* No longer needed */}

          <div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegistrationForm;