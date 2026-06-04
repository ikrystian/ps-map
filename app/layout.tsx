import { auth } from "@/auth";
import { ChatAssistant } from "@/components/ChatAssistant";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Geist_Mono, Playfair_Display, Poppins } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { ConsentManager } from "./consent-manager";
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

export const metadata: Metadata = {
  title: "Prosta Sprawa - Platforma łącząca klientów z ekspertami prawnymi",
  description: "Znajdź prawnika lub eksperta prawnego w Twojej okolicy. Porównaj oferty i ceny usług prawnych.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="pl" suppressHydrationWarning className="dark">
      <body
        className={`${poppins.variable} ${geistMono.variable} ${playfairDisplay.variable} antialiased`}
        suppressHydrationWarning
      >
        <ConsentManager>

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
            <ChatAssistant />
          </Providers>

        </ConsentManager>
      </body>
    </html>
  )
}
