"use client"

import { useState, useEffect, useMemo, useRef, type ReactNode } from "react"
import { motion } from "framer-motion"
import type { LegalPageContent } from "@/lib/legal-pages/types"
import { 
  Search, 
  FileText, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  BookOpen, 
  User, 
  CreditCard, 
  Scale, 
  MessageSquare, 
  Cookie, 
  ShieldAlert, 
  Undo2, 
  AlertTriangle, 
  Gavel, 
  Clock, 
  ExternalLink, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Info
} from "lucide-react"
import { ResponsiveBreadcrumbs } from "@/components/ui/responsive-breadcrumbs"

// Ikony rozdziałów pełnego dokumentu — dopasowywane po id rozdziału.
// Treść (nagłówek, rozdziały, słownik pojęć) jest edytowalna w panelu admina
// (Strony → Regulamin) i przekazywana przez props `content`.
const SECTION_ICONS: Record<string, ReactNode> = {
  "postanowienia-ogolne": <ShieldCheck className="w-5 h-5" />,
  "definicje": <BookOpen className="w-5 h-5" />,
  "zasady-korzystania": <User className="w-5 h-5" />,
  "odpowiedzialnosc": <Scale className="w-5 h-5" />,
  "oplaty-i-rozliczenia": <CreditCard className="w-5 h-5" />,
  "opinie": <MessageSquare className="w-5 h-5" />,
  "cookies": <Cookie className="w-5 h-5" />,
  "dane-osobowe": <ShieldAlert className="w-5 h-5" />,
  "odstapienie": <Undo2 className="w-5 h-5" />,
  "reklamacje": <AlertTriangle className="w-5 h-5" />,
  "skarga-i-mediacja": <Gavel className="w-5 h-5" />,
  "awarie-i-przerwy": <Clock className="w-5 h-5" />,
  "postanowienia-koncowe": <FileText className="w-5 h-5" />,
}

const DEFAULT_SECTION_ICON = <FileText className="w-5 h-5" />

export default function RegulaminClientPage({ content }: { content: LegalPageContent }) {
  const [activeTab, setActiveTab] = useState<"tldr" | "full">("tldr")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSection, setActiveSection] = useState(content.sections[0]?.id ?? "")
  const [copiedForm, setCopiedForm] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const sectionsRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Rozdziały z bazy + ikony przypisane po id (nowe rozdziały dostają ikonę domyślną)
  const sections = useMemo(
    () =>
      content.sections.map(section => ({
        ...section,
        icon: SECTION_ICONS[section.id] ?? DEFAULT_SECTION_ICON,
      })),
    [content.sections]
  )

  // Copy withdrawal form template to clipboard
  const handleCopyForm = () => {
    const textToCopy = `OŚWIADCZENIE O ODSTĄPIENIU OD UMOWY

Adresat: POLSKA GRUPA IDENTYFIKACJI FIRM SP. Z O.O., ul. Gen. Mariana Langiewicza 16 lok. 3, 25-381 Kielce, e-mail: biuro@prostasprawa.pl

Ja niniejszym informuję o moim odstąpieniu od umowy o świadczenie usługi w ramach Serwisu ProstaSprawa.pl.
Data zawarcia umowy: 
Imię i nazwisko użytkownika: 
E-mail przypisany do konta: 

Podpis Użytkownika (wymagany tylko w wersji papierowej):
Miejscowość, Data: `

    navigator.clipboard.writeText(textToCopy)
    setCopiedForm(true)
    setTimeout(() => setCopiedForm(false), 3000)
  }

  // Scroll monitoring to update active section in TOC and top progress bar
  useEffect(() => {
    if (activeTab !== "full") return

    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      
      // Update progress bar
      const totalScroll = docHeight - windowHeight
      if (totalScroll > 0) {
        setScrollProgress((scrollPosition / totalScroll) * 100)
      }

      // Check which section is in view
      let currentSection = activeSection
      const offset = 180 // offset for fixed header + breathing room

      for (const section of sections) {
        const el = sectionsRefs.current[section.id]
        if (el) {
          const rect = el.getBoundingClientRect()
          const top = rect.top + scrollPosition - offset
          if (scrollPosition >= top) {
            currentSection = section.id
          }
        }
      }
      setActiveSection(currentSection)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [activeTab, activeSection, sections])

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    const el = sectionsRefs.current[id]
    if (el) {
      const offset = 120 // offset for fixed header
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = el.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
  }

  // Filter sections and paragraphs based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections

    const query = searchQuery.toLowerCase().trim()
    return sections.map(section => {
      const titleMatches = section.title.toLowerCase().includes(query)
      const matchingParagraphs = section.paragraphs.filter(p => p.toLowerCase().includes(query))
      
      if (titleMatches || matchingParagraphs.length > 0) {
        return {
          ...section,
          // If title matches, show all paragraphs, otherwise show only matching ones
          paragraphs: titleMatches ? section.paragraphs : matchingParagraphs,
          isFiltered: true
        }
      }
      return null
    }).filter(Boolean) as (typeof sections[0] & { isFiltered?: boolean })[]
  }, [searchQuery, sections])

  // Count search matches
  const matchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0
    const query = searchQuery.toLowerCase().trim()
    let count = 0
    sections.forEach(s => {
      if (s.title.toLowerCase().includes(query)) count++
      s.paragraphs.forEach(p => {
        const regex = new RegExp(query, "gi")
        const matches = p.match(regex)
        if (matches) count += matches.length
      }
      )
    })
    return count
  }, [searchQuery, sections])

  // Helper to highlight matching text
  const highlightText = (text: string, search: string) => {
    if (!search) return text
    const parts = text.split(new RegExp(`(${search})`, "gi"))
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-primary/30 text-white font-semibold rounded px-0.5 border border-primary/20">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    )
  }

  return (
    <div className="bg-background min-h-[calc(100vh-65px)] text-white pb-20 relative font-poppins selection:bg-primary/20 selection:text-primary-foreground">
      
      {/* Scroll Progress Bar (Only visible in full view) */}
      {activeTab === "full" && (
        <div className="fixed top-[65px] left-0 right-0 h-1 bg-card z-50 print:hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-100" 
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}

      {/* Hero Banner Header */}
      <div 
        className="relative w-full h-[180px] md:h-[240px] flex items-center bg-cover bg-center overflow-hidden border-b border-border/60 print:bg-white print:border-b print:text-black print:h-auto print:py-6 on-dark"
        style={{ backgroundImage: "url('/images/lady-justice-banner.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/40 print:hidden" />
        <div className="absolute inset-0 bg-black/10 print:hidden" />
        <div className="container mx-auto px-4 relative z-10 print:text-black">
          <div className="print:hidden">
            <ResponsiveBreadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Regulamin" },
              ]}
            />
          </div>
          <h1 className="font-playfair text-3xl sm:text-4xl lg:text-[44px] leading-tight text-foreground font-bold tracking-tight mt-3 print:text-black print:text-2xl">
            {content.heroTitle}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base font-light mt-1 print:text-neutral-600">
            {content.heroSubtitle}
          </p>
        </div>
      </div>

      {/* Decorative Blur Spheres */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 print:hidden">
        <div className="absolute top-1/4 left-1/10 w-[400px] h-[400px] bg-emerald-950/15 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/10 w-[500px] h-[500px] bg-card/40 rounded-full blur-[180px]" />
      </div>

      {/* Interactive Controls & View Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10 print:mt-2">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-card/90 border border-border/80 rounded-2xl p-4 backdrop-blur-md mb-8 print:hidden">
          
          {/* Tab Selector */}
          <div className="flex bg-background p-1.5 rounded-xl border border-border w-full md:w-auto">
            <button
              onClick={() => setActiveTab("tldr")}
              className={`flex items-center justify-center gap-2 flex-1 md:flex-initial px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "tldr"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Podsumowanie w pigułce
            </button>
            <button
              onClick={() => setActiveTab("full")}
              className={`flex items-center justify-center gap-2 flex-1 md:flex-initial px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "full"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-4 h-4" />
              Pełny dokument prawny
            </button>
          </div>

          {/* Quick Actions (Print / PDF) */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 bg-card border border-border hover:border-border text-foreground/80 hover:text-foreground px-4 py-2.5 rounded-xl text-sm transition-all duration-300 cursor-pointer"
              title="Drukuj regulamin"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Drukuj</span>
            </button>
            <a
              href="/Regulamin serwisu Prostasprawa.pl.docx.pdf"
              download
              className="flex items-center justify-center gap-2 bg-card border border-border hover:border-border text-foreground/80 hover:text-foreground px-4 py-2.5 rounded-xl text-sm transition-all duration-300 cursor-pointer"
              title="Pobierz plik PDF"
            >
              <Download className="w-4 h-4" />
              <span>Pobierz PDF</span>
            </a>
          </div>
        </div>

        {/* Tab 1: Interactive Summary (TL;DR) */}
        {activeTab === "tldr" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 print:hidden"
          >
            {/* Header info */}
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold">Jak działa ProstaSprawa.pl?</h2>
              <p className="text-muted-foreground text-sm sm:text-base font-light">
                Chcemy, aby korzystanie z naszych usług było maksymalnie przejrzyste. Poniżej zebraliśmy kluczowe zasady regulaminu opisane prostym językiem.
              </p>
            </div>

            {/* TLDR Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Dla Klientów */}
              <div className="bg-card/70 border border-border/80 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-emerald-950/20 border border-emerald-900/40 text-emerald-500 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">Dla Klientów</h3>
                  <ul className="space-y-2.5 text-xs text-muted-foreground leading-relaxed list-disc list-inside">
                    <li><strong className="text-foreground">100% bezpłatnie</strong> – zadawanie pytań i szukanie ekspertów jest darmowe.</li>
                    <li><strong className="text-foreground">Wygodne zapytania</strong> – opisujesz swoją sprawę, a system przekazuje ją ekspertom.</li>
                    <li><strong className="text-foreground">Własne oferty</strong> – specjaliści składają Ci indywidualne oferty cenowe.</li>
                    <li><strong className="text-foreground">Bezpieczeństwo</strong> – Administrator nie bierze udziału w zawieraniu umów.</li>
                  </ul>
                </div>
                <button 
                  onClick={() => { setActiveTab("full"); setTimeout(() => scrollToSection("zasady-korzystania"), 100) }}
                  className="mt-6 text-xs text-primary hover:text-primary-hover flex items-center gap-1 font-semibold group cursor-pointer"
                >
                  Zobacz szczegóły (Rozdz. III)
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Card 2: Dla Wykonawców */}
              <div className="bg-card/70 border border-border/80 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-amber-950/20 border border-amber-900/40 text-amber-500 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">Dla Wykonawców</h3>
                  <ul className="space-y-2.5 text-xs text-muted-foreground leading-relaxed list-disc list-inside">
                    <li><strong className="text-foreground">Płatny profil</strong> – korzystanie z serwisu wymaga uiszczenia Abonamentu.</li>
                    <li><strong className="text-foreground">Pakiet Testowy</strong> – po rejestracji otrzymujesz 30 dni za darmo (do 3 razy max).</li>
                    <li><strong className="text-foreground">System Punktowy</strong> – możesz kupować punkty do pozycjonowania (1 pkt = 1 PLN).</li>
                    <li><strong className="text-foreground">Weryfikacja</strong> – musisz posiadać uprawnienia zawodowe (adwokat, radca itp.).</li>
                  </ul>
                </div>
                <button 
                  onClick={() => { setActiveTab("full"); setTimeout(() => scrollToSection("oplaty-i-rozliczenia"), 100) }}
                  className="mt-6 text-xs text-primary hover:text-primary-hover flex items-center gap-1 font-semibold group cursor-pointer"
                >
                  Zobacz cennik (Rozdz. V)
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Card 3: Prawa Konsumenta */}
              <div className="bg-card/70 border border-border/80 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-rose-950/20 border border-rose-900/40 text-rose-500 rounded-xl flex items-center justify-center">
                    <Undo2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">Odstąpienie i Reklamacje</h3>
                  <ul className="space-y-2.5 text-xs text-muted-foreground leading-relaxed list-disc list-inside">
                    <li><strong className="text-foreground">14 dni na zwrot</strong> – prawo do odstąpienia od umowy bez podania przyczyny.</li>
                    <li><strong className="text-foreground">Wyłączenie prawa</strong> – nie dotyczy zapytań, które wykonawca już zaczął realizować.</li>
                    <li><strong className="text-foreground">Darmowe reklamacje</strong> – zgłaszasz usterki techniczne e-mailem lub pocztą.</li>
                    <li><strong className="text-foreground">30 dni na decyzję</strong> – Administrator odpowie w ciągu 30 dni roboczych.</li>
                  </ul>
                </div>
                <button 
                  onClick={() => { setActiveTab("full"); setTimeout(() => scrollToSection("odstapienie"), 100) }}
                  className="mt-6 text-xs text-primary hover:text-primary-hover flex items-center gap-1 font-semibold group cursor-pointer"
                >
                  Zobacz prawa (Rozdz. IX i X)
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Card 4: Prywatność i Bezpieczeństwo */}
              <div className="bg-card/70 border border-border/80 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-blue-950/20 border border-blue-900/40 text-blue-500 rounded-xl flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">Prywatność i RODO</h3>
                  <ul className="space-y-2.5 text-xs text-muted-foreground leading-relaxed list-disc list-inside">
                    <li><strong className="text-foreground">Ochrona danych</strong> – RODO jest w pełni przestrzegane przez Spółkę.</li>
                    <li><strong className="text-foreground">Kontakt DPO</strong> – zapytania w sprawie danych: <code className="text-foreground">iod@prostasprawa.pl</code>.</li>
                    <li><strong className="text-foreground">Cookies</strong> – służą poprawie bezpieczeństwa i funkcjonalności serwisu.</li>
                    <li><strong className="text-foreground">Zapobieganie oszustwom</strong> – profilowanie urządzeń dla wykrywania spamu.</li>
                  </ul>
                </div>
                <button 
                  onClick={() => { setActiveTab("full"); setTimeout(() => scrollToSection("cookies"), 100) }}
                  className="mt-6 text-xs text-primary hover:text-primary-hover flex items-center gap-1 font-semibold group cursor-pointer"
                >
                  Prywatność (Rozdz. VII i VIII)
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>

            {/* TLDR Interactive Accordion FAQs */}
            <div className="bg-card/50 border border-border/80 rounded-2xl p-6 sm:p-8 mt-12">
              <h3 className="font-playfair text-xl sm:text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Szybkie odpowiedzi na najważniejsze pytania
              </h3>
              
              <div className="space-y-4">
                
                {/* FAQ 1 */}
                <div className="bg-card/40 border border-border rounded-xl p-5">
                  <h4 className="font-semibold text-sm sm:text-base text-foreground mb-2">Czy ProstaSprawa.pl bierze prowizję od załatwionych spraw?</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Nie. Serwis nie pobiera żadnej prowizji od zawieranych umów między Klientami a Wykonawcami. Rozliczenia finansowe, warunki i termin realizacji usługi są ustalane indywidualnie i bezpośrednio przez obie strony. Serwis pobiera opłaty wyłącznie od Wykonawców za dostęp do platformy w formie abonamentu lub punktów.
                  </p>
                </div>

                {/* FAQ 2 */}
                <div className="bg-card/40 border border-border rounded-xl p-5">
                  <h4 className="font-semibold text-sm sm:text-base text-foreground mb-2">Jak wygląda kwestia wystawiania faktur?</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Wszystkie faktury za zakupione abonamenty lub punkty są generowane automatycznie i udostępniane w wersji elektronicznej w panelu Konta Wykonawcy. Faktury są przechowywane w formacie PDF przez okres 5 lat. Faktury dla osób fizycznych nieprowadzących działalności są wystawiane na wyraźne żądanie w ciągu 3 miesięcy od wykonania usługi.
                  </p>
                </div>

                {/* FAQ 3 */}
                <div className="bg-card/40 border border-border rounded-xl p-5">
                  <h4 className="font-semibold text-sm sm:text-base text-foreground mb-2">Co zrobić, jeśli serwis nie działa poprawnie?</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Wszelkie problemy techniczne można zgłosić w postaci darmowej reklamacji na adres e-mail <a href="mailto:biuro@prostasprawa.pl" className="text-primary hover:underline font-medium">biuro@prostasprawa.pl</a>. Rozpatrzenie reklamacji trwa maksymalnie do 30 dni. Ponadto, w przypadku awarii serwisu trwających powyżej 3 godzin, abonamenty i pakiety promocyjne Wykonawców są bezpłatnie wydłużane.
                  </p>
                </div>

                {/* FAQ 4 */}
                <div className="bg-card/40 border border-border rounded-xl p-5">
                  <h4 className="font-semibold text-sm sm:text-base text-foreground mb-2">Gdzie znajdę pełne dane rejestrowe firmy?</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Właścicielem serwisu jest Polska Grupa Identyfikacji Firm Sp. z o.o., z siedzibą przy ul. Gen. Mariana Langiewicza 16 lok. 3, 25-381 Kielce. Spółka jest zarejestrowana w KRS pod numerem 0000768210, NIP: 9592020678, REGON: 382401289. Dane te są oficjalne i zgodne z Rozdziałem II Regulaminu.
                  </p>
                </div>

              </div>
            </div>

            {/* Quick Copy Form in TLDR */}
            <div className="bg-card/90 border border-border rounded-2xl p-6 sm:p-8 mt-12 flex flex-col lg:flex-row gap-8 items-start justify-between">
              <div className="space-y-3 max-w-xl">
                <h3 className="font-playfair text-xl sm:text-2xl font-bold text-foreground">Chcesz zrezygnować z usługi?</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Jako Konsument masz prawo odstąpić od umowy zawartej na odległość w ciągu 14 dni bez podawania przyczyny. Poniżej znajduje się oficjalny wzór oświadczenia, który wystarczy skopiować, uzupełnić i przesłać mailowo na adres: <code className="text-foreground px-1.5 py-0.5 bg-card rounded border border-border text-xs">biuro@prostasprawa.pl</code>.
                </p>
              </div>
              <div className="w-full lg:w-auto flex-shrink-0">
                <button
                  onClick={handleCopyForm}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0e7a57] hover:bg-[#0c6b4c] text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-emerald-950/20 transition-all duration-300 cursor-pointer text-sm"
                >
                  {copiedForm ? (
                    <>
                      <Check className="w-4 h-4" />
                      Skopiowano oświadczenie!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Skopiuj gotowy formularz
                    </>
                  )}
                </button>
              </div>
            </div>

          </motion.div>
        )}

        {/* Tab 2: Full Terms Document */}
        {activeTab === "full" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Navigation (TOC) */}
            <aside className="lg:col-span-4 sticky top-[100px] h-[calc(100vh-140px)] overflow-y-auto pr-4 hidden lg:flex flex-col space-y-4 print:hidden custom-scrollbar">
              <div className="bg-card/80 border border-border/80 rounded-2xl p-5 backdrop-blur-md">
                <h3 className="font-playfair text-lg font-bold text-foreground pb-3 border-b border-border/60 mb-4">
                  Spis treści
                </h3>
                <nav className="flex flex-col space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-medium transition-all duration-200 cursor-pointer group ${
                        activeSection === section.id
                          ? "bg-primary text-white font-semibold shadow-md shadow-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                      }`}
                    >
                      <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors duration-200 ${
                        activeSection === section.id
                          ? "bg-white/20 text-white"
                          : "bg-muted/60 text-muted-foreground group-hover:bg-muted/60 group-hover:text-foreground"
                      }`}>
                        {section.number}
                      </span>
                      <span className="truncate">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Download Banner Card */}
              <div className="bg-gradient-to-br from-emerald-950/20 to-card border border-emerald-900/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm">
                  <ExternalLink className="w-4 h-4" />
                  Wersja papierowa
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pobierz oficjalną wersję PDF regulaminu podpisaną cyfrowo, aby zachować ją na swoim dysku lub wydrukować.
                </p>
                <a
                  href="/Regulamin serwisu Prostasprawa.pl.docx.pdf"
                  download
                  className="w-full flex items-center justify-center gap-2 bg-[#0e7a57] hover:bg-[#0c6b4c] text-white text-xs font-semibold py-2 px-4 rounded-lg shadow transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Pobierz plik PDF
                </a>
              </div>
            </aside>

            {/* Document Content Column */}
            <main className="lg:col-span-8 space-y-8 print:col-span-12">
              
              {/* Live Search and Match Stats */}
              <div className="bg-card/70 border border-border/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md print:hidden space-y-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Wyszukaj w regulaminie... (np. reklamacja, faktura, zwrot)"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/80 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Wyczyść
                    </button>
                  )}
                </div>
                
                {/* Search Match Stats Banner */}
                {searchQuery.trim() && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground bg-card/60 p-2.5 rounded-lg border border-border">
                    <span>
                      Słowo kluczowe: <strong className="text-foreground">„{searchQuery}”</strong>
                    </span>
                    <span>
                      Znaleziono: <strong className="text-primary font-bold">{matchCount}</strong> dopasowań
                    </span>
                  </div>
                )}
              </div>

              {/* No Search Results Notice */}
              {filteredSections.length === 0 && (
                <div className="bg-card/40 border border-border rounded-2xl p-12 text-center space-y-4">
                  <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
                  <h3 className="font-semibold text-lg text-foreground">Brak wyników wyszukiwania</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Nie znaleźliśmy frazy „{searchQuery}” w treści regulaminu. Spróbuj wyszukać inne powiązane słowo, np. „RODO”, „płatność”, „wykonawca” lub „awaria”.
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    Resetuj wyszukiwanie
                  </button>
                </div>
              )}

              {/* The Sections */}
              <div className="space-y-10 print:text-black print:space-y-6">
                {filteredSections.map((section) => (
                  <div
                    key={section.id}
                    ref={(el) => {
                      sectionsRefs.current[section.id] = el
                    }}
                    className="bg-card/70 border border-border/80 rounded-2xl p-6 sm:p-8 scroll-mt-28 shadow-xl transition-all duration-300 hover:border-border/60 print:bg-white print:border-none print:shadow-none print:p-0"
                  >
                    
                    {/* Section Header */}
                    <div className="flex items-center gap-3.5 pb-4 border-b border-border/60 mb-6 print:border-b-2 print:border-black print:mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0 print:hidden">
                        {section.icon}
                      </div>
                      <div>
                        <span className="text-[10px] sm:text-xs font-bold text-primary tracking-wider uppercase">
                          Rozdział {section.number}
                        </span>
                        <h2 className="font-playfair text-xl sm:text-2xl font-bold text-foreground print:text-black print:text-lg">
                          {highlightText(section.title, searchQuery)}
                        </h2>
                      </div>
                    </div>

                    {/* Section Paragraphs */}
                    <div className="space-y-4 text-xs sm:text-sm text-foreground/80 leading-relaxed font-light print:text-black print:text-xs">
                      
                      {/* Section II Interactive Dictionary */}
                      {section.id === "definicje" && !searchQuery && content.definitions.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 mb-6 print:hidden">
                          {content.definitions.map((def, idx) => (
                            <div 
                              key={idx} 
                              className="bg-card/40 border border-border rounded-xl p-4 hover:border-input transition-colors"
                            >
                              <span className="font-semibold text-sm text-primary block mb-1">
                                {def.term}
                              </span>
                              <span className="text-xs text-muted-foreground font-light leading-normal">
                                {def.desc}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Section IX Interactive Copy Form */}
                      {section.id === "odstapienie" && (
                        <div className="bg-background border border-border rounded-xl p-5 my-4 print:bg-neutral-100 print:text-black print:border-black">
                          <div className="flex items-center justify-between gap-4 pb-3 border-b border-border/60 mb-4 print:border-black">
                            <span className="text-xs font-semibold text-foreground tracking-wider flex items-center gap-1.5 uppercase print:text-black">
                              <Undo2 className="w-3.5 h-3.5 text-primary" />
                              Wzór oświadczenia (Formularz)
                            </span>
                            <button
                              onClick={handleCopyForm}
                              className="text-xs bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 py-1 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer print:hidden"
                            >
                              {copiedForm ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  Skopiowano!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  Kopiuj
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="text-muted-foreground text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto print:text-black">
                            {`Adresat: POLSKA GRUPA IDENTYFIKACJI FIRM SP. Z O.O., ul. Gen. Mariana Langiewicza 16 lok. 3, 25-381 Kielce, e-mail: biuro@prostasprawa.pl

Ja __________________________ niniejszym informuję o moim odstąpieniu od umowy o świadczenie usługi __________________________ w ramach Serwisu.
Data zawarcia umowy to __________________________.
Podpis Użytkownika (wymagany tylko w wersji papierowej).`}
                          </pre>
                        </div>
                      )}

                      {/* Standard Paragraph Mapping */}
                      {section.paragraphs.map((para, paraIdx) => {
                        // Skip rendering first sentence in defs as paragraph if dictionary is already loaded, keeping it clean
                        if (section.id === "definicje" && paraIdx === 0 && !searchQuery && content.definitions.length > 0) return null;
                        
                        return (
                          <p 
                            key={paraIdx} 
                            className="text-foreground/80 hover:text-foreground transition-colors duration-200 leading-relaxed print:text-black"
                          >
                            {highlightText(para, searchQuery)}
                          </p>
                        )
                      })}

                    </div>
                  </div>
                ))}
              </div>
            </main>

          </div>
        )}

      </div>

      {/* Page Styles for Printing */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          main {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          h1, h2, h3, p, span, li, pre {
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

    </div>
  )
}
