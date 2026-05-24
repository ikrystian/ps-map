import { Metadata } from "next"
import ResendVerificationClientPage from "./ResendVerificationClientPage"

export const metadata: Metadata = {
  title: "Wyślij ponownie link weryfikacyjny | Prosta Sprawa",
  description: "Jeśli nie otrzymałeś wiadomości aktywacyjnej, poproś o ponowne wysłanie linku weryfikacyjnego na swój adres e-mail.",
}

export default function ResendVerificationPage() {
  return <ResendVerificationClientPage />
}
