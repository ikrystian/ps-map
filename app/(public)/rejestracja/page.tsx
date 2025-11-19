import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AuthLayout } from "@/components/auth"

export default function RegistrationPage() {
  return (
    <AuthLayout
      heroTitle="Dołącz do społeczności ProstaSprawa"
      heroDescription="Niezależnie od tego, czy szukasz pomocy prawnej, czy oferujesz usługi prawne - jesteśmy tu dla Ciebie."
      heroStats={[
        { value: "2000+", label: "Zaufanych prawników" },
        { value: "15 000+", label: "Użytkowników" },
        { value: "99%", label: "Pozytywnych opinii" },
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
