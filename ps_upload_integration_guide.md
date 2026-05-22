# Instrukcja Integracji z Serwisem Uploadu (`ps-upload`)

Dokument ten opisuje architekturę, interfejsy API oraz sposoby wdrożenia nowego, wydzielonego mikrosewisu przesyłania i obróbki plików (`ps-upload`) w głównym projekcie `ps-map`.

---

## 1. Architektura i Uruchomienie Serwisu

Serwis `ps-upload` to w pełni samodzielny projekt Next.js działający domyślnie na innym porcie niż główna aplikacja (np. port **3005**).

### Jak uruchomić serwis lokalnie:
1. Przejdź do folderu projektu: `ps-upload`.
2. Zainstaluj zależności (jeśli nie zostały zainstalowane): `npm install`.
3. Uruchom serwer na wybranym porcie (np. 3005):
   ```bash
   PORT=3005 npm run dev
   ```
4. Aplikacja będzie dostępna pod adresem: `http://localhost:3005`.

### Gdzie zapisywane są pliki:
Pliki są zapisywane lokalnie w katalogu `ps-upload/.uploads/` w podkatalogach `/images` oraz `/documents`. Dzięki temu nie zanieczyszczają folderu `public/` i mogą być serwowane w sposób kontrolowany.

---

## 2. Dostępne API w `ps-upload`

Serwis posiada pełne wsparcie dla **CORS** (skonfigurowane w `next.config.ts` oraz w nagłówkach odpowiedzi), co pozwala na bezpośrednie zapytania POST z frontendu innej domeny (np. `localhost:3000`).

### A. Przesyłanie Pliku (`POST /api/upload`)
Endpoint przyjmuje obiekt `FormData` z polem `file`.

* **Adres:** `http://localhost:3005/api/upload`
* **Metoda:** `POST`
* **Body (Multipart FormData):**
  - `file`: Plik binarny (obrazek lub dokument).
* **Przykładowa odpowiedź (JSON):**
  ```json
  {
    "success": true,
    "url": "http://localhost:3005/api/uploads/images/1716382021123-nazwa-pliku.jpg",
    "relativeUrl": "/api/uploads/images/1716382021123-nazwa-pliku.jpg",
    "filename": "1716382021123-nazwa-pliku.jpg",
    "originalName": "nazwa_pliku.jpg",
    "size": 435210,
    "mimetype": "image/jpeg"
  }
  ```

### B. Pobieranie / Serwowanie Pliku (`GET /api/uploads/[...path]`)
Służy do odczytu wgranych plików i automatycznego przesyłania odpowiednich nagłówków Content-Type oraz nagłówków pamięci podręcznej (cache-control).

* **Adres:** `http://localhost:3005/api/uploads/{subfolder}/{filename}` (np. `/api/uploads/images/1716382021123-nazwa-pliku.jpg`)
* **Metoda:** `GET`
* **Nagłówki odpowiedzi:**
  - `Content-Type`: dynamiczny na podstawie rozszerzenia (np. `image/png`, `application/pdf`).
  - `Access-Control-Allow-Origin`: `*` (umożliwia wczytywanie zasobów np. na Canvas w innych domenach).

---

## 3. Strategie Integracji w Głównym Projekcie (`ps-map`)

W celu zastąpienia dotychczasowego przesyłania plików (np. przez UploadThing lub lokalne endpointy `/api/upload/image`) w projekcie `ps-map`, można zastosować jedną z dwóch poniższych strategii.

### Strategia A: Integracja bezpośrednia z Frontendu (Zalecana)
Ponieważ serwis `ps-upload` obsługuje CORS, przeglądarka użytkownika w aplikacji `ps-map` (port 3000) może przesyłać pliki bezpośrednio na port 3005.

#### Krok 1: Definicja zmiennej środowiskowej w `.env.local` projektu `ps-map`
```env
NEXT_PUBLIC_UPLOAD_SERVICE_URL=http://localhost:3005
```

#### Krok 2: Modyfikacja komponentu uploadu na frontendzie (np. w `components/ui/image-upload.tsx`)
Zamiast wysyłać zapytanie do `/api/upload`, kierujemy je do nowego serwisu:

```typescript
// Fragment kodu w components/ui/image-upload.tsx
const handleFileUpload = async (file: File) => {
  const uploadServiceUrl = process.env.NEXT_PUBLIC_UPLOAD_SERVICE_URL || "http://localhost:3005";
  
  setIsUploading(true);
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${uploadServiceUrl}/api/upload`, {
      method: "POST",
      body: formData,
      // Nie dołączamy nagłówka Content-Type, przeglądarka ustawi go automatycznie z boundary
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    const data = await response.json();
    
    // Zapisujemy pełny URL zwrócony z serwisu (data.url)
    onChange(data.url);
    toast.success("Plik został przesłany pomyślnie!");
  } catch (error) {
    console.error("Upload error:", error);
    toast.error("Wystąpił błąd podczas przesyłania pliku");
  } finally {
    setIsUploading(false);
  }
};
```

---

### Strategia B: Proxy przez serwer Next.js (Server-to-Server)
Jeśli chcesz ukryć adres serwisu uploadu przed użytkownikiem końcowym lub uniknąć problemów z zaporami sieciowymi w środowisku produkcyjnym, możesz zachować dotychczasowe adresy API w `ps-map` (np. `/api/upload/image`), ale ich wewnętrzną logikę podmienić na przekazywanie (proxy) plików do `ps-upload`.

#### Przykład podmiany backendowej trasy w `ps-map/app/api/upload/image/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Przygotowanie nowego FormData do wysłania do mikrosewisu
    const serviceFormData = new FormData();
    serviceFormData.append("file", file);

    // Adres wewnętrzny mikrosewisu (np. z zmiennych środowiskowych)
    const UPLOAD_SERVICE_INTERNAL_URL = process.env.UPLOAD_SERVICE_INTERNAL_URL || "http://localhost:3005";

    const response = await fetch(`${UPLOAD_SERVICE_INTERNAL_URL}/api/upload`, {
      method: "POST",
      body: serviceFormData,
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Microservice error: ${errText}` }, { status: response.status });
    }

    const data = await response.json();

    // Zwracamy odpowiedź z mikrosewisu bezpośrednio do frontendu ps-map
    return NextResponse.json({
      success: true,
      url: data.url, // Zwraca pełny URL z portem 3005
      filename: data.filename,
    });
  } catch (error: any) {
    console.error("Proxy upload error:", error);
    return NextResponse.json({ error: "Failed to upload image via proxy" }, { status: 500 });
  }
}
```

---

## 4. Frontend: Przetwarzanie i Kadrowanie przed Uploadem

Aby zintegrować funkcję **kadrowania** (crop) i **zmniejszania rozmiaru** bezpośrednio w interfejsie użytkownika aplikacji `ps-map`, można wykorzystać logikę zastosowaną we frontendzie `ps-upload`.

Zależności do zainstalowania w `ps-map`:
```bash
npm install react-image-crop
```

### Pomocnicza funkcja kadrowania w projekcie (np. `lib/image-crop-utils.ts`):
```typescript
import { type PixelCrop } from "react-image-crop";

export function getCroppedCanvas(
  image: HTMLImageElement,
  pixelCrop: PixelCrop,
  maxWidth?: number,
  maxHeight?: number
): HTMLCanvasElement | null {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const sourceX = pixelCrop.x * scaleX;
  const sourceY = pixelCrop.y * scaleY;
  const sourceWidth = pixelCrop.width * scaleX;
  const sourceHeight = pixelCrop.height * scaleY;

  let targetWidth = sourceWidth;
  let targetHeight = sourceHeight;

  // Skalowanie proporcjonalne do zadanych limitów
  if (maxWidth && targetWidth > maxWidth) {
    const ratio = maxWidth / targetWidth;
    targetWidth = maxWidth;
    targetHeight = targetHeight * ratio;
  }
  if (maxHeight && targetHeight > maxHeight) {
    const ratio = maxHeight / targetHeight;
    targetHeight = maxHeight;
    targetWidth = targetWidth * ratio;
  }

  canvas.width = Math.floor(targetWidth);
  canvas.height = Math.floor(targetHeight);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas;
}
```

Dzięki temu, przed wysłaniem pliku metodą `fetch`, komponent React generuje plik z poziomu przeglądarki na elemencie `canvas`, wywołuje `canvas.toBlob(...)`, tworzy nowy obiekt `File` i dopiero ten odchudzony/wycięty plik przesyła do API.

---

## 5. Podsumowanie Wdrożenia

1. **Obrazki**: integracja frontendu z `react-image-crop` umożliwia użytkownikowi zaznaczenie interesującego obszaru. Ustawienia suwaków (`maxWidth`, `maxHeight` oraz `quality`) redukują wagę pliku bezpośrednio przed wysyłką.
2. **Dokumenty**: przesyłane są w trybie bezpośrednim bez obróbki (automatycznie przypisywane do podfolderu `/documents` na dysku mikrosewisu).
3. Serwis `ps-upload` działa jako samodzielny, szybki magazyn plików eliminując problem niedziałającego uploadu lokalnego na środowisku produkcyjnym `npm run start` w projekcie `ps-map`.
