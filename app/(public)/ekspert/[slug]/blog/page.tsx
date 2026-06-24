import { prisma } from "@/lib/prisma"
import { Metadata } from "next"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { slug },
      select: {
        nazwa: true,
        nazwa: true,
      },
    })

    if (!lawFirm) {
      return {
        title: "Blog Eksperta | Prosta Sprawa",
      }
    }

    const displayName = lawFirm.nazwa || lawFirm.nazwa
    return {
      title: `Blog Eksperta ${displayName} | Prosta Sprawa`,
      description: `Artykuły, porady prawne i analizy publikowane przez ekspertów z eksperta ${displayName}.`,
    }
  } catch (error) {
    console.error("Error generating metadata for law firm blog:", error)
    return {
      title: "Blog Eksperta | Prosta Sprawa",
    }
  }
}

export default function LawFirmBlogPage() {
  return <div>Blog Eksperta</div>
}
