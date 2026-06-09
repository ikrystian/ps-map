"use client"

import { cn } from "@/lib/utils"
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import { useEffect, useState } from "react"

type Testimonial = {
  quote: string
  name: string
  designation: string
  src: string
}

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
  className,
}: {
  testimonials: Testimonial[]
  autoplay?: boolean
  className?: string
}) => {
  const [active, setActive] = useState(0)

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length)
  }

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const isActive = (index: number) => {
    return index === active
  }

  useEffect(() => {
    if (autoplay && testimonials.length > 1) {
      const interval = setInterval(handleNext, 5000)
      return () => clearInterval(interval)
    }
  }, [autoplay, testimonials.length])

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10
  }

  if (!testimonials || testimonials.length === 0) return null

  return (
    <div className={cn("max-w-sm md:max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-8 lgpy-20", className)}>
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-20">
        <div>
          <div className="relative h-80 w-full">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: randomRotateY(),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    zIndex: isActive(index)
                      ? 49
                      : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: randomRotateY(),
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <Image
                    src={testimonial.src}
                    alt={testimonial.name}
                    width={500}
                    height={500}
                    draggable={false}
                    className="h-full w-full rounded-3xl object-cover object-center shadow-xl border border-zinc-800/30"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex justify-between flex-col py-4">
          <motion.div
            key={active}
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -20,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
          >
            <h3 className=" text-2xl font-light text-zinc-100">
              {testimonials[active].name}
            </h3>
            <p className="text-[11px] font-semibold text-[#cda567] tracking-[0.12em] uppercase mt-1.5">
              {testimonials[active].designation}
            </p>
            <motion.p className="text-lg text-zinc-200 mt-8 italic leading-relaxed font-light">
              {testimonials[active].quote.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{
                    filter: "blur(10px)",
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    filter: "blur(0px)",
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    delay: 0.02 * index,
                  }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
          {testimonials.length > 1 && (
            <div className="flex gap-2 pt-12 md:pt-0">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-lg bg-[#0da192] hover:bg-[#0b8b7e] text-white flex items-center justify-center group/button transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                aria-label="Poprzednia opinia"
              >
                <IconArrowLeft className="h-5 w-5 text-white group-hover/button:rotate-12 transition-transform duration-300" />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-lg bg-[#0da192] hover:bg-[#0b8b7e] text-white flex items-center justify-center group/button transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                aria-label="Następna opinia"
              >
                <IconArrowRight className="h-5 w-5 text-white group-hover/button:-rotate-12 transition-transform duration-300" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
