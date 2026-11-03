import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import type { SubstitutionRole } from "./constants"
import { aplikantReadyFrom } from "./matching"
import { resolveRole } from "./people"

/**
 * Kto ma dostęp do zastępstw procesowych. Moduł widzą wyłącznie zweryfikowani
 * eksperci z wpisem adwokackim (ORA) lub radcowskim (OIRP) oraz aplikanci —
 * ci ostatni przyjmują zastępstwa dopiero po 6 miesiącach aplikacji i nie zlecają.
 */

export const ACCESS_FIRM_SELECT = {
  id: true,
  userId: true,
  nazwa: true,
  slug: true,
  nip: true,
  zweryfikowana: true,
  aktywna: true,
  oraStatus: true,
  oraWpis: true,
  oraMiasto: true,
  oirpStatus: true,
  oirpWpis: true,
  oirpMiasto: true,
  aplikantRodzaj: true,
  aplikantIzba: true,
  aplikacjaOd: true,
  punktySaldo: true,
  pakietSubskrypcji: true,
  user: {
    select: {
      imie: true,
      nazwisko: true,
      name: true,
      email: true,
      numerTelefonu: true,
      miasto: true,
      adres: true,
      kodPocztowy: true,
      latitude: true,
      longitude: true,
    },
  },
} satisfies Prisma.LawFirmSelect

export type AccessFirm = Prisma.LawFirmGetPayload<{ select: typeof ACCESS_FIRM_SELECT }>

export interface SubstitutionAccess {
  /** Widzi moduł (menu, giełdę, ustawienia). */
  dostep: boolean
  rola: SubstitutionRole | null
  /** Może dodawać własne zlecenia — adwokat i radca. */
  mozeZlecac: boolean
  /** Może zgłaszać się do zleceń — aplikant dopiero po 6 miesiącach aplikacji. */
  mozePrzyjmowac: boolean
  /** ISO — od kiedy aplikant przyjmuje zastępstwa. */
  aplikantGotowyOd: string | null
  /** Dlaczego brak dostępu (do pokazania w panelu). */
  powod: string | null
}

export function resolveAccess(firm: AccessFirm, now = new Date()): SubstitutionAccess {
  const rola = resolveRole(firm)
  const deny = (powod: string): SubstitutionAccess => ({
    dostep: false,
    rola,
    mozeZlecac: false,
    mozePrzyjmowac: false,
    aplikantGotowyOd: null,
    powod,
  })

  if (!firm.aktywna) return deny("Twój profil jest nieaktywny.")
  if (!rola) {
    return deny(
      "Zastępstwa procesowe są dostępne dla adwokatów, radców prawnych i aplikantów. Uzupełnij numer wpisu ORA lub OIRP w profilu."
    )
  }
  if (!firm.zweryfikowana) {
    return deny(
      "Zastępstwa procesowe odblokujemy po weryfikacji profilu — sprawdzamy numer wpisu w rejestrze ORA lub OIRP."
    )
  }

  if (rola === "APLIKANT" && firm.aplikacjaOd) {
    const ready = aplikantReadyFrom(firm.aplikacjaOd)
    return {
      dostep: true,
      rola,
      mozeZlecac: false,
      mozePrzyjmowac: ready.getTime() <= now.getTime(),
      aplikantGotowyOd: ready.toISOString(),
      powod: null,
    }
  }

  return { dostep: true, rola, mozeZlecac: true, mozePrzyjmowac: true, aplikantGotowyOd: null, powod: null }
}

export type SubstitutionContext =
  | { ok: true; userId: string; firm: AccessFirm; access: SubstitutionAccess }
  | { ok: false; response: NextResponse }

/**
 * Wspólny początek każdego endpointu modułu: sesja, rola LAW_FIRM, profil
 * eksperta i — domyślnie — dostęp do zastępstw.
 */
export async function getSubstitutionContext(
  options: { requireAccess?: boolean } = {}
): Promise<SubstitutionContext> {
  const { requireAccess = true } = options
  const session = await auth()

  if (!session?.user) {
    return { ok: false, response: NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 }) }
  }
  if (session.user.role !== "LAW_FIRM") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Zastępstwa są dostępne tylko dla prawników" }, { status: 403 }),
    }
  }

  const firm = await prisma.lawFirm.findUnique({
    where: { userId: session.user.id },
    select: ACCESS_FIRM_SELECT,
  })
  if (!firm) {
    return { ok: false, response: NextResponse.json({ error: "Nie znaleziono profilu eksperta" }, { status: 404 }) }
  }

  const access = resolveAccess(firm)
  if (requireAccess && !access.dostep) {
    return { ok: false, response: NextResponse.json({ error: access.powod }, { status: 403 }) }
  }

  return { ok: true, userId: session.user.id, firm, access }
}
