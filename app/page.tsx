"use client";

import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";
import TeamExpertsSection from "@/components/TeamExpertsSection";
import type { Category } from "@/types/categories";
import type { LawFirm } from "@/types/lawfirms";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { BenefitsSection } from "@/components/homepage/benefits-section";
import { BusinessCategoriesGrid } from "@/components/homepage/business-categories-grid";
import { CategoriesGrid } from "@/components/homepage/categories-grid";
import { CitiesList } from "@/components/homepage/cities-list";
import { VoivodeshipsList } from "@/components/homepage/voivodeships-list";
import { ExpertCTA } from "@/components/homepage/expert-cta";
import { HeroSection } from "@/components/homepage/hero-section";
import { HowItWorksSection } from "@/components/homepage/how-it-works-section";
import { LatestArticles } from "@/components/homepage/latest-articles";
import { MostConsultedCategories } from "@/components/homepage/most-consulted-categories";
import { NewExperts } from "@/components/homepage/new-experts";
import { NewsletterSection } from "@/components/homepage/newsletter-section";
import { RecommendedLawyers } from "@/components/homepage/recommended-lawyers";
import { SearchHelpSection } from "@/components/homepage/search-help-section";
import { LocalSeoLinks } from "@/components/seo/local-seo-links";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export default function HomePage() {
  const { data: session } = useSession();
  const [lawFirms, setLawFirms] = useState<LawFirm[]>([]);
  const [newLawFirms, setNewLawFirms] = useState<LawFirm[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [homepagePromotions, setHomepagePromotions] = useState<{
    recommended: Record<string, LawFirm[]>;
    consulted: Record<string, LawFirm[]>;
    consultedCategoryIds?: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured law firms
        const firmsResponse = await fetch(
          "/api/law-firms?limit=15&verifiedOnly=true",
        );
        if (firmsResponse.ok) {
          const firmsData = await firmsResponse.json();
          setLawFirms(firmsData.lawFirms);
        }

        // Fetch new law firms
        const newFirmsResponse = await fetch("/api/law-firms?limit=8");
        if (newFirmsResponse.ok) {
          const newFirmsData = await newFirmsResponse.json();
          setNewLawFirms(newFirmsData.lawFirms);
        }

        // Fetch categories
        const categoriesResponse = await fetch("/api/categories");
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.filter((cat: Category) => cat.aktywna));
        }

        // Fetch recent blog posts
        const blogResponse = await fetch("/api/blog/posts?limit=4");
        if (blogResponse.ok) {
          const blogData = await blogResponse.json();
          setBlogPosts(blogData.posts || []);
        }

        // Fetch homepage promotions
        const promotionsResponse = await fetch("/api/homepage-promotions");
        if (promotionsResponse.ok) {
          const promotionsData = await promotionsResponse.json();
          setHomepagePromotions(promotionsData);
        }

        // Fetch public testimonials
        const testimonialsResponse = await fetch("/api/testimonials");
        if (testimonialsResponse.ok) {
          const testimonialsData = await testimonialsResponse.json();
          setTestimonials(testimonialsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      <PublicHeader
        isAuthenticated={!!session}
        userRole={session?.user?.role as "CLIENT" | "LAW_FIRM" | "ADMIN" | null}
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

      {/* SECTION 9: How It Works */}
      <HowItWorksSection />

      {/* SECTION 10: Latest Articles */}
      <LatestArticles blogPosts={blogPosts} />

      {/* SECTION 11: Voivodeships List */}
      <VoivodeshipsList />

      {/* SECTION 11.5: Cities List */}
      <CitiesList />
      {/* SECTION 11.5: Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-0 lg:py-15 bg-card border-t border-zinc-900/60 overflow-hidden">
          <div className="container mx-auto px-4 max-w-8xl relative">
            <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
          </div>
        </section>
      )}

      {/* SECTION 12: Newsletter */}
      <NewsletterSection />

      {/* SECTION 11.6: Local SEO Links (kategoria + lokalizacja) */}
      <LocalSeoLinks seed="home" />

      <TeamExpertsSection />

      <PublicFooter />
    </div>
  );
}
