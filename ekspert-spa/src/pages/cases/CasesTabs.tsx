import { useLocation, useNavigate } from "react-router-dom"
import { Segmented } from "@/components/ui"

const SECTIONS = [
  { value: "/sprawy", label: "Sprawy" },
  { value: "/sprawy/oferty", label: "Oferty" },
  { value: "/sprawy/polecenia", label: "Polecenia" },
]

export function CasesTabs() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return (
    <Segmented
      label="Obsługa spraw"
      value={pathname}
      onChange={(path) => navigate(path, { replace: true })}
      options={SECTIONS}
    />
  )
}
