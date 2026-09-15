import { getPublicBlogPostBySlug, getPublishedBlogPostSlugs } from "@/lib/blog-posts"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import BlogPostClientPage from "./BlogPostClientPage"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Rewalidacja co godzinę — nowe/edytowane wpisy pojawiają się bez pełnego
// redeployu, a znane sloty pozostają w większości serwowane statycznie.
export const revalidate = 3600

// Statycznie generujemy dokładnie te same sloty, które trafiają do
// sitemap.xml (patrz getPublishedBlogPostSlugs) — treść artykułu i jego
// wpis w sitemapie powstają więc z tego samego zapytania i tej samej
// generacji builda. Sloty spoza tej listy (podgląd szkicu) renderują się
// on-demand przy pierwszym żądaniu.
export async function generateStaticParams() {
  const posts = await getPublishedBlogPostSlugs()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublicBlogPostBySlug(slug)

  if (!post) {
    return {
      title: "Artykuł nie znaleziony",
    }
  }

  const title = post.metaTitle || `${post.tytul} | Blog Prosta Sprawa`
  const plainTextDescription =
    post.metaDescription || (post.tresc ?? "").replace(/<[^>]*>/g, "").substring(0, 160)

  return {
    title: post.isUnpublished ? `[Podgląd] ${title}` : title,
    description: plainTextDescription || undefined,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPublicBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  let adsense = {
    enabled: false,
    clientId: "",
    slotTop: "",
    slotBottom: "",
    slotSidebar: "",
  }

  try {
    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: [
            "adsenseEnabled",
            "adsensePublisherId",
            "adsenseBlogPostSlotTop",
            "adsenseBlogPostSlotBottom",
            "adsenseBlogPostSlotSidebar",
          ],
        },
      },
    })
    const map = new Map(settings.map((s) => [s.key, s.value]))
    adsense = {
      enabled: map.get("adsenseEnabled") === "true",
      clientId: map.get("adsensePublisherId") || "",
      slotTop: map.get("adsenseBlogPostSlotTop") || "",
      slotBottom: map.get("adsenseBlogPostSlotBottom") || "",
      slotSidebar: map.get("adsenseBlogPostSlotSidebar") || "",
    }
  } catch (error) {
    console.error("Error reading AdSense settings for blog post:", error)
  }

  return <BlogPostClientPage post={post} adsense={adsense} />
}
