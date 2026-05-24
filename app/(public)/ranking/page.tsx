import { Metadata } from "next"
import RankingClientPage from "./RankingClientPage"

export const metadata: Metadata = {
  title: "Ranking Kancelarii Prawnych w Polsce | Prosta Sprawa",
  description: "Sprawdź top 100 najlepszych i najbardziej aktywnych kancelarii prawnych i prawników w naszym serwisie.",
}

export default function RankingPage() {
  return <RankingClientPage />
}
