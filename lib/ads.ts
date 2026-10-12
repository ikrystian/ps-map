// Nazwa parametru doklejanego do linku docelowego reklamy – niesie ID reklamy
export const AD_ID_QUERY_PARAM = "ad_id"

/**
 * Dokleja do linku docelowego reklamy parametr z jej ID (np. https://x.pl/promo?ad_id=...).
 * Zachowuje istniejące parametry i hash. Linki inne niż http(s) (mailto:, tel:, itp.)
 * oraz nieparsowalne zwracamy bez zmian.
 */
export function withAdId(linkUrl: string, adId: string): string {
  const trimmed = linkUrl.trim()

  try {
    const url = new URL(trimmed)
    if (url.protocol !== "http:" && url.protocol !== "https:") return linkUrl
    url.searchParams.set(AD_ID_QUERY_PARAM, adId)
    return url.toString()
  } catch {
    // Nie jest to link bezwzględny – spróbujmy jako względny
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    try {
      const url = new URL(trimmed, "http://localhost")
      url.searchParams.set(AD_ID_QUERY_PARAM, adId)
      return `${url.pathname}${url.search}${url.hash}`
    } catch {
      return linkUrl
    }
  }

  return linkUrl
}
