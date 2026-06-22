import { PrismaClient } from "@prisma/client"
import { existsSync, copyFileSync, mkdirSync, statSync } from "fs"
import { join } from "path"

export async function seedDocuments(prisma: PrismaClient) {
  console.log("Seeding documents...")

  const lawFirms = await prisma.lawFirm.findMany()

  const seedFiles = [
    {
      srcName: "prosta_sprawa_opis.txt",
      nazwa: "Opis portalu Prosta Sprawa",
      typDokumentu: "regulamin",
      rozszerzenie: "txt",
    },
    {
      srcName: "prosta_sprawa_info.rtf",
      nazwa: "Informacje o portalu",
      typDokumentu: "regulamin",
      rozszerzenie: "rtf",
    },
    {
      srcName: "prosta_sprawa_regulamin.doc",
      nazwa: "Regulamin świadczenia usług",
      typDokumentu: "regulamin",
      rozszerzenie: "doc",
    },
    {
      srcName: "prosta_sprawa_promowanie.docx",
      nazwa: "Specyfikacja systemu promowania",
      typDokumentu: "wzor-pisma",
      rozszerzenie: "docx",
    },
    {
      srcName: "prosta_sprawa_umowa.odt",
      nazwa: "Umowa ramowa współpracy",
      typDokumentu: "umowa",
      rozszerzenie: "odt",
    },
    {
      srcName: "prosta_sprawa_prezentacja.pdf",
      nazwa: "Prezentacja oferty dla kancelarii",
      typDokumentu: "inny",
      rozszerzenie: "pdf",
    },
  ]

  const seedFilesDir = join(process.cwd(), "prisma", "seeds", "files")

  let count = 0
  for (const lawFirm of lawFirms) {
    const targetDir = join(process.cwd(), "public", "uploads", "documents", lawFirm.id)
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true })
    }

    for (const file of seedFiles) {
      const srcPath = join(seedFilesDir, file.srcName)
      if (!existsSync(srcPath)) {
        continue
      }

      const targetFileName = `${file.srcName}`
      const targetPath = join(targetDir, targetFileName)
      copyFileSync(srcPath, targetPath)

      const size = statSync(srcPath).size
      const relativePath = `/uploads/documents/${lawFirm.id}/${targetFileName}`

      await prisma.document.create({
        data: {
          lawFirmId: lawFirm.id,
          nazwa: file.nazwa,
          typDokumentu: file.typDokumentu,
          rozmiar: size,
          sciezka: relativePath,
          rozszerzenie: file.rozszerzenie,
          zrodlo: "KANCELARIA",
        },
      })
      count++
    }
  }

  console.log(`✓ Seeded ${count} documents for ${lawFirms.length} experts.`)
}
