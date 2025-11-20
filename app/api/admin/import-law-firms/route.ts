import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

// Helper function to generate slug
function generateSlug(text: string): string {
  const polishMap: { [key: string]: string } = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
    'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N',
    'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z',
  }

  return text
    .split('')
    .map(char => polishMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate and check for admin role
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    // 2. Parse request body
    const body = await request.json()
    const { lawFirms } = body

    if (!lawFirms || !Array.isArray(lawFirms) || lawFirms.length === 0) {
      return NextResponse.json(
        { error: "Invalid data format. Expected { lawFirms: [...] }" },
        { status: 400 }
      )
    }

    const results = {
      success: [] as string[],
      errors: [] as { email: string; error: string }[],
    }

    // 3. Process each law firm
    for (const firmData of lawFirms) {
      try {
        const { user: userData, lawFirm: lawFirmData, voivodeships, categories, services, certificates } = firmData

        // Validate required fields
        if (!userData?.email || !lawFirmData?.nazwa) {
          results.errors.push({
            email: userData?.email || "unknown",
            error: "Missing required fields: email and nazwa are required",
          })
          continue
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email },
        })

        if (existingUser) {
          results.errors.push({
            email: userData.email,
            error: "User with this email already exists",
          })
          continue
        }

        // Check if NIP already exists
        if (lawFirmData.nip) {
          const existingNip = await prisma.lawFirm.findUnique({
            where: { nip: lawFirmData.nip },
          })

          if (existingNip) {
            results.errors.push({
              email: userData.email,
              error: `Law firm with NIP ${lawFirmData.nip} already exists`,
            })
            continue
          }
        }

        // Generate slug
        const baseSlug = generateSlug(lawFirmData.nazwa)
        let slug = baseSlug
        let counter = 1

        while (await prisma.lawFirm.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${counter}`
          counter++
        }

        // Hash password
        const hashedPassword = userData.password
          ? await bcrypt.hash(userData.password, 10)
          : await bcrypt.hash("Password123!", 10)

        // Use transaction to create everything atomically
        await prisma.$transaction(async (tx: any) => {
          // 1. Create user
          const user = await tx.user.create({
            data: {
              email: userData.email,
              name: userData.name || lawFirmData.nazwa,
              password: hashedPassword,
              role: "LAW_FIRM",
              emailVerified: new Date(),
            },
          })

          // 2. Get voivodeship for main address
          let voivodeshipId: string | undefined
          if (lawFirmData.voivodeship) {
            const voivodeship = await tx.voivodeship.findFirst({
              where: { nazwa: lawFirmData.voivodeship },
            })
            if (!voivodeship) {
              throw new Error(`Voivodeship "${lawFirmData.voivodeship}" not found`)
            }
            voivodeshipId = voivodeship.id
          } else {
            // Default to first voivodeship if not specified
            const firstVoivodeship = await tx.voivodeship.findFirst()
            if (!firstVoivodeship) {
              throw new Error("No voivodeships found in database. Please seed voivodeships first.")
            }
            voivodeshipId = firstVoivodeship.id
          }

          // 3. Create law firm
          const lawFirm = await tx.lawFirm.create({
            data: {
              userId: user.id,
              typ: lawFirmData.typ || "OSOBA_FIZYCZNA",
              typInny: lawFirmData.typInny,
              nazwa: lawFirmData.nazwa,
              nazwaFirmy: lawFirmData.nazwaFirmy || lawFirmData.nazwa,
              slug,
              nip: lawFirmData.nip || `TEMP-${Date.now()}`,
              regon: lawFirmData.regon,
              krs: lawFirmData.krs,
              imieKontakt: lawFirmData.imieKontakt || "Kontakt",
              nazwiskoKontakt: lawFirmData.nazwiskoKontakt || "Osoba",
              stanowisko: lawFirmData.stanowisko,
              numerTelefonu: lawFirmData.numerTelefonu || "+48 000 000 000",
              numerTelefonu2: lawFirmData.numerTelefonu2,
              emailKontakt: lawFirmData.emailKontakt || userData.email,
              adres: lawFirmData.adres || "Brak adresu",
              kodPocztowy: lawFirmData.kodPocztowy || "00-000",
              miasto: lawFirmData.miasto || "Warszawa",
              voivodeshipId,
              latitude: lawFirmData.latitude,
              longitude: lawFirmData.longitude,
              opis: lawFirmData.opis,
              logo: lawFirmData.logo,
              zdjecieGlowne: lawFirmData.zdjecieGlowne,
              galeriaZdjec: lawFirmData.galeriaZdjec ? JSON.stringify(lawFirmData.galeriaZdjec) : null,
              filmYouTube: lawFirmData.filmYouTube,
              okladkaFilmu: lawFirmData.okladkaFilmu,
              kolejnoscMultimedia: lawFirmData.kolejnoscMultimedia,
              statusGodzinyOtwarcia: lawFirmData.statusGodzinyOtwarcia || false,
              godzinyOtwarcia: lawFirmData.godzinyOtwarcia ? JSON.stringify(lawFirmData.godzinyOtwarcia) : null,
              linkLinkedIn: lawFirmData.linkLinkedIn,
              linkFacebook: lawFirmData.linkFacebook,
              linkInstagram: lawFirmData.linkInstagram,
              linkTwitter: lawFirmData.linkTwitter,
              linkTikTok: lawFirmData.linkTikTok,
              stronaWww: lawFirmData.stronaWww,
              edukacja: lawFirmData.edukacja ? JSON.stringify(lawFirmData.edukacja) : null,
              oirpMiasto: lawFirmData.oirpMiasto,
              oirpWpis: lawFirmData.oirpWpis,
              oirpStatus: lawFirmData.oirpStatus || false,
              oraMiasto: lawFirmData.oraMiasto,
              oraWpis: lawFirmData.oraWpis,
              oraStatus: lawFirmData.oraStatus || false,
              unikatowyOpisUslugi: lawFirmData.unikatowyOpisUslugi,
              slowaKluczowe: lawFirmData.slowaKluczowe ? JSON.stringify(lawFirmData.slowaKluczowe) : null,
              callaPolska: lawFirmData.callaPolska || false,
              onlineOnly: lawFirmData.onlineOnly || false,
              typOferty: lawFirmData.typOferty || "WSZYSTKIE",
              pakietSubskrypcji: lawFirmData.pakietSubskrypcji || "PODSTAWOWY",
              zweryfikowana: lawFirmData.zweryfikowana || false,
              aktywna: lawFirmData.aktywna !== false,
              zgodaRegulamin: lawFirmData.zgodaRegulamin || true,
              zgodaPrzetwarzanie: lawFirmData.zgodaPrzetwarzanie || true,
            },
          })

          // 4. Link voivodeships (areas of operation)
          if (voivodeships && Array.isArray(voivodeships) && voivodeships.length > 0) {
            for (const voivodeshipName of voivodeships) {
              const voivodeship = await tx.voivodeship.findFirst({
                where: { nazwa: voivodeshipName },
              })

              if (voivodeship) {
                await tx.lawFirmVoivodeship.create({
                  data: {
                    lawFirmId: lawFirm.id,
                    voivodeshipId: voivodeship.id,
                  },
                })
              }
            }
          }

          // 5. Link categories
          if (categories && Array.isArray(categories) && categories.length > 0) {
            for (const categoryName of categories) {
              const category = await tx.category.findFirst({
                where: { nazwa: categoryName },
              })

              if (category) {
                await tx.lawFirmCategory.create({
                  data: {
                    lawFirmId: lawFirm.id,
                    categoryId: category.id,
                  },
                })
              }
            }
          }

          // 6. Create services
          if (services && Array.isArray(services) && services.length > 0) {
            for (const service of services) {
              await tx.service.create({
                data: {
                  lawFirmId: lawFirm.id,
                  nazwaUslugi: service.nazwaUslugi,
                  opisUslugi: service.opisUslugi,
                  cenaOd: service.cenaOd,
                  cenaDo: service.cenaDo,
                  jednostka: service.jednostka || "DO_UZGODNIENIA",
                  aktywna: service.aktywna !== false,
                },
              })
            }
          }

          // 7. Create certificates
          if (certificates && Array.isArray(certificates) && certificates.length > 0) {
            for (const cert of certificates) {
              await tx.certificate.create({
                data: {
                  lawFirmId: lawFirm.id,
                  nazwaCertyfikatu: cert.nazwaCertyfikatu,
                  wydawca: cert.wydawca,
                  dataUzyskania: new Date(cert.dataUzyskania),
                  dataWaznosci: cert.dataWaznosci ? new Date(cert.dataWaznosci) : null,
                  numerCertyfikatu: cert.numerCertyfikatu,
                  skanCertyfikatu: cert.skanCertyfikatu || "/placeholder-certificate.pdf",
                  aktywny: cert.aktywny !== false,
                },
              })
            }
          }

          // 8. Create notification settings for the user
          await tx.notificationSettings.create({
            data: {
              userId: user.id,
            },
          })
        })

        results.success.push(userData.email)
      } catch (error: any) {
        results.errors.push({
          email: firmData.user?.email || "unknown",
          error: error.message || "Unknown error occurred",
        })
      }
    }

    // 4. Return results
    return NextResponse.json({
      message: "Import completed",
      summary: {
        total: lawFirms.length,
        success: results.success.length,
        errors: results.errors.length,
      },
      results,
    })
  } catch (error: any) {
    console.error("Error importing law firms:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
