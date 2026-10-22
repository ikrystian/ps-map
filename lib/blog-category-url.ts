/**
 * Adresy kategorii bloga: /blog/kategoria/{slug}.
 * Prefiks „kategoria” oddziela je od wpisów (/blog/{slug}), więc slug kategorii może
 * pokrywać się ze slugiem wpisu. Slugi kategorii są unikalne, dlatego adres jest płaski —
 * nie zależy od położenia w hierarchii i nie zmienia się po przeniesieniu kategorii.
 *
 * Bez importów serwerowych — używane także w komponentach klienckich.
 */
export const BLOG_CATEGORY_BASE_PATH = "/blog/kategoria"

const BLOG_CATEGORY_PATH_RE = /^\/blog\/kategoria\/([^/]+)\/?$/

export function blogCategoryPath(slug: string): string {
  return `${BLOG_CATEGORY_BASE_PATH}/${encodeURIComponent(slug)}`
}

/** Adres listingu bloga z opcjonalną kategorią i tagiem (tag zostaje parametrem zapytania). */
export function blogListingPath(categorySlug?: string | null, tag?: string | null): string {
  const path = categorySlug ? blogCategoryPath(categorySlug) : "/blog"
  return tag ? `${path}?tag=${encodeURIComponent(tag)}` : path
}

export function blogCategorySlugFromPath(pathname: string | null | undefined): string | null {
  const match = pathname?.match(BLOG_CATEGORY_PATH_RE)
  if (!match) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}

// Tytuły listingu (bez sufiksu z nazwą serwisu, który dokleja szablon w app/layout.tsx).
// Wspólne dla metadanych stron i dla document.title po zmianie kategorii bez przeładowania.
export const BLOG_LISTING_TITLE = "Pełnoprawnik: "

export function blogCategoryTitle(categoryName: string): string {
  return `${categoryName}`
}
