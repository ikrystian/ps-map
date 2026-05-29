import { AuthLayout } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Załóż bezpłatne konto | Prosta Sprawa",
  description: "Wybierz rodzaj konta (Klient lub Kancelaria) i dołącz do platformy Prosta Sprawa już dziś.",
}

export default function RegistrationPage() {
  return (
    <AuthLayout
      heroTitle="Dołącz do społeczności ProstaSprawa"
      heroDescription="Niezależnie od tego, czy szukasz pomocy prawnej, czy oferujesz usługi prawne - jesteśmy tu dla Ciebie."
      heroStats={[
        { value: 2000, unit: "+", label: "Zaufanych prawników" },
        { value: 15000, unit: "+", label: "Użytkowników" },
        { value: 99, unit: "%", label: "Pozytywnych opinii" },
      ]}
    >
      <div className="space-y-8">
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

        <div className="grid grid-cols-1 gap-6">
          {/* Klient */}
          <Link href="/rejestracja/klient">
            <Card className="transition-all hover:border-primary hover:shadow-md cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">👤</div>
                  <div className="flex-1">
                    <CardTitle>Jestem klientem</CardTitle>
                    <CardDescription>
                      Szukam pomocy prawnej dla siebie lub mojej firmy
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full h-11">
                  Zarejestruj się jako klient
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Kancelaria */}
          <Link href="/rejestracja/kancelaria">
            <Card className="transition-all hover:border-primary hover:shadow-md cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">⚖️</div>
                  <div className="flex-1">
                    <CardTitle>Jestem prawnikiem / kancelarią</CardTitle>
                    <CardDescription>
                      Oferuję usługi prawne i chcę pozyskiwać nowych klientów
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full h-11">
                  Zarejestruj się jako kancelaria
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
