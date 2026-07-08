import { getLegalPageContent } from "@/lib/legal-pages"
import { Metadata } from "next"
import RegulaminClientPage from "./RegulaminClientPage"

// Treść jest edytowalna w panelu admina — strona musi renderować się na żądanie
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Regulamin Serwisu | ProstaSprawa.pl",
  description: "Zapoznaj się z regulaminem korzystania z serwisu ProstaSprawa.pl. Transparentne zasady współpracy, prawa konsumenta oraz warunki dla klientów i wykonawców.",
}

export default async function RegulaminPage() {
  const content = await getLegalPageContent("regulamin")
  return <RegulaminClientPage content={content} />
}
