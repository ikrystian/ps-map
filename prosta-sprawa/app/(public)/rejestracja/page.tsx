import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function RegistrationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">
            Wybierz typ konta
          </h2>
          <p className="text-muted-foreground">
            Już masz konto?{" "}
            <Link
              href="/logowanie"
              className="text-primary hover:underline"
            >
              Zaloguj się
            </Link>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Klient */}
          <Link href="/rejestracja/klient">
            <Card className="h-full transition-all hover:border-primary cursor-pointer">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">👤</div>
                <CardTitle>Jestem klientem</CardTitle>
                <CardDescription>
                  Szukam pomocy prawnej dla siebie lub mojej firmy
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button className="w-full">
                  Zarejestruj się jako klient
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Kancelaria */}
          <Link href="/rejestracja/kancelaria">
            <Card className="h-full transition-all hover:border-primary cursor-pointer">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">⚖️</div>
                <CardTitle>Jestem prawnikiem / kancelarią</CardTitle>
                <CardDescription>
                  Oferuję usługi prawne i chcę pozyskiwać nowych klientów
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button className="w-full">
                  Zarejestruj się jako kancelaria
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
