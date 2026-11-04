const PREFIX = "ps-ekspert-draft:"

/** Robocze wersje długich formularzy; przeżywają zamknięcie aplikacji przez system. */
export function readDraft<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(PREFIX + key)
    return stored ? (JSON.parse(stored) as T) : null
  } catch {
    return null
  }
}

export function writeDraft(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Brak miejsca na szkic nie może przerywać pisania
  }
}

export function removeDraft(key: string) {
  localStorage.removeItem(PREFIX + key)
}

export function clearDrafts() {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(PREFIX)) localStorage.removeItem(key)
  }
}
