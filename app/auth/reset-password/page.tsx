import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { Suspense } from 'react';

// Helper component to allow ResetPasswordForm to use useSearchParams
function ResetPasswordFormWrapper() {
  return <ResetPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordFormWrapper />
      </Suspense>
    </div>
  );
}