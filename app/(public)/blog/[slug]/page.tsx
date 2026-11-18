import { getPublicBlogPostBySlug, getPublishedBlogPostSlugs, getRelatedBlogPosts } from "@/lib/blog-posts"
import { prisma } from "@/lib/prisma"
import { Metadata, ResolvingMetadata } from "next"
import { notFound } from "next/navigation"
import BlogPostView from "./BlogPostView"
import { pageTitle, stripSiteBrand } from "@/lib/page-title"
import { articleJsonLd, breadcrumbListJsonLd, faqPageJsonLd, absoluteUrl } from "@/lib/structured-data"
import { JsonLd } from "@/components/JsonLd"
import { extractFaqItems } from "@/lib/blog-faq"
import { blogCategoryPath } from "@/lib/blog-category-url"
import { getImageDimensions } from "@/lib/image-dimensions"

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

export async function generateMetadata({ params }: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublicBlogPostBySlug(slug)

  if (!post) {
    return {
      title: "Artykuł nie znaleziony",
    }
  }

  // Tytuł i opis z sekcji SEO wpisu (Meta tytuł / Meta opis), z fallbackiem jak dotąd.
  const rawTitle = post.metaTitle || `${post.tytul} | Blog`
  const plainTextDescription = getPlainDescription(post).trim() || undefined
  const ogTitle = stripSiteBrand(rawTitle)

  // Obrazek wyróżniający wpisu; bez niego zostaje domyślny obrazek OG z ustawień (layout).
  const parentMetadata = await parent
  const image = post.obrazekWyrozniajacy || undefined
  const imageSize = image ? await getImageDimensions(image) : null
  const ogImages = image
    ? [{ url: image, alt: ogTitle, ...(imageSize ?? {}) }]
    : parentMetadata.openGraph?.images
  const twitterImages = image ? [image] : parentMetadata.twitter?.images

  return {
    title: pageTitle(rawTitle, post.isUnpublished ? "[Podgląd] " : ""),
    description: plainTextDescription,
    openGraph: {
      type: "article",
      url: `/blog/${post.slug}`,
      title: ogTitle,
      description: plainTextDescription,
      siteName: parentMetadata.openGraph?.siteName,
      images: ogImages,
      publishedTime: post.dataPublikacji ? new Date(post.dataPublikacji).toISOString() : undefined,
      modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
      section: post.category?.nazwa ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: plainTextDescription,
      images: twitterImages,
    },
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

  // Ścieżka kategorii od najwyższego poziomu (jak okruszek na stronie wpisu)
  const categoryChain = post.category
    ? [post.category.parent?.parent, post.category.parent, post.category].filter(
        (cat): cat is NonNullable<typeof post.category> => Boolean(cat)
      )
    : []
  const faqItems = extractFaqItems(post.tresc ?? "")

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
      {!post.isUnpublished && (
        <JsonLd
          data={breadcrumbListJsonLd([
            { name: "Strona główna", path: "/" },
            { name: "Blog", path: "/blog" },
            ...categoryChain.flatMap((cat) => (cat.slug ? [{ name: cat.nazwa, path: blogCategoryPath(cat.slug) }] : [])),
            { name: post.tytul, path: `/blog/${post.slug}` },
          ])}
        />
      )}
      {!post.isUnpublished && faqItems.length > 0 && (
        <JsonLd data={faqPageJsonLd(absoluteUrl(`/blog/${post.slug}`), faqItems)} />
      )}
      <BlogPostView post={post} adsense={adsense} relatedPosts={relatedPosts} />
    </>
  )
}
