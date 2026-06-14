/**
 * API Endpoint: /api/law-firms/me/permissions
 *
 * Zwraca dane o uprawnieniach zalogowanej eksperta
 */

import { getAuthenticatedLawFirm } from "@/lib/api-permissions";
import { getLawFirmPermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/law-firms/me/permissions
 *
 * Pobiera dane eksperta z informacjami o pakiecie i uprawnieniach
 */
export async function GET() {
  const lawFirm = await getAuthenticatedLawFirm();

  if (!lawFirm) {
    return NextResponse.json(
      { error: "Unauthorized - musisz być zalogowany jako ekspert" },
      { status: 401 }
    );
  }

  // Pobierz domyślny limit kategorii z ustawień
  const settings = await prisma.settings.findUnique({
    where: { key: "maxLawFirmCategories" }
  });
  const defaultMaxCategories = settings ? parseInt(settings.value) : 10;

  const permissionData = {
    ...lawFirm,
    defaultMaxCategories
  };

  const permissions = getLawFirmPermissions(permissionData);

  // Pobierz dynamiczny limit powiadomieniaSprawy z planu subskrypcji w bazie danych
  let powiadomieniaSprawy = 0;
  if (lawFirm.pakietSubskrypcji) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { typ: lawFirm.pakietSubskrypcji }
    });
    if (plan) {
      powiadomieniaSprawy = plan.powiadomieniaSprawy;
    }
  }

  return NextResponse.json({
    id: lawFirm.id,
    pakietSubskrypcji: lawFirm.pakietSubskrypcji,
    dataPakietuOd: lawFirm.dataPakietuOd,
    dataPakietuDo: lawFirm.dataPakietuDo,
    autoRenewal: lawFirm.autoRenewal,
    defaultMaxCategories,
    statystykiAnalizy: lawFirm.statystykiAnalizy ?? false,
    mozliwoscBloga: lawFirm.mozliwoscBloga ?? false,
    promowanieProfilu: lawFirm.promowanieProfilu ?? false,
    artykutySponsoro: lawFirm.artykutySponsoro ?? false,
    coverBaner: lawFirm.coverBaner ?? false,
    permissions,
    powiadomieniaSprawy,
  });
}
