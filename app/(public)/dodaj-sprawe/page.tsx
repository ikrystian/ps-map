import { Metadata } from "next"
import DodajSprawaClientPage from "./DodajSprawaClientPage"

export const metadata: Metadata = {
  title: "Dodaj sprawę",
  description:
    "Opisz swoją sprawę prawną krok po kroku i otrzymaj oferty od sprawdzonych prawników. Konto zakładasz dopiero na końcu.",
}

export default function DodajSprawaPage() {
  return <DodajSprawaClientPage />
}
