"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { InteractiveHoverButton } from "../ui/interactive-hover-button"

interface LatestArticlesProps {
  blogPosts: any[]
}

export function LatestArticles({ blogPosts }: LatestArticlesProps) {
  // Format dates to Polish genitive month format with a comma, e.g. "17 sierpnia, 2023"
  const getFormattedDate = (post: any) => {
    const dateObj = post.dataPublikacji ? new Date(post.dataPublikacji) : new Date(post.createdAt)
    const formattedString = dateObj.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    // formattedString is like "17 sierpnia 2023". Let's replace the last space with ", " to make it "17 sierpnia, 2023"
    return formattedString.replace(/ (\d{4})$/, ", $1")
  }

  return (
    <section className="py-20 bg-transparent overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Header section with elegant title and divider line */}
          <div className="flex items-center gap-6 mb-10 w-full">
            <h2 className="text-xl md:text-2xl font-playfair text-neutral-200 tracking-wide whitespace-nowrap font-medium">
              Prawo i finanse: trendy, poradniki, artykuły
            </h2>
            <div className="h-[1px] bg-white flex-grow" />
          </div>

          {/* Cards slider/grid container */}
          <div className="relative">
            {/* Left Chevron overlay */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white/90 pointer-events-none hidden md:block">
              <ChevronLeft className="h-6 w-6 stroke-[2]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.length > 0 ? (
                blogPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <div className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer shadow-lg bg-neutral-900 transition-all duration-300">
                        {/* Background Image */}
                        <img
                          src={post.obrazekWyrozniajacy || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop"}
                          alt={post.tytul}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />

                        {/* Rich Forest Green Gradient Overlay (Color to Transparency) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#09352c] via-[#09352c]/95 via-[#09352c]/65 to-transparent transition-opacity duration-300 group-hover:opacity-95" />

                        {/* Content Container */}
                        <div className="absolute inset-0 flex flex-col justify-end align-end p-6 md:p-8 text-white z-10">
                          {/* Beautiful Muted Lavender/Pink Date with high contrast */}
                          <span className="text-xs md:text-sm text-pink-200/90 font-medium mb-3 block tracking-wide">
                            {getFormattedDate(post)}
                          </span>

                          {/* Bold Title */}
                          <h3 className="font-semibold text-lg md:text-3xl leading-snug line-clamp-3 mb-6 group-hover:text-white transition-colors">
                            {post.tytul}
                          </h3>

                          {/* Bottom CTA read link with line animation */}
                          <div className="flex items-center gap-3 pt-4">
                            <div className="w-12 h-[1px] bg-white/60 transition-all duration-300 group-hover:w-16" />
                            <span className="text-sm font-medium text-white flex items-center gap-1.5">
                              Przeczytaj
                              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-muted-foreground">Brak artykułów do wyświetlenia</p>
                </div>
              )}
            </div>

            {/* Right Chevron overlay */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-white/90 pointer-events-none hidden md:block">
              <ChevronRight className="h-6 w-6 stroke-[2]" />
            </div>
          </div>

          {/* Centered teal CTA button at the bottom */}
          <div className="flex justify-center mt-12">
            <Link href={"/blog"}>
              <InteractiveHoverButton>Więcej praktycznych porad</InteractiveHoverButton>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}



