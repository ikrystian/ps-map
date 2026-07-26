"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import {
  motion,
  type TargetAndTransition,
  type VariantLabels,
  type HTMLMotionProps,
  type LegacyAnimationControls,
} from "framer-motion"

import { getStrictContext } from "@/lib/get-strict-context"
import { useControlledState } from "@/hooks/use-controlled-state"
import { cn } from "@/lib/utils"

type SwitchContextType = {
  isChecked: boolean
  setIsChecked: (isChecked: boolean) => void
  isPressed: boolean
  setIsPressed: (isPressed: boolean) => void
}

const [SwitchProvider, useSwitch] =
  getStrictContext<SwitchContextType>("SwitchContext")

type SwitchPrimitiveProps = Omit<
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
  "asChild"
> &
  HTMLMotionProps<"button">

type SwitchProps = SwitchPrimitiveProps & {
  pressedWidth?: number
  startIcon?: React.ReactElement
  endIcon?: React.ReactElement
  thumbIcon?: React.ReactElement
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(
  (
    {
      className,
      pressedWidth = 19,
      startIcon,
      endIcon,
      thumbIcon,
      checked,
      defaultChecked,
      onCheckedChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isPressed, setIsPressed] = React.useState(false)
    const [isChecked, setIsChecked] = useControlledState({
      value: checked,
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
    })

    return (
      <SwitchProvider
        value={{ isChecked, setIsChecked, isPressed, setIsPressed }}
      >
        <SwitchPrimitives.Root
          ref={ref}
          checked={isChecked}
          onCheckedChange={setIsChecked}
          disabled={disabled}
          asChild
        >
          <motion.button
            type="button"
            data-slot="switch"
            whileTap="tap"
            initial={false}
            onTapStart={() => setIsPressed(true)}
            onTapCancel={() => setIsPressed(false)}
            onTap={() => setIsPressed(false)}
            className={cn(
              "relative peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input data-[state=checked]:justify-end p-0.5",
              className
            )}
            {...props}
          >
            <SwitchThumb
              pressedAnimation={{ width: pressedWidth }}
              className={cn(
                "relative z-10 block h-5 w-5 rounded-full bg-background shadow-lg ring-0 pointer-events-none"
              )}
            >
              {thumbIcon && (
                <SwitchIcon
                  position="thumb"
                  className="absolute inset-0 flex items-center justify-center text-muted-foreground [&_svg]:size-3"
                >
                  {thumbIcon}
                </SwitchIcon>
              )}
            </SwitchThumb>

            {startIcon && (
              <SwitchIcon
                position="left"
                className="absolute left-1 flex items-center justify-center text-muted-foreground [&_svg]:size-3"
              >
                {startIcon}
              </SwitchIcon>
            )}
            {endIcon && (
              <SwitchIcon
                position="right"
                className="absolute right-1 flex items-center justify-center text-muted-foreground [&_svg]:size-3"
              >
                {endIcon}
              </SwitchIcon>
            )}
          </motion.button>
        </SwitchPrimitives.Root>
      </SwitchProvider>
    )
  }
)
Switch.displayName = "Switch"

type SwitchThumbProps = Omit<
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Thumb>,
  "asChild"
> &
  HTMLMotionProps<"div"> & {
    pressedAnimation?:
      | TargetAndTransition
      | VariantLabels
      | boolean
      | LegacyAnimationControls
  }

const SwitchThumb = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Thumb>,
  SwitchThumbProps
>(
  (
    {
      className,
      pressedAnimation,
      transition = { type: "spring", stiffness: 300, damping: 25 },
      children,
      ...props
    },
    ref
  ) => {
    const { isPressed } = useSwitch()

    return (
      <SwitchPrimitives.Thumb ref={ref} asChild>
        <motion.div
          data-slot="switch-thumb"
          whileTap="tap"
          layout
          transition={transition}
          animate={isPressed ? pressedAnimation : undefined}
          className={className}
          {...props}
        >
          {children}
        </motion.div>
      </SwitchPrimitives.Thumb>
    )
  }
)
SwitchThumb.displayName = "SwitchThumb"

type SwitchIconPosition = "left" | "right" | "thumb"

type SwitchIconProps = HTMLMotionProps<"div"> & {
  position: SwitchIconPosition
}

function SwitchIcon({
  position,
  transition = { type: "spring", bounce: 0 },
  ...props
}: SwitchIconProps) {
  const { isChecked } = useSwitch()

  const isAnimated = React.useMemo(() => {
    if (position === "right") return !isChecked
    if (position === "left") return isChecked
    if (position === "thumb") return true
    return false
  }, [position, isChecked])

  return (
    <motion.div
      data-slot={`switch-${position}-icon`}
      animate={isAnimated ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={transition}
      {...props}
    />
  )
}

export { Switch, SwitchThumb, SwitchIcon, useSwitch, type SwitchProps }

