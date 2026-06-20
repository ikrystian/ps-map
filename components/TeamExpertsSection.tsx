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
const MOCK_POOL: Expert[] = [];

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
      transition: { type: "spring", stiffness: 260, damping: 22 } as const,
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white max-w-3xl font-playfair">
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
                            <span title="Zweryfikowany Ekspert">
                              <ShieldCheck
                                className="h-4.5 w-4.5 text-primary shrink-0"
                              />
                            </span>
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
