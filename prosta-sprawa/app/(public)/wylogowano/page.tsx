"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Home, Search } from "lucide-react"

export default function LogoutSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Optional: Auto-redirect after 10 seconds
    const timeout = setTimeout(() => {
      router.push("/")
    }, 10000)

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader className="space-y-6 pt-12">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <LogOut className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">
              Zostałeś pomyślnie wylogowany
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pb-12">
            <p className="text-lg text-muted-foreground">
              Dziękujemy za skorzystanie z naszej platformy!
            </p>
            <p className="text-muted-foreground">
              Mamy nadzieję, że niedługo się jeszcze zobaczymy. Twoje konto jest bezpieczne
              i możesz zalogować się ponownie w dowolnym momencie.
            </p>

            <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="w-full sm:w-auto">
                  <Home className="mr-2 h-5 w-5" />
                  Strona główna
                </Button>
              </Link>
              <Link href="/logowanie">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Zaloguj się ponownie
                </Button>
              </Link>
              <Link href="/szukaj-prawnika">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Search className="mr-2 h-5 w-5" />
                  Szukaj prawnika
                </Button>
              </Link>
            </div>

            <div className="pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                Masz pytania? <Link href="/kontakt" className="text-primary hover:underline">Skontaktuj się z nami</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
