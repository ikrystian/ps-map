import { Metadata } from "next"
import WinWithUsClientPage from "./WinWithUsClientPage"

export const metadata: Metadata = {
  title: "Z Nami Wygrywasz - Nasza Misja | Prosta Sprawa",
  description: "Dowiedz się, dlaczego warto powierzyć swoje sprawy ekspertom z platformy Prosta Sprawa. Nasze wartości i sukcesy klientów.",
}

export default function WinWithUsPage() {
  return <WinWithUsClientPage />
}
