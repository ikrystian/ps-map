import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

const OPENROUTER_MODEL = "deepseek/deepseek-v4-flash"

const SYSTEM_PROMPT = `Jesteś ekspertem SEO specjalizującym się w treściach prawniczych w języku polskim. Na podstawie treści artykułu blogowego wygeneruj metadane SEO.

Odpowiedz WYŁĄCZNIE poprawnym obiektem JSON (bez markdown, bez komentarzy) o dokładnie takiej strukturze:
{
  "metaTitle": "string — chwytliwy tytuł SEO, maksymalnie 60 znaków",
  "metaDescription": "string — opis zachęcający do kliknięcia w wynikach wyszukiwania, 120-160 znaków",
  "tagi": ["string", ...] — 5-8 słów kluczowych (fraz) najlepiej opisujących artykuł, małymi literami
}`

// Usuwa znaczniki HTML z treści edytora, aby wysłać do modelu czysty tekst
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
}

// Model może opakować JSON w blok markdown mimo instrukcji — wyciągamy sam obiekt
function parseModelJson(content: string): unknown {
  const match = content.match(/\{[\s\S]*\}/)
  if (!match) {
    throw new Error("Brak obiektu JSON w odpowiedzi modelu")
  }
  return JSON.parse(match[0])
}

// POST /api/admin/blog/generate-seo - Generuje metadane SEO na podstawie treści artykułu (tylko ADMIN)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { tytul, tresc } = await request.json()

    const plainText = typeof tresc === "string" ? stripHtml(tresc) : ""
    if (!plainText) {
      return NextResponse.json(
        { error: "Treść artykułu jest pusta — uzupełnij ją przed generowaniem SEO" },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY nie jest ustawiony w zmiennych środowiskowych")
      return NextResponse.json(
        { error: "Generator SEO jest chwilowo niedostępny (brak konfiguracji)" },
        { status: 500 }
      )
    }

    // Ograniczamy długość treści, aby zmieścić się w kontekście modelu
    const userPrompt = `${tytul ? `Tytuł artykułu: ${tytul}\n\n` : ""}Treść artykułu:\n${plainText.slice(0, 12000)}`

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
      metaTitle?: unknown
      metaDescription?: unknown
      tagi?: unknown
    }

    return NextResponse.json({
      metaTitle: typeof parsed.metaTitle === "string" ? parsed.metaTitle : "",
      metaDescription: typeof parsed.metaDescription === "string" ? parsed.metaDescription : "",
      tagi: Array.isArray(parsed.tagi)
        ? parsed.tagi.filter((tag): tag is string => typeof tag === "string" && tag.trim() !== "")
        : [],
    })
  } catch (error) {
    console.error("Error in generate-seo route:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas generowania metadanych SEO" },
      { status: 500 }
    )
  }
}
