import { prisma } from "@/lib/prisma"
import { EmailLogStatus } from "@prisma/client"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Podgląd maila (DEV/STAGE)",
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

export default async function MailDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const nodeEnv = process.env.NODE_ENV as string
  const isDev = nodeEnv !== "production" && nodeEnv !== "stage"

  const setting = await prisma.settings.findUnique({
    where: { key: "emailLogToMails" },
  })
  const shouldLogToMails = setting ? setting.value === "true" : isDev

  if (!shouldLogToMails) {
    notFound()
  }

  const { id } = await params

  const log = await prisma.emailLog.findUnique({
    where: { id },
  })

  if (!log) {
    notFound()
  }

  let variables: Record<string, string> | null = null
  if (log.variables) {
    try {
      variables = JSON.parse(log.variables)
    } catch {
      variables = null
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          href="/mails"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Wróć do listy maili
        </Link>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border p-5">
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${log.status === EmailLogStatus.SUCCESS
                    ? "bg-emerald-500"
                    : "bg-red-500"
                  }`}
              />
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {log.status}
              </span>
            </div>
            <h1 className="text-xl font-semibold">
              {log.subject || "(bez tematu)"}
            </h1>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Do:</dt>
              <dd className="text-foreground">{log.to}</dd>
              <dt className="text-muted-foreground">Wysłano:</dt>
              <dd className="font-mono text-foreground/80">
                {formatDate(log.sentAt)}
              </dd>
              {log.templateType ? (
                <>
                  <dt className="text-muted-foreground">Szablon:</dt>
                  <dd className="font-mono text-foreground/80">
                    {log.templateType}
                  </dd>
                </>
              ) : null}
            </dl>
          </div>

          {log.errorMessage ? (
            <div className="border-b border-border bg-red-950/40 p-5">
              <p className="text-sm font-medium text-red-300">Błąd:</p>
              <p className="mt-1 font-mono text-sm text-red-200">
                {log.errorMessage}
              </p>
            </div>
          ) : null}

          <div className="p-5">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Podgląd HTML
            </p>
            {log.html ? (
              <iframe
                title="Podgląd maila"
                srcDoc={log.html}
                sandbox=""
                className="h-[600px] w-full rounded-md border border-border bg-white"
              />
            ) : (
              <pre className="overflow-auto whitespace-pre-wrap rounded-md border border-border bg-background p-4 text-sm text-foreground">
                {log.content || "(brak treści)"}
              </pre>
            )}
          </div>

          {log.content ? (
            <details className="border-t border-border p-5">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                Wersja tekstowa
              </summary>
              <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-background p-4 text-sm text-foreground">
                {log.content}
              </pre>
            </details>
          ) : null}

          {variables ? (
            <details className="border-t border-border p-5">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                Zmienne szablonu
              </summary>
              <pre className="mt-3 overflow-auto rounded-md border border-border bg-background p-4 text-sm text-foreground">
                {JSON.stringify(variables, null, 2)}
              </pre>
            </details>
          ) : null}

          {log.smtpLog ? (
            <details className="border-t border-border p-5">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                Log SMTP
              </summary>
              <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-background p-4 text-xs text-foreground/80">
                {log.smtpLog}
              </pre>
            </details>
          ) : null}
        </div>
      </div>
    </div>
  )
}
