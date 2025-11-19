# DOKUMENTACJA PROSTA SPRAWA

Witamy w dokumentacji platformy "Prosta Sprawa". Poniżej znajdują się linki do wszystkich dostępnych dokumentów technicznych i funkcjonalnych.

## 📚 SPIS TREŚCI DOKUMENTACJI

### 🌐 STRONY PUBLICZNE
- [**Strony główne**]([1][strony-publiczne]strony-główne.md) - Dokumentacja strony głównej i kluczowych podstron publicznych
- [**Weryfikacja email**]([2][strony-publiczne]weryfikacja-email.md) - Proces weryfikacji adresu email
- [**Strony informacyjne**]([3][strony-publiczne]informacyjne.md) - Strony typu O nas, Kontakt, Jak to działa
- [**Strony funkcjonalne**]([4][strony-publiczne]funkcjonalne.md) - Dodaj sprawę, Ranking, Mapa
- [**Kancelaria**]([5][strony-publiczne]kancelaria.md) - Profil kancelarii i blog kancelarii

### 👤 PANEL KLIENTA
- [**Główne**]([6][panel-klienta]glowne.md) - Dashboard i profil klienta
- [**Sprawy**]([7][panel-klienta]sprawy.md) - Zarządzanie sprawami klienta
- [**Oferty**]([8][panel-klienta]oferty.md) - Otrzymywane oferty od kancelarii
- [**Komunikacja**]([9][panel-klienta]komunikacja.md) - System wiadomości i konwersacji
- [**Inne**]([10][panel-klienta]inne.md) - Eksperci, ustawienia konta

### ⚖️ PANEL KANCELARII
- [**Główne**]([11][panel-kancelarii]glowne.md) - Dashboard, profil, ustawienia, statystyki
- [**Sprawy i oferty**]([12][panel-kancelarii]sprawy-i-oferty.md) - Zarządzanie sprawami i składanie ofert
- [**Zakres usług**]([13][panel-kancelarii]zakres-uslug.md) - Zarządzanie usługami i specjalizacjami
- [**Blog**]([14][panel-kancelarii]blog.md) - Zarządzanie artykułami bloga
- [**Certyfikaty**]([15][panel-kancelarii]certyfikaty.md) - Zarządzanie certyfikatami kancelarii
- [**Dokumenty**]([16][panel-kancelarii]dokumenty.md) - Zarządzanie dokumentami
- [**Finansowe**]([17][panel-kancelarii]finansowe.md) - Pakiety, faktury, płatności
- [**System punktów**]([18][panel-kancelarii]system-punktow.md) - Punkty promocyjne i sklep
- [**Płatności**]([19][panel-kancelarii]platnosci.md) - Obsługa płatności
- [**Komunikacja**]([20][panel-kancelarii]komunikacja.md) - Wiadomości i kontakt z klientami
- [**Program partnerski**]([21][panel-kancelarii]program-partnerski.md) - Klub partnerski i korzyści

### 🛠️ PANEL ADMINA
- [**Główne**]([22][panel-admina]glowne.md) - Dashboard i profil administratora
- [**Użytkownicy**]([23][panel-admina]uzytkownicy.md) - Zarządzanie użytkownikami systemu
- [**Kancelarie**]([24][panel-admina]kancelarie.md) - Zarządzanie kancelariami prawnymi
- [**Sprawy**]([25][panel-admina]sprawy.md) - Moderacja spraw w systemie
- [**Kategorie**]([26][panel-admina]kategorie.md) - Zarządzanie kategoriami prawnymi
- [**Opinie**]([27][panel-admina]opinie.md) - Moderacja opinii klientów
- [**Pakiety**]([29][panel-admina]pakiety.md) - Zarządzanie pakietami subskrypcyjnymi
- [**CMS**]([30][panel-admina]cms.md) - Zarządzanie stronami i modułami CMS
- [**Finansowe**]([31][panel-admina]finansowe.md) - Transakcje i promocje
- [**Newsletter**]([32][panel-admina]newsletter.md) - Zarządzanie newsletterem
- [**Pomoc**]([33][panel-admina]pomoc.md) - Centrum pomocy i FAQ
- [**Klub partnerski**]([34][panel-admina]klub-partnerski.md) - Zarządzanie programem partnerskim
- [**Ustawienia**]([35][panel-admina]ustawienia.md) - Ustawienia systemowe i logi

## 🔗 DODATKOWE ZASOBY

- [**Struktura sitmapy**](sitemap-structure.txt) - Pełna struktura routingu aplikacji
- [**Linki systemowe**](links.txt) - Kompletna lista wszystkich ścieżek i endpointów API

## 📋 INFORMACJE TECHNICZNE

### Technologia
- **Frontend:** Next.js 16 App Router, React, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM
- **Baza danych:** PostgreSQL
- **Autentykacja:** NextAuth.js
- **Hosting:** Vercel

### Struktura projektu
```
app/                    # Strony aplikacji (Next.js App Router)
components/             # Komponenty React
lib/                    # Funkcje pomocnicze i konfiguracja
public/                 # Zasoby statyczne
public/docs/            # Dokumentacja techniczna
prisma/                 # Schema bazy danych i migracje
types/                  # Definicje typów TypeScript
```

### Konwencje nazewnictwa
- Pliki dokumentacji są numerowane dla zachowania porządku
- Nazwy plików zawierają kategorię w nawiasach kwadratowych
- Każdy dokument ma spis treści i sekcje z opisami funkcjonalności

---

## 📞 KONTAKT I WSPARCIE

W przypadku pytań technicznych lub potrzeby dodatkowych informacji:
- **Email:** support@prosta-sprawa.pl
- **Dokumentacja:** Aktualizowana regularnie
- **Wersja:** 1.0.0

---

*Ostatnia aktualizacja: 2025-11-19*