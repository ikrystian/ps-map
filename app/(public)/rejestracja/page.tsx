import { AuthLayout } from "@/components/auth"
import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Załóż bezpłatne konto",
  description: "Wybierz rodzaj konta (Klient lub Ekspert) i dołącz do platformy Prosta Sprawa już dziś.",
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
      containerClassName="max-w-4xl"
    >
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-playfair font-bold tracking-tight">
            Wybierz typ konta
          </h2>
          <p className="text-muted-foreground text-base">
            Już masz konto?{" "}
            <Link
              href="/logowanie"
              className="text-primary hover:underline font-medium transition-colors"
            >
              Zaloguj się
            </Link>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Card 1 - Client */}
          <Link
            href="/rejestracja/klient"
            className="relative flex flex-col justify-end h-[380px] sm:h-[600px] rounded-2xl overflow-hidden group cursor-pointer border border-border/80 bg-card/45 hover:border-primary/50 transition-all duration-500 hover:shadow-lg"
          >
            {/* Background Image */}
            <Image
              src="/images/registration_client.webp"
              alt="Klient szukający pomocy"
              fill
              sizes="(max-width: 768px) 100vw, 960px"
              priority
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 z-0"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10 group-hover:via-black/45 transition-all duration-500 z-10" />

            {/* Content */}
            <div className="on-dark relative z-20 p-6 sm:p-8 space-y-3">
              <h3 className="text-3xl font-bold font-playfair text-foreground group-hover:text-primary transition-colors duration-300">
                Jestem klientem
              </h3>
              <p className="text-base text-foreground/80 leading-relaxed font-light">
                Szukam profesjonalnej pomocy prawnej dla siebie, swojej rodziny lub mojej firmy. Chcę szybko i bezpłatnie opisać sprawę.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  Zarejestruj się jako klient
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 duration-300" />
                </span>
              </div>
            </div>
          </Link>

          {/* Card 2 - Lawyer */}
          <Link
            href="/rejestracja/ekspert"
            className="relative flex flex-col justify-end h-[380px] sm:h-[600px] rounded-2xl overflow-hidden group cursor-pointer border border-border/80 bg-card/45 hover:border-primary/50 transition-all duration-500 hover:shadow-lg"
          >
            {/* Background Image */}
            <Image
              src="/images/registration_lawyer.webp"
              alt="Ekspert"
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              priority
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 z-0"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10 group-hover:via-black/45 transition-all duration-500 z-10" />

            {/* Content */}
            <div className="on-dark relative z-20 p-6 sm:p-8 space-y-3">
              <h3 className="text-3xl font-bold font-playfair text-foreground group-hover:text-primary transition-colors duration-300">
                Jestem ekspertem
              </h3>
              <p className="text-base text-foreground/80 leading-relaxed font-light">
                Oferuję profesjonalne usługi prawne. Chcę pozyskiwać nowych klientów online, budować markę i wygodnie zarządzać sprawami.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  Zarejestruj się jako ekspert
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 duration-300" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
