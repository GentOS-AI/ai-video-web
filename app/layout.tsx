import type { Viewport } from "next";
import { ReactNode } from "react";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// This is the root layout that wraps all locale-specific layouts
// It's minimal because most configuration happens in [locale]/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}
