import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import ExpertProfileClientPage from "./ExpertProfileClientPage"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const lawFirm = await prisma.lawFirm.findUnique({
      where: { slug },
      select: {
        nazwa: true,
        nazwaFirmy: true,
        opis: true,
        miasto: true,
      },
    })

    if (!lawFirm) {
      return {
        title: "Ekspert nie znaleziony | Prosta Sprawa",
      }
    }

    const displayName = lawFirm.nazwaFirmyFirmy || lawFirm.nazwaFirmy
    const title = `${displayName} - Ekspert ${lawFirm.miasto} | Prosta Sprawa`
    const description = lawFirm.opis || `Profil ekspertów prawnych z firmy ${displayName} w mieście ${lawFirm.miasto}. Zobacz specjalizacje, opinie klientów oraz wolne terminy konsultacji.`

    return {
      title,
      description: description.substring(0, 160),
    }
  } catch (error) {
    console.error("Error generating metadata for expert profile:", error)
    return {
      title: "Profil Eksperta | Prosta Sprawa",
    }
  }
}

export default function ExpertProfilePage() {
  return <ExpertProfileClientPage />
}
