"use client"

import { HelpCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface ExpertTourButtonProps {
  onStart: () => void
  className?: string
  visible?: boolean
}

export function ExpertTourButton({
  onStart,
  className,
  visible = true,
}: ExpertTourButtonProps) {
  if (!visible) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            id="tour-help-button"
            onClick={onStart}
            size="icon"
            className={cn(
              "fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-2xl",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 hover:scale-110",
              "transition-all duration-300 ease-in-out",
              "border-2 border-primary/30",
              "animate-in fade-in slide-in-from-bottom-4",
              className
            )}
            aria-label="Uruchom samouczek"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="font-medium">
          Pokaż samouczek
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
