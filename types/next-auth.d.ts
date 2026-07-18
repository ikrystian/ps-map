import { UserRole } from "@prisma/client"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    /** ID administratora aktywnie wcielonego w tego użytkownika (impersonacja) */
    impersonatorId?: string
    user: {
      id: string
      role: UserRole
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
    /** Ustawiane przez provider "impersonate": ID admina inicjującego wcielenie */
    impersonatorId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    lawFirmId?: string
    clientId?: string
    clientImie?: string
    clientNazwisko?: string
    clientTelefon?: string | null
    /** ID administratora aktywnie wcielonego w tego użytkownika (impersonacja) */
    impersonatorId?: string
  }
}
