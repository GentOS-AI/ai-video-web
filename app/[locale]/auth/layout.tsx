/**
 * Auth Layout
 * Forces dynamic rendering for all auth routes including OAuth callback
 */

// Force dynamic rendering for OAuth routes
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
