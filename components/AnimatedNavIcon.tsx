"use client"

import { useEffect, useRef } from "react"

interface AnimatedNavIconProps {
  icon: React.ComponentType<any>
  isHovered: boolean
  className?: string
  size?: number
}

export function AnimatedNavIcon({
  icon: Icon,
  isHovered,
  className,
  size = 20,
}: AnimatedNavIconProps) {
  const iconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null)

  useEffect(() => {
    if (isHovered) {
      iconRef.current?.startAnimation()
    } else {
      iconRef.current?.stopAnimation()
    }
  }, [isHovered])

  const Component = Icon as any

  return <Component ref={iconRef} size={size} className={className} />
}
