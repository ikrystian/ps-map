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
  )
}
