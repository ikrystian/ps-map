import { Metadata } from "next"
import LoggedOutClientPage from "./LoggedOutClientPage"

export const metadata: Metadata = {
  title: "Wylogowano pomyślnie | Prosta Sprawa",
  description: "Zostałeś pomyślnie wylogowany ze swojego profilu na platformie Prosta Sprawa. Do zobaczenia!",
}

export default function LoggedOutPage() {
  return <LoggedOutClientPage />
}
