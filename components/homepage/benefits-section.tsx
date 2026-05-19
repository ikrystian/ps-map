"use client"

import { Users, Zap, Scale, Lock, Shield, Clock } from "lucide-react"
import { motion } from "framer-motion"

const benefits = [
  { icon: Users, title: "Dostęp do doświadczonych prawników" },
  { icon: Zap, title: "Szybki proces zgłoszenia sprawy" },
  { icon: Scale, title: "Porównywanie ofert" },
  { icon: Lock, title: "Bezpieczeństwo i poufność" },
  { icon: Shield, title: "Elastyczność w wyborze prawnika" },
  { icon: Clock, title: "Wygoda i oszczędność czasu" }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export function BenefitsSection() {
  return (
    <section className="py-16 bg-background-sec">
      <div className="container mx-auto px-4">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8"
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div key={index} variants={itemVariants} className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-300">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-sm font-semibold mb-2">{benefit.title}</h3>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
