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
}: {
  category: Category,
  index: number,
  hovered: number | null,
  setHovered: (index: number | null) => void,
  gridArea?: string,
  imageUrl: string | undefined | null,
  aspectRatio?: string,
}) => {
  return (
    <Link
      href={`/kategorie/${category.slug}`}
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      data-area={gridArea}
      className={cn(
        "relative overflow-hidden rounded-lg group transition-all duration-300 ease-out",
        gridArea && `[grid-area:${gridArea}]`,
        aspectRatio,
        hovered !== null && hovered !== index && "md:blur-sm md:scale-[0.98]"
      )}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 md:group-hover:scale-110"
        style={{ backgroundImage: `url(${category.backgroundImageUrl || imageUrl})` }}
      />
      <div className={cn(
        "absolute inset-0 bg-[#002c22] transition-opacity duration-300",
        hovered === index ? "opacity-50" : "opacity-70"
      )} />
      <div className="relative h-full flex flex-col items-center justify-end md:justify-center p-3 md:p-6 gap-3">
        {category.ikonaUrl ? (
          <img src={category.ikonaUrl} alt="" className="h-10 w-10 object-contain brightness-0 invert hidden md:block" />
        ) : category.ikona ? (
          (() => {
            const Icon = icons[category.ikona as keyof typeof icons]
            return Icon ? <Icon className="h-16 w-16 md:h-10 md:w-10 text-white hidden md:block" /> : null
          })()
        ) : null}
        <h3 className="text-white text-md md:text-xl font-bold text-center">{category.nazwa}</h3>
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
            className="business-categories-grid"
          >
            {activeCategories.map((category, index) => (
              <BusinessCategoryCard
                key={category.id}
                category={category}
                index={index}
                hovered={hovered}
                setHovered={setHovered}
                gridArea={gridAreas[index]}
                imageUrl={category.backgroundImageUrl}
              />
            ))}
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
