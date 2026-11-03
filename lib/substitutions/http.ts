import { after, NextResponse } from "next/server"
import { FileRejectedError } from "./files"
import { SubstitutionError, runTasks, type Task } from "./workflow"

/** Odpowiedź z błędem akcji — komunikat biznesowy albo ogólny 500 z logiem. */
export function errorResponse(error: unknown, context: string): NextResponse {
  if (error instanceof SubstitutionError) {
    return NextResponse.json({ error: error.message, details: error.details ?? null }, { status: error.status })
  }
  if (error instanceof FileRejectedError) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  console.error(`[ZASTEPSTWA] ${context}:`, error)
  return NextResponse.json({ error: "Wystąpił błąd serwera. Spróbuj ponownie." }, { status: 500 })
}

/** Maile, SMS-y i rozsyłka idą po wysłaniu odpowiedzi — kliknięcie nie czeka na SMTP. */
export function scheduleTasks(tasks: Task[]): void {
  if (tasks.length > 0) after(() => runTasks(tasks))
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    throw new SubstitutionError(400, "Nieprawidłowe dane żądania")
  }
}
