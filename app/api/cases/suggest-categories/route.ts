import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { NextRequest, NextResponse } from "next/server"

const OPENROUTER_MODEL = "deepseek/deepseek-v4-flash"

const SYSTEM_PROMPT = `Jesteś ekspertem prawnym pomagającym klientom platformy 'Prosta Sprawa' przyporządkować ich sprawę do właściwych kategorii prawnych. Na podstawie opisu sprawy klienta wybierz z dostarczonej listy od 1 do 3 kategorii, które najlepiej pasują do sprawy. Preferuj podkategorie (bardziej szczegółowe) nad kategoriami głównymi, jeśli pasują. Wybieraj WYŁĄCZNIE identyfikatory z dostarczonej listy — nie wymyślaj własnych.

Odpowiedz WYŁĄCZNIE poprawnym obiektem JSON (bez markdown, bez komentarzy) o dokładnie takiej strukturze:
{
  "categoryIds": ["id1", ...] — od 1 do 3 identyfikatorów kategorii z listy, posortowane od najlepiej pasującej,
  "uzasadnienie": "string — 1-2 zdania po polsku wyjaśniające klientowi, dlaczego te kategorie pasują do jego sprawy"
}`

// Model może opakować JSON w blok markdown mimo instrukcji — wyciągamy sam obiekt
function parseModelJson(content: string): unknown {
  const match = content.match(/\{[\s\S]*\}/)
  if (!match) {
    throw new Error("Brak obiektu JSON w odpowiedzi modelu")
  }
  return JSON.parse(match[0])
}

// POST /api/cases/suggest-categories - AI dobiera kategorie sprawy na podstawie opisu.
// Dostępne też bez sesji (kreator /dodaj-sprawe przed rejestracją) — jeśli sesja jest,
// musi to być CLIENT. Koszt wywołania (OpenRouter) ograniczamy rate-limitem per IP.
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (session?.user && session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rl = rateLimit(`suggest-categories:${getClientIp(request)}`, {
      limit: 15,
      windowMs: 60 * 60 * 1000,
    })
    if (!rl.success) return tooManyRequestsResponse(rl.retryAfterSeconds)

    const { opisSprawy, nazwaSprawy, typSprawy } = await request.json()

    if (typeof opisSprawy !== "string" || opisSprawy.trim().length < 50) {
      return NextResponse.json(
        { error: "Opis sprawy jest zbyt krótki — uzupełnij go, aby AI mogło dobrać kategorie" },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY nie jest ustawiony w zmiennych środowiskowych")
      return NextResponse.json(
        { error: "Automatyczny dobór kategorii jest chwilowo niedostępny (brak konfiguracji)" },
        { status: 500 }
      )
    }

    // Ta sama logika filtrowania co w formularzu dodawania sprawy
    const targetType = typSprawy === "OSOBA_PRYWATNA" ? "SPRAWY_PRYWATNE" : "SPRAWY_FIRMOWE"
    const categories = await prisma.category.findMany({
      where: { aktywna: true, typ: targetType },
      select: {
        id: true,
        nazwa: true,
        opis: true,
        parentId: true,
        parent: { select: { nazwa: true } },
      },
      orderBy: [{ parentId: "asc" }, { kolejnosc: "asc" }],
    })

    if (categories.length === 0) {
      return NextResponse.json(
        { error: "Brak dostępnych kategorii dla tego typu sprawy" },
        { status: 404 }
      )
    }

    const categoriesBlock = categories
      .map((cat) => {
        const path = cat.parent ? `${cat.parent.nazwa} → ${cat.nazwa}` : cat.nazwa
        const description = cat.opis ? ` — ${cat.opis.slice(0, 200)}` : ""
        return `- id: ${cat.id} | ${path}${description}`
      })
      .join("\n")

    const userPrompt = `=== DOSTĘPNE KATEGORIE (jedyne dozwolone identyfikatory) ===
${categoriesBlock}
=== KONIEC LISTY KATEGORII ===

${nazwaSprawy ? `Nazwa sprawy: ${nazwaSprawy}\n\n` : ""}Opis sprawy klienta:
${opisSprawy.slice(0, 8000)}`

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://prostasprawa.pl",
        "X-Title": "Prosta Sprawa",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("OpenRouter error response:", errorData)
      return NextResponse.json(
        { error: `Błąd API OpenRouter: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      return NextResponse.json(
        { error: "Niepoprawna odpowiedź z API OpenRouter" },
        { status: 500 }
      )
    }

    const parsed = parseModelJson(content) as {
      categoryIds?: unknown
      uzasadnienie?: unknown
    }

    // Zwracamy tylko identyfikatory faktycznie istniejące na liście dozwolonych kategorii
    const categoriesById = new Map(categories.map((cat) => [cat.id, cat]))
    const suggestedIds = Array.isArray(parsed.categoryIds)
      ? [...new Set(parsed.categoryIds.filter((id): id is string => typeof id === "string"))]
        .filter((id) => categoriesById.has(id))
        .slice(0, 3)
      : []

    if (suggestedIds.length === 0) {
      return NextResponse.json(
        { error: "AI nie potrafiło dopasować kategorii do opisu — wybierz kategorię ręcznie" },
        { status: 422 }
      )
    }

    return NextResponse.json({
      categories: suggestedIds.map((id) => {
        const cat = categoriesById.get(id)!
        return {
          id: cat.id,
          nazwa: cat.nazwa,
          path: cat.parent ? `${cat.parent.nazwa} → ${cat.nazwa}` : cat.nazwa,
        }
      }),
      uzasadnienie: typeof parsed.uzasadnienie === "string" ? parsed.uzasadnienie : "",
    })
  } catch (error) {
    console.error("Error in suggest-categories route:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas automatycznego doboru kategorii" },
      { status: 500 }
    )
  }
}
