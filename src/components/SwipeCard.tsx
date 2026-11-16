import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { forwardRef, useImperativeHandle, useState } from 'react';
import type { Card, Side } from '../types';
import { BackFace, FrontFace } from './CardFaces';

export interface SwipeHandle {
  fling: (side: Side) => void;
  flip: () => void;
}

/** Stamp labels shown while dragging, per card type. */
export function swipeLabels(card: Card): Record<Side, string> {
  if (card.type === 'true_false') return { left: 'FALSE', right: 'TRUE' };
  if (card.type === 'this_or_that') return { left: 'THIS ONE', right: 'THIS ONE' };
  return { left: 'AGAIN', right: 'GOT IT' };
}

const THRESHOLD = 110;

export const SwipeCard = forwardRef<SwipeHandle, { card: Card; onSwiped: (side: Side) => void; onAsk: () => void }>(function SwipeCard(
  { card, onSwiped, onAsk },
  ref,
) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-16, 16]);
  const rightOpacity = useTransform(x, [20, THRESHOLD], [0, 1]);
  const goodTint = useTransform(x, [0, THRESHOLD * 1.4], [0, 0.32]);
  const badTint = useTransform(x, [-THRESHOLD * 1.4, 0], [0.32, 0]);
  const sheen = useTransform(x, (v) => `radial-gradient(70% 45% at ${50 - v / 6}% -5%, rgb(255 255 255 / .38), transparent 60%)`);
  const leftOpacity = useTransform(x, [-THRESHOLD, -20], [1, 0]);
  const [flipped, setFlipped] = useState(false);
  const [gone, setGone] = useState(false);
  const flippable = card.type === 'concept' || card.type === 'scenario';
  const labels = swipeLabels(card);

  const fling = (side: Side) => {
    if (gone) return;
    setGone(true);
    animate(x, side === 'right' ? 640 : -640, { duration: 0.28, ease: 'easeIn' }).then(() => onSwiped(side));
  };
  const flip = () => flippable && setFlipped((f) => !f);
  useImperativeHandle(ref, () => ({ fling, flip }));

  return (
    <motion.div
      className="absolute inset-0 card-3d select-none-all cursor-grab active:cursor-grabbing [touch-action:pan-y]"
      style={{ x, rotate }}
      drag={gone ? false : 'x'}
      dragSnapToOrigin
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.x > THRESHOLD || info.velocity.x > 700) fling('right');
        else if (info.offset.x < -THRESHOLD || info.velocity.x < -700) fling('left');
      }}
      onTap={flip}
      initial={{ scale: 0.95, y: 12, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
      data-testid="swipe-card"
    >
      <motion.div className="relative h-full w-full [transform-style:preserve-3d]" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.45 }}>
        <FrontFace card={card} />
        {flippable && <BackFace card={card} onAsk={onAsk} />}
      </motion.div>
      <motion.div aria-hidden style={{ background: sheen }} className="pointer-events-none absolute inset-0 rounded-[30px] mix-blend-overlay" />
      <motion.div aria-hidden style={{ opacity: goodTint }} className="pointer-events-none absolute inset-0 rounded-[30px] bg-gradient-to-l from-app-good to-transparent" />
      <motion.div aria-hidden style={{ opacity: badTint }} className="pointer-events-none absolute inset-0 rounded-[30px] bg-gradient-to-r from-app-bad to-transparent" />
      <motion.div style={{ opacity: rightOpacity }} className="pointer-events-none absolute left-6 top-16 -rotate-12 rounded-2xl glass-strong glow-good px-4 py-1.5 font-display text-2xl font-extrabold text-app-good">
        {labels.right}
      </motion.div>
      <motion.div style={{ opacity: leftOpacity }} className="pointer-events-none absolute right-6 top-16 rotate-12 rounded-2xl glass-strong glow-bad px-4 py-1.5 font-display text-2xl font-extrabold text-app-bad">
        {labels.left}
      </motion.div>
    </motion.div>
  );
});
