import Link from "next/link"
import { ReactNode } from "react"

interface HeroStat {
  value: string
  label: string
}

interface AuthLayoutProps {
  children: ReactNode
  heroTitle?: string
  heroDescription?: string
  heroStats?: HeroStat[]
}

export function AuthLayout({
  children,
  heroTitle = "Twoja droga do rozwiązania problemów prawnych",
  heroDescription = "Połącz się z najlepszymi ekspertami prawnymi w Polsce. Znajdź pomoc prawną dostosowaną do Twoich potrzeb.",
  heroStats = [
    { value: "2000+", label: "Prawników" },
    { value: "5000+", label: "Spraw" },
    { value: "98%", label: "Zadowolenia" },
  ],
}: AuthLayoutProps) {
  return (
    <div className="min-h-[calc(100dvh-65px)] grid lg:grid-cols-2">
      {/* Left Column - Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Brand */}
          <div className="text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold">ProstaSprawa</h1>
            </Link>
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>

      {/* Right Column - Image/Hero */}
      <div className="hidden lg:block relative bg-gradient-to-br from-primary/90 to-primary hero-image">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
          <div className="max-w-md space-y-6 text-center">
            <h2 className="text-4xl font-bold">{heroTitle}</h2>
            <p className="text-lg text-white/90">{heroDescription}</p>
            {heroStats && heroStats.length > 0 && (
              <div className="grid grid-cols-3 gap-8 pt-8">
                {heroStats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
