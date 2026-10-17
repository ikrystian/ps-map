import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { cache } from "react"
import ExpertProfileClientPage from "./ExpertProfileClientPage"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Te same kryteria co GET /api/law-firms/[id], z którego profil pobiera dane (slug, ID, NIP; tylko aktywni)
const getPublicExpert = cache((slug: string) =>
  prisma.lawFirm.findFirst({
    where: {
      OR: [{ id: slug }, { slug }, { nip: slug }, { userId: slug }],
      aktywna: true,
    },
    select: {
      nazwa: true,
      opis: true,
      user: { select: { miasto: true } },
    },
  })
)

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const lawFirm = await getPublicExpert(slug)

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

export default async function ExpertProfilePage({ params }: PageProps) {
  const { slug } = await params
  const lawFirm = await getPublicExpert(slug)

  // Nieistniejący lub nieaktywny profil — prawdziwe 404 zamiast komunikatu błędu ze statusem 200
  if (!lawFirm) {
    notFound()
  }

  return <ExpertProfileClientPage initialName={lawFirm.nazwa} />
}
