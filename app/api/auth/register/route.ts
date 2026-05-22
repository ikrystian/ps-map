import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { UserRole, EmailType } from "@prisma/client"
import bcrypt from "bcryptjs"
import { sendEmail, sendEmailWithTemplate, generateEmailVerificationEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, isSocialRegistration, role, userData = {} } = body

    // Walidacja
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Adres email jest wymagany" },
        { status: 400 }
      )
    }

    // Normalizacja email
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
          role: (role as UserRole) || "CLIENT",
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
    if (user.role === "CLIENT" && userData.client) {
      await prisma.client.create({
        data: {
          userId: user.id,
          imie: userData.client.imie,
          nazwisko: userData.client.nazwisko,
          telefon: userData.client.telefon || null,
          voivodeshipId: userData.client.voivodeshipId || null,
          miasto: userData.client.miasto || null,
          zgodaRegulamin: userData.client.zgodaRegulamin || false,
          zgodaNewsletter: userData.client.zgodaNewsletter || false,
          zgodaMarketing: userData.client.zgodaMarketing || false,
        },
      })
    }

    // Jeśli LAW_FIRM, utwórz profil kancelarii
    if (user.role === "LAW_FIRM" && userData.lawFirm) {
      // Pobierz pierwsze województwo mazowieckie jako domyślne
      const defaultVoivodeship = await prisma.voivodeship.findFirst({
        where: { nazwa: "mazowieckie" }
      })

      if (!defaultVoivodeship) {
        throw new Error("Nie znaleziono domyślnego województwa")
      }

      const nip = userData.lawFirm.nip || `TEMP${Date.now()}`
      const slug = userData.lawFirm.nazwa
        .toLowerCase()
        .replace(/[ąćęłńóśźż]/g, (char: string) => {
          const map: Record<string, string> = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' }
          return map[char] || char
        })
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-' + nip.slice(-4)

      await prisma.lawFirm.create({
        data: {
          userId: user.id,
          typ: userData.lawFirm.typ,
          typInny: userData.lawFirm.typInny || null,
          nazwa: userData.lawFirm.nazwa,
          nazwaFirmy: userData.lawFirm.nazwaFirmy || userData.lawFirm.nazwa,
          slug,
          nip, // Tymczasowy NIP dla MVP
          regon: userData.lawFirm.regon || null,
          krs: userData.lawFirm.krs || null,
          imieKontakt: userData.lawFirm.imieKontakt || "Do uzupełnienia",
          nazwiskoKontakt: userData.lawFirm.nazwiskoKontakt || "Do uzupełnienia",
          stanowisko: userData.lawFirm.stanowisko || null,
          numerTelefonu: userData.lawFirm.numerTelefonu || "000000000",
          numerTelefonu2: userData.lawFirm.numerTelefonu2 || null,
          emailKontakt: userData.lawFirm.emailKontakt,
          adres: userData.lawFirm.adres,
          kodPocztowy: userData.lawFirm.kodPocztowy || "00-000",
          miasto: userData.lawFirm.miasto,
          voivodeshipId: userData.lawFirm.voivodeshipId || defaultVoivodeship.id,
          typOferty: userData.lawFirm.typOferty,
          zgodaRegulamin: userData.lawFirm.zgodaRegulamin || false,
          zgodaPrzetwarzanie: userData.lawFirm.zgodaPrzetwarzanie || false,
        },
      })
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
