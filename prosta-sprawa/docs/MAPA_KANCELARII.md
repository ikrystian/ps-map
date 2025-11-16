# Mapa Kancelarii - Dokumentacja

## Przegląd

Funkcjonalność mapy pozwala na wizualizację zarejestrowanych kancelarii prawnych na interaktywnej mapie Polski. Użytkownicy mogą:

- Przeglądać kancelarie na mapie
- Klikać w markery, aby zobaczyć szczegóły kancelarii
- Filtrować kancelarie według kategorii i lokalizacji
- Przejść bezpośrednio do profilu kancelarii

## Wykorzystane technologie

- **Leaflet.js 1.9.4** - Biblioteka do map interaktywnych
- **React Leaflet 4.2.1** - Wrapper React dla Leaflet
- **OpenStreetMap** - Dane mapowe

## Struktura implementacji

### 1. Schemat bazy danych

Dodano dwa nowe pola do modelu `LawFirm` w `/prisma/schema.prisma`:

```prisma
model LawFirm {
  // ... inne pola
  latitude   Float?  // Współrzędne geograficzne dla mapy
  longitude  Float?  // Współrzędne geograficzne dla mapy
}
```

**Uwaga:** Te pola są opcjonalne (`Float?`). Kancelarie bez współrzędnych nie będą wyświetlane na mapie.

### 2. Komponent mapy

**Lokalizacja:** `/components/map/LawFirmMap.tsx`

Komponent jest klientowy (`"use client"`) i wykorzystuje dynamiczny import, aby uniknąć problemów z SSR (Server-Side Rendering).

**Właściwości:**
- `lawFirms` - Opcjonalna lista kancelarii do wyświetlenia
- `height` - Wysokość mapy (domyślnie `600px`)
- `zoom` - Poziom przybliżenia (domyślnie `6`)
- `center` - Centrum mapy (domyślnie środek Polski: `[52.0693, 19.4803]`)

**Funkcjonalności:**
- Automatyczne pobieranie danych z API, jeśli nie zostały przekazane jako props
- Wyświetlanie markerów dla kancelarii z współrzędnymi
- Popup z informacjami o kancelarii (logo, nazwa, lokalizacja, opis)
- Link do profilu kancelarii w popup
- Licznik wyświetlonych kancelarii
- Stan ładowania z animacją

**Przykład użycia:**

```tsx
import LawFirmMap from "@/components/map/LawFirmMap"

// Podstawowe użycie (pobierze dane z API)
<LawFirmMap />

// Z przekazanymi danymi
<LawFirmMap
  lawFirms={lawFirmsData}
  height="800px"
  zoom={7}
/>
```

### 3. API Endpoint

**Lokalizacja:** `/app/api/law-firms/map/route.ts`

**Metoda:** `GET`

**Parametry zapytania:**
- `category` - Filtrowanie po ID kategorii (opcjonalne)
- `voivodeship` - Filtrowanie po ID województwa (opcjonalne)
- `search` - Wyszukiwanie w nazwie i opisie (opcjonalne)

**Filtrowanie:**
- Tylko zweryfikowane kancelarie (`zweryfikowana: true`)
- Tylko aktywne kancelarie (`aktywna: true`)
- Tylko kancelarie z współrzędnymi (`latitude` i `longitude` nie są null)
- Użytkownicy nie usunięci (`deletedAt: null`)

**Limit:** Maksymalnie 500 kancelarii dla wydajności

**Odpowiedź:**

```json
[
  {
    "id": "uuid",
    "nazwa": "Nazwa Kancelarii",
    "slug": "nazwa-kancelarii",
    "miasto": "Warszawa",
    "latitude": 52.2297,
    "longitude": 21.0122,
    "logo": "/uploads/law-firms/logo.jpg",
    "opis": "Opis kancelarii (max 150 znaków)...",
    "voivodeship": {
      "id": "uuid",
      "nazwa": "Mazowieckie"
    },
    "categories": [
      {
        "id": "uuid",
        "nazwa": "Prawo cywilne"
      }
    ]
  }
]
```

### 4. Integracja ze stroną wyszukiwania

**Lokalizacja:** `/app/(public)/szukaj-prawnika/page.tsx`

Dodano nowy tryb widoku "mapa" obok istniejących "siatka" i "lista".

**Zmiany:**
1. Import komponentu mapy z dynamicznym ładowaniem
2. Rozszerzenie typu `viewMode` o opcję `"map"`
3. Dodanie przycisku mapy do przełącznika widoków
4. Renderowanie komponentu mapy w trybie widoku mapy

**Przełącznik widoku:**
```tsx
<Button
  variant={viewMode === "map" ? "default" : "ghost"}
  size="sm"
  onClick={() => setViewMode("map")}
>
  <MapIcon className="h-4 w-4" />
</Button>
```

## Instalacja i konfiguracja

### 1. Instalacja zależności

```bash
cd prosta-sprawa
npm install
```

To zainstaluje wszystkie zależności, w tym:
- `leaflet@^1.9.4`
- `react-leaflet@^4.2.1`
- `@types/leaflet@^1.9.8` (dev dependency)

### 2. Aktualizacja bazy danych

```bash
# Zastosuj zmiany w schemacie
npm run db:push

# Wygeneruj klienta Prisma
npm run db:generate
```

### 3. Dodanie współrzędnych geograficznych

Współrzędne można dodać na kilka sposobów:

#### a) Ręcznie przez Prisma Studio

```bash
npm run db:studio
```

Następnie w interfejsie Prisma Studio:
1. Otwórz tabelę `LawFirm`
2. Edytuj rekord kancelarii
3. Dodaj wartości `latitude` i `longitude`

#### b) Przez API lub panel administracyjny

W panelu kancelarii lub administracyjnym można dodać formularz do wprowadzania współrzędnych.

#### c) Automatycznie z geocoding API

Można zaimplementować automatyczne pobieranie współrzędnych na podstawie adresu używając:
- Google Maps Geocoding API
- Nominatim (OpenStreetMap)
- Mapbox Geocoding

**Przykład z Nominatim:**

```typescript
async function geocodeAddress(adres: string, miasto: string, kodPocztowy: string) {
  const query = encodeURIComponent(`${adres}, ${kodPocztowy} ${miasto}, Poland`)
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`
  )
  const data = await response.json()

  if (data.length > 0) {
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon)
    }
  }

  return null
}
```

## Stylowanie

Komponent mapy używa Tailwind CSS i domyślnych styli z Leaflet.

**Wymagane style Leaflet:**
```tsx
import "leaflet/dist/leaflet.css"
```

To jest już zawarte w komponencie `LawFirmMap.tsx`.

## Dostosowywanie

### Zmiana dostawcy mapy

Domyślnie używamy OpenStreetMap. Można zmienić na innego dostawcę (np. Mapbox, Google Maps):

```tsx
<TileLayer
  attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
  url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
  id="mapbox/streets-v11"
  accessToken="YOUR_MAPBOX_TOKEN"
/>
```

### Własne ikony markerów

Można dostosować wygląd markerów:

```tsx
import L from "leaflet"

const customIcon = new L.Icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

<Marker position={[lat, lng]} icon={customIcon}>
```

### Klasteryzacja markerów

Dla dużej liczby kancelarii warto rozważyć klasteryzację markerów używając `react-leaflet-cluster`:

```bash
npm install react-leaflet-cluster
```

```tsx
import MarkerClusterGroup from "react-leaflet-cluster"

<MarkerClusterGroup>
  {lawFirms.map(firm => (
    <Marker key={firm.id} position={[firm.latitude, firm.longitude]}>
      <Popup>...</Popup>
    </Marker>
  ))}
</MarkerClusterGroup>
```

## Wydajność

### Optymalizacje zastosowane:

1. **Limit 500 kancelarii** - Zapobiega przeciążeniu mapy
2. **Filtrowanie w bazie danych** - Tylko kancelarie ze współrzędnymi
3. **Dynamiczny import** - Komponent nie jest ładowany przy SSR
4. **Skrócony opis** - Max 150 znaków w popup

### Dalsze optymalizacje:

1. **Lazy loading markerów** - Ładowanie tylko widocznych markerów
2. **Klasteryzacja** - Grupowanie bliskich markerów
3. **Caching** - Cache odpowiedzi API
4. **Viewport filtering** - Filtrowanie markerów po widocznym obszarze

## Testowanie

### Scenariusze testowe:

1. **Podstawowe wyświetlanie:**
   - [ ] Mapa ładuje się poprawnie
   - [ ] Markery wyświetlają się dla kancelarii ze współrzędnymi
   - [ ] Licznik pokazuje prawidłową liczbę kancelarii

2. **Interakcja z markerami:**
   - [ ] Kliknięcie markera otwiera popup
   - [ ] Popup zawiera poprawne dane (logo, nazwa, lokalizacja)
   - [ ] Link "Zobacz profil" przekierowuje do profilu kancelarii

3. **Filtrowanie:**
   - [ ] Mapa respektuje filtry kategorii
   - [ ] Mapa respektuje filtry lokalizacji
   - [ ] Wyszukiwanie działa poprawnie

4. **Responsywność:**
   - [ ] Mapa działa na urządzeniach mobilnych
   - [ ] Popup jest czytelny na małych ekranach
   - [ ] Kontrolki mapy są dostępne

5. **Wydajność:**
   - [ ] Ładowanie mapy nie blokuje renderowania strony
   - [ ] Interakcja z mapą jest płynna
   - [ ] Brak problemów z pamięcią przy wielu markerach

## Rozwiązywanie problemów

### Mapa nie ładuje się

**Przyczyna:** Problemy z SSR w Next.js

**Rozwiązanie:** Upewnij się, że komponent jest importowany dynamicznie:
```tsx
const LawFirmMap = dynamic(
  () => import("@/components/map/LawFirmMap"),
  { ssr: false }
)
```

### Markery nie wyświetlają się

**Przyczyna 1:** Kancelarie nie mają współrzędnych

**Rozwiązanie:** Dodaj współrzędne do bazy danych

**Przyczyna 2:** Nieprawidłowe współrzędne

**Rozwiązanie:** Sprawdź format (latitude: -90 do 90, longitude: -180 do 180)

### Błąd "Cannot read property 'lat' of null"

**Przyczyna:** Próba renderowania markera bez współrzędnych

**Rozwiązanie:** Komponent już filtruje kancelarie - sprawdź API endpoint

### Style Leaflet nie działają

**Przyczyna:** Nie zaimportowano CSS

**Rozwiązanie:** Dodaj import w komponencie:
```tsx
import "leaflet/dist/leaflet.css"
```

## Przyszłe usprawnienia

1. **Geocoding automatyczny** - Dodawanie współrzędnych przy tworzeniu kancelarii
2. **Rysowanie obszarów działania** - Pokazywanie zasięgu kancelarii
3. **Filtry na mapie** - Bezpośrednie filtrowanie przez interakcję z mapą
4. **Heatmapa** - Wizualizacja gęstości kancelarii
5. **Routing** - Wyznaczanie trasy do kancelarii
6. **街景** - Integracja ze Street View (jeśli używamy Google Maps)
7. **Mapa w profilu kancelarii** - Pokazywanie lokalizacji na stronie profilu

## API Reference

### Endpoint: GET /api/law-firms/map

**Parametry zapytania:**

| Parametr | Typ | Wymagany | Opis |
|----------|-----|----------|------|
| category | string | Nie | ID kategorii do filtrowania |
| voivodeship | string | Nie | ID województwa do filtrowania |
| search | string | Nie | Tekst do wyszukiwania |

**Odpowiedź:** 200 OK

```typescript
Array<{
  id: string
  nazwa: string
  slug: string
  miasto: string
  latitude: number
  longitude: number
  logo?: string | null
  opis?: string | null
  voivodeship: {
    id: string
    nazwa: string
  }
  categories: Array<{
    id: string
    nazwa: string
  }>
}>
```

**Błąd:** 500 Internal Server Error

```json
{
  "error": "Wystąpił błąd podczas pobierania danych kancelarii"
}
```

## Licencje

- **Leaflet** - BSD 2-Clause License
- **OpenStreetMap** - ODbL (Open Database License)
- **React Leaflet** - MIT License

**Uwaga:** Przy użyciu OpenStreetMap należy umieścić atrybucję na mapie (już zawarte w komponencie).

---

**Autor:** Claude
**Data:** 2025-11-16
**Wersja:** 1.0
