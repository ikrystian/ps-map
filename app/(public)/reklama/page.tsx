import { Metadata } from "next"
import ReklamaClientPage from "./ReklamaClientPage"

export const metadata: Metadata = {
  title: "Reklama dla kancelarii i firm",
  description: "Reklama dla kancelarii i firm: banery, wyróżnione profile i artykuły sponsorowane. Docieraj do osób, które opisują swoje sprawy, z targetowaniem na województwo.",
  alternates: {
    canonical: "/reklama",
  },
}

export default function ReklamaPage() {
  return <ReklamaClientPage />
}
