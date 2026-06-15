import { formatExpertsForPrompt, getExpertsCatalog } from "@/lib/experts"
import { NextRequest } from "next/server"

const OPENROUTER_MODEL = "deepseek/deepseek-v4-flash"

const BASE_SYSTEM_PROMPT = `Jesteś inteligentnym, pomocnym i uprzejmym asystentem AI na platformie 'Prosta Sprawa'. Platforma ta łączy klientów z profesjonalnymi ekspertami prawnymi, prawnikami, radcami prawnymi i adwokatami w ich okolicy. Pomagasz użytkownikom poruszać się po stronie, odpowiadasz na ich ogólne pytania w sposób informacyjny (zawsze zaznaczając, że nie jest to oficjalna porada prawna, a jedynie informacja edukacyjna), oraz zachęcasz ich do skorzystania z wyszukiwarki lub formularza kontaktowego, aby skontaktować się z prawdziwym ekspertem. Odpowiadaj zwięźle, profesjonalnie i po przyjacielsku w języku polskim.

Gdy z opisu problemu użytkownika wynika, jakiej specjalizacji potrzebuje, zaproponuj konkretnego eksperta z poniższej listy, którego specjalizacja najlepiej pasuje do sprawy. Podaj jego imię i nazwisko (lub nazwę firmy) oraz wstaw link do jego profilu w formacie markdown, np. [Imię Nazwisko](/ekspert/slug). Jeśli to pomocne, uwzględnij lokalizację eksperta. Nie wymyślaj ekspertów ani danych — korzystaj wyłącznie z poniższej listy. Jeśli żaden ekspert nie pasuje do problemu, zaproponuj skorzystanie z wyszukiwarki ekspertów na stronie.`

function buildSystemPrompt(expertsBlock: string): string {
  return `${BASE_SYSTEM_PROMPT}

=== DOSTĘPNI EKSPERCI (źródło prawdy — nie wymyślaj innych) ===
${expertsBlock}
=== KONIEC LISTY EKSPERTÓW ===`
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Brak lub nieprawidłowa historia wiadomości" },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY nie jest ustawiony w zmiennych środowiskowych")
      return Response.json(
        { error: "Asystent jest chwilowo niedostępny (brak konfiguracji)" },
        { status: 500 }
      )
    }

    // Pobierz aktualny katalog ekspertów, aby asystent mógł podpowiedzieć
    // konkretnego specjalistę dopasowanego do problemu użytkownika.
    let expertsBlock = "Brak dostępnych ekspertów w bazie."
    try {
      const experts = await getExpertsCatalog({ limit: 60 })
      expertsBlock = formatExpertsForPrompt(experts)
    } catch (expertsError) {
      // Brak listy ekspertów nie powinien blokować rozmowy.
      console.error("Nie udało się pobrać ekspertów dla asystenta:", expertsError)
    }

    // OpenRouter API URL
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://prosta-sprawa.pl",
        "X-Title": "Prosta Sprawa",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(expertsBlock),
          },
          ...messages
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("OpenRouter error response:", errorData)
      return Response.json(
        { error: `Błąd API OpenRouter: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Extract choices[0].message
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return Response.json({
        message: data.choices[0].message
      })
    }

    return Response.json(
      { error: "Niepoprawna odpowiedź z API OpenRouter" },
      { status: 500 }
    )
  } catch (error) {
    console.error("Error in chat route:", error)
    return Response.json(
      { error: "Wystąpił błąd podczas komunikacji z asystentem" },
      { status: 500 }
    )
  }
}
