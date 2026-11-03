import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import { getImageProps } from "next/image"
import { notFound } from "next/navigation"
import { cache } from "react"
import { preload } from "react-dom"
import ExpertProfileClientPage from "./ExpertProfileClientPage"
import { COVER_IMAGE_QUALITY, COVER_IMAGE_SIZES } from "./cover-image"

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
      zdjecieGlowne: true,
      filmYouTube: true,
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

  // Dane profilu dochodzą po stronie klienta, więc bez tego okładka zaczynałaby się pobierać
  // dopiero po odpowiedzi API. Preload w <head> startuje pobieranie od razu (film ma pierwszeństwo).
  if (lawFirm.zdjecieGlowne && !lawFirm.filmYouTube) {
    const { props: cover } = getImageProps({
      src: lawFirm.zdjecieGlowne,
      alt: "",
      fill: true,
      sizes: COVER_IMAGE_SIZES,
      quality: COVER_IMAGE_QUALITY,
    })
    preload(cover.src, {
      as: "image",
      imageSrcSet: cover.srcSet,
      imageSizes: cover.sizes,
      fetchPriority: "high",
    })
  }

  return <ExpertProfileClientPage initialName={lawFirm.nazwa} />
}
