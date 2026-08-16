import { DynamicPageContent } from "@/components/DynamicPageContent"
import { LocalSeoLinks } from "@/components/seo/local-seo-links"
import { ResponsiveBreadcrumbs } from "@/components/ui/responsive-breadcrumbs"
import { renderModule } from "@/lib/module-parser"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  const page = await prisma.page.findFirst({
    where: {
      slug,
      published: true,
    },
  })

  if (!page) {
    return {
      title: "Strona nie znaleziona",
    }
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
  }
}

// Generate static params for published pages
export async function generateStaticParams() {
  const pages = await prisma.page.findMany({
    where: {
      published: true,
    },
    select: {
      slug: true,
    },
  })

  return pages.map((page: { slug: string }) => ({
    slug: page.slug,
  }))
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params

  const page = await prisma.page.findFirst({
    where: {
      slug,
      published: true,
    },
    include: {
      modules: {
        include: {
          module: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  })

  if (!page) {
    notFound()
  }

  // Pre-render module HTML on the server
  const modulesHtml = page.modules.map((pageModule: any) => {
    const data = pageModule.data && pageModule.data.trim() ? JSON.parse(pageModule.data) : {}

    if (pageModule.module.type === 'EDITABLE_HTML') {
      return data.html || pageModule.module.code
    } else {
      return renderModule(pageModule.module.code, data)
    }
  })

  return (
    <div className="min-h-screen bg-background-sec text-foreground/80">
      {/* Breadcrumbs Banner */}
      <div
        id="breadcrumbs-banner"
        className="relative w-full h-32 md:h-[140px] flex items-center bg-cover bg-center overflow-hidden border-b border-border/60"
        style={{ backgroundImage: "url('/images/lady-justice-banner.png')" }}
      >
        {/* Przesłona z tokenu tła, nie z czerni: w jasnym motywie rozjaśnia
            zdjęcie (breadcrumby są wtedy ciemne), w ciemnym przyciemnia je tak
            jak wcześniej. Dzięki temu baner wtapia się w stronę zamiast być
            czarnym pasem doklejonym do jasnej treści. */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/40" />
        <div className="absolute inset-0 bg-background/10" />
        <div className="container mx-auto px-4 relative z-10">
          <ResponsiveBreadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: page.title },
            ]}
          />
        </div>
      </div>

      {/* Page Title (optional, styled or visually hidden) */}
      <div className="sr-only">
        <h1>{page.title}</h1>
      </div>

      {/* Render page modules using dynamic interactive content component */}
      <DynamicPageContent modulesHtml={modulesHtml} />

      {/* Linki SEO — różne na każdej stronie statycznej (seed = slug) */}
      <LocalSeoLinks seed={`page-${slug}`} />
    </div>
  )
}
