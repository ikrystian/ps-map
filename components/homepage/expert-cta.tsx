"use client";

import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { motion } from "framer-motion";
import Link from "next/link";

export function ExpertCTA() {
  return (
    <section
      className="relative overflow-hidden w-full bg-black py-6 md:py-20 xl:py-24"
      id="expert-cta"
      style={{
        backgroundImage: "url('/images/meet-expert.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right center",
        backgroundSize: "cover",
      }}
    >
      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text Content and Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Heading */}
            <h2 className="text-4xl md:text-5xl lg:text-5xl font-light font-playfair tracking-tight leading-tight text-white mb-6">
              <span className="italic">Daj się </span>
              <span className="font-bold text-white">poznać</span>
              <span className="italic"> jako Ekspert Prawa</span>
            </h2>

            {/* Description */}
            <div className="space-y-4 mt-4 md:mt-6 max-w-2xl">
              <p className="text-white  text-base md:text-lg lg:text-xl leading-relaxed">
                Zyskaj dostęp do narzędzi, które pomogą Ci skuteczniej docierać
                do osób poszukujących pomocy prawnej.
              </p>
              <p className="text-white font-bold  text-base md:text-lg lg:text-xl block">
                Stwórz profil i zdobądź nowych klientów!
              </p>
            </div>

            {/* Button */}
            <div className="mt-8 md:mt-10">
              <Link href="/rejestracja/ekspert">
                <InteractiveHoverButton>Załóż konto</InteractiveHoverButton>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Empty space for user's background statue / images */}
          <div className="hidden lg:block lg:col-span-5 h-[300px] pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
