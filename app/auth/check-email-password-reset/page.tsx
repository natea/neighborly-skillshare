import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function CheckEmailPasswordResetPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            If an account exists for the email address you provided, a password reset link has been sent.
            Please check your inbox (and spam folder) for further instructions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The link will expire after a short period. If you don't receive an email, please try
            requesting a reset again or contact support.
          </p>
          <Link href="/auth/login" legacyBehavior>
            <a className="mt-6 inline-block text-sm text-blue-600 hover:underline">
              Back to Login
            </a>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}