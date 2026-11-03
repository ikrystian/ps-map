import { validateUploadedFile, type AllowedExtension } from "@/lib/file-validation"
import crypto from "crypto"
import { existsSync } from "fs"
import { mkdir, readdir, readFile, rm, writeFile } from "fs/promises"
import path from "path"
import { MAX_FILE_MB } from "./constants"

/**
 * Pliki zleceń zastępstw (pozew, instrukcja, protokół). Celowo POZA `.uploads`,
 * bo tamten katalog serwuje /api/uploads/[...path] każdemu zalogowanemu —
 * te pliki objęte są tajemnicą zawodową i wychodzą wyłącznie przez
 * /api/substitutions/[id]/files/[fileId] do zlecającego i wybranego zastępcy
 * (tak samo jak faktury w `.invoices`).
 */
export const SUBSTITUTIONS_DIR = path.join(process.cwd(), ".substitutions")

export const ALLOWED_EXTENSIONS: AllowedExtension[] = ["pdf", "doc", "docx", "jpg", "jpeg", "png"]

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
}

export class FileRejectedError extends Error {}

/** Ścieżka absolutna z zapisanej względnej — tylko wewnątrz katalogu zastępstw. */
export function resolveStoredPath(sciezka: string): string {
  const full = path.resolve(SUBSTITUTIONS_DIR, sciezka)
  if (!full.startsWith(SUBSTITUTIONS_DIR + path.sep)) {
    throw new FileRejectedError("Nieprawidłowa ścieżka pliku")
  }
  return full
}

export async function storeSubstitutionFile(
  orderId: string,
  file: File
): Promise<{ nazwa: string; sciezka: string; rozmiar: number; mime: string }> {
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    throw new FileRejectedError(`Plik jest za duży — maksymalnie ${MAX_FILE_MB} MB`)
  }
  if (file.size === 0) throw new FileRejectedError("Plik jest pusty")

  const buffer = Buffer.from(await file.arrayBuffer())
  const validation = validateUploadedFile(buffer, file.name, ALLOWED_EXTENSIONS)
  if (!validation.ok || !validation.ext) {
    throw new FileRejectedError(validation.error ?? "Niedozwolony typ pliku — dodaj PDF, DOCX albo JPG")
  }

  const dir = resolveStoredPath(orderId)
  await mkdir(dir, { recursive: true })
  const storedName = `${crypto.randomUUID()}.${validation.ext}`
  await writeFile(path.join(dir, storedName), buffer)

  // Nazwa do pokazania — bez ścieżek i znaków sterujących
  const nazwa = path.basename(file.name).replace(/[\x00-\x1f"\\/]/g, "").slice(0, 160) || storedName

  return {
    nazwa,
    sciezka: `${orderId}/${storedName}`,
    rozmiar: buffer.length,
    mime: validation.mime ?? MIME_BY_EXT[validation.ext] ?? "application/octet-stream",
  }
}

export async function readSubstitutionFile(sciezka: string): Promise<Buffer> {
  return readFile(resolveStoredPath(sciezka))
}

export async function deleteSubstitutionFile(sciezka: string): Promise<void> {
  await rm(resolveStoredPath(sciezka), { force: true })
}

export async function deleteOrderFiles(orderId: string): Promise<void> {
  await rm(resolveStoredPath(orderId), { recursive: true, force: true })
}

/** Katalogi zleceń na dysku — do sprzątania plików osieroconych po usuniętych zleceniach. */
export async function listOrderDirectories(): Promise<string[]> {
  if (!existsSync(SUBSTITUTIONS_DIR)) return []
  const entries = await readdir(SUBSTITUTIONS_DIR, { withFileTypes: true })
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
}

/** Content-Disposition z polską nazwą pliku (RFC 5987). */
export function contentDisposition(nazwa: string, inline: boolean): string {
  const ascii = nazwa.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "")
  return `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(nazwa)}`
}
