import { Metadata } from "next"
import BlogPageClient from "./BlogPageClient"

export const metadata: Metadata = {
  title: "Blog Prawny - Porady, Artykuły i Analizy | Prosta Sprawa",
  description: "Baza wiedzy prawnej. Czytaj artykuły, analizy i porady przygotowane przez profesjonalnych prawników i kancelarie.",
}

export default function BlogPage() {
  return <BlogPageClient />
}
