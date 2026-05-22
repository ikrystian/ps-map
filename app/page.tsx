"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import PublicHeader from "@/components/PublicHeader"
import PublicFooter from "@/components/PublicFooter"
import type { LawFirm } from "@/types/lawfirms"
import type { Category } from "@/types/categories"

import { HeroSection } from "@/components/homepage/hero-section"
import { BenefitsSection } from "@/components/homepage/benefits-section"
import { SearchHelpSection } from "@/components/homepage/search-help-section"
import { HowItWorksSection } from "@/components/homepage/how-it-works-section"
import { CategoriesGrid } from "@/components/homepage/categories-grid"
import { BusinessCategoriesGrid } from "@/components/homepage/business-categories-grid"
import { RecommendedLawyers } from "@/components/homepage/recommended-lawyers"
import { MostConsultedCategories } from "@/components/homepage/most-consulted-categories"
import { ExpertCTA } from "@/components/homepage/expert-cta"
import { NewExperts } from "@/components/homepage/new-experts"
import { HowItWorksPlatform } from "@/components/homepage/how-it-works-platform"
import { LatestArticles } from "@/components/homepage/latest-articles"
import { CitiesList } from "@/components/homepage/cities-list"
import { NewsletterSection } from "@/components/homepage/newsletter-section"

export default function HomePage() {
  const { data: session } = useSession()
  const [lawFirms, setLawFirms] = useState<LawFirm[]>([])
  const [newLawFirms, setNewLawFirms] = useState<LawFirm[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [blogPosts, setBlogPosts] = useState<any[]>([])
  const [homepagePromotions, setHomepagePromotions] = useState<{
    recommended: Record<string, LawFirm[]>
    consulted: Record<string, LawFirm[]>
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured law firms
        const firmsResponse = await fetch("/api/law-firms?limit=6&verifiedOnly=true")
        if (firmsResponse.ok) {
          const firmsData = await firmsResponse.json()
          setLawFirms(firmsData.lawFirms)
        }

        // Fetch new law firms
        const newFirmsResponse = await fetch("/api/law-firms?limit=8")
        if (newFirmsResponse.ok) {
          const newFirmsData = await newFirmsResponse.json()
          setNewLawFirms(newFirmsData.lawFirms)
        }

        // Fetch categories
        const categoriesResponse = await fetch("/api/categories")
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.filter((cat: Category) => cat.aktywna))
        }

        // Fetch recent blog posts
        const blogResponse = await fetch("/api/blog/posts?limit=3")
        if (blogResponse.ok) {
          const blogData = await blogResponse.json()
          setBlogPosts(blogData.posts || [])
        }

        // Fetch homepage promotions
        const promotionsResponse = await fetch("/api/homepage-promotions")
        if (promotionsResponse.ok) {
          const promotionsData = await promotionsResponse.json()
          setHomepagePromotions(promotionsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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
      <RecommendedLawyers recommendedData={homepagePromotions?.recommended} lawFirms={lawFirms} />

      {/* SECTION 6: Most Consulted Categories */}
      <MostConsultedCategories consultedData={homepagePromotions?.consulted} categories={categories} lawFirms={lawFirms} />

      {/* SECTION 7: Expert CTA with Background */}
      <ExpertCTA />

      {/* SECTION 8: New Experts */}
      <NewExperts newLawFirms={newLawFirms} />

      {/* SECTION 9: How It Works */}
      <HowItWorksSection />

      {/* SECTION 10: Latest Articles */}
      <LatestArticles blogPosts={blogPosts} />

      {/* SECTION 11: Cities List */}
      <CitiesList />

      {/* SECTION 12: Newsletter */}
      <NewsletterSection />

      <PublicFooter />
    </div>
  )
}
