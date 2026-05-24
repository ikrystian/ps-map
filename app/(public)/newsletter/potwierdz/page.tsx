import { Metadata } from "next"
import ConfirmClientPage from "./ConfirmClientPage"

export const metadata: Metadata = {
  title: "Potwierdzenie zapisu do Newslettera | Prosta Sprawa",
  description: "Potwierdź swój adres e-mail, aby zacząć otrzymywać najnowsze artykuły, porady prawne i analizy eksperckie.",
}

export default function ConfirmNewsletterPage() {
  return <ConfirmClientPage />
}
