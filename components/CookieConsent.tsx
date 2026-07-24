"use client"

import { useEffect } from "react"
import * as CookieConsent from "vanilla-cookieconsent"
import "vanilla-cookieconsent/dist/cookieconsent.css"

/**
 * Baner i menedżer zgód na pliki cookies (RODO/GDPR).
 * Wykorzystuje darmowy, otwartoźródłowy komponent `vanilla-cookieconsent`.
 * Umożliwia użytkownikowi akceptację/odrzucenie oraz zarządzanie zgodami
 * w podziale na kategorie (niezbędne, analityczne, marketingowe).
 */
export default function CookieConsentBanner() {
  useEffect(() => {
    CookieConsent.run({
      guiOptions: {
        consentModal: {
          layout: "box",
          position: "bottom left",
          equalWeightButtons: true,
          flipButtons: false,
        },
        preferencesModal: {
          layout: "box",
          equalWeightButtons: true,
          flipButtons: false,
        },
      },
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          // Wycofanie zgody usuwa pliki cookies Google Analytics i Hotjar.
          autoClear: {
            cookies: [{ name: /^_ga/ }, { name: /^_gid/ }, { name: /^_hj/ }],
            reloadPage: true,
          },
        },
        marketing: {},
      },
      language: {
        default: "pl",
        translations: {
          pl: {
            consentModal: {
              title: "Szanujemy Twoją prywatność",
              description:
                "Używamy plików cookies, aby zapewnić prawidłowe działanie serwisu, analizować ruch oraz dopasować treści marketingowe. Możesz zaakceptować wszystkie pliki cookies lub zarządzać swoimi zgodami. Więcej informacji znajdziesz w naszej <a href=\"/polityka-prywatnosci\">Polityce prywatności</a>.",
              acceptAllBtn: "Akceptuj wszystkie",
              acceptNecessaryBtn: "Odrzuć wszystkie",
              showPreferencesBtn: "Zarządzaj zgodami",
            },
            preferencesModal: {
              title: "Ustawienia plików cookies",
              acceptAllBtn: "Akceptuj wszystkie",
              acceptNecessaryBtn: "Odrzuć wszystkie",
              savePreferencesBtn: "Zapisz preferencje",
              closeIconLabel: "Zamknij",
              sections: [
                {
                  title: "Wykorzystanie plików cookies",
                  description:
                    "Pliki cookies wykorzystujemy do zapewnienia podstawowych funkcji serwisu oraz do poprawy jakości korzystania z niego. Dla każdej kategorii możesz samodzielnie zdecydować, czy chcesz wyrazić zgodę. Zgodę możesz zmienić lub wycofać w dowolnym momencie.",
                },
                {
                  title: "Niezbędne pliki cookies",
                  description:
                    "Te pliki cookies są konieczne do prawidłowego działania serwisu i nie można ich wyłączyć. Zazwyczaj są ustawiane w odpowiedzi na Twoje działania, np. logowanie czy wypełnianie formularzy.",
                  linkedCategory: "necessary",
                },
                {
                  title: "Analityczne pliki cookies",
                  description:
                    "Pozwalają nam zliczać wizyty i źródła ruchu, dzięki czemu możemy mierzyć i ulepszać wydajność naszego serwisu. Pomagają nam ustalić, które strony są najpopularniejsze. W tej kategorii korzystamy z narzędzi Google Analytics oraz Hotjar (mapy ciepła i nagrania sesji w formie zanonimizowanej). Bez Twojej zgody narzędzia te nie są uruchamiane.",
                  linkedCategory: "analytics",
                },
                {
                  title: "Marketingowe pliki cookies",
                  description:
                    "Umożliwiają wyświetlanie treści i reklam dopasowanych do Twoich zainteresowań oraz mierzenie skuteczności kampanii marketingowych.",
                  linkedCategory: "marketing",
                },
                {
                  title: "Więcej informacji",
                  description:
                    "W razie pytań dotyczących naszej polityki cookies zapoznaj się z <a href=\"/polityka-prywatnosci\">Polityką prywatności</a> lub <a href=\"/kontakt\">skontaktuj się z nami</a>.",
                },
              ],
            },
          },
        },
      },
    })
  }, [])

  return null
}

/** Otwiera okno zarządzania zgodami cookies (np. z linku w stopce). */
export function openCookiePreferences() {
  CookieConsent.showPreferences()
}
