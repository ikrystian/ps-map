import { UserRole } from "@prisma/client"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      firstName?: string | null
      lastName?: string | null
      phone?: string | null
      lawFirm?: {
        id: string
      }
      client?: {
        id: string
        imie: string
        nazwisko: string
        telefon?: string | null
      }
    } & DefaultSession["user"]
  }

  interface User {
    role: UserRole
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
    lawFirmId?: string
    clientId?: string
    clientImie?: string
    clientNazwisko?: string
    clientTelefon?: string | null
  }
}
