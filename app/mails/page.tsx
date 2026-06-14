import { prisma } from "@/lib/prisma"
import { EmailLogStatus } from "@prisma/client"
import Link from "next/link"
import { notFound } from "next/navigation"

// Strona deweloperska – zawsze renderowana dynamicznie, bez cache'owania.
export const dynamic = "force-dynamic"

export const metadata = {
  title: "Podgląd maili (DEV)",
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
  // Podgląd logów maili udostępniamy wyłącznie poza produkcją,
  // aby nie wyciekać treści wiadomości (dane osobowe, linki) na produkcji.

  // if (process.env.NODE_ENV === "production") {
  //   notFound()
  // }

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
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📧</span>
            <h1 className="text-2xl font-semibold">Podgląd maili (DEV)</h1>
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            Na środowisku deweloperskim maile nie są wysyłane – są jedynie
            zapisywane w logach i wyświetlane na tej stronie. Pokazuję{" "}
            {logs.length} ostatnich wiadomości.
          </p>
        </header>

        {logs.length === 0 ? (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-10 text-center text-neutral-400">
            Brak zalogowanych maili. Wykonaj akcję, która wysyła e-mail
            (np. rejestracja, reset hasła), a pojawi się tutaj.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-800 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
            {logs.map((log) => (
              <li key={log.id}>
                <Link
                  href={`/mails/${log.id}`}
                  className="flex items-start gap-4 px-4 py-3 transition-colors hover:bg-neutral-800/60"
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
                      <p className="truncate font-medium text-neutral-100">
                        {log.subject || "(bez tematu)"}
                      </p>
                      <time className="shrink-0 font-mono text-xs text-neutral-500">
                        {formatDate(log.sentAt)}
                      </time>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-neutral-400">
                      Do: <span className="text-neutral-300">{log.to}</span>
                      {log.templateType ? (
                        <span className="ml-2 rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[11px] text-neutral-400">
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
