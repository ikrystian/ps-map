import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { NextAuthConfig, Session, User } from "next-auth"
import type { JWT } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export const authOptions: NextAuthConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/logowanie",
    error: "/logowanie",
  },
  providers: [
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
          throw new Error("Nieprawidłowy email lub hasło")
        }

        // Sprawdź czy konto jest zablokowane lub zawieszone
        if (user.status === "BLOCKED" || user.status === "SUSPENDED") {
          throw new Error("Twoje konto zostało zablokowane. Skontaktuj się z administratorem.")
        }

        // Sprawdź czy konto jest nieaktywne
        if (user.status === "INACTIVE") {
          throw new Error("Twoje konto jest nieaktywne. Skontaktuj się z administratorem.")
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
    async jwt({ token, user, trigger }: { token: JWT; user: User; trigger?: "signIn" | "signUp" | "update" }) {
      // Podczas pierwszego logowania
      if (user) {
        token.role = user.role
        token.id = user.id as string
        token.picture = user.image
      }

      // Odśwież dane użytkownika z bazy jeśli sesja jest aktualizowana
      // lub okresowo (np. co 5 minut)
      const shouldRefresh = trigger === "update" ||
        !token.lastRefresh ||
        Date.now() - (token.lastRefresh as number) > 5 * 60 * 1000 // 5 minut

      if (shouldRefresh && token.id) {
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              image: true,
            },
          })

          if (freshUser) {
            token.name = freshUser.name
            token.email = freshUser.email
            token.picture = freshUser.image
            token.role = freshUser.role
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
      }
      return session
    },
    async signIn({ user }: { user: User }) {
      if (user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id }
        })
        if (dbUser && (dbUser.status === "BLOCKED" || dbUser.status === "SUSPENDED")) {
          return "/logowanie?error=BlockedAccount"
        }
        if (dbUser && dbUser.status === "INACTIVE") {
          return "/logowanie?error=InactiveAccount"
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
    },
    async signOut() {
      console.log(`User signed out`)
    },
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)

export const getCurrentUser = async () => {
  const session = await auth()
  return session?.user
}
