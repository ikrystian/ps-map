"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { BlogTocItem } from "@/lib/blog-toc";

// Jedyne klienckie fragmenty strony wpisu — reszta (treść, metadane,
// autor) renderuje się na serwerze w BlogPostView.

/** Liczy realną odsłonę, niezależnie od cache'owania wyrenderowanej strony. */
export function BlogPostViewTracker({ slug, disabled }: { slug: string; disabled?: boolean }) {
  useEffect(() => {
    if (disabled) return;
    fetch(`/api/blog/posts/${slug}/view`, { method: "POST", keepalive: true }).catch(() => {});
  }, [slug, disabled]);

  return null;
}

export function ReadingProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-[65px] left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-secondary to-primary origin-left z-50 shadow-xs"
      style={{ scaleX }}
    />
  );
}

export function ParallaxHeroImage({ src }: { src: string }) {
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 600], [0, 180]);
  const imageScale = useTransform(scrollY, [0, 600], [1, 1.1]);

  return (
    <motion.div
      className="absolute inset-0 bg-cover bg-center will-change-transform"
      style={{
        backgroundImage: `url(${src})`,
        y: imageY,
        scale: imageScale,
      }}
    />
  );
}

// Nagłówek sekcji staje się aktywny, gdy przekroczy 32% wysokości okna
const TOC_ACTIVE_LINE = 0.32;

/**
 * Spis treści wpisu: pionowa szyna wypełniająca się wraz z czytaniem treści
 * (od wejścia treści na 60% wysokości okna do jej końca na dole okna) i
 * podświetlenie sekcji, którą właśnie czytamy.
 */
export function BlogPostToc({ items, contentId }: { items: BlogTocItem[]; contentId: string }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const railRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const content = document.getElementById(contentId);
      if (!content) return;
      const viewport = window.innerHeight;
      const rect = content.getBoundingClientRect();

      const start = viewport * 0.6 - rect.top;
      const distance = rect.height - viewport * 0.4;
      const progress = distance > 0 ? Math.min(1, Math.max(0, start / distance)) : rect.top < viewport ? 1 : 0;
      if (railRef.current) railRef.current.style.transform = `scaleY(${progress})`;

      let current: string | null = null;
      for (const item of items) {
        const heading = document.getElementById(item.id);
        if (heading && heading.getBoundingClientRect().top <= viewport * TOC_ACTIVE_LINE) current = item.id;
      }
      setActiveId(current);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [items, contentId]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const heading = document.getElementById(id);
    if (!heading) return;
    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    heading.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav aria-label="Spis treści">
      <h2 className="mb-[18px] flex items-center gap-3 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-foreground">
        <span aria-hidden className="h-[2px] w-3.5 flex-none bg-primary" />
        Spis treści
      </h2>
      <div className="relative pl-5">
        <span aria-hidden className="absolute bottom-1 left-0 top-1 w-[2px] bg-border">
          <i
            ref={railRef}
            className="block h-full origin-top bg-primary transition-transform duration-[400ms] ease-out"
            style={{ transform: "scaleY(0)" }}
          />
        </span>
        <ol className="m-0 list-none p-0">
          {items.map((item, index) => {
            const isActive = item.id === activeId;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(event) => handleClick(event, item.id)}
                  aria-current={isActive ? "location" : undefined}
                  className={`grid grid-cols-[26px_minmax(0,1fr)] gap-1.5 py-[7px] text-[0.88rem] leading-[1.4] transition-[color,transform] duration-300 hover:translate-x-[3px] hover:text-primary ${isActive ? "font-bold text-foreground" : "text-muted-foreground"}`}
                >
                  <span
                    className={`text-[0.74rem] font-bold tabular-nums transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground/60"}`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
