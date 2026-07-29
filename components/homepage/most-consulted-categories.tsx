"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/categories";
import type { LawFirm } from "@/types/lawfirms";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Globe,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { CategoryIcon } from "@/components/category-icon";
import { useSession } from "next-auth/react";
import { EXPERT_AVATAR_FALLBACK } from "@/lib/expert-avatar";
import Link from "next/link";
import { useState, useMemo, useRef } from "react";

interface MostConsultedCategoriesProps {
  consultedData?: Record<string, LawFirm[]>;
  categories: Category[];
  lawFirms: LawFirm[];
  consultedCategoryIds?: string[];
}

export function MostConsultedCategories({
  consultedData,
  categories,
  lawFirms,
  consultedCategoryIds,
}: MostConsultedCategoriesProps) {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const [activeIdx, setActiveIdx] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Filtrujemy zakładki po aktywnych ID z ustawień
  const activeTabs = useMemo(() => {
    let tabs = categories.filter((c) => consultedCategoryIds?.includes(c.id));
    // Fallback if no configuration is found
    if (tabs.length === 0) {
      tabs = categories.slice(0, 6);
    }
    // Only show tabs that have either active promotions or some law firms matching
    return tabs.filter((tab) => {
      if (
        consultedData &&
        consultedData[tab.id] &&
        consultedData[tab.id].length > 0
      )
        return true;
      const hasFirms = lawFirms?.some((firm) =>
        firm.categories?.some((c) => {
          const catId = c.category?.id || c.id;
          return catId === tab.id;
        }),
      );
      return hasFirms;
    });
  }, [categories, consultedCategoryIds, consultedData, lawFirms]);

  if (activeTabs.length === 0) {
    return null;
  }

  const handlePrev = () => {
    if (sliderRef.current) {
      const card = sliderRef.current.querySelector(".slider-card");
      const cardWidth = card ? card.getBoundingClientRect().width : 320;
      const gap = 24;
      sliderRef.current.scrollBy({
        left: -(cardWidth + gap),
        behavior: "smooth",
      });
    }
  };

  const handleNext = () => {
    if (sliderRef.current) {
      const card = sliderRef.current.querySelector(".slider-card");
      const cardWidth = card ? card.getBoundingClientRect().width : 320;
      const gap = 24;
      sliderRef.current.scrollBy({ left: cardWidth + gap, behavior: "smooth" });
    }
  };

  const getCategoryFirms = (catIdx: number) => {
    if (activeTabs.length === 0) return [];
    const tab = activeTabs[catIdx];

    let list: LawFirm[] = [];

    // Priorytet dla firm z wykupioną promocją
    if (consultedData && consultedData[tab.id]) {
      list = [...consultedData[tab.id]];
    }

    // Dobieranie pozostałych firm z danej kategorii
    if (list.length < 5 && lawFirms && lawFirms.length > 0) {
      const filtered = lawFirms.filter((firm) => {
        if (!firm.categories) return false;
        return firm.categories.some((cat) => {
          const catId = cat.category?.id || cat.id;
          return catId === tab.id;
        });
      });

      filtered.forEach((firm) => {
        if (list.length < 5 && !list.some((f) => f.id === firm.id)) {
          list.push(firm);
        }
      });
    }

    // Fallback jeśli nadal brakuje firm
    if (list.length < 5 && lawFirms && lawFirms.length > 0) {
      let i = 0;
      while (list.length < 5 && i < lawFirms.length * 2) {
        const firmIdx = (catIdx * 1 + i) % lawFirms.length;
        const firm = lawFirms[firmIdx];
        if (!list.some((f) => f.id === firm.id)) {
          list.push(firm);
        }
        i++;
      }
    }

    return list.slice(0, 5);
  };

  const getFirmImage = (firm: LawFirm) => {
    if (
      firm.logo &&
      (firm.logo.startsWith("http") ||
        firm.logo.startsWith("/uploads") ||
        firm.logo.startsWith("/generate") ||
        firm.logo.startsWith("/api/files"))
    ) {
      return firm.logo;
    }
    if (
      firm.zdjecieGlowne &&
      (firm.zdjecieGlowne.startsWith("http") ||
        firm.zdjecieGlowne.startsWith("/uploads") ||
        firm.zdjecieGlowne.startsWith("/generate") ||
        firm.zdjecieGlowne.startsWith("/api/files"))
    ) {
      return firm.zdjecieGlowne;
    }
    return EXPERT_AVATAR_FALLBACK;
  };

  // Zmienione zgodnie z instrukcją - pobieramy expertiseCategory zamiast getProfessionTitle
  const getSubtitle = (firm: LawFirm) => {
    if (firm.expertiseCategory?.nazwa) {
      return firm.expertiseCategory.nazwa.toUpperCase();
    }
    return "EKSPERT";
  };

  return (
    <section className="py-8 lg:py-20 xl:py-24 bg-darker text-white overflow-hidden">
      {/* Header + Tabs stay within the container */}
      <div className="container mx-auto px-4 max-w-8xl">
        <div className="flex items-center gap-6 mb-12">
          <h2 className="text-2xl md:text-3xl font-light text-zinc-100 sm:whitespace-nowrap font-playfair">
            Najczęściej konsultowane kategorie
          </h2>
          <div className="flex-grow border-t border-zinc-800/80" />
        </div>

        <div
          className="flex md:grid md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-6 md:mb-12 px-4 max-w-8xl mx-auto overflow-x-auto md:overflow-visible pb-2 md:pb-0 scroll-smooth custom-scrollbar"
          style={{ scrollbarWidth: "thin" }}
        >
          {activeTabs.map((tab, idx) => {
            const isActive = activeIdx === idx;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveIdx(idx);
                  if (sliderRef.current) {
                    sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
                  }
                }}
                className={`flex flex-col items-center justify-center p-1 md:p-4 text-center h-[96px] md:h-[140px] rounded-2xl cursor-pointer select-none transition-all duration-300 shadow-md shrink-0 w-[124px] md:w-auto md:shrink ${isActive
                  ? "bg-[#0da192] text-white border border-transparent scale-[1.03]"
                  : "bg-[#1c1c1e] text-zinc-300 border border-zinc-800/60 hover:bg-[#222225] hover:border-zinc-700/80 hover:text-white"
                  }`}
              >
                <div className="mb-1 md:mb-4">
                  <CategoryIcon
                    ikona={tab.ikona}
                    fallback={Star}
                    className={`w-9 h-9 transition-colors duration-300 ${isActive ? "text-white" : "text-[#0da192]"}`}
                  />
                </div>
                <span className="text-xs font-light tracking-wider leading-tight uppercase">
                  {tab.nazwa}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slider: starts at container padding but overflows to the right */}
      <div className="relative min-h-[460px]">
        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-proximity touch-pan-x"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            paddingLeft: "calc(max(1rem, (100vw - 1500px) / 2))",
            paddingRight: "2rem",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex gap-6"
            >
              {getCategoryFirms(activeIdx).map((firm, index) => {
                const ContactButton = ({
                  icon: Icon,
                  href,
                  title,
                }: {
                  icon: React.ElementType;
                  href: string;
                  title: string;
                }) => {
                  const button = (
                    <a
                      href={isLoggedIn ? href : "#"}
                      onClick={(e) => {
                        if (!isLoggedIn) {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      }}
                      className={cn(
                        "w-10 h-10 rounded-full bg-[#0da192] flex items-center justify-center transition-all duration-200 shadow-md",
                        isLoggedIn
                          ? "hover:bg-[#0b8b7e] hover:scale-105 active:scale-95"
                          : "opacity-70 cursor-help",
                      )}
                      title={isLoggedIn ? title : undefined}
                    >
                      <Icon
                        className={cn(
                          "w-4.5 h-4.5 text-white",
                          Icon === Phone && "fill-white",
                        )}
                      />
                    </a>
                  );

                  if (isLoggedIn) return button;

                  return (
                    <Tooltip>
                      <TooltipTrigger asChild>{button}</TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="bg-[#1a1a1a] border-zinc-800 text-white text-xs"
                      >
                        Informacja dostępna po zalogowaniu
                      </TooltipContent>
                    </Tooltip>
                  );
                };

                return (
                  <Link
                    href={`/ekspert/${firm.slug}?src=home-consulted`}
                    key={`${firm.id}-${index}`}
                    className="slider-card w-[300px] md:w-[340px] shrink-0 snap-start flex flex-col h-full bg-[#1c1c1e] rounded-2xl border border-white/15 overflow-hidden shadow-xl hover:shadow-2xl transition-all relative duration-300 group"
                  >
                    <div className="relative h-65 w-full overflow-hidden bg-zinc-900">
                      <div className="absolute inset-0 z-100  bg-gradient-to-t from-[#1d1d1f] via-[#1d1d1f]/20 to-transparent to-[96%]" />
                      <img
                        src={getFirmImage(firm)}
                        alt={firm.nazwa}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {firm.reviewCount > 0 && (
                        <div className="absolute bottom-4 left-4 flex items-center gap-2.5 z-101 backdrop-blur-md p-2 rounded-xl border border-white/5">
                          <div className="bg-[#0da192] text-white font-extrabold text-[13px] px-2.5 py-1.5 rounded-lg leading-none">
                            {firm.avgRating.toFixed(1).replace(".", ",")}
                          </div>
                          <div className="flex flex-col justify-center">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "w-3.5 h-3.5",
                                    i < Math.round(firm.avgRating)
                                      ? "fill-[#f59e0b] text-[#f59e0b]"
                                      : "fill-transparent text-zinc-600",
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-primary font-semibold mt-1">
                              {firm.reviewCount}{" "}
                              {firm.reviewCount === 1 ? "opinia" : "opinii"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-6 text-center flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-zinc-400 tracking-widest uppercase block mb-1.5 line-clamp-1">
                          {getSubtitle(firm)}
                        </span>
                        <h3 className="text-[19px] font-playfair text-white mb-2 line-clamp-1 group-hover:text-[#0da192] transition-colors duration-200">
                          <Link href={`/ekspert/${firm.slug}`}>
                            {firm.nazwa}
                          </Link>
                        </h3>
                        <p className="text-xs text-[#C5A66F] flex items-center justify-center gap-1.5 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                          {firm.miasto}
                          {firm.voivodeship?.nazwa
                            ? `, ${firm.voivodeship.nazwa}`
                            : ""}
                        </p>
                      </div>

                      <div className="flex justify-center items-center w-full pt-6 border-t border-zinc-800/80">
                        <div className="flex gap-2">
                          <ContactButton
                            icon={Phone}
                            href={
                              firm.numerTelefonu
                                ? `tel:${firm.numerTelefonu}`
                                : "#"
                            }
                            title="Zadzwoń do eksperta"
                          />

                          <ContactButton
                            icon={Mail}
                            href={
                              firm.emailKontakt
                                ? `mailto:${firm.emailKontakt}`
                                : "#"
                            }
                            title="Wyślij e-mail"
                          />

                          {firm.stronaWww && (
                            <ContactButton
                              icon={Globe}
                              href={firm.stronaWww}
                              title="Odwiedź stronę www"
                            />
                          )}
                        </div>

                        <Link
                          href={`/ekspert/${firm.slug}`}
                          className="w-10 h-10 rounded-lg bg-[#0da192] hover:bg-[#0b8b7e] absolute right-0 bottom-0 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                          title="Zobacz pełny profil"
                        >
                          <ArrowUpRight className="w-5 h-5 text-white" />
                        </Link>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom navigation arrows aligned to container */}
      <div className="container mx-auto px-4 max-w-8xl">
        <div className="flex justify-center gap-3 mt-8">
          <button
            onClick={handlePrev}
            className="w-12 h-12 rounded-lg bg-[#0da192] hover:bg-[#0b8b7e] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Poprzedni slajd"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-lg bg-[#0da192] hover:bg-[#0b8b7e] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Następny slajd"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </section>
  );
}
