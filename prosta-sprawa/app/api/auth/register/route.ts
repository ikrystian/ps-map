import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

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

    // Utworzenie użytkownika
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role as UserRole || UserRole.CLIENT,
        name: userData.name || null,
      },
    })

    // Jeśli CLIENT, utwórz profil klienta
    if (user.role === UserRole.CLIENT && userData.client) {
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
    if (user.role === UserRole.LAW_FIRM && userData.lawFirm) {
      // Pobierz pierwsze województwo mazowieckie jako domyślne
      const defaultVoivodeship = await prisma.voivodeship.findFirst({
        where: { nazwa: "mazowieckie" }
      })

      if (!defaultVoivodeship) {
        throw new Error("Nie znaleziono domyślnego województwa")
      }

      await prisma.lawFirm.create({
        data: {
          userId: user.id,
          typ: userData.lawFirm.typ,
          typInny: userData.lawFirm.typInny || null,
          nazwa: userData.lawFirm.nazwa,
          nazwaFirmy: userData.lawFirm.nazwaFirmy || userData.lawFirm.nazwa,
          nip: userData.lawFirm.nip || `TEMP${Date.now()}`, // Tymczasowy NIP dla MVP
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
        message: "Użytkownik został zarejestrowany",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
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
