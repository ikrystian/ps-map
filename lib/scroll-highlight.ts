// Przewija widok do elementu wskazanego selektorem i tymczasowo go podświetla
// (klasa .score-highlight w globals.css). Ponawia próby znalezienia elementu,
// bo cel może pojawić się dopiero po przełączeniu zakładki lub wczytaniu danych.
export function scrollToAndHighlight(selector: string) {
  const HIGHLIGHT_CLASS = "score-highlight"
  const HIGHLIGHT_DURATION_MS = 3000

  const tryFind = (attemptsLeft: number) => {
    const el = document.querySelector<HTMLElement>(selector)
    if (el) {
      // Usuń poprzednie podświetlenia, aby akcent wskazywał tylko jeden element
      document
        .querySelectorAll<HTMLElement>(`.${HIGHLIGHT_CLASS}`)
        .forEach((node) => node.classList.remove(HIGHLIGHT_CLASS))

      el.scrollIntoView({ behavior: "smooth", block: "center" })
      el.classList.add(HIGHLIGHT_CLASS)
      window.setTimeout(() => el.classList.remove(HIGHLIGHT_CLASS), HIGHLIGHT_DURATION_MS)
    } else if (attemptsLeft > 0) {
      window.setTimeout(() => tryFind(attemptsLeft - 1), 100)
    }
  }

  tryFind(30)
}
