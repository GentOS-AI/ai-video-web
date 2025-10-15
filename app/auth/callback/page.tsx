/**
 * Google OAuth Callback Page
 * Handles the OAuth redirect from Google and exchanges code for tokens
 */
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      // Check for error from Google
      if (errorParam) {
        setError(`Authentication error: ${errorParam}`);
        setTimeout(() => {
          router.push('/?error=oauth_error');
        }, 2000);
        return;
      }

      // Check for code
      if (!code) {
        setError('No authorization code received');
        setTimeout(() => {
          router.push('/?error=no_code');
        }, 2000);
        return;
      }

      try {
        // Exchange code for tokens
        const redirectUri = `${window.location.origin}/auth/callback`;
        await login(code, redirectUri);

        // Redirect to home on success
        router.push('/?login=success');
      } catch (err) {
        console.error('Login error:', err);
        const errorMessage = err instanceof Error && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
        setError(errorMessage || 'Login failed. Please try again.');
        setTimeout(() => {
          router.push('/?error=login_failed');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-purple-bg/30">
      <div className="text-center max-w-md mx-auto px-4">
        {error ? (
          <>
            <div className="mb-6">
              <svg
                className="w-16 h-16 mx-auto text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-text-primary">Authentication Error</h1>
            <p className="text-text-secondary mb-6">{error}</p>
            <p className="text-sm text-text-muted">Redirecting you back...</p>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="inline-block relative">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-text-primary">Logging you in...</h1>
            <p className="text-text-secondary">
              Please wait while we complete the authentication process.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-purple-bg/30">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
