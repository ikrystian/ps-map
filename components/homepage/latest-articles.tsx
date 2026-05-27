"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"

interface BlogPost {
  id: string
  tytul: string
  slug: string
  obrazekWyrozniajacy: string | null
  dataPublikacji?: string
  createdAt?: string
}

interface LatestArticlesProps {
  blogPosts: BlogPost[]
}

export function LatestArticles({ blogPosts }: LatestArticlesProps) {
  // Format dates using Intl.DateTimeFormat for better localization
  const getFormattedDate = (post: BlogPost) => {
    const dateStr = post.dataPublikacji || post.createdAt
    if (!dateStr) return ""
    const dateObj = new Date(dateStr)
    return new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(dateObj)
  }

  return (
    <section className="py-24 bg-transparent overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Header section with elegant title and divider line */}
          <div className="flex items-center gap-6 mb-12 w-full">
            <h2 className="text-2xl md:text-3xl font-playfair text-white tracking-wide font-medium">
              Prawo i finanse: <span
                className="italic font-light text-transparent"
                style={{ WebkitTextStroke: "1px rgba(255, 255, 255, 0.4)" }}
              >
                trendy i poradniki
              </span>
            </h2>
            <div className="h-[1px] bg-neutral-800 flex-grow" />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.length > 0 ? (
              blogPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`} className="block group">
                    <div className="relative overflow-hidden rounded-2xl aspect-[4/5] cursor-pointer shadow-2xl bg-neutral-900 transition-all duration-500">
                      {/* Background Image with subtle zoom on hover */}
                      <Image
                        src={post.obrazekWyrozniajacy || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop"}
                        alt={post.tytul}
                        fill
                        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />

                      {/* Sophisticated Dark Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

                      {/* Accent highlight on hover */}
                      <div className="absolute inset-0 bg-[#0da192]/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      {/* Content Container */}
                      <div className="absolute inset-0 flex flex-col justify-end p-8 text-white z-10">
                        {/* Elegant Gold/Amber Date */}
                        <span className="text-xs md:text-sm text-[#eab308]/90 font-medium mb-3 block tracking-widest uppercase">
                          {getFormattedDate(post)}
                        </span>

                        {/* Title with improved typography */}
                        <h3 className="font-semibold text-xl md:text-2xl leading-tight line-clamp-3 mb-6 group-hover:text-white transition-colors duration-300">
                          {post.tytul}
                        </h3>

                        {/* Animated "Read More" trigger */}
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-[1px] bg-[#0da192] transition-all duration-500 group-hover:w-16" />
                          <span className="text-sm font-medium text-white/80 group-hover:text-white flex items-center gap-1.5 transition-all duration-300">
                            Przeczytaj artykuł
                            <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        </div>
                      </div>

                      {/* Top border highlight on hover */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0da192]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-20 bg-neutral-900/50 rounded-2xl border border-neutral-800">
                <p className="text-neutral-500 font-medium">Brak artykułów do wyświetlenia</p>
              </div>
            )}
          </div>

          {/* Centered CTA button */}
          <div className="flex justify-center mt-16">
            <Link href="/blog">
              <InteractiveHoverButton>Zobacz wszystkie artykuły</InteractiveHoverButton>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
