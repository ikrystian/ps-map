// Kod bannera Klubu Partnerskiego do wklejenia na stronie eksperta — czyste funkcje,
// bezpieczne w komponentach klienckich (lib/partner-program.ts importuje Prismę).

const SITE_URL = "https://prostasprawa.pl"

// Pliki w public/bannery/prostasprawa-{rozmiar}-{motyw}-{wariant}.webp (grafiki w 2× rozdzielczości)
export const BANNER_SIZES = [
  { id: "250x250", width: 250, height: 250, label: "Kwadrat" },
  { id: "300x250", width: 300, height: 250, label: "Prostokąt średni" },
  { id: "336x280", width: 336, height: 280, label: "Prostokąt duży" },
  { id: "750x100", width: 750, height: 100, label: "Belka" },
  { id: "750x200", width: 750, height: 200, label: "Belka wysoka" },
  { id: "970x90", width: 970, height: 90, label: "Billboard" },
] as const

export const BANNER_THEMES = [
  { id: "jasny", label: "Jasny" },
  { id: "ciemny", label: "Ciemny" },
  { id: "czarny", label: "Czarny" },
] as const

// „mnie" — banner w pierwszej osobie liczby pojedynczej, „nas" — w mnogiej (kancelaria)
export const BANNER_VARIANTS = [
  { id: "mnie", label: "Indywidualnie", hint: "„Znajdziesz mnie na…\"", alt: "Znajdziesz mnie na ProstaSprawa.pl" },
  { id: "nas", label: "Kancelaria", hint: "„Znajdziesz nas na…\"", alt: "Znajdziesz nas na ProstaSprawa.pl" },
] as const

export type BannerSizeId = (typeof BANNER_SIZES)[number]["id"]
export type BannerThemeId = (typeof BANNER_THEMES)[number]["id"]
export type BannerVariantId = (typeof BANNER_VARIANTS)[number]["id"]

export interface BannerSelection {
  size: BannerSizeId
  theme: BannerThemeId
  variant: BannerVariantId
}

export const DEFAULT_BANNER_SELECTION: BannerSelection = {
  size: "300x250",
  theme: "ciemny",
  variant: "nas",
}

export function getBannerSize(id: BannerSizeId) {
  return BANNER_SIZES.find((size) => size.id === id) ?? BANNER_SIZES[0]
}

/** Ścieżka grafiki w katalogu public, np. /bannery/prostasprawa-300x250-ciemny-nas.webp */
export function getBannerImagePath({ size, theme, variant }: BannerSelection): string {
  return `/bannery/prostasprawa-${size}-${theme}-${variant}.webp`
}

function getBannerParts(selection: BannerSelection, profileSlug?: string | null) {
  const { width, height } = getBannerSize(selection.size)
  const variant = BANNER_VARIANTS.find((v) => v.id === selection.variant) ?? BANNER_VARIANTS[0]
  return {
    width,
    height,
    alt: variant.alt,
    imageUrl: `${SITE_URL}${getBannerImagePath(selection)}`,
    // Banner zachęca do obejrzenia profilu — bez sluga kierujemy na stronę główną
    linkUrl: profileSlug ? `${SITE_URL}/ekspert/${encodeURIComponent(profileSlug)}` : SITE_URL,
  }
}

/**
 * Generuje HTML kod bannera dla ekspertów
 */
export function generateBannerHtml(
  bannerCode: string,
  selection: BannerSelection = DEFAULT_BANNER_SELECTION,
  profileSlug?: string | null
): string {
  const { width, height, alt, imageUrl, linkUrl } = getBannerParts(selection, profileSlug)
  return `<!-- ProstaSprawa Partner Banner -->
<div id="${bannerCode}" class="ps-partner-banner">
  <a href="${linkUrl}" target="_blank" rel="noopener">
    <img src="${imageUrl}" width="${width}" height="${height}" style="max-width:100%;height:auto" alt="${alt}" />
  </a>
</div>
<!-- /ProstaSprawa Partner Banner -->`
}

/**
 * Generuje kod JavaScript bannera (alternatywny sposób)
 */
export function generateBannerScript(
  bannerCode: string,
  selection: BannerSelection = DEFAULT_BANNER_SELECTION,
  profileSlug?: string | null
): string {
  const { width, height, alt, imageUrl, linkUrl } = getBannerParts(selection, profileSlug)
  return `<!-- ProstaSprawa Partner Banner Script -->
<script>
(function() {
  var banner = document.createElement('div');
  banner.id = '${bannerCode}';
  banner.className = 'ps-partner-banner';
  banner.innerHTML = '<a href="${linkUrl}" target="_blank" rel="noopener"><img src="${imageUrl}" width="${width}" height="${height}" style="max-width:100%;height:auto" alt="${alt}" /></a>';
  document.body.appendChild(banner);
})();
</script>
<!-- /ProstaSprawa Partner Banner Script -->`
}
