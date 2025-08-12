'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { LoginPage } from '@/components/LoginPage';

export default function LoginPageRoute() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Loading...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Checking authentication
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, show the login component
  if (!user) {
    return <LoginPage />;
  }

  // This should not be reached, but just in case
  return null;
}
