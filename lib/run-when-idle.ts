/**
 * Odkłada zadanie (np. wstrzyknięcie skryptu analityki) na moment, gdy przeglądarka
 * skończy ważniejszą pracę — rysowanie strony i hydrację. Skrypty trzecie nie blokują
 * wtedy wątku głównego w trakcie pierwszego renderu (TBT, LCP).
 *
 * Używać tylko po stronie przeglądarki.
 */
export function runWhenIdle(task: () => void, timeoutMs = 4000) {
  if (typeof window === "undefined") return
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => task(), { timeout: timeoutMs })
  } else {
    window.setTimeout(task, Math.min(timeoutMs, 2000))
  }
}
