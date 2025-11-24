import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"
import { sendEmail, generateEmailVerificationEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role, ...userData } = body

    // Walidacja
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email i hasło są wymagane" },
        { status: 400 }
      )
    }

    // Sprawdź czy użytkownik już istnieje
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Użytkownik o tym adresie email już istnieje" },
        { status: 400 }
      )
    }

    // Hashowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generowanie tokenu weryfikacyjnego
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpiry = new Date()
    verificationExpiry.setHours(verificationExpiry.getHours() + 24) // Token ważny 24 godziny

    // Utworzenie użytkownika
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: (role as UserRole) || "CLIENT",
        name: userData.name || null,
        emailVerified: null, // Email nie zweryfikowany
      },
    })

    // Zapisz token weryfikacyjny
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        expires: verificationExpiry,
      },
    })

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

    // Wyślij email weryfikacyjny
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`
    const isLawFirm = user.role === "LAW_FIRM"
    const emailContent = generateEmailVerificationEmail(
      verificationUrl,
      userData.name || user.email,
      isLawFirm
    )

    try {
      await sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      })
      console.log(`Verification email sent to: ${user.email}`)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Nie przerywamy rejestracji jeśli email się nie wysłał
      // Użytkownik może ponownie wysłać email weryfikacyjny
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
