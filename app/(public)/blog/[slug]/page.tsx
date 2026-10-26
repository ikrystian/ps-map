import { getPublicBlogPostBySlug, getPublishedBlogPostSlugs, getRelatedBlogPosts } from "@/lib/blog-posts"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import BlogPostView from "./BlogPostView"
import { pageTitle } from "@/lib/page-title"
import { articleJsonLd } from "@/lib/structured-data"
import { JsonLd } from "@/components/JsonLd"

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

function getPlainDescription(post: { metaDescription?: string | null; tresc?: string | null }) {
  return post.metaDescription || (post.tresc ?? "").replace(/<[^>]*>/g, "").substring(0, 160)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublicBlogPostBySlug(slug)

  if (!post) {
    return {
      title: "Artykuł nie znaleziony",
    }
  }

  const rawTitle = post.metaTitle || `${post.tytul} | Blog`
  const plainTextDescription = getPlainDescription(post)

  return {
    title: pageTitle(rawTitle, post.isUnpublished ? "[Podgląd] " : ""),
    description: plainTextDescription || undefined,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPublicBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const relatedPostsPromise = getRelatedBlogPosts(post).catch((error) => {
    console.error("Error fetching related blog posts:", error)
    return []
  })

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

  const relatedPosts = await relatedPostsPromise

  return (
    <>
      {/* Podglądu szkicu nie opisujemy dla wyszukiwarek */}
      {!post.isUnpublished && (
        <JsonLd
          data={articleJsonLd({
            slug: post.slug,
            tytul: post.tytul,
            description: getPlainDescription(post).trim() || null,
            obrazekWyrozniajacy: post.obrazekWyrozniajacy,
            dataPublikacji: post.dataPublikacji,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            categoryName: post.category?.nazwa ?? null,
            author: post.lawFirm ? { nazwa: post.lawFirm.nazwa, slug: post.lawFirm.slug } : null,
          })}
        />
      )}
      <BlogPostView post={post} adsense={adsense} relatedPosts={relatedPosts} />
    </>
  )
}
