import { Metadata } from "next"
import ForLawyersClientPage from "./ForLawyersClientPage"

export const metadata: Metadata = {
  title: "Dla Prawników i Kancelarii - Pozyskuj Klientów",
  description: "Dołącz do platformy Prosta Sprawa, promuj swoją kancelarię i pozyskuj nowych klientów szukających pomocy prawnej online.",
}

export default function ForLawyersPage() {
  return <ForLawyersClientPage />
}
