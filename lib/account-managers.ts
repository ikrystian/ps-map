import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

/**
 * Opiekunowie ekspertów — każdy opiekun obsługuje wybrane województwa
 * (jedno województwo może mieć najwyżej jednego opiekuna). Nowo zarejestrowany
 * ekspert dostaje opiekuna przypisanego do województwa swojej siedziby.
 */

/** Zwraca id aktywnego opiekuna obsługującego dane województwo (lub null). */
export async function findAccountManagerIdForVoivodeship(
  voivodeshipId: string | null | undefined,
  tx: Prisma.TransactionClient = prisma
): Promise<string | null> {
  if (!voivodeshipId) return null
  const voivodeship = await tx.voivodeship.findUnique({
    where: { id: voivodeshipId },
    select: { accountManager: { select: { id: true, aktywny: true } } },
  })
  const manager = voivodeship?.accountManager
  return manager?.aktywny ? manager.id : null
}

/**
 * Ustawia listę województw obsługiwanych przez opiekuna. Województwa przypisane
 * dotąd innemu opiekunowi zostają mu odebrane (relacja jest 1 województwo → 1 opiekun).
 */
export async function setAccountManagerVoivodeships(
  accountManagerId: string,
  voivodeshipIds: string[],
  tx: Prisma.TransactionClient = prisma
): Promise<void> {
  await tx.voivodeship.updateMany({
    where: { accountManagerId, id: { notIn: voivodeshipIds } },
    data: { accountManagerId: null },
  })
  if (voivodeshipIds.length > 0) {
    await tx.voivodeship.updateMany({
      where: { id: { in: voivodeshipIds } },
      data: { accountManagerId },
    })
  }
}
