"use client";

import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";
import TeamExpertsSection from "@/components/TeamExpertsSection";
import type { Category } from "@/types/categories";
import type { LawFirm } from "@/types/lawfirms";
import { useSession } from "next-auth/react";

import { BenefitsSection } from "@/components/homepage/benefits-section";
import { CategoriesGrid } from "@/components/homepage/categories-grid";
import { HeroSection } from "@/components/homepage/hero-section";
import { SearchHelpSection } from "@/components/homepage/search-help-section";
import dynamic from "next/dynamic";

// Sekcje poniżej pierwszego ekranu ładujemy osobnymi chunkami — mniej JS na starcie strony.
const BusinessCategoriesGrid = dynamic(() => import("@/components/homepage/business-categories-grid").then((m) => m.BusinessCategoriesGrid));
const CitiesList = dynamic(() => import("@/components/homepage/cities-list").then((m) => m.CitiesList));
const VoivodeshipsList = dynamic(() => import("@/components/homepage/voivodeships-list").then((m) => m.VoivodeshipsList));
const ExpertCTA = dynamic(() => import("@/components/homepage/expert-cta").then((m) => m.ExpertCTA));
const HowItWorksSection = dynamic(() => import("@/components/homepage/how-it-works-section").then((m) => m.HowItWorksSection));
const LatestArticles = dynamic(() => import("@/components/homepage/latest-articles").then((m) => m.LatestArticles));
const MostConsultedCategories = dynamic(() => import("@/components/homepage/most-consulted-categories").then((m) => m.MostConsultedCategories));
const NewExperts = dynamic(() => import("@/components/homepage/new-experts").then((m) => m.NewExperts));
const NewsletterSection = dynamic(() => import("@/components/homepage/newsletter-section").then((m) => m.NewsletterSection));
const RecommendedLawyers = dynamic(() => import("@/components/homepage/recommended-lawyers").then((m) => m.RecommendedLawyers));
const VideoConsultationSection = dynamic(() => import("@/components/homepage/video-consultation-section").then((m) => m.VideoConsultationSection));
const SurveySection = dynamic(() => import("@/components/homepage/survey-section").then((m) => m.SurveySection));
const LocalSeoLinks = dynamic(() => import("@/components/seo/local-seo-links").then((m) => m.LocalSeoLinks));
const AnimatedTestimonials = dynamic(() => import("@/components/ui/animated-testimonials").then((m) => m.AnimatedTestimonials));

/** Odpowiedź /api/homepage-promotions — dane sekcji "Polecani" i "Najczęściej konsultowane". */
export type HomepagePromotions = {
  recommended: Record<string, LawFirm[]>;
  recommendedCategories?: { id: string; nazwa: string; descendantIds?: string[] }[];
  consulted: Record<string, LawFirm[]>;
  consultedCategoryIds?: string[];
};

export interface HomePageClientProps {
  categories: Category[];
  lawFirms: LawFirm[];
  newLawFirms: LawFirm[];
  blogPosts: any[];
  testimonials: any[];
  homepagePromotions: HomepagePromotions | null;
}

// Dane przychodzą z serwera (app/page.tsx), więc komponent nie wysyła żadnych żądań po starcie.
export default function HomePageClient({
  categories,
  lawFirms,
  newLawFirms,
  blogPosts,
  testimonials,
  homepagePromotions,
}: HomePageClientProps) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen">
      <PublicHeader
        isAuthenticated={!!session}
        userRole={session?.user?.role as "CLIENT" | "LAW_FIRM" | "ADMIN" | "MODERATOR" | null}
        userName={session?.user?.name}
        userImage={session?.user?.image}
      />

      {/* SECTION 1: Hero Section */}
      <HeroSection />

      {/* SECTION 2: Benefits Icons */}
      <BenefitsSection />

      {/* SECTION 3: How It Works */}
      <SearchHelpSection />

      {/* SECTION 4: Categories Grid */}
      <CategoriesGrid categories={categories} />

      {/* SECTION 4B: Business Categories Grid */}
      <BusinessCategoriesGrid categories={categories} />

      {/* SECTION 5: Recommended Lawyers */}
      <RecommendedLawyers
        recommendedData={homepagePromotions?.recommended}
        recommendedCategories={homepagePromotions?.recommendedCategories}
        lawFirms={lawFirms}
      />

      {/* SECTION 6: Most Consulted Categories */}
      <MostConsultedCategories
        consultedData={homepagePromotions?.consulted}
        consultedCategoryIds={homepagePromotions?.consultedCategoryIds}
        categories={categories}
        lawFirms={lawFirms}
      />

      {/* SECTION 7: Expert CTA with Background */}
      <ExpertCTA />

      {/* SECTION 8: New Experts */}
      <NewExperts newLawFirms={newLawFirms} />


      {/* SECTION 8.5: Video Consultations */}
      <VideoConsultationSection />

      {/* SECTION 9: How It Works */}
      <HowItWorksSection />

      {/* SECTION 10: Latest Articles */}
      <LatestArticles blogPosts={blogPosts} />

      {/* SECTION 11: Voivodeships List */}
      <VoivodeshipsList />

      {/* SECTION 11.5: Cities List */}
      <CitiesList />

      {/* SECTION 11.6: Local SEO Links */}
      <LocalSeoLinks seed="homepage" />

      {/* SECTION 11.5: Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-0 lg:py-15 bg-card border-t border-border/60 overflow-hidden">
          <div className="container mx-auto px-4 max-w-8xl relative">
            <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
          </div>
        </section>
      )}

      {/* SECTION 11.7: Survey for experts */}
      <SurveySection isExpert={session?.user?.role === "LAW_FIRM"} />

      {/* SECTION 12: Newsletter */}
      <NewsletterSection />

      <TeamExpertsSection />

      <PublicFooter />
    </div>
  );
}
