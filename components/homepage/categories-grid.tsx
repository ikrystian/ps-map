"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import type { Category } from "@/types/categories"

interface CategoriesGridProps {
  categories: Category[]
}

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <section className="py-16 bg-card/50">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Wybierz kategorię prawną
            </h2>
            <p className="text-xl text-muted-foreground">
              Znajdź eksperta w wybranej dziedzinie prawa
            </p>
          </div>

          {/* Desktop Grid Layout */}
          <div
            className="hidden lg:grid grid-cols-6 grid-rows-3 gap-4 max-w-7xl mx-auto mb-8 min-h-[600px]"
            style={{
              gridTemplateAreas: `
                "first second fourth sixth eighth nineth"
                "first third fourth seventh eighth tenth"
                ". . . . . ."
              `
            }}
          >
          {/* First */}
          {categories[0] && (
            <Link
              href={`/kategorie/${categories[0].slug}`}
              className="relative overflow-hidden rounded-lg group [grid-area:first]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80)'
                }}
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
              <div className="relative h-full flex items-center justify-center p-6">
                <h3 className="text-white text-xl font-bold text-center">{categories[0].nazwa}</h3>
              </div>
            </Link>
          )}

          {/* Second */}
          {categories[1] && (
            <Link
              href={`/kategorie/${categories[1].slug}`}
              className="relative overflow-hidden rounded-lg group [grid-area:second]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80)'
                }}
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
              <div className="relative h-full flex items-center justify-center p-6">
                <h3 className="text-white text-lg font-bold text-center">{categories[1].nazwa}</h3>
              </div>
            </Link>
          )}

          {/* Third */}
          {categories[2] && (
            <Link
              href={`/kategorie/${categories[2].slug}`}
              className="relative overflow-hidden rounded-lg group [grid-area:third]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80)'
                }}
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
              <div className="relative h-full flex items-center justify-center p-6">
                <h3 className="text-white text-lg font-bold text-center">{categories[2].nazwa}</h3>
              </div>
            </Link>
          )}

          {/* Fourth */}
          {categories[3] && (
            <Link
              href={`/kategorie/${categories[3].slug}`}
              className="relative overflow-hidden rounded-lg group [grid-area:fourth]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&q=80)'
                }}
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
              <div className="relative h-full flex items-center justify-center p-6">
                <h3 className="text-white text-xl font-bold text-center">{categories[3].nazwa}</h3>
              </div>
            </Link>
          )}

          {/* Sixth */}
          {categories[4] && (
            <Link
              href={`/kategorie/${categories[4].slug}`}
              className="relative overflow-hidden rounded-lg group [grid-area:sixth]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80)'
                }}
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
              <div className="relative h-full flex items-center justify-center p-6">
                <h3 className="text-white text-lg font-bold text-center">{categories[4].nazwa}</h3>
              </div>
            </Link>
          )}

          {/* Seventh */}
          {categories[5] && (
            <Link
              href={`/kategorie/${categories[5].slug}`}
              className="relative overflow-hidden rounded-lg group [grid-area:seventh]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80)'
                }}
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
              <div className="relative h-full flex items-center justify-center p-6">
                <h3 className="text-white text-lg font-bold text-center">{categories[5].nazwa}</h3>
              </div>
            </Link>
          )}

          {/* Eighth */}
          {categories[6] && (
            <Link
              href={`/kategorie/${categories[6].slug}`}
              className="relative overflow-hidden rounded-lg group [grid-area:eighth]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80)'
                }}
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
              <div className="relative h-full flex items-center justify-center p-6">
                <h3 className="text-white text-xl font-bold text-center">{categories[6].nazwa}</h3>
              </div>
            </Link>
          )}

          {/* Nineth */}
          {categories[7] && (
            <Link
              href={`/kategorie/${categories[7].slug}`}
              className="relative overflow-hidden rounded-lg group [grid-area:nineth]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80)'
                }}
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
              <div className="relative h-full flex items-center justify-center p-6">
                <h3 className="text-white text-lg font-bold text-center">{categories[7].nazwa}</h3>
              </div>
            </Link>
          )}

          {/* Tenth */}
          {categories[8] && (
            <Link
              href={`/kategorie/${categories[8].slug}`}
              className="relative overflow-hidden rounded-lg group [grid-area:tenth]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&q=80)'
                }}
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
              <div className="relative h-full flex items-center justify-center p-6">
                <h3 className="text-white text-lg font-bold text-center">{categories[8].nazwa}</h3>
              </div>
            </Link>
          )}
        </div>

        {/* Tablet Grid Layout (3 columns) */}
        <div className="hidden md:grid lg:hidden grid-cols-3 gap-4 mb-8">
          {categories.slice(0, 9).map((category, index) => (
            <Link
              key={category.id}
              href={`/kategorie/${category.slug}`}
              className="relative overflow-hidden rounded-lg group aspect-video"
              style={{
                backgroundImage: `url(https://images.unsplash.com/photo-${index % 2 === 0 ? '1589829545856-d10d557cf95f' : '1450101499163-c8848c66ca85'}?w=800&q=80)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
              <div className="relative h-full flex items-center justify-center p-6">
                <h3 className="text-white text-lg font-bold text-center">{category.nazwa}</h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile Grid Layout (1 column) */}
        <div className="grid md:hidden grid-cols-1 gap-4 mb-8">
          {categories.slice(0, 9).map((category, index) => (
            <Link
              key={category.id}
              href={`/kategorie/${category.slug}`}
              className="relative overflow-hidden rounded-lg group aspect-video"
              style={{
                backgroundImage: `url(https://images.unsplash.com/photo-${index % 2 === 0 ? '1589829545856-d10d557cf95f' : '1450101499163-c8848c66ca85'}?w=800&q=80)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />
              <div className="relative h-full flex items-center justify-center p-6">
                <h3 className="text-white text-xl font-bold text-center">{category.nazwa}</h3>
              </div>
            </Link>
          ))}
        </div>

          <div className="text-center">
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
  )
}
