import { ResponsiveBreadcrumbs } from "@/components/ui/responsive-breadcrumbs"
import { getPublicHelpCategories } from "@/lib/help"
import { Metadata } from "next"
import PomocClientPage from "./PomocClientPage"

export const metadata: Metadata = {
  title: "Centrum Pomocy - Najczęściej Zadawane Pytania (FAQ)",
  description:
    "Odpowiedzi na najczęściej zadawane pytania o Prosta Sprawa - dodawanie sprawy, wybór eksperta, płatności i konto. Nie znalazłeś odpowiedzi? Skontaktuj się z nami.",
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

export default async function PomocPage() {
  const categories = await getPublicHelpCategories()

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: categories.flatMap((category) =>
      category.questions.map((question) => ({
        "@type": "Question",
        name: question.pytanie,
        acceptedAnswer: {
          "@type": "Answer",
          text: stripHtml(question.odpowiedz),
        },
      }))
    ),
  }

  return (
    <div className="min-h-screen bg-background-sec text-foreground/80">
      {/* JSON-LD dla wyników rozszerzonych FAQ w wyszukiwarce */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Breadcrumbs Banner — spójny z innymi stronami treściowymi ([slug]) */}
      <div
        id="breadcrumbs-banner"
        className="relative w-full h-32 md:h-[140px] flex items-center bg-cover bg-center overflow-hidden border-b border-border/60"
        style={{ backgroundImage: "url('/images/lady-justice-banner.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/40" />
        <div className="absolute inset-0 bg-background/10" />
        <div className="container mx-auto px-4 relative z-10">
          <ResponsiveBreadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Centrum pomocy" }]}
          />
        </div>
      </div>

      <PomocClientPage categories={categories} />
    </div>
  )
}
