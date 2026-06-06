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
    gridArea,
    imageUrl,
    aspectRatio,
    titleClassName = "text-white text-xl font-bold text-center",
  }: {
    category: Category;
    index: number;
    hovered: number | null;
    setHovered: (index: number | null) => void;
    gridArea?: string;
    imageUrl: string;
    aspectRatio?: string;
    titleClassName?: string;
  }) => {
    return (
      <Link
        href={`/kategorie/${category.slug}`}
        onMouseEnter={() => setHovered(index)}
        onMouseLeave={() => setHovered(null)}
        style={{ gridArea: gridArea ?? undefined }}
        className={cn(
          "relative overflow-hidden rounded-lg group transition-all duration-300 ease-out",
          gridArea && `[grid-area:${gridArea}]`,
          aspectRatio,
          hovered !== null && hovered !== index && "blur-sm scale-[0.98]",
        )}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
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
        <div className="relative h-full flex flex-col items-center justify-center p-6 gap-3">
          {category.ikonaUrl ? (
            <img
              src={category.ikonaUrl}
              alt=""
              className="h-16 w-16 md:h-10  md:w-10 object-contain brightness-0 invert"
            />
          ) : category.ikona ? (
            (() => {
              const Icon = icons[category.ikona as keyof typeof icons];
              return Icon ? <Icon className="h-10 w-10 text-white" /> : null;
            })()
          ) : null}
          <h3 className={titleClassName}>{category.nazwa}</h3>
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

  const desktopImages = [
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80",
    "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&q=80",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&q=80",
  ];

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
              <h2 className="text-xl md:text-3xl  font-light text-zinc-100 whitespace-nowrap">
                Popularne sprawy prywatne
              </h2>
              <div className="flex-grow border-t border-zinc-800/80" />
            </div>
          </div>
          {/* Desktop Grid Layout */}
          <div
            className="hidden lg:grid grid-cols-6 grid-rows-2 gap-4 max-w-full mx-auto mb-8 min-h-[500px]"
            style={{
              display: undefined, // let Tailwind handle display
              gridTemplateColumns: "repeat(6, 1fr)",
              gridTemplateRows: "repeat(2, 1fr)",
              gridTemplateAreas:
                '"first second fourth sixth eighth nineth" ' +
                '"first third fourth seventh eighth tenth"',
            }}
          >
            {activeCategories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
                hovered={hovered}
                setHovered={setHovered}
                gridArea={gridAreas[index]}
                imageUrl={desktopImages[index]}
                titleClassName={
                  index === 0 || index === 3 || index === 6
                    ? "text-white text-xl font-bold text-center"
                    : "text-white text-xl font-bold text-center"
                }
              />
            ))}
          </div>

          {/* Tablet Grid Layout (3 columns) */}
          <div className="hidden md:grid lg:hidden grid-cols-3 gap-4 mb-8">
            {activeCategories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index + 10} // Different index range to avoid conflicts if needed, but separate grids
                hovered={hovered}
                setHovered={setHovered}
                imageUrl={`https://images.unsplash.com/photo-${index % 2 === 0 ? "1589829545856-d10d557cf95f" : "1450101499163-c8848c66ca85"}?w=800&q=80`}
                aspectRatio="aspect-video"
              />
            ))}
          </div>

          {/* Mobile Grid Layout (1 column) */}
          <div className="grid md:hidden grid-cols-1 gap-4 mb-8">
            {activeCategories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index + 20}
                hovered={hovered}
                setHovered={setHovered}
                imageUrl={`https://images.unsplash.com/photo-${index % 2 === 0 ? "1589829545856-d10d557cf95f" : "1450101499163-c8848c66ca85"}?w=800&q=80`}
                aspectRatio="aspect-video"
                titleClassName="text-white text-xl font-bold text-center"
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
