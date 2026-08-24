import { prisma } from "@/lib/prisma"
import { EmailLogStatus } from "@prisma/client"
import Link from "next/link"
import { notFound } from "next/navigation"

// Strona deweloperska – zawsze renderowana dynamicznie, bez cache'owania.
export const dynamic = "force-dynamic"

export const metadata = {
  title: "Podgląd maili (DEV/STAGE)",
  robots: { index: false, follow: false },
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date)
}

export default async function MailsPage() {
  const nodeEnv = process.env.NODE_ENV as string
  const isDev = nodeEnv !== "production" && nodeEnv !== "stage"

  const setting = await prisma.settings.findUnique({
    where: { key: "emailLogToMails" },
  })
  const shouldLogToMails = setting ? setting.value === "true" : isDev

  if (!shouldLogToMails) {
    notFound()
  }

  const logs = await prisma.emailLog.findMany({
    orderBy: { sentAt: "desc" },
    take: 200,
    select: {
      id: true,
      to: true,
      subject: true,
      templateType: true,
      status: true,
      sentAt: true,
    },
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📧</span>
            <h1 className="text-2xl font-semibold">
              Podgląd maili {nodeEnv === "stage" ? "(STAGE)" : "(DEV)"}
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {nodeEnv === "stage"
              ? `Na środowisku testowym (stage) maile są wysyłane oraz zapisywane w logach do podglądu. Pokazuję ${logs.length} ostatnich wiadomości.`
              : `Na środowisku deweloperskim maile nie są wysyłane – są jedynie zapisywane w logach i wyświetlane na tej stronie. Pokazuję ${logs.length} ostatnich wiadomości.`}
          </p>
        </header>

        {logs.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-10 text-center text-muted-foreground">
            Brak zalogowanych maili. Wykonaj akcję, która wysyła e-mail
            (np. rejestracja, reset hasła), a pojawi się tutaj.
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {logs.map((log) => (
              <li key={log.id}>
                <Link
                  href={`/mails/${log.id}`}
                  className="flex items-start gap-4 px-4 py-3 transition-colors hover:bg-muted/60"
                >
                  <span
                    className={`mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${log.status === EmailLogStatus.SUCCESS
                      ? "bg-emerald-500"
                      : "bg-red-500"
                      }`}
                    title={log.status}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <p className="truncate font-medium text-foreground">
                        {log.subject || "(bez tematu)"}
                      </p>
                      <time className="shrink-0 font-mono text-xs text-muted-foreground">
                        {formatDate(log.sentAt)}
                      </time>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      Do: <span className="text-foreground/80">{log.to}</span>
                      {log.templateType ? (
                        <span className="ml-2 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                          {log.templateType}
                        </span>
                      ) : null}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
