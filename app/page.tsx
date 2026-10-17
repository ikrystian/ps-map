import ComingSoon from "@/components/coming-soon/coming-soon";
import { JsonLd } from "@/components/JsonLd";
import HomePageClient from "@/components/homepage/home-page-client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { organizationJsonLd } from "@/lib/structured-data";

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

  // Profile społecznościowe ze stopki (Ustawienia admina) trafiają do `sameAs`
  let socialUrls: string[] = [];
  try {
    const socialSettings = await prisma.settings.findMany({
      where: {
        key: {
          in: [
            "footerSocialFacebook",
            "footerSocialInstagram",
            "footerSocialLinkedin",
            "footerSocialTwitter",
            "footerSocialYoutube",
          ],
        },
      },
    });
    socialUrls = socialSettings.map((setting) => setting.value);
  } catch (error) {
    console.error("Error reading social links for Organization JSON-LD:", error);
  }

  return (
    <>
      <JsonLd data={organizationJsonLd({ socialUrls })} />
      <HomePageClient />
    </>
  );
}
