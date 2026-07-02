/**
 * Partner Program Utilities
 *
 * Narzędzia do obsługi programu partnerskiego:
 * - Weryfikacja obecności bannera na stronie eksperta
 * - Generowanie unikalnych kodów bannerów
 * - Automatyczne przydzielanie punktów
 */

import { prisma } from '@/lib/prisma'

/**
 * Generuje unikalny kod bannera dla ekspertów
 */
export function generateBannerCode(lawFirmId: string): string {
  // Tworzymy kod z pierwszych 8 znaków ID + timestamp
  const timestamp = Date.now().toString(36)
  const firmPrefix = lawFirmId.substring(0, 8)
  return `ps-banner-${firmPrefix}-${timestamp}`
}

/**
 * Weryfikuje obecność bannera na stronie eksperta
 *
 * @param websiteUrl - URL strony eksperta do weryfikacji
 * @param bannerCode - Unikalny kod bannera do znalezienia
 * @returns Promise z wynikiem weryfikacji
 */
export async function verifyBannerPlacement(
  websiteUrl: string,
  bannerCode: string
): Promise<{
  success: boolean
  found: boolean
  error?: string
  checkedUrl?: string
}> {
  try {
    // Normalizacja URL
    let url = websiteUrl.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    // Sprawdź poprawność URL
    try {
      new URL(url)
    } catch {
      return {
        success: false,
        found: false,
        error: 'Nieprawidłowy format URL',
        checkedUrl: url
      }
    }

    // Pobierz zawartość strony
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 sekund timeout

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'ProstaSprawa-Partner-Verification/1.0',
        },
        redirect: 'follow',
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return {
          success: false,
          found: false,
          error: `Błąd HTTP: ${response.status} ${response.statusText}`,
          checkedUrl: url
        }
      }

      // Pobierz zawartość HTML
      const html = await response.text()

      // Szukaj kodu bannera w HTML
      const found = html.includes(bannerCode)

      return {
        success: true,
        found,
        checkedUrl: url
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId)

      if (fetchError.name === 'AbortError') {
        return {
          success: false,
          found: false,
          error: 'Przekroczono limit czasu oczekiwania (10s)',
          checkedUrl: url
        }
      }

      return {
        success: false,
        found: false,
        error: `Błąd pobierania strony: ${fetchError.message}`,
        checkedUrl: url
      }
    }
  } catch (error: any) {
    return {
      success: false,
      found: false,
      error: `Nieoczekiwany błąd: ${error.message}`
    }
  }
}

/**
 * Aktualizuje status weryfikacji bannera dla programu partnerskiego
 */
export async function updateBannerVerification(
  partnerProgramId: string,
  verificationResult: {
    found: boolean
    checkedUrl?: string
  }
) {
  const updateData: any = {
    lastVerificationDate: new Date(),
    lastVerificationStatus: verificationResult.found,
    bannerPlaced: verificationResult.found,
  }

  if (verificationResult.found) {
    // Jeśli banner znaleziony, resetuj licznik błędów
    updateData.verificationFailCount = 0
  } else {
    // Jeśli nie znaleziono, zwiększ licznik
    const current = await prisma.partnerProgram.findUnique({
      where: { id: partnerProgramId },
      select: { verificationFailCount: true }
    })

    updateData.verificationFailCount = (current?.verificationFailCount || 0) + 1

    // Jeśli zbyt wiele nieudanych weryfikacji (np. 3), dezaktywuj program
    if (updateData.verificationFailCount >= 3) {
      updateData.active = false
    }
  }

  return await prisma.partnerProgram.update({
    where: { id: partnerProgramId },
    data: updateData
  })
}

/**
 * Przyznaje miesięczne punkty dla aktywnych partnerów z zweryfikowanym bannerem
 *
 * @param year - Rok
 * @param month - Miesiąc (1-12)
 * @returns Statystyki przyznanych punktów
 */
export async function allocateMonthlyPoints(year: number, month: number) {
  // Pobierz wszystkie aktywne programy partnerskie z zweryfikowanym bannerem
  const activePartners = await prisma.partnerProgram.findMany({
    where: {
      active: true,
      lastVerificationStatus: true,
      bannerPlaced: true,
    },
    include: {
      lawFirm: {
        select: {
          id: true,
          nazwa: true,
          nazwa: true,
          punktySaldo: true,
          stronaWww: true
        }
      }
    }
  })

  const results = {
    total: activePartners.length,
    success: 0,
    failed: 0,
    totalPointsAllocated: 0,
    details: [] as Array<{
      lawFirmId: string
      lawFirmName: string
      points: number
      success: boolean
      error?: string
    }>
  }

  for (const partner of activePartners) {
    try {
      // Sprawdź czy już przyznano punkty w tym miesiącu
      const existing = await prisma.partnerPointsHistory.findUnique({
        where: {
          partnerProgramId_year_month: {
            partnerProgramId: partner.id,
            year,
            month
          }
        }
      })

      if (existing) {
        results.details.push({
          lawFirmId: partner.lawFirmId,
          lawFirmName: partner.lawFirm.nazwa,
          points: 0,
          success: false,
          error: 'Punkty już przyznane w tym miesiącu'
        })
        results.failed++
        continue
      }

      // Wykonaj weryfikację przed przyznaniem punktów
      if (partner.lawFirm.stronaWww) {
        const verification = await verifyBannerPlacement(
          partner.lawFirm.stronaWww,
          partner.bannerCode
        )

        // Aktualizuj status weryfikacji
        await updateBannerVerification(partner.id, verification)

        if (!verification.found) {
          results.details.push({
            lawFirmId: partner.lawFirmId,
            lawFirmName: partner.lawFirm.nazwa,
            points: 0,
            success: false,
            error: 'Banner nie został znaleziony na stronie'
          })
          results.failed++
          continue
        }
      } else {
        results.details.push({
          lawFirmId: partner.lawFirmId,
          lawFirmName: partner.lawFirm.nazwa,
          points: 0,
          success: false,
          error: 'Brak adresu strony WWW'
        })
        results.failed++
        continue
      }

      // Przyznaj punkty w transakcji
      await prisma.$transaction(async (tx: any) => {
        // Dodaj punkty do salda eksperta
        await tx.lawFirm.update({
          where: { id: partner.lawFirmId },
          data: {
            punktySaldo: {
              increment: partner.monthlyPoints
            }
          }
        })

        // Zapisz w historii
        await tx.partnerPointsHistory.create({
          data: {
            partnerProgramId: partner.id,
            pointsAwarded: partner.monthlyPoints,
            month,
            year,
            verificationUrl: partner.lawFirm.stronaWww,
            verificationStatus: true
          }
        })
      })

      results.success++
      results.totalPointsAllocated += partner.monthlyPoints
      results.details.push({
        lawFirmId: partner.lawFirmId,
        lawFirmName: partner.lawFirm.nazwa,
        points: partner.monthlyPoints,
        success: true
      })

    } catch (error: any) {
      results.failed++
      results.details.push({
        lawFirmId: partner.lawFirmId,
        lawFirmName: partner.lawFirm.nazwa,
        points: 0,
        success: false,
        error: error.message
      })
    }
  }

  return results
}

/**
 * Generuje HTML kod bannera dla ekspertów
 */
export function generateBannerHtml(bannerCode: string): string {
  return `<!-- ProstaSprawa Partner Banner -->
<div id="${bannerCode}" class="ps-partner-banner">
  <a href="https://prosta-sprawa.pl" target="_blank" rel="noopener">
    <img src="https://prosta-sprawa.pl/partner-banner.png" alt="Partnerzy ProstaSprawa.pl" />
  </a>
</div>
<!-- /ProstaSprawa Partner Banner -->`
}

/**
 * Generuje kod JavaScript bannera (alternatywny sposób)
 */
export function generateBannerScript(bannerCode: string): string {
  return `<!-- ProstaSprawa Partner Banner Script -->
<script>
(function() {
  var banner = document.createElement('div');
  banner.id = '${bannerCode}';
  banner.className = 'ps-partner-banner';
  banner.innerHTML = '<a href="https://prosta-sprawa.pl" target="_blank" rel="noopener"><img src="https://prosta-sprawa.pl/partner-banner.png" alt="Partnerzy ProstaSprawa.pl" /></a>';
  document.body.appendChild(banner);
})();
</script>
<!-- /ProstaSprawa Partner Banner Script -->`
}
