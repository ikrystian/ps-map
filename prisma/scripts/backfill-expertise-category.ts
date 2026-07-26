/**
 * Jednorazowy backfill po rozdzieleniu `LawFirm.typ` (forma prawna) od
 * ścieżki specjalizacji, która wcześniej trafiała do `LawFirm.typInny`.
 *
 * Migracja SQL czyści tylko rekordy, w których ścieżka była redundantna
 * (`expertiseCategoryId` już ustawione). Tutaj domykamy resztę: dopasowujemy
 * ścieżkę po nazwach w drzewie ExpertiseCategory, uzupełniamy ID i dopiero
 * wtedy kasujemy ścieżkę z `typInny`.
 *
 * Skrypt jest idempotentny — po pełnym przejściu nie ma już czego poprawiać.
 *
 * Uruchomienie:  bun run prisma/scripts/backfill-expertise-category.ts
 */

import { prisma } from "../../lib/prisma";

async function main() {
  const candidates = await prisma.lawFirm.findMany({
    where: {
      typInny: { contains: ">" },
      expertiseCategoryId: null,
    },
    select: { id: true, nazwa: true, typInny: true, typ: true },
  });

  if (candidates.length === 0) {
    console.log("Brak rekordów do poprawy — nic nie zmieniam.");
    return;
  }

  const categories = await prisma.expertiseCategory.findMany({
    select: { id: true, nazwa: true, parentId: true },
  });

  // Indeks „nazwa + rodzic” pozwala rozróżnić liście o tej samej nazwie
  // w różnych gałęziach drzewa.
  const byNameAndParent = new Map<string, string>();
  for (const category of categories) {
    byNameAndParent.set(`${category.parentId ?? "root"}::${category.nazwa}`, category.id);
  }

  const resolve = (path: string): string | null => {
    const segments = path
      .split(">")
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (segments.length < 2) return null;

    let parentId = "root";
    let currentId: string | null = null;

    for (const segment of segments) {
      const found = byNameAndParent.get(`${parentId}::${segment}`);
      if (!found) return null;
      currentId = found;
      parentId = found;
    }

    return currentId;
  };

  let fixed = 0;
  let unresolved = 0;

  for (const lawFirm of candidates) {
    const resolvedId = resolve(lawFirm.typInny!);

    if (!resolvedId) {
      unresolved += 1;
      console.warn(
        `! Nie dopasowano ścieżki "${lawFirm.typInny}" (${lawFirm.nazwa}) — zostawiam bez zmian do ręcznej weryfikacji.`
      );
      continue;
    }

    await prisma.lawFirm.update({
      where: { id: lawFirm.id },
      data: {
        expertiseCategoryId: resolvedId,
        typInny: null,
        // Placeholder INNY podstawiany przy rejestracji nie niósł informacji
        // o formie prawnej — czyścimy go na „nieokreślona”.
        typ: lawFirm.typ === "INNY" ? null : lawFirm.typ,
      },
    });
    fixed += 1;
  }

  console.log(`Poprawiono rekordów: ${fixed}, wymaga ręcznej weryfikacji: ${unresolved}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
