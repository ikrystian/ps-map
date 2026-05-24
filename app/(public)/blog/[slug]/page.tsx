import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import BlogPostClientPage from "./BlogPostClientPage"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const post = await prisma.blogPost.findUnique({
      where: {
        slug,
      },
      select: {
        tytul: true,
        tresc: true,
        metaTitle: true,
        metaDescription: true,
      },
    })

    if (!post) {
      return {
        title: "Artykuł nie znaleziony | Prosta Sprawa",
      }
    }

    const title = post.metaTitle || `${post.tytul} | Blog Prosta Sprawa`
    const plainTextDescription = post.metaDescription || post.tresc.replace(/<[^>]*>/g, "").substring(0, 160)

    return {
      title,
      description: plainTextDescription || undefined,
    }
  } catch (error) {
    console.error("Error generating metadata for blog post:", error)
    return {
      title: "Blog | Prosta Sprawa",
    }
  }
}

export default function BlogPostPage() {
  return <BlogPostClientPage />
}
