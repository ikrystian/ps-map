import { Metadata } from "next"
import UnsubscribeClientPage from "./UnsubscribeClientPage"

export const metadata: Metadata = {
  title: "Wypisz się z Newslettera | Prosta Sprawa",
  description: "Zrezygnuj z subskrypcji newslettera i powiadomień e-mail.",
}

export default function UnsubscribeNewsletterPage() {
  return <UnsubscribeClientPage />
}
