import { Metadata } from "next"
import RegulaminClientPage from "./RegulaminClientPage"

export const metadata: Metadata = {
  title: "Regulamin Serwisu | ProstaSprawa.pl",
  description: "Zapoznaj się z regulaminem korzystania z serwisu ProstaSprawa.pl. Transparentne zasady współpracy, prawa konsumenta oraz warunki dla klientów i wykonawców.",
}

export default function RegulaminPage() {
  return <RegulaminClientPage />
}
