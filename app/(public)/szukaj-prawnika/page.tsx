import { Metadata } from "next"
import SearchLawyerClientPage from "./SearchLawyerClientPage"

export const metadata: Metadata = {
  title: "Wyszukiwarka Ekspertów",
  description: "Zobacz ranking prawników i ekspertów ProstaSprawa.pl i sprawdź, jak liczymy pozycję: weryfikacja profilu, opinie klientów, wyświetlenia i promocje.",
}

export default function SearchLawyerPage() {
  return <SearchLawyerClientPage />
}
