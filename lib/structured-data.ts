/**
 * Dane strukturalne schema.org (JSON-LD) dla wyników rozszerzonych w wyszukiwarce.
 * Renderowane komponentem `components/JsonLd.tsx`.
 *
 * Adresy są bezwzględne i liczone od NEXTAUTH_URL — tak jak w app/sitemap.ts,
 * żeby JSON-LD i sitemap wskazywały te same URL-e.
 */
import { COMPANY } from "@/lib/company"

const FALLBACK_SITE_URL = "https://prostasprawa.pl"

export function getSiteUrl(): string {
  return (process.env.NEXTAUTH_URL || FALLBACK_SITE_URL).replace(/\/$/, "")
}

/** Zamienia ścieżkę lub URL względny na bezwzględny; URL-e zewnętrzne zostawia bez zmian. */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `${getSiteUrl()}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`
}

const ORGANIZATION_ID = () => `${getSiteUrl()}/#organization`

/** Profil społecznościowy nadaje się do `sameAs` tylko, gdy wskazuje konkretne konto (nie samą domenę serwisu). */
function isSocialProfileUrl(url: string): boolean {
  try {
    const { pathname } = new URL(url)
    return pathname.replace(/\/+$/, "").length > 0
  } catch {
    return false
  }
}

export function organizationJsonLd(options: { socialUrls?: Array<string | null | undefined> } = {}) {
  const sameAs = (options.socialUrls ?? []).filter(
    (url): url is string => Boolean(url) && isSocialProfileUrl(url as string)
  )

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID(),
    name: COMPANY.brand,
    legalName: COMPANY.name,
    url: getSiteUrl(),
    logo: absoluteUrl("/logo-color.svg"),
    email: COMPANY.email,
    telephone: COMPANY.phone,
    taxID: COMPANY.nip,
    identifier: { "@type": "PropertyValue", propertyID: "KRS", value: COMPANY.krs },
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.street,
      postalCode: COMPANY.postalCode,
      addressLocality: COMPANY.city,
      addressCountry: "PL",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: COMPANY.email,
      telephone: COMPANY.phone,
      areaServed: "PL",
      availableLanguage: "pl",
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }
}

/** Wydawca artykułów — odwołanie do Organization ze strony głównej plus dane wymagane przez Article. */
function publisherJsonLd() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID(),
    name: COMPANY.brand,
    url: getSiteUrl(),
    logo: { "@type": "ImageObject", url: absoluteUrl("/logo-color.svg") },
  }
}

export function articleJsonLd(post: {
  slug: string
  tytul: string
  description?: string | null
  obrazekWyrozniajacy?: string | null
  dataPublikacji?: Date | string | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
  categoryName?: string | null
  author?: { nazwa?: string | null; slug?: string | null } | null
}) {
  const url = absoluteUrl(`/blog/${post.slug}`)
  const published = post.dataPublikacji ?? post.createdAt
  const modified = post.updatedAt ?? published
  const author = post.author?.nazwa && post.author.slug ? post.author : null

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    // Google obcina headline powyżej 110 znaków
    headline: post.tytul.length > 110 ? `${post.tytul.slice(0, 109).trimEnd()}…` : post.tytul,
    ...(post.description ? { description: post.description } : {}),
    ...(post.obrazekWyrozniajacy ? { image: [absoluteUrl(post.obrazekWyrozniajacy)] } : {}),
    ...(published ? { datePublished: new Date(published).toISOString() } : {}),
    ...(modified ? { dateModified: new Date(modified).toISOString() } : {}),
    ...(post.categoryName ? { articleSection: post.categoryName } : {}),
    inLanguage: "pl-PL",
    author: author
      ? { "@type": "Organization", name: author.nazwa, url: absoluteUrl(`/ekspert/${author.slug}`) }
      : { "@type": "Organization", name: `Redakcja ${COMPANY.brand}`, url: getSiteUrl() },
    publisher: publisherJsonLd(),
  }
}

export function breadcrumbListJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
