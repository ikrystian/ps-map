"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Eye } from "lucide-react"
import Image from "next/image"
import type { LawFirm } from "@/types"
import { BlogPost } from '@/types/blog';



interface BlogTabProps {
  lawFirm: LawFirm
  formatDate: (dateString: string) => string
}

const formatViews = (views: number): string => {
  if (views === 1) return "1 wyświetlenie";
  const lastDigit = views % 10;
  const lastTwoDigits = views % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 10 || lastTwoDigits >= 20)) {
    return `${views} wyświetlenia`;
  }
  return `${views} wyświetleń`;
};

export function BlogTab({ lawFirm, formatDate }: BlogTabProps) {
  // Helper function to strip HTML tags for blog excerpt
  const stripHtmlTags = (html: string) => {
    return html.replace(/<[^>]*>/g, "")
  }

  return (
    <div className="space-y-4">
      {lawFirm.blogPosts.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lawFirm.blogPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                {post.obrazekWyrozniajacy && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={post.obrazekWyrozniajacy}
                      alt={post.tytul}
                      width={600}
                      height={338}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg hover:text-primary transition-colors">
                    <a href={`/blog/${post.slug}`}>{post.tytul}</a>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {post.dataPublikacji && formatDate(post.dataPublikacji)}
                    {post.wyswietlenia !== undefined && post.wyswietlenia !== null && (
                      <>
                        <span className="mx-1">•</span>
                        <Eye className="h-3 w-3" />
                        {formatViews(post.wyswietlenia)}
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 mb-3">{stripHtmlTags(post.tresc)}</p>
                  <Button variant="link" className="p-0" asChild>
                    <a href={`/blog/${post.slug}`}>Czytaj więcej →</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center pt-4">
            <Button variant="outline" asChild>
              <a href={`/blog?lawFirmId=${lawFirm.id}`}>Zobacz wszystkie artykuły eksperta</a>
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Ten ekspert nie opublikowała jeszcze żadnych artykułów
          </CardContent>
        </Card>
      )}
    </div>
  )
}
