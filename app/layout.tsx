import { auth } from "@/auth";
import { BugReportWidget } from "@/components/BugReportWidget";
import { ChatAssistant } from "@/components/ChatAssistant";
import CookieConsentBanner from "@/components/CookieConsent";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { HotjarAnalytics } from "@/components/Hotjar";
import prisma from "@/lib/prisma";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Geist_Mono, Playfair_Display, Poppins } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { Providers } from "./providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

import { headers } from "next/headers";

async function getBaseUrl(): Promise<string> {
  try {
    const headersList = await headers();
    const host = headersList.get("x-forwarded-host") || headersList.get("host");
    if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      const proto = headersList.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
      return `${proto}://${host}`;
    }
  } catch (err) {
    // Fallthrough if headers() is unavailable
  }

  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || process.env.URL;
  if (envUrl) {
    const formattedEnvUrl = envUrl.startsWith("http://") || envUrl.startsWith("https://")
      ? envUrl
      : `https://${envUrl}`;

    if (process.env.NODE_ENV === "production") {
      if (!formattedEnvUrl.includes("localhost") && !formattedEnvUrl.includes("127.0.0.1")) {
        return formattedEnvUrl;
      }
    } else {
      return formattedEnvUrl;
    }
  }

  if (process.env.NODE_ENV === "production") {
    return "https://prostasprawa.pl";
  }

  return "http://localhost:3000";
}

function sanitizeImageUrl(urlStr: string | undefined, baseUrlStr: string): string {
  if (!urlStr) return `${baseUrlStr}/favicon.png`;
  let trimmed = urlStr.trim();

  if (
    trimmed.startsWith("http://localhost") ||
    trimmed.startsWith("https://localhost") ||
    trimmed.startsWith("http://127.0.0.1") ||
    trimmed.startsWith("https://127.0.0.1")
  ) {
    try {
      const parsed = new URL(trimmed);
      trimmed = parsed.pathname + parsed.search;
    } catch {
      trimmed = "/favicon.png";
    }
  }

  if (trimmed.startsWith("/")) {
    return `${baseUrlStr}${trimmed}`;
  }

  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `${baseUrlStr}/${trimmed}`;
  }

  return trimmed;
}

export async function generateMetadata(): Promise<Metadata> {
  let siteName = "Prosta Sprawa"
  let favicon = "/favicon.png"
  let ogTitle = "Prosta Sprawa - Platforma łącząca klientów z ekspertami prawnymi"
  let ogDescription = "Znajdź prawnika lub eksperta prawnego w Twojej okolicy. Porównaj oferty i ceny usług prawnych."
  let ogImage = "/favicon.png"

  try {
    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: ["siteName", "favicon", "ogTitle", "ogDescription", "ogImage"]
        }
      }
    })

    const settingsMap = new Map(settings.map(s => [s.key, s.value]))

    if (settingsMap.has("siteName")) siteName = settingsMap.get("siteName")!
    if (settingsMap.has("favicon")) favicon = settingsMap.get("favicon")!
    if (settingsMap.has("ogTitle")) ogTitle = settingsMap.get("ogTitle")!
    if (settingsMap.has("ogDescription")) ogDescription = settingsMap.get("ogDescription")!
    if (settingsMap.has("ogImage")) ogImage = settingsMap.get("ogImage")!
  } catch (error) {
    console.error("Error fetching settings for metadata:", error)
  }

  const baseUrlStr = await getBaseUrl();
  let metadataBase: URL;
  try {
    metadataBase = new URL(baseUrlStr);
  } catch {
    metadataBase = new URL("https://prostasprawa.pl");
  }

  const cleanOgImage = sanitizeImageUrl(ogImage, baseUrlStr);
  const cleanFavicon = sanitizeImageUrl(favicon, baseUrlStr);

  // Domyślny canonical wskazuje na bieżącą ścieżkę bez query stringa (nagłówek
  // ustawiany w proxy.ts). Strony, które tego potrzebują, mogą nadpisać
  // `alternates.canonical` we własnym generateMetadata — Next scala metadane
  // od layoutu do strony po kluczach top-level.
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";

  return {
    metadataBase,
    alternates: {
      canonical: pathname,
    },
    title: {
      default: ogTitle,
      template: `%s | ${siteName}`,
    },
    description: ogDescription,
    icons: {
      icon: cleanFavicon,
      shortcut: cleanFavicon,
      apple: cleanFavicon,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      siteName: siteName,
      images: cleanOgImage ? [{ url: cleanOgImage }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: cleanOgImage ? [cleanOgImage] : [],
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  let showChat = true;
  let gaId = "";
  let gaEnabled = false;

  try {
    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: ["showChatAssistant", "googleAnalyticsId", "googleAnalyticsEnabled"],
        },
      },
    });
    const map = new Map(settings.map((s) => [s.key, s.value]));
    if (map.has("showChatAssistant")) showChat = map.get("showChatAssistant") === "true";
    if (map.has("googleAnalyticsId")) gaId = map.get("googleAnalyticsId")!;
    if (map.has("googleAnalyticsEnabled")) gaEnabled = map.get("googleAnalyticsEnabled") === "true";
  } catch (error) {
    console.error("Error reading settings in RootLayout:", error);
  }

  // Klasa motywu jest ustawiana przez next-themes (ThemeProvider w Providers).
  // Nie hardkodujemy tu „dark", bo blokowałoby to przełącznik motywu.
  return (
    <html lang="pl" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${geistMono.variable} ${playfairDisplay.variable} selection:bg-primary/20 selection:text-foreground antialiased font-poppins`}
        suppressHydrationWarning
      >
        <GoogleAnalytics gaId={gaId} enabled={gaEnabled} />
        <Providers session={session}>
          <NextTopLoader
            color="var(--primary)"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px var(--primary), 0 0 5px var(--primary)"
          />
          {children}
          <Toaster />
          <Sonner />
          {showChat && <ChatAssistant />}
          <BugReportWidget />
          <CookieConsentBanner />
          <HotjarAnalytics />
        </Providers>
      </body>
    </html>
  )
}

