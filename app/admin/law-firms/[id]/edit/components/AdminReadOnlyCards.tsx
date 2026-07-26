"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Briefcase, Building, CalendarClock, Layers } from "lucide-react"

const formatDate = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleString("pl-PL") : "—"

const formatDay = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleDateString("pl-PL") : "—"

// --- DANE FIRMY Z BIAŁEJ LISTY (COMPANY_*) ---
export interface CompanyData {
  COMPANY_name?: string | null
  COMPANY_nip?: string | null
  COMPANY_regon?: string | null
  COMPANY_krs?: string | null
  COMPANY_statusVat?: string | null
  COMPANY_residenceAddress?: string | null
  COMPANY_workingAddress?: string | null
}

export function CompanyDataCard({ companyData }: { companyData: CompanyData | null }) {
  const rows: Array<[string, string | null | undefined]> = companyData
    ? [
        ["Nazwa podmiotu", companyData.COMPANY_name],
        ["NIP", companyData.COMPANY_nip],
        ["REGON", companyData.COMPANY_regon],
        ["KRS", companyData.COMPANY_krs],
        ["Status VAT", companyData.COMPANY_statusVat],
        ["Adres siedziby", companyData.COMPANY_residenceAddress],
        ["Adres działalności", companyData.COMPANY_workingAddress],
      ]
    : []

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
        <Building className="h-5 w-5 text-primary" />
        <div>
          <CardTitle className="text-lg">Dane firmy do faktury (Biała lista)</CardTitle>
          <CardDescription>
            Pobrane z wykazu podatników VAT przy rejestracji — tylko do odczytu
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!companyData ? (
          <p className="text-sm text-muted-foreground">
            Ekspert rejestrował się jako osoba prywatna — brak danych firmowych.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rows.map(([label, value]) => (
              <div key={label} className="space-y-0.5">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium break-words">{value || "—"}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// --- METADANE KONTA ---
export interface AccountMeta {
  userCreatedAt?: string | null
  lawFirmCreatedAt?: string | null
  lawFirmUpdatedAt?: string | null
  lastLogin?: string | null
  telefonZweryfikowany?: string | null
}

export function AccountMetaCard({ meta }: { meta: AccountMeta }) {
  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
        <CalendarClock className="h-5 w-5 text-primary" />
        <div>
          <CardTitle className="text-lg">Historia konta</CardTitle>
          <CardDescription>Daty rejestracji i ostatniej aktywności</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Konto utworzone</p>
            <p className="text-sm font-medium">{formatDate(meta.userCreatedAt)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Profil eksperta utworzony</p>
            <p className="text-sm font-medium">{formatDate(meta.lawFirmCreatedAt)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Ostatnia modyfikacja profilu</p>
            <p className="text-sm font-medium">{formatDate(meta.lawFirmUpdatedAt)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">Ostatnie logowanie</p>
            <p className="text-sm font-medium">{formatDate(meta.lastLogin)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// --- DANE POWIĄZANE (usługi, certyfikaty, liczniki) ---
export interface RelatedData {
  services: Array<{
    id: string
    nazwaUslugi: string
    opisUslugi: string
    cenaOd: number | null
    cenaDo: number | null
  }>
  certificates: Array<{
    id: string
    nazwaCertyfikatu: string
    wydawca: string
    dataUzyskania: string
  }>
  counts: Record<string, number>
}

const COUNT_LABELS: Array<[string, string]> = [
  ["categories", "Specjalizacje"],
  ["voivodeships", "Województwa"],
  ["services", "Usługi"],
  ["certificates", "Certyfikaty"],
  ["blogPosts", "Wpisy blogowe"],
  ["offers", "Oferty"],
  ["reviews", "Opinie"],
  ["orders", "Zamówienia"],
  ["invoices", "Faktury"],
  ["promotions", "Promocje"],
  ["favoritedBy", "Dodania do ulubionych"],
]

export function RelatedDataCard({ data }: { data: RelatedData }) {
  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
        <Layers className="h-5 w-5 text-primary" />
        <div>
          <CardTitle className="text-lg">Dane powiązane</CardTitle>
          <CardDescription>
            Zarządzane przez eksperta w jego panelu — tutaj tylko podgląd
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex flex-wrap gap-2">
          {COUNT_LABELS.map(([key, label]) => (
            <Badge key={key} variant="outline" className="px-2.5 py-1 text-xs font-normal">
              {label}: <span className="ml-1 font-semibold">{data.counts?.[key] ?? 0}</span>
            </Badge>
          ))}
        </div>

        <div>
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Briefcase className="h-4 w-4 text-primary" />
            Ostatnie usługi
          </h4>
          {data.services.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ekspert nie dodał jeszcze usług.</p>
          ) : (
            <div className="space-y-2">
              {data.services.map((service) => (
                <div key={service.id} className="flex items-start justify-between gap-4 p-3 border rounded-lg">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{service.nazwaUslugi}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{service.opisUslugi}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {service.cenaOd != null || service.cenaDo != null
                      ? `${service.cenaOd ?? "—"} – ${service.cenaDo ?? "—"} zł`
                      : "cena do uzgodnienia"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Award className="h-4 w-4 text-primary" />
            Ostatnie certyfikaty
          </h4>
          {data.certificates.length === 0 ? (
            <p className="text-sm text-muted-foreground">Brak certyfikatów.</p>
          ) : (
            <div className="space-y-2">
              {data.certificates.map((certificate) => (
                <div key={certificate.id} className="flex items-start justify-between gap-4 p-3 border rounded-lg">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{certificate.nazwaCertyfikatu}</p>
                    <p className="text-xs text-muted-foreground truncate">{certificate.wydawca}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDay(certificate.dataUzyskania)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
