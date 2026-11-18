"use client"

import dynamic from "next/dynamic"

// Widżety pływające pojawiają się na każdej stronie, ale nie są potrzebne do pierwszego renderu.
// Ładujemy je po stronie klienta osobnymi chunkami (react-markdown, framer-motion itd. nie blokują LCP).
export const LazyChatAssistant = dynamic(() => import("@/components/ChatAssistant").then((m) => m.ChatAssistant), { ssr: false })
export const LazyBugReportWidget = dynamic(() => import("@/components/BugReportWidget").then((m) => m.BugReportWidget), { ssr: false })
