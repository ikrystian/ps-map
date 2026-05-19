"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Custom high-fidelity SVG Icons to perfectly match the premium dark theme design
const SparkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5 text-[#00897b]">
    <path d="M12 2v4M12 18v4M4 12h4M16 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M6.3 17.7l2.8-2.8M14.9 9.1l2.8-2.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3.5" stroke="currentColor" fill="none" />
  </svg>
)

const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5 text-[#00897b]">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
)

const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5 text-[#00897b]">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-[#00897b]">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

// Section 2 Specific High-Fidelity SVGs
const PolandIcon = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.25" className="w-20 h-20 text-[#0da192]">
    {/* High quality recognizable stylized outline map of Poland */}
    <path
      d="M 50 15 
         C 53 15, 57 14, 60 16 
         C 63 17, 65 19, 68 18 
         C 71 18, 73 17, 75 19 
         C 77 21, 75 24, 78 26 
         C 80 27, 85 27, 86 29 
         C 88 31, 88 35, 87 38 
         C 86 40, 84 41, 85 43 
         C 86 45, 89 47, 88 50 
         C 88 53, 85 55, 85 57 
         C 85 60, 88 62, 87 65 
         C 86 67, 83 67, 82 70 
         C 81 72, 82 76, 80 78 
         C 78 80, 74 80, 72 82 
         C 70 84, 69 87, 66 87 
         C 63 87, 60 85, 58 85 
         C 55 85, 52 87, 50 87 
         C 47 87, 44 87, 41 85 
         C 39 84, 38 82, 35 82 
         C 33 82, 30 84, 27 82 
         C 25 81, 25 77, 23 75 
         C 21 74, 18 73, 17 71 
         C 15 68, 17 65, 16 62 
         C 15 60, 12 58, 12 56 
         C 12 53, 15 51, 15 48 
         C 15 45, 13 42, 14 39 
         C 15 36, 19 35, 20 32 
         C 21 30, 21 26, 23 24 
         C 25 22, 28 23, 30 21 
         C 32 19, 33 16, 36 15 
         C 39 14, 43 16, 46 15 
         Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const BrandIcon = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.25" className="w-20 h-20 text-[#0da192]">
    {/* Map path line at the bottom */}
    <path d="M 20 75 L 80 75" strokeLinecap="round" />
    {/* Map pin */}
    <path d="M 38 65 C 38 53, 48 53, 48 41 C 48 34, 43 29, 38 29 C 33 29, 28 34, 28 41 C 28 53, 38 53, 38 65 Z" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="38" cy="41" r="3.5" fill="currentColor" />
    {/* Speech bubble/badge with star on the right */}
    <path d="M 54 36 L 74 36 C 77 36, 79 38, 79 41 L 79 57 C 79 60, 77 62, 74 62 L 63 62 L 55 70 L 55 62 L 54 62 C 51 62, 49 60, 49 57 L 49 49" strokeLinecap="round" strokeLinejoin="round" />
    {/* Star inside badge */}
    <path d="M 64 43 L 66.5 48 L 72 48 L 68 51.5 L 69.5 57 L 64 53.5 L 58.5 57 L 60 51.5 L 56 48 L 61.5 48 Z" fill="currentColor" />
  </svg>
)

const CasesIcon = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.75" className="w-20 h-20 text-[#0da192]">
    {/* Three horizontal list lines */}
    <line x1="20" y1="32" x2="80" y2="32" strokeLinecap="round" />
    <line x1="20" y1="47" x2="62" y2="47" strokeLinecap="round" />
    <line x1="20" y1="62" x2="48" y2="62" strokeLinecap="round" />
    {/* Plus symbol on the bottom right */}
    <path d="M 72 54 L 72 74 M 62 64 L 82 64" strokeLinecap="round" />
  </svg>
)

export default function ForLawyersPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Form States
  const [kimJestes, setKimJestes] = useState("Specjalista prawa")
  const [kategoria, setKategoria] = useState("Adwokat")
  const [lokalizacja, setLokalizacja] = useState("")

  // Dropdown States - defaults to true for 'Kim jesteś' on load to exactly replicate the project screenshot!
  const [isKimJestesOpen, setIsKimJestesOpen] = useState(true)
  const [isKategorieOpen, setIsKategorieOpen] = useState(false)

  // Refs for closing dropdowns on click outside
  const kimJestesRef = useRef<HTMLDivElement>(null)
  const kategorieRef = useRef<HTMLDivElement>(null)

  // Options
  const kimJestesOptions = [
    "Specjalista prawa",
    "Ekspert dla firm"
  ]

  const kategoriaOptions = [
    "Adwokat",
    "Radca prawny",
    "Doradca podatkowy",
    "Notariusz"
  ]

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (kimJestesRef.current && !kimJestesRef.current.contains(event.target as Node)) {
        setIsKimJestesOpen(false)
      }
      if (kategorieRef.current && !kategorieRef.current.contains(event.target as Node)) {
        setIsKategorieOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Tworzenie profilu...",
      description: "Przenosimy Cię do formularza rejestracji kancelarii.",
    })
    
    // Redirect to registration with prepopulated query parameters
    const params = new URLSearchParams()
    params.set("role", kimJestes)
    params.set("category", kategoria)
    if (lokalizacja) params.set("city", lokalizacja)
    
    router.push(`/rejestracja/kancelaria?${params.toString()}`)
  }

  return (
    <div className="bg-[#121212] min-h-screen text-white font-sans">
      
      {/* SECTION 1: Załóż konto eksperta i dodaj ogłoszenie */}
      <section className="relative bg-[#121212] flex flex-col justify-center items-center py-24 px-4 overflow-hidden">
        {/* Cinematic Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-gradient-to-b from-neutral-800/10 to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-gradient-to-t from-neutral-900/20 to-transparent blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
          {/* Section Header */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-500 mb-3 text-center">
            ZNAJDŹ NOWYCH KLIENTÓW
          </p>
          <h1 className="text-3xl md:text-[38px] font-semibold text-white tracking-tight text-center leading-tight mb-10 max-w-2xl font-sans">
            Załóż konto eksperta i dodaj ogłoszenie
          </h1>

          {/* Wizard Main Card */}
          <div className="w-full bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-7 shadow-2xl mb-5">
            {/* Card Top bar */}
            <div className="flex items-center justify-between pb-5 border-b border-[#2d2d2d] mb-6">
              <span className="text-sm font-medium text-white tracking-wide">
                Wysłane zgłoszenia
              </span>
              <span 
                onClick={() => router.push("/cennik")}
                className="text-[#0da192] hover:text-[#00897b] text-sm font-medium cursor-pointer transition-colors duration-200"
              >
                Od czego zależy cena?
              </span>
            </div>

            {/* Form Controls */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
              {/* Field 1: Kim jesteś? */}
              <div ref={kimJestesRef} className="md:col-span-3 relative">
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                  Kim jesteś?
                </label>
                
                {/* Select Trigger */}
                <div
                  onClick={() => {
                    setIsKimJestesOpen(!isKimJestesOpen)
                    setIsKategorieOpen(false)
                  }}
                  className={`w-full flex items-center justify-between bg-[#161616] border ${isKimJestesOpen ? "border-[#0da192]" : "border-[#2d2d2d]"
                    } text-white px-4 py-3 rounded-md cursor-pointer hover:border-neutral-500 transition-all duration-200 text-sm h-11`}
                >
                  <span>{kimJestes}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${isKimJestesOpen ? "rotate-180" : ""
                    }`} />
                </div>

                {/* Select Options Panel */}
                {isKimJestesOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-[#161616] border border-[#2d2d2d] rounded-md shadow-2xl z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    {kimJestesOptions.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => {
                          setKimJestes(opt)
                          setIsKimJestesOpen(false)
                        }}
                        className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer hover:bg-neutral-800/60 transition-colors duration-150 ${kimJestes === opt ? "text-[#0da192] bg-neutral-800/30 font-medium" : "text-white"
                          }`}
                      >
                        <span>{opt}</span>
                        {kimJestes === opt && <CheckIcon />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Field 2: Kategorie */}
              <div ref={kategorieRef} className="md:col-span-3 relative">
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                  Kategorie
                </label>

                {/* Select Trigger */}
                <div
                  onClick={() => {
                    setIsKategorieOpen(!isKategorieOpen)
                    setIsKimJestesOpen(false)
                  }}
                  className={`w-full flex items-center justify-between bg-[#161616] border ${isKategorieOpen ? "border-[#0da192]" : "border-[#2d2d2d]"
                    } text-white px-4 py-3 rounded-md cursor-pointer hover:border-neutral-500 transition-all duration-200 text-sm h-11`}
                >
                  <span>{kategoria}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${isKategorieOpen ? "rotate-180" : ""
                    }`} />
                </div>

                {/* Select Options Panel */}
                {isKategorieOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-[#161616] border border-[#2d2d2d] rounded-md shadow-2xl z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    {kategoriaOptions.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => {
                          setKategoria(opt)
                          setIsKategorieOpen(false)
                        }}
                        className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer hover:bg-neutral-800/60 transition-colors duration-150 ${kategoria === opt ? "text-[#0da192] bg-neutral-800/30 font-medium" : "text-white"
                          }`}
                      >
                        <span>{opt}</span>
                        {kategoria === opt && <CheckIcon />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Field 3: Lokalizacja */}
              <div className="md:col-span-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Lokalizacja
                  </label>
                  <div className="text-[#0da192] hover:text-[#00897b] cursor-pointer transition-colors duration-150 flex items-center">
                    <Info className="w-3.5 h-3.5" />
                  </div>
                </div>
                <input
                  type="text"
                  value={lokalizacja}
                  onChange={(e) => setLokalizacja(e.target.value)}
                  placeholder="Wpisz miasto lub miejscowość"
                  className="w-full bg-[#161616] border border-[#2d2d2d] text-white placeholder-neutral-600 px-4 py-3 rounded-md focus:outline-none focus:border-[#0da192] hover:border-neutral-500 transition-all duration-200 text-sm h-11"
                />
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-[#0da192] hover:bg-[#00897b] text-white font-medium h-11 px-5 rounded-md transition-all duration-200 text-sm flex items-center justify-center hover:scale-[1.01] active:scale-[0.99] shadow-lg cursor-pointer"
                >
                  Załóż profil
                </button>
              </div>
            </form>
          </div>

          {/* Benefits Horizontal Cards Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-5 flex items-center gap-4 hover:border-neutral-700 hover:bg-[#222222]/80 transition-all duration-300 group cursor-pointer">
              <div className="p-2.5 bg-neutral-800/40 rounded-lg flex items-center justify-center text-teal-400 border border-neutral-700/30 group-hover:border-[#0da192]/20 group-hover:bg-[#0da192]/5 transition-all duration-300">
                <SparkIcon />
              </div>
              <div>
                <h3 className="text-white text-sm font-semibold tracking-wide">
                  Oferta na start
                </h3>
                <p className="text-[11px] text-neutral-400 font-medium mt-0.5 group-hover:text-neutral-300 transition-colors duration-300">
                  Dowiedz się więcej
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-5 flex items-center gap-4 hover:border-neutral-700 hover:bg-[#222222]/80 transition-all duration-300 group cursor-pointer">
              <div className="p-2.5 bg-neutral-800/40 rounded-lg flex items-center justify-center text-teal-400 border border-neutral-700/30 group-hover:border-[#0da192]/20 group-hover:bg-[#0da192]/5 transition-all duration-300">
                <TargetIcon />
              </div>
              <div>
                <h3 className="text-white text-sm font-semibold tracking-wide">
                  Ile kosztuje ogłoszenie
                </h3>
                <p className="text-[11px] text-neutral-400 font-medium mt-0.5 group-hover:text-neutral-300 transition-colors duration-300">
                  Dowiedz się więcej
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-lg p-5 flex items-center gap-4 hover:border-neutral-700 hover:bg-[#222222]/80 transition-all duration-300 group cursor-pointer">
              <div className="p-2.5 bg-neutral-800/40 rounded-lg flex items-center justify-center text-teal-400 border border-neutral-700/30 group-hover:border-[#0da192]/20 group-hover:bg-[#0da192]/5 transition-all duration-300">
                <DocumentIcon />
              </div>
              <div>
                <h3 className="text-white text-sm font-semibold tracking-wide">
                  Potrzebujesz ogłoszeń?
                </h3>
                <p className="text-[11px] text-neutral-400 font-medium mt-0.5 group-hover:text-neutral-300 transition-colors duration-300">
                  Zaoszczędź kupując pakiety
                </p>
              </div>
            </div>
          </div>

          {/* Small Slider Scrollbar Center Indicator */}
          <div className="w-16 h-[2px] bg-neutral-800 rounded-full mx-auto mt-12 relative overflow-hidden">
            <div className="absolute left-[35%] w-[30%] h-full bg-neutral-600 rounded-full" />
          </div>
        </div>
      </section>

      {/* SECTION 2: Wypróbuj ProstaSprawa.pl od 0 zł */}
      <section className="relative bg-[#1a1a17] border-t border-neutral-900 flex flex-col justify-center items-center py-24 px-4 overflow-hidden">
        {/* Cinematic Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-gradient-to-b from-neutral-800/5 to-transparent blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
          {/* Section Header */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-500 mb-3.5 text-center">
            ZYSKAJ KLIENTÓW
          </p>
          <h2 className="text-3xl md:text-[38px] font-semibold text-white tracking-tight text-center leading-tight mb-16 max-w-2xl font-sans">
            Wypróbuj ProstaSprawa.pl od 0 zł
          </h2>

          {/* Benefits Vertical Cards Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            
            {/* Card 1: Zwiększ Zasięg */}
            <div className="bg-[#141414]/90 border border-neutral-800/60 rounded-sm p-12 flex flex-col items-center justify-between text-center hover:border-neutral-700/80 hover:bg-[#1c1c1c] transition-all duration-300 group cursor-pointer aspect-[3.8/5] min-h-[360px] shadow-xl">
              <div className="flex flex-col items-center mt-2">
                <span className="text-[23px] font-medium text-white tracking-wide">Zwiększ</span>
                <span className="text-[23px] font-medium text-white tracking-wide mt-0.5">zasięg</span>
              </div>
              <div className="mb-4 transition-transform duration-300 group-hover:scale-105">
                <PolandIcon />
              </div>
            </div>

            {/* Card 2: Buduj Markę */}
            <div className="bg-[#141414]/90 border border-neutral-800/60 rounded-sm p-12 flex flex-col items-center justify-between text-center hover:border-neutral-700/80 hover:bg-[#1c1c1c] transition-all duration-300 group cursor-pointer aspect-[3.8/5] min-h-[360px] shadow-xl">
              <div className="flex flex-col items-center mt-2">
                <span className="text-[23px] font-medium text-white tracking-wide">Buduj</span>
                <span className="text-[23px] font-medium text-white tracking-wide mt-0.5">markę</span>
              </div>
              <div className="mb-4 transition-transform duration-300 group-hover:scale-105">
                <BrandIcon />
              </div>
            </div>

            {/* Card 3: Zdobywaj więcej spraw */}
            <div className="bg-[#141414]/90 border border-neutral-800/60 rounded-sm p-12 flex flex-col items-center justify-between text-center hover:border-neutral-700/80 hover:bg-[#1c1c1c] transition-all duration-300 group cursor-pointer aspect-[3.8/5] min-h-[360px] shadow-xl">
              <div className="flex flex-col items-center mt-2">
                <span className="text-[23px] font-medium text-white tracking-wide">Zdobywaj</span>
                <span className="text-[23px] font-medium text-white tracking-wide mt-0.5">więcej spraw</span>
              </div>
              <div className="mb-4 transition-transform duration-300 group-hover:scale-105">
                <CasesIcon />
              </div>
            </div>

          </div>

          {/* Center Action Button */}
          <button
            onClick={() => router.push("/rejestracja/kancelaria")}
            className="bg-[#0da192] hover:bg-[#00897b] text-white font-medium py-3.5 px-16 rounded-md transition-all duration-200 text-sm flex items-center justify-center hover:scale-[1.01] active:scale-[0.99] shadow-lg cursor-pointer w-full max-w-[260px]"
          >
            Zarejestruj się
          </button>
        </div>
      </section>

    </div>
  )
}
