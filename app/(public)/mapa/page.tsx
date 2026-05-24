import { Metadata } from "next"
import MapClientPage from "./MapClientPage"

export const metadata: Metadata = {
  title: "Mapa Kancelarii i Prawników w Polsce | Prosta Sprawa",
  description: "Interaktywna mapa kancelarii prawnych. Znajdź adwokata, radcę prawnego lub notariusza najbliżej Twojej lokalizacji.",
}

export default function MapPage() {
  return <MapClientPage />
}
