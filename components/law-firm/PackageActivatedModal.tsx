/**
 * Komponent PackageActivatedModal
 *
 * Wyświetla się natychmiast po zakupie pakietu subskrypcji
 * w panelu eksperta (panel-eksperta/pakiet), z treścią
 * dopasowaną do aktywowanego pakietu.
 */

"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Gift,
  Globe,
  Infinity as InfinityIcon,
  MapPin,
  Megaphone,
  Newspaper,
  Package,
  Sparkles,
  Star,
  Tags,
  TrendingUp,
  UserCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

interface PackageActivatedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planTyp: string;
  planNazwa: string;
  punktyGratis?: number;
  dataPakietuDo?: string | Date | null;
}

interface BenefitItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface PackageContent {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  benefitsHeader: string;
  benefits: BenefitItem[];
  ctaLabel: string;
  // Klasy kolorystyczne (pełne literały — wymagane przez Tailwind)
  dialogBorder: string;
  iconGradient: string;
  accentText: string;
  benefitIconColor: string;
  ctaClass: string;
}

const PACKAGE_CONTENT: Record<string, PackageContent> = {
  PODSTAWOWY: {
    icon: Package,
    title: "Pakiet Podstawowy Aktywowany!",
    description: (
      <>
        Dziękujemy za zakup! Twój profil jest już widoczny w katalogu, a Ty masz{" "}
        <span className="text-emerald-400 font-semibold">bezpośredni dostęp do nowych spraw od klientów</span>.
      </>
    ),
    benefitsHeader: "Co zyskujesz dzięki pakietowi Podstawowemu:",
    benefits: [
      {
        icon: Briefcase,
        title: "Dostęp do 10 spraw miesięcznie",
        description: "Przeglądaj zlecenia klientów i odpowiadaj na te, które pasują do Twojej specjalizacji.",
      },
      {
        icon: MapPin,
        title: "Zasięg: 1 województwo i 15 miast",
        description: "Docieraj do klientów w wybranym regionie swojej działalności.",
      },
      {
        icon: Bell,
        title: "Powiadomienia o 3 sprawach / mies.",
        description: "Nie przegapisz nowych zleceń dopasowanych do Twojego profilu.",
      },
      {
        icon: UserCheck,
        title: "Osobisty opiekun klienta",
        description: "Podstawowe wsparcie naszego zespołu na start Twojej obecności w katalogu.",
      },
    ],
    ctaLabel: "Zaczynam korzystać z pakietu",
    dialogBorder: "border border-emerald-500/20 shadow-emerald-500/5",
    iconGradient: "bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-emerald-500/20",
    accentText: "text-emerald-400",
    benefitIconColor: "text-emerald-400",
    ctaClass:
      "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-zinc-950 shadow-emerald-500/10 hover:shadow-emerald-500/20",
  },
  STANDARD: {
    icon: TrendingUp,
    title: "Pakiet Standard Aktywowany!",
    description: (
      <>
        Świetny wybór! Od teraz zyskujesz{" "}
        <span className="text-blue-400 font-semibold">większy limit spraw i lepsze pozycjonowanie</span> swojego
        profilu w katalogu.
      </>
    ),
    benefitsHeader: "Co zyskujesz dzięki pakietowi Standard:",
    benefits: [
      {
        icon: Briefcase,
        title: "Dostęp do 20 spraw miesięcznie",
        description: "Dwukrotnie większy limit zleceń — więcej okazji na pozyskanie nowych klientów.",
      },
      {
        icon: MapPin,
        title: "Zasięg: 2 województwa i 15 miast",
        description: "Poszerz obszar działania i docieraj do klientów z sąsiednich regionów.",
      },
      {
        icon: Tags,
        title: "Większy limit tagów (4 tagi)",
        description: "Lepsze dopasowanie Twojego profilu w wynikach wyszukiwania.",
      },
      {
        icon: Bell,
        title: "Powiadomienia o 4 sprawach / mies.",
        description: "Bądź na bieżąco z nowymi zleceniami w swoich specjalizacjach.",
      },
    ],
    ctaLabel: "Zaczynam korzystać z pakietu",
    dialogBorder: "border border-blue-500/20 shadow-blue-500/5",
    iconGradient: "bg-gradient-to-tr from-blue-500 to-sky-400 shadow-blue-500/20",
    accentText: "text-blue-400",
    benefitIconColor: "text-blue-400",
    ctaClass:
      "bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-600 hover:to-sky-500 text-zinc-950 shadow-blue-500/10 hover:shadow-blue-500/20",
  },
  PREMIUM: {
    icon: Star,
    title: "Pakiet Premium Aktywowany!",
    description: (
      <>
        Gratulacje! Właśnie odblokowałeś{" "}
        <span className="text-purple-400 font-semibold">dostęp do spraw bez limitu i wysoką widoczność</span> swojego
        profilu.
      </>
    ),
    benefitsHeader: "Co zyskujesz dzięki pakietowi Premium:",
    benefits: [
      {
        icon: InfinityIcon,
        title: "Dostęp do spraw bez limitu",
        description: "Odpowiadaj na dowolną liczbę zleceń klientów — bez miesięcznych ograniczeń.",
      },
      {
        icon: Megaphone,
        title: "Promowanie profilu na głównej",
        description: "Twój profil będzie eksponowany na stronie głównej serwisu.",
      },
      {
        icon: Newspaper,
        title: "Artykuły sponsorowane",
        description: "Publikuj treści eksperckie i buduj rozpoznawalność swojej marki.",
      },
      {
        icon: BarChart3,
        title: "Pełne statystyki i analizy",
        description: "Śledź skuteczność profilu i podejmuj decyzje w oparciu o dane.",
      },
    ],
    ctaLabel: "Zaczynam korzystać z pakietu",
    dialogBorder: "border border-purple-500/20 shadow-purple-500/5",
    iconGradient: "bg-gradient-to-tr from-purple-500 to-fuchsia-400 shadow-purple-500/20",
    accentText: "text-purple-400",
    benefitIconColor: "text-purple-400",
    ctaClass:
      "bg-gradient-to-r from-purple-500 to-fuchsia-400 hover:from-purple-600 hover:to-fuchsia-500 text-white shadow-purple-500/10 hover:shadow-purple-500/20",
  },
  BIZNES: {
    icon: Zap,
    title: "Pakiet Biznes VIP Aktywowany!",
    description: (
      <>
        Witamy w gronie VIP! Twój profil otrzymał właśnie{" "}
        <span className="text-amber-400 font-semibold">najwyższy pakiet z pełnym zestawem narzędzi premium</span>.
      </>
    ),
    benefitsHeader: "Co zyskujesz dzięki pakietowi Biznes:",
    benefits: [
      {
        icon: CheckCircle2,
        title: "Zlecenia i kategorie bez limitu",
        description: "Dostęp do wszystkich spraw i nieograniczona liczba specjalizacji.",
      },
      {
        icon: Award,
        title: 'Wyróżnienie VIP "Skill Law Focus"',
        description: "Twój profil otrzyma unikalną odznakę i będzie promowany na szczycie list.",
      },
      {
        icon: Globe,
        title: "Maksymalny zasięg działania",
        description: "Możliwość pozyskiwania klientów z 6 województw oraz 35 miast.",
      },
      {
        icon: BookOpen,
        title: "Własny Blog Ekspercki",
        description: "Publikuj artykuły i buduj pozycję lidera w swojej dziedzinie prawa.",
      },
    ],
    ctaLabel: "Zaczynamy korzystać z konta VIP",
    dialogBorder: "border border-amber-500/20 shadow-amber-500/5",
    iconGradient: "bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-amber-500/20",
    accentText: "text-amber-400",
    benefitIconColor: "text-amber-400",
    ctaClass:
      "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-zinc-950 shadow-amber-500/10 hover:shadow-amber-500/20",
  },
};

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export function PackageActivatedModal({
  open,
  onOpenChange,
  planTyp,
  planNazwa,
  punktyGratis = 0,
  dataPakietuDo,
}: PackageActivatedModalProps) {
  const content = PACKAGE_CONTENT[planTyp.toUpperCase()];

  if (!content) return null;

  const HeaderIcon = content.icon;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={`max-w-2xl bg-zinc-950 p-6 shadow-2xl backdrop-blur-xl md:p-8 text-white ${content.dialogBorder}`}
      >
        <AlertDialogHeader className="space-y-4">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ${content.iconGradient}`}
          >
            <HeaderIcon className="h-8 w-8 text-zinc-950 fill-zinc-950 animate-bounce" />
          </div>

          <AlertDialogTitle className="text-center text-2xl font-bold tracking-tight text-white md:text-3xl font-playfair">
            {content.title}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-sm text-zinc-400 md:text-base max-w-lg mx-auto">
            {content.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Korzyści pakietu */}
        <div className="my-6 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 md:p-6">
          <h4
            className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${content.accentText}`}
          >
            <Sparkles className="h-4 w-4" /> {content.benefitsHeader}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {content.benefits.map((benefit) => {
              const BenefitIcon = benefit.icon;
              return (
                <div key={benefit.title} className="flex gap-3">
                  <BenefitIcon className={`h-5 w-5 shrink-0 mt-0.5 ${content.benefitIconColor}`} />
                  <div>
                    <h5 className="font-semibold text-sm text-zinc-200">{benefit.title}</h5>
                    <p className="text-xs text-zinc-400 mt-1">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {punktyGratis > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5">
              <Gift className={`h-4 w-4 shrink-0 ${content.accentText}`} />
              <span className="text-xs text-zinc-300">
                Na Twoje saldo trafiło już{" "}
                <strong className={content.accentText}>+{punktyGratis} punktów gratis</strong>!
              </span>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-zinc-800 text-center text-xs text-zinc-500">
            Pakiet {planNazwa} został aktywowany na Twoim profilu
            {dataPakietuDo ? (
              <>
                {" "}i pozostanie ważny do <strong className="text-zinc-300">{formatDate(dataPakietuDo)}</strong>.
              </>
            ) : (
              "."
            )}
          </div>
        </div>

        <AlertDialogFooter className="pt-2">
          <Button
            className={`w-full font-bold py-6 rounded-xl shadow-lg transition-all text-base ${content.ctaClass}`}
            onClick={() => onOpenChange(false)}
          >
            {content.ctaLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
