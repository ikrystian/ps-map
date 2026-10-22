import { Metadata } from "next"
import RankingClientPage from "./RankingClientPage"

export const metadata: Metadata = {
  title: "Ranking Ekspertów Prawnych w Polsce",
  description: "Zobacz ranking prawników i ekspertów ProstaSprawa.pl i sprawdź, jak liczymy pozycję: weryfikacja profilu, opinie klientów, wyświetlenia i promocje.",
}

export default function RankingPage() {
  return <RankingClientPage />
}
