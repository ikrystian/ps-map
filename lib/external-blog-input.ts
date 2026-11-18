import { NextResponse } from "next/server"

export const MAX_TITLE_LENGTH = 300
export { BLOG_SLUG_PATTERN as SLUG_PATTERN } from "@/lib/blog-slug"

export const badRequest = (error: string) => NextResponse.json({ error }, { status: 400 })

/** Pole opcjonalne: pominięte/null/"" → null, w przeciwnym razie musi być niepustym tekstem. */
export function optionalString(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === "") return null
  return typeof value === "string" ? value.trim() || null : undefined
}
