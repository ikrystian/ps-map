import { Metadata } from "next"
import EmailVerificationClientPage from "./EmailVerificationClientPage"

export const metadata: Metadata = {
  title: "Status weryfikacji e-mail | Prosta Sprawa",
  description: "Weryfikacja Twojego adresu e-mail na platformie Prosta Sprawa.",
}

export default function EmailVerificationPage() {
  return <EmailVerificationClientPage />
}
