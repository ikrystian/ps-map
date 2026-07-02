import { Metadata } from "next"
import SearchLawyerClientPage from "./SearchLawyerClientPage"

export const metadata: Metadata = {
  title: "Wyszukiwarka Ekspertów",
  description: "Znajdź prawnika, adwokata lub radcę prawnego. Filtruj według specjalizacji, miasta, województwa i opinii.",
}

export default function SearchLawyerPage() {
  return <SearchLawyerClientPage />
}
