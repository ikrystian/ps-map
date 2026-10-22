import { Metadata } from "next"
import WinWithUsClientPage from "./WinWithUsClientPage"

export const metadata: Metadata = {
  title: "Opisz sprawę raz, specjaliści się zgłoszą",
  description: "Zamiast obdzwaniać kancelarie, opisz sprawę raz i poczekaj na oferty. Prawnicy, rzeczoznawcy, doradcy i księgowi w jednym miejscu, bez prowizji.",
}

export default function WinWithUsPage() {
  return <WinWithUsClientPage />
}
