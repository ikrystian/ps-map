import ComingSoon from "@/components/coming-soon/coming-soon";
import HomePageClient from "@/components/homepage/home-page-client";
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
    return <ComingSoon />;
  }

  return <HomePageClient />;
}
