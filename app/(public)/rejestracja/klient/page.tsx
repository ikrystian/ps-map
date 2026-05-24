import { Metadata } from "next"
import ClientRegisterClientPage from "./ClientRegisterClientPage"

export const metadata: Metadata = {
  title: "Rejestracja Konta Klienta | Prosta Sprawa",
  description: "Zarejestruj się jako klient, aby bezpłatnie opisywać swoje sprawy prawne i otrzymywać oferty pomocy prawnej od sprawdzonych ekspertów.",
}

export default function ClientRegisterPage() {
  return <ClientRegisterClientPage />
}
