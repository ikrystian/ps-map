import { generateSlug } from "@/lib/utils"

/** Slug wpisu: małe litery a-z, cyfry i pojedyncze myślniki (bez brzegowych). Bezpieczny także w komponentach klienckich. */
export const BLOG_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const BLOG_SLUG_MAX_LENGTH = 200

export function isValidBlogSlug(slug: string): boolean {
  return slug.length <= BLOG_SLUG_MAX_LENGTH && BLOG_SLUG_PATTERN.test(slug)
}

/** Slug proponowany z tytułu — bez brzegowych i podwójnych myślników. */
export function suggestBlogSlug(title: string): string {
  return generateSlug(title).replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "")
}
