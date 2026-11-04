import { useLocation, useNavigate } from "react-router-dom"
import { Segmented } from "@/components/ui"

const SECTIONS = [
  { value: "/konsultacje", label: "Rezerwacje" },
  { value: "/konsultacje/zapytania", label: "Zapytania klientów" },
]

export function ConsultationsTabs() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return (
    <Segmented
      label="Konsultacje"
      value={pathname}
      onChange={(path) => navigate(path, { replace: true })}
      options={SECTIONS}
    />
  )
}
