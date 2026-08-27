import { prisma } from "@/lib/prisma"
import type { MetadataRoute } from "next"

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: ChangeFrequency }[] = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/kategorie", priority: 0.8, changeFrequency: "daily" },
  { path: "/blog", priority: 0.7, changeFrequency: "daily" },
  { path: "/szukaj-prawnika", priority: 0.8, changeFrequency: "daily" },
  { path: "/ranking", priority: 0.6, changeFrequency: "weekly" },
  { path: "/jak-to-dziala", priority: 0.5, changeFrequency: "monthly" },
  { path: "/dla-prawnika", priority: 0.5, changeFrequency: "monthly" },
  { path: "/pomoc", priority: 0.4, changeFrequency: "monthly" },
  { path: "/kontakt", priority: 0.4, changeFrequency: "yearly" },
  { path: "/reklama", priority: 0.3, changeFrequency: "yearly" },
  { path: "/z-nami-wygrywasz", priority: 0.3, changeFrequency: "yearly" },
  { path: "/polityka-prywatnosci", priority: 0.2, changeFrequency: "yearly" },
  { path: "/regulamin", priority: 0.2, changeFrequency: "yearly" },
]

// Trasy pokrywane osobno przez katalog Page (DynamicPage pod /[slug]) — nie
// duplikujemy ich w STATIC_ROUTES, żeby nie było dwóch wpisów dla tego samego URL-a.
const RESERVED_SLUGS = new Set(STATIC_ROUTES.map((route) => route.path.replace(/^\//, "")))

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXTAUTH_URL || "").replace(/\/$/, "")

  const [categories, lawFirms, blogPosts, pages] = await Promise.all([
    prisma.category.findMany({
      where: { aktywna: true },
      select: {
        slug: true,
        updatedAt: true,
        parentId: true,
        parent: { select: { slug: true } },
      },
    }),
    prisma.lawFirm.findMany({
      where: { aktywna: true, zweryfikowana: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.blogPost.findMany({
      where: {
        opublikowany: true,
        OR: [{ dataPublikacji: null }, { dataPublikacji: { lte: new Date() } }],
      },
      select: { slug: true, updatedAt: true },
    }),
    prisma.page.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
  ])

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/kategorie/${category.parent ? `${category.parent.slug}/` : ""}${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly",
    priority: category.parentId ? 0.6 : 0.7,
  }))

  const expertEntries: MetadataRoute.Sitemap = lawFirms.map((lawFirm) => ({
    url: `${baseUrl}/ekspert/${lawFirm.slug}`,
    lastModified: lawFirm.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }))

  const pageEntries: MetadataRoute.Sitemap = pages
    .filter((page) => !RESERVED_SLUGS.has(page.slug))
    .map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: "monthly",
      priority: 0.4,
    }))

  return [...staticEntries, ...categoryEntries, ...expertEntries, ...blogEntries, ...pageEntries]
}
