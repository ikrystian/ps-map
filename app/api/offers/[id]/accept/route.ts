import { auth } from "@/auth"
import { sendEmailWithTemplate } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { EmailType, ScheduledEmailStatus } from "@prisma/client"
import { NextRequest } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
      return Response.json(
        { error: "Musisz być zalogowany" },
        { status: 401 }
      )
    }

    // Tylko klienci mogą akceptować oferty
    if (session.user.role !== "CLIENT") {
      return Response.json(
        { error: "Tylko klienci mogą akceptować oferty" },
        { status: 403 }
      )
    }

    // Pobierz dane klienta
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id }
    })

    if (!client) {
      return Response.json(
        { error: "Nie znaleziono profilu klienta" },
        { status: 404 }
      )
    }

    // Pobierz ofertę
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            id: true,
            clientId: true,
            nazwaSprawy: true
          }
        },
        lawFirm: {
          select: {
            id: true,
            nazwa: true,
            userId: true,
            slug: true,
            user: {
              select: {
                email: true,
                notificationSettings: {
                  select: {
                    autoProsbOpinie: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!offer) {
      return Response.json(
        { error: "Nie znaleziono oferty" },
        { status: 404 }
      )
    }

    // Sprawdź czy sprawa należy do klienta
    if (offer.case.clientId !== client.id) {
      return Response.json(
        { error: "Brak dostępu do tej oferty" },
        { status: 403 }
      )
    }

    // Sprawdź status oferty
    if (offer.status === "ZAAKCEPTOWANA") {
      return Response.json(
        { error: "Oferta została już zaakceptowana" },
        { status: 400 }
      )
    }

    if (offer.status === "ODRZUCONA") {
      return Response.json(
        { error: "Nie można zaakceptować odrzuconej oferty" },
        { status: 400 }
      )
    }

    // Aktualizuj ofertę i powiązane dane
    const updatedOffer = await prisma.$transaction(async (tx: any) => {
      // Zaakceptuj ofertę
      const updated = await tx.offer.update({
        where: { id },
        data: {
          status: "ZAAKCEPTOWANA",
          zaakceptowanaData: new Date()
        },
        include: {
          case: {
            select: {
              nazwaSprawy: true,
              categoryId: true
            }
          },
          lawFirm: {
            select: {
              nazwa: true
            }
          }
        }
      })

      // Odrzuć wszystkie inne oferty do tej sprawy
      await tx.offer.updateMany({
        where: {
          caseId: offer.caseId,
          id: { not: id },
          status: { not: "ODRZUCONA" }
        },
        data: {
          status: "ODRZUCONA",
          odrzuconaData: new Date()
        }
      })

      // Zaktualizuj status sprawy
      await tx.case.update({
        where: { id: offer.caseId },
        data: {
          status: "W_TRAKCIE"
        }
      })

      // Zaktualizuj statystyki eksperta
      await tx.lawFirm.update({
        where: { id: offer.lawFirmId },
        data: {
          wygraneOferty: { increment: 1 }
        }
      })

      // Przelicz konwersję
      const lawFirmStats = await tx.lawFirm.findUnique({
        where: { id: offer.lawFirmId },
        select: {
          zlozoneOferty: true,
          wygraneOferty: true
        }
      })

      if (lawFirmStats && lawFirmStats.zlozoneOferty > 0) {
        const konwersja = (lawFirmStats.wygraneOferty / lawFirmStats.zlozoneOferty) * 100
        await tx.lawFirm.update({
          where: { id: offer.lawFirmId },
          data: {
            konwersja
          }
        })
      }

      // Get current date info for stats
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1 // 1-12

      // Update monthly stats
      const existingMonthlyStats = await tx.lawFirmStats.findUnique({
        where: {
          lawFirmId_year_month: {
            lawFirmId: offer.lawFirmId,
            year,
            month,
          },
        },
      })

      if (existingMonthlyStats) {
        await tx.lawFirmStats.update({
          where: {
            lawFirmId_year_month: {
              lawFirmId: offer.lawFirmId,
              year,
              month,
            },
          },
          data: {
            offersAccepted: { increment: 1 },
          },
        })
      } else {
        await tx.lawFirmStats.create({
          data: {
            lawFirmId: offer.lawFirmId,
            year,
            month,
            offersAccepted: 1,
          },
        })
      }

      // Update category stats if case has a category
      if (updated.case.categoryId) {
        const existingCategoryStats = await tx.lawFirmCategoryStats.findUnique({
          where: {
            lawFirmId_categoryId: {
              lawFirmId: offer.lawFirmId,
              categoryId: updated.case.categoryId,
            },
          },
        })

        if (existingCategoryStats) {
          await tx.lawFirmCategoryStats.update({
            where: {
              lawFirmId_categoryId: {
                lawFirmId: offer.lawFirmId,
                categoryId: updated.case.categoryId,
              },
            },
            data: {
              offersAccepted: { increment: 1 },
            },
          })
        } else {
          await tx.lawFirmCategoryStats.create({
            data: {
              lawFirmId: offer.lawFirmId,
              categoryId: updated.case.categoryId,
              offersAccepted: 1,
            },
          })
        }
      }

      // Utwórz powiadomienie dla ekspertów
      const notification = await tx.notification.create({
        data: {
          userId: offer.lawFirm.userId,
          typ: "ZMIANA_STATUSU",
          tytul: "Oferta zaakceptowana!",
          tresc: `Twoja oferta do sprawy "${offer.case.nazwaSprawy}" została zaakceptowana przez klienta`,
          linkUrl: `/panel-eksperta/oferty`
        }
      })

      return { updated, notification, lawFirmUserId: offer.lawFirm.userId }
    })

    // Emit notification via Socket.IO (after transaction)
    const { emitNewNotification } = await import("@/lib/socket")
    await emitNewNotification(
      updatedOffer.lawFirmUserId,
      updatedOffer.notification
    )

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    // 1. Wyślij e-mail o akceptacji do ekspercie
    if (offer.lawFirm?.user?.email) {
      try {
        await sendEmailWithTemplate({
          to: offer.lawFirm.user.email,
          templateType: EmailType.AKCEPTACJA_OFERTY,
          variables: {
            "{ekspert}": offer.lawFirm.nazwaFirmy,
            "{klient}": `${client.imie} ${client.nazwisko}`,
            "{nazwaSprawi}": offer.case.nazwaSprawy,
            "{kwota}": `${offer.kwotaBrutto.toFixed(2)} PLN`,
            "{emailKlienta}": session.user.email || "Brak",
            "{telefonKlienta}": client.telefon || "Nie podano",
            "{linkDoPanelu}": `${baseUrl}/panel-eksperta/oferty`,
          }
        })
      } catch (emailError) {
        console.error("Failed to send accept email to law firm:", emailError)
      }
    }

    // 2. Zaplanuj e-mail z prośbą o ocenę do klienta (za 3 dni)
    // Tylko jeśli ekspert ma włączone "Automatyczne prośby o opinie" w ustawieniach.
    if (offer.lawFirm?.user?.notificationSettings?.autoProsbOpinie) {
      try {
        const scheduledAt = new Date()
        scheduledAt.setDate(scheduledAt.getDate() + 3) // Za 3 dni

        const clientEmail = session.user.email || "Brak"
        const linkDoOceny = `${baseUrl}/ekspert/${offer.lawFirm.slug}#reviews`

        // Przygotuj zmienne jako JSON string do zapisania w bazie danych
        const variablesObj = {
          "{klient}": client.imie,
          "{ekspert}": offer.lawFirm.nazwaFirmy,
          "{linkDoOceny}": linkDoOceny,
        }

        await prisma.scheduledEmail.create({
          data: {
            to: clientEmail,
            subject: `Jak oceniasz współpracę z ekspertem ${offer.lawFirm.nazwaFirmy}?`,
            templateType: EmailType.PROSBA_O_OCENE,
            variables: JSON.stringify(variablesObj),
            scheduledAt,
            status: ScheduledEmailStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        })
      } catch (schedError) {
        console.error("Failed to schedule review request email:", schedError)
      }
    }

    return Response.json(updatedOffer.updated)
  } catch (error) {
    console.error("Error accepting offer:", error)
    return Response.json(
      { error: "Błąd podczas akceptacji oferty" },
      { status: 500 }
    )
  }
}
