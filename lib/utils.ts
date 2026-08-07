import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Wybiera pozycję menu, którą należy podświetlić dla bieżącej ścieżki.
 * Wygrywa najbardziej szczegółowe dopasowanie, dzięki czemu pozycja nadrzędna
 * (np. /panel-klienta/konsultacje) nie podświetla się razem z podstroną
 * (/panel-klienta/konsultacje/zapytania).
 */
export function resolveActiveNavHref(
  hrefs: string[],
  pathname: string,
  rootHref?: string
): string | undefined {
  return hrefs
    .filter(
      (href) =>
        pathname === href || (href !== rootHref && pathname.startsWith(`${href}/`))
    )
    .sort((a, b) => b.length - a.length)[0]
}

/**
 * Generuje slug z podanego tekstu
 * Zamienia polskie znaki na ASCII, usuwa znaki specjalne, zamienia spacje na myślniki
 */
export function generateSlug(text: string): string {
  const polishChars: Record<string, string> = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
  }

  return text
    .split('')
    .map(char => polishChars[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Returns the border color class based on subscription package
 */
export function getSubscriptionBorderColor(subscriptionType?: string | null): string {
  if (!subscriptionType) return 'border-gray-300'

  switch (subscriptionType) {
    case 'PODSTAWOWY':
      return 'border-slate-400'
    case 'STANDARD':
      return 'border-blue-500'
    case 'PREMIUM':
      return 'border-purple-500'
    case 'BIZNES':
      return 'border-gradient-animated' // Special animated gradient for BIZNES
    default:
      return 'border-gray-300'
  }
}

/**
 * Returns the ring color class for subscription package (for hover effects)
 */
export function getSubscriptionRingColor(subscriptionType?: string | null): string {
  if (!subscriptionType) return 'ring-gray-300'

  switch (subscriptionType) {
    case 'PODSTAWOWY':
      return 'ring-slate-400'
    case 'STANDARD':
      return 'ring-blue-500'
    case 'PREMIUM':
      return 'ring-purple-500'
    case 'BIZNES':
      return 'ring-purple-500'
    default:
      return 'ring-gray-300'
  }
}

/**
 * Strips HTML tags from a string and replaces basic HTML entities with text counterparts
 */
export function stripHtmlTags(html: string | null | undefined): string {
  if (!html) return ""
  const stripped = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
  return stripped.replace(/\s+/g, " ").trim()
}

/**
 * Clears all client-side cache and storage (localStorage, sessionStorage, and browser caches).
 */
export async function clearAppCacheAndStorage() {
  if (typeof window !== "undefined") {
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch (e) {
      console.error("Failed to clear Web Storage:", e)
    }

    if ("caches" in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((name) => caches.delete(name)))
      } catch (e) {
        console.error("Failed to clear Caches:", e)
      }
    }
  }
}

