import { Metadata } from "next"
import ForLawyersClientPage from "./ForLawyersClientPage"

export const metadata: Metadata = {
  title: "Dla Ekspertów - Pozyskuj Klientów",
  description: "Dołącz do platformy Prosta Sprawa, promuj swój profil i pozyskuj nowych klientów szukających pomocy prawnej online.",
}

export default function ForLawyersPage() {
  return <ForLawyersClientPage />
}
