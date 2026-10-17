import { getLegalPageContent, isLegalPageSlug, type LegalPageSlug } from "@/lib/legal-pages"
import { generateLegalPagePdf } from "@/lib/legal-pages/pdf"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { NextRequest, NextResponse } from "next/server"

// Treść jest edytowalna w panelu admina — PDF generujemy na żądanie z bieżącej wersji
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const DOCUMENTS: Record<LegalPageSlug, { title: string; fileName: string }> = {
  "regulamin": { title: "Regulamin serwisu", fileName: "Regulamin serwisu ProstaSprawa.pl" },
  "polityka-prywatnosci": { title: "Polityka prywatności", fileName: "Polityka prywatności ProstaSprawa.pl" },
}

// GET /api/legal-pages/[slug]/pdf - PDF strony prawnej wygenerowany z aktualnej treści (publiczny)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  if (!isLegalPageSlug(slug)) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 })
  }

  const rl = rateLimit(`legal-pdf:${getClientIp(request)}`, { limit: 20, windowMs: 60 * 1000 })
  if (!rl.success) return tooManyRequestsResponse(rl.retryAfterSeconds)

  try {
    const document = DOCUMENTS[slug]
    const content = await getLegalPageContent(slug)
    const pdf = await generateLegalPagePdf(content, { documentTitle: document.title })

    const fileName = `${document.fileName}.pdf`
    const asciiFileName = fileName.normalize("NFD").replace(/[^\x20-\x7E]/g, "").replace(/"/g, "")

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Content-Length": String(pdf.length),
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error(`Error generating PDF for legal page "${slug}":`, error)
    return NextResponse.json({ error: "Nie udało się wygenerować pliku PDF" }, { status: 500 })
  }
}
