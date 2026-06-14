/**
 * Walidacja przesyłanych plików.
 *
 * Sprawdza:
 *   1. rozszerzenie wobec whitelisty,
 *   2. sygnaturę pliku (magic bytes) wobec zadeklarowanego typu —
 *      odporne na podszywanie się przez nagłówek MIME klienta.
 *
 * Pliki bez bezpiecznej sygnatury (np. HTML, SVG, skrypty) są odrzucane.
 */

export type AllowedExtension =
  | "jpg" | "jpeg" | "png" | "webp" | "gif"
  | "pdf" | "doc" | "docx" | "xls" | "xlsx" | "txt"
  | "svg"

interface FileTypeSpec {
  /** Kanoniczny typ MIME zwracany po walidacji. */
  mime: string
  /** Lista akceptowanych sygnatur (każda to sekwencja bajtów na początku pliku). */
  signatures: number[][]
  /** Offset, od którego sprawdzana jest sygnatura (domyślnie 0). */
  offset?: number
  /** Plik tekstowy bez wiarygodnej sygnatury — walidacja tylko po rozszerzeniu. */
  signatureless?: boolean
}

// Magic bytes: https://en.wikipedia.org/wiki/List_of_file_signatures
const FILE_TYPES: Record<AllowedExtension, FileTypeSpec> = {
  jpg: { mime: "image/jpeg", signatures: [[0xff, 0xd8, 0xff]] },
  jpeg: { mime: "image/jpeg", signatures: [[0xff, 0xd8, 0xff]] },
  png: { mime: "image/png", signatures: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]] },
  gif: { mime: "image/gif", signatures: [[0x47, 0x49, 0x46, 0x38]] }, // "GIF8"
  webp: { mime: "image/webp", signatures: [[0x52, 0x49, 0x46, 0x46]] }, // "RIFF" (+ "WEBP" @8)
  pdf: { mime: "application/pdf", signatures: [[0x25, 0x50, 0x44, 0x46]] }, // "%PDF"
  // Pakiety OOXML (docx/xlsx) to archiwa ZIP → sygnatura "PK".
  docx: {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    signatures: [[0x50, 0x4b, 0x03, 0x04], [0x50, 0x4b, 0x05, 0x06], [0x50, 0x4b, 0x07, 0x08]],
  },
  xlsx: {
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    signatures: [[0x50, 0x4b, 0x03, 0x04], [0x50, 0x4b, 0x05, 0x06], [0x50, 0x4b, 0x07, 0x08]],
  },
  // Stare formaty MS Office to kontenery OLE2 (CFBF).
  doc: { mime: "application/msword", signatures: [[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]] },
  xls: { mime: "application/vnd.ms-excel", signatures: [[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]] },
  txt: { mime: "text/plain", signatures: [], signatureless: true },
  svg: { mime: "image/svg+xml", signatures: [], signatureless: true },
}

/** Domyślny zestaw rozszerzeń dozwolonych dla ogólnego uploadu (obrazy + dokumenty). */
export const DEFAULT_ALLOWED_EXTENSIONS: AllowedExtension[] = [
  "jpg", "jpeg", "png", "webp", "gif", "pdf", "doc", "docx", "xls", "xlsx", "txt",
]

/** Rozszerzenia dozwolone wyłącznie dla administratorów (m.in. SVG dla ikon pakietów). */
export const ADMIN_ALLOWED_EXTENSIONS: AllowedExtension[] = [
  ...DEFAULT_ALLOWED_EXTENSIONS,
  "svg",
]

export interface FileValidationResult {
  ok: boolean
  error?: string
  ext?: AllowedExtension
  /** Zweryfikowany kanoniczny typ MIME. */
  mime?: string
}

function matchesSignature(buffer: Buffer, signature: number[], offset = 0): boolean {
  if (buffer.length < offset + signature.length) return false
  for (let i = 0; i < signature.length; i++) {
    if (buffer[offset + i] !== signature[i]) return false
  }
  return true
}

/**
 * Waliduje plik na podstawie nazwy i zawartości.
 * @param allow Lista dozwolonych rozszerzeń (domyślnie DEFAULT_ALLOWED_EXTENSIONS).
 */
export function validateUploadedFile(
  buffer: Buffer,
  filename: string,
  allow: AllowedExtension[] = DEFAULT_ALLOWED_EXTENSIONS
): FileValidationResult {
  const ext = filename.split(".").pop()?.toLowerCase() as AllowedExtension | undefined

  if (!ext || !(ext in FILE_TYPES)) {
    return { ok: false, error: "Niedozwolony typ pliku" }
  }
  if (!allow.includes(ext)) {
    return { ok: false, error: "Niedozwolony typ pliku" }
  }

  const spec = FILE_TYPES[ext]

  if (spec.signatureless) {
    return { ok: true, ext, mime: spec.mime }
  }

  const matched = spec.signatures.some((sig) => matchesSignature(buffer, sig, spec.offset))
  if (!matched) {
    return { ok: false, error: "Zawartość pliku nie odpowiada jego rozszerzeniu" }
  }

  // WEBP: dodatkowo sprawdź marker "WEBP" na offsecie 8.
  if (ext === "webp" && !matchesSignature(buffer, [0x57, 0x45, 0x42, 0x50], 8)) {
    return { ok: false, error: "Nieprawidłowy plik WEBP" }
  }

  return { ok: true, ext, mime: spec.mime }
}

/** Czy dany typ MIME można bezpiecznie serwować inline (wyświetlić w przeglądarce). */
export function isInlineSafeMime(mime: string): boolean {
  return mime === "image/jpeg" || mime === "image/png" || mime === "image/webp" || mime === "image/gif"
}
