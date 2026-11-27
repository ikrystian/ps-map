// Jeden obrazek udostępniania (og:image / twitter:image) dla całego serwisu —
// celowo nadpisuje okładki artykułów i zdjęcia profili. Ścieżka względna jest
// rozwijana do pełnego adresu przez `metadataBase` z app/layout.tsx.
export const SITE_OG_IMAGE = {
  url: "/prostasprawa-og-szukasz-prawnika.jpg",
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "Prosta Sprawa: szukasz prawnika lub eksperta?",
}

export const SITE_TWITTER_IMAGE = {
  url: SITE_OG_IMAGE.url,
  alt: SITE_OG_IMAGE.alt,
}
