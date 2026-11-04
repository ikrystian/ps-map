import type { LawFirm } from "@/lib/types"

/** Pakiet jest aktywny, gdy jest przypisany i nie minęła data ważności. */
export function isPackageActive(lawFirm: Pick<LawFirm, "pakietSubskrypcji" | "dataPakietuDo">): boolean {
  return !!lawFirm.pakietSubskrypcji && (!lawFirm.dataPakietuDo || new Date(lawFirm.dataPakietuDo) > new Date())
}
