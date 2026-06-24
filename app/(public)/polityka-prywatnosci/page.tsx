import { Metadata } from "next"
import PrivacyPolicyClientPage from "./PrivacyPolicyClientPage"

export const metadata: Metadata = {
  title: "Polityka Prywatności | ProstaSprawa.pl",
  description: "Zapoznaj się z Polityką Prywatności serwisu ProstaSprawa.pl. Transparentne informacje o przetwarzaniu danych, plikach cookies oraz prawach Użytkownika.",
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClientPage />
}
