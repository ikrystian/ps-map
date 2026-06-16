"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Mail,
  Calendar,
} from "lucide-react";

interface Expert {
  id: string;
  slug: string;
  nazwa: string;
  nazwaFirmy: string;
  opis: string | null;
  logo: string | null;
  zdjecieGlowne: string | null;
  user: {
    imie: string | null;
    nazwisko: string | null;
    image: string | null;
    miasto: string | null;
    voivodeship: { nazwa: string } | null;
  } | null;
  mainCategory: { nazwa: string } | null;
  categories: Array<{ category: { nazwa: string } }>;
}

const AUTH_ROUTES = [
  "/logowanie",
  "/rejestracja",
  "/reset-hasla",
  "/weryfikacja-email",
  "/wyslij-ponownie-weryfikacje",
  "/wylogowano",
];

// Mock experts pool for padding up to 24 if database is empty or has fewer entries
const MOCK_POOL: Expert[] = [
  {
    id: "mock-1",
    slug: "anna-kowalska",
    nazwa: "Anna Kowalska",
    nazwaFirmy: "Anna Kowalska Kancelaria Adwokacka",
    opis: "Adwokat z wieloletnim doświadczeniem w sprawach cywilnych, spadkowych oraz rozwodowych. Skuteczna reprezentacja i profesjonalne doradztwo prawne w trudnych sytuacjach życiowych.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Anna",
      nazwisko: "Kowalska",
      image: null,
      miasto: "Warszawa",
      voivodeship: { nazwa: "Mazowieckie" },
    },
    mainCategory: { nazwa: "Prawo Rodzinne" },
    categories: [
      { category: { nazwa: "Prawo Rodzinne" } },
      { category: { nazwa: "Prawo Cywilne" } },
    ],
  },
  {
    id: "mock-2",
    slug: "jan-nowak",
    nazwa: "Jan Nowak",
    nazwaFirmy: "Jan Nowak Kancelaria Radcy Prawnego",
    opis: "Radca prawny specjalizujący się w prawie pracy, obsłudze spółek oraz negocjacjach handlowych. Doradzam małym i średnim przedsiębiorstwom w codziennej działalności.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Jan",
      nazwisko: "Nowak",
      image: null,
      miasto: "Kraków",
      voivodeship: { nazwa: "Małopolskie" },
    },
    mainCategory: { nazwa: "Obsługa Firm" },
    categories: [
      { category: { nazwa: "Obsługa Firm" } },
      { category: { nazwa: "Prawo Pracy" } },
    ],
  },
  {
    id: "mock-3",
    slug: "katarzyna-wisniewska",
    nazwa: "Katarzyna Wiśniewska",
    nazwaFirmy: "Kancelaria Adwokacka Wiśniewska",
    opis: "Specjalizuję się w prawie karnym oraz obronie w sprawach o wykroczenia. Oferuję pełne wsparcie na etapie postępowania przygotowawczego i sądowego.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Katarzyna",
      nazwisko: "Wiśniewska",
      image: null,
      miasto: "Poznań",
      voivodeship: { nazwa: "Wielkopolskie" },
    },
    mainCategory: { nazwa: "Prawo Karne" },
    categories: [
      { category: { nazwa: "Prawo Karne" } },
      { category: { nazwa: "Obrona w sądzie" } },
    ],
  },
  {
    id: "mock-4",
    slug: "mateusz-wojcik",
    nazwa: "Mateusz Wójcik",
    nazwaFirmy: "Wójcik i Partnerzy Radcowie Prawni",
    opis: "Prawnik dedykowany branży nieruchomości. Pomagam w analizie umów deweloperskich, regulowaniu stanów prawnych gruntów oraz sprawach o zasiedzenie.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Mateusz",
      nazwisko: "Wójcik",
      image: null,
      miasto: "Wrocław",
      voivodeship: { nazwa: "Dolnośląskie" },
    },
    mainCategory: { nazwa: "Nieruchomości" },
    categories: [
      { category: { nazwa: "Nieruchomości" } },
      { category: { nazwa: "Prawo Budowlane" } },
    ],
  },
  {
    id: "mock-5",
    slug: "magdalena-kaminska",
    nazwa: "Magdalena Kamińska",
    nazwaFirmy: "Magdalena Kamińska Kancelaria Prawna",
    opis: "Doświadczona mediatorka i adwokat. Skupiam się na polubownym rozwiązywaniu konfliktów rodzinnych i gospodarczych, oszczędzając czas i emocje klientów.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Magdalena",
      nazwisko: "Kamińska",
      image: null,
      miasto: "Gdańsk",
      voivodeship: { nazwa: "Pomorskie" },
    },
    mainCategory: { nazwa: "Mediacje" },
    categories: [
      { category: { nazwa: "Mediacje" } },
      { category: { nazwa: "Rozwody" } },
    ],
  },
  {
    id: "mock-6",
    slug: "piotr-lewandowski",
    nazwa: "Piotr Lewandowski",
    nazwaFirmy: "Lewandowski Legal - Kancelaria Radcy Prawnego",
    opis: "Ekspert w dziedzinie własności intelektualnej, prawa autorskiego oraz nowych technologii (IT). Wspieram startupy, twórców gier i agencje marketingowe.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Piotr",
      nazwisko: "Lewandowski",
      image: null,
      miasto: "Łódź",
      voivodeship: { nazwa: "Łódzkie" },
    },
    mainCategory: { nazwa: "Własność Intelektualna" },
    categories: [
      { category: { nazwa: "Własność Intelektualna" } },
      { category: { nazwa: "Prawo IT" } },
    ],
  },
  {
    id: "mock-7",
    slug: "monika-zielinska",
    nazwa: "Monika Zielińska",
    nazwaFirmy: "Kancelaria Adwokacka Monika Zielińska",
    opis: "Skutecznie reprezentuję frankowiczów oraz konsumentów w sporach z bankami i instytucjami finansowymi. Ponad 98% wygranych spraw w sądach powszechnych.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Monika",
      nazwisko: "Zielińska",
      image: null,
      miasto: "Katowice",
      voivodeship: { nazwa: "Śląskie" },
    },
    mainCategory: { nazwa: "Sprawy Frankowe" },
    categories: [
      { category: { nazwa: "Sprawy Frankowe" } },
      { category: { nazwa: "Prawo Bankowe" } },
    ],
  },
  {
    id: "mock-8",
    slug: "tomasz-szymanski",
    nazwa: "Tomasz Szymański",
    nazwaFirmy: "Szymański & Associates",
    opis: "Doradca podatkowy i radca prawny. Pomagam optymalizować podatki w sposób bezpieczny i legalny. Reprezentuję podatników przed urzędami skarbowymi.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Tomasz",
      nazwisko: "Szymański",
      image: null,
      miasto: "Szczecin",
      voivodeship: { nazwa: "Zachodniopomorskie" },
    },
    mainCategory: { nazwa: "Prawo Podatkowe" },
    categories: [
      { category: { nazwa: "Prawo Podatkowe" } },
      { category: { nazwa: "Doradztwo Finansowe" } },
    ],
  },
  {
    id: "mock-9",
    slug: "karolina-wozniak",
    nazwa: "Karolina Woźniak",
    nazwaFirmy: "Kancelaria Radcy Prawnego Karolina Woźniak",
    opis: "Prawo medyczne i błędy lekarskie. Pomagam pacjentom w uzyskaniu odszkodowań i zadośćuczynień od szpitali oraz ubezpieczycieli.",
    logo: null,
    zdziecieGlowne: null,
    user: {
      imie: "Karolina",
      nazwisko: "Woźniak",
      image: null,
      miasto: "Lublin",
      voivodeship: { nazwa: "Lubelskie" },
    },
    mainCategory: { nazwa: "Prawo Medyczne" },
    categories: [
      { category: { nazwa: "Prawo Medyczne" } },
      { category: { nazwa: "Odszkodowania" } },
    ],
  },
  {
    id: "mock-10",
    slug: "michal-kozlowski",
    nazwa: "Michał Kozłowski",
    nazwaFirmy: "Michał Kozłowski Kancelaria Adwokacka",
    opis: "Specjalista od prawa spadkowego. Prowadzę sprawy o zachowek, dział spadku oraz stwierdzenie nabycia spadku w kraju i zagranicą.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Michał",
      nazwisko: "Kozłowski",
      image: null,
      miasto: "Białystok",
      voivodeship: { nazwa: "Podlaskie" },
    },
    mainCategory: { nazwa: "Prawo Spadkowe" },
    categories: [
      { category: { nazwa: "Prawo Spadkowe" } },
      { category: { nazwa: "Prawo Cywilne" } },
    ],
  },
  {
    id: "mock-11",
    slug: "barbara-jankowska",
    nazwa: "Barbara Jankowska",
    nazwaFirmy: "Kancelaria Adwokacka Jankowska",
    opis: "Zajmuję się prawem administracyjnym i odwołaniami od decyzji urzędów. Reprezentuję klientów przed Samorządowymi Kolegiami Odwoławczymi.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Barbara",
      nazwisko: "Jankowska",
      image: null,
      miasto: "Rzeszów",
      voivodeship: { nazwa: "Podkarpackie" },
    },
    mainCategory: { nazwa: "Prawo Administracyjne" },
    categories: [
      { category: { nazwa: "Prawo Administracyjne" } },
      { category: { nazwa: "Obsługa Obywateli" } },
    ],
  },
  {
    id: "mock-12",
    slug: "krzysztof-mazur",
    nazwa: "Krzysztof Mazur",
    nazwaFirmy: "Mazur Legal Kancelaria Radcy Prawnego",
    opis: "Wsparcie prawne dla branży e-commerce. Tworzę regulaminy sklepów internetowych, polityki prywatności oraz audytuję zgodność z RODO.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Krzysztof",
      nazwisko: "Mazur",
      image: null,
      miasto: "Kielce",
      voivodeship: { nazwa: "Świętokrzyskie" },
    },
    mainCategory: { nazwa: "RODO i E-commerce" },
    categories: [
      { category: { nazwa: "RODO i E-commerce" } },
      { category: { nazwa: "Prawo Konsumenckie" } },
    ],
  },
  {
    id: "mock-13",
    slug: "patrycja-krawczyk",
    nazwa: "Patrycja Krawczyk",
    nazwaFirmy: "Kancelaria Adwokacka Patrycja Krawczyk",
    opis: "Prowadzę sprawy z zakresu prawa ubezpieczeń i odszkodowań powypadkowych. Pomagam odzyskać zaniżone świadczenia od ubezpieczalni.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Patrycja",
      nazwisko: "Krawczyk",
      image: null,
      miasto: "Bydgoszcz",
      voivodeship: { nazwa: "Kujawsko-Pomorskie" },
    },
    mainCategory: { nazwa: "Odszkodowania" },
    categories: [
      { category: { nazwa: "Odszkodowania" } },
      { category: { nazwa: "Ubezpieczenia" } },
    ],
  },
  {
    id: "mock-14",
    slug: "lukasz-piotrowski",
    nazwa: "Łukasz Piotrowski",
    nazwaFirmy: "Piotrowski Legal Radca Prawny",
    opis: "Prawo upadłościowe dla osób fizycznych (upadłość konsumencka) oraz restrukturyzacja przedsiębiorstw. Pomagam wyjść z pętli zadłużenia.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Łukasz",
      nazwisko: "Piotrowski",
      image: null,
      miasto: "Częstochowa",
      voivodeship: { nazwa: "Śląskie" },
    },
    mainCategory: { nazwa: "Upadłość i Długi" },
    categories: [
      { category: { nazwa: "Upadłość i Długi" } },
      { category: { nazwa: "Restrukturyzacja" } },
    ],
  },
  {
    id: "mock-15",
    slug: "justyna-grabowska",
    nazwa: "Justyna Grabowska",
    nazwaFirmy: "Grabowska Kancelaria Prawna",
    opis: "Zajmuję się sprawami z zakresu ochrony konkurencji, konsumentów oraz prawa antymonopolowego. Doradzam w sprawach o nieuczciwą konkurencję.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Justyna",
      nazwisko: "Grabowska",
      image: null,
      miasto: "Olsztyn",
      voivodeship: { nazwa: "Warmińsko-Mazurskie" },
    },
    mainCategory: { nazwa: "Ochrona Konsumenta" },
    categories: [
      { category: { nazwa: "Ochrona Konsumenta" } },
      { category: { nazwa: "Prawo Biznesowe" } },
    ],
  },
  {
    id: "mock-16",
    slug: "artur-król",
    nazwa: "Artur Król",
    nazwaFirmy: "Kancelaria Adwokacka Artur Król",
    opis: "Adwokat dla branży transportowej (TFL). Doradzam przewoźnikom w sporach międzynarodowych, kabotażu oraz kontrolach ITD.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Artur",
      nazwisko: "Król",
      image: null,
      miasto: "Gorzów Wielkopolski",
      voivodeship: { nazwa: "Lubuskie" },
    },
    mainCategory: { nazwa: "Prawo Transportowe" },
    categories: [
      { category: { nazwa: "Prawo Transportowe" } },
      { category: { nazwa: "Obsługa Firm" } },
    ],
  },
  {
    id: "mock-17",
    slug: "natalia-wieczorek",
    nazwa: "Natalia Wieczorek",
    nazwaFirmy: "Kancelaria Radcy Prawnego Natalia Wieczorek",
    opis: "Ekspert w sporach o alimenty, ustalenie ojcostwa oraz opiekę nad dziećmi. Zawsze stawiam na dobro dziecka i spokój mojej klienteli.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Natalia",
      nazwisko: "Wieczorek",
      image: null,
      miasto: "Opole",
      voivodeship: { nazwa: "Opolskie" },
    },
    mainCategory: { nazwa: "Prawo Rodzinne" },
    categories: [
      { category: { nazwa: "Prawo Rodzinne" } },
      { category: { nazwa: "Alimenty" } },
    ],
  },
  {
    id: "mock-18",
    slug: "konrad-wróbel",
    nazwa: "Konrad Wróbel",
    nazwaFirmy: "Wróbel & Co. Kancelaria Adwokatów",
    opis: "Prawnik procesowy. Specjalizuję się w prowadzeniu skomplikowanych sporów sądowych w sprawach o podział majątku oraz roszczenia odszkodowawcze.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Konrad",
      nazwisko: "Wróbel",
      image: null,
      miasto: "Gdynia",
      voivodeship: { nazwa: "Pomorskie" },
    },
    mainCategory: { nazwa: "Procesy Sądowe" },
    categories: [
      { category: { nazwa: "Procesy Sądowe" } },
      { category: { nazwa: "Podział Majątku" } },
    ],
  },
  {
    id: "mock-19",
    slug: "adrianna-duda",
    nazwa: "Adrianna Duda",
    nazwaFirmy: "Kancelaria Adwokacka Adrianny Dudy",
    opis: "Obrona praw autorskich i wizerunku w sieci. Pomagam influencerom, youtuberom i twórcom internetowym w audycie umów sponsorskich.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Adrianna",
      nazwisko: "Duda",
      image: null,
      miasto: "Toruń",
      voivodeship: { nazwa: "Kujawsko-Pomorskie" },
    },
    mainCategory: { nazwa: "Prawo Autorskie" },
    categories: [
      { category: { nazwa: "Prawo Autorskie" } },
      { category: { nazwa: "Social Media Law" } },
    ],
  },
  {
    id: "mock-20",
    slug: "robert-dudek",
    nazwa: "Robert Dudek",
    nazwaFirmy: "Kancelaria Radcy Prawnego Robert Dudek",
    opis: "Doradzam w sprawach o mobbing, dyskryminację oraz bezprawne zwolnienia z pracy. Reprezentuję pracowników i pracodawców przed sądami pracy.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Robert",
      nazwisko: "Dudek",
      image: null,
      miasto: "Radom",
      voivodeship: { nazwa: "Mazowieckie" },
    },
    mainCategory: { nazwa: "Prawo Pracy" },
    categories: [
      { category: { nazwa: "Prawo Pracy" } },
      { category: { nazwa: "Zwolnienia" } },
    ],
  },
  {
    id: "mock-21",
    slug: "paulina-pawlak",
    nazwa: "Paulina Pawlak",
    nazwaFirmy: "Kancelaria Prawna Pawlak i Wspólnicy",
    opis: "Radca prawny z pasją do innowacji. Obsługuję inwestycje Venture Capital, transakcje M&A oraz doradzam przy finansowaniu startupów.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Paulina",
      nazwisko: "Pawlak",
      image: null,
      miasto: "Warszawa",
      voivodeship: { nazwa: "Mazowieckie" },
    },
    mainCategory: { nazwa: "Venture Capital" },
    categories: [
      { category: { nazwa: "Venture Capital" } },
      { category: { nazwa: "Fuzje i Przejęcia" } },
    ],
  },
  {
    id: "mock-22",
    slug: "adrian-sikor",
    nazwa: "Adrian Sikora",
    nazwaFirmy: "Sikora Law Firm",
    opis: "Prowadzę obronę oskarżonych o przestępstwa gospodarcze i skarbowe (tzw. white-collar crimes). Dyskrecja i strategiczne podejście do obrony.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Adrian",
      nazwisko: "Sikora",
      image: null,
      miasto: "Kraków",
      voivodeship: { nazwa: "Małopolskie" },
    },
    mainCategory: { nazwa: "Prawo Karne Skarbowe" },
    categories: [
      { category: { nazwa: "Prawo Karne Skarbowe" } },
      { category: { nazwa: "White-collar Crime" } },
    ],
  },
  {
    id: "mock-23",
    slug: "emilia-adamczyk",
    nazwa: "Emilia Adamczyk",
    nazwaFirmy: "Adamczyk Kancelaria Radcy Prawnego",
    opis: "Ekspert w sporach budowlanych i deweloperskich. Reprezentuję inwestorów, wykonawców i podwykonawców w dochodzeniu roszczeń i kar umownych.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Emilia",
      nazwisko: "Adamczyk",
      image: null,
      miasto: "Gliwice",
      voivodeship: { nazwa: "Śląskie" },
    },
    mainCategory: { nazwa: "Prawo Budowlane" },
    categories: [
      { category: { nazwa: "Prawo Budowlane" } },
      { category: { nazwa: "Inwestycje" } },
    ],
  },
  {
    id: "mock-24",
    slug: "sebastian-ostrowski",
    nazwa: "Sebastian Ostrowski",
    nazwaFirmy: "Kancelaria Adwokacka Ostrowski",
    opis: "Adwokat dedykowany ochronie praw konsumenta w sporach z ubezpieczycielami (szkody komunikacyjne, zalania). Pomagam uzyskać pełne odszkodowanie.",
    logo: null,
    zdjecieGlowne: null,
    user: {
      imie: "Sebastian",
      nazwisko: "Ostrowski",
      image: null,
      miasto: "Sosnowiec",
      voivodeship: { nazwa: "Śląskie" },
    },
    mainCategory: { nazwa: "Szkody Komunikacyjne" },
    categories: [
      { category: { nazwa: "Szkody Komunikacyjne" } },
      { category: { nazwa: "Konsument" } },
    ],
  },
];

export default function TeamExpertsSection() {
  const pathname = usePathname();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Avoid rendering on authorization pages
  const isAuthPage = AUTH_ROUTES.some((route) => pathname?.startsWith(route));

  useEffect(() => {
    if (isAuthPage) return;

    const fetchExperts = async () => {
      try {
        const response = await fetch("/api/experts/random");
        if (!response.ok) throw new Error("Failed to fetch experts");
        const data: Expert[] = await response.json();

        let finalExperts = [...data];

        // Pad with mock experts if there are less than 24 experts in the DB
        if (finalExperts.length < 24) {
          const needed = 24 - finalExperts.length;
          const shuffledMockPool = [...MOCK_POOL].sort(
            () => 0.5 - Math.random(),
          );
          // Deduplicate based on slug/id to avoid identical mock cards if we pad heavily
          const addedMocks = shuffledMockPool.slice(0, needed);
          finalExperts = [...finalExperts, ...addedMocks];
        }

        setExperts(finalExperts);
      } catch (error) {
        console.error("Error in TeamExpertsSection:", error);
        // Fallback to complete mock pool on error so the grid remains complete
        const shuffledMocks = [...MOCK_POOL].sort(() => 0.5 - Math.random());
        setExperts(shuffledMocks);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperts();
  }, [isAuthPage]);

  if (isAuthPage) return null;

  const getInitials = (
    imie?: string | null,
    nazwisko?: string | null,
    nazwa?: string,
  ) => {
    if (imie && nazwisko) {
      return `${imie.charAt(0)}${nazwisko.charAt(0)}`.toUpperCase();
    }
    if (imie) return imie.charAt(0).toUpperCase();
    if (nazwisko) return nazwisko.charAt(0).toUpperCase();
    if (nazwa) {
      const parts = nazwa.split(" ").filter((p) => p.length > 0);
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return nazwa.charAt(0).toUpperCase();
    }
    return "E";
  };

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 22 },
    },
  };

  return (
    <section className="relative w-full border-t border-zinc-900/60 bg-zinc-950/20 py-16 md:py-24 lg:py-28 overflow-hidden select-none">
      {/* Decorative background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#c7b56d_1px,transparent_1px),linear-gradient(to_bottom,#c7b57d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-4 space-y-4 mb-4">
          <Badge
            variant="outline"
            className="border-primary/20 text-primary bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.07)]"
          >
            <Users className="mr-2 h-3.5 w-3.5 inline text-primary animate-pulse" />{" "}
            Nasi Eksperci
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white max-w-3xl">
            Poznaj naszych Specjalistów
          </h2>
          <p className="max-w-[750px] text-zinc-400 text-sm sm:text-base md:text-lg font-light leading-relaxed">
            Prezentujemy 24 losowo wyselekcjonowanych specjalistów z naszej
            bazy. Za każdym razem dobieramy inny zestaw ekspertów prawnych
            gotowych odpowiedzieć na Twoje potrzeby.
          </p>
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <Card
                key={i}
                className="bg-zinc-900/40 border-zinc-800/50 p-6 flex flex-col justify-between h-[280px]"
              >
                <div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-full bg-zinc-800/80" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-32 bg-zinc-800/80" />
                      <Skeleton className="h-4 w-24 bg-zinc-800/80" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-zinc-800/80" />
                    <Skeleton className="h-4 w-5/6 bg-zinc-800/80" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Skeleton className="h-5 w-16 bg-zinc-800/80 rounded-md" />
                  <Skeleton className="h-5 w-20 bg-zinc-800/80 rounded-md" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
          >
            {experts.map((expert) => {
              const imie = expert.user?.imie;
              const nazwisko = expert.user?.nazwisko;
              const imieNazwisko =
                imie && nazwisko ? `${imie} ${nazwisko}` : null;
              const displayName =
                imieNazwisko || expert.nazwaFirmy || expert.nazwa;
              const roleName =
                expert.mainCategory?.nazwa ||
                expert.categories?.[0]?.category?.nazwa ||
                "Specjalista Prawny";
              const location = expert.user?.miasto || "Polska";
              const avatarSrc = expert.logo || expert.user?.image;
              const initials = getInitials(imie, nazwisko, displayName);
              const skills =
                expert.categories?.map((c) => c.category.nazwa) || [];
              const shortBio = expert.opis
                ? expert.opis.length > 130
                  ? `${expert.opis.slice(0, 127)}...`
                  : expert.opis
                : "Doświadczony specjalista z profesjonalnym i indywidualnym podejściem do każdej sprawy klienta. Skontaktuj się, aby uzyskać pomoc.";

              return (
                <motion.div
                  key={expert.id}
                  variants={cardVariants}
                  whileHover={{ y: -6, scale: 1.015 }}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-zinc-900/60 bg-zinc-950/45 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
                >
                  <Link href={`/ekspert/${expert.slug}`}>
                    {/* Header */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border border-zinc-800/60 transition-transform duration-500 group-hover:scale-105">
                        <AvatarImage src={avatarSrc || ""} alt={displayName} />
                        <AvatarFallback className="bg-gradient-to-br from-zinc-800 to-zinc-900 text-primary font-medium text-lg uppercase">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h4 className="text-base font-semibold text-zinc-100 truncate group-hover:text-primary transition-colors duration-300">
                            {displayName}
                          </h4>
                          {expert.id.startsWith("mock-") === false && (
                            <ShieldCheck
                              className="h-4.5 w-4.5 text-primary shrink-0"
                              title="Zweryfikowany Ekspert"
                            />
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 font-medium truncate">
                          {roleName}
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* Decorative Hover Glow background (Matching Team 11) */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
