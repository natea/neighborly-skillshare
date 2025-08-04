import Link from 'next/link';

export default function CheckEmailPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Check Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a verification link to your email address.
          </p>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please click the link in that email to complete your registration.
          </p>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Didn't receive an email? Check your spam folder or{' '}
            <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              try registering again
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}