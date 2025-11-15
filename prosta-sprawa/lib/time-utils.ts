/**
 * Utilities for smart time formatting in Polish
 */

/**
 * Formats a timestamp with intelligent Polish text
 * - "przed chwilą" (< 2 min)
 * - "X min temu" (< 60 min)
 * - Godzina (dziś, np. "14:30")
 * - "wczoraj" + godzina
 * - Dzień tygodnia (< 7 dni, np. "poniedziałek")
 * - Data pełna (starsze)
 */
export function formatSmartTimestamp(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  // Less than 2 minutes - "przed chwilą"
  if (diffInMinutes < 2) {
    return "przed chwilą"
  }

  // Less than 60 minutes - "X min temu"
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min temu`
  }

  // Less than 24 hours (today) - show hour
  if (diffInHours < 24 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Yesterday - "wczoraj" + hour
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth()) {
    const time = date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    })
    return `wczoraj ${time}`
  }

  // Less than 7 days - day of week
  if (diffInDays < 7) {
    const dayNames = [
      "niedziela",
      "poniedziałek",
      "wtorek",
      "środa",
      "czwartek",
      "piątek",
      "sobota",
    ]
    return dayNames[date.getDay()]
  }

  // Older - full date
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

/**
 * Formats a timestamp for message display
 * Shows time for today, date for older messages
 */
export function formatMessageTimestamp(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  const now = new Date()

  // Today - show time only
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return "wczoraj"
  }

  // This year - show date without year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
    })
  }

  // Older - show full date
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/**
 * Formats a date header for message groups
 */
export function formatMessageDateHeader(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  const now = new Date()

  // Today
  if (date.toDateString() === now.toDateString()) {
    return "Dziś"
  }

  // Yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return "Wczoraj"
  }

  // This week (last 7 days)
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)
  if (date > weekAgo) {
    const dayNames = [
      "Niedziela",
      "Poniedziałek",
      "Wtorek",
      "Środa",
      "Czwartek",
      "Piątek",
      "Sobota",
    ]
    return dayNames[date.getDay()]
  }

  // Older - full date
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

/**
 * Formats "last seen" time
 */
export function formatLastSeen(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 5) {
    return "aktywny teraz"
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} min temu`
  }

  if (diffInHours < 24) {
    return `${diffInHours} godz. temu`
  }

  if (diffInDays === 1) {
    return "wczoraj"
  }

  if (diffInDays < 7) {
    return `${diffInDays} dni temu`
  }

  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
  })
}
