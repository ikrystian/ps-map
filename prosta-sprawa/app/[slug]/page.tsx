import { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { renderModule } from "@/lib/module-parser"

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

  return pages.map((page) => ({
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

  return (
    <div className="min-h-screen">
      {/* Page Title (optional, you can style this or remove it) */}
      <div className="sr-only">
        <h1>{page.title}</h1>
      </div>

      {/* Render page modules */}
      <div className="page-content">
        {page.modules.map((pageModule) => {
          const data = pageModule.data ? JSON.parse(pageModule.data) : {}

          // Handle EDITABLE_HTML modules differently
          let html: string
          if (pageModule.module.type === 'EDITABLE_HTML') {
            // For EDITABLE_HTML, use the edited HTML from data or fallback to original code
            html = data.html || pageModule.module.code
          } else {
            // For TEMPLATE modules, use the parser to replace placeholders
            html = renderModule(pageModule.module.code, data)
          }

          return (
            <div
              key={pageModule.id}
              className="page-module"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )
        })}
      </div>

      {page.modules.length === 0 && (
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Ta strona nie ma jeszcze żadnej zawartości.</p>
        </div>
      )}
    </div>
  )
}
