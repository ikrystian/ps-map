"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { BorderBeam } from "@/components/ui/border-beam"
import { cn } from "@/lib/utils"
import { scrollToAndHighlight } from "@/lib/scroll-highlight"
import { useEffect, useRef, useState } from "react"
import {
  Gauge,
  User,
  MapPin,
  Award,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface ProfileScoreData {
  // Dane podstawowe
  nazwa: string
  opis: string
  logo: string
  zdjecieGlowne: string
  oirpStatus: boolean
  oirpMiasto: string
  oirpWpis: string
  oraStatus: boolean
  oraMiasto: string
  oraWpis: string
  // Kontakt i obszar
  imieKontakt: string
  nazwiskoKontakt: string
  emailKontakt?: string
  numerTelefonu: string
  stronaWww: string
  adres: string
  kodPocztowy: string
  miasto: string
  linkLinkedIn: string
  linkFacebook: string
  linkInstagram: string
  linkTwitter: string
  linkTikTok: string
  calaPolska: boolean
  onlineOnly: boolean
  voivodeshipsIds: string[]
  citiesIds: string[]
  // Oferta i zakres
  categoriesIds: string[]
  unikatowyOpisUslugi: string
  slowaKluczowe: string[]
  // Multimedia
  galeriaZdjec: string[]
  filmYouTube: string
  // Godziny
  statusGodzinyOtwarcia: boolean
  godzinyOtwarcia: Record<string, string>
}

interface ProfileScoreCardProps {
  formData: ProfileScoreData
  onNavigate: (tab: string) => void
}

interface ScoreField {
  id: string
  label: string
  description: string
  weight: number
  done: boolean
}

interface ScoreGroup {
  tab: string
  title: string
  icon: LucideIcon
  fields: ScoreField[]
}

// Usuwa znaczniki HTML z edytora rich-text, aby ocenić realną długość tekstu
const plainText = (html: string) =>
  (html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim()

function getTier(score: number) {
  if (score >= 95)
    return {
      label: "Kompletny",
      text: "text-emerald-400",
      bar: "bg-gradient-to-r from-emerald-500 to-green-400",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    }
  if (score >= 80)
    return {
      label: "Bardzo dobry",
      text: "text-lime-400",
      bar: "bg-gradient-to-r from-lime-500 to-emerald-400",
      badge: "bg-lime-500/10 text-lime-400 border-lime-500/30",
    }
  if (score >= 60)
    return {
      label: "Dobry",
      text: "text-yellow-400",
      bar: "bg-gradient-to-r from-yellow-500 to-lime-400",
      badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    }
  if (score >= 40)
    return {
      label: "Podstawowy",
      text: "text-amber-400",
      bar: "bg-gradient-to-r from-amber-500 to-yellow-400",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    }
  return {
    label: "Wymaga uzupełnienia",
    text: "text-rose-400",
    bar: "bg-gradient-to-r from-rose-500 to-orange-400",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  }
}

export function ProfileScoreCard({ formData, onNavigate }: ProfileScoreCardProps) {
  const router = useRouter()
  const socialFilled = [
    formData.linkLinkedIn,
    formData.linkFacebook,
    formData.linkInstagram,
    formData.linkTwitter,
    formData.linkTikTok,
  ].some((link) => !!link?.trim())

  const registryFilled =
    (formData.oirpStatus && !!formData.oirpMiasto?.trim() && !!formData.oirpWpis?.trim()) ||
    (formData.oraStatus && !!formData.oraMiasto?.trim() && !!formData.oraWpis?.trim())

  const areaFilled =
    formData.calaPolska ||
    formData.onlineOnly ||
    formData.voivodeshipsIds.length > 0 ||
    formData.citiesIds.length > 0

  const hoursFilled =
    formData.statusGodzinyOtwarcia &&
    Object.values(formData.godzinyOtwarcia || {}).some((v) => !!v?.trim())

  const groups: ScoreGroup[] = [
    {
      tab: "basic",
      title: "Dane podstawowe",
      icon: User,
      fields: [
        {
          id: "nazwa",
          label: "Nazwa wyświetlana",
          description:
            "Nazwa prezentowana w wynikach wyszukiwania i w nagłówku profilu. To pierwszy element, który widzi potencjalny klient.",
          weight: 16,
          done: !!formData.nazwa?.trim(),
        },

        {
          id: "opis",
          label: "Opis profilu",
          description:
            "Rozbudowany opis doświadczenia i świadczonych usług (min. 40 znaków). Kluczowy dla pozycjonowania (SEO) i decyzji klienta o kontakcie.",
          weight: 12,
          done: plainText(formData.opis).length >= 40,
        },
        {
          id: "logo",
          label: "Zdjęcie profilowe (avatar)",
          description:
            "Zdjęcie widoczne na liście wyników wyszukiwania. Profile ze zdjęciem otrzymują znacznie więcej zapytań od klientów.",
          weight: 12,
          done: !!formData.logo,
        },
        {
          id: "zdjecieGlowne",
          label: "Zdjęcie główne (banner)",
          description:
            "Panoramiczny nagłówek profilu, który wyróżnia Cię wizualnie. Dostępny w wyższych pakietach abonamentowych.",
          weight: 5,
          done: !!formData.zdjecieGlowne,
        },
        {
          id: "rejestry",
          label: "Wpis do rejestru zawodowego",
          description:
            "Potwierdzenie wpisu OIRP (radca prawny) lub ORA (adwokat) wraz z miastem izby i numerem wpisu. Znacząco zwiększa zaufanie i wiarygodność.",
          weight: 6,
          done: registryFilled,
        },
      ],
    },
    {
      tab: "contact",
      title: "Kontakt",
      icon: MapPin,
      fields: [
        {
          id: "osobaKontaktowa",
          label: "Osoba kontaktowa",
          description:
            "Imię i nazwisko przedstawiciela profilu. Personalizuje kontakt i zwiększa zaufanie klienta jeszcze przed rozmową.",
          weight: 6,
          done: !!formData.imieKontakt?.trim() && !!formData.nazwiskoKontakt?.trim(),
        },
        {
          id: "telefon",
          label: "Telefon główny",
          description:
            "Podstawowy numer kontaktowy. Bez niego klient nie zadzwoni do Ciebie bezpośrednio z poziomu profilu.",
          weight: 6,
          done: !!formData.numerTelefonu?.trim(),
        },
        {
          id: "email",
          label: "Adres e-mail",
          description:
            "Adres do korespondencji z klientami oraz do powiadomień o nowych zapytaniach i sprawach.",
          weight: 4,
          done: !!formData.emailKontakt?.trim(),
        },
        {
          id: "adres",
          label: "Adre",
          description:
            "Ulica, kod pocztowy i miasto.",
          weight: 8,
          done:
            !!formData.adres?.trim() && !!formData.kodPocztowy?.trim() && !!formData.miasto?.trim(),
        },
        {
          id: "stronaWww",
          label: "Strona WWW",
          description:
            "Link do Twojej strony internetowej. Dodatkowe źródło informacji o usługach i kolejny kanał kontaktu.",
          weight: 4,
          done: !!formData.stronaWww?.trim(),
        },
        {
          id: "social",
          label: "Profile społecznościowe",
          description:
            "Co najmniej jeden link (LinkedIn, Facebook, Instagram, X lub TikTok). Wzmacnia Twoją obecność w sieci i wiarygodność.",
          weight: 4,
          done: socialFilled,
        },
        {
          id: "obszar",
          label: "Obszar świadczenia usług",
          description:
            "Wybrane województwa i miasta albo tryb pracy – cała Polska lub wyłącznie online. Decyduje, którym klientom się wyświetlasz.",
          weight: 6,
          done: areaFilled,
        },
      ],
    },
    {
      tab: "specialization",
      title: "Oferta i zakres",
      icon: Award,
      fields: [
        {
          id: "kategorie",
          label: "Specjalizacje (kategorie)",
          description:
            "Dziedziny prawa, w których działasz. Bez nich nie pojawisz się w wynikach filtrowanych po specjalizacji.",
          weight: 12,
          done: formData.categoriesIds.length > 0,
        },
        {
          id: "unikatowyOpis",
          label: "Unikalny opis usługi",
          description:
            "Opis wyróżniający Twoją ofertę (min. 30 znaków), prezentowany w sekcji „Zakres usług” na profilu publicznym.",
          weight: 6,
          done: (formData.unikatowyOpisUslugi || "").trim().length >= 30,
        },
        {
          id: "slowaKluczowe",
          label: "Słowa kluczowe",
          description:
            "Frazy, po których klienci mogą Cię odnaleźć w wyszukiwarce. Poprawiają trafność i widoczność profilu.",
          weight: 5,
          done: formData.slowaKluczowe.length > 0,
        },
      ],
    },
    {
      tab: "multimedia",
      title: "Galeria i wideo",
      icon: ImageIcon,
      fields: [
        {
          id: "galeria",
          label: "Galeria zdjęć",
          description:
            "Zdjęcia prezentujące biuro i Twoją działalność. Budują profesjonalny wizerunek i zwiększają zaufanie.",
          weight: 6,
          done: formData.galeriaZdjec.length > 0,
        },
        {
          id: "film",
          label: "Prezentacja wideo",
          description:
            "Film z YouTube przedstawiający Ciebie lub kancelarię. Zwiększa zaangażowanie odwiedzających profil.",
          weight: 3,
          done: !!formData.filmYouTube?.trim(),
        },
      ],
    },
    {
      tab: "consultations",
      title: "Godziny i dostępność",
      icon: Clock,
      fields: [
        {
          id: "godziny",
          label: "Godziny otwarcia",
          description:
            "Włączone i uzupełnione godziny pracy biura. Informują klientów, kiedy jesteś dla nich dostępny.",
          weight: 5,
          done: hoursFilled,
        },
      ],
    },
  ]

  const allFields = groups.flatMap((g) => g.fields)
  const totalWeight = allFields.reduce((sum, f) => sum + f.weight, 0)
  const earnedWeight = allFields.reduce((sum, f) => sum + (f.done ? f.weight : 0), 0)
  const score = Math.round((earnedWeight / totalWeight) * 100)
  const completedCount = allFields.filter((f) => f.done).length
  const tier = getTier(score)

  const impactOf = (weight: number) => Math.round((weight / totalWeight) * 100)

  // Liczba oceny płynnie animuje się przy każdej zmianie pól, których dotyczy ocena
  const displayRef = useRef(score)
  const [displayScore, setDisplayScore] = useState(score)
  useEffect(() => {
    const from = displayRef.current
    const to = score
    if (from === to) return
    const start = performance.now()
    let raf = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 500)
      const eased = 1 - Math.pow(1 - t, 3)
      const val = Math.round(from + (to - from) * eased)
      displayRef.current = val
      setDisplayScore(val)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [score])

  return (
    <Card className="border border-border/30 bg-card/25 backdrop-blur-md rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300">
      <BorderBeam lightColor="var(--primary)" lightWidth={400} duration={8} borderWidth={1} />
      <CardHeader className="border-b border-border/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl text-white font-playfair">Ocena profilu</CardTitle>
            <CardDescription className="text-zinc-400 text-sm">
              Kompletność profilu liczona na podstawie danych uzupełnionych we wszystkich zakładkach
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Podsumowanie wyniku */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex items-baseline gap-2 shrink-0">
            <span className={cn("text-5xl font-bold tabular-nums transition-colors duration-500", tier.text)}>
              {displayScore}
            </span>
            <span className="text-xl text-zinc-500 font-light">%</span>
          </div>
          <div className="flex-1 space-y-2 w-full">
            <div className="flex items-center justify-between gap-3">
              <span
                className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border",
                  tier.badge
                )}
              >
                {tier.label}
              </span>
              <span className="text-xs text-zinc-400 font-light">
                Uzupełniono{" "}
                <span className="font-semibold text-white">{completedCount}</span> z{" "}
                <span className="font-semibold text-white">{allFields.length}</span> elementów
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-zinc-800/60 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", tier.bar)}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Szczegóły: co wpływa na ocenę */}
        <Accordion
          type="multiple"
          defaultValue={groups.map((g) => g.tab)}
          className="space-y-3"
        >
          {groups.map((group) => {
            const groupDone = group.fields.filter((f) => f.done).length
            const GroupIcon = group.icon
            return (
              <AccordionItem
                key={group.tab}
                value={group.tab}
                className="border border-border/20 rounded-xl bg-zinc-950/10 px-4 overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline py-3.5">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="bg-primary/10 p-1.5 rounded-lg text-primary shrink-0">
                      <GroupIcon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-white truncate">{group.title}</span>
                    <span
                      className={cn(
                        "ml-auto mr-3 text-xs font-semibold tabular-nums shrink-0",
                        groupDone === group.fields.length ? "text-emerald-400" : "text-zinc-400"
                      )}
                    >
                      {groupDone}/{group.fields.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-0">
                  <div className="space-y-2">
                    {group.fields.map((field) => (
                      <button
                        key={field.id}
                        type="button"
                        onClick={() => {
                          if (field.id === "obszar") {
                            // Sekcja „Obszar działania" mieszka na innej stronie —
                            // parametr podswietl uruchamia tam akcent po wczytaniu
                            router.push("/panel-eksperta/zakres-uslug?podswietl=obszar")
                          } else {
                            onNavigate(group.tab)
                            scrollToAndHighlight(`[data-score-target="${field.id}"]`)
                          }
                        }}
                        className={cn(
                          "w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 group",
                          field.done
                            ? "border-border/15 bg-zinc-950/20"
                            : "border-border/20 bg-zinc-950/10 hover:bg-zinc-800/20 hover:border-primary/30"
                        )}
                      >
                        <span className="shrink-0 mt-0.5">
                          {field.done ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Circle className="h-4 w-4 text-zinc-600" />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={cn(
                                "text-sm font-medium",
                                field.done ? "text-zinc-200" : "text-white"
                              )}
                            >
                              {field.label}
                            </span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                              +{impactOf(field.weight)}%
                            </span>
                            {!field.done && (
                              <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                Uzupełnij <ArrowRight className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 font-light leading-relaxed mt-1">
                            {field.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  )
}
