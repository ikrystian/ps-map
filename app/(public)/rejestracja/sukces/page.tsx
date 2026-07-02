import { Metadata } from "next"
import RegisterSuccessClientPage from "./RegisterSuccessClientPage"

export const metadata: Metadata = {
  title: "Konto zostało utworzone pomyślnie",
  description: "Dziękujemy za rejestrację w serwisie Prosta Sprawa. Twoje konto zostało pomyślnie zarejestrowane.",
}

export default function RegisterSuccessPage() {
  return <RegisterSuccessClientPage />
}
