import { Metadata } from "next"
import { JsonLd } from "@/components/JsonLd"
import { EXPERT_FAQ } from "./content"
import ForExpertsClientPage from "./ForExpertsClientPage"

export const metadata: Metadata = {
  title: "Dla eksperta: sprawy z Twojej dziedziny",
  description:
    "Rzeczoznawcy, geodeci, doradcy podatkowi, tłumacze przysięgli i inni eksperci. Odpowiadasz na sprawy ze swojej dziedziny. Konto za darmo, 0% prowizji.",
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: EXPERT_FAQ.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
}

export default function ForExpertsPage() {
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <ForExpertsClientPage />
    </>
  )
}
