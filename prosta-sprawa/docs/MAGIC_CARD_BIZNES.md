# Magic Card - Integracja dla Kancelarii Biznes

## Przegląd

Komponent Magic Card został zintegrowany z systemem, aby wyróżnić kancelarie o pakiecie subskrypcji **BIZNES** na stronie wyszukiwania kancelarii. Komponent wyświetla efekt spotlight, który podąża za kursorem myszy i podświetla obramowanie karty z gradientem.

## Wykorzystane technologie

- **Motion/React** - Biblioteka do animacji (już zainstalowana w projekcie)
- **Tailwind CSS** - Stylowanie
- **React Hooks** - useMotionValue, useMotionTemplate

## Struktura implementacji

### 1. Komponent Magic Card

**Lokalizacja:** `/components/magic-card.tsx`

Komponent jest klientowy (`"use client"`) i wykorzystuje motion/react do tworzenia efektu spotlight.

**Właściwości:**
- `children` - Zawartość karty (React.ReactNode)
- `className` - Dodatkowe klasy CSS
- `gradientSize` - Rozmiar gradientu (domyślnie 200px)
- `gradientColor` - Kolor gradientu wewnętrznego (domyślnie #262626)
- `gradientOpacity` - Przezroczystość gradientu (domyślnie 0.8)
- `gradientFrom` - Kolor początkowy gradientu obramowania (domyślnie #9E7AFF - fiolet)
- `gradientTo` - Kolor końcowy gradientu obramowania (domyślnie #FE8BBB - róż)

**Funkcjonalności:**
- Śledzenie pozycji kursora myszy
- Animowany gradient obramowania
- Efekt spotlight wewnątrz karty
- Automatyczne resetowanie efektu przy opuszczeniu karty
- Obsługa zdarzeń: pointerMove, pointerLeave, pointerEnter
- Obsługa zdarzeń globalnych: pointerout, blur, visibilitychange

### 2. Integracja na stronie wyszukiwania

**Lokalizacja:** `/app/(public)/szukaj-prawnika/page.tsx`

#### Zmiany:

1. **Import komponentu:**
```tsx
import { MagicCard } from "@/components/magic-card"
import { Sparkles } from "lucide-react"
```

2. **Rozszerzenie interfejsu LawFirm:**
```tsx
interface LawFirm {
  // ... istniejące pola
  pakietSubskrypcji?: string
}
```

3. **Warunkowe renderowanie w widoku siatki:**
- Kancelarie z pakietem BIZNES są owijane w komponent `MagicCard`
- Kancelarie z innymi pakietami wyświetlają się jako zwykłe karty
- Dodany badge "Biznes" z ikoną Sparkles dla kancelarii BIZNES

### 3. API Endpoint

**Lokalizacja:** `/app/api/law-firms/route.ts`

**Zmiana:**
- Dodane pole `pakietSubskrypcji` do odpowiedzi GET

```typescript
pakietSubskrypcji: firm.pakietSubskrypcji,
```

## Wygląd i styl

### Dla kancelarii BIZNES:
- Obramowanie z animowanym gradientem (fiolet → róż)
- Efekt spotlight podążający za kursorem
- Badge "Biznes" z ikoną gwiazdy
- Gradient w tle: `from-purple-500 to-pink-500`

### Dla pozostałych kancelarii:
- Standardowe obramowanie
- Zwykły efekt hover (shadow)
- Bez specjalnych efektów

## Konfiguracja kolorów

Kolory gradientu można dostosować poprzez props komponentu:

```tsx
<MagicCard
  gradientFrom="#9E7AFF"    // Fiolet
  gradientTo="#FE8BBB"      // Róż
  gradientSize={200}
  gradientColor="#262626"
>
  {/* Zawartość */}
</MagicCard>
```

## Wydajność

- Komponent używa `useMotionValue` do śledzenia pozycji myszy
- Animacje są optymalizowane przez motion/react
- Efekt spotlight jest renderowany tylko dla kancelarii BIZNES
- Brak wpływu na wydajność dla pozostałych kancelarii

## Testowanie

### Scenariusze testowe:

1. **Wyświetlanie efektu:**
   - [ ] Kancelaria z pakietem BIZNES wyświetla Magic Card
   - [ ] Efekt spotlight podąża za kursorem
   - [ ] Gradient obramowania jest widoczny

2. **Interakcja:**
   - [ ] Efekt resetuje się przy opuszczeniu karty
   - [ ] Efekt resetuje się przy utracie fokusa okna
   - [ ] Efekt resetuje się przy zmianie widoczności strony

3. **Responsywność:**
   - [ ] Magic Card działa na urządzeniach mobilnych
   - [ ] Efekt spotlight jest widoczny na wszystkich rozmiarach ekranu

4. **Kompatybilność:**
   - [ ] Działa w Chrome, Firefox, Safari, Edge
   - [ ] Brak błędów w konsoli

## Rozwiązywanie problemów

### Efekt spotlight nie jest widoczny

**Przyczyna:** Kancelaria nie ma pakietu BIZNES

**Rozwiązanie:** Sprawdź pole `pakietSubskrypcji` w bazie danych

### Animacja jest nierówna

**Przyczyna:** Problemy z wydajnością przeglądarki

**Rozwiązanie:** Zmniejsz `gradientSize` lub zmniejsz liczbę kancelarii na stronie

### Kolory gradientu nie są prawidłowe

**Przyczyna:** Zmienne CSS nie są zdefiniowane

**Rozwiązanie:** Upewnij się, że `--border` i `--background` są zdefiniowane w theme

## Przyszłe usprawnienia

1. **Konfiguracja kolorów w panelu admina** - Pozwolić administratorom na zmianę kolorów gradientu
2. **Różne efekty dla różnych pakietów** - Np. inny efekt dla PREMIUM
3. **Animacja wejścia** - Dodać animację przy załadowaniu strony
4. **Efekt na liście** - Rozszerzyć Magic Card na widok listy
5. **Efekt na karcie profilu** - Wyświetlać Magic Card na stronie profilu kancelarii

## Licencje

- **Motion/React** - MIT License
- **Tailwind CSS** - MIT License

---

**Autor:** Claude
**Data:** 2025-11-16
**Wersja:** 1.0
