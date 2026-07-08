import { getLegalPageContent } from "@/lib/legal-pages"
import { Metadata } from "next"
import PrivacyPolicyClientPage from "./PrivacyPolicyClientPage"

// Treść jest edytowalna w panelu admina — strona musi renderować się na żądanie
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Polityka Prywatności | ProstaSprawa.pl",
  description: "Zapoznaj się z Polityką Prywatności serwisu ProstaSprawa.pl. Transparentne informacje o przetwarzaniu danych, plikach cookies oraz prawach Użytkownika.",
}

export default async function PrivacyPolicyPage() {
  const content = await getLegalPageContent("polityka-prywatnosci")
  return <PrivacyPolicyClientPage content={content} />
}
