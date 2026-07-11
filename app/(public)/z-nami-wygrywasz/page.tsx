import { Metadata } from "next"
import WinWithUsClientPage from "./WinWithUsClientPage"

export const metadata: Metadata = {
  title: "Z nami wygrywasz – Znajdź właściwego specjalistę | ProstaSprawa.pl",
  description: "Opisujesz sprawę raz, a specjaliści sami się zgłaszają. Bez prowizji, bez ukrytych opłat. Prawnicy, rzeczoznawcy, doradcy finansowi i inni eksperci – wszystko w jednym miejscu.",
}

export default function WinWithUsPage() {
  return <WinWithUsClientPage />
}
