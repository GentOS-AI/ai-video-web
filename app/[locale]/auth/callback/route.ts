/**
 * Legacy OAuth Callback Route Handler (Deprecated)
 * Redirects /[locale]/auth/callback to unified /auth/callback
 *
 * This ensures all OAuth callbacks are handled by the unified route
 * which properly detects user locale and redirects appropriately.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Get the full URL with query parameters
  const url = new URL(request.url);

  // Redirect to unified callback with all query parameters preserved
  const unifiedCallbackUrl = new URL('/auth/callback', url.origin);
  unifiedCallbackUrl.search = url.search; // Preserve ?code=... and other params

  return NextResponse.redirect(unifiedCallbackUrl, 307); // 307 = Temporary Redirect
}
