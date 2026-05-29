"use client"

import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2, MessageCircle, Scale, Send, X } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Witaj! Jestem wirtualnym asystentem platformy **Prosta Sprawa**. Chętnie odpowiem na Twoje ogólne pytania prawne lub pomogę Ci odnaleźć się w naszym serwisie. W czym mogę pomóc?\n\n*Pamiętaj, że moje odpowiedzi mają charakter wyłącznie informacyjny i nie stanowią oficjalnej porady prawnej.*"
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isLoading, isOpen])

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")

    const updatedMessages = [...messages, { role: "user" as const, content: userMessage }]
    setMessages(updatedMessages)
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })

      if (!response.ok) {
        throw new Error("Wystąpił problem z połączeniem.")
      }

      const data = await response.json()
      if (data.message && data.message.content) {
        setMessages(prev => [...prev, { role: "assistant", content: data.message.content }])
      } else {
        throw new Error("Niepoprawna odpowiedź z serwera.")
      }
    } catch (error) {
      console.error(error)
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Przepraszam, wystąpił problem z połączeniem z serwerem. Spróbuj ponownie za chwilę."
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-6 z-50 flex flex-col items-end font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mb-4 flex h-[520px] w-[360px] flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 shadow-2xl backdrop-blur-md overflow-hidden sm:w-[400px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                  <Scale className="h-4 w-4 text-amber-500" />
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-950 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 leading-none">Asystent Prosta Sprawa</h3>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Model Gemini 2.5 Flash-lite</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors"
                aria-label="Zamknij czat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex flex-col max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "ml-auto bg-amber-500 dark:bg-amber-600 text-white rounded-br-none"
                      : "bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 rounded-bl-none border border-neutral-200/50 dark:border-neutral-800/50"
                  )}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold text-inherit">{children}</strong>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-sm leading-normal">{children}</li>,
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "underline transition-colors",
                            msg.role === "user"
                              ? "text-white hover:text-neutral-100"
                              : "text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-500"
                          )}
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 max-w-[85%] rounded-2xl rounded-bl-none px-3.5 py-2.5 text-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
                  <span>Asystent pisze...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="border-t border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-neutral-950">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Zadaj pytanie prawne..."
                  disabled={isLoading}
                  className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:focus:ring-amber-500/50 focus:border-amber-500 dark:focus:border-amber-500 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex items-center justify-center h-9 w-9 rounded-xl bg-amber-500 dark:bg-amber-600 text-white hover:bg-amber-600 dark:hover:bg-amber-700 transition-colors disabled:opacity-50 shadow-md shadow-amber-500/10"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[9px] text-neutral-500 dark:text-neutral-400 mt-2 text-center leading-normal">
                Rozmowa ma charakter wyłącznie informacyjny i nie zastępuje porady prawnej.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 dark:bg-amber-600 text-white shadow-lg hover:shadow-amber-500/20 dark:hover:shadow-amber-600/20 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-shadow border border-amber-600 dark:border-amber-700 cursor-pointer"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
