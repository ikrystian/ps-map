import { generateEmailVerificationEmail, sendEmailWithTemplate } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit"
import { EmailType, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(`register:${getClientIp(request)}`, { limit: 5, windowMs: 60 * 60 * 1000 })
    if (!rl.success) return tooManyRequestsResponse(rl.retryAfterSeconds)

    const body = await request.json()
    const { email, password, isSocialRegistration, role: requestedRole, userData = {} } = body

    // Bezpieczeństwo: rola NIE może być ustawiana dowolnie z publicznego endpointu.
    // Dozwolona jest wyłącznie rejestracja jako CLIENT lub LAW_FIRM — nigdy ADMIN.
    const role: UserRole =
      requestedRole === "LAW_FIRM" ? UserRole.LAW_FIRM : UserRole.CLIENT

    // Walidacja
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Adres email jest wymagany" },
        { status: 400 }
      )
    }

    // Normalizacja emai/l
    const normalizedEmail = email.toLowerCase().trim()
    if (!email || (!password && !isSocialRegistration)) {
      return NextResponse.json(
        { error: "Email i hasło są wymagane" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      // Jeśli to rejestracja społecznościowa i użytkownik istnieje, pozwól na kontynuację (łączenie konta)
      if (isSocialRegistration) {
        // Sprawdź czy użytkownik ma już rolę CLIENT
        if (existingUser.role === "CLIENT") {
          // Sprawdź czy ma profil klienta
          const clientProfile = await prisma.client.findUnique({
            where: { userId: existingUser.id }
          })

          if (clientProfile) {
            return NextResponse.json(
              { error: "Masz już konto klienta. Zaloguj się." },
              { status: 400 }
            )
          }
        }
      } else {
        return NextResponse.json(
          { error: "Użytkownik o tym adresie email już istnieje" },
          { status: 400 }
        )
      }
    }

    let user;

    if (existingUser && isSocialRegistration) {
      // Aktualizuj istniejącego użytkownika
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: "CLIENT", // Ustaw rolę na CLIENT (lub obsłuż multorole w przyszłości)
        }
      })
    } else {
      // Hashowanie hasła
      const hashedPassword = await bcrypt.hash(password, 10)

      // Utworzenie użytkownika
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          role,
          name: userData.name || null,
          emailVerified: null, // Email nie zweryfikowany
        },
      })
    }

    // Generowanie tokenu weryfikacyjnego (tylko dla nowych użytkowników email/password)
    if (!existingUser) {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      const verificationToken = crypto.randomBytes(32).toString('hex')
      const verificationExpiry = new Date()
      verificationExpiry.setHours(verificationExpiry.getHours() + 24) // Token ważny 24 godziny

      // Zapisz token weryfikacyjny
      await prisma.verificationToken.create({
        data: {
          identifier: user.email,
          token: verificationToken,
          expires: verificationExpiry,
        },
      })

      // Wyślij email weryfikacyjny
      const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`
      const isLawFirm = user.role === "LAW_FIRM"

      try {
        await sendEmailWithTemplate({
          to: user.email,
          templateType: EmailType.POTWIERDZENIE_EMAIL,
          variables: {
            "{imie}": userData.name || user.email,
            "{email}": user.email,
            "{linkPotwierdzenia}": verificationUrl,
            "{kod}": verificationCode,
          },
          fallbackProvider: () => {
            const emailContent = generateEmailVerificationEmail(
              verificationUrl,
              userData.name || user.email,
              isLawFirm
            )
            return {
              subject: emailContent.subject,
              html: emailContent.html,
              text: emailContent.text,
            }
          }
        })
        console.log(`Verification email sent to: ${user.email}`)
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError)
      }
    }

    // Jeśli CLIENT, utwórz profil klienta
    const clientData = body.client || userData.client
    if (user.role === "CLIENT" && clientData) {
      const clientType = clientData.clientType || "INDIVIDUAL"

      await prisma.client.create({
        data: {
          userId: user.id,
          clientType,
          imie: clientData.imie,
          nazwisko: clientData.nazwisko,
          nazwaFirmy: clientType === "BUSINESS" ? (clientData.nazwaFirmy || null) : null,
          nip: clientType === "BUSINESS" ? (clientData.nip || null) : null,
          regon: clientType === "BUSINESS" ? (clientData.regon || null) : null,
          krs: clientType === "BUSINESS" ? (clientData.krs || null) : null,
          zgodaRegulamin: clientData.zgodaRegulamin || false,
          zgodaNewsletter: clientData.zgodaNewsletter || false,
          zgodaMarketing: clientData.zgodaMarketing || false,
        },
      })

      // Telefon i adres należą do użytkownika (model User)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          imie: clientData.imie || null,
          nazwisko: clientData.nazwisko || null,
          numerTelefonu: clientData.telefon || null,
          voivodeshipId: clientData.voivodeshipId || null,
          miasto: clientData.miasto || null,
          kodPocztowy: clientData.kodPocztowy || null,
        },
      })

      // Synchronizacja nazwy użytkownika
      const targetName = clientType === "BUSINESS"
        ? (clientData.nazwaFirmy || `${clientData.imie} ${clientData.nazwisko}`)
        : `${clientData.imie} ${clientData.nazwisko}`

      await prisma.user.update({
        where: { id: user.id },
        data: { name: targetName },
      })

      // Wyślij e-mail powitalny dla klienta
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
      try {
        await sendEmailWithTemplate({
          to: user.email,
          templateType: EmailType.REJESTRACJA_KLIENT,
          variables: {
            "{imie}": clientData.imie,
            "{nazwisko}": clientData.nazwisko,
            "{email}": user.email,
            "{linkDodajSprawa}": `${baseUrl}/dodaj-sprawe`,
          }
        })
      } catch (emailError) {
        console.error('Failed to send client welcome email:', emailError)
      }
    }

    // Jeśli LAW_FIRM, utwórz profil eksperta
    if (user.role === "LAW_FIRM" && userData.lawFirm) {
      // Pobierz pierwsze województwo mazowieckie jako domyślne
      const defaultVoivodeship = await prisma.voivodeship.findFirst({
        where: { nazwa: "mazowieckie" }
      })

      if (!defaultVoivodeship) {
        throw new Error("Nie znaleziono domyślnego województwa")
      }

      const nip = userData.lawFirm.nip || `TEMP${Date.now()}`
      const slug = userData.lawFirm.nazwaFirmy
        .toLowerCase()
        .replace(/[ąćęłńóśźż]/g, (char: string) => {
          const map: Record<string, string> = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' }
          return map[char] || char
        })
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-' + nip.slice(-4)

      // Sprawdź czy istnieje pakiet oznaczony jako podstawowy
      const primaryPackage = await prisma.subscriptionPlan.findFirst({
        where: { isPrimary: true, aktywny: true }
      })

      let subPackage: any = null
      let pkgStart: Date | null = null
      let pkgEnd: Date | null = null

      if (primaryPackage) {
        // Pobierz typ pakietu z nazwy (PODSTAWOWY, STANDARD, PREMIUM, BIZNES)
        const packageTypeMap: Record<string, string> = {
          "PODSTAWOWY": "PODSTAWOWY",
          "STANDARD": "STANDARD",
          "PREMIUM": "PREMIUM",
          "BIZNES": "BIZNES"
        }

        subPackage = packageTypeMap[primaryPackage.typ] || null
        if (subPackage) {
          pkgStart = new Date()
          // Pakiet podstawowy przyznawany automatycznie przy rejestracji ma
          // nieograniczony czas trwania (brak daty końcowej = bezterminowo).
          pkgEnd = null
        }
      }

      // Dane kontaktowe i adresowe należą do użytkownika (model User)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          imie: userData.lawFirm.imieKontakt || "Do uzupełnienia",
          nazwisko: userData.lawFirm.nazwiskoKontakt || "Do uzupełnienia",
          numerTelefonu: userData.lawFirm.numerTelefonu || "000000000",
          numerTelefonu2: userData.lawFirm.numerTelefonu2 || null,
          adres: userData.lawFirm.adres,
          kodPocztowy: userData.lawFirm.kodPocztowy || "00-000",
          miasto: userData.lawFirm.miasto,
          voivodeshipId: userData.lawFirm.voivodeshipId || defaultVoivodeship.id,
        },
      })

      await prisma.lawFirm.create({
        data: {
          userId: user.id,
          typ: userData.lawFirm.typ,
          typInny: userData.lawFirm.typInny || null,
          nazwa: userData.lawFirm.nazwa || userData.lawFirm.nazwaFirmy,
          nazwaFirmy: userData.lawFirm.nazwaFirmy,
          slug,
          nip, // Tymczasowy NIP dla MVP
          regon: userData.lawFirm.regon || null,
          krs: userData.lawFirm.krs || null,
          typOferty: userData.lawFirm.typOferty,
          pakietSubskrypcji: subPackage as any,
          dataPakietuOd: pkgStart,
          dataPakietuDo: pkgEnd,
          zgodaRegulamin: userData.lawFirm.zgodaRegulamin || false,
          zgodaPrzetwarzanie: userData.lawFirm.zgodaPrzetwarzanie || false,
        },
      })

      // Wyślij e-mail powitalny dla ekspertów
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
      try {
        await sendEmailWithTemplate({
          to: user.email,
          templateType: EmailType.REJESTRACJA_KANCELARIA,
          variables: {
            "{email}": user.email,
            "{nip}": nip,
            "{linkDoPanelu}": `${baseUrl}/panel-eksperta`,
          }
        })
      } catch (emailError) {
        console.error('Failed to send law firm welcome email:', emailError)
      }
    }

    return NextResponse.json(
      {
        message: "Rejestracja zakończona pomyślnie. Sprawdź swoją skrzynkę email, aby potwierdzić adres.",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        requiresEmailVerification: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Wystąpił błąd podczas rejestracji" },
      { status: 500 }
    )
  }
}
