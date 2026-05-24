"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MapPin,
  Star,
  CheckCircle2,
  Phone,
  Mail,
  Globe,
  ArrowUpRight,
  Clock,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PackageBadge } from "@/components/permissions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Helper function to check if law firm is open (copied from pages)
const isLawFirmOpen = (
  godzinyOtwarcia?: Record<string, string>,
  statusGodzinyOtwarcia?: boolean,
) => {
  if (!statusGodzinyOtwarcia || !godzinyOtwarcia) return null;

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const dayMap: Record<number, string> = {
    0: "niedziela",
    1: "poniedzialek",
    2: "wtorek",
    3: "sroda",
    4: "czwartek",
    5: "piatek",
    6: "sobota",
  };

  const todayKey = dayMap[currentDay];
  const todayHours = godzinyOtwarcia[todayKey];

  if (
    !todayHours ||
    todayHours.toLowerCase() === "zamknięte" ||
    todayHours.trim() === ""
  ) {
    return false;
  }

  const [from, to] = todayHours.split("-").map((t) => t.trim());
  if (!from || !to) return null;

  const [fromHour, fromMin] = from.split(":").map(Number);
  const [toHour, toMin] = to.split(":").map(Number);

  const fromTime = fromHour * 60 + fromMin;
  const toTime = toHour * 60 + toMin;

  return currentTime >= fromTime && currentTime <= toTime;
};

export interface LawFirm {
  id: string;
  slug: string;
  nazwa: string;
  nazwaFirmy: string;
  logo?: string;
  zdjecieGlowne?: string;
  opis?: string;
  miasto: string;
  adres?: string;
  kodPocztowy?: string;
  voivodeship: {
    nazwa: string;
  };
  zweryfikowana: boolean;
  onlineOnly: boolean;
  categories: Array<{
    nazwa: string;
    slug: string;
  }>;
  avgRating: number;
  reviewCount: number;
  pakietSubskrypcji?: string;
  statusGodzinyOtwarcia?: boolean;
  godzinyOtwarcia?: Record<string, string>;
  telefon?: string;
  email?: string;
  stronaWww?: string;
  oraStatus?: boolean;
  oraMiasto?: string | null;
  oirpStatus?: boolean;
  oirpMiasto?: string | null;
}
interface LawFirmListItemProps {
  lawFirm: LawFirm;
}

const getOpinieText = (count: number) => {
  if (count === 1) return "opinia";
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (
    lastDigit >= 2 &&
    lastDigit <= 4 &&
    (lastTwoDigits < 10 || lastTwoDigits >= 20)
  ) {
    return "opinie";
  }
  return "opinii";
};

const AwardEmblem = () => (
  <div className="relative flex-shrink-0 select-none">
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-14 h-14 md:w-16 md:h-16"
    >
      <defs>
        <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="40%" stopColor="#F5AF19" />
          <stop offset="80%" stopColor="#E65C00" />
          <stop offset="100%" stopColor="#F5AF19" />
        </linearGradient>
      </defs>
      {/* Laurel Wreath */}
      <path
        d="M22 42C17 36 17 26 22 20M19 38C15 36 15 33 19 31M17 30C13 28 13 25 17 23M19 22C15 20 16 17 20 15M23 15C20 13 21 10 25 9"
        stroke="url(#goldGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M42 42C47 36 47 26 42 20M45 38C49 36 49 33 45 31M47 30C51 28 51 25 47 23M45 22C49 20 48 17 44 15M41 15C44 13 43 10 39 9"
        stroke="url(#goldGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Center Seal */}
      <circle
        cx="32"
        cy="27"
        r="12"
        fill="#131313"
        stroke="url(#goldGradient)"
        strokeWidth="1.5"
      />
      <circle
        cx="32"
        cy="27"
        r="9"
        fill="none"
        stroke="url(#goldGradient)"
        strokeWidth="0.75"
        strokeDasharray="2 1"
      />

      {/* Checkmark inside V */}
      <path
        d="M28 27L31 30L36 23"
        stroke="url(#goldGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Ribbon Banner at bottom */}
      <path
        d="M20 44L24 41H40L44 44L32 47L20 44Z"
        fill="#131313"
        stroke="url(#goldGradient)"
        strokeWidth="1.5"
      />
      <path
        d="M20 44V49L24 47L20 44Z"
        fill="#1d1d1d"
        stroke="url(#goldGradient)"
        strokeWidth="1"
      />
      <path
        d="M44 44V49L40 47L44 44Z"
        fill="#1d1d1d"
        stroke="url(#goldGradient)"
        strokeWidth="1"
      />

      <text
        x="32"
        y="45.5"
        fill="url(#goldGradient)"
        fontSize="5.5"
        fontWeight="bold"
        textAnchor="middle"
        letterSpacing="0.5"
        fontFamily="sans-serif"
      >
        2024
      </text>
    </svg>
  </div>
);

const OraIcon = () => (
  <svg
    className="w-4 h-4 text-white"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <circle
      cx="12"
      cy="12"
      r="8"
      stroke="currentColor"
      strokeWidth="0.5"
      strokeDasharray="1 1"
    />
    <path
      d="M12 7V17M9 17H15M8 10H16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M10 10.5C10 12 9 13.5 9 13.5M14 10.5C14 12 15 13.5 15 13.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export function LawFirmListItem({ lawFirm }: LawFirmListItemProps) {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const isOpen = isLawFirmOpen(
    lawFirm.godzinyOtwarcia,
    lawFirm.statusGodzinyOtwarcia,
  );
  const pkg = lawFirm.pakietSubskrypcji;

  const cardBorderAndGlow =
    pkg === "BIZNES"
      ? "border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.08)] hover:border-amber-500/80 bg-gradient-to-br from-[#131313] via-[#131313] to-amber-950/10"
      : pkg === "PREMIUM"
        ? "border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.08)] hover:border-purple-500/80 bg-gradient-to-br from-[#131313] via-[#131313] to-purple-950/10"
        : pkg === "STANDARD"
          ? "border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.06)] hover:border-blue-500/60 bg-gradient-to-br from-[#131313] via-[#131313] to-blue-950/10"
          : "border-neutral-800 hover:border-neutral-700 bg-[#131313]";

  const professionalTitle = lawFirm.oraStatus
    ? "Adwokat"
    : lawFirm.oirpStatus
      ? "Radca prawny"
      : lawFirm.categories[0]?.nazwa || "Adwokat";
  const chamberText =
    lawFirm.oraStatus && lawFirm.oraMiasto
      ? `ORA ${lawFirm.oraMiasto}`
      : lawFirm.oirpStatus && lawFirm.oirpMiasto
        ? `OIRP ${lawFirm.oirpMiasto}`
        : "ORA Kielce";

  const ContactButton = ({
    icon: Icon,
    onClick,
    type,
  }: {
    icon: any;
    onClick: (e: any) => void;
    type: string;
  }) => {
    const button = (
      <Button
        size="icon"
        variant="ghost"
        onClick={(e) => {
          if (!isLoggedIn) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          onClick(e);
        }}
        className={cn(
          "rounded-full bg-[#058c80] text-white transition-all duration-300 h-11 w-11 shadow-md border-0",
          isLoggedIn ? "hover:bg-[#04756b]" : "opacity-70 cursor-help",
        )}
      >
        <Icon className="w-5 h-5" />
      </Button>
    );

    if (isLoggedIn) return button;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-[#1a1a1a] border-neutral-800 text-white font-sans text-xs"
        >
          Informacja dostępna po zalogowaniu
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <Link href={`/ekspert/${lawFirm.slug}`} className="block group">
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300 hover:shadow-2xl border",
          cardBorderAndGlow,
        )}
      >
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Column - Image */}
          <div className="relative w-full md:w-[400px] h-[250px] md:h-auto flex-shrink-0 bg-[#111111] border-r border-neutral-800">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c1c] to-[#111111] flex items-center justify-center overflow-hidden">
              {lawFirm.zdjecieGlowne || lawFirm.logo ? (
                <Image
                  src={lawFirm.zdjecieGlowne || lawFirm.logo || ""}
                  alt={lawFirm.nazwa}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="text-neutral-700 flex flex-col items-center justify-center">
                  <Avatar className="w-24 h-24 opacity-30 bg-[#222]">
                    <AvatarFallback className="text-neutral-400 bg-neutral-900 font-sans text-xl">
                      {lawFirm.nazwa.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              {/* Subtle dark vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
            </div>

            {/* Status Badge - Top Right */}
            <div className="absolute top-4 right-4 z-10">
              {isOpen === true && (
                <div className="bg-[#0f6c65]/80 text-white border border-teal-500/20 px-4 py-1.5 rounded-full text-xs font-sans font-medium tracking-wide shadow-md backdrop-blur-sm">
                  Otwarte
                </div>
              )}
              {isOpen === false && (
                <div className="bg-rose-950/80 text-rose-200 border border-rose-500/20 px-4 py-1.5 rounded-full text-xs font-sans font-medium tracking-wide shadow-md backdrop-blur-sm">
                  Zamknięte
                </div>
              )}
            </div>

            {/* Rating - Bottom Left */}
            <div className="absolute bottom-4 left-4 z-10">
              <div className="bg-[#058c80] text-white px-3 py-2 rounded-lg flex items-center gap-3 shadow-lg border border-teal-500/20">
                <span className="text-2xl font-bold font-sans tracking-tight leading-none">
                  {lawFirm.avgRating > 0
                    ? lawFirm.avgRating.toFixed(1).replace(".", ",")
                    : "5,0"}
                </span>
                <div className="flex flex-col justify-center">
                  <div className="flex gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3 h-3 fill-current",
                          i < Math.round(lawFirm.avgRating || 5)
                            ? "text-amber-400"
                            : "text-neutral-400/30",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-200 font-sans leading-none font-light">
                    {lawFirm.reviewCount || 11}{" "}
                    {getOpinieText(lawFirm.reviewCount || 11)}
                  </span>
                </div>
              </div>
            </div>

            {/* Logo Overlay - Bottom Right */}
            {lawFirm.logo && (
              <div className="absolute bottom-4 right-4 z-10">
                <div className="w-24 h-24 rounded-full border border-amber-400/30 bg-black/90 p-1 flex items-center justify-center shadow-xl overflow-hidden">
                  <Image
                    src={lawFirm.logo}
                    alt="Logo"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Content */}
          <div className="flex-1 p-6 flex flex-col justify-between relative bg-card">
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-white tracking-tight mb-2 flex flex-wrap items-center gap-2 group-hover:text-[#0db19f] transition-colors duration-300">
                    <span className="truncate">{lawFirm.nazwa}</span>
                    {lawFirm.pakietSubskrypcji && (
                      <PackageBadge
                        packageType={lawFirm.pakietSubskrypcji as any}
                        size="sm"
                      />
                    )}
                  </h3>
                  <div className="flex items-center text-[#0db19f]">
                    <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span className="text-sm text-neutral-400 font-light truncate">
                      {lawFirm.adres
                        ? `${lawFirm.adres}, ${lawFirm.kodPocztowy} ${lawFirm.miasto}`
                        : `${lawFirm.miasto}, ${lawFirm.voivodeship.nazwa}`}
                    </span>
                  </div>
                </div>
                <AwardEmblem />
              </div>

              {/* Description */}
              <div className="flex-1">
                <p className="text-neutral-400 text-sm leading-relaxed font-light line-clamp-3">
                  {lawFirm.opis || "Brak opisu kancelarii."}
                </p>
              </div>

              {/* Divider */}

              {/* Badges/Categories */}
              <div className="flex flex-wrap items-center gap-3 my-3">
                {/* Purple badge (Professional title) */}
                <div className="bg-[#3b0066] text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md">
                  {professionalTitle}
                </div>

                {/* Teal badge (Regional Chamber) */}
                <div className="flex items-center gap-2.5 bg-[#172e2b] border border-[#0d5c54]/30 text-white pl-2 pr-4 py-1.5 rounded-lg text-sm font-medium shadow-md">
                  <div className="bg-[#058c80] p-1.5 rounded-md flex items-center justify-center">
                    <OraIcon />
                  </div>
                  <span className="text-neutral-200">{chamberText}</span>
                </div>
              </div>
            </div>

            {/* Divider */}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <ContactButton
                  icon={Phone}
                  type="telefon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (lawFirm.telefon)
                      window.location.href = `tel:${lawFirm.telefon}`;
                  }}
                />
                <ContactButton
                  icon={Mail}
                  type="email"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (lawFirm.email)
                      window.location.href = `mailto:${lawFirm.email}`;
                  }}
                />
                <ContactButton
                  icon={Globe}
                  type="strona"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (lawFirm.stronaWww)
                      window.open(lawFirm.stronaWww, "_blank");
                  }}
                />
              </div>

              <div className="bg-[#058c80] text-white rounded-lg p-2.5 shadow-md transition-all duration-300 hover:bg-[#04756b] flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
