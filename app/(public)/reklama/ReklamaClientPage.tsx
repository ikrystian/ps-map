"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  TrendingUp, 
  Target, 
  Award, 
  FileText, 
  BarChart3, 
  Users, 
  MousePointerClick, 
  Mail, 
  Phone, 
  ArrowRight, 
  HelpCircle, 
  CheckCircle2, 
  Calculator, 
  Briefcase, 
  ShieldCheck,
  Building2,
  Sparkles,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/sonner"
import { NumberTicker } from "@/components/ui/number-ticker"
import "./reklama.css"

// Formaty reklamowe dane
const AD_FORMATS = [
  {
    id: "banner-top",
    title: "Sponsorowany Baner Poziomy",
    badge: "Premium",
    dimensions: "970x90 px / 728x90 px",
    description: "Zajmij najbardziej eksponowane miejsce na samej górze wyników wyszukiwania oraz podstron kategorii. Gwarantuje to maksymalną liczbę wyświetleń.",
    benefits: ["Maksymalny zasięg i świadomość marki", "Pierwsza rzecz, którą widzi użytkownik", "Możliwość targetowania regionalnego"],
    ctr: "4.8%",
    icon: LayoutIcon
  },
  {
    id: "banner-sidebar",
    title: "Baner w Sidebarze Kategorii",
    badge: "Wysoka Konwersja",
    dimensions: "300x250 px",
    description: "Reklama graficzna umieszczona bezpośrednio na panelu bocznym wybranej kategorii. Idealne rozwiązanie, by docierać do klientów o konkretnych intencjach.",
    benefits: ["Precyzyjne dopasowanie do kategorii sprawy", "Długi czas kontaktu użytkownika z kreacją", "Świetny stosunek ceny do efektywności"],
    ctr: "3.5%",
    icon: SidebarIcon
  },
  {
    id: "profile-highlight",
    title: "Wyróżnienie Profilu Prawnika",
    badge: "Dla Kancelarii",
    dimensions: "Wizytówka Premium",
    description: "Twoja wizytówka zawsze na szczycie listy rekomendowanych specjalistów w Twoim mieście i specjalizacji. Ponadprzeciętny CTR.",
    benefits: ["Priorytetowe wyświetlanie w rankingu", "Oznaczenie profilu plakietką 'Rekomendowany'", "Bezpośredni przycisk 'Kontakt z ekspertem'"],
    ctr: "6.8%",
    icon: ProfileIcon
  },
  {
    id: "sponsored-article",
    title: "Artykuł Sponsorowany na Blogu",
    badge: "SEO & Autorytet",
    dimensions: "Baza wiedzy",
    description: "Ekspercki artykuł podpisany Twoim nazwiskiem lub marką. Publikacja na naszym blogu z linkiem do Twojej strony poprawi Twoją widoczność w Google.",
    benefits: ["Budowanie pozycji eksperta branżowego", "Wieczysta publikacja z linkiem dofollow", "Ruch organiczny z wyszukiwarki Google"],
    ctr: "2.8%",
    icon: BlogIcon
  }
]

// FAQ dane
const FAQ_ITEMS = [
  {
    question: "Jak szybko moja reklama może pojawić się na stronie?",
    answer: "Kampanie bannerowe oraz wyróżnienia profili uruchamiamy zazwyczaj w ciągu 24-48 godzin od momentu zaakceptowania kreacji reklamowej oraz opłacenia zamówienia. W przypadku artykułów sponsorowanych czas publikacji wynosi do 3 dni roboczych od dostarczenia lub napisania tekstu."
  },
  {
    question: "Czy pomagacie w przygotowaniu banerów graficznych?",
    answer: "Tak! Posiadamy własny zespół grafików. Jeśli nie dysponujesz gotowymi kreacjami, możemy je dla Ciebie zaprojektować bezpłatnie w ramach wykupienia kampanii na okres minimum 3 miesięcy."
  },
  {
    question: "Czy mogę ograniczyć wyświetlanie reklamy do mojego województwa?",
    answer: "Oczywiście. Oferujemy zaawansowane opcje geotargetowania. Twoje banery lub wyróżnienia mogą wyświetlać się wyłącznie użytkownikom wyszukującym specjalistów w wybranym województwie (np. Mazowieckie) lub konkretnym mieście."
  },
  {
    question: "Jak mierzona jest efektywność kampanii?",
    answer: "Zapewniamy pełną transparentność. Na koniec każdego miesiąca otrzymasz od nas szczegółowy raport zawierający liczbę wyświetleń banera (Impressions) oraz liczbę kliknięć (Clicks) wraz z wyliczonym współczynnikiem CTR."
  },
  {
    question: "Czy są jakieś ograniczenia dotyczące reklamowanych usług?",
    answer: "Reklamowane usługi muszą być zgodne z prawem oraz regulaminem naszego serwisu. Skupiamy się na prawie, podatkach, ubezpieczeniach, finansach i usługach wsparcia biznesu. Zastrzegamy sobie prawo do odmowy emisji reklam naruszających dobre obyczaje lub konkurencyjnych bezpośrednio do samej platformy."
  }
]

function LayoutIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  )
}

function SidebarIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M15 3v18" />
    </svg>
  )
}

function ProfileIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function BlogIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10M6 10h10M6 14h8" />
    </svg>
  )
}

export default function ReklamaClientPage() {
  const [activeFormat, setActiveFormat] = useState("banner-top")
  
  // Kalkulator stan
  const [calcBudget, setCalcBudget] = useState(1500)
  const [calcType, setCalcType] = useState("banner-top")

  // Formularz stan
  const [formData, setFormData] = useState({
    imieNazwisko: "",
    email: "",
    telefon: "",
    budzet: "1000-3000",
    format: "banner-top",
    tresc: "",
    politykaPrivacy: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // FAQ stan
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null)

  // Kalkulator logiki
  const getCalcResults = () => {
    let ctr = 0.048 // banner-top
    let cpm = 25 // koszt za 1000 wyswietlen
    
    if (calcType === "banner-sidebar") {
      ctr = 0.035
      cpm = 18
    } else if (calcType === "profile-highlight") {
      ctr = 0.068
      cpm = 30
    } else if (calcType === "sponsored-article") {
      ctr = 0.028
      cpm = 15
    }

    const estimatedImpressions = Math.round((calcBudget / cpm) * 1000)
    const estimatedClicks = Math.round(estimatedImpressions * ctr)
    const estimatedCpc = estimatedClicks > 0 ? (calcBudget / estimatedClicks).toFixed(2) : "0.00"

    return {
      impressions: estimatedImpressions,
      clicks: estimatedClicks,
      cpc: estimatedCpc
    }
  }

  const calcResults = getCalcResults()

  // Obsługa wysyłki formularza
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.politykaPrivacy) {
      toast.error("Zaakceptuj politykę prywatności serwisu.")
      return
    }

    setIsSubmitting(true)

    try {
      const detailedMessage = `[Zapytanie z Landing Page Reklama]
Preferowany format reklamy: ${formData.format}
Deklarowany budżet miesięczny: ${formData.budzet} PLN
Szczegóły wiadomości:
${formData.tresc}`

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imieNazwisko: formData.imieNazwisko,
          email: formData.email,
          telefon: formData.telefon,
          temat: "WSPOLPRACA",
          tresc: detailedMessage,
          politykaPrivacy: formData.politykaPrivacy
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Nie udało się przesłać zgłoszenia.")
      }

      toast.success("Dziękujemy! Otrzymaliśmy Twoje zapytanie. Odpowiemy w ciągu 24h.")
      setSubmitted(true)
      setFormData({
        imieNazwisko: "",
        email: "",
        telefon: "",
        budzet: "1000-3000",
        format: "banner-top",
        tresc: "",
        politykaPrivacy: false,
      })
    } catch (err: any) {
      toast.error(err.message || "Wystąpił błąd podczas wysyłania wiadomości.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-glow-orange pointer-events-none z-0" />
      <div className="absolute top-[30vh] right-1/4 w-[600px] h-[600px] bg-glow-teal pointer-events-none z-0" />
      <div className="absolute bottom-[10vh] left-10 w-[400px] h-[400px] bg-glow-orange pointer-events-none z-0" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0" />

      {/* SECTION 1: HERO SECTION */}
      <section className="relative z-10 pt-10 pb-20 md:pt-16 md:pb-28 border-b border-border/40">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold tracking-wider text-primary dark:text-[#0da192]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>OFERTA REKLAMOWA 2026</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-playfair font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.1] tracking-tight"
              >
                Docieraj bezpośrednio do osób poszukujących <span className="text-primary dark:text-[#0da192] italic">pomocy prawnej</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed"
              >
                ProstaSprawa.pl to wiodąca platforma łącząca klientów z kancelariami w całej Polsce. 
                Pokaż się tam, gdzie Twoi przyszli klienci aktywnie szukają wsparcia. Zwiększ widoczność, zbuduj zaufanie i generuj zlecenia.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <Button 
                  onClick={() => document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" })}
                  size="lg" 
                  className="bg-primary text-white hover:bg-primary-hover font-semibold px-8 h-12 shadow-lg shadow-primary/20 cursor-pointer"
                >
                  Skontaktuj się z nami
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => document.getElementById("formats-section")?.scrollIntoView({ behavior: "smooth" })}
                  variant="outline" 
                  size="lg" 
                  className="border-border hover:bg-muted font-medium px-8 h-12 cursor-pointer"
                >
                  Poznaj formaty reklam
                </Button>
              </motion.div>

              {/* Trust markers */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-3 gap-6 pt-8 border-t border-border/60 max-w-xl"
              >
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">100%</div>
                  <div className="text-xs text-muted-foreground">Grupa docelowa (intencyjna)</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">&lt; 0.60 zł</div>
                  <div className="text-xs text-muted-foreground">Szacowany koszt kliknięcia</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">Elastycznie</div>
                  <div className="text-xs text-muted-foreground">Brak długoterminowych umów</div>
                </div>
              </motion.div>
            </div>

            {/* Right Graphic */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 relative flex justify-center"
            >
              <div className="relative group w-full max-w-[460px]">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-emerald-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000" />
                <div className="relative bg-card border border-border/80 rounded-3xl p-3 shadow-2xl overflow-hidden glass-panel">
                  <img 
                    src="/images/reklama_hero.png" 
                    alt="Statystyki i Prawo Reklama" 
                    className="w-full h-auto object-cover rounded-2xl animate-float"
                  />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* SECTION 2: STATS TICKER */}
      <section className="relative z-10 py-12 bg-muted/40 border-b border-border/40">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            
            <div className="text-center space-y-1.5">
              <div className="text-3xl md:text-4xl font-extrabold text-primary dark:text-[#0da192] flex items-center justify-center">
                <NumberTicker value={50000} />
                <span>+</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Unikalnych wizyt / msc</p>
            </div>

            <div className="text-center space-y-1.5">
              <div className="text-3xl md:text-4xl font-extrabold text-primary dark:text-[#0da192] flex items-center justify-center">
                <NumberTicker value={3500} />
                <span>+</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Nowych spraw / msc</p>
            </div>

            <div className="text-center space-y-1.5">
              <div className="text-3xl md:text-4xl font-extrabold text-primary dark:text-[#0da192] flex items-center justify-center">
                <NumberTicker value={48} decimalPlaces={1} />
                <span>%</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Średni CTR Banerów</p>
            </div>

            <div className="text-center space-y-1.5">
              <div className="text-3xl md:text-4xl font-extrabold text-primary dark:text-[#0da192] flex items-center justify-center">
                <NumberTicker value={180} />
                <span>+</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Aktywnych Kancelarii</p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: AD FORMATS EXHIBITION */}
      <section id="formats-section" className="relative z-10 py-20 border-b border-border/40">
        <div className="container mx-auto px-4 max-w-7xl">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-tight">
              Wybierz format idealny dla Twojego biznesu
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Oferujemy zróżnicowane formaty reklamowe dostosowane do celów wizerunkowych, sprzedażowych i SEO. Zobacz, co przygotowaliśmy.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Formats Selector (Left) */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {AD_FORMATS.map((format) => {
                const IconComponent = format.icon
                const isActive = activeFormat === format.id

                return (
                  <button
                    key={format.id}
                    onClick={() => setActiveFormat(format.id)}
                    className={`flex items-start text-left p-4.5 rounded-2xl border transition-all duration-300 group cursor-pointer ${
                      isActive 
                        ? "bg-card border-primary dark:border-[#0da192] shadow-md shadow-primary/5" 
                        : "bg-background border-border/60 hover:bg-card hover:border-border"
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg mr-4 transition-colors ${
                      isActive 
                        ? "bg-primary/10 text-primary dark:text-[#0da192]" 
                        : "bg-muted text-muted-foreground group-hover:text-foreground"
                    }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-sm md:text-base text-foreground">{format.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive 
                            ? "bg-primary/20 text-primary dark:text-[#0da192]" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {format.badge}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{format.dimensions}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Formats Preview & Details (Right) */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {AD_FORMATS.map((format) => {
                  if (format.id !== activeFormat) return null
                  const IconComponent = format.icon

                  return (
                    <motion.div
                      key={format.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-xl glass-panel text-left"
                    >
                      <div className="flex items-center justify-between border-b border-border/60 pb-5">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-primary dark:text-[#0da192] uppercase tracking-wider">{format.badge}</span>
                          <h3 className="font-playfair text-2xl font-bold text-foreground">{format.title}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary dark:text-[#0da192]">
                          <IconComponent className="h-6 w-6" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                          {format.description}
                        </p>

                        <div className="flex items-center gap-4.5 bg-muted/60 p-4 rounded-xl border border-border/40">
                          <div>
                            <div className="text-xs text-muted-foreground">Wymiary / Format</div>
                            <div className="text-sm font-bold text-foreground">{format.dimensions}</div>
                          </div>
                          <div className="w-px h-8 bg-border" />
                          <div>
                            <div className="text-xs text-muted-foreground">Estymowany CTR</div>
                            <div className="text-sm font-bold text-foreground">{format.ctr}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">Najważniejsze korzyści:</h4>
                        <ul className="space-y-2">
                          {format.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <Button 
                          onClick={() => {
                            setFormData(prev => ({ ...prev, format: format.id }))
                            document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" })
                          }}
                          className="bg-primary text-white hover:bg-primary-hover font-semibold px-6 cursor-pointer"
                        >
                          Wybierz ten format
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: BENEFITS & TARGET */}
      <section className="relative z-10 py-20 bg-muted/20 border-b border-border/40">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column: text */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-primary dark:text-[#0da192] uppercase tracking-wider">Zyskaj z nami przewagę</h3>
                <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-tight">
                  Dlaczego warto reklamować się na ProstaSprawa.pl?
                </h2>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                Jesteśmy jedynym w Polsce portalem prawniczym, który łączy w sobie bazę realnych spraw ze strefą wyszukiwania prawników. 
                Użytkownicy trafiają do nas z konkretnymi problemami i pilną potrzebą zatrudnienia profesjonalisty.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary dark:text-[#0da192]">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm md:text-base text-foreground">Zero marnowania budżetu</h4>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      Nie płacisz za przypadkowy ruch. Twoja reklama trafia wyłącznie do osób szukających wsparcia prawnego i biznesowego.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary dark:text-[#0da192]">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm md:text-base text-foreground">Stały przypływ leadów</h4>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      Wspieramy dynamiczne pozyskiwanie kontaktów. Prezentujemy formularze kontaktowe bezpośrednio pod Twoimi kreacjami.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary dark:text-[#0da192]">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm md:text-base text-foreground">Wzmocnienie wizerunku marki</h4>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      Pozycjonowanie w towarzystwie rzetelnych materiałów eksperckich podnosi wiarygodność Twojej firmy w oczach klientów.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: target sectors grid */}
            <div className="bg-card border border-border p-6 md:p-8 rounded-3xl glass-panel space-y-6">
              <h3 className="font-playfair text-xl md:text-2xl font-bold text-foreground text-center">Do kogo kierujemy naszą ofertę?</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 bg-muted/60 border border-border/40 rounded-2xl space-y-2">
                  <Briefcase className="h-6 w-6 text-primary dark:text-[#0da192]" />
                  <h4 className="font-bold text-sm text-foreground">Kancelarie prawne</h4>
                  <p className="text-xs text-muted-foreground">Adwokaci, radcowie prawni szukający klientów w danej specjalizacji.</p>
                </div>

                <div className="p-4 bg-muted/60 border border-border/40 rounded-2xl space-y-2">
                  <Building2 className="h-6 w-6 text-primary dark:text-[#0da192]" />
                  <h4 className="font-bold text-sm text-foreground">Notariusze i Mediatorzy</h4>
                  <p className="text-xs text-muted-foreground">Wspieramy budowanie widoczności lokalnej kancelarii notarialnych.</p>
                </div>

                <div className="p-4 bg-muted/60 border border-border/40 rounded-2xl space-y-2">
                  <Users className="h-6 w-6 text-primary dark:text-[#0da192]" />
                  <h4 className="font-bold text-sm text-foreground">Biura rachunkowe</h4>
                  <p className="text-xs text-muted-foreground">Firmy księgowe i doradcy podatkowi celujący w nowe spółki i JDG.</p>
                </div>

                <div className="p-4 bg-muted/60 border border-border/40 rounded-2xl space-y-2">
                  <ShieldCheck className="h-6 w-6 text-primary dark:text-[#0da192]" />
                  <h4 className="font-bold text-sm text-foreground">Ubezpieczenia i Finanse</h4>
                  <p className="text-xs text-muted-foreground">Pośrednicy ubezpieczeniowi, doradcy kredytowi oferujący polisy i finansowanie.</p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5: INTERACTIVE ROI CALCULATOR */}
      <section className="relative z-10 py-20 border-b border-border/40">
        <div className="container mx-auto px-4 max-w-7xl">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-tight">
              Oszacuj wyniki swojej kampanii
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Przesuń suwak budżetu oraz wybierz format reklamy, aby zobaczyć orientacyjne statystyki zasięgowe Twoich działań reklamowych.
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-2xl glass-panel max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Inputs Column */}
              <div className="space-y-8">
                
                {/* Format selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">1. Wybierz format reklamy</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setCalcType("banner-top")}
                      className={`py-2.5 px-3 text-xs font-semibold border rounded-xl transition-all cursor-pointer ${
                        calcType === "banner-top" 
                          ? "bg-primary/10 border-primary text-primary dark:text-[#0da192]" 
                          : "bg-background border-border hover:bg-muted"
                      }`}
                    >
                      Baner Poziomy
                    </button>
                    <button 
                      onClick={() => setCalcType("banner-sidebar")}
                      className={`py-2.5 px-3 text-xs font-semibold border rounded-xl transition-all cursor-pointer ${
                        calcType === "banner-sidebar" 
                          ? "bg-primary/10 border-primary text-primary dark:text-[#0da192]" 
                          : "bg-background border-border hover:bg-muted"
                      }`}
                    >
                      Baner w Sidebarze
                    </button>
                    <button 
                      onClick={() => setCalcType("profile-highlight")}
                      className={`py-2.5 px-3 text-xs font-semibold border rounded-xl transition-all cursor-pointer ${
                        calcType === "profile-highlight" 
                          ? "bg-primary/10 border-primary text-primary dark:text-[#0da192]" 
                          : "bg-background border-border hover:bg-muted"
                      }`}
                    >
                      Wyróżnienie Profilu
                    </button>
                    <button 
                      onClick={() => setCalcType("sponsored-article")}
                      className={`py-2.5 px-3 text-xs font-semibold border rounded-xl transition-all cursor-pointer ${
                        calcType === "sponsored-article" 
                          ? "bg-primary/10 border-primary text-primary dark:text-[#0da192]" 
                          : "bg-background border-border hover:bg-muted"
                      }`}
                    >
                      Artykuł na blogu
                    </button>
                  </div>
                </div>

                {/* Budget Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">2. Budżet miesięczny</Label>
                    <span className="text-xl font-extrabold text-primary dark:text-[#0da192]">{calcBudget} PLN</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="15000"
                    step="500"
                    value={calcBudget}
                    onChange={(e) => setCalcBudget(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>500 zł</span>
                    <span>5 000 zł</span>
                    <span>10 000 zł</span>
                    <span>15 000 zł</span>
                  </div>
                </div>

              </div>

              {/* Outputs Column */}
              <div className="bg-muted/40 border border-border/60 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                
                <div className="space-y-5">
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wide border-b border-border pb-2">Przewidywane efekty</h4>
                  
                  {/* Stat 1: Impressions */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      Miesięczny zasięg (wyświetlenia)
                    </span>
                    <span className="text-xl font-bold text-foreground">{calcResults.impressions.toLocaleString()}</span>
                  </div>

                  {/* Stat 2: Clicks */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <MousePointerClick className="h-4 w-4" />
                      Przewidywane kliknięcia
                    </span>
                    <span className="text-xl font-bold text-foreground">{calcResults.clicks.toLocaleString()}</span>
                  </div>

                  {/* Stat 3: CPC */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Calculator className="h-4 w-4" />
                      Szacowany koszt kliknięcia (CPC)
                    </span>
                    <span className="text-base font-semibold text-emerald-500">{calcResults.cpc} PLN</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-[10px] text-muted-foreground leading-normal mb-4">
                    * Przedstawione wyliczenia są szacunkami opartymi o dotychczasowe statystyki serwisu. Rzeczywiste wyniki zależą m.in. od atrakcyjności kreacji graficznej, popytu w danej kategorii i wybranego targetowania.
                  </p>
                  <Button 
                    onClick={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        budzet: calcBudget.toString(),
                        format: calcType
                      }))
                      document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="w-full bg-primary text-white hover:bg-primary-hover font-bold cursor-pointer"
                  >
                    Zapytaj o tę wycenę
                  </Button>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SECTION 6: PROCESS FLOW */}
      <section className="relative z-10 py-20 bg-muted/10 border-b border-border/40">
        <div className="container mx-auto px-4 max-w-7xl">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-tight">
              Jak wygląda współpraca?
            </h2>
            <p className="text-muted-foreground text-base">
              Przeprowadzimy Cię przez proces uruchomienia reklamy szybko, profesjonalnie i bez zbędnych formalności.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="space-y-3 relative text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-extrabold text-sm shadow-md">
                  1
                </div>
                <div className="h-px bg-border flex-1 hidden md:block" />
              </div>
              <h4 className="font-bold text-sm md:text-base text-foreground pt-2">Złożenie zapytania</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Wypełniasz krótki formularz na dole strony, wskazując preferowane formaty oraz zakładany budżet.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3 relative text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-extrabold text-sm shadow-md">
                  2
                </div>
                <div className="h-px bg-border flex-1 hidden md:block" />
              </div>
              <h4 className="font-bold text-sm md:text-base text-foreground pt-2">Konsultacja i wycena</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nasz doradca kontaktuje się z Tobą telefonicznie lub mailowo, by doprecyzować warunki i przesłać ostateczną ofertę.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3 relative text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-extrabold text-sm shadow-md">
                  3
                </div>
                <div className="h-px bg-border flex-1 hidden md:block" />
              </div>
              <h4 className="font-bold text-sm md:text-base text-foreground pt-2">Projekt i weryfikacja</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Wspólnie zatwierdzamy materiały reklamowe (tekst lub grafikę). W razie potrzeby nasi graficy wykonają bezpłatne projekty.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white font-extrabold text-sm shadow-md">
                  4
                </div>
              </div>
              <h4 className="font-bold text-sm md:text-base text-foreground pt-2">Start kampanii</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Uruchamiamy emisję reklam. Po każdym okresie rozliczeniowym przesyłamy Ci szczegółowy raport z wynikami.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 7: FAQ */}
      <section className="relative z-10 py-20 border-b border-border/40">
        <div className="container mx-auto px-4 max-w-4xl">
          
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold tracking-tight">
              Najczęściej zadawane pytania (FAQ)
            </h2>
            <p className="text-muted-foreground">
              Masz wątpliwości? Sprawdź odpowiedzi na najpopularniejsze pytania naszych reklamodawców.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIdx === idx

              return (
                <div 
                  key={idx}
                  className="bg-card border border-border/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm md:text-base text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="h-4.5 w-4.5 text-primary dark:text-[#0da192] flex-shrink-0" />
                      {item.question}
                    </span>
                    <ChevronDown className={`h-4.5 w-4.5 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="p-5 pt-0 text-xs md:text-sm text-muted-foreground leading-relaxed border-t border-border/20">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* SECTION 8: CONTACT LEAD FORM */}
      <section id="contact-section" className="relative z-10 py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          
          <div className="bg-card border border-border/80 rounded-3xl p-6 md:p-10 shadow-2xl glass-panel text-left space-y-8">
            
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full text-primary dark:text-[#0da192] mb-1">
                <Mail className="h-6 w-6" />
              </div>
              <h2 className="font-playfair text-3xl font-bold text-foreground">Skonsultuj swoją kampanię</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Wypełnij formularz. Skontaktujemy się z Tobą w ciągu 24h roboczych, aby omówić szczegóły.
              </p>
            </div>

            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4"
              >
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                <h3 className="font-bold text-lg text-foreground">Wiadomość została wysłana!</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Dziękujemy za kontakt. Nasz konsultant przeanalizuje Twoje zapytanie i skontaktuje się z Tobą na podany adres e-mail lub numer telefonu.
                </p>
                <Button 
                  onClick={() => setSubmitted(false)}
                  variant="outline" 
                  className="mt-2"
                >
                  Wyślij kolejne zapytanie
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="imieNazwisko" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Imię i nazwisko *</Label>
                    <Input
                      id="imieNazwisko"
                      placeholder="np. Jan Kowalski"
                      value={formData.imieNazwisko}
                      onChange={(e) => setFormData(prev => ({ ...prev, imieNazwisko: e.target.value }))}
                      required
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Adres e-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="np. kontakt@twojakancelaria.pl"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="telefon" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Numer telefonu</Label>
                    <Input
                      id="telefon"
                      placeholder="np. +48 123 456 789"
                      value={formData.telefon}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefon: e.target.value }))}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budzet" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Miesięczny budżet (PLN)</Label>
                    <select
                      id="budzet"
                      value={formData.budzet}
                      onChange={(e) => setFormData(prev => ({ ...prev, budzet: e.target.value }))}
                      className="w-full h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="500-1000">500 - 1 000 zł</option>
                      <option value="1000-3000">1 000 - 3 000 zł</option>
                      <option value="3000-5000">3 000 - 5 000 zł</option>
                      <option value="5000-10000">5 000 - 10 000 zł</option>
                      <option value="10000+">powyżej 10 000 zł</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interesujący Cię format</Label>
                  <select
                    id="format"
                    value={formData.format}
                    onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value }))}
                    className="w-full h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="banner-top">Sponsorowany Baner Poziomy (Premium)</option>
                    <option value="banner-sidebar">Baner w Sidebarze Kategorii</option>
                    <option value="profile-highlight">Wyróżnienie Profilu Prawnika</option>
                    <option value="sponsored-article">Artykuł Sponsorowany na Blogu</option>
                    <option value="other">Inne / Konsultacja</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tresc" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Wiadomość / Dodatkowe uwagi *</Label>
                  <Textarea
                    id="tresc"
                    placeholder="Opisz krótko swój biznes i jakie cele chciałbyś osiągnąć dzięki kampanii..."
                    value={formData.tresc}
                    onChange={(e) => setFormData(prev => ({ ...prev, tresc: e.target.value }))}
                    required
                    rows={4}
                    className="bg-background border-border resize-none"
                  />
                </div>

                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox 
                    id="politykaPrivacy"
                    checked={formData.politykaPrivacy}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, politykaPrivacy: checked === true }))}
                    required
                    className="mt-1 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="politykaPrivacy" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
                      Akceptuję politykę prywatności serwisu ProstaSprawa.pl oraz wyrażam zgodę na przetwarzanie moich danych w celu przygotowania oferty reklamowej. *
                    </Label>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white hover:bg-primary-hover font-bold h-12 shadow-md shadow-primary/10 cursor-pointer"
                  >
                    {isSubmitting ? "Wysyłanie..." : "Wyślij zgłoszenie"}
                  </Button>
                </div>

              </form>
            )}

            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-6 border-t border-border/40 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                reklama@prostawsprawa.pl
              </span>
              <span className="hidden sm:block text-border">|</span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                +48 789 456 123
              </span>
            </div>

          </div>

        </div>
      </section>

    </div>
  )
}
