/**
 * OAuth Callback Route Handler
 * Handles GET requests to /[locale]/auth/callback
 *
 * This is a Route Handler that simply returns an HTML page
 * Route Handlers are always dynamic by default
 */

export const dynamic = 'force-dynamic';

// Simple HTML page that will handle the OAuth callback
const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Logging you in...</title>
  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(to bottom, #ffffff, #f3e8ff);
    }
    .container {
      text-align: center;
      max-width: 400px;
      padding: 2rem;
    }
    .spinner {
      width: 64px;
      height: 64px;
      border: 4px solid #e5e7eb;
      border-top-color: #8b5cf6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1.5rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 0.5rem;
    }
    p {
      color: #6b7280;
      margin: 0;
    }
  </style>
  <script type="module">
    // This script will run in the browser and handle the OAuth callback
    (async function() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      // Get user locale from cookie or browser
      function getUserLocale() {
        const cookie = document.cookie.split('; ').find(row => row.startsWith('NEXT_LOCALE='));
        if (cookie) return cookie.split('=')[1];

        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('zh')) return 'zh';
        if (browserLang.startsWith('ja')) return 'ja';
        return 'en';
      }

      const locale = getUserLocale();

      if (error) {
        console.error('OAuth error:', error);
        window.location.href = '/' + locale + '?error=oauth_error';
        return;
      }

      if (!code) {
        console.error('No authorization code');
        window.location.href = '/' + locale + '?error=no_code';
        return;
      }

      try {
        // Get API URL from meta tag or default
        const apiUrl = 'https://adsvideo.co/api/v1';
        const redirectUri = window.location.origin + window.location.pathname;

        // Exchange code for tokens
        const response = await fetch(apiUrl + '/auth/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, redirect_uri: redirectUri }),
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const data = await response.json();

        // Store tokens in localStorage
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
        }
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }

        // Redirect to home page
        window.location.href = '/' + locale + '?login=success';
      } catch (err) {
        console.error('Login error:', err);
        window.location.href = '/' + locale + '?error=login_failed';
      }
    })();
  </script>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h1>Logging you in...</h1>
    <p>Please wait while we complete the authentication process.</p>
  </div>
</body>
</html>
`;

export async function GET() {
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}
