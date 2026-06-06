import { Metadata } from "next"
import BlogPageClient from "./BlogPageClient"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Blog Prawny - Porady, Artykuły i Analizy",
  description: "Baza wiedzy prawnej. Czytaj artykuły, analizy i porady przygotowane przez profesjonalnych ekspertów.",
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background-sec flex items-center justify-center text-muted-foreground">Ładowanie...</div>}>
      <BlogPageClient />
    </Suspense>
  )
}

