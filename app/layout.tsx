import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { CookieConsent } from "@/components/CookieConsent";

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
  metadataBase: new URL("https://adsvideo.co"),
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
    url: "https://adsvideo.co",
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AdsVideo",
    "description": "AI-powered video generation platform for creating professional advertising videos",
    "url": "https://adsvideo.co",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web",
    "offers": [
      {
        "@type": "Offer",
        "name": "Basic Plan",
        "price": "19.00",
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "19.00",
          "priceCurrency": "USD",
          "billingDuration": "P1M"
        }
      },
      {
        "@type": "Offer",
        "name": "Pro Plan",
        "price": "49.00",
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "49.00",
          "priceCurrency": "USD",
          "billingDuration": "P1M"
        }
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "7635",
      "bestRating": "5"
    },
    "creator": {
      "@type": "Organization",
      "name": "AdsVideo",
      "url": "https://adsvideo.co"
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <NotificationProvider>
            {children}
            <CookieConsent />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
