import RegistrationForm from '@/components/auth/RegistrationForm';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Assuming Card components are used for consistency

const SignUpPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
          <CardDescription>
            Join Neighborly Skillshare today!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RegistrationForm />
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>
          <SocialLoginButtons />
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <a href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Sign in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;