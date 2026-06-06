import { Metadata } from "next"
import LoginClientPage from "./LoginClientPage"

export const metadata: Metadata = {
  title: "Zaloguj się do swojego konta",
  description: "Zaloguj się do platformy Prosta Sprawa jako klient lub ekspert prawny i zarządzaj swoimi sprawami.",
}

export default function LoginPage() {
  return <LoginClientPage />
}
