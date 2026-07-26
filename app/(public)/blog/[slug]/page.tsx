import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
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
        opublikowany: true,
        dataPublikacji: true,
        lawFirmId: true,
      },
    })

    if (!post) {
      return {
        title: "Artykuł nie znaleziony",
      }
    }

    const isUnpublished = !post.opublikowany || (post.dataPublikacji && post.dataPublikacji > new Date())
    if (isUnpublished) {
      const session = await auth()
      let isAuthor = false

      if (session?.user) {
        if (session.user.role === "ADMIN") {
          isAuthor = true
        } else if (session.user.role === "LAW_FIRM") {
          const lawFirm = await prisma.lawFirm.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
          })
          if (lawFirm && post.lawFirmId === lawFirm.id) {
            isAuthor = true
          }
        }
      }

      if (!isAuthor) {
        return {
          title: "Artykuł nie znaleziony",
        }
      }
    }

    const title = post.metaTitle || `${post.tytul} | Blog Prosta Sprawa`
    const plainTextDescription = post.metaDescription || post.tresc.replace(/<[^>]*>/g, "").substring(0, 160)

    return {
      title: isUnpublished ? `[Podgląd] ${title}` : title,
      description: plainTextDescription || undefined,
    }
  } catch (error) {
    console.error("Error generating metadata for blog post:", error)
    return {
      title: "Blog",
    }
  }
}

export default function BlogPostPage() {
  return <BlogPostClientPage />
}
