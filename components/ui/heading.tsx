import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const headingVariants = cva(
  "font-playfair tracking-tight text-white transition-colors",
  {
    variants: {
      size: {
        h1: "text-3xl sm:text-4xl font-bold",
        h2: "text-2xl sm:text-3xl font-semibold",
        h3: "text-xl sm:text-2xl font-medium",
        h4: "text-lg sm:text-xl font-medium",
      },
    },
    defaultVariants: {
      size: "h1",
    },
  }
)

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  level?: "h1" | "h2" | "h3" | "h4"
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = "h1", size, ...props }, ref) => {
    const Tag = level
    const computedSize = size || (level as "h1" | "h2" | "h3" | "h4")

    return (
      <Tag
        ref={ref}
        className={cn(headingVariants({ size: computedSize, className }))}
        {...props}
      />
    )
  }
)

Heading.displayName = "Heading"
