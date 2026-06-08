import { JobRunStatus } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getJobDefinitions, triggerJob } from "@/lib/scheduler"

/**
 * Panel admina harmonogramu zadań w tle.
 *
 * GET  — zwraca listę zadań (definicje + stan runtime + statystyki) oraz
 *        stronicowaną historię uruchomień z filtrami.
 * POST — ręcznie uruchamia wskazane zadanie ({ action: "run", jobName }).
 */

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return null
  }
  return session
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")))
    const jobName = searchParams.get("jobName") || undefined
    const status = searchParams.get("status") as JobRunStatus | null

    const skip = (page - 1) * limit

    const runWhere: { jobName?: string; status?: JobRunStatus } = {}
    if (jobName) runWhere.jobName = jobName
    if (status && Object.values(JobRunStatus).includes(status)) runWhere.status = status

    const [definitions, persistedJobs, statusCounts, runs, total] = await Promise.all([
      Promise.resolve(getJobDefinitions()),
      db.scheduledJob.findMany(),
      db.scheduledJobRun.groupBy({
        by: ["jobName", "status"],
        _count: { _all: true },
      }),
      db.scheduledJobRun.findMany({
        where: runWhere,
        orderBy: { startedAt: "desc" },
        skip,
        take: limit,
      }),
      db.scheduledJobRun.count({ where: runWhere }),
    ])

    // Statystyki per zadanie i status (bez N+1 — jedno groupBy).
    const countsByJob = new Map<string, Record<string, number>>()
    for (const row of statusCounts) {
      const entry = countsByJob.get(row.jobName) || {}
      entry[row.status] = row._count._all
      countsByJob.set(row.jobName, entry)
    }

    const persistedByName = new Map(persistedJobs.map((job) => [job.jobName, job]))

    // Źródłem prawdy o tym, jakie zadania istnieją, są definicje. Dołączamy też
    // ewentualne osierocone wpisy z bazy, których nie ma już w definicjach.
    const knownNames = new Set(definitions.map((d) => d.name))
    const orphanNames = persistedJobs
      .map((j) => j.jobName)
      .filter((name) => !knownNames.has(name))

    const jobs = [
      ...definitions.map((def) => {
        const persisted = persistedByName.get(def.name)
        const counts = countsByJob.get(def.name) || {}
        return {
          name: def.name,
          description: def.description,
          intervalMs: def.intervalMs,
          registered: true,
          lastRunAt: persisted?.lastRunAt ?? null,
          lastStatus: persisted?.lastStatus ?? null,
          lockedAt: persisted?.lockedAt ?? null,
          lockedBy: persisted?.lockedBy ?? null,
          isRunning: !!persisted?.lockedAt,
          successCount: counts[JobRunStatus.SUCCESS] || 0,
          failedCount: counts[JobRunStatus.FAILED] || 0,
        }
      }),
      ...orphanNames.map((name) => {
        const persisted = persistedByName.get(name)
        const counts = countsByJob.get(name) || {}
        return {
          name,
          description: "(zadanie nie jest już zarejestrowane w kodzie)",
          intervalMs: null,
          registered: false,
          lastRunAt: persisted?.lastRunAt ?? null,
          lastStatus: persisted?.lastStatus ?? null,
          lockedAt: persisted?.lockedAt ?? null,
          lockedBy: persisted?.lockedBy ?? null,
          isRunning: !!persisted?.lockedAt,
          successCount: counts[JobRunStatus.SUCCESS] || 0,
          failedCount: counts[JobRunStatus.FAILED] || 0,
        }
      }),
    ]

    return NextResponse.json({
      jobs,
      runs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[ADMIN:scheduler] GET failed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const action = body?.action
    const jobName = body?.jobName

    if (action !== "run" || typeof jobName !== "string") {
      return NextResponse.json(
        { error: "Nieprawidłowe żądanie. Wymagane: { action: 'run', jobName }" },
        { status: 400 }
      )
    }

    const result = await triggerJob(jobName)

    if (result === null) {
      return NextResponse.json(
        { error: `Nie znaleziono zadania o nazwie '${jobName}'` },
        { status: 404 }
      )
    }

    if (result.skipped) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        message: "Zadanie jest aktualnie wykonywane — pominięto ręczne uruchomienie.",
      })
    }

    return NextResponse.json({
      ok: true,
      skipped: false,
      status: result.status,
      result: result.result ?? null,
    })
  } catch (error) {
    console.error("[ADMIN:scheduler] POST failed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
