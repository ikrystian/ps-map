"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  FileText, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  BookOpen, 
  ShieldCheck,
  Target,
  Database,
  Clock,
  Share2,
  Scale,
  Cookie,
  Cpu,
  Lock,
  Mail,
  ChevronRight,
  Sparkles,
  Info,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from "lucide-react"
import { ResponsiveBreadcrumbs } from "@/components/ui/responsive-breadcrumbs"

// Definitions of terms for Section I in an interactive dictionary structure
const DEFINITIONS = [
  { 
    term: "Administrator danych", 
    desc: "POLSKA GRUPA IDENTYFIKACJI FIRM SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ z siedzibą w Kielcach (25-381) przy ul. Gen. Mariana Langiewicza 16 lok. 3, KRS: 0000768210, NIP: 9592020678, REGON: 382401289. To podmiot decydujący o celach i sposobach przetwarzania danych osobowych." 
  },
  { 
    term: "Dane osobowe", 
    desc: "Wszelkie informacje o zidentyfikowanej lub możliwej do zidentyfikowania osobie fizycznej poprzez czynniki określające jej tożsamość fizyczną, psychiczną, ekonomiczną itp., w tym adres IP urządzenia, identyfikatory internetowe oraz pliki cookie." 
  },
  { 
    term: "Polityka", 
    desc: "Niniejsza Polityka prywatności serwisu internetowego oraz aplikacji mobilnej ProstaSprawa.pl." 
  },
  { 
    term: "RODO", 
    desc: "Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych oraz ustawa o ochronie danych osobowych z dnia 10 maja 2018 r." 
  },
  { 
    term: "Serwis", 
    desc: "Portal internetowy prowadzony przez Administratora pod adresem www.prostasprawa.pl oraz powiązana z nim aplikacja mobilna." 
  },
  { 
    term: "Użytkownik", 
    desc: "Każda osoba fizyczna, która odwiedza Serwis lub korzysta z co najmniej jednej usługi bądź funkcjonalności opisanej w Polityce." 
  }
]

// The full text sections mapping for the privacy policy
const SECTIONS = [
  {
    id: "definicje",
    number: "I",
    title: "Definicje",
    icon: <BookOpen className="w-5 h-5" />,
    paragraphs: [
      "1. Administrator danych - Administratorem danych osobowych zbieranych poprzez Serwis jest POLSKA GRUPA IDENTYFIKACJI FIRM SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ z siedzibą w Kielcach (kod pocztowy: 25-381) przy ul. Gen. Mariana Langiewicza 16 lok. 3, wpisana do rejestru przedsiębiorców Krajowego Rejestru Sądowego pod numerem 0000768210, numer NIP: 9592020678, REGON: 382401289, której akta rejestrowe przechowywane są w Sądzie Rejonowym w Kielcach w X Wydziale Gospodarczym Krajowego Rejestru Sądowego (dalej: Administrator).",
      "2. Dane osobowe – informacje o osobie fizycznej zidentyfikowanej lub możliwej do zidentyfikowania poprzez jeden bądź kilka szczególnych czynników określających fizyczną, fizjologiczną, genetyczną, psychiczną, ekonomiczną, kulturową lub społeczną tożsamość, w tym IP urządzenia, identyfikator internetowy oraz informacje gromadzone za pośrednictwem plików cookie oraz innej podobnej technologii.",
      "3. Polityka – niniejsza Polityka prywatności.",
      "4. RODO – rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679 z 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o ochronie danych, dalej RODO) oraz ustawą o ochronie danych osobowych z dnia 10 maja 2018 r.",
      "5. Serwis – serwis internetowy prowadzony przez Administratora pod adresem www.prostasprawa.pl, w tym aplikacja mobilna.",
      "6. Użytkownik – każda osoba fizyczna odwiedzająca Serwis lub korzystająca z jednej albo kilku usług czy funkcjonalności opisanych w Polityce."
    ]
  },
  {
    id: "postanowienia-ogolne",
    number: "II",
    title: "Postanowienia ogólne",
    icon: <ShieldCheck className="w-5 h-5" />,
    paragraphs: [
      "1. Polityka prywatności określa, jak zbierane, przetwarzane i przechowywane są dane osobowe Użytkowników niezbędne do świadczenia usług drogą elektroniczną za pośrednictwem serwisu internetowego www.prostasprawa.pl (dalej: Serwis).",
      "2. Serwis zbiera wyłącznie dane osobowe niezbędne do świadczenia i rozwoju usług w nim oferowanych.",
      "3. Dane osobowe zbierane za pośrednictwem Serwisu są przetwarzane zgodnie z RODO oraz ustawą o ochronie danych osobowych z dnia 10 maja 2018 r.",
      "4. W związku z korzystaniem przez Użytkownika z Serwisu Administrator zbiera dane w zakresie niezbędnym do świadczenia poszczególnych oferowanych usług. Poniżej zostały opisane szczegółowe zasady oraz cele przetwarzania Danych osobowych gromadzonych podczas korzystania z Serwisu przez Użytkownika."
    ]
  },
  {
    id: "cel-zbierania-danych",
    number: "III",
    title: "Cel zbierania danych osobowych",
    icon: <Target className="w-5 h-5" />,
    paragraphs: [
      "1. Dane osobowe wszystkich osób korzystających z Serwisu przetwarzane są przez Administratora w celu:",
      "• rejestracji konta i weryfikacji tożsamości Użytkownika,",
      "• umożliwienia logowania do Serwisu,",
      "• realizacji umowy dotyczącej usługi i e-usług,",
      "• komunikacji z Użytkownikiem (e-mail, formularz kontaktowy itp.),",
      "• wysyłki newslettera (po wyrażeniu zgody Użytkownika na jego otrzymywanie),",
      "• prowadzenia systemu komentarzy,",
      "• świadczenia usług społecznościowych,",
      "• promocji oferty Administratora,",
      "• marketingu, remarketingu, afiliacji,",
      "• personalizacji Serwisu dla Użytkowników,",
      "• działań analitycznych i statystycznych,",
      "• windykacji należności,",
      "• ustalenia i dochodzenia roszczeń albo obrony przed nimi,",
      "• publikacji przez Administratora w środkach masowej komunikacji wizerunku Użytkownika w związku z korzystaniem z usług świadczonych przez Administratora, w tym w formie nagrań wideo oraz fotografii, mających na celu informowanie o usługach Użytkownika, a także jego promocję.",
      "2. Podstawy prawne przetwarzania Danych osobowych w Serwisie - art. 6 ust. 1 lit. b, c, d, e, f RODO.",
      "3. Podanie danych jest dobrowolne, ale niezbędne do zawarcia umowy albo skorzystania z innych funkcjonalności Serwisu.",
      "4. Wykonawca poprzez wykup stosownego pakietu i akceptacje Regulaminu wyraża zgodę na przetwarzanie danych osobowych w celach związanych z obsługą Użytkownika oraz świadczeniem usług, tj. zawarciem i wykonaniem umowy – zgoda konieczna do zawarcia i wykonania umowy."
    ]
  },
  {
    id: "rodzaj-danych",
    number: "IV",
    title: "Rodzaj przetwarzanych danych osobowych",
    icon: <Database className="w-5 h-5" />,
    paragraphs: [
      "1. Administrator może przetwarzać dane osobowe Użytkownika: imię i nazwisko, data urodzenia, adres zamieszkania/siedziby, adres e-mail, numer telefonu, NIP."
    ]
  },
  {
    id: "okres-przetwarzania",
    number: "V",
    title: "Okres przetwarzania danych osobowych",
    icon: <Clock className="w-5 h-5" />,
    paragraphs: [
      "1. Dane osobowe Użytkowników będą przetwarzane przez okres:",
      "• gdy podstawą przetwarzania danych jest wykonanie umowy – do momentu przedawnienia roszczeń po jej wykonaniu,",
      "• gdy podstawą przetwarzania danych jest zgoda – do momentu jej odwołania, a po odwołaniu zgody do przedawnienia roszczeń.",
      "2. W obu przypadkach termin przedawnienia wynosi 6 lat, a dla roszczeń o świadczenia okresowe i roszczeń dotyczących prowadzenia działalności gospodarczej – 3 lata (jeśli przepis szczególny nie stanowi inaczej)."
    ]
  },
  {
    id: "udostepnianie-danych",
    number: "VI",
    title: "Udostępnianie danych osobowych",
    icon: <Share2 className="w-5 h-5" />,
    paragraphs: [
      "1. Dane osobowe Użytkowników mogą być przekazywane: podmiotom powiązanym z Administratorem, jego podwykonawcom, jeżeli występują, oraz innym podmiotom współpracującym z Administratorem, w tym w szczególności dostawcom usług IT pozwalającym na prawidłowe korzystanie z Serwisu.",
      "2. Dane osobowe Użytkowników nie będą przekazywane poza teren Europejskiego Obszaru Gospodarczego (EOG).",
      "3. Poziom ochrony Danych osobowych poza Europejskim Obszarem Gospodarczym (EOG) różni się od tego zapewnianego przez prawo europejskie. Z tego powodu Administrator przekazuje Dane osobowe poza EOG tylko wtedy, gdy jest to konieczne, i z zapewnieniem odpowiedniego stopnia ochrony, przede wszystkim poprzez:",
      "• stosowanie standardowych klauzul umownych wydanych przez Komisję Europejską lub zatwierdzonych przez Komisję Europejską;",
      "• stosowanie wiążących reguł korporacyjnych zatwierdzonych przez właściwy organ nadzorczy;",
      "• współpracę z podmiotami przetwarzającymi Dane osobowe w państwach, w odniesieniu do których została wydana stosowna decyzja Komisji Europejskiej dotycząca stwierdzenia zapewnienia odpowiedniego stopnia ochrony Danych osobowych;",
      "• Administrator zawsze informuje o zamiarze przekazania Danych osobowych poza EOG na etapie ich zbierania."
    ]
  },
  {
    id: "prawa-uzytkownikow",
    number: "VII",
    title: "Prawa Użytkowników",
    icon: <Scale className="w-5 h-5" />,
    paragraphs: [
      "1. Użytkownik Serwisu ma prawo do: dostępu do treści swoich danych osobowych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia, wniesienia sprzeciwu wobec przetwarzania, cofnięcia zgody w każdej chwili (co nie ma wpływu na zgodność z prawem przetwarzania dokonanego w oparciu o zgodę przed jej cofnięciem).",
      "2. Zgłoszenie o wystąpieniu przez Użytkownika z uprawnieniem wynikającym z wymienionych praw należy przesłać na adres iod@prostasprawa.pl.",
      "3. Administrator spełnia lub odmawia spełnienia żądania niezwłocznie – maksymalnie w ciągu miesiąca od jego otrzymania.",
      "4. Użytkownik ma prawo złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych, jeśli uzna, że przetwarzanie narusza jego prawa i wolności (RODO)."
    ]
  },
  {
    id: "pliki-cookies",
    number: "VIII",
    title: "Pliki cookies",
    icon: <Cookie className="w-5 h-5" />,
    paragraphs: [
      "1. Serwis zbiera informacje za pomocą plików cookies – sesyjnych, stałych i podmiotów zewnętrznych.",
      "2. Zbieranie plików cookies wspiera poprawne świadczenie usług w Serwisie i służy celom statystycznym.",
      "3. Użytkownik może określić zakres dostępu plików cookies do swojego urządzenia w ustawieniach przeglądarki.",
      "4. Administrator w ramach Serwisu korzysta z plików cookie. Cele i zasady dotyczące korzystania z plików cookie znajdują się w Regulaminie Serwisu.",
      "5. Dane związane z analizą ruchu sieciowego gromadzone za pośrednictwem plików cookies oraz podobnych technologii mogą być przechowywane do momentu wygaśnięcia pliku cookie. Niektóre pliki cookie nigdy nie wygasają, w związku z tym czas przechowywania danych będzie równoważny z czasem niezbędnym Administratorowi do zrealizowania celów związanych z gromadzeniem danych, jak zapewnienie bezpieczeństwa i analiza danych historycznych związanych z ruchem na stronie."
    ]
  },
  {
    id: "zautomatyzowane-decyzje",
    number: "IX",
    title: "Zautomatyzowane podejmowanie decyzji i profilowanie",
    icon: <Cpu className="w-5 h-5" />,
    paragraphs: [
      "1. Dane Użytkowników nie mogą być przetwarzane w zautomatyzowany sposób tak, że na skutek tego mogłyby zapaść wobec nich jakiekolwiek decyzje.",
      "2. Dane Użytkowników mogą być profilowane celem dostosowania treści i personalizacji oferty Serwisu po wyrażeniu przez nich zgody."
    ]
  },
  {
    id: "bezpieczenstwo-danych",
    number: "X",
    title: "Bezpieczeństwo Danych osobowych",
    icon: <Lock className="w-5 h-5" />,
    paragraphs: [
      "1. Administrator na bieżąco prowadzi analizę ryzyka w celu zapewnienia, że Dane osobowe przetwarzane są przez niego w sposób bezpieczny – zapewniający przede wszystkim, że dostęp do danych mają jedynie osoby upoważnione i jedynie w zakresie, w jakim jest to niezbędne ze względu na wykonywane przez nie zadania. Administrator dba o to, by wszystkie operacje na Danych osobowych były rejestrowane i dokonywane jedynie przez uprawnionych pracowników i współpracowników.",
      "2. Administrator podejmuje wszelkie niezbędne działania, by także jego podwykonawcy, o ile występują, i inne podmioty współpracujące dawały gwarancję stosowania odpowiednich środków bezpieczeństwa w każdym przypadku, gdy przetwarzają Dane osobowe na zlecenie Administratora."
    ]
  },
  {
    id: "postanowienia-koncowe",
    number: "XI",
    title: "Postanowienia końcowe",
    icon: <FileText className="w-5 h-5" />,
    paragraphs: [
      "1. Administrator ma prawo do wprowadzenia zmian w Polityce prywatności, przy czym prawa Użytkowników nie zostaną ograniczone.",
      "2. Informacja o wprowadzonych zmianach pojawi się w formie komunikatu dostępnego w Serwisie.",
      "3. W sprawach nieuregulowanych w niniejszej Polityce prywatności obowiązują przepisy RODO i przepisy prawa polskiego."
    ]
  }
]

export default function PrivacyPolicyClientPage() {
  const [activeTab, setActiveTab] = useState<"tldr" | "full">("tldr")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSection, setActiveSection] = useState("definicje")
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const sectionsRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [openGlossaryIndex, setOpenGlossaryIndex] = useState<number | null>(null)

  // Copy email to clipboard
  const handleCopyEmail = () => {
    navigator.clipboard.writeText("iod@prostasprawa.pl")
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
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

      for (const section of SECTIONS) {
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
  }, [activeTab, activeSection])

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
    if (!searchQuery.trim()) return SECTIONS

    const query = searchQuery.toLowerCase().trim()
    return SECTIONS.map(section => {
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
    }).filter(Boolean) as (typeof SECTIONS[0] & { isFiltered?: boolean })[]
  }, [searchQuery])

  // Count search matches
  const matchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0
    const query = searchQuery.toLowerCase().trim()
    let count = 0
    SECTIONS.forEach(s => {
      if (s.title.toLowerCase().includes(query)) count++
      s.paragraphs.forEach(p => {
        const regex = new RegExp(query, "gi")
        const matches = p.match(regex)
        if (matches) count += matches.length
      })
    })
    return count
  }, [searchQuery])

  // Helper to highlight matching text
  const highlightText = (text: string, search: string) => {
    if (!search) return text
    const parts = text.split(new RegExp(`(${search})`, "gi"))
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-teal-500/30 text-teal-200 font-semibold rounded px-0.5 border border-teal-500/20">
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
    <div className="bg-[#121212] min-h-[calc(100vh-65px)] text-white pb-20 relative font-sans selection:bg-teal-500/20 selection:text-teal-200">
      
      {/* Scroll Progress Bar (Only visible in full view) */}
      {activeTab === "full" && (
        <div className="fixed top-[65px] left-0 right-0 h-1 bg-neutral-900 z-50 print:hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-100" 
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}

      {/* Hero Banner Header */}
      <div 
        className="relative w-full h-[180px] md:h-[240px] flex items-center bg-cover bg-center overflow-hidden border-b border-neutral-900/60 print:bg-white print:border-b print:text-black print:h-auto print:py-6"
        style={{ backgroundImage: "url('/images/security-lock.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/45 print:hidden" />
        <div className="absolute inset-0 bg-teal-950/10 print:hidden" />
        <div className="container mx-auto px-4 relative z-10 print:text-black">
          <div className="print:hidden">
            <ResponsiveBreadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Polityka prywatności" },
              ]}
            />
          </div>
          <h1 className="font-playfair text-3xl sm:text-4xl lg:text-[44px] leading-tight text-white font-bold tracking-tight mt-3 print:text-black print:text-2xl">
            Polityka Prywatności
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base font-light mt-1 print:text-neutral-600">
            Zasady przetwarzania i ochrony danych osobowych w serwisie ProstaSprawa.pl
          </p>
        </div>
      </div>

      {/* Decorative Blur Spheres */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 print:hidden">
        <div className="absolute top-1/4 left-1/10 w-[400px] h-[400px] bg-teal-950/15 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/10 w-[500px] h-[500px] bg-neutral-900/40 rounded-full blur-[180px]" />
      </div>

      {/* Interactive Controls & View Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10 print:mt-2">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#1a1917]/90 border border-neutral-800/80 rounded-2xl p-4 backdrop-blur-md mb-8 print:hidden">
          
          {/* Tab Selector */}
          <div className="flex bg-[#121211] p-1.5 rounded-xl border border-neutral-800 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("tldr")}
              className={`flex items-center justify-center gap-2 flex-1 md:flex-initial px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "tldr"
                  ? "bg-teal-600 text-white shadow-md shadow-teal-900/20"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Podsumowanie w pigułce
            </button>
            <button
              onClick={() => setActiveTab("full")}
              className={`flex items-center justify-center gap-2 flex-1 md:flex-initial px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "full"
                  ? "bg-teal-600 text-white shadow-md shadow-teal-900/20"
                  : "text-neutral-400 hover:text-white"
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
              className="flex items-center justify-center gap-2 bg-[#242320] border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white px-4 py-2.5 rounded-xl text-sm transition-all duration-300 cursor-pointer"
              title="Drukuj politykę prywatności"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Drukuj</span>
            </button>
            <a
              href="/Polityka%20prywatno%C5%9Bci%20serwisu%20prostasprawa.pl.docx.pdf"
              download
              className="flex items-center justify-center gap-2 bg-[#242320] border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white px-4 py-2.5 rounded-xl text-sm transition-all duration-300 cursor-pointer"
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
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold">Twoja prywatność w skrócie</h2>
              <p className="text-neutral-400 text-sm sm:text-base font-light">
                Twoje zaufanie jest dla nas kluczowe. Przygotowaliśmy to interaktywne streszczenie, aby ułatwić Ci zapoznanie się z najważniejszymi kwestiami dotyczącymi Twoich danych osobowych.
              </p>
            </div>

            {/* TLDR Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Administrator */}
              <div className="bg-[#1a1917]/70 border border-neutral-800/80 rounded-2xl p-6 hover:border-teal-500/30 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-teal-950/20 border border-teal-900/40 text-teal-400 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-white">Kto zarządza danymi?</h3>
                  <div className="space-y-2 text-xs text-neutral-400 leading-relaxed">
                    <p>Właścicielem serwisu oraz Administratorem Twoich danych osobowych jest:</p>
                    <p className="bg-[#121211] p-2.5 rounded border border-neutral-850 text-white font-mono text-[11px]">
                      POLSKA GRUPA IDENTYFIKACJI FIRM SP. Z O.O.<br />
                      ul. Gen. M. Langiewicza 16 lok. 3<br />
                      25-381 Kielce<br />
                      KRS: 0000768210 | NIP: 9592020678
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => { setActiveTab("full"); setTimeout(() => scrollToSection("definicje"), 100) }}
                  className="mt-6 text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold group cursor-pointer"
                >
                  Dane szczegółowe (Rozdz. I)
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Card 2: Cel Przetwarzania */}
              <div className="bg-[#1a1917]/70 border border-neutral-800/80 rounded-2xl p-6 hover:border-teal-500/30 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-teal-950/20 border border-teal-900/40 text-teal-400 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-white">Po co zbieramy Twoje dane?</h3>
                  <ul className="space-y-2 text-xs text-neutral-400 leading-relaxed list-disc list-inside">
                    <li><strong className="text-white">Obsługa konta</strong> – logowanie, weryfikacja i personalizacja serwisu.</li>
                    <li><strong className="text-white">Realizacja usług</strong> – kojarzenie Klientów z Wykonawcami.</li>
                    <li><strong className="text-white">Komunikacja</strong> – obsługa formularzy kontaktowych oraz e-maili.</li>
                    <li><strong className="text-white">Newsletter</strong> – wysyłka wiadomości o nowościach (za Twoją zgodą).</li>
                    <li><strong className="text-white">Analizy</strong> – optymalizacja działania serwisu.</li>
                  </ul>
                </div>
                <button 
                  onClick={() => { setActiveTab("full"); setTimeout(() => scrollToSection("cel-zbierania-danych"), 100) }}
                  className="mt-6 text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold group cursor-pointer"
                >
                  Cel i zakres (Rozdz. III)
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Card 3: Prawa RODO */}
              <div className="bg-[#1a1917]/70 border border-neutral-800/80 rounded-2xl p-6 hover:border-teal-500/30 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-teal-950/20 border border-teal-900/40 text-teal-400 rounded-xl flex items-center justify-center">
                    <Scale className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-white">Jakie prawa Ci przysługują?</h3>
                  <ul className="space-y-2 text-xs text-neutral-400 leading-relaxed list-disc list-inside">
                    <li><strong className="text-white">Dostęp i edycja</strong> – masz pełny wgląd do swoich danych i ich poprawiania.</li>
                    <li><strong className="text-white">Prawo do usunięcia</strong> – tzw. „prawo do bycia zapomnianym”.</li>
                    <li><strong className="text-white">Przenoszenie danych</strong> – możliwość otrzymania paczki swoich danych.</li>
                    <li><strong className="text-white">Wycofanie zgody</strong> – bez negatywnych konsekwencji w każdej chwili.</li>
                    <li><strong className="text-white">Zgłoszenie sprzeciwu</strong> – wobec określonego przetwarzania.</li>
                  </ul>
                </div>
                <button 
                  onClick={() => { setActiveTab("full"); setTimeout(() => scrollToSection("prawa-uzytkownikow"), 100) }}
                  className="mt-6 text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold group cursor-pointer"
                >
                  Twoje prawa (Rozdz. VII)
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Card 4: Czas i przekazywanie */}
              <div className="bg-[#1a1917]/70 border border-neutral-800/80 rounded-2xl p-6 hover:border-teal-500/30 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-teal-950/20 border border-teal-900/40 text-teal-400 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-white">Okres i udostępnianie</h3>
                  <ul className="space-y-2 text-xs text-neutral-400 leading-relaxed list-disc list-inside">
                    <li><strong className="text-white">Okres przechowywania</strong> – zależy od celu (do momentu wygaśnięcia roszczeń lub odwołania zgody). Przedawnienie roszczeń: 6 lat (gospodarcze: 3 lata).</li>
                    <li><strong className="text-white">Odbiorcy danych</strong> – wyłącznie zaufani podwykonawcy (np. dostawcy hostingu i IT).</li>
                    <li><strong className="text-white">Brak transferów poza EOG</strong> – Twoje dane pozostają na terenie Unii Europejskiej.</li>
                  </ul>
                </div>
                <button 
                  onClick={() => { setActiveTab("full"); setTimeout(() => scrollToSection("okres-przetwarzania"), 100) }}
                  className="mt-6 text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold group cursor-pointer"
                >
                  Zasady czasu (Rozdz. V i VI)
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Card 5: Pliki Cookies */}
              <div className="bg-[#1a1917]/70 border border-neutral-800/80 rounded-2xl p-6 hover:border-teal-500/30 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-teal-950/20 border border-teal-900/40 text-teal-400 rounded-xl flex items-center justify-center">
                    <Cookie className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-white">Pliki Cookies (Ciasteczka)</h3>
                  <ul className="space-y-2 text-xs text-neutral-400 leading-relaxed list-disc list-inside">
                    <li><strong className="text-white">Rodzaje</strong> – pliki sesyjne (tymczasowe) oraz stałe.</li>
                    <li><strong className="text-white">Partnerzy zewnętrzni</strong> – Google Analytics (statystyki), Facebook Pixels (analiza) oraz HotJar.</li>
                    <li><strong className="text-white">Kontrola</strong> – możesz samodzielnie zmienić ustawienia plików cookies w swojej przeglądarce w dowolnym momencie.</li>
                  </ul>
                </div>
                <button 
                  onClick={() => { setActiveTab("full"); setTimeout(() => scrollToSection("pliki-cookies"), 100) }}
                  className="mt-6 text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold group cursor-pointer"
                >
                  Pliki Cookies (Rozdz. VIII)
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Card 6: Profilowanie */}
              <div className="bg-[#1a1917]/70 border border-neutral-800/80 rounded-2xl p-6 hover:border-teal-500/30 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-teal-950/20 border border-teal-900/40 text-teal-400 rounded-xl flex items-center justify-center">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-lg text-white">Profilowanie i decyzje</h3>
                  <ul className="space-y-2 text-xs text-neutral-400 leading-relaxed list-disc list-inside">
                    <li><strong className="text-white">Brak automatycznych decyzji</strong> – żadne decyzje wywołujące skutki prawne nie są podejmowane automatycznie.</li>
                    <li><strong className="text-white">Profilowanie ofert</strong> – dopasowanie ofert serwisu następuje wyłącznie po wyrażeniu przez Ciebie dobrowolnej zgody.</li>
                  </ul>
                </div>
                <button 
                  onClick={() => { setActiveTab("full"); setTimeout(() => scrollToSection("zautomatyzowane-decyzje"), 100) }}
                  className="mt-6 text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold group cursor-pointer"
                >
                  Profilowanie (Rozdz. IX)
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>

            {/* Glossary/Definitions Accordion */}
            <div className="bg-[#1a1917]/50 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 mt-12">
              <h3 className="font-playfair text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-teal-500" />
                Słownik podstawowych pojęć prawnych
              </h3>
              
              <div className="space-y-3">
                {DEFINITIONS.map((def, idx) => {
                  const isOpen = openGlossaryIndex === idx
                  return (
                    <div 
                      key={def.term}
                      className="bg-[#242320]/45 border border-neutral-800/70 rounded-xl overflow-hidden transition-all duration-300"
                    >
                      <button
                        onClick={() => setOpenGlossaryIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm sm:text-base text-white hover:text-teal-400 transition-colors cursor-pointer"
                      >
                        <span>{def.term}</span>
                        <ChevronRight className={`w-4 h-4 text-neutral-500 transition-transform duration-300 ${isOpen ? "rotate-90 text-teal-400" : ""}`} />
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            <div className="px-4 pb-4 pt-1 border-t border-neutral-800/40 text-xs sm:text-sm text-neutral-450 leading-relaxed">
                              {def.desc}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* DPO / IOD Spotlight Banner */}
            <div className="bg-[#1d1c1a]/95 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 mt-12 flex flex-col lg:flex-row gap-8 items-center justify-between relative overflow-hidden">
              <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-teal-950/20 rounded-full blur-[80px] pointer-events-none" />
              <div className="space-y-3 max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/40 border border-teal-900/60 text-[11px] font-semibold text-teal-400 tracking-wide uppercase">
                  Inspektor Ochrony Danych (IOD)
                </div>
                <h3 className="font-playfair text-xl sm:text-2xl font-bold text-white">Masz pytania dotyczące swoich danych?</h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  Administrator wyznaczył Inspektora Ochrony Danych, z którym możesz skontaktować się we wszystkich sprawach związanych z przetwarzaniem danych osobowych oraz realizacją przysługujących Ci praw na mocy RODO.
                </p>
              </div>
              <div className="w-full lg:w-auto flex-shrink-0 flex flex-col sm:flex-row gap-3 relative z-10">
                <button
                  onClick={handleCopyEmail}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#0d8276] hover:bg-[#0a6c62] text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-teal-950/25 transition-all duration-300 cursor-pointer text-sm"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-4 h-4" />
                      Skopiowano email!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Skopiuj adres email
                    </>
                  )}
                </button>
                <a
                  href="mailto:iod@prostasprawa.pl"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#242320] hover:bg-[#2e2d29] border border-neutral-800 text-neutral-200 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300"
                >
                  <Mail className="w-4 h-4" />
                  Napisz wiadomość
                </a>
              </div>
            </div>

          </motion.div>
        )}

        {/* Tab 2: Full Privacy Policy Document */}
        {activeTab === "full" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Navigation (TOC) */}
            <aside className="lg:col-span-4 sticky top-[100px] h-[calc(100vh-140px)] overflow-y-auto pr-4 hidden lg:flex flex-col space-y-4 print:hidden custom-scrollbar">
              <div className="bg-[#1a1917]/80 border border-neutral-800/80 rounded-2xl p-5 backdrop-blur-md">
                <h3 className="font-playfair text-lg font-bold text-white pb-3 border-b border-neutral-800/60 mb-4">
                  Spis treści
                </h3>
                <nav className="flex flex-col space-y-1">
                  {SECTIONS.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-medium transition-all duration-200 cursor-pointer group ${
                        activeSection === section.id
                          ? "bg-teal-600 text-white font-semibold shadow-md shadow-teal-900/10"
                          : "text-neutral-400 hover:text-neutral-200 hover:bg-[#242320]/50"
                      }`}
                    >
                      <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors duration-200 ${
                        activeSection === section.id
                          ? "bg-white/20 text-white"
                          : "bg-neutral-800/60 text-neutral-400 group-hover:bg-neutral-700/60 group-hover:text-neutral-200"
                      }`}>
                        {section.number}
                      </span>
                      <span className="truncate">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Download Banner Card */}
              <div className="bg-gradient-to-br from-teal-950/20 to-neutral-900 border border-teal-900/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm">
                  <ExternalLink className="w-4 h-4" />
                  Oficjalny dokument
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Pobierz oryginalny plik PDF z Polityką Prywatności serwisu, aby móc w każdej chwili odczytać go offline.
                </p>
                <a
                  href="/Polityka%20prywatno%C5%9Bci%20serwisu%20prostasprawa.pl.docx.pdf"
                  download
                  className="w-full flex items-center justify-center gap-2 bg-[#0da192] hover:bg-[#0a8276] text-white text-xs font-semibold py-2 px-4 rounded-lg shadow transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Pobierz plik PDF
                </a>
              </div>
            </aside>

            {/* Document Content Column */}
            <main className="lg:col-span-8 space-y-8 print:col-span-12">
              
              {/* Live Search */}
              <div className="bg-[#1a1917]/70 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md print:hidden space-y-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Wyszukaj w polityce prywatności... (np. RODO, cookies, EOG)"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#121211] border border-neutral-850 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-teal-500/80 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-white"
                    >
                      Wyczyść
                    </button>
                  )}
                </div>
                
                {/* Search Match Stats Banner */}
                {searchQuery.trim() && (
                  <div className="flex items-center justify-between text-xs text-neutral-400 bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-850">
                    <span>
                      Słowo kluczowe: <strong className="text-white">„{searchQuery}”</strong>
                    </span>
                    <span>
                      Znaleziono: <strong className="text-teal-400 font-bold">{matchCount}</strong> dopasowań
                    </span>
                  </div>
                )}
              </div>

              {/* Legal Text Content */}
              <div className="space-y-8 print:space-y-6">
                <AnimatePresence mode="popLayout">
                  {filteredSections.length > 0 ? (
                    filteredSections.map((section) => (
                      <motion.div
                        key={section.id}
                        ref={(el) => {
                          sectionsRefs.current[section.id] = el
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="bg-[#1a1917]/40 border border-neutral-800/60 rounded-2xl p-6 sm:p-8 backdrop-blur-sm scroll-mt-28 hover:border-neutral-850/90 transition-colors duration-300 print:bg-white print:border-none print:shadow-none print:p-0 print:text-black"
                      >
                        {/* Section Header */}
                        <div className="flex items-center gap-4 pb-4 border-b border-neutral-800/40 mb-6 print:border-neutral-300 print:mb-4">
                          <div className="w-10 h-10 rounded-xl bg-teal-950/30 border border-teal-900/50 text-teal-400 flex items-center justify-center flex-shrink-0 print:hidden">
                            {section.icon}
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-teal-400 tracking-wider uppercase font-mono print:text-neutral-500">
                              Rozdział {section.number}
                            </span>
                            <h2 className="font-playfair text-xl sm:text-2xl font-bold text-white print:text-black">
                              {section.title}
                            </h2>
                          </div>
                        </div>

                        {/* Section Paragraphs */}
                        <div className="space-y-4 text-sm sm:text-base text-neutral-300 font-light leading-relaxed print:text-black">
                          {section.paragraphs.map((para, pIdx) => {
                            // Check if it is a list bullet element
                            const isBullet = para.trim().startsWith("•")
                            
                            return (
                              <p 
                                key={pIdx}
                                className={`${isBullet ? "pl-5 -indent-5 text-neutral-350" : ""} transition-all`}
                              >
                                {highlightText(para, searchQuery)}
                              </p>
                            )
                          })}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    /* Search Empty State */
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-[#1a1917]/35 border border-neutral-800/40 rounded-2xl p-12 text-center text-neutral-400"
                    >
                      <ShieldAlert className="w-12 h-12 mx-auto text-neutral-600 mb-4" />
                      <h3 className="font-semibold text-lg text-white mb-2">Brak wyników wyszukiwania</h3>
                      <p className="text-sm max-w-md mx-auto">
                        Nie znaleźliśmy fragmentów odpowiadających frazie <strong className="text-white">„{searchQuery}”</strong>. Spróbuj użyć innych słów kluczowych lub wyczyść wyszukiwarkę.
                      </p>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="mt-6 inline-flex items-center gap-2 bg-[#242320] border border-neutral-850 hover:bg-[#2c2b27] text-white px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                      >
                        Wyczyść filtry
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Final Legal Footer info */}
              <div className="text-center text-xs text-neutral-500 pt-6 border-t border-neutral-900/60 print:text-neutral-500">
                Ostatnia aktualizacja dokumentu: 22 czerwca 2026 r.<br />
                Polityka Prywatności serwisu ProstaSprawa.pl jest chroniona prawem autorskim.
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  )
}
