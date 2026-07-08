import { auth } from "@/lib/auth"
import {
  LEGAL_PAGE_DEFAULTS,
  isLegalPageSlug,
  legalPageSettingsKey,
  sanitizeLegalPageContent,
} from "@/lib/legal-pages"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

const PAGE_LABELS: Record<string, string> = {
  "polityka-prywatnosci": "Polityka prywatności",
  "regulamin": "Regulamin",
}

// GET /api/admin/legal-pages/[slug] - Pobierz treść strony prawnej (ADMIN only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params
    if (!isLegalPageSlug(slug)) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    const defaults = LEGAL_PAGE_DEFAULTS[slug]
    const setting = await prisma.settings.findUnique({
      where: { key: legalPageSettingsKey(slug) },
    })

    let content = defaults
    let isCustomized = false

    if (setting?.value) {
      try {
        const sanitized = sanitizeLegalPageContent(JSON.parse(setting.value), defaults)
        if (sanitized) {
          content = sanitized
          isCustomized = true
        }
      } catch {
        // Uszkodzony JSON w bazie — edytor dostanie treść domyślną
      }
    }

    return NextResponse.json({ content, isCustomized })
  } catch (error) {
    console.error("Error fetching legal page content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/admin/legal-pages/[slug] - Zapisz treść strony prawnej (ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params
    if (!isLegalPageSlug(slug)) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    const body = await request.json()
    const content = sanitizeLegalPageContent(body?.content, LEGAL_PAGE_DEFAULTS[slug])

    if (!content) {
      return NextResponse.json(
        { error: "Treść musi zawierać co najmniej jeden rozdział z tytułem i akapitem" },
        { status: 400 }
      )
    }

    const key = legalPageSettingsKey(slug)
    await prisma.settings.upsert({
      where: { key },
      update: { value: JSON.stringify(content) },
      create: {
        key,
        value: JSON.stringify(content),
        description: `Treść strony ${PAGE_LABELS[slug]} (/${slug})`,
      },
    })

    return NextResponse.json({ content, isCustomized: true })
  } catch (error) {
    console.error("Error saving legal page content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/legal-pages/[slug] - Przywróć domyślną treść (ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params
    if (!isLegalPageSlug(slug)) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    await prisma.settings.deleteMany({
      where: { key: legalPageSettingsKey(slug) },
    })

    return NextResponse.json({ content: LEGAL_PAGE_DEFAULTS[slug], isCustomized: false })
  } catch (error) {
    console.error("Error resetting legal page content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
