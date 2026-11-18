import type { MetadataRoute } from "next"

// Stage/dev nie może być indeksowane przez Google (wcześniej /robots.txt zwracał 500,
// co wstrzymuje crawlowanie całej witryny). Produkcja dostaje otwarty robots.txt.
export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXTAUTH_URL || "").replace(/\/$/, "")
  const isProduction =
    process.env.NODE_ENV === "production" && !baseUrl.includes("stage.")

  if (!isProduction) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    }
  }

  return {
    rules: {
      userAgent: "*",
      // /api/files/ (obrazki, dokumenty) musi być dostępne dla crawlerów — Google
      // dopasowuje najdłuższą regułę, więc ten Allow wygrywa z Disallow: /api/.
      allow: ["/", "/api/files/"],
      disallow: ["/api/", "/admin/", "/panel-eksperta/", "/panel-klienta/", "/auth/"],
    },
    sitemap: baseUrl ? `${baseUrl}/sitemap.xml` : undefined,
  }
}
