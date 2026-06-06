"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/categories";
import { motion } from "framer-motion";
import { ArrowRight, icons } from "lucide-react";
import Link from "next/link";
import { memo, useState } from "react";

interface CategoriesGridProps {
  categories: Category[];
}

const CategoryCard = memo(
  ({
    category,
    index,
    hovered,
    setHovered,
    imageUrl,
    dataArea,
  }: {
    category: Category;
    index: number;
    hovered: number | null;
    setHovered: (index: number | null) => void;
    imageUrl: string | undefined | null;
    dataArea?: string;
  }) => {
    return (
      <Link
        href={`/kategorie/${category.slug}`}
        onMouseEnter={() => setHovered(index)}
        onMouseLeave={() => setHovered(null)}
        data-area={dataArea}
        className={cn(
          "relative overflow-hidden rounded-lg group transition-all duration-300 ease-out",
          hovered !== null && hovered !== index && "md:blur-sm md:scale-[0.98]",
        )}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 md:group-hover:scale-110"
          style={{
            backgroundImage: `url(${category.backgroundImageUrl || imageUrl})`,
          }}
        />
        <div
          className={cn(
            "absolute inset-0 bg-black/60 transition-all duration-300",
            hovered === index ? "bg-black/50" : "bg-black/60",
          )}
        />
        <div className="relative h-full flex flex-col items-center justify-end md:justify-center p-3 md:p-6 gap-3">
          {category.ikonaUrl ? (
            <img
              src={category.ikonaUrl}
              alt=""
              className="h-10 w-10 object-contain brightness-0 invert hidden md:block"
            />
          ) : category.ikona ? (
            (() => {
              const Icon = icons[category.ikona as keyof typeof icons];
              return Icon ? <Icon className="h-10 w-10 text-white hidden md:block" /> : null;
            })()
          ) : null}
          <h3 className="text-white text-md md:text-xl font-bold text-center">{category.nazwa}</h3>
        </div>
      </Link>
    );
  },
);

CategoryCard.displayName = "CategoryCard";

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const activeCategories = categories
    .filter((cat) => cat.wyswietlajNaGlownejPrywatne)
    .sort((a, b) => (a.kolejnosc ?? 0) - (b.kolejnosc ?? 0))
    .slice(0, 9);


  const gridAreas = [
    "first",
    "second",
    "third",
    "fourth",
    "sixth",
    "seventh",
    "eighth",
    "nineth",
    "tenth",
  ];

  return (
    <section className="py-8 lg:py-16 bg-[#121212]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >

          <div className="mb-16 flex flex-col-reverse lg:flex-row lg:items-stretch lg:justify-between gap-8 lg:gap-12">
            {/* Left side: Paragraph */}
            <div className="flex-1 flex items-center lg:pr-8">
              <p className="text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed font-sans max-w-xl">
                Prosta Sprawa to nie tylko portal – to Twój partner w
                rozwiązywaniu problemów prawnych. Dołącz do grona zadowolonych
                klientów, którzy z nami wygrywają. Spróbuj, a przekonasz się,
                jak łatwo i skutecznie możemy rozwiązać{" "}
                <strong className="text-zinc-100 font-semibold">
                  Twoją sprawę!
                </strong>
              </p>
            </div>

            {/* Vertical separator */}
            <div className="hidden lg:block w-[1px] bg-zinc-800/80 self-stretch my-2" />

            {/* Right side: Label & Title */}
            <div className="flex-1 flex flex-col justify-center gap-2 lg:pl-8">
              <span className="text-xs font-semibold tracking-[0.25em] text-[#eab308] uppercase">
                O NAS
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-playfair font-light text-white leading-tight">
                Znajdź prawnika, rozwiąż problem: Prosta Sprawa
              </h2>
            </div>
          </div>
          <div className="mb-12">
            <div className="flex items-center gap-6 mb-12">
              <h2 className="text-xl md:text-3xl  font-light text-zinc-100 whitespace-nowrap font-playfair">
                Popularne sprawy prywatne
              </h2>
              <div className="flex-grow border-t border-zinc-800/80" />
            </div>
          </div>
          {/* Unified responsive grid — layout handled via CSS (.categories-grid in globals.css) */}
          <div className="categories-grid">
            {activeCategories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
                hovered={hovered}
                setHovered={setHovered}
                imageUrl={category.backgroundImageUrl}
                dataArea={gridAreas[index]}
              />
            ))}
          </div>

          <div className="text-right">
            <Button asChild variant="outline" size="lg">
              <Link href="/kategorie">
                Zobacz wszystkie kategorie
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
