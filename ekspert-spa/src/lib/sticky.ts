import { useCallback, useState } from "react"

const store = new Map<string, unknown>()

/** Stan ekranu, który przetrwa wejście w szczegóły i powrót na listę (filtry, wyszukiwanie). */
export function useStickyState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => (store.has(key) ? (store.get(key) as T) : initial))

  const update = useCallback(
    (next: T) => {
      store.set(key, next)
      setValue(next)
    },
    [key]
  )

  return [value, update] as const
}

/** Ustawia filtr przed wejściem na ekran, np. kafelek pulpitu otwiera listę nowych spraw. */
export function presetStickyState(key: string, value: unknown) {
  store.set(key, value)
}

export function clearStickyState() {
  store.clear()
}
