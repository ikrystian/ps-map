import { Metadata } from "next"
import BlogPageClient from "./BlogPageClient"

export const metadata: Metadata = {
  title: "Blog Prawny - Porady, Artykuły i Analizy",
  description: "Baza wiedzy prawnej. Czytaj artykuły, analizy i porady przygotowane przez profesjonalnych ekspertów.",
}

export default function BlogPage() {
  return <BlogPageClient />
}
