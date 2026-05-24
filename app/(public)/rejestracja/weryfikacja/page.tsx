import { Metadata } from "next"
import VerificationClientPage from "./VerificationClientPage"

export const metadata: Metadata = {
  title: "Potwierdź swój adres e-mail | Prosta Sprawa",
  description: "Zweryfikuj swoje konto rejestracyjne, potwierdzając adres e-mail przesłany w wiadomości weryfikacyjnej.",
}

export default function VerificationPage() {
  return <VerificationClientPage />
}
