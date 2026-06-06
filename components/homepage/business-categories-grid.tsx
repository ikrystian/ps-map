"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Category } from "@/types/categories"
import { motion } from "framer-motion"
import { ArrowRight, icons } from "lucide-react"
import Link from "next/link"
import { memo, useState } from "react"

interface BusinessCategoriesGridProps {
  categories: Category[]
}

const BusinessCategoryCard = memo(({
  category,
  index,
  hovered,
  setHovered,
  gridArea,
  imageUrl,
  aspectRatio,
  titleClassName = "text-white text-xl font-bold text-center"
}: {
  category: Category,
  index: number,
  hovered: number | null,
  setHovered: (index: number | null) => void,
  gridArea?: string,
  imageUrl: string,
  aspectRatio?: string,
  titleClassName?: string
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
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundImage: `url(${category.backgroundImageUrl || imageUrl})` }}
      />
      <div className={cn(
        "absolute inset-0 bg-[#002c22] transition-opacity duration-300",
        hovered === index ? "opacity-50" : "opacity-70"
      )} />
      <div className="relative h-full flex flex-col items-center justify-center p-6 gap-3">
        {category.ikonaUrl ? (
          <img src={category.ikonaUrl} alt="" className="h-10 w-10 object-contain brightness-0 invert" />
        ) : category.ikona ? (
          (() => {
            const Icon = icons[category.ikona as keyof typeof icons]
            return Icon ? <Icon className="h-16 w-16 md:h-10 md:w-10 text-white" /> : null
          })()
        ) : null}
        <h3 className={titleClassName}>{category.nazwa}</h3>
      </div>
    </Link>
  )
})

BusinessCategoryCard.displayName = "BusinessCategoryCard"

export function BusinessCategoriesGrid({ categories }: BusinessCategoriesGridProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  const activeCategories = categories
    .filter((cat) => cat.wyswietlajNaGlownejFirmowe)
    .sort((a, b) => (a.kolejnosc ?? 0) - (b.kolejnosc ?? 0))
    .slice(0, 9);

  const desktopImages = [
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80',
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  ]

  const gridAreas = [
    "first", "second", "third", "fourth", "sixth", "seventh", "eighth", "nineth", "tenth"
  ]

  return (
    <section className="py-8 lg:py-16 bg-[#121212]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-12">
            <div className="flex items-center gap-6 mb-12">
              <h2 className="text-xl md:text-3xl  font-light text-zinc-100 whitespace-nowrap font-playfair">
                Popularne sprawy firmowe
              </h2>
              <div className="flex-grow border-t border-zinc-800/80" />
            </div>
          </div>

          {/* Desktop Grid Layout */}
          <div
            className="hidden lg:grid gap-4 max-w-full mx-auto mb-8 min-h-[500px]"
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
              <BusinessCategoryCard
                key={category.id}
                category={category}
                index={index}
                hovered={hovered}
                setHovered={setHovered}
                gridArea={gridAreas[index]}
                imageUrl={desktopImages[index]}
                titleClassName={index === 0 || index === 3 || index === 6 ? "text-white text-xl font-bold text-center" : "text-white text-xl font-bold text-center"}
              />
            ))}
          </div>

          {/* Tablet Grid Layout (3 columns) */}
          <div className="hidden md:grid lg:hidden grid-cols-3 gap-4 mb-8">
            {activeCategories.map((category, index) => (
              <BusinessCategoryCard
                key={category.id}
                category={category}
                index={index + 10}
                hovered={hovered}
                setHovered={setHovered}
                imageUrl={`https://images.unsplash.com/photo-${index % 2 === 0 ? '1507679799987-c73779587ccf' : '1553877522-43269d4ea984'}?w=800&q=80`}
                aspectRatio="aspect-video"
              />
            ))}
          </div>

          {/* Mobile Grid Layout (1 left + 2 right repeating) */}
          <div className="md:hidden mb-8 flex flex-col gap-4">
            {Array.from({ length: Math.ceil(activeCategories.length / 3) }, (_, groupIdx) => {
              const group = activeCategories.slice(groupIdx * 3, groupIdx * 3 + 3);
              const areaName = (i: number) => `g${groupIdx}i${i}`;
              const areas =
                group.length === 1
                  ? `"${areaName(0)}"`
                  : group.length === 2
                    ? `"${areaName(0)} ${areaName(1)}"`
                    : `"${areaName(0)} ${areaName(1)}" "${areaName(0)} ${areaName(2)}"`;
              return (
                <div
                  key={groupIdx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gridTemplateAreas: areas,
                    gap: "1rem",
                  }}
                >
                  {group.map((category, i) => {
                    const globalIndex = groupIdx * 3 + i + 20;
                    return (
                      <BusinessCategoryCard
                        key={category.id}
                        category={category}
                        index={globalIndex}
                        hovered={hovered}
                        setHovered={setHovered}
                        gridArea={areaName(i)}
                        imageUrl={`https://images.unsplash.com/photo-${globalIndex % 2 === 0 ? '1507679799987-c73779587ccf' : '1553877522-43269d4ea984'}?w=800&q=80`}
                        aspectRatio={i === 0 && group.length === 3 ? "" : "aspect-video"}
                        titleClassName="text-white text-xl font-bold text-center"
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="text-right">
            <Button asChild variant="outline" size="lg">
              <Link href="/kategorie">
                Zobacz wszystkie kategorie biznesowe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
