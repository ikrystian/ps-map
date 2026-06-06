"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Eye,
  MapPin
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BlogPost } from '@/types/blog';



export default function BlogPostPage() {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog/posts/${slug}`);

      if (response.status === 404) {
        setError("Nie znaleziono artykułu");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else {
        throw new Error("Błąd pobierania artykułu");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      setError("Wystąpił błąd podczas ładowania artykułu");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Set up Scroll-driven animations
  const { scrollY, scrollYProgress } = useScroll();

  // Spring settings for smooth progress bar
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Parallax calculations for hero image
  const imageY = useTransform(scrollY, [0, 600], [0, 180]);
  const imageScale = useTransform(scrollY, [0, 600], [1, 1.1]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg animate-pulse text-muted-foreground">
            Ładowanie artykułu...
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-16 bg-background-sec border border-neutral-800/60 rounded-3xl max-w-xl mx-auto p-8 backdrop-blur-sm shadow-xl">
          <h2 className="text-2xl font-bold mb-2 font-playfair text-white">
            Artykuł nie znaleziony
          </h2>
          <p className="text-muted-foreground mb-6">
            {error || "Nie można znaleźć tego artykułu"}
          </p>
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6"
          >
            <Link href="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Wróć do bloga
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate estimated reading time (assuming 200 words per minute)
  const estimatedReadingTime = post
    ? Math.ceil(post.tresc.replace(/<[^>]*>/g, "").split(/\s+/).length / 200)
    : 0;

  return (
    <div className="min-h-screen bg-background-sec text-neutral-100 selection:bg-primary/30 selection:text-primary-foreground antialiased pb-20">
      {/* Reading progress bar */}
      <motion.div
        className="fixed top-[65px] left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-teal-400 to-primary origin-left z-50 shadow-[0_0_8px_rgba(13,161,146,0.3)]"
        style={{ scaleX }}
      />

      {/* Hero Section with Featured Image / Parallax */}
      {post.obrazekWyrozniajacy ? (
        <div className="relative h-[55vh] min-h-[400px] max-h-[600px] w-full overflow-hidden bg-neutral-950">
          {/* Parallax Image wrapper */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{
              backgroundImage: `url(${post.obrazekWyrozniajacy})`,
              y: imageY,
              scale: imageScale,
            }}
          />
          {/* Immersive overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/55 to-background-sec" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a09]/95 via-[#0a0a09]/40 to-transparent pointer-events-none" />

          <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-10">
            <div className="max-w-4xl">
              {/* Category & Breadcrumbs */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  Blog
                </Link>
                <span className="text-neutral-600 text-xs">/</span>
                {post.category && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border border-primary/20 text-sm uppercase tracking-wider font-semibold hover:bg-primary/20 px-2.5 py-0.5"
                  >
                    {post.category.nazwa}
                  </Badge>
                )}
                {post.isSponsored && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm uppercase tracking-wider font-semibold px-2.5 py-0.5 animate-pulse"
                  >
                    Sponsorowany
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="font-playfair text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-8">
                {post.tytul}
              </h1>

              {/* Author & Stats bar */}
              <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-sm text-neutral-300 border-t border-white/10 pt-6">
                {/* Author Info */}
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-neutral-900 flex-shrink-0 flex items-center justify-center">
                    {post.lawFirm && post.lawFirm.logo ? (
                      <img
                        src={post.lawFirm.logo}
                        alt={post.lawFirm.nazwa}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-4 h-4 text-primary/80" />
                    )}
                  </div>
                  {post.lawFirm ? (
                    <Link
                      href={`/ekspert/${post.lawFirm.slug}`}
                      className="font-medium text-white hover:text-primary transition-colors"
                    >
                      {post.lawFirm.nazwa}
                    </Link>
                  ) : (
                    <span className="font-medium text-white">Administracja</span>
                  )}
                </div>

                <div className="w-1.5 h-1.5 rounded-full bg-neutral-700 hidden sm:block" />

                {/* Date */}
                <div className="flex items-center gap-2 text-neutral-455">
                  <Calendar className="w-4 h-4 text-primary/80" />
                  <span>{formatDate(post.dataPublikacji)}</span>
                </div>

                <div className="w-1.5 h-1.5 rounded-full bg-neutral-700 hidden sm:block" />

                {/* Views */}
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary/80" />
                  <span>{post.wyswietlenia} wyświetleń</span>
                </div>

                {estimatedReadingTime > 0 && (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-700 hidden sm:block" />
                    {/* Reading Time */}
                    <div className="flex items-center gap-2">
                      <span>📖</span>
                      <span>{estimatedReadingTime} min czytania</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Typographic Text Hero Fallback */
        <div className="relative border-b border-neutral-900/60 bg-gradient-to-br from-[#121211] via-[#0a0a09] to-[#0d0d0c] py-20 overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-primary/5 blur-[90px] pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-[280px] h-[280px] rounded-full bg-teal-500/3 blur-[90px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl">
              {/* Category & Breadcrumbs */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  Blog
                </Link>
                <span className="text-neutral-600 text-xs">/</span>
                {post.category && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border border-primary/20 text-sm uppercase tracking-wider font-semibold hover:bg-primary/20 px-2.5 py-0.5"
                  >
                    {post.category.nazwa}
                  </Badge>
                )}
                {post.isSponsored && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm uppercase tracking-wider font-semibold px-2.5 py-0.5 animate-pulse"
                  >
                    Sponsorowany
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="font-playfair text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight mb-8">
                {post.tytul}
              </h1>

              {/* Author & Stats bar */}
              <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-sm text-neutral-300 border-t border-neutral-800/80 pt-6">
                {/* Author Info */}
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-neutral-850 bg-neutral-900 flex-shrink-0 flex items-center justify-center">
                    {post.lawFirm && post.lawFirm.logo ? (
                      <img
                        src={post.lawFirm.logo}
                        alt={post.lawFirm.nazwa}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-4 h-4 text-primary/80" />
                    )}
                  </div>
                  {post.lawFirm ? (
                    <Link
                      href={`/ekspert/${post.lawFirm.slug}`}
                      className="font-medium text-white hover:text-primary transition-colors"
                    >
                      {post.lawFirm.nazwa}
                    </Link>
                  ) : (
                    <span className="font-medium text-white">Administracja</span>
                  )}
                </div>

                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 hidden sm:block" />

                {/* Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary/80" />
                  <span>{formatDate(post.dataPublikacji)}</span>
                </div>

                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 hidden sm:block" />

                {/* Views */}
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary/80" />
                  <span>{post.wyswietlenia} wyświetleń</span>
                </div>

                {estimatedReadingTime > 0 && (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 hidden sm:block" />
                    {/* Reading Time */}
                    <div className="flex items-center gap-2">
                      <span>📖</span>
                      <span>{estimatedReadingTime} min czytania</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Container */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Article Content */}
          <div className="lg:col-span-2 space-y-8">
            <article className="bg-[#151513]/40 border border-neutral-800/40 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-sm">
              <div
                className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-playfair prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-white prose-p:text-neutral-300 dark:prose-p:text-neutral-350 prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-white prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-neutral-300 prose-img:rounded-2xl prose-img:shadow-2xl prose-li:text-neutral-300"
                dangerouslySetInnerHTML={{ __html: post.tresc }}
              />

              <Separator className="my-10 bg-neutral-800/60" />

              {/* Article footer metadata info */}
              <div className="flex items-center justify-between flex-wrap gap-4 text-sm text-neutral-450 bg-neutral-900/20 p-5 rounded-2xl border border-neutral-800/30">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>
                    Artykuł przygotowany przez{" "}
                    {post.lawFirm ? (
                      <Link
                        href={`/ekspert/${post.lawFirm.slug}`}
                        className="font-semibold text-white hover:text-primary hover:underline transition-colors"
                      >
                        {post.lawFirm.nazwa}
                      </Link>
                    ) : (
                      <span className="font-semibold text-white">zespół redakcyjny</span>
                    )}
                  </span>
                </div>
              </div>
            </article>

            {post.isSponsored && post.sponsoredLawFirm && (
              <div className="relative overflow-hidden bg-gradient-to-br from-[#1f1a0e]/60 to-[#0e0d0a] border border-amber-500/20 rounded-3xl p-8 shadow-2xl group transition-all duration-300 hover:border-amber-500/30">
                {/* Visual ambient glows */}
                <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-amber-500/10 blur-[70px] pointer-events-none" />
                <div className="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-yellow-500/5 blur-[70px] pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
                  {post.sponsoredLawFirm.logo ? (
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-amber-500/20 shadow-lg flex-shrink-0 bg-neutral-900 group-hover:border-amber-500/50 transition-colors">
                      <img
                        src={post.sponsoredLawFirm.logo}
                        alt={post.sponsoredLawFirm.nazwa}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-neutral-950 flex items-center justify-center border border-amber-500/20 shadow-lg flex-shrink-0">
                      <Building2 className="w-10 h-10 text-amber-500/60" />
                    </div>
                  )}

                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                        <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs uppercase tracking-wider font-semibold">
                          Partner merytoryczny publikacji
                        </Badge>
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {post.sponsoredLawFirm.miasto}
                        </span>
                      </div>
                      <h3 className="font-playfair text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                        {post.sponsoredLawFirm.nazwa}
                      </h3>
                      {post.sponsoredLawFirm.opis && (
                        <div
                          className="text-sm text-neutral-350 leading-relaxed line-clamp-3 about-description"
                          dangerouslySetInnerHTML={{ __html: post.sponsoredLawFirm.opis }}
                        />
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                      <Button
                        asChild
                        className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-xl px-6 py-6 transition-all shadow-lg hover:shadow-amber-500/20 text-sm font-semibold cursor-pointer border-0"
                      >
                        <Link href={`/ekspert/${post.sponsoredLawFirm.slug}`}>
                          Skonsultuj się z ekspertem
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="border-neutral-800 bg-[#0f0f0e]/50 hover:bg-neutral-850 hover:text-white text-neutral-350 rounded-xl px-6 py-6 transition-all text-sm cursor-pointer"
                      >
                        <Link href={`/ekspert/${post.sponsoredLawFirm.slug}#kontakt`}>
                          Zadaj pytanie online
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Premium CTA Block */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#13201e]/60 to-[#0e0e0d] border border-primary/20 rounded-3xl p-8 shadow-2xl group">
              {/* Blur accent glow */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-primary/10 blur-[70px] pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="max-w-xl">
                  <h3 className="font-playfair text-2xl md:text-3xl font-bold text-white mb-3">
                    Potrzebujesz pomocy prawnej?
                  </h3>
                  <p className="text-sm md:text-base text-neutral-300 leading-relaxed">
                    Skonsultuj się bezpośrednio z autorem tej publikacji lub
                    dodaj bezpłatnie opis swojej sprawy na platformie, a
                    zarejestrowani eksperci prawni sami zgłoszą się do Ciebie z
                    ofertami.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <Button
                    asChild
                    className="bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl px-6 py-6 transition-all shadow-lg hover:shadow-primary/20 text-sm font-semibold cursor-pointer"
                  >
                    <Link href={post.lawFirm ? `/ekspert/${post.lawFirm.slug}` : "/szukaj-prawnika"}>
                      {post.lawFirm ? "Zobacz profil eksperta" : "Znajdź eksperta"}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-neutral-800 bg-[#0f0f0e]/50 hover:bg-neutral-850 hover:text-white text-neutral-350 rounded-xl px-6 py-6 transition-all text-sm cursor-pointer"
                  >
                    <Link href="/dodaj-sprawe">
                      Opisz swoją sprawę za darmo
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Editorial Sidebar */}
          <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-[95px] h-fit">
            {post.isSponsored && post.sponsoredLawFirm ? (
              /* About Sponsor card */
              <div className="bg-[#1e1a0f]/60 border border-amber-500/20 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
                {/* Visual amber glow on hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none transition-opacity duration-300 group-hover:from-amber-500/25" />
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500/80 via-yellow-500/80 to-amber-500/80" />

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    {post.sponsoredLawFirm.logo ? (
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-amber-500/20 shadow-md flex-shrink-0 bg-neutral-900 group-hover:border-amber-500/50 transition-colors">
                        <img
                          src={post.sponsoredLawFirm.logo}
                          alt={post.sponsoredLawFirm.nazwa}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-neutral-950 flex items-center justify-center border border-neutral-800 shadow-md flex-shrink-0">
                        <Building2 className="w-8 h-8 text-amber-500/60" />
                      </div>
                    )}

                    <div>
                      <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs uppercase tracking-wider mb-1.5 font-semibold animate-pulse">
                        Sponsor artykułu
                      </Badge>
                      <h3 className="font-semibold text-white text-base leading-tight group-hover:text-amber-400 transition-colors">
                        {post.sponsoredLawFirm.nazwa}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1">
                        {post.sponsoredLawFirm.nazwaFirmy}
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-neutral-800/60" />

                  {/* Location */}
                  <div className="flex items-center gap-2.5 text-xs text-neutral-400">
                    <MapPin className="w-4 h-4 text-amber-500/80 flex-shrink-0" />
                    <span>
                      {post.sponsoredLawFirm.miasto}, woj. {post.sponsoredLawFirm.voivodeship.nazwa}
                    </span>
                  </div>

                  {/* Description excerpt */}
                  {post.sponsoredLawFirm.opis && (
                    <>
                      <Separator className="bg-neutral-800/60" />
                      <div
                        className="text-sm text-neutral-400 line-clamp-4 leading-relaxed about-description"
                        dangerouslySetInnerHTML={{ __html: post.sponsoredLawFirm.opis }}
                      />
                    </>
                  )}

                  {/* View Profile Button */}
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-xl py-5 transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer border-0"
                  >
                    <Link href={`/ekspert/${post.sponsoredLawFirm.slug}`}>
                      <Building2 className="w-4 h-4 mr-2" />
                      Zobacz profil sponsora
                    </Link>
                  </Button>
                </div>
              </div>
            ) : post.lawFirm ? (
              /* About Author card */
              <div className="bg-[#151513]/60 border border-neutral-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
                {/* Visual glow on hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none transition-opacity duration-300 group-hover:from-primary/20" />

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    {post.lawFirm.logo ? (
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-neutral-800/80 shadow-md flex-shrink-0 bg-neutral-900 group-hover:border-primary/40 transition-colors">
                        <img
                          src={post.lawFirm.logo}
                          alt={post.lawFirm.nazwa}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-neutral-950 flex items-center justify-center border border-neutral-800 shadow-md flex-shrink-0">
                        <Building2 className="w-8 h-8 text-neutral-500" />
                      </div>
                    )}

                    <div>
                      <Badge className="bg-primary/10 text-primary border border-primary/20 text-sm uppercase tracking-wider mb-1.5 font-semibold">
                        Ekspert prawny
                      </Badge>
                      <h3 className="font-semibold text-white text-base leading-tight group-hover:text-primary transition-colors">
                        {post.lawFirm.nazwa}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1">
                        {post.lawFirm.nazwaFirmy}
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-neutral-800/60" />

                  {/* Location */}
                  <div className="flex items-center gap-2.5 text-xs text-neutral-400">
                    <MapPin className="w-4 h-4 text-primary/80 flex-shrink-0" />
                    <span>
                      {post.lawFirm.miasto}, woj. {post.lawFirm.voivodeship.nazwa}
                    </span>
                  </div>

                  {/* Description excerpt */}
                  {post.lawFirm.opis && (
                    <>
                      <Separator className="bg-neutral-800/60" />
                      <div
                        className="text-sm text-neutral-400 line-clamp-4 leading-relaxed about-description"
                        dangerouslySetInnerHTML={{ __html: post.lawFirm.opis }}
                      />
                    </>
                  )}

                  {/* View Profile Button */}
                  <Button
                    asChild
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl py-5 transition-all shadow-lg hover:shadow-primary/20 cursor-pointer"
                  >
                    <Link href={`/ekspert/${post.lawFirm.slug}`}>
                      <Building2 className="w-4 h-4 mr-2" />
                      Zobacz profil eksperta
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              /* About Portal card */
              <div className="bg-[#151513]/60 border border-neutral-800/80 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none transition-opacity duration-300 group-hover:from-primary/20" />

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-950 flex items-center justify-center border border-neutral-800 shadow-md flex-shrink-0">
                      <Building2 className="w-8 h-8 text-primary" />
                    </div>

                    <div>
                      <Badge className="bg-primary/10 text-primary border border-primary/20 text-sm uppercase tracking-wider mb-1.5 font-semibold">
                        Administracja
                      </Badge>
                      <h3 className="font-semibold text-white text-base leading-tight">
                        Prosta Sprawa
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1">
                        Portal Pomocy Prawnej
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-neutral-800/60" />

                  <p className="text-sm text-neutral-400 leading-relaxed">
                    Nasz portal pomaga w szybkim znajdowaniu sprawdzonych ekspertów w całej Polsce.
                  </p>

                  <Button
                    asChild
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl py-5 transition-all shadow-lg hover:shadow-primary/20 cursor-pointer"
                  >
                    <Link href="/szukaj-prawnika">
                      <Building2 className="w-4 h-4 mr-2" />
                      Znajdź eksperta
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Contact CTA */}
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-primary/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

              <h4 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Szybki kontakt
              </h4>
              <p className="text-sm text-neutral-400 mb-5 leading-relaxed">
                {post.lawFirm
                  ? "Masz dodatkowe pytania? Wyślij wiadomość bezpośrednio do ekspercie."
                  : "Masz dodatkowe pytania? Wyślij wiadomość do redakcji portalu."
                }
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full border-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl py-5 transition-all cursor-pointer"
              >
                <Link href={post.lawFirm ? `/ekspert/${post.lawFirm.slug}#kontakt` : "/kontakt"}>
                  Napisz wiadomość
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
