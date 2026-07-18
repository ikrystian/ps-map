import { auth } from "@/auth";
import { ChatAssistant } from "@/components/ChatAssistant";
import CookieConsentBanner from "@/components/CookieConsent";
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

  return {
    title: {
      default: ogTitle,
      template: `%s | ${siteName}`,
    },
    description: ogDescription,
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      siteName: siteName,
      images: ogImage ? [{ url: ogImage }] : [],
      type: "website",
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
  try {
    const chatSetting = await prisma.settings.findUnique({
      where: { key: "showChatAssistant" },
    });
    if (chatSetting) {
      showChat = chatSetting.value === "true";
    }
  } catch (error) {
    console.error("Error reading showChatAssistant setting:", error);
  }

  return (
    <html lang="pl" suppressHydrationWarning className="dark cc--darkmode">
      <body
        className={`${poppins.variable} ${geistMono.variable} ${playfairDisplay.variable} selection:bg-primary/20 selection:text-primary-foreground antialiased font-poppins`}
        suppressHydrationWarning
      >
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
          <CookieConsentBanner />
        </Providers>
      </body>
    </html>
  )
}
