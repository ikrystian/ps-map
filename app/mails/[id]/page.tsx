import { prisma } from "@/lib/prisma"
import { EmailLogStatus } from "@prisma/client"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Podgląd maila (DEV)",
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
  if (process.env.NODE_ENV === "production") {
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          href="/mails"
          className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-neutral-100"
        >
          ← Wróć do listy maili
        </Link>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900">
          <div className="border-b border-neutral-800 p-5">
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  log.status === EmailLogStatus.SUCCESS
                    ? "bg-emerald-500"
                    : "bg-red-500"
                }`}
              />
              <span className="text-xs uppercase tracking-wide text-neutral-400">
                {log.status}
              </span>
            </div>
            <h1 className="text-xl font-semibold">
              {log.subject || "(bez tematu)"}
            </h1>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-neutral-500">Do:</dt>
              <dd className="text-neutral-200">{log.to}</dd>
              <dt className="text-neutral-500">Wysłano:</dt>
              <dd className="font-mono text-neutral-300">
                {formatDate(log.sentAt)}
              </dd>
              {log.templateType ? (
                <>
                  <dt className="text-neutral-500">Szablon:</dt>
                  <dd className="font-mono text-neutral-300">
                    {log.templateType}
                  </dd>
                </>
              ) : null}
            </dl>
          </div>

          {log.errorMessage ? (
            <div className="border-b border-neutral-800 bg-red-950/40 p-5">
              <p className="text-sm font-medium text-red-300">Błąd:</p>
              <p className="mt-1 font-mono text-sm text-red-200">
                {log.errorMessage}
              </p>
            </div>
          ) : null}

          <div className="p-5">
            <p className="mb-3 text-sm font-medium text-neutral-400">
              Podgląd HTML
            </p>
            {log.html ? (
              <iframe
                title="Podgląd maila"
                srcDoc={log.html}
                sandbox=""
                className="h-[600px] w-full rounded-md border border-neutral-800 bg-white"
              />
            ) : (
              <pre className="overflow-auto whitespace-pre-wrap rounded-md border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-200">
                {log.content || "(brak treści)"}
              </pre>
            )}
          </div>

          {log.content ? (
            <details className="border-t border-neutral-800 p-5">
              <summary className="cursor-pointer text-sm font-medium text-neutral-400">
                Wersja tekstowa
              </summary>
              <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-md border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-200">
                {log.content}
              </pre>
            </details>
          ) : null}

          {variables ? (
            <details className="border-t border-neutral-800 p-5">
              <summary className="cursor-pointer text-sm font-medium text-neutral-400">
                Zmienne szablonu
              </summary>
              <pre className="mt-3 overflow-auto rounded-md border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-200">
                {JSON.stringify(variables, null, 2)}
              </pre>
            </details>
          ) : null}

          {log.smtpLog ? (
            <details className="border-t border-neutral-800 p-5">
              <summary className="cursor-pointer text-sm font-medium text-neutral-400">
                Log SMTP
              </summary>
              <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-md border border-neutral-800 bg-neutral-950 p-4 text-xs text-neutral-300">
                {log.smtpLog}
              </pre>
            </details>
          ) : null}
        </div>
      </div>
    </div>
  )
}
