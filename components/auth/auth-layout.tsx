"use client";

import { NumberTicker } from "@/components/ui/number-ticker";
import { motion } from "motion/react";
import { ReactNode } from "react";

interface HeroStat {
  value: number;
  unit?: string;
  label: string;
}

interface AuthLayoutProps {
  children: ReactNode;
  heroTitle?: string;
  heroDescription?: string;
  heroStats?: HeroStat[];
  containerClassName?: string;
  heroImage?: string;
}

export function AuthLayout({
  children,
  heroTitle = "Twoja droga do rozwiązania problemów prawnych",
  heroDescription = "Połącz się z najlepszymi ekspertami prawnymi w Polsce. Znajdź pomoc prawną dostosowaną do Twoich potrzeb.",
  heroStats = [
    { value: 100, unit: "%", label: "ONLINE" },
    { value: 0, unit: "%", label: "PROWIZJI" },
    { value: 24, unit: "/7", label: "DOSTĘP" },
  ],
  containerClassName,
  heroImage,
}: AuthLayoutProps) {
  return (
    <div className="min-h-[calc(100dvh-65px)] grid lg:grid-cols-2 bg-background">
      {/* Left Column - Form */}
      <div
        className="flex flex-col items-center justify-center p-8 relative overflow-hidden"
        id="left-column"
      >
        {/* Subtle decorative background elements */}
        <div
          className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mt-64 z-0" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -ml-64 -mb-64 z-0" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`w-full space-y-8 relative z-10 py-12 ${containerClassName || "max-w-lg"}`}
        >
          {/* Form Content */}
          <div className="space-y-6">{children}</div>

          <div className="pt-8 border-t border-border/50">
            <p className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} ProstaSprawa. Profesjonalna platforma
              prawna.
              <br />
              Wszystkie prawa zastrzeżone.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Column - Image/Hero */}
      <div
        className={`hidden lg:block relative bg-gradient-to-br from-primary/90 to-primary overflow-hidden ${!heroImage ? "hero-image" : ""
          } on-dark`}
        style={
          heroImage
            ? {
              backgroundImage: `url(${heroImage})`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-foreground">
          <div className="max-w-md space-y-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight font-playfair">
                {heroTitle}
              </h2>
              <p className="text-lg text-foreground/90 leading-relaxed font-medium">
                {heroDescription}
              </p>
            </motion.div>

            {heroStats && heroStats.length > 0 && (
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
                {heroStats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  >
                    <div className="text-3xl lg:text-4xl font-bold">
                      <NumberTicker
                        value={stat.value}
                        decimalPlaces={0}
                        delay={index * 0.2}
                        className="text-foreground"
                      />
                      {stat.unit}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-foreground/70 font-semibold mt-1">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
