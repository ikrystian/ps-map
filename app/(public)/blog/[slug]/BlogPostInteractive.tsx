"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

// Jedyne klienckie fragmenty strony wpisu — reszta (treść, metadane,
// autor) renderuje się na serwerze w BlogPostView.

/** Liczy realną odsłonę, niezależnie od cache'owania wyrenderowanej strony. */
export function BlogPostViewTracker({ slug, disabled }: { slug: string; disabled?: boolean }) {
  useEffect(() => {
    if (disabled) return;
    fetch(`/api/blog/posts/${slug}/view`, { method: "POST", keepalive: true }).catch(() => {});
  }, [slug, disabled]);

  return null;
}

export function ReadingProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-[65px] left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-secondary to-primary origin-left z-50 shadow-xs"
      style={{ scaleX }}
    />
  );
}

export function ParallaxHeroImage({ src }: { src: string }) {
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 600], [0, 180]);
  const imageScale = useTransform(scrollY, [0, 600], [1, 1.1]);

  return (
    <motion.div
      className="absolute inset-0 bg-cover bg-center will-change-transform"
      style={{
        backgroundImage: `url(${src})`,
        y: imageY,
        scale: imageScale,
      }}
    />
  );
}
