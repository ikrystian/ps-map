import { readFile } from "fs/promises"
import { join, basename } from "path"
import sharp from "sharp"
import { unstable_cache } from "next/cache"
import { absoluteUrl } from "@/lib/structured-data"

export interface ImageDimensions {
  width: number
  height: number
}

const FETCH_TIMEOUT_MS = 4000

async function readImageBuffer(src: string): Promise<Buffer | null> {
  // Pliki z uploadu lokalnego: /api/files/<nazwa> → katalog files/ (bez ścieżek w nazwie)
  if (src.startsWith("/api/files/")) {
    const name = basename(src.slice("/api/files/".length).split("?")[0])
    if (!name || name === "." || name === "..") return null
    try {
      return await readFile(join(process.cwd(), "files", name))
    } catch {
      return null
    }
  }

  try {
    const res = await fetch(absoluteUrl(src), { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

async function measureImage(src: string): Promise<ImageDimensions | null> {
  const buffer = await readImageBuffer(src)
  if (!buffer) return null
  try {
    const { width, height } = await sharp(buffer).metadata()
    if (!width || !height) return null
    return { width, height }
  } catch {
    return null
  }
}

/**
 * Wymiary obrazka (px) potrzebne do og:image:width / og:image:height.
 * Zwraca null, gdy nie da się ich ustalić — wtedy tagi po prostu nie są generowane.
 * Wynik cache'owany godzinę, żeby nie pobierać obrazka przy każdym renderze.
 */
export function getImageDimensions(src: string): Promise<ImageDimensions | null> {
  return unstable_cache(() => measureImage(src), ["blog-og-image-dimensions", src], {
    revalidate: 3600,
  })()
}
