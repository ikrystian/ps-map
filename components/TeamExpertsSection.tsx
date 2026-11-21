"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";
import { expertAvatar } from "@/lib/expert-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Expert {
  id: string;
  slug: string;
  nazwa: string;
  logo: string | null;
  user: {
    image: string | null;
    miasto: string | null;
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

// Ile kart widać na start i ile dokłada „Pokaż kolejnych specjalistów”:
// poniżej lg (1 kolumna) po 5, od lg (2 kolumny) po 10.
const STEP_MOBILE = 5;
const STEP_DESKTOP = 10;

/** Widoczność karty o indeksie `i` po `pages` kliknięciach (liczonych od 1). */
function visibilityClass(i: number, pages: number) {
  return cn(
    i >= STEP_MOBILE * pages && "hidden",
    i < STEP_DESKTOP * pages ? "lg:grid" : "lg:hidden",
  );
}

/**
 * Nazwa z ikoną weryfikacji przyklejoną do ostatniego słowa, żeby ikona
 * nigdy nie spadała sama do nowej linii.
 */
function NameWithBadge({ name }: { name: string }) {
  const trimmed = name.trim();
  const i = trimmed.lastIndexOf(" ");
  const head = i < 0 ? "" : trimmed.slice(0, i + 1);
  const last = i < 0 ? trimmed : trimmed.slice(i + 1);

  return (
    <>
      {head}
      <span className="whitespace-nowrap">
        {last}
        <ShieldCheck
          aria-hidden="true"
          className="ml-1 inline-block size-3.5 align-[-2px] text-primary"
        />
      </span>
    </>
  );
}

const CARD_CLASS =
  "grid grid-cols-[52px_minmax(0,1fr)] gap-x-4 gap-y-3 rounded-[14px] border border-border bg-white p-3.5 dark:bg-white/[0.025] sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:gap-4 sm:px-[18px] sm:py-4";

export default function TeamExpertsSection() {
  const pathname = usePathname();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pages, setPages] = useState(1);

  // Avoid rendering on authorization pages
  const isAuthPage = AUTH_ROUTES.some((route) => pathname?.startsWith(route));

  useEffect(() => {
    if (isAuthPage) return;

    const fetchExperts = async () => {
      try {
        const response = await fetch("/api/experts/random");
        if (!response.ok) throw new Error("Failed to fetch experts");
        const data: Expert[] = await response.json();
        setExperts(data);
      } catch (error) {
        console.error("Error in TeamExpertsSection:", error);
        setExperts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperts();
  }, [isAuthPage]);

  if (isAuthPage) return null;
  if (!isLoading && experts.length === 0) return null;

  const moreOnMobile = experts.length > STEP_MOBILE * pages;
  const moreOnDesktop = experts.length > STEP_DESKTOP * pages;

  return (
    <section className="relative w-full overflow-hidden border-t border-border/60 bg-background/20 py-16 md:py-24 lg:py-28">
      {/* Decorative background grid pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#c7b56d_1px,transparent_1px),linear-gradient(to_bottom,#c7b57d_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        {/* Header */}
        <h2 className="mb-3 text-center font-playfair text-[28px] font-normal leading-[1.2] sm:text-4xl">
          Poznaj naszych Specjalistów
        </h2>
        <p className="mx-auto mb-[22px] max-w-[720px] text-center text-[15px] font-light leading-[1.6] text-muted-foreground sm:mb-8 sm:text-lg">
          <span className="sm:hidden">
            Losowi specjaliści z naszej bazy, przy każdej wizycie inni.
          </span>
          <span className="hidden sm:inline">
            Prezentujemy losowych specjalistów z naszej bazy. Za każdym razem
            dobieramy inny zestaw ekspertów prawnych gotowych odpowiedzieć na
            Twoje potrzeby.
          </span>
        </p>

        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2 lg:gap-x-5 lg:gap-y-3">
          {isLoading
            ? Array.from({ length: STEP_DESKTOP }).map((_, i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  className={cn(CARD_CLASS, visibilityClass(i, 1))}
                >
                  <Skeleton className="size-[52px] self-center rounded-full sm:size-16" />
                  <div className="flex min-w-0 flex-col gap-2 py-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="mt-auto h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="col-span-2 h-[35px] w-full self-center rounded-lg sm:col-span-1 sm:w-[110px]" />
                </div>
              ))
            : experts.map((expert, i) => {
                const name = expert.nazwa.trim();
                const category =
                  expert.mainCategory?.nazwa ||
                  expert.categories?.[0]?.category?.nazwa ||
                  "Specjalista Prawny";
                const location = expert.user?.miasto?.trim() || "Polska";
                const avatarSrc = expertAvatar(
                  expert.logo || expert.user?.image,
                );

                return (
                  <Link
                    key={expert.id}
                    href={`/ekspert/${expert.slug}`}
                    title={name}
                    className={cn(
                      CARD_CLASS,
                      "group transition-colors hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      visibilityClass(i, pages),
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatarSrc}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      width={64}
                      height={64}
                      className="size-[52px] shrink-0 self-center rounded-full bg-muted object-cover sm:size-16"
                    />

                    <div className="flex min-w-0 flex-col gap-1.5">
                      <div className="line-clamp-3 font-playfair text-base font-normal leading-[1.3] text-foreground [overflow-wrap:anywhere] sm:line-clamp-2 sm:text-[17px]">
                        <NameWithBadge name={name} />
                      </div>
                      <div className="mt-auto flex min-w-0 flex-col items-start gap-1">
                        <span className="line-clamp-2 text-xs leading-[1.35] text-muted-foreground">
                          {category}
                        </span>
                        <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-[#5f6b68] dark:text-[#8c8a80]">
                          <MapPin aria-hidden="true" className="size-3 shrink-0" />
                          {location}
                        </span>
                      </div>
                    </div>

                    <span className="col-span-2 inline-flex w-full items-center justify-center self-center whitespace-nowrap rounded-lg border border-border px-4 py-2.5 text-[13px] font-semibold leading-none text-foreground transition-colors hover:border-primary sm:col-span-1 sm:w-auto">
                      Zobacz profil
                    </span>
                  </Link>
                );
              })}
        </div>

        {!isLoading && (moreOnMobile || moreOnDesktop) && (
          <button
            type="button"
            onClick={() => setPages((p) => p + 1)}
            className={cn(
              "mx-auto mt-[22px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-transparent px-5 py-[11px] text-sm font-semibold leading-none text-foreground transition-colors hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              moreOnMobile ? "flex" : "hidden",
              moreOnDesktop ? "lg:flex" : "lg:hidden",
            )}
          >
            Pokaż kolejnych specjalistów
          </button>
        )}
      </div>
    </section>
  );
}
