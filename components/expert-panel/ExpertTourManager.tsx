"use client"

import { TourStep, useExpertTour } from "@/hooks/useExpertTour"
import { usePathname } from "next/navigation"
import Script from "next/script"
import { useCallback, useEffect, useState } from "react"
import { ExpertTourButton } from "./ExpertTourButton"

// ─────────────────────────────────────────────────────────────────────────────
// Tour steps per route
// ─────────────────────────────────────────────────────────────────────────────

const TOUR_STEPS: Record<string, TourStep[]> = {
  "/panel-eksperta": [
    {
      title: "👋 Witaj w Panelu Eksperta!",
      intro:
        "To jest Twoje centrum dowodzenia. Znajdziesz tutaj podsumowanie aktywności, statystyki i szybki dostęp do wszystkich funkcji. Przeprowadzimy Cię przez panel krok po kroku.",
    },
    {
      element: "#left-nav",
      title: "🗺️ Nawigacja",
      intro:
        "Tutaj znajdziesz menu nawigacyjne ze wszystkimi sekcjami panelu. Możesz przełączać się między sprawy, oferty, profil, statystyki i wiele innych.",
      position: "right",
    },
    {
      element: "#tour-stats",
      title: "📊 Twoje statystyki",
      intro:
        "Te 4 karty pokazują kluczowe wskaźniki: wyświetlenia profilu, złożone oferty, współczynnik konwersji i pozycję w rankingu ekspertów.",
      position: "bottom",
    },
    {
      element: "#tour-pakiet",
      title: "📦 Twój pakiet",
      intro:
        "Tu widzisz informacje o aktywnym pakiecie subskrypcji wraz z limitami spraw i kategorii. Kliknij 'Odnów pakiet', jeśli ważność dobiega końca.",
      position: "bottom",
    },
    {
      element: "#tour-quick-actions",
      title: "⚡ Szybkie akcje",
      intro:
        "Skróty do najważniejszych sekcji: edycja profilu, przeglądanie spraw, pozycja w rankingu i zarządzanie zakresem usług.",
      position: "top",
    },
    {
      element: "#tour-promotions",
      title: "🚀 Promowanie i program partnerski",
      intro:
        "Zwiększ widoczność swojego profilu przez promocje punktowe lub dołącz do programu partnerskiego, żeby wyróżnić się wśród konkurencji.",
      position: "top",
    },
    {
      element: "#tour-help-button",
      title: "❓ Ten przycisk",
      intro:
        "Kliknij ten przycisk w dowolnym momencie, aby uruchomić samouczek ponownie na bieżącej stronie. Powodzenia!",
      position: "left",
    },
  ],

  "/panel-eksperta/sprawy": [
    {
      title: "⚖️ Sprawy klientów",
      intro:
        "To jest lista wszystkich dostępnych spraw od klientów. Możesz przeglądać, filtrować i składać oferty na interesujące Cię zlecenia.",
    },
    {
      element: "#tour-sprawy-filters",
      title: "🔍 Filtry wyszukiwania",
      intro:
        "Użyj tych filtrów, aby szybko znaleźć sprawy według nazwy, miasta, kategorii prawnej lub typu klienta (osoba prywatna, firma, organizacja).",
      position: "bottom",
    },
    {
      element: "#tour-sprawy-stats",
      title: "📈 Statystyki spraw",
      intro:
        "Tutaj widzisz podsumowanie: liczba nowych spraw, obserwowanych przez Ciebie, oczekujących na decyzję i zamkniętych.",
      position: "bottom",
    },
    {
      element: "#tour-sprawy-list",
      title: "📋 Lista spraw",
      intro:
        "Każda karta to jedna sprawa. Zielona ramka oznacza sprawę zaakceptowaną przez klienta. Możesz oznaczyć sprawę jako ulubioną (serce) lub ukryć ją z listy (kosz).",
      position: "top",
    },
  ],

  "/panel-eksperta/oferty": [
    {
      title: "📄 Twoje oferty",
      intro:
        "Tu znajdziesz wszystkie oferty, które złożyłeś klientom. Możesz śledzić ich status i przejść do szczegółów każdej sprawy.",
    },
    {
      element: "#tour-oferty-stats",
      title: "📊 Statystyki ofert",
      intro:
        "Karty pokazują ogólną liczbę ofert oraz ich podział według statusu: złożone (oczekujące), zaakceptowane, odrzucone i w negocjacjach.",
      position: "bottom",
    },
    {
      element: "#tour-oferty-filters",
      title: "🔎 Filtrowanie",
      intro:
        "Szybko filtruj oferty według statusu, żeby skupić się np. tylko na oczekujących lub zaakceptowanych.",
      position: "bottom",
    },
    {
      element: "#tour-oferty-list",
      title: "📝 Lista ofert",
      intro:
        "Każda karta zawiera nazwę sprawy, kwotę, termin realizacji i datę złożenia oferty. Kliknij 'Zobacz sprawę', aby przejść do szczegółów.",
      position: "top",
    },
  ],

  "/panel-eksperta/profil": [
    {
      title: "👤 Profil Eksperta",
      intro:
        "Tutaj zarządzasz wszystkimi informacjami o sobie widocznymi dla klientów. Kompletny profil zwiększa szanse na pozyskanie zleceń!",
    },
    {
      element: "#tour-profil-tabs",
      title: "📑 Sekcje profilu",
      intro:
        "Profil jest podzielony na zakładki: Podstawowe, Kontakt, Zakres usług, Multimedia, Godziny konsultacji i Dodatkowe. Każda zawiera inne dane do uzupełnienia.",
      position: "bottom",
    },
    {
      element: "#tour-profil-basic",
      title: "📝 Dane podstawowe",
      intro:
        "Tutaj uzupełnisz nazwę wyświetlaną, nazwę firmy i opis profilu. To pierwsze co widzi klient — zadbaj o profesjonalny opis!",
      position: "bottom",
    },
    {
      element: "#tour-profil-logo",
      title: "🖼️ Logo i zdjęcia",
      intro:
        "Dodaj zdjęcie profilowe (avatar) i zdjęcie główne (baner). Eksperci ze zdjęciem otrzymują nawet 3× więcej zapytań!",
      position: "top",
    },
  ],

  "/panel-eksperta/zakres-uslug": [
    {
      title: "⚖️ Zakres usług",
      intro:
        "Tutaj definiujesz swoje specjalizacje prawne i obszar działania. Im dokładniej wypełnisz te dane, tym trafniej system dopasuje Cię do klientów.",
    },
    {
      element: "#tour-zakres-specializations",
      title: "🎯 Specjalizacje",
      intro:
        "Wybierz kategorie prawne, w których się specjalizujesz. Możesz je przeciągać, żeby ustawić kolejność wyświetlania na profilu.",
      position: "right",
    },
    {
      element: "#tour-zakres-area",
      title: "📍 Obszar działania",
      intro:
        "Określ, w jakich województwach działasz lub zaznacz 'Cała Polska'. Możesz też wybrać tryb 'Tylko online'.",
      position: "top",
    },
  ],

  "/panel-eksperta/blog": [
    {
      title: "✍️ Blog eksperta",
      intro:
        "Publikuj artykuły prawne, które zwiększają Twój autorytet i widoczność w wyszukiwarce. Artykuły pojawiają się na Twoim profilu i w sekcji artykułów serwisu.",
    },
    {
      element: "#tour-blog-new",
      title: "➕ Nowy artykuł",
      intro:
        "Kliknij tutaj, aby dodać nowy artykuł. Możesz użyć edytora WYSIWYG z formatowaniem, dodawać zdjęcia i kategorie.",
      position: "bottom",
    },
    {
      element: "#tour-blog-list",
      title: "📚 Twoje artykuły",
      intro:
        "Lista Twoich artykułów. Możesz edytować, publikować lub usuwać każdy z nich. Opublikowane artykuły są widoczne publicznie.",
      position: "top",
    },
  ],

  "/panel-eksperta/opinie": [
    {
      title: "⭐ Opinie klientów",
      intro:
        "Tutaj znajdziesz opinie wystawione przez klientów po zakończeniu współpracy. Dobre opinie to Twoja najlepsza wizytówka!",
    },
    {
      element: "#tour-opinie-stats",
      title: "📊 Średnia ocena",
      intro:
        "Widzisz tu swoją średnią ocenę i liczbę opinii. Im więcej pozytywnych opinii, tym wyższa pozycja w rankingu.",
      position: "bottom",
    },
    {
      element: "#tour-opinie-list",
      title: "💬 Lista opinii",
      intro:
        "Każda opinia zawiera ocenę gwiazdkową, treść i datę wystawienia. Pamiętaj — nie możesz edytować ani usuwać opinii klientów.",
      position: "top",
    },
  ],

  "/panel-eksperta/certyfikaty": [
    {
      title: "🏆 Certyfikaty i odznaczenia",
      intro:
        "Tutaj możesz zarządzać swoimi certyfikatami zawodowymi i odznaczeniami. Wzbogacają Twój profil i budują zaufanie klientów.",
    },
    {
      element: "#tour-certyfikaty-list",
      title: "📜 Twoje certyfikaty",
      intro:
        "Lista certyfikatów dodanych do Twojego profilu. Możesz dodawać dyplomy, uprawnienia i inne dokumenty potwierdzające kwalifikacje.",
      position: "top",
    },
  ],

  "/panel-eksperta/dokumenty": [
    {
      title: "📁 Dokumenty",
      intro:
        "Tutaj przechowujesz i zarządzasz dokumentami związanymi z prowadzonymi sprawami. Wszystkie pliki są bezpiecznie zaszyfrowane.",
    },
  ],

  "/panel-eksperta/punkty": [
    {
      title: "🪙 System punktowy",
      intro:
        "Punkty to waluta platformy. Używasz ich do zakupu promocji, które zwiększają widoczność Twojego profilu.",
    },
    {
      element: "#tour-punkty-balance",
      title: "💰 Saldo punktów",
      intro:
        "Tu widzisz aktualny stan konta punktowego. Punkty nie wygasają — możesz je gromadzić i używać według własnego uznania.",
      position: "bottom",
    },
    {
      element: "#tour-punkty-buy",
      title: "🛒 Kup punkty",
      intro:
        "Wybierz pakiet punktów, który Ci odpowiada. Im więcej kupujesz na raz, tym korzystniejsza cena jednostkowa.",
      position: "bottom",
    },
    {
      element: "#tour-punkty-history",
      title: "📋 Historia transakcji",
      intro:
        "Przeglądaj historię wszystkich zakupów i wydatków punktowych. Dowiedz się, na co punkty zostały wydane.",
      position: "top",
    },
  ],

  "/panel-eksperta/pakiet": [
    {
      title: "📦 Pakiet subskrypcji",
      intro:
        "Pakiet subskrypcji decyduje o dostępnych funkcjach, limitach spraw i widoczności w katalogu. Wyższy pakiet = więcej możliwości.",
    },
    {
      element: "#tour-pakiet-current",
      title: "✅ Aktualny pakiet",
      intro:
        "Tutaj widzisz szczegóły swojego obecnego pakietu: ważność, dostępne funkcje i limity.",
      position: "bottom",
    },
    {
      element: "#tour-pakiet-upgrade",
      title: "⬆️ Dostępne pakiety",
      intro:
        "Porównaj pakiety i wybierz ten, który najlepiej odpowiada Twoim potrzebom. Możesz zmienić pakiet w dowolnym momencie.",
      position: "top",
    },
  ],

  "/panel-eksperta/promowanie": [
    {
      title: "📣 Promowanie profilu",
      intro:
        "Promocje to najprostszy sposób na zwiększenie widoczności wśród klientów. Kup punkty i aktywuj wybrany typ promocji.",
    },
    {
      element: "#tour-promo-balance",
      title: "💎 Saldo punktów",
      intro:
        "Widzisz tu aktualną liczbę punktów dostępnych do wykorzystania na promocje. Kliknij 'Kup punkty', aby doładować konto.",
      position: "bottom",
    },
    {
      element: "#tour-promo-types",
      title: "🎯 Rodzaje promocji",
      intro:
        "Dostępnych jest kilka rodzajów promocji: wyróżnienie profilu, podbicie ogłoszenia, pozycja w polecanych prawnikach i więcej. Każdy typ ma inny koszt i czas trwania.",
      position: "bottom",
    },
    {
      element: "#tour-promo-new",
      title: "➕ Nowa promocja",
      intro:
        "Kliknij tutaj, aby przejść do wyboru promocji. Wybierz odpowiedni typ z listy poniżej, a następnie skonfiguruj szczegóły w okienku.",
      position: "bottom",
    },
    {
      element: "#tour-promo-list",
      title: "📊 Twoje promocje",
      intro:
        "Tu widzisz aktywne, zaplanowane i zakończone promocje. Możesz włączyć automatyczne odnowienie, żeby nie przerywać promocji.",
      position: "top",
    },
  ],

  "/panel-eksperta/pozycja-ogloszenia": [
    {
      title: "🏆 Pozycja w rankingu",
      intro:
        "Ranking określa kolejność wyświetlania ekspertów w wynikach wyszukiwania. Im wyższa pozycja, tym więcej potencjalnych klientów Cię zobaczy.",
    },
    {
      element: "#tour-pozycja-rank",
      title: "📍 Twoja pozycja",
      intro:
        "To Twoja aktualna pozycja w globalnym rankingu ekspertów. Pozycja zależy od pakietu, opinii, aktywności i aktywnych promocji.",
      position: "bottom",
    },
    {
      element: "#tour-pozycja-factors",
      title: "⚙️ Czynniki rankingowe",
      intro:
        "Dowiedz się, co wpływa na Twoją pozycję: liczba opinii, ocena, pakiet subskrypcji, aktywne promocje i kompletność profilu.",
      position: "top",
    },
  ],

  "/panel-eksperta/statystyki": [
    {
      title: "📊 Statystyki i analizy",
      intro:
        "Tu znajdziesz szczegółowe dane o wydajności swojego profilu. Analizuj trendy, żeby podejmować lepsze decyzje biznesowe.",
    },
    {
      element: "#tour-stats-overview",
      title: "🔢 Kluczowe wskaźniki",
      intro:
        "Cztery karty pokazują najważniejsze dane: łączne wyświetlenia, złożone oferty, współczynnik konwersji i średnią ocenę.",
      position: "bottom",
    },
    {
      element: "#tour-stats-tabs",
      title: "📈 Zakładki wykresów",
      intro:
        "Przełączaj się między zakładkami: Wyświetlenia (miesięczny trend), Oferty (złożone vs wygrane) i Kategorie (skuteczność wg kategorii prawnej).",
      position: "bottom",
    },
    {
      element: "#tour-stats-ranking",
      title: "🏅 Ranking i opinie",
      intro:
        "Na dole znajdziesz swoje miejsce w rankingu ekspertów oraz podsumowanie opinii klientów z oceną gwiazdkową.",
      position: "top",
    },
  ],

  "/panel-eksperta/wiadomosci": [
    {
      title: "💬 Wiadomości",
      intro:
        "To Twój komunikator z klientami. Możesz tu prowadzić rozmowy dotyczące spraw i ofert w czasie rzeczywistym.",
    },
    {
      element: "#tour-messages-container",
      title: "📨 Komunikator",
      intro:
        "Po lewej stronie lista konwersacji, po prawej okno czatu. Kliknij na rozmowę, aby ją otworzyć i odpowiedzieć. Możesz też wysyłać pliki i emotikony.",
      position: "top",
    },
  ],

  "/panel-eksperta/ustawienia": [
    {
      title: "⚙️ Ustawienia konta",
      intro:
        "Tutaj zarządzasz ustawieniami swojego konta: hasłem, powiadomieniami e-mail i preferencjami platformy.",
    },
    {
      element: "#tour-settings-notifications",
      title: "🔔 Powiadomienia",
      intro:
        "Konfiguruj, o czym chcesz być powiadamiany e-mailem: nowe sprawy, zaakceptowane oferty, wiadomości od klientów i inne.",
      position: "bottom",
    },
    {
      element: "#tour-settings-security",
      title: "🔒 Bezpieczeństwo",
      intro:
        "Możesz tutaj zmienić hasło do konta i zarządzać sesjami. Regularnie aktualizuj hasło dla bezpieczeństwa.",
      position: "top",
    },
  ],

  "/panel-eksperta/konsultacje": [
    {
      title: "📅 Konsultacje",
      intro:
        "Zarządzaj harmonogramem konsultacji online i stacjonarnych. Klienci mogą rezerwować terminy bezpośrednio z Twojego profilu.",
    },
  ],

  "/panel-eksperta/klub-partnerski": [
    {
      title: "👑 Klub Partnerski",
      intro:
        "Program dla ekspertów premium. Zyskujesz badge 'Partner Premium', dedykowanego opiekuna i priorytetową widoczność w serwisie.",
    },
  ],

  "/panel-eksperta/faktury": [
    {
      title: "🧾 Faktury",
      intro:
        "Historia Twoich faktur za pakiety i usługi. Możesz pobierać faktury w formacie PDF do celów księgowych.",
    },
  ],

  "/panel-eksperta/pomoc": [
    {
      title: "🆘 Centrum pomocy",
      intro:
        "Znajdziesz tu odpowiedzi na najczęstsze pytania, poradniki i możliwość kontaktu z naszym zespołem wsparcia.",
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: get page key from pathname
// ─────────────────────────────────────────────────────────────────────────────
function getPageKey(pathname: string): string {
  // Normalize — strip trailing slash, strip dynamic segments
  const normalized = pathname.replace(/\/$/, "")
  // For dynamic routes like /panel-eksperta/sprawy/[id] use parent key
  const match = normalized.match(/^(\/panel-eksperta(?:\/[a-z-]+)?)/)
  return match?.[1] ?? normalized
}

function getTourKey(pathname: string): string {
  const key = getPageKey(pathname)
  // Convert to short key e.g. "/panel-eksperta/sprawy" -> "sprawy"
  return key.replace("/panel-eksperta", "").replace(/^\//, "") || "dashboard"
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export function ExpertTourManager() {
  const pathname = usePathname()
  const pageKey = getTourKey(pathname)
  const { tourSeen, introLoaded, startTour } = useExpertTour(pageKey)
  
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null)

  // Fetch the global admin settings to check if tour is enabled
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings")
        if (response.ok) {
          const data = await response.json()
          setIsEnabled(data.showExpertTutorial === "true")
        } else {
          setIsEnabled(false) // fallback
        }
      } catch (err) {
        console.error("Error fetching settings for expert tour:", err)
        setIsEnabled(false) // fallback
      }
    }
    fetchSettings()
  }, [])

  const currentSteps = TOUR_STEPS[getPageKey(pathname)] ?? []

  const handleStart = useCallback(() => {
    if (currentSteps.length > 0) {
      startTour(currentSteps)
    }
  }, [currentSteps, startTour])

  // Auto-start on first visit
  useEffect(() => {
    if (isEnabled && !tourSeen && introLoaded && currentSteps.length > 0) {
      // Small delay to allow page content to render
      const timer = setTimeout(() => {
        startTour(currentSteps)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isEnabled, tourSeen, introLoaded, currentSteps, startTour])

  // Don't render tour button if no steps defined or setting is disabled
  if (isEnabled === false || currentSteps.length === 0) return null

  return (
    <>
      {/* Intro.js CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/intro.js/minified/introjs.min.css"
      />
      {/* Intro.js Script */}
      <Script
        src="https://unpkg.com/intro.js/minified/intro.min.js"
        strategy="afterInteractive"
      />
      {/* Floating help button */}
      <ExpertTourButton onStart={handleStart} visible={introLoaded} />
    </>
  )
}
