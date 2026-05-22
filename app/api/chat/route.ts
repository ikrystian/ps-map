import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Brak lub nieprawidłowa historia wiadomości" },
        { status: 400 }
      )
    }

    // OpenRouter API URL
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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",
        "HTTP-Referer": "https://prosta-sprawa.pl",
        "X-Title": "Prosta Sprawa",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "Jesteś inteligentnym, pomocnym i uprzejmym asystentem AI na platformie 'Prosta Sprawa'. Platforma ta łączy klientów z profesjonalnymi ekspertami prawnymi, prawnikami, radcami prawnymi i adwokatami w ich okolicy. Pomagasz użytkownikom poruszać się po stronie, odpowiadasz na ich ogólne pytania w sposób informacyjny (zawsze zaznaczając, że nie jest to oficjalna porada prawna, a jedynie informacja edukacyjna), oraz zachęcasz ich do skorzystania z wyszukiwarki lub formularza kontaktowego, aby skontaktować się z prawdziwym ekspertem. Odpowiadaj zwięźle, profesjonalnie i po przyjacielsku w języku polskim."
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
