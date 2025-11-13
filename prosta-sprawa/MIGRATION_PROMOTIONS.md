# Migracja: Zarządzanie Promocjami z Panelu Administratora

## Przegląd zmian

Ta migracja dodaje możliwość zarządzania typami promocji z poziomu panelu administratora zamiast używania zahardkodowanych wartości.

### Główne zmiany:

1. **Nowy model bazy danych**: `PromotionConfig` - przechowuje konfiguracje typów promocji
2. **Nowa zakładka w panelu admin**: `/admin/promocje` - interfejs do zarządzania typami promocji
3. **Nowe API endpoints**:
   - `GET /api/admin/promotion-configs` - lista konfiguracji (admin)
   - `POST /api/admin/promotion-configs` - utworzenie konfiguracji (admin)
   - `GET /api/admin/promotion-configs/[id]` - szczegóły konfiguracji (admin)
   - `PUT /api/admin/promotion-configs/[id]` - aktualizacja konfiguracji (admin)
   - `DELETE /api/admin/promotion-configs/[id]` - usunięcie konfiguracji (admin)
   - `GET /api/promotion-configs` - lista aktywnych konfiguracji (publiczne)
4. **Aktualizacja strony kancelarii**: `/panel-kancelarii/promowanie` - teraz pobiera typy promocji z API

## Instrukcje wdrożenia

### Krok 1: Wygeneruj i zastosuj migrację Prisma

```bash
cd prosta-sprawa

# Wygeneruj migrację
npx prisma migrate dev --name add_promotion_config_model

# Lub jeśli używasz SQLite w produkcji, użyj db push
npx prisma db push
```

### Krok 2: Wygeneruj klienta Prisma

```bash
npx prisma generate
```

### Krok 3: Załaduj dane początkowe

Skrypt seed został zaktualizowany o dane początkowe dla typów promocji:

```bash
npx prisma db seed
```

Alternatywnie, możesz ręcznie uruchomić skrypt seed:

```bash
npx tsx prisma/seed.ts
```

### Krok 4: Zrestartuj aplikację

```bash
npm run dev
```

## Struktura modelu PromotionConfig

```prisma
model PromotionConfig {
  id                String   @id @default(uuid())
  type              PromotionType @unique  // PODBICIE_OGLOSZENIA, WYROZNIENIE, TOP_LISTA, STRONA_GLOWNA
  label             String                  // Nazwa wyświetlana
  description       String                  // Opis promocji
  pointsPerDay      Int?                    // Koszt punktów dziennie
  pointsPerWeek     Int?                    // Koszt punktów tygodniowo
  features          String                  // JSON array cech promocji
  icon              String?                 // Nazwa ikony (np. "TrendingUp")
  color             String?                 // Kolor w formacie hex (np. "#3b82f6")
  aktywna           Boolean  @default(true)  // Czy promocja jest aktywna
  kolejnosc         Int      @default(0)     // Kolejność wyświetlania
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

## Domyślne typy promocji

Po uruchomieniu seeda zostaną utworzone następujące typy promocji:

1. **Podbicie ogłoszenia** (PODBICIE_OGLOSZENIA)
   - Koszt: 20 pkt/dzień
   - Ikona: TrendingUp
   - Kolor: #3b82f6 (niebieski)

2. **Wyróżnienie** (WYROZNIENIE)
   - Koszt: 50 pkt/tydzień
   - Ikona: Sparkles
   - Kolor: #a855f7 (fioletowy)

3. **TOP Lista** (TOP_LISTA)
   - Koszt: 100 pkt/tydzień
   - Ikona: Award
   - Kolor: #f97316 (pomarańczowy)

4. **Strona główna** (STRONA_GLOWNA)
   - Koszt: 200 pkt/tydzień
   - Ikona: Home
   - Kolor: #ef4444 (czerwony)

## Jak używać

### Panel Administratora

1. Zaloguj się jako administrator
2. Przejdź do `/admin/promocje`
3. Tutaj możesz:
   - Dodawać nowe typy promocji
   - Edytować istniejące (nazwa, opis, koszt, cechy)
   - Dezaktywować/aktywować promocje
   - Usuwać typy promocji
   - Zmieniać kolejność wyświetlania

### Panel Kancelarii

Strona `/panel-kancelarii/promowanie` automatycznie pobiera aktywne typy promocji z bazy danych. Kancelarie widzą tylko aktywne promocje w kolejności określonej przez administratora.

## Rollback (w razie problemów)

Jeśli wystąpią problemy, możesz cofnąć zmiany:

```bash
# Cofnij ostatnią migrację
npx prisma migrate resolve --rolled-back <migration-name>

# Przywróć poprzednią wersję z gita
git revert HEAD
```

## Testowanie

Po wdrożeniu przetestuj:

1. ✅ Logowanie jako administrator
2. ✅ Dostęp do `/admin/promocje`
3. ✅ Tworzenie nowego typu promocji
4. ✅ Edycja istniejącego typu promocji
5. ✅ Dezaktywacja promocji
6. ✅ Sprawdzenie czy kancelaria widzi tylko aktywne promocje
7. ✅ Sprawdzenie czy koszty są prawidłowo kalkulowane
8. ✅ Tworzenie promocji przez kancelarię z nowym typem

## Pliki zmienione

### Baza danych:
- `prisma/schema.prisma` - dodano model PromotionConfig
- `prisma/seed.ts` - dodano seeding dla promotion configs

### API (backend):
- `app/api/admin/promotion-configs/route.ts` - CRUD dla admin
- `app/api/admin/promotion-configs/[id]/route.ts` - operacje na pojedynczym rekordzie
- `app/api/promotion-configs/route.ts` - publiczny endpoint dla kancelarii

### UI (frontend):
- `app/admin/layout.tsx` - dodano zakładkę "Promocje"
- `app/admin/promocje/page.tsx` - nowa strona zarządzania promocjami
- `app/panel-kancelarii/promowanie/page.tsx` - zaktualizowano o pobieranie z API

## Wymagania systemowe

- Node.js >= 18
- Prisma >= 5.0
- Next.js >= 14

## Wsparcie

W przypadku problemów sprawdź:
1. Logi aplikacji
2. Logi migracji Prisma
3. Console przeglądarki (błędy API)

## Autor

Utworzone przez: Claude
Data: 2025-11-13
