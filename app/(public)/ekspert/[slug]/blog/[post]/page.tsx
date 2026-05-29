import { prisma } from "@/lib/prisma"
import { Metadata } from "next"

interface PageProps {
  params: Promise<{
    slug: string
    post: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, post: postSlug } = await params

  try {
    const post = await prisma.blogPost.findFirst({
      where: {
        slug: postSlug,
      },
      include: {
        lawFirm: {
          select: {
            nazwa: true,
            nazwaFirmy: true,
          }
        }
      }
    })

    if (!post) {
      return {
        title: "Artykuł nie znaleziony | Prosta Sprawa",
      }
    }

    const firmName = post.lawFirm?.nazwaFirmy || post.lawFirm?.nazwa || "Kancelarii"
    const plainTextDescription = post.tresc.replace(/<[^>]*>/g, "").substring(0, 160)

    return {
      title: post.metaTitle || `${post.tytul} - Blog Kancelarii ${firmName} | Prosta Sprawa`,
      description: post.metaDescription || plainTextDescription || undefined,
    }
  } catch (error) {
    console.error("Error generating metadata for law firm blog post:", error)
    return {
      title: "Wpis na Blogu | Prosta Sprawa",
    }
  }
}

export default function LawFirmBlogPostPage() {
  return <div>Wpis na blogu</div>
}
