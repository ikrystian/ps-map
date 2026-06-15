import { prisma } from "../lib/prisma";

async function main() {
  console.log("=== LISTING ALL PROMOTIONS ===");
  const promotions = await prisma.promotion.findMany({
    include: {
      lawFirm: true
    }
  });

  console.log(`Total promotions in DB: ${promotions.length}`);
  promotions.forEach(p => {
    console.log(`ID: ${p.id}`);
    console.log(`  LawFirm: ${p.lawFirm.nazwa} (ID: ${p.lawFirmId})`);
    console.log(`  Type: ${p.typPromocji}`);
    console.log(`  Category: ${p.kategoriaPromocji}`);
    console.log(`  Voivodeship: ${p.wojewodztwoPromocji}`);
    console.log(`  Start: ${p.startPromocji}`);
    console.log(`  End: ${p.koniecPromocji}`);
    console.log(`  Active: ${p.aktywna}`);
    console.log("------------------------");
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
