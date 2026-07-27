"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  MonitorSmartphone,
  Network,
  ShieldCheck,
  Megaphone,
  FileJson,
} from "lucide-react"

// Odzwierciedla model RegistrationAuditLog (art. 5 ust. 2 RODO — rozliczalność).
// Wszystkie pola opcjonalne: rekord powstaje przy rejestracji, a starsze konta
// mogą go nie mieć w ogóle.
export interface RegistrationAudit {
  id?: string
  userId?: string
  role?: string | null

  zgodaRegulamin?: boolean
  zgodaNewsletter?: boolean
  zgodaMarketing?: boolean
  zgodaPrzetwarzanie?: boolean

  ipAddress?: string | null
  userAgent?: string | null
  acceptLanguage?: string | null
  referer?: string | null
  secChUa?: string | null
  secChUaPlatform?: string | null
  secChUaMobile?: string | null

  browser?: string | null
  browserVersion?: string | null
  os?: string | null
  osVersion?: string | null
  deviceType?: string | null

  screenResolution?: string | null
  viewportSize?: string | null
  devicePixelRatio?: number | null
  language?: string | null
  languages?: string | null
  timezone?: string | null
  timezoneOffset?: number | null
  platform?: string | null
  hardwareConcurrency?: number | null
  deviceMemory?: number | null
  touchSupport?: boolean
  cookieEnabled?: boolean
  doNotTrack?: string | null
  onlineStatus?: boolean
  connectionType?: string | null

  registrationUrl?: string | null
  documentReferrer?: string | null
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  utmTerm?: string | null
  utmContent?: string | null

  rawMetadata?: string | null
  createdAt?: string | Date | null
}

const formatDate = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleString("pl-PL") : "—"

// null/undefined ≠ false: brak zapisanej wartości to nie to samo co brak zgody,
// więc rozróżniamy je wizualnie zamiast pokazywać wszędzie "Nie".
function BoolBadge({ value }: { value?: boolean | null }) {
  if (value == null) return <span className="text-sm text-muted-foreground">—</span>
  return (
    <Badge variant={value ? "default" : "outline"} className="px-2 py-0.5 text-xs font-normal">
      {value ? "Tak" : "Nie"}
    </Badge>
  )
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="space-y-0.5 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-words">
        {value === null || value === undefined || value === "" ? "—" : String(value)}
      </p>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h4>
      {children}
    </div>
  )
}

export function RegistrationAuditCard({ audit }: { audit: RegistrationAudit | null }) {
  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="flex flex-row items-center gap-3 border-b py-4">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <div>
          <CardTitle className="text-lg">Audyt rejestracji (RODO)</CardTitle>
          <CardDescription>
            Zgody i metadane zapisane w momencie rejestracji — tylko do odczytu
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!audit ? (
          <p className="text-sm text-muted-foreground">
            Brak zapisu audytowego — konto powstało zanim uruchomiono rejestrowanie
            metadanych rejestracji (albo zostało utworzone ręcznie przez administratora).
          </p>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="px-2.5 py-1 text-xs font-normal">
                Rola przy rejestracji:{" "}
                <span className="ml-1 font-semibold">{audit.role || "—"}</span>
              </Badge>
              <Badge variant="outline" className="px-2.5 py-1 text-xs font-normal">
                Data rejestracji:{" "}
                <span className="ml-1 font-semibold">{formatDate(audit.createdAt)}</span>
              </Badge>
            </div>

            <Separator />

            <Section icon={ShieldCheck} title="Zgody">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Regulamin</p>
                  <BoolBadge value={audit.zgodaRegulamin} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Przetwarzanie danych</p>
                  <BoolBadge value={audit.zgodaPrzetwarzanie} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Newsletter</p>
                  <BoolBadge value={audit.zgodaNewsletter} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Marketing</p>
                  <BoolBadge value={audit.zgodaMarketing} />
                </div>
              </div>
            </Section>

            <Separator />

            <Section icon={Network} title="Dane sieciowe i nagłówki HTTP">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Adres IP" value={audit.ipAddress} />
                <Field label="Accept-Language" value={audit.acceptLanguage} />
                <Field label="Referer" value={audit.referer} />
                <Field label="Sec-CH-UA" value={audit.secChUa} />
                <Field label="Sec-CH-UA-Platform" value={audit.secChUaPlatform} />
                <Field label="Sec-CH-UA-Mobile" value={audit.secChUaMobile} />
                <div className="sm:col-span-2">
                  <Field label="User-Agent" value={audit.userAgent} />
                </div>
              </div>
            </Section>

            <Separator />

            <Section icon={MonitorSmartphone} title="Przeglądarka, system i urządzenie">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="Przeglądarka" value={audit.browser} />
                <Field label="Wersja przeglądarki" value={audit.browserVersion} />
                <Field label="System" value={audit.os} />
                <Field label="Wersja systemu" value={audit.osVersion} />
                <Field label="Typ urządzenia" value={audit.deviceType} />
                <Field label="Platforma" value={audit.platform} />
                <Field label="Rozdzielczość ekranu" value={audit.screenResolution} />
                <Field label="Rozmiar viewportu" value={audit.viewportSize} />
                <Field label="Device pixel ratio" value={audit.devicePixelRatio} />
                <Field label="Rdzenie CPU" value={audit.hardwareConcurrency} />
                <Field
                  label="Pamięć RAM"
                  value={audit.deviceMemory != null ? `${audit.deviceMemory} GB` : null}
                />
                <Field label="Typ połączenia" value={audit.connectionType} />
                <Field label="Język" value={audit.language} />
                <Field label="Strefa czasowa" value={audit.timezone} />
                <Field
                  label="Offset strefy"
                  value={audit.timezoneOffset != null ? `${audit.timezoneOffset} min` : null}
                />
                <Field label="Do Not Track" value={audit.doNotTrack} />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Ekran dotykowy</p>
                  <BoolBadge value={audit.touchSupport} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Cookies włączone</p>
                  <BoolBadge value={audit.cookieEnabled} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Online</p>
                  <BoolBadge value={audit.onlineStatus} />
                </div>
                <div className="sm:col-span-4">
                  <Field label="Lista języków" value={audit.languages} />
                </div>
              </div>
            </Section>

            <Separator />

            <Section icon={Megaphone} title="Źródło rejestracji i kampania">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="URL rejestracji" value={audit.registrationUrl} />
                <Field label="Document referrer" value={audit.documentReferrer} />
                <Field label="utm_source" value={audit.utmSource} />
                <Field label="utm_medium" value={audit.utmMedium} />
                <Field label="utm_campaign" value={audit.utmCampaign} />
                <Field label="utm_term" value={audit.utmTerm} />
                <Field label="utm_content" value={audit.utmContent} />
              </div>
            </Section>

            {audit.rawMetadata && (
              <>
                <Separator />
                <Section icon={FileJson} title="Surowe metadane (JSON)">
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground select-none">
                      Pokaż pełny zapis
                    </summary>
                    <pre className="mt-3 max-h-96 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs">
                      {formatRawMetadata(audit.rawMetadata)}
                    </pre>
                  </details>
                </Section>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// rawMetadata bywa zapisane jako string JSON; gdy nie da się sparsować,
// pokazujemy wartość surową zamiast wywracać cały panel.
function formatRawMetadata(raw: string) {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}
