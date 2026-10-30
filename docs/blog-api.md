# API bloga — dodawanie wpisów

Endpoint pozwala systemom zewnętrznym dodawać wpisy bloga bez logowania do panelu.
Autoryzacja odbywa się tajnym kluczem ustawianym w panelu admina, a autorem wpisu jest wskazany moderator.

```
POST /api/external/blog
Content-Type: application/json
Authorization: Bearer <tajny klucz>
```

## Konfiguracja (jednorazowa)

1. Zaloguj się jako administrator → **Ustawienia → API bloga**.
2. Kliknij **Generuj** (albo wklej własny klucz, min. 32 znaki) i **zapisz ustawienia**.
3. Ustal `id` konta z rolą **MODERATOR** (panel admina → Użytkownicy) — to wartość pola `authorId`.

Wyczyszczenie klucza w ustawieniach wyłącza API (odpowiedź `503`). Zmiana klucza natychmiast unieważnia poprzedni.
Klucz traktuj jak hasło — trzymaj go wyłącznie po stronie serwera, nigdy w kodzie przeglądarki.

## Autoryzacja

Klucz przekazujesz w jednym z nagłówków:

| Nagłówek                        | Uwagi          |
| ------------------------------- | -------------- |
| `Authorization: Bearer <klucz>` | zalecany       |
| `x-api-key: <klucz>`            | alternatywnie  |

## Body żądania (JSON)

| Pole                  | Typ        | Wymagane | Opis                                                                                                                         |
| --------------------- | ---------- | :------: | ---------------------------------------------------------------------------------------------------------------------------- |
| `authorId`            | string     |   tak    | ID użytkownika z rolą `MODERATOR` (konto aktywne, nieusunięte). To on zostanie zapisany jako autor wpisu.                    |
| `tytul`               | string     |   tak    | Tytuł wpisu, maks. 300 znaków.                                                                                               |
| `tresc`               | string     |   tak    | Treść wpisu jako **HTML** (tak jak z edytora w panelu). Nagłówki `h2`–`h4` trafiają do spisu treści.                         |
| `slug`                | string     |   nie    | Adres wpisu (`/blog/<slug>`): małe litery a-z, cyfry, pojedyncze myślniki. Domyślnie generowany z tytułu.                    |
| `categoryId`          | string     |   nie    | ID kategorii bloga (z `GET /api/blog/categories`). Brak = wpis bez kategorii.                                                |
| `tagi`                | string[]   |   nie    | Słowa kluczowe, np. `["umowa", "najem"]`.                                                                                    |
| `obrazekWyrozniajacy` | string     |   nie    | Adres obrazka wyróżniającego: `https://…` albo ścieżka zaczynająca się od `/`.                                               |
| `metaTitle`           | string     |   nie    | Tytuł SEO.                                                                                                                   |
| `metaDescription`     | string     |   nie    | Opis SEO.                                                                                                                    |
| `opublikowany`        | boolean    |   nie    | `true` = publikuj. Domyślnie `false` (szkic, widoczny tylko w panelu).                                                       |
| `dataPublikacji`      | string     |   nie    | Data ISO 8601, np. `2026-11-05T09:00:00Z`. Przyszła data = publikacja zaplanowana. Działa tylko z `opublikowany: true`; bez niej wpis publikuje się od razu. |

Nieznane pola są ignorowane. Pola opcjonalne można pominąć albo przekazać jako `null` / `""`.

### Przykład

```bash
curl -X POST http://localhost:3000/api/external/blog \
  -H "Authorization: Bearer $BLOG_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "authorId": "6f1c2c1e-0d0e-4a64-9a55-3b5f3c1f7a10",
    "tytul": "Jak rozwiązać umowę najmu?",
    "tresc": "<p>Wstęp…</p><h2>Wypowiedzenie</h2><p>Treść…</p>",
    "categoryId": "b2d1f0aa-7c3e-4f56-8a1d-0e9c4b7a2d33",
    "tagi": ["najem", "umowa"],
    "obrazekWyrozniajacy": "https://cdn.example.com/najem.jpg",
    "metaTitle": "Jak rozwiązać umowę najmu — poradnik",
    "metaDescription": "Krok po kroku: wypowiedzenie, terminy, kaucja.",
    "opublikowany": true,
    "dataPublikacji": "2026-11-05T09:00:00Z"
  }'
```

Minimalne żądanie (zapisze szkic):

```json
{ "authorId": "<id moderatora>", "tytul": "Tytuł", "tresc": "<p>Treść</p>" }
```

## Odpowiedzi

### `201 Created`

```json
{
  "id": "0b8e7f52-…",
  "tytul": "Jak rozwiązać umowę najmu?",
  "slug": "jak-rozwiazac-umowe-najmu",
  "categoryId": "b2d1f0aa-…",
  "opublikowany": true,
  "dataPublikacji": "2026-11-05T09:00:00.000Z",
  "createdAt": "2026-10-30T12:00:00.000Z",
  "path": "/blog/jak-rozwiazac-umowe-najmu"
}
```

### Błędy

Każdy błąd ma postać `{ "error": "<komunikat po polsku>" }`.

| Status | Kiedy                                                                                                                                      |
| :----: | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `400`  | Nieprawidłowe body: brak `authorId` / `tytul` / `tresc`, zły typ pola, zły `slug`, zła data, nieistniejąca kategoria, `authorId` nie wskazuje aktywnego moderatora. |
| `401`  | Brak klucza lub niepoprawny klucz.                                                                                                         |
| `409`  | Wpis z takim `slug` już istnieje (podaj inny `slug` lub zmień tytuł).                                                                      |
| `429`  | Przekroczony limit 60 żądań na minutę z jednego IP (nagłówek `Retry-After` podaje czas oczekiwania w sekundach).                           |
| `500`  | Błąd serwera.                                                                                                                              |
| `503`  | API wyłączone — w ustawieniach admina nie ma ustawionego klucza.                                                                           |

## Autor wpisu

Wpis nie ma osobnego pola „autor”. Wskazany moderator jest zapisywany tak, jak każdy edytujący wpis:
jako ostatnia edycja (`lastEditedById`, rola `MODERATOR`) oraz pierwszy wpis w historii edycji.
W panelu admina widać go w **Historii edycji** wpisu, jako „imię i nazwisko (Moderator portalu)”.
Na stronie publicznej wpisy dodane tą drogą są wyświetlane jak pozostałe wpisy redakcji (bez przypisanej kancelarii).

## Czego endpoint nie obsługuje

Wpisy dodane przez API są wpisami redakcji portalu: nie da się przypisać kancelarii (`lawFirmId`), oznaczyć wpisu jako
sponsorowanego ani wskazać powiązanych artykułów. Te ustawienia można zmienić później w panelu admina.
