import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding test advertisements...")

  // Wyczyszczenie dotychczasowych reklam testowych
  await prisma.advertisement.deleteMany({
    where: {
      name: {
        in: ["Testowa Reklama Top", "Testowa Reklama Sidebar"]
      }
    }
  })

  // Dodanie reklamy poziomej na górze wyników wyszukiwania (search_top)
  const adTop = await prisma.advertisement.create({
    data: {
      name: "Testowa Reklama Top",
      imageUrl: "https://placehold.co/970x90/1a1a19/ffffff?text=Zareklamuj+Sie+Tutaj+-+970x90",
      linkUrl: "https://google.com",
      location: "search_top",
      active: true,
      startDate: new Date(),
    }
  })
  console.log("✓ Dodano reklamę TOP:", adTop.id)

  // Dodanie reklamy pionowej/kwadratowej w sidebarze kategorii (category_sidebar)
  const adSidebar = await prisma.advertisement.create({
    data: {
      name: "Testowa Reklama Sidebar",
      imageUrl: "https://placehold.co/300x250/1a1a19/ffffff?text=Reklama+w+Sidebarze+-+300x250",
      linkUrl: "https://google.com",
      location: "category_sidebar",
      active: true,
      startDate: new Date(),
    }
  })
  console.log("✓ Dodano reklamę SIDEBAR:", adSidebar.id)

  console.log("Seeding reklam zakończony!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("Błąd seedowania:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
