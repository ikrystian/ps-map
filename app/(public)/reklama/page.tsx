import { Metadata } from "next"
import ReklamaClientPage from "./ReklamaClientPage"

export const metadata: Metadata = {
  title: "Zareklamuj się u nas | Zasięg i Nowi Klienci dla Twojego Biznesu - Prosta Sprawa",
  description: "Zwiększ widoczność swojej kancelarii lub firmy. Dotrzyj bezpośrednio do osób poszukujących pomocy prawnej. Banery reklamowe, wyróżnienia profili oraz artykuły sponsorowane z pełnym geotargetowaniem.",
  alternates: {
    canonical: "/reklama",
  },
}

export default function ReklamaPage() {
  return <ReklamaClientPage />
}
