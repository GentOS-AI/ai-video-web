/**
 * Next.js Middleware for i18n
 * Automatically detects user language and redirects to appropriate locale
 */
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './lib/i18n/config';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Automatically detect locale from Accept-Language header
  localeDetection: true,

  // Locale prefix strategy
  // 'as-needed': omit prefix for default locale (/about), add for others (/zh/about)
  // 'always': always add prefix (/en/about, /zh/about)
  // 'never': never add prefix (not recommended for SEO)
  localePrefix: 'always',
});

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/', '/(zh|zh-TW|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
