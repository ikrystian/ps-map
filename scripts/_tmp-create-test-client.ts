import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  const email = "test-edit-verify@example.com"
  const password = "TestHaslo123!"
  const hashedPassword = await bcrypt.hash(password, 10)

  const category = await prisma.category.findFirst({ where: { aktywna: true } })
  const voivodeship = await prisma.voivodeship.findFirst()
  const city = voivodeship ? await prisma.city.findFirst({ where: { voivodeshipId: voivodeship.id } }) : null

  if (!category || !voivodeship) {
    throw new Error("Brak kategorii lub województwa w bazie — nie można utworzyć testowej sprawy")
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, role: "CLIENT", emailVerified: new Date() },
    create: {
      email,
      password: hashedPassword,
      role: "CLIENT",
      emailVerified: new Date(),
      name: "Test Weryfikacja",
      imie: "Test",
      nazwisko: "Weryfikacja",
    },
  })

  const client = await prisma.client.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      clientType: "INDIVIDUAL",
      imie: "Test",
      nazwisko: "Weryfikacja",
      zgodaRegulamin: true,
    },
  })

  const existingCase = await prisma.case.findFirst({ where: { clientId: client.id } })

  const caseRecord = existingCase ?? await prisma.case.create({
    data: {
      clientId: client.id,
      typSprawy: "OSOBA_PRYWATNA",
      categoryId: category.id,
      categories: { create: [{ categoryId: category.id }] },
      nazwaSprawy: "Testowa sprawa do weryfikacji edycji",
      opisSprawy: "To jest testowy opis sprawy utworzony w celu zweryfikowania nowej strony edycji sprawy klienta. Musi mieć co najmniej sto znaków, więc dopisuję dodatkowy tekst wypełniający.",
      imieNazwisko: "Test Weryfikacja",
      telefonKontakt: "500600700",
      preferowanyKontakt: "EMAIL",
      voivodeshipId: voivodeship.id,
      cityId: city?.id,
      akceptujeKlauzule: true,
      status: "NOWA",
    },
  })

  console.log(JSON.stringify({ email, password, caseId: caseRecord.id }, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
