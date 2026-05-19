"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import type { Category } from "@/types/categories"

interface BusinessCategoriesGridProps {
  categories: Category[]
}

export function BusinessCategoriesGrid({ categories }: BusinessCategoriesGridProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Kategorie dla firm i przedsiębiorców
            </h2>
            <p className="text-xl text-muted-foreground">
              Profesjonalna obsługa prawna dla biznesu
            </p>
          </div>

          {/* Desktop Grid Layout */}
          <div
            className="hidden lg:grid grid-cols-6 grid-rows-2 gap-4 max-w-full mx-auto mb-8 min-h-[500px]"
            style={{
              gridTemplateAreas: `
                "first second fourth sixth eighth nineth"
                "first third fourth seventh eighth tenth"
               `
            }}
          >
            {/* First */}
            {categories[9] && (
              <Link
                href={`/kategorie/${categories[9].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:first]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-xl font-bold text-center">{categories[9].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Second */}
            {categories[10] && (
              <Link
                href={`/kategorie/${categories[10].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:second]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{categories[10].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Third */}
            {categories[11] && (
              <Link
                href={`/kategorie/${categories[11].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:third]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{categories[11].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Fourth */}
            {categories[12] && (
              <Link
                href={`/kategorie/${categories[12].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:fourth]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-xl font-bold text-center">{categories[12].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Sixth */}
            {categories[13] && (
              <Link
                href={`/kategorie/${categories[13].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:sixth]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{categories[13].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Seventh */}
            {categories[14] && (
              <Link
                href={`/kategorie/${categories[14].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:seventh]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{categories[14].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Eighth */}
            {categories[15] && (
              <Link
                href={`/kategorie/${categories[15].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:eighth]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-xl font-bold text-center">{categories[15].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Nineth */}
            {categories[16] && (
              <Link
                href={`/kategorie/${categories[16].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:nineth]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{categories[16].nazwa}</h3>
                </div>
              </Link>
            )}

            {/* Tenth */}
            {categories[17] && (
              <Link
                href={`/kategorie/${categories[17].slug}`}
                className="relative overflow-hidden rounded-lg group [grid-area:tenth]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80)'
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{categories[17].nazwa}</h3>
                </div>
              </Link>
            )}
          </div>

          {/* Tablet Grid Layout (3 columns) */}
          <div className="hidden md:grid lg:hidden grid-cols-3 gap-4 mb-8">
            {categories.slice(9, 18).map((category, index) => (
              <Link
                key={category.id}
                href={`/kategorie/${category.slug}`}
                className="relative overflow-hidden rounded-lg group aspect-video"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(https://images.unsplash.com/photo-${index % 2 === 0 ? '1507679799987-c73779587ccf' : '1553877522-43269d4ea984'}?w=800&q=80)`
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-lg font-bold text-center">{category.nazwa}</h3>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile Grid Layout (1 column) */}
          <div className="grid md:hidden grid-cols-1 gap-4 mb-8">
            {categories.slice(9, 18).map((category, index) => (
              <Link
                key={category.id}
                href={`/kategorie/${category.slug}`}
                className="relative overflow-hidden rounded-lg group aspect-video"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(https://images.unsplash.com/photo-${index % 2 === 0 ? '1507679799987-c73779587ccf' : '1553877522-43269d4ea984'}?w=800&q=80)`
                  }}
                />
                <div className="absolute inset-0 bg-[var(--primary)] opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <h3 className="text-white text-xl font-bold text-center">{category.nazwa}</h3>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
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
