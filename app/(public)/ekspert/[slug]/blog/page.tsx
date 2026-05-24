import { Metadata } from "next"
import { prisma } from "@/lib/prisma"

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
        nazwaFirmy: true,
      },
    })

    if (!lawFirm) {
      return {
        title: "Blog Kancelarii | Prosta Sprawa",
      }
    }

    const displayName = lawFirm.nazwaFirmy || lawFirm.nazwa
    return {
      title: `Blog Kancelarii ${displayName} | Prosta Sprawa`,
      description: `Artykuły, porady prawne i analizy publikowane przez ekspertów z kancelarii ${displayName}.`,
    }
  } catch (error) {
    console.error("Error generating metadata for law firm blog:", error)
    return {
      title: "Blog Kancelarii | Prosta Sprawa",
    }
  }
}

export default function LawFirmBlogPage() {
  return <div>Blog Kancelarii</div>
}
