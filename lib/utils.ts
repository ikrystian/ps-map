import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
