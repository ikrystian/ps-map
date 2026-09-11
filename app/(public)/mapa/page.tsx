import { Metadata } from "next"
import MapClientPage from "./MapClientPage"

export const metadata: Metadata = {
  title: "Mapa ekspertów prawnych w Polsce",
  description:
    "Zobacz na mapie Polski zweryfikowanych ekspertów prawnych i prawników. Kliknij pinezkę, aby poznać szczegóły i przejść do profilu.",
  alternates: { canonical: "/mapa" },
}

export default function MapaPage() {
  return <MapClientPage />
}
