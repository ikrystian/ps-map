import { prisma } from "@/lib/prisma"
import { getSubstitutionContext, type AccessFirm, type SubstitutionAccess } from "@/lib/substitutions/access"
import { CZYNNOSCI, DZIEDZINY, foldText, values } from "@/lib/substitutions/constants"
import { errorResponse, readJson } from "@/lib/substitutions/http"
import { geocodeCity, getSubstituteStats, personCard, settingsDTO } from "@/lib/substitutions/service"
import { formatDay } from "@/lib/substitutions/time"
import type { SettingsResponse } from "@/lib/substitutions/types"
import { SubstitutionError } from "@/lib/substitutions/workflow"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Nieprawidłowa data")

const settingsSchema = z.object({
  przyjmuje: z.boolean(),
  miasto: z.string().trim().max(100),
  promienKm: z.number().int().min(5).max(150),
  sady: z.array(z.string().trim().min(1).max(200)).max(30),
  zdalne: z.boolean(),
  czynnosci: z.array(z.enum(values(CZYNNOSCI))).nullable(),
  dziedziny: z.array(z.enum(values(DZIEDZINY))).nullable(),
  minStawka: z.number().int().min(0).max(100000).nullable(),
  niedostepnosc: z
    .array(z.object({ od: day, do: day }).refine((r) => r.od <= r.do, "Data końca jest wcześniejsza niż początek"))
    .max(20),
  emailOdRazu: z.boolean(),
  zestawienieDzienne: z.boolean(),
  smsPilne: z.boolean(),
  przypomnienie: z.boolean(),
})

const SMS_PACKAGES = ["PREMIUM", "BIZNES"]

function verificationText(firm: AccessFirm, access: SubstitutionAccess): string {
  if (access.rola === "ADWOKAT") {
    return `Konto zweryfikowane: adwokat, ORA ${firm.oraMiasto ?? ""}, nr wpisu ${firm.oraWpis ?? ""}.`
  }
  if (access.rola === "RADCA") {
    return `Konto zweryfikowane: radca prawny, OIRP ${firm.oirpMiasto ?? ""}, nr wpisu ${firm.oirpWpis ?? ""}.`
  }
  const rodzaj = firm.aplikantRodzaj === "RADCOWSKA" ? "radcowski" : "adwokacki"
  const since = firm.aplikacjaOd ? formatDay(firm.aplikacjaOd) : "—"
  const ready = access.aplikantGotowyOd ? formatDay(access.aplikantGotowyOd) : "—"
  return `Konto zweryfikowane: aplikant ${rodzaj}${firm.aplikantIzba ? `, izba ${firm.aplikantIzba}` : ""}, aplikacja od ${since}. Zastępstwa na upoważnienie przyjmujesz od ${ready}.`
}

async function buildResponse(firm: AccessFirm, access: SubstitutionAccess): Promise<SettingsResponse> {
  const [row, stats] = await Promise.all([
    prisma.substitutionSettings.findUnique({ where: { lawFirmId: firm.id } }),
    getSubstituteStats([firm.id]),
  ])
  return {
    ustawienia: settingsDTO(row, firm.user),
    karta: personCard(firm, stats.get(firm.id)),
    weryfikacja: verificationText(firm, access),
    pakiet: firm.pakietSubskrypcji,
    smsDostepny: SMS_PACKAGES.includes(firm.pakietSubskrypcji ?? ""),
  }
}

/** GET /api/substitutions/settings — ustawienia zastępcy i podgląd jego karty przy ofercie. */
export async function GET() {
  try {
    const ctx = await getSubstitutionContext()
    if (!ctx.ok) return ctx.response
    return NextResponse.json(await buildResponse(ctx.firm, ctx.access))
  } catch (error) {
    return errorResponse(error, "Błąd pobierania ustawień zastępstw")
  }
}

/** PUT /api/substitutions/settings — zapis ustawień (miasto geokodujemy do promienia). */
export async function PUT(request: NextRequest) {
  try {
    const ctx = await getSubstitutionContext()
    if (!ctx.ok) return ctx.response

    const parsed = settingsSchema.safeParse(await readJson(request))
    if (!parsed.success) throw new SubstitutionError(400, parsed.error.issues[0]?.message ?? "Nieprawidłowe ustawienia")
    const input = parsed.data

    const existing = await prisma.substitutionSettings.findUnique({ where: { lawFirmId: ctx.firm.id } })
    const cityChanged = foldText(existing?.miasto ?? "") !== foldText(input.miasto)
    let coords: { lat: number | null; lng: number | null } =
      existing && !cityChanged ? { lat: existing.latitude, lng: existing.longitude } : { lat: null, lng: null }
    if (input.miasto && (cityChanged || coords.lat == null)) {
      const found = await geocodeCity(input.miasto)
      if (found) coords = found
    }

    const data = {
      przyjmuje: input.przyjmuje,
      miasto: input.miasto || null,
      latitude: input.miasto ? coords.lat : null,
      longitude: input.miasto ? coords.lng : null,
      promienKm: input.promienKm,
      sady: JSON.stringify([...new Set(input.sady)]),
      zdalne: input.zdalne,
      czynnosci: input.czynnosci ? JSON.stringify(input.czynnosci) : null,
      dziedziny: input.dziedziny ? JSON.stringify(input.dziedziny) : null,
      minStawka: input.minStawka || null,
      niedostepnosc: JSON.stringify(input.niedostepnosc),
      emailOdRazu: input.emailOdRazu,
      zestawienieDzienne: input.zestawienieDzienne,
      smsPilne: input.smsPilne && SMS_PACKAGES.includes(ctx.firm.pakietSubskrypcji ?? ""),
      przypomnienie: input.przypomnienie,
    }
    await prisma.substitutionSettings.upsert({
      where: { lawFirmId: ctx.firm.id },
      create: { lawFirmId: ctx.firm.id, ...data },
      update: data,
    })

    return NextResponse.json(await buildResponse(ctx.firm, ctx.access))
  } catch (error) {
    return errorResponse(error, "Błąd zapisu ustawień zastępstw")
  }
}
