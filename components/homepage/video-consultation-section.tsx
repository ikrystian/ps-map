"use client";

import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { motion } from "framer-motion";
import {
  FileText,
  Lock,
  MessageSquare,
  Mic,
  PhoneOff,
  ScreenShare,
  ShieldCheck,
  Video,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function useLiveTimer(startSeconds: number) {
  const [seconds, setSeconds] = useState(startSeconds);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

const ToolButton = ({
  icon: Icon,
  label,
  highlight,
  end,
  badge,
}: {
  icon: React.ElementType;
  label?: string;
  highlight?: boolean;
  end?: boolean;
  badge?: number;
}) => (
  <div
    className={`relative flex items-center gap-1.5 rounded-full px-3 py-2 text-white transition-colors ${end
      ? "bg-red-500/90 hover:bg-red-500"
      : highlight
        ? "bg-[#C5A66F] text-black hover:bg-[#d4b884]"
        : "bg-white/10 hover:bg-white/20"
      }`}
  >
    <Icon className="w-4 h-4" />
    {label && <span className="hidden sm:inline text-xs font-medium">{label}</span>}
    {badge !== undefined && (
      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0da192] text-[10px] font-bold text-white">
        {badge}
      </span>
    )}
  </div>
);

export function VideoConsultationSection() {
  const timer = useLiveTimer(18 * 60 + 42);

  return (
    <section className="bg-[#121212] text-white py-8 lg:py-20 xl:py-24 overflow-hidden relative">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0da192]/40 bg-[#0da192]/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#0da192] uppercase mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0da192] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0da192]" />
            </span>
            Wideo-konsultacje na żywo
          </span>
          <h2 className="text-3xl md:text-4xl font-playfair font-light mb-4">
            Rozmowa z ekspertem bez instalowania żadnych aplikacji
          </h2>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Klikasz link i od razu łączysz się w przeglądarce. Bezpieczne, szyfrowane
            połączenie HD z podglądem dokumentów – tak, jakbyście siedzieli w jednym pokoju.
          </p>
        </motion.div>

        {/* Laptop / meeting mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-white/10 bg-[#0b0b0c] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] overflow-hidden">
            {/* App header */}
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-white/10 bg-[#111113]">
              <div className="flex items-center gap-2 text-xs min-w-0">
                <span className="flex items-center gap-1 rounded bg-red-500/15 text-red-400 px-1.5 py-0.5 font-bold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  LIVE
                </span>
                <span className="font-semibold text-white shrink-0">ProstaSprawa Meet HD</span>
                <span className="text-gray-600 hidden sm:inline">•</span>
                <span className="text-gray-400 hidden sm:inline truncate">
                  Porada Prawna: Jan Kowalski
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-400 shrink-0">
                <span className="hidden sm:flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Szyfrowanie E2E
                </span>
                <span className="font-mono text-[#0da192]">{timer}</span>
              </div>
            </div>

            {/* Video streams */}
            <div className="relative grid grid-cols-2 gap-px bg-white/5">
              <div className="relative aspect-[4/3] bg-black">
                <Image
                  src="/images/lawyer_video.png"
                  alt="Ekspert – wideorozmowa"
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute top-2 left-2 rounded bg-[#C5A66F] text-black text-[10px] font-bold px-2 py-0.5">
                  Ekspert
                </span>
                <span className="absolute top-2 right-2 rounded bg-black/60 text-white text-[10px] px-1.5 py-0.5">
                  1080p 60fps
                </span>
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded bg-black/60 pl-2 pr-1.5 py-1 text-[11px] text-white">
                  r. pr. Jan Kowalski
                  <span className="flex items-end gap-[2px] h-2.5">
                    <span className="w-[2px] h-[40%] bg-[#0da192] rounded-sm animate-pulse" />
                    <span className="w-[2px] h-[90%] bg-[#0da192] rounded-sm animate-pulse [animation-delay:0.15s]" />
                    <span className="w-[2px] h-[60%] bg-[#0da192] rounded-sm animate-pulse [animation-delay:0.3s]" />
                    <span className="w-[2px] h-full bg-[#0da192] rounded-sm animate-pulse [animation-delay:0.45s]" />
                  </span>
                </div>
              </div>
              <div className="relative aspect-[4/3] bg-black">
                <Image
                  src="/images/client_video.png"
                  alt="Klient – wideorozmowa"
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute top-2 left-2 rounded bg-white/15 text-white text-[10px] font-bold px-2 py-0.5">
                  Klient
                </span>
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded bg-black/60 px-2 py-1 text-[11px] text-white">
                  Anna Wiśniewska <span>🎤</span>
                </div>
              </div>

              {/* Shared document overlay */}
              <div className="hidden md:flex absolute right-3 bottom-3 w-56 flex-col rounded-lg border border-white/10 bg-[#151517]/95 backdrop-blur px-3 py-2 shadow-lg">
                <div className="flex items-center gap-1.5 text-[11px] text-[#C5A66F] font-semibold mb-1.5">
                  <FileText className="w-3 h-3" /> Udostępniony dokument
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-red-500/20 text-red-400 text-[9px] font-bold px-1.5 py-1 shrink-0">
                    PDF
                  </span>
                  <div className="text-[11px] leading-tight min-w-0">
                    <div className="text-white font-medium truncate">
                      Projekt_Umowy.pdf
                    </div>
                    <div className="text-gray-500">Strona 3 z 8 • Podgląd na żywo</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 border-t border-white/10 bg-[#111113] px-4 py-3">
              <ToolButton icon={Mic} />
              <ToolButton icon={Video} />
              <ToolButton icon={ScreenShare} label="Ekran" highlight />
              <ToolButton icon={MessageSquare} badge={2} />
              <ToolButton icon={PhoneOff} end />
            </div>
          </div>
        </motion.div>

        {/* Trust row + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-6"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0da192]" /> Bez instalowania aplikacji
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#0da192]" /> Szyfrowane połączenie HD
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#0da192]" /> Podgląd dokumentów na żywo
            </span>
          </div>
          <Link href="/szukaj-prawnika">
            <InteractiveHoverButton>Umów wideokonsultację</InteractiveHoverButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
