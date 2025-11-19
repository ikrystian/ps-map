/**
 * API Endpoint: /api/law-firms/me/permissions
 *
 * Zwraca dane o uprawnieniach zalogowanej kancelarii
 */

import { NextResponse } from "next/server";
import { getAuthenticatedLawFirm } from "@/lib/api-permissions";
import { getLawFirmPermissions } from "@/lib/permissions";

/**
 * GET /api/law-firms/me/permissions
 *
 * Pobiera dane kancelarii z informacjami o pakiecie i uprawnieniach
 */
export async function GET() {
  const lawFirm = await getAuthenticatedLawFirm();

  if (!lawFirm) {
    return NextResponse.json(
      { error: "Unauthorized - musisz być zalogowany jako kancelaria" },
      { status: 401 }
    );
  }

  const permissions = getLawFirmPermissions(lawFirm);

  return NextResponse.json({
    id: lawFirm.id,
    pakietSubskrypcji: lawFirm.pakietSubskrypcji,
    dataPakietuOd: lawFirm.dataPakietuOd,
    dataPakietuDo: lawFirm.dataPakietuDo,
    autoRenewal: lawFirm.autoRenewal,
    permissions,
  });
}
