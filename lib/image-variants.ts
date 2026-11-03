// Limity dla kadrowanych obrazów profilu — wspólne dla croppera (klient) i /api/upload (serwer).
// Kadr zapisujemy w pikselach oryginału, zmniejszając tylko powyżej maxWidth.
export const IMAGE_VARIANTS = {
  cover: { maxWidth: 3840, minRecommendedWidth: 2400, quality: 88 },
  logo: { maxWidth: 1600, minRecommendedWidth: 800, quality: 90 },
} as const

export type ImageVariant = keyof typeof IMAGE_VARIANTS

export const isImageVariant = (value: unknown): value is ImageVariant =>
  typeof value === "string" && Object.hasOwn(IMAGE_VARIANTS, value)

// Oryginał przed kadrowaniem może być duży (zdjęcie z aparatu) — do serwera trafia już
// przeskalowany kadr, który musi zmieścić się w limicie 5 MB /api/upload.
export const CROP_SOURCE_MAX_BYTES = 20 * 1024 * 1024
