# Opis Projektu: Prosta Sprawa

## 1. Wprowadzenie

**Prosta Sprawa** to zaawansowana platforma internetowa typu marketplace, zaprojektowana w celu łączenia klientów poszukujących pomocy prawnej z profesjonalnymi kancelariami prawnymi. Aplikacja stanowi kompleksowe rozwiązanie, które automatyzuje proces poszukiwania specjalistów, składania zapytań, otrzymywania ofert oraz zarządzania komunikacją.

Projekt został zbudowany w oparciu o nowoczesny stos technologiczny, z wyraźnym podziałem na role użytkowników i dedykowane dla nich panele funkcjonalne.

## 2. Architektura i Stos Technologiczny

Aplikacja wykorzystuje architekturę full-stack opartą na frameworku **Next.js** z **App Routerem**. Logika backendowa jest zintegrowana bezpośrednio w projekcie za pomocą **API Routes**.

### Kluczowe Technologie:

*   **Framework Frontend/Backend:** Next.js 16+ (z React 19)
*   **Język programowania:** TypeScript
*   **Baza Danych:** SQLite (lokalnie), z możliwością łatwej zmiany na PostgreSQL w środowisku produkcyjnym.
*   **ORM:** Prisma - do zarządzania schematem bazy danych, migracjami i zapytaniami.
*   **Uwierzytelnianie:** NextAuth.js (v5), obsługujące zarówno logowanie przez e-mail/hasło, jak i dostawców OAuth.
*   **Styling:** Tailwind CSS z `tailwindcss-animate` do animacji.
*   **Komponenty UI:** Zestaw komponentów oparty na Radix UI i `shadcn/ui`, co zapewnia wysoką jakość, dostępność i spójność interfejsu.
*   **Zarządzanie Formularzami:** React Hook Form w połączeniu z biblioteką Zod do walidacji schematów.
*   **Narzędzia deweloperskie:** ESLint do linterowania kodu, `tsx` do uruchamiania skryptów TypeScript.

## 3. Model Danych i Główne Encje

Schemat bazy danych, zdefiniowany w `prisma/schema.prisma`, jest sercem aplikacji i odzwierciedla jej złożoną logikę biznesową. Główne modele to:

*   **`User`**: Centralny model reprezentujący użytkownika. Posiada role (`CLIENT`, `LAW_FIRM`, `ADMIN`) i statusy (`ACTIVE`, `INACTIVE`).
*   **`Client`**: Profil klienta, powiązany z `User`. Przechowuje dane osobowe i historię aktywności.
*   **`LawFirm`**: Rozbudowany profil kancelarii prawnej, zawierający m.in. dane firmy, opis, specjalizacje, cennik usług, certyfikaty i statystyki.
*   **`Case`**: "Sprawa" lub zapytanie ofertowe tworzone przez klienta. Określa kategorię prawną, opis, budżet i lokalizację.
*   **`Offer`**: Oferta składana przez kancelarię w odpowiedzi na `Case`. Zawiera wycenę, termin realizacji i szczegółowy opis.
*   **`Category`**: Hierarchiczna struktura kategorii prawnych (specjalizacji), umożliwiająca kategoryzację spraw i kancelarii.
*   **`Review`**: System opinii i ocen, gdzie klienci mogą oceniać współpracę z kancelariami.
*   **`Conversation` / `ChatMessage`**: Moduł komunikacji w czasie rzeczywistym (czat) między klientem a kancelarią.
*   **`Order` / `Invoice`**: System monetyzacji, obsługujący zamówienia na punkty, pakiety subskrypcyjne oraz generowanie faktur.
*   **`Promotion`**: Mechanizm promowania profili kancelarii (np. podbicia, wyróżnienia).
*   **`Page` / `Module`**: Prosty system CMS do zarządzania treścią na stronach statycznych.
*   **`SystemLog` / `LoginHistory`**: Modele do logowania zdarzeń systemowych i historii logowań, kluczowe dla panelu administracyjnego.

## 4. Struktura Aplikacji i Kluczowe Funkcjonalności

Aplikacja jest zorganizowana w logiczne moduły, co odzwierciedla struktura katalogu `app/`:

### 4.1. Strefa Publiczna (`app/(public)`)

Dostępna dla wszystkich odwiedzających. Zawiera strony informacyjne, takie jak:
*   Strona główna (`/`)
*   Blog (`/blog`)
*   Cennik (`/cennik`)
*   Jak to działa (`/jak-to-dziala`)
*   Formularze rejestracji (`/rejestracja`) i logowania (`/logowanie`).
*   Wyszukiwarka kancelarii (`/szukaj-prawnika`).
*   Formularz dodawania sprawy (`/dodaj-sprawe`).

### 4.2. Panel Klienta (`app/panel-klienta`)

Dedykowany dla zalogowanych użytkowników z rolą `CLIENT`. Umożliwia:
*   Zarządzanie swoim profilem.
*   Tworzenie nowych spraw i zarządzanie istniejącymi.
*   Przeglądanie otrzymanych ofert i ich akceptację/odrzucenie.
*   Komunikację z kancelariami.
*   Wystawianie opinii.

### 4.3. Panel Kancelarii (`app/panel-kancelarii`)

Dedykowany dla zalogowanych użytkowników z rolą `LAW_FIRM`. Oferuje szeroki wachlarz narzędzi do zarządzania profilem i działalnością na platformie:
*   Edycja rozbudowanego profilu publicznego.
*   Przeglądanie dostępnych spraw i składanie na nie ofert.
*   Zarządzanie finansami: zakup punktów, subskrypcji, przeglądanie faktur.
*   Aktywowanie promocji w celu zwiększenia widoczności.
*   Analiza statystyk (wyświetlenia profilu, konwersja ofert).
*   Publikowanie artykułów na blogu.
*   Komunikacja z klientami.

### 4.4. Panel Administratora (`app/admin`)

Kompleksowe narzędzie do zarządzania całą platformą, przeznaczone dla użytkowników z rolą `ADMIN`. Funkcje obejmują:
*   Zarządzanie użytkownikami, kancelariami i sprawami.
*   Moderowanie treści (np. opinii).
*   Zarządzanie kategoriami, pakietami subskrypcji i konfiguracją promocji.
*   Przeglądanie transakcji i logów systemowych.
*   Zarządzanie treścią na stronach statycznych (CMS).

### 4.5. API (`app/api`)

Backend aplikacji, gdzie zdefiniowano całą logikę biznesową. Struktura API odzwierciedla podział na moduły, zapewniając REST-owe endpointy do operacji CRUD na wszystkich kluczowych zasobach.

## 5. Podsumowanie

**Prosta Sprawa** to ambitny i dobrze zaprojektowany projekt, który ma potencjał stać się wiodącą platformą w swojej niszy. Solidne fundamenty technologiczne, przemyślany model danych i klarowna struktura aplikacji świadczą o wysokiej jakości inżynierii oprogramowania. Projekt jest gotowy do dalszego rozwoju i skalowania.
