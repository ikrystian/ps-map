import { Metadata } from "next"
import ResetPasswordClientPage from "./ResetPasswordClientPage"

export const metadata: Metadata = {
  title: "Ustaw nowe hasło | Prosta Sprawa",
  description: "Wprowadź swoje nowe hasło, aby odzyskać pełny dostęp do swojego profilu na platformie Prosta Sprawa.",
}

export default function ResetPasswordPage() {
  return <ResetPasswordClientPage />
}
