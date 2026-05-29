"use client"

import { Badge } from "@/components/ui/badge"
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle } from "lucide-react"

export function UnreadMessagesBadge() {
  const { unreadCount } = useRealtimeMessages({
    enabled: true,
  })

  if (unreadCount === 0) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className="relative inline-block"
      >
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-5 min-w-5 rounded-full flex items-center justify-center px-1.5 text-xs z-10"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      </motion.div>
    </AnimatePresence>
  )
}

export function UnreadMessagesIndicator() {
  const { unreadCount } = useRealtimeMessages({
    enabled: true,
  })

  return (
    <div className="relative inline-flex items-center">
      <MessageCircle className="h-5 w-5" />
      {unreadCount > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 min-w-5 rounded-full flex items-center justify-center px-1.5 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
