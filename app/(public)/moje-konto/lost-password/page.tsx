import { Metadata } from "next"
import LostPasswordClientPage from "./LostPasswordClientPage"

export const metadata: Metadata = {
  title: "Odzyskiwanie hasła",
  description: "Nie pamiętasz hasła? Wpisz swój adres e-mail, aby otrzymać link do resetowania hasła i odzyskać dostęp do konta.",
}

export default function LostPasswordPage() {
  return <LostPasswordClientPage />
}
