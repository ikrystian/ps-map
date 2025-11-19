import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { UserRole } from "@prisma/client"
import type { NextAuthConfig, Session, User } from "next-auth"
import type { JWT } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export const authOptions: NextAuthConfig = {
  trustHost: true,
  trustedHosts: ["ps.studio-ai.com.pl", "https://ps.studio-ai.com.pl"],
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

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
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

        // Sprawdź czy email został zweryfikowany
        if (!user.emailVerified) {
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
    async jwt({ token, user, trigger }: { token: JWT; user: User; trigger?: "signIn" | "signUp" | "update" }) {
      // Podczas pierwszego logowania
      if (user) {
        token.role = user.role as UserRole
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
            token.role = freshUser.role as UserRole
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
        session.user.role = token.role as UserRole
        session.user.image = token.picture as string | null | undefined
        session.user.name = token.name as string | null | undefined
      }
      return session
    },
    async signIn({ user }: { user: User }) {
      // Możesz dodać tutaj dodatkową logikę weryfikacji
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
