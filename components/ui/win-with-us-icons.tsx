"use client"

import React from "react"
import { motion, Variants } from "framer-motion"

interface IconProps {
  className?: string
  width?: number | string
  height?: number | string
}

// Global transition settings for consistency
const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 15,
}

const idlePulse = {
  scale: [1, 1.03, 1],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
}

// ----------------------------------------------------
// 1. HERO SECTION ICONS (56x56)
// ----------------------------------------------------

/**
 * HowItWorksIcon - 3 interlocking gears rotating dynamically
 */
export const HowItWorksIcon: React.FC<IconProps> = ({ className, width = 56, height = 56 }) => {
  const centerGearVariants = {
    idle: {
      rotate: [0, 360],
      transition: { duration: 25, ease: "linear", repeat: Infinity }
    },
    hover: {
      rotate: [0, 360],
      scale: 1.05,
      transition: {
        rotate: { duration: 5, ease: "linear", repeat: Infinity },
        scale: springTransition
      }
    }
  }

  const outerGearVariants = {
    idle: {
      rotate: [0, -360],
      transition: { duration: 15, ease: "linear", repeat: Infinity }
    },
    hover: {
      rotate: [0, -360],
      transition: { duration: 3, ease: "linear", repeat: Infinity }
    }
  }

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate="idle"
      whileHover="hover"
    >
      {/* Center Gear (cx=28, cy=28) */}
      <motion.g
        style={{ originX: "28px", originY: "28px" }}
        variants={centerGearVariants}
      >
        <circle cx="28" cy="28" r="10" />
        <circle cx="28" cy="28" r="4" />
        {/* Teeth */}
        <line x1="28" y1="14" x2="28" y2="18" />
        <line x1="28" y1="38" x2="28" y2="42" />
        <line x1="14" y1="28" x2="18" y2="28" />
        <line x1="38" y1="28" x2="42" y2="28" />
        <line x1="18" y1="18" x2="21" y2="21" />
        <line x1="35" y1="35" x2="38" y2="38" />
        <line x1="18" y1="38" x2="21" y2="35" />
        <line x1="35" y1="18" x2="38" y2="21" />
      </motion.g>

      {/* Top-Right Gear (cx=42, cy=16) */}
      <motion.g
        style={{ originX: "42px", originY: "16px" }}
        variants={outerGearVariants}
      >
        <circle cx="42" cy="16" r="6" />
        <circle cx="42" cy="16" r="2.5" />
        {/* Teeth */}
        <line x1="42" y1="8" x2="42" y2="10" />
        <line x1="42" y1="22" x2="42" y2="24" />
        <line x1="34" y1="16" x2="36" y2="16" />
        <line x1="48" y1="16" x2="50" y2="16" />
        <line x1="36" y1="10" x2="38" y2="12" />
        <line x1="46" y1="20" x2="48" y2="22" />
        <line x1="36" y1="22" x2="38" y2="20" />
        <line x1="46" y1="10" x2="48" y2="12" />
      </motion.g>

      {/* Bottom-Left Gear (cx=14, cy=40) */}
      <motion.g
        style={{ originX: "14px", originY: "40px" }}
        variants={outerGearVariants}
      >
        <circle cx="14" cy="40" r="6" />
        <circle cx="14" cy="40" r="2.5" />
        {/* Teeth */}
        <line x1="14" y1="32" x2="14" y2="34" />
        <line x1="14" y1="46" x2="14" y2="48" />
        <line x1="6" y1="40" x2="8" y2="40" />
        <line x1="20" y1="40" x2="22" y2="40" />
        <line x1="8" y1="34" x2="10" y2="36" />
        <line x1="18" y1="44" x2="20" y2="46" />
        <line x1="8" y1="46" x2="10" y2="44" />
        <line x1="18" y1="34" x2="20" y2="36" />
      </motion.g>
    </motion.svg>
  )
}

/**
 * PayForRealHelpIcon - Clasping handshake with floating sparkling coin
 */
export const PayForRealHelpIcon: React.FC<IconProps> = ({ className, width = 56, height = 56 }) => {
  const handshakeVariants: Variants = {
    idle: { y: 0, rotate: 0 },
    hover: {
      y: [0, -1, 1, -1, 1, 0],
      rotate: [0, -1, 1, -1, 0],
      transition: { duration: 0.6, ease: "easeInOut" }
    }
  }

  const coinVariants: Variants = {
    idle: { y: 0, scale: 1 },
    hover: {
      y: [0, -3, 0],
      scale: 1.15,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  }

  const sparkleVariants: Variants = {
    idle: { scale: 0, opacity: 0 },
    hover: {
      scale: [0, 1.2, 1],
      opacity: [0, 1, 0],
      transition: { duration: 0.8, ease: "easeOut", delay: 0.1 }
    }
  }

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate="idle"
      whileHover="hover"
    >
      {/* Floating Coin above handshake */}
      <motion.g variants={coinVariants} style={{ originX: "28px", originY: "14px" }}>
        <circle cx="28" cy="14" r="6" />
        <path d="M28 11v6M26 13h4" strokeWidth="1.2" />
      </motion.g>

      {/* Sparkles */}
      <motion.path d="M16 12l2 2-2 2-2-2z" fill="currentColor" stroke="none" variants={sparkleVariants} />
      <motion.path d="M40 12l2 2-2 2-2-2z" fill="currentColor" stroke="none" variants={sparkleVariants} />
      <motion.path d="M28 5l1 1-1 1-1-1z" fill="currentColor" stroke="none" variants={sparkleVariants} />

      {/* Handshake Hands */}
      <motion.g variants={handshakeVariants} style={{ originX: "28px", originY: "32px" }}>
        {/* Left Hand / Palm */}
        <path d="M 6 36 L 16 36 C 19 36, 21 34, 23 32 L 28 27 C 29 26, 31 26, 32 27 C 33 28, 33 30, 32 31 L 27 36" />
        {/* Right Hand / Palm */}
        <path d="M 50 32 L 40 32 C 37 32, 35 34, 33 36 L 28 41 C 27 42, 25 42, 24 41 C 23 40, 23 38, 24 37 L 29 32" />
        
        {/* Fingers clasping in center */}
        <path d="M 25 29 C 26 28, 28 28, 29 29" />
        <path d="M 27 31 C 28 30, 30 30, 31 31" />
        <path d="M 29 33 C 30 32, 32 32, 33 33" />
      </motion.g>

    </motion.svg>
  )
}

/**
 * NotOnlyLawyersIcon - Multiple professionals/people
 */
export const NotOnlyLawyersIcon: React.FC<IconProps> = ({ className, width = 56, height = 56 }) => {
  const person1Variants: Variants = {
    idle: { x: 0, y: 0 },
    hover: { x: -1, y: -2, transition: springTransition },
  }

  const person2Variants: Variants = {
    idle: { x: 0, y: 0 },
    hover: { x: 1, y: -1, transition: springTransition },
  }

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate="idle"
      whileHover="hover"
      variants={{
        idle: {},
        hover: {}
      }}
    >
      {/* Main Person (Left) */}
      <motion.g variants={person1Variants}>
        <circle cx="20" cy="18" r="6" />
        <path d="M8 40c0-6 5-10 12-10s12 4 12 10" />
      </motion.g>

      {/* Secondary Person (Right) */}
      <motion.g variants={person2Variants}>
        <circle cx="38" cy="20" r="5" />
        <path d="M34 40c0-4 3-8 8-8s8 3 8 7" />
      </motion.g>
    </motion.svg>
  )
}


// ----------------------------------------------------
// 2. BENEFITS GRID ICONS (52x52)
// ----------------------------------------------------

/**
 * ConcreteHelpIcon - Speech bubble with drawing checkmark
 */
export const ConcreteHelpIcon: React.FC<IconProps> = ({ className, width = 52, height = 52 }) => {
  const bubbleVariants: Variants = {
    idle: { rotate: 0, y: 0 },
    hover: { rotate: [-1, 1, -1, 0], y: -2, transition: { duration: 0.4 } },
  }

  const checkVariants: Variants = {
    idle: { pathLength: 0.95 },
    hover: {
      pathLength: [0, 1],
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate="idle"
      whileHover="hover"
      variants={{
        idle: {},
        hover: {}
      }}
    >
      {/* Bubble */}
      <motion.path d="M8 10h36v24H24l-10 8V34H8V10z" variants={bubbleVariants} />
      
      {/* Checkmark */}
      <motion.path d="M18 22l5 5 11-10" variants={checkVariants} />
    </motion.svg>
  )
}

/**
 * TrustDecisionIcon - Shield with person inside
 */
export const TrustDecisionIcon: React.FC<IconProps> = ({ className, width = 52, height = 52 }) => {
  const shieldVariants: Variants = {
    idle: { scale: 1 },
    hover: { scale: 1.04, transition: springTransition },
  }

  const userVariants: Variants = {
    idle: { y: 0 },
    hover: { y: -2, transition: springTransition },
  }

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate="idle"
      whileHover="hover"
      variants={{
        idle: {},
        hover: {}
      }}
    >
      {/* Shield */}
      <motion.path
        d="M26 6L10 12v14c0 10 7 18 16 20 9-2 16-10 16-20V12L26 6z"
        variants={shieldVariants}
      />
      
      {/* Person inside */}
      <motion.g variants={userVariants}>
        <circle cx="26" cy="22" r="4" />
        <path d="M18 36c0-4 4-7 8-7s8 3 8 7" />
      </motion.g>
    </motion.svg>
  )
}

/**
 * AllInOnePlaceIcon - Document layout with lines staggered entry
 */
export const AllInOnePlaceIcon: React.FC<IconProps> = ({ className, width = 52, height = 52 }) => {
  const containerVariants: Variants = {
    idle: {},
    hover: { transition: { staggerChildren: 0.1 } },
  }

  const lineVariants: Variants = {
    idle: { scaleX: 1, originX: 0 },
    hover: {
      scaleX: [0, 1],
      transition: { duration: 0.4, ease: "easeOut" },
    },
  }

  const rectVariants: Variants = {
    idle: { scale: 1 },
    hover: { scale: 1.05, transition: springTransition },
  }

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate="idle"
      whileHover="hover"
      variants={containerVariants}
    >
      <rect x="6" y="8" width="40" height="36" rx="4" />
      <line x1="6" y1="18" x2="46" y2="18" />
      <motion.rect x="12" y="24" width="12" height="12" rx="2" variants={rectVariants} />
      <motion.line x1="28" y1="26" x2="38" y2="26" variants={lineVariants} />
      <motion.line x1="28" y1="30" x2="36" y2="30" variants={lineVariants} />
      <motion.line x1="28" y1="34" x2="34" y2="34" variants={lineVariants} />
    </motion.svg>
  )
}

/**
 * SecuredDataIcon - Padlock with opening/closing shackle
 */
export const SecuredDataIcon: React.FC<IconProps> = ({ className, width = 52, height = 52 }) => {
  const shackleVariants: Variants = {
    idle: { y: 0, rotate: 0 },
    hover: {
      y: -3,
      rotate: -5,
      transition: springTransition,
    },
  }

  const bodyVariants: Variants = {
    idle: { y: 0 },
    hover: { y: [0, -1, 1, 0], transition: { duration: 0.3 } },
  }

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate="idle"
      whileHover="hover"
      variants={{
        idle: {},
        hover: {}
      }}
    >
      {/* Shackle */}
      <motion.path d="M18 22v-6a8 8 0 0 1 16 0v6" variants={shackleVariants} style={{ originX: "34px", originY: "22px" }} />
      
      {/* Lock Body */}
      <motion.g variants={bodyVariants}>
        <rect x="12" y="22" width="28" height="22" rx="3" />
        <circle cx="26" cy="33" r="3" />
        <line x1="26" y1="36" x2="26" y2="40" />
      </motion.g>
    </motion.svg>
  )
}

/**
 * MultiDisciplinaryIcon - Briefcase
 */
export const MultiDisciplinaryIcon: React.FC<IconProps> = ({ className, width = 52, height = 52 }) => {
  const handleVariants: Variants = {
    idle: { y: 0 },
    hover: { y: -2, transition: springTransition },
  }

  const bodyVariants: Variants = {
    idle: { scale: 1 },
    hover: { scale: 1.02, transition: springTransition },
  }

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate="idle"
      whileHover="hover"
      variants={{
        idle: {},
        hover: {}
      }}
    >
      {/* Case Handle */}
      <motion.path d="M18 18v-4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4" variants={handleVariants} />
      
      {/* Case Body */}
      <motion.g variants={bodyVariants}>
        <rect x="6" y="18" width="40" height="28" rx="3" />
        <line x1="6" y1="30" x2="46" y2="30" />
        <line x1="26" y1="26" x2="26" y2="34" />
      </motion.g>
    </motion.svg>
  )
}

/**
 * SimpleStartIcon - Lightning bolt
 */
export const SimpleStartIcon: React.FC<IconProps> = ({ className, width = 52, height = 52 }) => {
  const boltVariants: Variants = {
    idle: { ...idlePulse },
    hover: {
      scale: 1.15,
      rotate: [-5, 5, -5, 5, 0],
      transition: {
        rotate: { duration: 0.4 },
        scale: springTransition
      }
    },
  }

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate="idle"
      whileHover="hover"
      variants={{
        idle: {},
        hover: {}
      }}
    >
      <motion.path
        d="M32 6L16 28h14L20 46l20-24H26L32 6z"
        variants={boltVariants}
      />
    </motion.svg>
  )
}


// ----------------------------------------------------
// 3. PROCESS STEP ICONS (48x48 upscale from 40x40 viewBox)
// ----------------------------------------------------

/**
 * DescribeCaseIcon - Sheet of paper and writing pencil
 */
export const DescribeCaseIcon: React.FC<IconProps> = ({ className, width = 48, height = 48 }) => {
  const penVariants: Variants = {
    idle: { x: 0, y: 0, rotate: 0 },
    hover: {
      x: [-1, 2, -2, 1, 0],
      y: [-1, -2, 1, -1, 0],
      rotate: [0, -5, 5, -2, 0],
      transition: { duration: 1.2, ease: "easeInOut", repeat: Infinity },
    },
  }

  const lineVariants: Variants = {
    idle: { pathLength: 1 },
    hover: {
      pathLength: [0, 1],
      transition: { duration: 0.8, ease: "easeOut" },
    },
  }

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate="idle"
      whileHover="hover"
      variants={{
        idle: {},
        hover: {}
      }}
    >
      {/* Paper Page */}
      <rect x="7" y="5" width="22" height="28" rx="3" />
      <motion.path d="M12 11H24" variants={lineVariants} />
      <motion.path d="M12 17H22" variants={lineVariants} />
      <motion.path d="M12 23H18" variants={lineVariants} />
      
      {/* Pen */}
      <motion.g variants={penVariants} style={{ originX: "27.5px", originY: "32.5px" }}>
        <circle cx="30" cy="30" r="7" fill="#1e1d1a" />
        <path d="M27.5 32.5l1-2.5 3-3a1 1 0 0 1 1.5 0l.7.7a1 1 0 0 1 0 1.5l-3 3-2.2.3z" strokeWidth="1" />
      </motion.g>
    </motion.svg>
  )
}

/**
 * ReceiveOffersIcon - Tray with bouncing downward arrow
 */
export const ReceiveOffersIcon: React.FC<IconProps> = ({ className, width = 48, height = 48 }) => {
  const arrowVariants: Variants = {
    idle: { y: 0 },
    hover: {
      y: [0, 4, 0],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  }

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate="idle"
      whileHover="hover"
      variants={{
        idle: {},
        hover: {}
      }}
    >
      {/* Tray */}
      <rect x="4" y="22" width="32" height="14" rx="3" />
      <path d="M4 26h8l3 4h10l3-4h8" />
      
      {/* Downward Arrow */}
      <motion.g variants={arrowVariants}>
        <path d="M20 6v12" />
        <path d="M14 12l6 6 6-6" />
      </motion.g>
    </motion.svg>
  )
}

/**
 * ChooseAndActIcon - Checked badge person profile
 */
export const ChooseAndActIcon: React.FC<IconProps> = ({ className, width = 48, height = 48 }) => {
  const badgeVariants: Variants = {
    idle: { scale: 1 },
    hover: { scale: 1.15, rotate: [0, -5, 5, 0], transition: springTransition },
  }

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate="idle"
      whileHover="hover"
      variants={{
        idle: {},
        hover: {}
      }}
    >
      {/* Person */}
      <circle cx="16" cy="14" r="5" />
      <path d="M6 32c0-5 4-9 10-9s10 4 10 9" />
      
      {/* Check Badge */}
      <motion.g variants={badgeVariants} style={{ originX: "29px", originY: "22px" }}>
        <circle cx="29" cy="22" r="8" fill="#1e1d1a" />
        <path d="M25 22l3 3 5-5" />
      </motion.g>
    </motion.svg>
  )
}

/**
 * SearchLawyerIcon - Scanning magnifying glass
 */
export const SearchLawyerIcon: React.FC<IconProps> = ({ className, width = 48, height = 48 }) => {
  const glassVariants: Variants = {
    idle: { x: 0, y: 0 },
    hover: {
      x: [0, 2, -2, 2, 0],
      y: [0, -2, 2, -1, 0],
      transition: { duration: 1.2, ease: "easeInOut" },
    },
  }

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate="idle"
      whileHover="hover"
      variants={{
        idle: {},
        hover: {}
      }}
    >
      {/* Magnifying Glass */}
      <motion.g variants={glassVariants}>
        <circle cx="16" cy="16" r="8" />
        <line x1="22" y1="22" x2="32" y2="32" />
      </motion.g>
      
      {/* Person/List dot in background */}
      <circle cx="28" cy="28" r="5" fill="#1e1d1a" />
    </motion.svg>
  )
}

/**
 * DirectWriteIcon - Chat speech bubble with blinking indicator
 */
export const DirectWriteIcon: React.FC<IconProps> = ({ className, width = 48, height = 48 }) => {
  const bubbleVariants: Variants = {
    idle: { y: 0 },
    hover: { y: -2, transition: springTransition },
  }

  const dotVariants = {
    idle: { opacity: 0.5 },
    hover: (i: number) => ({
      opacity: [0.3, 1, 0.3],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        delay: i * 0.15,
      },
    }),
  }

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate="idle"
      whileHover="hover"
      variants={{
        idle: {},
        hover: {}
      }}
    >
      {/* Message Bubble */}
      <motion.path
        d="M6 8h28v18H22l-6 6V26H6V8z"
        variants={bubbleVariants}
      />
      
      {/* Blinking Typing dots */}
      <motion.circle cx="14" cy="17" r="1.5" fill="currentColor" stroke="none" custom={0} variants={dotVariants} />
      <motion.circle cx="20" cy="17" r="1.5" fill="currentColor" stroke="none" custom={1} variants={dotVariants} />
      <motion.circle cx="26" cy="17" r="1.5" fill="currentColor" stroke="none" custom={2} variants={dotVariants} />
    </motion.svg>
  )
}

/**
 * ScheduleMeetingIcon - Calendar with check badge pop
 */
export const ScheduleMeetingIcon: React.FC<IconProps> = ({ className, width = 48, height = 48 }) => {
  const calendarVariants: Variants = {
    idle: { rotate: 0 },
    hover: { rotate: [-2, 2, -2, 0], transition: { duration: 0.4 } },
  }

  const checkVariants: Variants = {
    idle: { scale: 0, opacity: 0 },
    hover: { scale: 1, opacity: 1, transition: springTransition },
  }

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate="idle"
      whileHover="hover"
      variants={{
        idle: {},
        hover: {}
      }}
    >
      {/* Calendar Base */}
      <motion.g variants={calendarVariants}>
        <rect x="6" y="8" width="28" height="24" rx="3" />
        <path d="M6 14H34M12 6V10M28 6V10" />
      </motion.g>
      
      {/* Check Badge */}
      <motion.g variants={checkVariants} style={{ originX: "28px", originY: "24px" }}>
        <circle cx="28" cy="24" r="7" fill="#1e1d1a" />
        <path d="M25 24l2 2.5 4-4" />
      </motion.g>
    </motion.svg>
  )
}
