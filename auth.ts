import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import type { NextAuthConfig, Session, User } from "next-auth"
import type { JWT } from "next-auth/jwt"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Apple from "next-auth/providers/apple"
import { logLoginAttempt } from "@/lib/login-history"

export const authOptions: NextAuthConfig = {
  // @ts-expect-error - version mismatch between @auth/prisma-adapter and next-auth
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/logowanie",
    error: "/logowanie",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: process.env.AUTH_APPLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Brak wymaganych danych")
        }

        const normalizedEmail = (credentials.email as string).toLowerCase().trim()

        const user = await prisma.user.findUnique({
          where: {
            email: normalizedEmail,
          },
        })

        if (!user || !user.password) {
          throw new Error("Nieprawidłowy email lub hasło")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          await logLoginAttempt({ userId: user.id, success: false })
          throw new Error("Nieprawidłowy email lub hasło")
        }

        // Sprawdź czy konto jest zablokowane lub zawieszone
        if (user.status === "BLOCKED" || user.status === "SUSPENDED") {
          await logLoginAttempt({ userId: user.id, success: false })
          throw new Error("Twoje konto zostało zablokowane. Skontaktuj się z administratorem.")
        }

        // Sprawdź czy konto jest nieaktywne
        if (user.status === "INACTIVE") {
          await logLoginAttempt({ userId: user.id, success: false })
          throw new Error("Twoje konto jest nieaktywne. Skontaktuj się z administratorem.")
        }

        // Sprawdź czy email został zweryfikowany
        if (!user.emailVerified) {
          await logLoginAttempt({ userId: user.id, success: false })
          throw new Error("Email nie został zweryfikowany. Sprawdź swoją skrzynkę pocztową i kliknij link weryfikacyjny.")
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: { token: JWT; user: User; trigger?: "signIn" | "signUp" | "update"; session?: any }) {
      // Podczas pierwszego logowania
      if (user) {
        token.role = user.role
        token.id = user.id as string
        token.picture = user.image

        // Fetch lawFirm or client data
        let dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            lawFirm: { select: { id: true } },
            client: { select: { id: true, imie: true, nazwisko: true, telefon: true } }
          }
        })

        if (dbUser?.role === "CLIENT" && !dbUser.client) {
          const nameParts = user.name?.split(" ") || []
          const imie = nameParts[0] || "Użytkownik"
          const nazwisko = nameParts.slice(1).join(" ") || "Klient"

          try {
            const newClient = await prisma.client.create({
              data: {
                userId: dbUser.id,
                imie,
                nazwisko,
                zgodaRegulamin: true,
                zgodaNewsletter: false,
                zgodaMarketing: false,
              },
              select: { id: true, imie: true, nazwisko: true, telefon: true }
            })
            dbUser.client = newClient
          } catch (e) {
            console.error("Error auto-creating client profile in jwt callback:", e)
          }
        }

        if (dbUser?.lawFirm) {
          token.lawFirmId = dbUser.lawFirm.id
        }
        if (dbUser?.client) {
          token.clientId = dbUser.client.id
          token.clientImie = dbUser.client.imie
          token.clientNazwisko = dbUser.client.nazwisko
          token.clientTelefon = dbUser.client.telefon
        }
      }

      // Jeśli trigger to "update" i mamy dane sesji, użyj ich bezpośrednio
      if (trigger === "update" && session) {
        // Jeśli dane są przekazywane bezpośrednio do update()
        if (session.name !== undefined) {
          token.name = session.name
        }
        if (session.image !== undefined) {
          token.picture = session.image
        }
        token.lastRefresh = Date.now()
        return token
      }

      // Odśwież dane użytkownika z bazy jeśli sesja jest aktualizowana
      // lub okresowo (np. co 5 minut)
      const shouldRefresh = trigger === "update" ||
        !token.lastRefresh ||
        Date.now() - (token.lastRefresh as number) > 5 * 60 * 1000 // 5 minut

      if (shouldRefresh && token.id) {
        try {
          let freshUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              image: true,
              lawFirm: { select: { id: true } },
              client: { select: { id: true, imie: true, nazwisko: true, telefon: true } }
            },
          })

          if (freshUser?.role === "CLIENT" && !freshUser.client) {
            const nameParts = freshUser.name?.split(" ") || []
            const imie = nameParts[0] || "Użytkownik"
            const nazwisko = nameParts.slice(1).join(" ") || "Klient"

            try {
              const newClient = await prisma.client.create({
                data: {
                  userId: freshUser.id,
                  imie,
                  nazwisko,
                  zgodaRegulamin: true,
                  zgodaNewsletter: false,
                  zgodaMarketing: false,
                },
                select: { id: true, imie: true, nazwisko: true, telefon: true }
              })
              freshUser.client = newClient
            } catch (e) {
              console.error("Error auto-creating client profile during token refresh:", e)
            }
          }

          if (freshUser) {
            token.name = freshUser.name
            token.email = freshUser.email
            token.picture = freshUser.image
            token.role = freshUser.role
            token.lawFirmId = freshUser.lawFirm?.id
            token.clientId = freshUser.client?.id
            token.clientImie = freshUser.client?.imie
            token.clientNazwisko = freshUser.client?.nazwisko
            token.clientTelefon = freshUser.client?.telefon
            token.lastRefresh = Date.now()
          }
        } catch (error) {
          console.error("Error refreshing user data in JWT:", error)
        }
      }

      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as any
        session.user.image = token.picture as string | null | undefined
        session.user.name = token.name as string | null | undefined

        if (token.lawFirmId) {
          session.user.lawFirm = { id: token.lawFirmId }
        }
        if (token.clientId) {
          session.user.client = {
            id: token.clientId,
            imie: token.clientImie || '',
            nazwisko: token.clientNazwisko || '',
            telefon: token.clientTelefon
          }
        }
      }
      return session
    },
    async signIn({ user, account }: { user: User; account?: any }) {
      // Handle OAuth sign-ins (Google, Facebook, Apple)
      if (account?.provider !== "credentials") {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
              client: true,
              lawFirm: true,
            },
          })

          // Block OAuth registration - only allow login for existing users
          // Users registered via form will have a password set
          if (!dbUser || !dbUser.password) {
            // This is a registration attempt via OAuth - not allowed
            // Clean up user created by adapter if exists
            if (dbUser?.id) {
              await prisma.user.delete({
                where: { id: dbUser.id }
              }).catch(() => { })
            }
            return false
          }

          // Check if user is blocked or suspended
          if (dbUser.status === "BLOCKED" || dbUser.status === "SUSPENDED") {
            return "/logowanie?error=BlockedAccount"
          }

          // Check if user is inactive
          if (dbUser.status === "INACTIVE") {
            return "/logowanie?error=InactiveAccount"
          }

          // If user has CLIENT role but no Client profile, create one
          if (dbUser.role === "CLIENT" && !dbUser.client) {
            const nameParts = user.name?.split(" ") || []
            const imie = nameParts[0] || "Użytkownik"
            const nazwisko = nameParts.slice(1).join(" ") || "OAuth"

            await prisma.client.create({
              data: {
                userId: dbUser.id,
                imie,
                nazwisko,
                zgodaRegulamin: true, // Assumed consent via OAuth
                zgodaNewsletter: false,
                zgodaMarketing: false,
              },
            })
          }

          // If user has LAW_FIRM role but no LawFirm profile, they need to complete registration
          // This case should redirect them to complete the profile
          if (dbUser.role === "LAW_FIRM" && !dbUser.lawFirm) {
            // Allow sign-in but they'll need to complete their profile
            return true
          }
        } catch (error) {
          console.error("Error in signIn callback:", error)
        }
      }
      return true
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Jeśli URL jest relatywny lub z tej samej domeny
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      if (url.startsWith(baseUrl)) {
        return url
      }
      // Domyślne przekierowanie
      return baseUrl
    },
  },
  events: {
    async signIn({ user }: { user: User }) {
      console.log(`User ${user.email} signed in`)
      if (user?.id) {
        await logLoginAttempt({ userId: user.id, success: true })
      }
    },
    async signOut() {
      console.log(`User signed out`)
    },
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)
