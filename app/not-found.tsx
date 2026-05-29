"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-[9999] w-screen h-screen flex items-center justify-center overflow-hidden bg-black text-white font-sans selection:bg-white/20 selection:text-white">
      {/* Background Image with Zoom and Grayscale/Brightness filters */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: "url('/images/404-bg.png')",
        }}
        initial={{ scale: 1.05, opacity: 0, filter: "grayscale(100%) brightness(0.6)" }}
        animate={{ scale: 1, opacity: 0.65, filter: "grayscale(100%) brightness(0.45)" }}
        transition={{ duration: 3, ease: "easeOut" }}
      />

      {/* Cinematic Vignette Overlay */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-3xl px-6 text-center flex flex-col items-center justify-center">
        {/* "Error" tag */}
        <motion.p
          className="text-zinc-400 uppercase tracking-[0.25em] text-xs sm:text-sm font-semibold mb-1"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          Error
        </motion.p>

        {/* Large "404" with stroke outline and subtle glow */}
        <div className="relative select-none my-2">
          <motion.h1
            className="text-9xl sm:text-[12rem] md:text-[15rem] font-bold leading-none tracking-tight text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.25)] hover:[-webkit-text-stroke:2px_rgba(255,255,255,0.5)] transition-all duration-700 bg-gradient-to-b from-white/10 to-transparent bg-clip-text"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          >
            404
          </motion.h1>
          {/* Ambient glow behind 404 */}
          <div className="absolute inset-0 -z-10 bg-white/5 blur-[80px] rounded-full scale-75" />
        </div>

        {/* Subheading - Wordplay on "Prosta Sprawa" */}
        <motion.h2
          className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white/95 max-w-xl mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          Ups. Wygląda na to, że nie poszło tak prosto jak oczekiwałeś?
        </motion.h2>

        {/* Supporting description */}
        <motion.p
          className="text-zinc-400 text-sm sm:text-base font-light max-w-md mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        >
          Link, którego szukasz, nie istnieje lub został przeniesiony.
        </motion.p>

        {/* Call to action with animated curly arrow */}
        <motion.div
          className="relative inline-block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <p className="text-zinc-300 text-sm sm:text-base flex items-center justify-center gap-2">
            Nie przejmuj się, spróbuj wrócić do{" "}
            <Link
              href="/"
              className="font-semibold text-white underline underline-offset-4 decoration-white/30 hover:decoration-white hover:text-white transition-all duration-300 relative group"
            >
              strony głównej.
              {/* Subtle pulsing glow on hover */}
              <span className="absolute -inset-1 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
            </Link>
          </p>

          {/* Dotted Curly Arrow SVG pointing to "strony głównej" */}
          <div className="absolute -right-24 -bottom-10 w-24 h-16 pointer-events-none hidden md:block select-none">
            <svg
              width="90"
              height="60"
              viewBox="0 0 90 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white/65"
            >
              {/* Loop Path */}
              <motion.path
                d="M 80 10 C 85 20, 85 35, 70 40 C 55 45, 45 35, 55 25 C 65 15, 75 25, 60 40 C 45 50, 25 45, 10 38"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 1.4, ease: "easeInOut" }}
              />
              {/* Arrow Head */}
              <motion.path
                d="M 18 32 L 10 38 L 16 46"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 2.8, ease: "easeOut" }}
              />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Dynamic dust particles overlay for premium look */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0 opacity-40" />
    </div>
  );
}
