import ComingSoon from "@/components/coming-soon/coming-soon";
import HomePageClient from "@/components/homepage/home-page-client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Ustawienie "coming soon" odczytywane przy każdym żądaniu
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let comingSoonMode = false;

  try {
    const setting = await prisma.settings.findUnique({
      where: { key: "comingSoonMode" },
    });
    comingSoonMode = setting?.value === "true";
  } catch (error) {
    console.error("Error reading comingSoonMode setting:", error);
  }

  if (comingSoonMode) {
    // Zalogowani użytkownicy mają zawsze dostęp, niezależnie od trybu "coming soon"
    const session = await auth();
    if (!session?.user) {
      return <ComingSoon />;
    }
  }

  return <HomePageClient />;
}
