import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Card = { front: string; back: string; };
export default function Flashcards({ stageId, cards }: { stageId: number; cards: Card[] }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = cards[idx];

  return (
    <div>
      <h4 className="font-semibold text-gray-900 mb-3">Flashcards</h4>
      <motion.div
        className="relative h-48 md:h-56 cursor-pointer select-none"
        onClick={() => setFlipped(!flipped)}
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 grid place-items-center rounded-2xl border bg-white text-center p-6 backface-hidden">
          <div className="text-lg">{current.front}</div>
        </div>
        <div className="absolute inset-0 grid place-items-center rounded-2xl border bg-purple-50 text-center p-6 backface-hidden"
             style={{ transform: "rotateY(180deg)" }}>
          <div className="text-lg font-semibold text-purple-700">{current.back}</div>
        </div>
      </motion.div>

      <div className="flex justify-between items-center mt-4">
        <button
          className="px-3 py-2 rounded-xl border bg-white hover:bg-purple-50"
          onClick={() => { setFlipped(false); setIdx(Math.max(0, idx-1)); }}
        >Prev</button>
        <div className="text-sm text-gray-500">{idx+1} / {cards.length}</div>
        <button
          className="px-3 py-2 rounded-xl bg-purple-600 text-white hover:opacity-90"
          onClick={() => { setFlipped(false); setIdx((idx+1) % cards.length); }}
        >Next</button>
      </div>
    </div>
  );
}
