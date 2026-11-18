import ComingSoon from "@/components/coming-soon/coming-soon";
import { JsonLd } from "@/components/JsonLd";
import HomePageClient, { type HomepagePromotions } from "@/components/homepage/home-page-client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { organizationJsonLd } from "@/lib/structured-data";
import type { Category } from "@/types/categories";
import type { LawFirm } from "@/types/lawfirms";
import { NextRequest } from "next/server";

import { GET as getCategories } from "@/app/api/categories/route";
import { GET as getHomepagePromotions } from "@/app/api/homepage-promotions/route";
import { GET as getLawFirms } from "@/app/api/law-firms/route";
import { GET as getBlogPosts } from "@/app/api/blog/posts/route";
import { GET as getTestimonials } from "@/app/api/testimonials/route";

// Ustawienie "coming soon" odczytywane przy każdym żądaniu
export const dynamic = "force-dynamic";

type RouteHandler = (request: NextRequest) => Promise<Response>;

/**
 * Dane strony głównej pobieramy na serwerze, zanim HTML trafi do przeglądarki — zamiast
 * sześciu żądań po zamontowaniu klienta (wcześniej: najpierw JS, potem dane, a LCP czekał).
 * Wywołujemy te same handlery co endpointy API, więc kształt danych się nie zmienia.
 * Błąd jednego źródła nie blokuje strony — wtedy dostaje wartość zastępczą.
 */
async function loadFromRoute<T>(handler: RouteHandler, path: string, fallback: T): Promise<T> {
  try {
    const response = await handler(new NextRequest(new URL(path, "http://localhost")));
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Homepage data ${path}:`, error);
    return fallback;
  }
}

async function loadHomepageData() {
  const [categories, lawFirmsData, newLawFirmsData, blogData, homepagePromotions, testimonials] = await Promise.all([
    loadFromRoute<Category[]>(getCategories, "/api/categories?compact=1", []),
    loadFromRoute<{ lawFirms: LawFirm[] }>(getLawFirms, "/api/law-firms?limit=15&verifiedOnly=true", { lawFirms: [] }),
    loadFromRoute<{ lawFirms: LawFirm[] }>(getLawFirms, "/api/law-firms?limit=8", { lawFirms: [] }),
    loadFromRoute<{ posts?: unknown[] }>(getBlogPosts, "/api/blog/posts?limit=4", { posts: [] }),
    loadFromRoute<HomepagePromotions | null>(getHomepagePromotions, "/api/homepage-promotions", null),
    loadFromRoute<unknown[]>(getTestimonials, "/api/testimonials", []),
  ]);

  return {
    categories: categories.filter((cat) => cat.aktywna),
    lawFirms: lawFirmsData.lawFirms ?? [],
    newLawFirms: newLawFirmsData.lawFirms ?? [],
    blogPosts: blogData.posts ?? [],
    homepagePromotions,
    testimonials,
  };
}

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

  const homepageData = await loadHomepageData();

  return (
    <>
      <JsonLd data={organizationJsonLd({ socialUrls })} />
      <HomePageClient {...homepageData} />
    </>
  );
}
