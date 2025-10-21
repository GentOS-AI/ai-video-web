import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { CookieConsent } from "@/components/CookieConsent";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/lib/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Generate static params for all supported locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Generate metadata dynamically based on locale
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.home" });

  return {
    metadataBase: new URL("https://adsvideo.co"),
    title: t("title"),
    description: t("description"),
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
      locale: locale === "zh" ? "zh_CN" : locale === "zh-TW" ? "zh_TW" : "en_US",
      url: `https://adsvideo.co/${locale === "en" ? "" : locale}`,
      title: t("title"),
      description: t("description"),
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
      title: t("title"),
      description: t("description"),
      images: ["/og-image.svg"],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://adsvideo.co/${locale === "en" ? "" : locale}`,
      languages: {
        en: "https://adsvideo.co",
        zh: "https://adsvideo.co/zh",
        "zh-TW": "https://adsvideo.co/zh-TW",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // Get locale from params
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as typeof locales[number])) {
    notFound();
  }

  // Load messages for the current locale
  const messages = await getMessages();

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "AdsVideo",
    description:
      "AI-powered video generation platform for creating professional advertising videos",
    url: "https://adsvideo.co",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: [
      {
        "@type": "Offer",
        name: "Basic Plan",
        price: "19.00",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "19.00",
          priceCurrency: "USD",
          billingDuration: "P1M",
        },
      },
      {
        "@type": "Offer",
        name: "Pro Plan",
        price: "49.00",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "49.00",
          priceCurrency: "USD",
          billingDuration: "P1M",
        },
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "7635",
      bestRating: "5",
    },
    creator: {
      "@type": "Organization",
      name: "AdsVideo",
      url: "https://adsvideo.co",
    },
  };

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <NotificationProvider>
              {children}
              <CookieConsent />
            </NotificationProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
