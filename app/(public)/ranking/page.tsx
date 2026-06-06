import { Metadata } from "next"
import RankingClientPage from "./RankingClientPage"

export const metadata: Metadata = {
  title: "Ranking Ekspertów Prawnych w Polsce",
  description: "Sprawdź top 100 najlepszych i najbardziej aktywnych ekspertów prawnych i prawników w naszym serwisie.",
}

export default function RankingPage() {
  return <RankingClientPage />
}
