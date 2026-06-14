"use client"

import type { BlogPost } from "@/types/blog"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"

interface BlogPostsSliderProps {
  blogPosts: BlogPost[]
}

export function BlogPostsSlider({ blogPosts }: BlogPostsSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.firstElementChild?.getBoundingClientRect().width || 300
      sliderRef.current.scrollBy({ left: -(cardWidth + 24), behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.firstElementChild?.getBoundingClientRect().width || 300
      sliderRef.current.scrollBy({ left: cardWidth + 24, behavior: "smooth" })
    }
  }

  if (!blogPosts.length) return null

  const getFormattedDate = (post: BlogPost) => {
    const dateStr = post.dataPublikacji || post.createdAt
    if (!dateStr) return ""
    return new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr))
  }

  return (
    <section className="py-12 lg:py-20 xl:py-24 bg-card border-t border-zinc-900/60 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl relative">

        <div className="flex items-center justify-between gap-6 mb-4 lg:mb-12 px-1">
          <h2 className="font-playfair text-2xl md:text-3xl lg:text-[34px] font-normal text-white tracking-wide whitespace-nowrap">
            Artykuły i porady prawne
          </h2>
          <div className="hidden md:block flex-grow border-t border-zinc-800/80" />
          <Link
            href="/blog"
            className="hidden md:flex items-center gap-1 text-sm text-[#0da192] hover:text-[#12c2b1] font-semibold whitespace-nowrap transition-colors"
          >
            Wszystkie artykuły <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative w-full px-1">
          <button
            onClick={scrollLeft}
            className="absolute -left-4 lg:-left-12 xl:-left-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg bg-[#008073] hover:bg-[#006f63] flex items-center justify-center text-white transition-all shrink-0 hover:scale-105 active:scale-95 cursor-pointer shadow-lg z-30"
            aria-label="Poprzedni artykuł"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="overflow-hidden">
            <div
              ref={sliderRef}
              className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-none py-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {blogPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="w-[calc(80%-12px)] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] shrink-0 snap-start group block"
                >
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-zinc-900 shadow-xl border border-zinc-800/60">
                    {post.obrazekWyrozniajacy ? (
                      <Image
                        src={post.obrazekWyrozniajacy}
                        alt={post.tytul}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                    <div className="absolute inset-0 flex flex-col justify-end p-5 z-10">
                      {post.category?.nazwa && (
                        <span className="text-[10px] font-bold text-[#0da192] tracking-[0.15em] uppercase mb-2 block">
                          {post.category.nazwa}
                        </span>
                      )}
                      <span className="text-[10px] text-yellow-400/80 font-medium mb-2 block tracking-wider uppercase">
                        {getFormattedDate(post)}
                      </span>
                      <h3 className="font-semibold text-sm leading-snug line-clamp-3 text-white group-hover:text-white/90 transition-colors mb-3">
                        {post.tytul}
                      </h3>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-6 h-[1px] bg-[#0da192] transition-all duration-500 group-hover:w-12" />
                        <span className="text-[11px] font-medium text-white/60 group-hover:text-white/80 flex items-center gap-1 transition-colors">
                          Czytaj dalej
                          <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <button
            onClick={scrollRight}
            className="absolute -right-4 lg:-right-12 xl:-right-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-lg bg-[#008073] hover:bg-[#006f63] flex items-center justify-center text-white transition-all shrink-0 hover:scale-105 active:scale-95 cursor-pointer shadow-lg z-30"
            aria-label="Następny artykuł"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-center mt-8 md:hidden">
          <Link
            href="/blog"
            className="flex items-center gap-1.5 text-sm text-[#0da192] hover:text-[#12c2b1] font-semibold transition-colors"
          >
            Wszystkie artykuły <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
