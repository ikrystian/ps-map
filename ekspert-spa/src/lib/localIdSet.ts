export function readIdSet(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? "[]") as string[])
  } catch {
    return new Set()
  }
}

export function writeIdSet(key: string, ids: Set<string>) {
  localStorage.setItem(key, JSON.stringify(Array.from(ids)))
}
