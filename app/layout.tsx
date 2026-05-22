import type { Metadata } from "next";
import { Poppins, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ConsentManager } from "./consent-manager";
import { ChatAssistant } from "@/components/ChatAssistant";

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
      >
        <ConsentManager>

          <Providers session={session}>
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
