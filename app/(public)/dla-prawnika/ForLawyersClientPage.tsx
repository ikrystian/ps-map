"use client"

import { useToast } from "@/components/ui/use-toast"
import { ChevronDown, Info, Mail, Phone } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

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

// Section 3 Specific SVGs
const PillarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-16 h-16 text-[#0da192]">
    {/* Greek/Roman style law pillar */}
    <path d="M4 4h16M5 7h14" strokeLinecap="round" />
    <line x1="8" y1="7" x2="8" y2="17" strokeLinecap="round" />
    <line x1="12" y1="7" x2="12" y2="17" strokeLinecap="round" />
    <line x1="16" y1="7" x2="16" y2="17" strokeLinecap="round" />
    <path d="M5 17h14M3 20h18" strokeLinecap="round" />
  </svg>
)

const UserPlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-16 h-16 text-[#0da192]">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8.5" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="20" y1="8" x2="20" y2="14" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="17" y1="11" x2="23" y2="11" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-16 h-16 text-[#0da192]">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DoubleCheckmarkLogo = () => (
  <div className="flex items-center mr-3.5 relative w-8 h-8">
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
      {/* First checkmark in gold */}
      <path
        d="M 4 17 L 10 23 L 16 11"
        stroke="#eab308"
        strokeWidth="3.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Second checkmark in teal, overlapping beautifully */}
      <path
        d="M 10 17 L 16 23 L 26 11"
        stroke="#0da192"
        strokeWidth="3.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
)

// Section 5 Specific High-Fidelity SVGs
const UserPlusOutlineIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-18 h-18 text-[#0da192] mx-auto mb-5">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8.5" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="20" y1="8" x2="20" y2="14" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="17" y1="11" x2="23" y2="11" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CalendarCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-18 h-18 text-[#0da192] mx-auto mb-5">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="9 16 11 18 15 13" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const GraphUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-18 h-18 text-[#0da192] mx-auto mb-5">
    <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="15 8 19 8 19 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const SafePaymentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-18 h-18 text-[#0da192] mx-auto mb-5">
    <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="2" y1="10" x2="22" y2="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 14h2M10 14h1" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 13v4M16 15h4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function ForLawyersPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Form States
  const [kimJestes, setKimJestes] = useState("Specjalista prawa")
  const [kategoria, setKategoria] = useState("Adwokat")
  const [lokalizacja, setLokalizacja] = useState("")

  // Newsletter States
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterConsent, setNewsletterConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newsletterConsent) {
      toast({
        title: "Błąd zapisu",
        description: "Musisz wyrazić zgodę na otrzymywanie wiadomości.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newsletterEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Nie udało się zapisać do newslettera")
      }

      toast({
        title: "Pomyślnie zapisano!",
        description: data.message || "Link potwierdzający został wysłany na Twój adres e-mail.",
      })
      setNewsletterEmail("")
      setNewsletterConsent(false)
    } catch (error) {
      toast({
        title: "Błąd zapisu",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas zapisywania do newslettera.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
          <p className="text-base font-semibold uppercase tracking-[0.25em] text-neutral-500 mb-3 text-center">
            ZNAJDŹ NOWYCH KLIENTÓW
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight text-center leading-tight mb-10 max-w-4xl font-sans">
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
          <p className="text-base font-semibold uppercase tracking-[0.25em] text-neutral-500 mb-3.5 text-center">
            ZYSKAJ KLIENTÓW
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight text-center leading-tight mb-16 max-w-2xl font-sans">
            Wypróbuj ProstaSprawa.pl od 0 zł
          </h2>

          {/* Benefits Vertical Cards Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">

            {/* Card 1: Zwiększ Zasięg */}
            <div className="bg-[#141414]/90 border border-neutral-800/60 rounded-sm p-12 flex flex-col items-center justify-between text-center hover:border-neutral-700/80 hover:bg-[#1c1c1c] transition-all duration-300 group cursor-pointer shadow-xl">
              <div className="flex flex-col items-center mt-2">
                <span className="text-[23px] font-medium text-white tracking-wide">Zwiększ</span>
                <span className="text-[23px] font-medium text-white tracking-wide mt-0.5">zasięg</span>
              </div>
              <div className="mb-4 transition-transform duration-300 group-hover:scale-105 mt-1">
                <Image src={'/icon_1.webp'} alt="Globe Icon" width={96} height={96} />
              </div>
            </div>

            {/* Card 2: Buduj Markę */}
            <div className="bg-[#141414]/90 border border-neutral-800/60 rounded-sm p-12 flex flex-col items-center justify-between text-center hover:border-neutral-700/80 hover:bg-[#1c1c1c] transition-all duration-300 group cursor-pointer shadow-xl">
              <div className="flex flex-col items-center mt-2">
                <span className="text-[23px] font-medium text-white tracking-wide">Buduj</span>
                <span className="text-[23px] font-medium text-white tracking-wide mt-0.5">markę</span>
              </div>
              <div className="mb-4 transition-transform duration-300 group-hover:scale-105">
                <Image src={'/icon_2.webp'} alt="Globe Icon" width={96} height={96} />
              </div>
            </div>

            {/* Card 3: Zdobywaj więcej spraw */}
            <div className="bg-[#141414]/90 border border-neutral-800/60 rounded-sm p-12 flex flex-col items-center justify-between text-center hover:border-neutral-700/80 hover:bg-[#1c1c1c] transition-all duration-300 group cursor-pointer  shadow-xl">
              <div className="flex flex-col items-center mt-2">
                <span className="text-[23px] font-medium text-white tracking-wide">Zdobywaj</span>
                <span className="text-[23px] font-medium text-white tracking-wide mt-0.5">więcej spraw</span>
              </div>
              <div className="mb-4 transition-transform duration-300 group-hover:scale-105">
                <Image src={'/icon_3.webp'} alt="Globe Icon" width={96} height={96} />
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

      {/* SECTION 3: Jak założyć konto? */}
      <section className="relative bg-[#121212] border-t border-neutral-900 flex flex-col justify-center items-center py-24 px-4 overflow-hidden">
        {/* Cinematic Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-gradient-to-b from-neutral-800/5 to-transparent blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
          {/* Section Header */}
          <p className="text-base font-semibold uppercase tracking-[0.25em] text-neutral-500 mb-3.5 text-center">
            PROSTA SPRAWA!
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight text-center leading-tight mb-20 max-w-2xl font-sans">
            Jak założyć konto?
          </h2>

          {/* 3 Step-by-Step Columns */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mb-4">

            {/* Step 01 */}
            <div className="flex flex-col items-center text-center">
              <span className="text-[34px] font-bold text-neutral-600 mb-4 tracking-wider font-sans">01</span>
              <div className="w-32 h-32 rounded-md bg-[#1d1d1d] border border-neutral-800 flex items-center justify-center mb-6 shadow-md hover:border-[#0da192]/40 transition-colors duration-300">
                <PillarIcon />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3 tracking-wide leading-snug">
                Wypełnij formularz<br />rejestracyjny
              </h3>
              <p className="text-sm text-neutral-400 font-normal leading-relaxed max-w-[240px]">
                Podaj dane kontaktowe, wybierz specjalizacje i dodaj podstawowe informacje o swojej działalności.
              </p>
            </div>

            {/* Step 02 */}
            <div className="flex flex-col items-center text-center">
              <span className="text-[34px] font-bold text-neutral-600 mb-4 tracking-wider font-sans">02</span>
              <div className="w-32 h-32 rounded-md bg-[#1d1d1d] border border-neutral-800 flex items-center justify-center mb-6 shadow-md hover:border-[#0da192]/40 transition-colors duration-300">
                <UserPlusIcon />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3 tracking-wide leading-snug">
                Uzupełnij<br />profil
              </h3>
              <p className="text-sm text-neutral-400 font-normal leading-relaxed ">
                Dodaj opis, zdjęcia, firmy, doświadczenie, lokalizacje, w których świadczysz usługi. Im bardziej kompletny profil tym większa szansa na pozyskanie klientów.
              </p>
            </div>

            {/* Step 03 */}
            <div className="flex flex-col items-center text-center">
              <span className="text-[34px] font-bold text-neutral-600 mb-4 tracking-wider font-sans">03</span>
              <div className="w-32 h-32 rounded-md bg-[#1d1d1d] border border-neutral-800 flex items-center justify-center mb-6 shadow-md hover:border-[#0da192]/40 transition-colors duration-300">
                <HomeIcon />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3 tracking-wide leading-snug">
                Zacznij otrzymywać<br />sprawy
              </h3>
              <p className="text-small text-neutral-400 font-normal leading-relaxed ">
                Po zatwierdzeniu profilu zobaczysz sprawy dopasowane do Twojej specjalizacji.
              </p>
            </div>

          </div>

          {/* Double Checkmark Action Button */}
          <div className="mt-16 flex justify-center items-center w-full">
            <button
              onClick={() => router.push("/dodaj-sprawe")}
              className="bg-[#0da192] hover:bg-[#00897b] text-white font-medium py-3 px-8 rounded-md transition-all duration-200 flex items-center justify-center hover:scale-[1.01] active:scale-[0.99] shadow-lg cursor-pointer"
            >
              <DoubleCheckmarkLogo />
              <span className="font-semibold text-sm tracking-wide">Dodaj sprawę</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: Jak to działa? */}
      <section className="relative bg-[#1a1a17] border-t border-neutral-900 flex flex-col justify-center items-center py-24 px-4 overflow-hidden">
        {/* Cinematic Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-gradient-to-b from-neutral-800/5 to-transparent blur-[120px] pointer-events-none z-0" />

        {/* Giant checkmark logo watermark behind devices */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[420px] md:w-[600px] h-[320px] md:h-[450px] opacity-[0.035] pointer-events-none z-0">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
            <path
              d="M 12 52 L 36 76 L 88 24"
              stroke="url(#watermarkGrad)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="watermarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#0da192" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
          {/* Section Header */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-500 mb-3 text-center">
            PROSTA SPRAWA
          </p>
          <h2 className="text-3xl md:text-[38px] font-semibold text-white tracking-tight text-center leading-tight mb-4 max-w-2xl font-sans">
            Jak to działa?
          </h2>
          <p className="text-[12px] text-neutral-400 font-normal leading-relaxed text-center mb-16 max-w-xl mx-auto">
            Dodaj swoją sprawę bez zbędnych formalności, czekaj na oferty i wybierz tę, która najlepiej odpowiada Twoim potrzebom.
          </p>

          {/* Interactive Layout: Steps Left + Devices + Steps Right */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-5 items-center z-10 mb-14">

            {/* Left Steps: 01 & 02 */}
            <div className="lg:col-span-3 flex flex-col gap-6 items-center lg:items-end justify-center">

              {/* Card 01 */}
              <div className="bg-[#141414]/90 border border-neutral-800/60 rounded-lg p-7 hover:border-neutral-700/80 hover:bg-[#1c1c1c] transition-all duration-300 group cursor-pointer shadow-xl max-w-[280px] w-full text-center lg:text-left">
                <span className="text-[28px] font-semibold text-[#0da192] leading-none block mb-2 font-sans">01.</span>
                <h4 className="text-xl font-semibold text-white tracking-wider uppercase mb-2 leading-tight">
                  Załóż profil eksperta
                </h4>
                <p className="text-base text-neutral-400 font-normal leading-relaxed">
                  Przedstaw swoje doświadczenie oraz specjalizację.
                </p>
              </div>

              {/* Card 02 */}
              <div className="bg-[#141414]/90 border border-neutral-800/60 rounded-lg p-7 hover:border-neutral-700/80 hover:bg-[#1c1c1c] transition-all duration-300 group cursor-pointer shadow-xl max-w-[280px] w-full text-center lg:text-left">
                <span className="text-[28px] font-semibold text-[#0da192] leading-none block mb-2 font-sans">02.</span>
                <h4 className="text-xl font-semibold text-white tracking-wider uppercase mb-2 leading-tight">
                  Sprawy dopasowane do Twoich usług
                </h4>
                <p className="text-base text-neutral-400 font-normal leading-relaxed">
                  Użytkownicy zgłaszają problemy, a Ty możesz na nie odpowiadać.
                </p>
              </div>

            </div>

            {/* Center Devices Mockup Column */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center py-6" id="how-it-works-section">
              <Image src={'/image_4.webp'} alt="mockup" width={1000} height={1000} className="hidden md:block" />
              <div className="relative flex flex-col items-center justify-center hidden">

                {/* Laptop Screen Mockup */}
                <div className="relative w-[280px] sm:w-[380px] md:w-[440px] h-[170px] sm:h-[220px] md:h-[260px] bg-[#161616] rounded-t-xl border-t-[6px] md:border-t-8 border-x-[6px] md:border-x-8 border-[#2b2b2b] shadow-2xl overflow-hidden z-10">
                  {/* Inner content representing homepage */}
                  <div className="absolute inset-0 bg-[#0f0f0e] flex flex-col justify-between p-2 md:p-3 select-none">
                    {/* Header inside mockup */}
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-1.5 text-[5px] md:text-[6px] text-neutral-500">
                      <div className="flex items-center gap-0.5">
                        <div className="w-1 h-1 rounded-full bg-[#0da192]" />
                        <span className="font-semibold text-white text-[6px] md:text-[7px]">prostasprawa</span>
                      </div>
                      <div className="flex gap-1.5">
                        <span>Szukaj</span>
                        <span>Eksperci</span>
                        <span>Mapa</span>
                      </div>
                    </div>
                    {/* Hero Section inside mockup */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-1 md:p-2">
                      <span className="text-[4.5px] md:text-[5px] uppercase tracking-wider text-neutral-500 font-semibold mb-0.5">PROSTA SPRAWA</span>
                      <h4 className="text-[8px] sm:text-[10px] md:text-[11px] font-bold text-white tracking-tight leading-tight max-w-[160px] md:max-w-[200px]">
                        Rozwiązujemy Twoje problemy prawne
                      </h4>
                      <div className="flex gap-1 mt-1.5 md:mt-2">
                        <div className="px-1 md:px-1.5 py-0.5 bg-[#0da192] text-[4.5px] md:text-[5px] text-white rounded font-medium">Znajdź prawnika</div>
                        <div className="px-1 md:px-1.5 py-0.5 border border-[#2d2d2d] text-[4.5px] md:text-[5px] text-neutral-400 rounded font-medium">Dodaj sprawę</div>
                      </div>
                    </div>
                    {/* Footer inside mockup */}
                    <div className="flex items-center justify-between border-t border-neutral-900 pt-1 text-[4px] md:text-[5px] text-neutral-600">
                      <span>© 2026 Prosta Sprawa</span>
                      <span>Stworzone dla prawników</span>
                    </div>
                  </div>
                </div>
                {/* Laptop Base */}
                <div className="relative w-[320px] sm:w-[420px] md:w-[490px] h-[6px] md:h-[8px] bg-[#d1d5db] rounded-b-xl z-20 shadow-lg" />
                <div className="relative w-[60px] md:w-[75px] h-[3px] md:h-[4px] bg-[#9ca3af] rounded-b-md mx-auto z-10" />

                {/* Smartphone Mockup - beautifully positioned overlapping the laptop screen */}
                <div className="absolute bottom-[-15px] left-[10px] sm:left-[30px] md:left-[45px] w-[80px] sm:w-[100px] md:w-[120px] h-[160px] sm:h-[190px] md:h-[230px] bg-[#1a1a1a] rounded-[16px] sm:rounded-[20px] border-[3px] md:border-[4px] border-[#2b2b2b] shadow-2xl overflow-hidden z-30 flex flex-col p-1.5">
                  {/* Inner content representing Lawyer Profile card */}
                  <div className="absolute inset-0 bg-[#161615] flex flex-col p-1.5 select-none justify-between">
                    {/* Profile Header */}
                    <div className="flex items-center gap-1 pb-0.5 border-b border-neutral-950">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[5px] text-[#eab308] font-bold">
                        JN
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[5px] sm:text-[6px] font-bold text-white leading-none">Jan Nowacki</span>
                        <span className="text-[4px] sm:text-[5px] text-neutral-500 mt-0.5">Adwokat</span>
                      </div>
                    </div>
                    {/* Profile Image & Detail Placeholder */}
                    <div className="flex-1 flex flex-col items-center justify-center p-0.5">
                      {/* Stylized Avatar Frame with standard lawyer avatar icon */}
                      <div className="w-9 sm:w-11 h-9 sm:h-11 rounded-full bg-[#222] border border-[#2d2d2d] flex items-center justify-center mb-1 overflow-hidden relative">
                        {/* Detailed SVG Avatar representing the lawyer wearing glasses */}
                        <svg viewBox="0 0 100 100" fill="none" className="w-7 h-7 text-neutral-400">
                          {/* Hair */}
                          <path d="M 25 40 C 25 20, 75 20, 75 40 Z" fill="#3a2a20" />
                          {/* Face */}
                          <circle cx="50" cy="45" r="22" fill="#e8c39e" />
                          {/* Glasses */}
                          <path d="M 38 42 H 48 M 52 42 H 62" stroke="#222" strokeWidth="2.5" />
                          <circle cx="43" cy="42" r="5" stroke="#222" strokeWidth="2" />
                          <circle cx="57" cy="42" r="5" stroke="#222" strokeWidth="2" />
                          {/* Shirt & Body */}
                          <path d="M 25 80 C 25 60, 75 60, 75 80 Z" fill="#1e293b" />
                        </svg>
                      </div>
                      <span className="text-[5px] sm:text-[6px] text-neutral-400 font-medium text-center leading-none">Ocena: 5.0 ★</span>
                    </div>
                    {/* Profile Contact CTA button */}
                    <div className="w-full bg-[#0da192] text-[5px] sm:text-[6px] text-white py-0.5 rounded text-center font-bold">
                      Skontaktuj się
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Steps: 03 & 04 */}
            <div className="lg:col-span-3 flex flex-col gap-6 items-center lg:items-start justify-center">

              {/* Card 03 */}
              <div className="bg-[#141414]/90 border border-neutral-800/60 rounded-lg p-7 hover:border-neutral-700/80 hover:bg-[#1c1c1c] transition-all duration-300 group cursor-pointer shadow-xl max-w-[280px] w-full text-center lg:text-left">
                <span className="text-[28px] font-semibold text-[#0da192] leading-none block mb-2 font-sans">03.</span>
                <h4 className="text-xl font-semibold text-white tracking-wider uppercase mb-2 leading-tight">
                  Składaj oferty i zdobywaj klientów
                </h4>
                <p className="text-base text-neutral-400 font-normal leading-relaxed">
                  Sam decydujesz, które sprawy chcesz obsługiwać.
                </p>
              </div>

              {/* Card 04 */}
              <div className="bg-[#141414]/90 border border-neutral-800/60 rounded-lg p-7 hover:border-neutral-700/80 hover:bg-[#1c1c1c] transition-all duration-300 group cursor-pointer shadow-xl max-w-[280px] w-full text-center lg:text-left">
                <span className="text-[28px] font-semibold text-[#0da192] leading-none block mb-2 font-sans">04.</span>
                <h4 className="text-xl font-semibold text-white tracking-wider uppercase mb-2 leading-tight">
                  Zarabiaj i zbuduj swoją markę
                </h4>
                <p className="text-base text-neutral-400 font-normal leading-relaxed">
                  Otrzymuj wynagrodzenie, zdobywaj opinie, zwiększaj swoją widoczność.
                </p>
              </div>

            </div>

          </div>

          {/* Center Action Button */}
          <button
            onClick={() => router.push("/o-nas")}
            className="bg-[#0da192] hover:bg-[#00897b] text-white font-medium py-3.5 px-10 rounded-md transition-all duration-200 text-sm flex items-center justify-center hover:scale-[1.01] active:scale-[0.99] shadow-lg cursor-pointer w-full max-w-[240px] z-10"
          >
            Sprawdź jak to działa
          </button>
        </div>
      </section>

      {/* SECTION 5: Dlaczego warto? */}
      <section className="relative bg-[#121212] border-t border-neutral-900 flex flex-col justify-center items-center py-24 px-4 overflow-hidden">
        {/* Cinematic Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-gradient-to-b from-neutral-800/5 to-transparent blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#0da192]/5 blur-[120px] rounded-full pointer-events-none z-0" />

        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
          <Image
            src="/oh_why.png"
            alt="Background Graph"
            fill
            className="object-cover object-center"
          />
        </div>

        <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
          {/* Section Header */}
          <p className="text-base font-semibold uppercase tracking-[0.25em] text-neutral-500 mb-3 text-center">
            PROSTA SPRAWA
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight text-center leading-tight mb-4 max-w-2xl font-sans">
            Dlaczego warto?
          </h2>
          <p className="text-base text-neutral-400 font-normal leading-relaxed text-center mb-20 max-w-xl mx-auto">
            Dodaj swoją sprawę bez zbędnych formalności, czekaj na oferty i wybierz tę, która najlepiej odpowiada Twoim potrzebom.
          </p>

          {/* 4 Feature Columns */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">

            {/* Column 1: Nowi Klienci */}
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="transition-transform duration-300 group-hover:scale-105">
                <UserPlusOutlineIcon />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3 tracking-wide leading-snug">
                Nowi klienci bez inwestycji w reklamę
              </h3>
              <p className="text-base text-neutral-500 font-normal leading-relaxed group-hover:text-neutral-400 transition-colors duration-300">
                Użytkownicy sami zgłaszają sprawy.
              </p>
            </div>

            {/* Column 2: Elastyczność */}
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="transition-transform duration-300 group-hover:scale-105">
                <CalendarCheckIcon />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3 tracking-wide leading-snug">
                Elastyczność przy wyborze zleceń
              </h3>
              <p className="text-base text-neutral-500 font-normal leading-relaxed group-hover:text-neutral-400 transition-colors duration-300">
                Wybierasz tylko te zlecenia, które Ci odpowiadają.
              </p>
            </div>

            {/* Column 3: Wizerunek */}
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="transition-transform duration-300 group-hover:scale-105">
                <GraphUpIcon />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3 tracking-wide leading-snug">
                Budowanie wizerunku eksperta
              </h3>
              <p className="text-base text-neutral-500 font-normal leading-relaxed group-hover:text-neutral-400 transition-colors duration-300">
                Zbieraj opinie i publikuj artykuły aby zwiększyć swoją rozpoznawalność.
              </p>
            </div>

            {/* Column 4: Rozliczenia */}
            <div className="flex flex-col items-center text-center group cursor-pointer">
              <div className="transition-transform duration-300 group-hover:scale-105">
                <SafePaymentIcon />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3 tracking-wide leading-snug">
                Proste i bezpieczne rozliczenia
              </h3>
              <p className="text-base text-neutral-500 font-normal leading-relaxed group-hover:text-neutral-400 transition-colors duration-300">
                Pieniądze trafiają do Ciebie po akceptacji oferty przez klienta.
              </p>
            </div>

          </div>

          {/* Bottom Action Footer Area */}
          <div className="w-full flex flex-col items-center justify-center border-t border-neutral-900/60 pt-16 z-10">
            <h3 className="text-lg md:text-xl font-medium text-white text-center mb-8 tracking-wide">
              Zarejestruj się i zacznij zdobywać nowych klientów już dziś!
            </h3>

            <button
              onClick={() => router.push("/rejestracja/kancelaria")}
              className="bg-[#0da192] hover:bg-[#00897b] text-white font-medium py-3.5 px-16 rounded-md transition-all duration-200 text-sm flex items-center justify-center hover:scale-[1.01] active:scale-[0.99] shadow-lg cursor-pointer w-full max-w-[260px]"
            >
              Zarejestruj się
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 6: Szukasz klientów? & Bądź na bieżąco */}
      <section className="relative bg-[#0f0f0f] border-t border-neutral-900 flex flex-col justify-center items-center py-20 px-4 md:px-8 overflow-hidden">
        {/* Ambient premium glows */}
        <div className="absolute top-0 left-1/4 w-[350px] h-[350px] bg-[#0da192]/5 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-[#0da192]/3 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
          {/* Top Centered Header Content */}
          <div className="text-center max-w-4xl mb-20">
            <h3 className="text-white text-[15px] md:text-[17px] font-bold tracking-wide mb-5">
              Szukasz klientów? Dołącz do sprawdzonego rozwiązania.
            </h3>
            <p className="text-xs md:text-sm text-neutral-400 leading-relaxed font-light font-sans max-w-4xl mx-auto">
              Na prostasprawa.pl klienci prywatni i firmy każdego dnia zgłaszają sprawy, w których potrzebują profesjonalnej pomocy. Jako prawnik, doradca lub księgowy możesz szybko i wygodnie pozyskiwać nowe zlecenia bez inwestycji w reklamę. Zarejestruj się, uzupełnij profil i zacznij otrzymywać sprawy dopasowane do Twojej specjalizacji. Odpowiadasz tylko na te zapytania, które Cię interesują – pełna kontrola, realne zlecenia, nowi klienci.
            </p>
          </div>

          {/* Two Column Section Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-12 items-start relative">
            
            {/* Left Column: Masz pytania? */}
            <div className="flex flex-col space-y-6 md:pr-16 md:border-r md:border-neutral-800/60 h-full">
              <h2 className="text-4xl md:text-[44px] font-normal text-white font-playfair tracking-wide leading-tight">
                Masz pytania?
              </h2>
              <div className="text-xs md:text-[13px] text-neutral-400 space-y-1.5 font-light leading-relaxed">
                <p>Chętnie pomożemy na każdym etapie współpracy.</p>
                <p>Jesteśmy dostępni od poniedziałku do piątku od 9:00 - 22:00.</p>
              </div>

              {/* Contact Icons Row */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-6">
                {/* Phone Link */}
                <a 
                  href="tel:+48534888555" 
                  className="flex items-center gap-3 text-white hover:text-[#0da192] transition-all duration-300 group font-sans text-xs md:text-sm font-semibold"
                >
                  <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#0da192] group-hover:bg-[#0da192] group-hover:text-white group-hover:border-[#0da192] transition-all duration-300">
                    <Phone className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <span>+48 534 888 555</span>
                </a>

                {/* Email Link */}
                <a 
                  href="mailto:kontakt@prostasprawa.pl" 
                  className="flex items-center gap-3 text-white hover:text-[#0da192] transition-all duration-300 group font-sans text-xs md:text-sm font-semibold"
                >
                  <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#0da192] group-hover:bg-[#0da192] group-hover:text-white group-hover:border-[#0da192] transition-all duration-300">
                    <Mail className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <span>kontakt@prostasprawa.pl</span>
                </a>
              </div>
            </div>

            {/* Right Column: Bądź na bieżąco */}
            <div className="flex flex-col space-y-6 md:pl-4">
              <h2 className="text-4xl md:text-[44px] font-normal text-white font-playfair tracking-wide leading-tight">
                Bądź na bieżąco
              </h2>
              <p className="text-xs md:text-[13px] text-neutral-400 font-light leading-relaxed">
                Otrzymuj informacje o nowych rozwiązaniach dla firm i ekspertów.
              </p>

              {/* Newsletter Form */}
              <form onSubmit={handleNewsletterSubmit} className="space-y-5 w-full">
                {/* Input with inline submit button */}
                <div className="relative flex items-center bg-[#1c1c1c] border border-neutral-800 rounded-md px-4 py-3.5 focus-within:border-[#0da192] focus-within:ring-1 focus-within:ring-[#0da192]/20 transition-all duration-200 shadow-inner">
                  <input
                    type="email"
                    required
                    placeholder="Twój e-mail"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="bg-transparent text-white outline-none flex-1 placeholder-neutral-600 text-xs md:text-sm w-full pr-4"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-[#0da192] hover:text-[#00897b] text-xs md:text-sm font-semibold tracking-wide transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Zapisywanie..." : "Zapisz się"}
                  </button>
                </div>

                {/* Consent checkbox / privacy policy link */}
                <div className="flex items-start gap-3 pt-1">
                  <div className="relative flex items-center h-5">
                    <input
                      id="newsletter-consent"
                      type="checkbox"
                      required
                      checked={newsletterConsent}
                      onChange={(e) => setNewsletterConsent(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-800 bg-[#1c1c1c] text-[#0da192] focus:ring-[#0da192] accent-[#0da192] cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label 
                      htmlFor="newsletter-consent" 
                      className="text-[10px] md:text-xs text-neutral-500 font-light leading-relaxed select-none cursor-pointer"
                    >
                      Wyrażam zgodę na otrzymywanie maili marketingowo-handlowych od Grupy Pracuj S.A.
                    </label>
                    <a 
                      href="/polityka-prywatnosci" 
                      target="_blank"
                      className="text-[10px] md:text-xs text-[#0da192] hover:underline hover:text-[#00897b] transition-colors duration-150 inline-block w-fit font-medium"
                    >
                      Polityka prywatności
                    </a>
                  </div>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
