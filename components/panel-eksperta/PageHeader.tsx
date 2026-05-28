import { cn } from "@/lib/utils"

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
    <div className={cn("mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4", className)}>
      <div>
        <h1 className={cn("text-xl font-medium tracking-tight font-playfair", titleClassName)}>
          {title}
        </h1>
        {subtitle && (
          <p className={cn("text-muted-foreground mt-2", subtitleClassName)}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}
