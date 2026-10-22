import { Metadata } from "next"
import ForLawyersClientPage from "./ForLawyersClientPage"

export const metadata: Metadata = {
  title: "Platforma dla prawników bez prowizji",
  description: "Łatwy dostęp do spraw, które pasują do Ciebie. Sprawnie przeglądaj zgłoszenia, wybieraj sprawy zgodne z Twoją specjalizacją i pracuj na własnych warunkach.",
}

export default function ForLawyersPage() {
  return <ForLawyersClientPage />
}
