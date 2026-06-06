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

  return NextResponse.json({
    id: lawFirm.id,
    pakietSubskrypcji: lawFirm.pakietSubskrypcji,
    dataPakietuOd: lawFirm.dataPakietuOd,
    dataPakietuDo: lawFirm.dataPakietuDo,
    autoRenewal: lawFirm.autoRenewal,
    defaultMaxCategories,
    permissions,
  });
}
