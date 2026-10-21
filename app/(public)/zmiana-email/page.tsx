import { AuthLayout } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Zmiana adresu e-mail",
  description: "Potwierdzenie zmiany adresu e-mail w serwisie ProstaSprawa.pl.",
  robots: { index: false },
}

// Statusy ustawiane przez GET /api/account/email-change/confirm
const MESSAGES: Record<string, { title: string; text: string }> = {
  sukces: {
    title: "Adres e-mail zmieniony",
    text: "Nowy adres jest już przypisany do Twojego konta. Od teraz logujesz się nim i na niego wysyłamy powiadomienia.",
  },
  "link-wygasl": {
    title: "Link wygasł",
    text: "Link do zmiany adresu jest ważny 24 godziny. Zmień adres jeszcze raz w ustawieniach konta, a wyślemy nowy.",
  },
  "adres-zajety": {
    title: "Adres jest już zajęty",
    text: "W międzyczasie ten adres e-mail został użyty przy innym koncie. Wybierz inny adres w ustawieniach konta.",
  },
  "nieprawidlowy-link": {
    title: "Nieprawidłowy link",
    text: "Ten link jest niepoprawny albo został już użyty. Jeśli adres się nie zmienił, spróbuj jeszcze raz w ustawieniach konta.",
  },
  "blad-serwera": {
    title: "Coś poszło nie tak",
    text: "Nie udało się zmienić adresu. Spróbuj ponownie za chwilę albo napisz na bok@prostasprawa.pl.",
  },
}

export default async function EmailChangePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const success = status === "sukces"
  const message = MESSAGES[status ?? ""] ?? MESSAGES["nieprawidlowy-link"]

  return (
    <AuthLayout
      heroTitle="Zmiana adresu e-mail"
      heroDescription="Adres zmienia się dopiero po kliknięciu linku wysłanego na nową skrzynkę. Dzięki temu nikt nie przepnie Twojego konta na cudzy adres."
      heroImage="/images/security-lock.png"
    >
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          {success ? (
            <CheckCircle2 className="w-14 h-14 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <XCircle className="w-14 h-14 text-destructive" />
          )}
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-playfair">{message.title}</h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">{message.text}</p>
        </div>
        <Button asChild size="lg">
          <Link href="/logowanie">{success ? "Przejdź do konta" : "Zaloguj się"}</Link>
        </Button>
      </div>
    </AuthLayout>
  )
}
