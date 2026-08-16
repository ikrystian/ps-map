"use client"

import { CategoryIcon } from "@/components/category-icon"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Category } from "@/types/categories"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { memo, useState } from "react"

interface BusinessCategoriesGridProps {
  categories: Category[]
}

// Link jako komponent motion — kafelek musi zostać bezpośrednim dzieckiem
// gridu, bo .business-categories-grid pozycjonuje kafelki przez `> *:nth-child()`.
const MotionLink = motion.create(Link)

// Kafelki wjeżdżają jeden po drugim, zamiast pojawiać się całą siatką naraz.
const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
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
    <MotionLink
      href={`/kategorie/${category.slug}`}
      variants={cardVariants}
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      data-area={gridArea}
      className={cn(
        "on-dark relative overflow-hidden rounded-lg group transition-all duration-300 ease-out",
        gridArea && `[grid-area:${gridArea}]`,
        aspectRatio,
        hovered !== null && hovered !== index && "md:blur-sm md:scale-[0.98]"
      )}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 md:group-hover:scale-110"
        style={(category.backgroundImageUrl || imageUrl) ? { backgroundImage: `url(${category.backgroundImageUrl || imageUrl})` } : undefined}
      />
      <div className={cn(
        "absolute inset-0 bg-[#002c22] transition-opacity duration-300",
        hovered === index ? "opacity-50" : "opacity-70"
      )} />
      <div className="relative h-full flex flex-col items-center justify-end md:justify-center p-3 md:p-6 gap-3">
        {/* Ikony Animate UI odtwarzają animację, gdy kafelek jest pod kursorem. */}
        <CategoryIcon
          ikona={category.ikona}
          ikonaUrl={category.ikonaUrl}
          animate={hovered === index}
          className="h-12 w-12 text-foreground hidden md:block"
          imageClassName="brightness-0 invert"
        />
        <h3 className="text-foreground font-playfair md:text-xl font-light text-center">{category.nazwa}</h3>
      </div>
    </MotionLink>
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
    <section className="py-8 md:py-16 lg:py-20 xl:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-12">
            <div className="flex items-center gap-6 mb-12">
              <h2 className="text-2xl md:text-3xl  font-light text-foreground sm:whitespace-nowrap font-playfair" id="categories-business">
                Popularne sprawy firmowe
              </h2>
              <div className="flex-grow border-t border-border/80" />
            </div>
          </div>

          {/* Desktop Grid Layout */}
          <motion.div
            className="business-categories-grid"
            variants={gridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
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
          </motion.div>

          <div className="text-right">
            <Button asChild variant="outline" size="lg" className="max-w-full h-auto min-h-11 whitespace-normal text-center">
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
