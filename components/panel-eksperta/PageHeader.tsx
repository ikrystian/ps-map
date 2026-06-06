import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface PageHeaderProps {
  title: string
  subtitle?: string
  className?: string
  titleClassName?: string
  subtitleClassName?: string
  children?: React.ReactNode
}

export function PageHeader({
  title,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
  children,
}: PageHeaderProps) {
  return (

    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <div className={cn("mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4", className)}>
          <div>
            <h1 className={cn("text-2xl font-medium tracking-tight font-playfair", titleClassName)}>
              {title}
            </h1>
            {subtitle && (
              <p className={cn("text-muted-foreground text-sm", subtitleClassName)}>
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>
      </motion.div>
    </div>
  )
}
