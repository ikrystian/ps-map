"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Briefcase } from "lucide-react"
import { motion } from "framer-motion"

interface LatestArticlesProps {
  blogPosts: any[]
}

export function LatestArticles({ blogPosts }: LatestArticlesProps) {
  return (
    <section className="py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ostatnie artykuły
            </h2>
            <Button asChild variant="outline">
              <Link href="/blog">
                Zobacz wszystkie
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
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
                    <Card className="hover:shadow-lg transition-shadow h-full">
                      {post.obrazekWyrozniajacy ? (
                        <div className="aspect-video relative overflow-hidden rounded-t-lg">
                          <img
                            src={post.obrazekWyrozniajacy}
                            alt={post.tytul}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Briefcase className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <CardHeader>
                        {post.category && (
                          <Badge className="w-fit mb-2">{post.category.nazwa}</Badge>
                        )}
                        <CardTitle className="line-clamp-2">
                          {post.tytul}
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {post.metaDescription || post.tresc.substring(0, 150).replace(/<[^>]*>/g, '') + '...'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button asChild variant="ghost" size="sm">
                          <span>
                            Czytaj więcej
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </span>
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-muted-foreground">Brak artykułów do wyświetlenia</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

