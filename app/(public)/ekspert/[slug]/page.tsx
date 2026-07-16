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
        opis: true,
        user: { select: { miasto: true } },
      },
    })

    if (!lawFirm) {
      return {
        title: "Ekspert nie znaleziony",
      }
    }

    const displayName = lawFirm.nazwa || lawFirm.nazwa
    const title = `${displayName} - Ekspert ${lawFirm.user?.miasto ?? ""}`
    const description = lawFirm.opis || `Profil ekspertów prawnych z firmy ${displayName} w mieście ${lawFirm.user?.miasto ?? ""}. Zobacz specjalizacje, opinie klientów oraz wolne terminy konsultacji.`

    return {
      title,
      description: description.substring(0, 160),
    }
  } catch (error) {
    console.error("Error generating metadata for expert profile:", error)
    return {
      title: "Profil Eksperta",
    }
  }
}

export default function ExpertProfilePage() {
  return <ExpertProfileClientPage />
}
