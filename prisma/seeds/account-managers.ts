import { PrismaClient } from "@prisma/client";

export async function seedAccountManagers(prisma: PrismaClient) {
  console.log("Seeding account managers...");

  const managers = [
    {
      imie: "Marta",
      nazwisko: "Wiśniewska",
      email: "marta.wisniewska@ps-dev.com.pl",
      telefon: "+48 500 100 201",
      avatar: "/images/defailt-user.jpg",
      aktywny: true,
    },
    {
      imie: "Tomasz",
      nazwisko: "Kamiński",
      email: "tomasz.kaminski@ps-dev.com.pl",
      telefon: "+48 500 100 202",
      avatar: "/images/defailt-user.jpg",
      aktywny: true,
    },
    {
      imie: "Aleksandra",
      nazwisko: "Lewandowska",
      email: "aleksandra.lewandowska@ps-dev.com.pl",
      telefon: "+48 500 100 203",
      avatar: "/images/defailt-user.jpg",
      aktywny: true,
    },
  ];

  const createdManagers = [];
  for (const m of managers) {
    const manager = await prisma.accountManager.create({
      data: m,
    });
    createdManagers.push(manager);
  }

  console.log(`✓ Utworzono ${createdManagers.length} opiekunów kancelarii (AccountManagers)`);
  return createdManagers;
}
