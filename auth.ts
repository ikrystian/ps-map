import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { UserRole } from "@prisma/client"
import type { NextAuthConfig, Session, User } from "next-auth"
import type { JWT } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export const authOptions: NextAuthConfig = {
Panel Kancelarii
￼
Panel użytkownika
Sprawy
Oferty
Profil
Zakres usług
Blog
Opinie
Certyfikaty
Dokumenty
Punkty
Pakiet
Promowanie
Pozycja ogłoszeń
Statystyki
Wiadomości
Ustawienia
Mój profil publiczny
￼
Wyloguj
￼
￼
0
punktów
￼
B
BPCoders
Panel Kancelarii
Witaj, BPCoders! Oto podsumowanie Twojej aktywności.

Wyświetlenia profilu
0
Złożone oferty
0
Konwersja
0.0%
0 wygranych z 0

Pozycja w rankingu
Brak
￼Zobacz szczegóły
Twój pakiet i limity
Aktualny pakiet: Brak pakietu
Brak pakietu
Aktywne sprawy
Limit
0/0
Osiągnięto limit. Ulepsz pakiet, aby zwiększyć.

Zwiększ limit
Kategorie prawne
Limit
0/0
Osiągnięto limit. Ulepsz pakiet, aby zwiększyć.

Zwiększ limit
Edycja profilu
Zaktualizuj dane kancelarii

Sprawy
Przeglądaj dostępne sprawy

Pozycja
Zobacz swoją pozycję

Zakres usług
Zarządzaj swoimi usługami

Statystyki wyświetleń
Ostatnie 7 dni
0
ten miesiąc
Pon
1
0%
Wt
1
0%
Śr
1
0%
Czw
1
0%
Pt
1
0%
Sob
1
0%
Ndz
1
0%
Średnio dziennie
1 wyświetleń
W tym miesiącu
0 wyświetleń
Statystyki ofert
Ostatni miesiąc
0
ofert
0%
sukces
Zaakceptowane
Oferty wygrane

0
Pozostałe
W trakcie/odrzucone

0
Moje artykuły
￼Zobacz wszystkie
Nie masz jeszcze żadnych artykułów

￼Dodaj pierwszy artykuł
Promuj swoją kancelarię
Zwiększ widoczność i zdobądź więcej klientów
Wyróżnienie profilu

Twój profil będzie wyświetlany na górze listy

Top pozycja

Znajdź się w sekcji TOP kancelarii

Więcej odsłon

Nawet do 300% więcej wyświetleń profilu

Twoje punkty:
0 pkt
￼Rozpocznij promocję
￼Kup punkty
Program Partnerski
Zostań partnerem premium i zyskaj więcej
Badge "Partner Premium"

Wyróżnij się wśród konkurencji

Dedykowany opiekun

Osobiste wsparcie w rozwoju

Priorytetowa widoczność

Zawsze na pierwszych pozycjach

299 zł
/miesięcznie
￼Zostań partnerem
Klub Partnerski
Dołącz do naszego programu i czerp liczne korzyści
W ramach dołączenia do naszego Klubu Partnerskiego, możesz czerpać liczne korzyści. Dołączając do programu, zyskujesz następujące przywileje:

Dla pakietów płatnych:

Co miesiąc otrzymasz 20 punktów o łącznej wartości 20 zł, które zostaną dodane do Twojego schowka.
Korzystaj z większych gratisów przy zakupie dodatkowych punktów.
Dla pakietu bezpłatnego:

Możliwość odsłonięcia numeru kontaktowego.
Opcja odpowiadania na wiadomości prywatne.
Aby przystąpić do programu, wystarczy umieścić baner lub widget na Twojej stronie internetowej.

￼Dowiedz się więcej
Stan punktów
Punkty do wykorzystania na promocje i wyróżnienia
0 pkt
￼Kup punkty
￼Promuj ofertę
Pakiet subskrypcji
Aktualny plan i data wygaśnięcia
￼Zmień pakiet
Oceny i opinie
0.0
0 opinii

￼Zobacz wszystkie
Nowe sprawy
￼Zobacz wszystkie
40 nowych spraw w tym miesiącu
Libero illum quas nobis.

Prawo Nieruchomości • 3 ofert

Nowa
Fugit vero magnam porro enim laboriosam tempora.

Prawo Gospodarcze • 4 ofert

Nowa
Aliquid dolore quibusdam distinctio et qui dolor eaque.

Prawo Gospodarcze • 4 ofert

Nowa
Quo similique quisquam animi ratione ut laborum voluptates.

Prawo Pracy • 1 ofert

Nowa
Velit excepturi nesciunt veniam minima tempore ratione quo.

Prawo Medyczne • 2 ofert

Nowa
Ostatnie oferty
￼Zobacz wszystkie
Twoje ostatnio złożone oferty
Brak ofert

￼
We value your privacy
This site uses cookies to improve your browsing experience, analyze site traffic, and show personalized content.
￼Reject All
￼Accept All
￼Customize  trustHost: true,
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
