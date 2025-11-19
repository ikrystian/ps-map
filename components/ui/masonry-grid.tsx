import { cn } from "@/lib/utils"

export const MasonryGrid = ({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) => {
  return (
    <div
      className={cn(
        "columns-1 gap-4 space-y-4 md:columns-2 lg:columns-3",
        className,
      )}
    >
      {children}
    </div>
  )
}

export const MasonryGridItem = ({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) => {
  return (
    <div
      className={cn(
        "break-inside-avoid mb-4",
        className,
      )}
    >
      {children}
    </div>
  )
}
