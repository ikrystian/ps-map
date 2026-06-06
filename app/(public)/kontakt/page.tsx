import { Metadata } from "next"
import ContactClientPage from "./ContactClientPage"

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Skontaktuj się z ProstaSprawa.pl. Masz pytania? Skorzystaj z formularza kontaktowego lub znajdź nasze dane kontaktowe i dane rejestrowe.",
}

export default function KontaktPage() {
  return <ContactClientPage />
}
