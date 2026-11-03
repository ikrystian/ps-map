// Wspólne parametry next/image dla okładki profilu — preload w page.tsx (serwer) musi
// wygenerować dokładnie ten sam srcset co <Image> w ExpertProfileClientPage,
// inaczej przeglądarka pobierze okładkę dwa razy.
export const COVER_IMAGE_SIZES = "100vw"
export const COVER_IMAGE_QUALITY = 90
