"use client"

import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { motion } from "framer-motion"
import { ChevronRight, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { BlogPost } from '@/types/blog';



interface LatestArticlesProps {
  blogPosts: BlogPost[]
}

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

function ArticleCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/blog/${post.slug}`} className="block group">
        <div className="relative overflow-hidden rounded-2xl aspect-[5/4] md:aspect-[4/5] cursor-pointer shadow-2xl bg-card transition-all duration-500">
          {/* Background Image with subtle zoom on hover */}
          <Image
            src={post.obrazekWyrozniajacy || "/images/blog-placeholder.jpg"}
            alt={post.tytul}
            fill
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 33vw"
          />

          {/* Sophisticated Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

          {/* Accent highlight on hover */}
          <div className="absolute inset-0 bg-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Content Container */}
          <div className="on-dark absolute inset-0 flex flex-col justify-end p-8 text-foreground z-10">
            {/* Elegant Gold/Amber Date */}
            <span className="text-xs md:text-sm text-[#eab308]/90 font-medium mb-3 block tracking-widest uppercase">
              {getFormattedDate(post)}
            </span>

            {/* Title with improved typography */}
            <h3 className="font-semibold text-xl md:text-2xl leading-tight line-clamp-3 mb-6 group-hover:text-foreground transition-colors duration-300">
              {post.tytul}
            </h3>

            {/* Animated "Read More" trigger */}
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-[1px] bg-primary transition-all duration-500 group-hover:w-16" />
              <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground flex items-center gap-1.5 transition-all duration-300">
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
  )
}

export function LatestArticles({ blogPosts }: LatestArticlesProps) {
  const [showPromoted, setShowPromoted] = useState(false)
  const [promotedPosts, setPromotedPosts] = useState<BlogPost[]>([])
  const [loadingPromoted, setLoadingPromoted] = useState(false)
  const [fetchedPromoted, setFetchedPromoted] = useState(false)

  const handleShowMore = async () => {
    setShowPromoted(true)

    if (fetchedPromoted) return

    try {
      setLoadingPromoted(true)
      const response = await fetch("/api/blog/posts?sponsored=true&limit=6")
      if (response.ok) {
        const data = await response.json()
        setPromotedPosts(data.posts || [])
      }
    } catch (error) {
      console.error("Error fetching promoted articles:", error)
    } finally {
      setLoadingPromoted(false)
      setFetchedPromoted(true)
    }
  }

  return (
    <section className="py-8 lg:py-20 xl:py-24 bg-transparent overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Header section with elegant title and divider line */}
          <div className="flex items-center gap-6 mb-12 w-full">
            <h2 className="text-2xl md:text-3xl font-playfair text-foreground tracking-wide font-medium">
              Aktualności
            </h2>
            <div className="h-[1px] bg-muted flex-grow" />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {blogPosts.length > 0 ? (
              blogPosts.slice(0, 4).map((post, index) => (
                <ArticleCard key={post.id} post={post} index={index} />
              ))
            ) : (
              <div className="col-span-3 text-center py-20 bg-card/50 rounded-2xl border border-border">
                <p className="text-muted-foreground font-medium">Brak artykułów do wyświetlenia</p>
              </div>
            )}
          </div>

          {/* Promoted articles (revealed via "Pokaż więcej") */}
          {showPromoted && (
            <div className="mt-16">
              {/* Header section for promoted articles */}
              <div className="flex items-center gap-6 mb-12 w-full">
                <h3 className="text-2xl md:text-3xl font-playfair text-foreground tracking-wide font-medium">
                  Promowane artykuły
                </h3>
                <div className="h-[1px] bg-muted flex-grow" />
              </div>

              {loadingPromoted ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0da192]" />
                </div>
              ) : promotedPosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {promotedPosts.slice(0, 6).map((post, index) => (
                    <ArticleCard key={post.id} post={post} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-card/50 rounded-2xl border border-border">
                  <p className="text-muted-foreground font-medium">Brak promowanych artykułów</p>
                </div>
              )}
            </div>
          )}

          {/* Centered CTA button */}
          <div className="flex justify-center mt-16">
            {!showPromoted ? (
              <InteractiveHoverButton onClick={handleShowMore}>
                Pokaż więcej
              </InteractiveHoverButton>
            ) : (
              <Link href="/blog">
                <InteractiveHoverButton>Zobacz wszystkie artykuły</InteractiveHoverButton>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
