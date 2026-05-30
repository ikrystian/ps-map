import React from "react"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Sparkles,
  Award,
  Home,
  Star,
  Crown,
  RefreshCw,
  Clock,
  XCircle,
  CheckCircle2,
} from "lucide-react"
import { Promotion } from "./types"

export const ICON_MAP: Record<string, any> = {
  TrendingUp,
  Sparkles,
  Award,
  Home,
  Star,
  Crown,
}

export const RECOMMENDED_LAWYERS_CATEGORIES = [
  "Adwokat",
  "Radca prawny",
  "Rzeczoznawca",
  "Notariusz",
  "Doradca podatkowy",
  "Doradca finansowy",
  "Mediator",
  "Komornik",
  "Rzecznik patentowy",
  "Aplikant",
  "BHP i PPOŻ",
  "Doradca prawny",
]

export const MOST_CONSULTED_CATEGORIES = [
  { id: "alimenty-i-rozwody", name: "Alimenty i rozwody" },
  { id: "dlugi-windykacja-egzekucje", name: "Długi, windykacja, egzekucje" },
  { id: "dziedziczenie-spadki-testamenty", name: "Dziedziczenie, spadki, testamenty" },
  { id: "pozyczki-i-kredyty", name: "Pożyczki i kredyty" },
  { id: "zatrudnienie-i-umowy", name: "Zatrudnienie i umowy" },
  { id: "dotacje-unijne", name: "Dotacje unijne" },
]

export const getFutureMonths = () => {
  const months = []
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-11

  const polishMonths = [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
  ]

  for (let i = 1; i <= 12; i++) {
    const targetDate = new Date(currentYear, currentMonth + i, 1)
    const monthIndex = targetDate.getMonth()
    const year = targetDate.getFullYear()
    months.push({
      value: targetDate.toISOString(),
      label: `${polishMonths[monthIndex]} ${year}`,
      year,
      month: monthIndex,
    })
  }
  return months
}

export const getIconComponent = (iconName: string | null) => {
  if (!iconName) return TrendingUp
  return ICON_MAP[iconName] || TrendingUp
}

export const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const getPromotionTypeLabel = (type: string, promotionTypes: any[]) => {
  const promo = promotionTypes.find((p) => p.type === type)
  return promo?.label || type
}

export const getPromotionStatusBadge = (promotion: Promotion) => {
  const now = new Date()
  const start = new Date(promotion.startPromocji)
  const end = new Date(promotion.koniecPromocji)

  if (promotion.isVirtualUpcoming) {
    return (
      <Badge
        variant="secondary"
        className="gap-1 bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/10"
      >
        <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: "4s" }} />
        Autoprzedłużenie
      </Badge>
    )
  }

  if (start > now) {
    return (
      <Badge
        variant="secondary"
        className="gap-1 bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/10"
      >
        <Clock className="h-3 w-3" />
        Zaplanowana
      </Badge>
    )
  }

  if (end < now) {
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground border-white/10">
        <XCircle className="h-3 w-3" />
        Zakończona
      </Badge>
    )
  }

  if (promotion.aktywna) {
    if (promotion.automatyczneOdnowienie) {
      return (
        <Badge
          variant="default"
          className="gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium hover:bg-emerald-500/15"
        >
          <CheckCircle2 className="h-3 w-3 animate-pulse" />
          Aktywna (Auto)
        </Badge>
      )
    }
    return (
      <Badge
        variant="default"
        className="gap-1 bg-[#0da192]/10 border border-[#0da192]/30 text-[#0da192] font-medium hover:bg-[#0da192]/15"
      >
        <CheckCircle2 className="h-3 w-3" />
        Aktywna
      </Badge>
    )
  }

  return (
    <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">
      Nieaktywna
    </Badge>
  )
}

export const getPromotionSuccessDetails = (
  type: string,
  category: string | null,
  voivodeship: string | null
) => {
  switch (type) {
    case "PODBICIE_OGLOSZENIA":
      return {
        gdzie: `Twój profil uzyska najwyższy możliwy priorytet i będzie pozycjonowany wyżej na liście wyników wyszukiwania ekspertów${
          category ? ` w kategorii "${category}"` : ""
        }${voivodeship ? ` dla województwa ${voivodeship}` : ""}.`,
        jak: "Twój profil będzie pozycjonowany ponad profilami ze standardowym pozycjonowaniem. Dzięki wyższemu wskaźnikowi widoczności trafi do znacznie większego grona osób poszukujących pomocy prawnej.",
        kiedy:
          "Promowanie rozpocznie się natychmiast po dacie startu i będzie trwało przez zdefiniowany okres. Saldo punktów zostało pomniejszone, a system automatycznie zadba o pozycjonowanie Twojej wizytówki w wybranym okresie.",
      }
    case "WYROZNIENIE":
      return {
        gdzie: `Na liście wyszukiwania ekspertów w całym serwisie${
          category ? ` (szczelynie w kategorii "${category}")` : ""
        } oraz bezpośrednio na Twoim publicznym profilu eksperta.`,
        jak: "Twój profil zostanie otoczony unikalną, elegancką, złotą ramką ze specjalną odznaką 'Wyróżniony' oraz otrzyma wyróżniony kolor tła karty. Dodatkowo na Twojej wizytówce i profilu pojawi się prestiżowy symbol wyróżnienia. Wyróżnienie wizualne zwiększa klikalność profilu średnio o 40%!",
        kiedy:
          "Promowanie wizualne będzie aktywne bez przerwy w zdefiniowanym przedziale czasowym. Oznaczenie 'Wyróżniony' będzie widoczne dla wszystkich odwiedzających portal.",
      }
    case "TOP_LISTA":
      return {
        gdzie: "Strona główna naszego serwisu w prestiżowej, wydzielonej sekcji 'Top Kancelarie'.",
        jak: "Twoja kancelaria zostanie umieszczona w elitarnym gronie na samej stronie głównej. Sekcja ta jest projektowana w sposób przyciągający uwagę i budujący maksymalne zaufanie oraz prestiż marki wśród odwiedzających.",
        kiedy:
          "Twój profil będzie stale wyświetlany w tej karuzeli/liście przez cały opłacony czas trwania promocji.",
      }
    case "STRONA_GLOWNA":
      return {
        gdzie:
          "Główny baner (karuzela / slider) na samej górze strony głównej portalu - najbardziej widoczne miejsce w całym serwisie.",
        jak: "Maksymalna ekspozycja i prestiż. Twój profil ze zdjęciem i chwytliwym nagłówkiem pojawi się jako jedna z pierwszych rzeczy, które zobaczy każdy użytkownik wchodzący na portal. Zapewnia to najwyższą konwersję i dotarcie do tysięcy użytkowników.",
        kiedy:
          "Slider rotuje promowane kancelarie przez całą dobę. Twoja wizytówka będzie brała udział w tej prestiżowej rotacji przez cały okres trwania promocji.",
      }
    case "POLECANI_PRAWNICY":
      return {
        gdzie: `Strona główna serwisu, w specjalnie dedykowanej sekcji 'Polecani prawnicy i adwokaci' dla wybranej przez Ciebie kategorii zawodowej: "${
          category || "Wszystkie"
        }".`,
        jak: "To ekskluzywne promowanie o najwyższej skuteczności. W danym miesiącu w wybranej kategorii obowiązuje rygorystyczny limit maksymalnie 4 miejsc dla kancelarii, co oznacza znikome rozproszenie uwagi użytkownika i gwarantuje ogromną liczbę zapytań.",
        kiedy:
          "Promowanie trwa nieprzerwanie przez cały wybrany pełny miesiąc kalendarzowy (od pierwszego do ostatniego dnia miesiąca).",
      }
    case "NAJCZESCIEJ_KONSULTOWANE":
      return {
        gdzie: `Strona główna serwisu, w boksie powiązanym z najpopularniejszą tematyką prawną: "${
          category || "Wszystkie"
        }".`,
        jak: "Bezpośrednie dotarcie do klientów z konkretnymi problemami prawnymi. Twój profil będzie promowany jako rekomendowany specjalista w danej dziedzinie. W tym module obowiązuje ścisły limit 5 miejsc na daną kategorię w miesiącu, co chroni Twoją pozycję lidera i zapewnia stały dopływ spraw.",
        kiedy:
          "Promowanie trwa przez cały wybrany pełny miesiąc kalendarzowy (od pierwszego do ostatniego dnia miesiąca).",
      }
    default:
      return {
        gdzie: "W wybranych sekcjach serwisu w zależności od wybranego pakietu.",
        jak: "Zwiększając widoczność, zasięg oraz budując zaufanie klientów dzięki unikalnym oznaczeniom.",
        kiedy: "W wybranym przedziale czasowym zgodnie z harmonogramem.",
      }
  }
}
