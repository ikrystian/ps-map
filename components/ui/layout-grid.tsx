"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface Card {
  id: number | string;
  content: React.ReactNode | string;
  className: string;
  thumbnail: string;
}

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
  const [selected, setSelected] = useState<Card | null>(null);
  const [lastSelected, setLastSelected] = useState<Card | null>(null);

  const handleClick = (card: Card) => {
    setLastSelected(selected);
    setSelected(card);
  };

  const handleOutsideClick = () => {
    setLastSelected(selected);
    setSelected(null);
  };

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto gap-4 relative">
      {cards.map((card, i) => (
        <div key={i} className={cn(card.className, "relative min-h-[250px]")}>
          <motion.div
            onClick={() => handleClick(card)}
            className={cn(
              card.className,
              "relative overflow-hidden rounded-xl cursor-pointer w-full h-full",
              selected?.id === card.id
                ? "absolute inset-0 h-[60vh] w-full md:w-[70vw] max-w-4xl m-auto z-50 flex justify-center items-center flex-wrap flex-col"
                : lastSelected?.id === card.id
                ? "z-40 bg-white dark:bg-neutral-900 h-full w-full"
                : "bg-white dark:bg-neutral-900 h-full w-full"
            )}
            layoutId={`card-${card.id}`}
          >
            {selected?.id === card.id && <SelectedCard selected={selected} handleClose={handleOutsideClick} />}
            <ImageComponent card={card} isSelected={selected?.id === card.id} />
          </motion.div>
        </div>
      ))}
      <motion.div
        onClick={handleOutsideClick}
        className={cn(
          "fixed inset-0 bg-black/60 z-40 pointer-events-none backdrop-blur-sm transition-opacity duration-300",
          selected?.id ? "pointer-events-auto opacity-100" : "opacity-0"
        )}
        animate={{ opacity: selected?.id ? 1 : 0 }}
      />
    </div>
  );
};

const ImageComponent = ({ card, isSelected }: { card: Card; isSelected: boolean }) => {
  return (
    <Image
      src={card.thumbnail}
      fill
      className={cn(
        "object-cover object-center absolute inset-0 h-full w-full transition duration-300",
        isSelected ? "scale-100" : "hover:scale-105"
      )}
      alt="thumbnail"
      sizes="(max-width: 768px) 100vw, 33vw"
    />
  );
};

const SelectedCard = ({ selected, handleClose }: { selected: Card | null; handleClose: (e: React.MouseEvent) => void }) => {
  return (
    <div className="bg-transparent h-full w-full flex flex-col justify-end rounded-lg shadow-2xl relative z-[60] overflow-hidden">
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 0.6,
        }}
        className="absolute inset-0 h-full w-full bg-black opacity-60 z-10"
      />
      
      {/* Close button inside expanded card */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose(e);
        }}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/75 text-white transition-colors border border-white/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <motion.div
        layoutId={`content-${selected?.id}`}
        initial={{
          opacity: 0,
          y: 100,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: 100,
        }}
        transition={{
          duration: 0.3,
        }}
        className="relative px-8 pb-8 z-[70]"
      >
        {selected?.content}
      </motion.div>
    </div>
  );
};
