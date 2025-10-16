import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "AdsVideo - Create Stunning AI-Generated Videos in Seconds",
  description:
    "Transform your ideas into professional advertising videos with AI-powered Sora 2 technology. Perfect for marketers, businesses, and content creators.",
  keywords: [
    "AI video generation",
    "Sora 2",
    "advertising videos",
    "AI marketing",
    "video creation",
    "AI content",
    "automated video",
    "professional videos",
  ],
  authors: [{ name: "AdsVideo" }],
  creator: "AdsVideo",
  publisher: "AdsVideo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://adsvideo.ai",
    title: "AdsVideo - AI-Powered Video Generation",
    description:
      "Create professional advertising videos in seconds with AI technology.",
    siteName: "AdsVideo",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "AdsVideo - Create Stunning AI-Generated Videos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AdsVideo - AI Video Generation",
    description:
      "Transform your ideas into professional videos with AI-powered technology.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
