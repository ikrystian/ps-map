import { Metadata } from "next"
import LawFirmRegisterClientPage from "./LawFirmRegisterClientPage"

export const metadata: Metadata = {
  title: "Rejestracja dla Eksperta i Prawników | Prosta Sprawa",
  description: "Zarejestruj swój profil w portalu Prosta Sprawa. Zyskaj profil w wyszukiwarce i zacznij pozyskiwać wartościowych klientów.",
}

export default function LawFirmRegisterPage() {
  return <LawFirmRegisterClientPage />
}
