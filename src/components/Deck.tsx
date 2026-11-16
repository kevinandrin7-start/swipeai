import { AnimatePresence, motion } from 'framer-motion';
import { Check, CheckCircle2, RotateCcw, Sparkles, X, XCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cardInfo } from '../data/curriculum';
import { buildDailyDeck, streak, useStore } from '../store';
import type { Card, Side } from '../types';
import { AskClaudeSheet } from './AskClaude';
import { CardExtras } from './CardFaces';
import { SwipeCard, type SwipeHandle } from './SwipeCard';
import { Button, Progress } from './ui';

interface Feedback { card: Card; side: Side; correct: boolean }

export function Deck() {
  const session = useStore((s) => s.session)!;
  const swipe = useStore((s) => s.swipe);
  const endSession = useStore((s) => s.endSession);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [askCard, setAskCard] = useState<Card | null>(null);
  const top = useRef<SwipeHandle>(null);

  const card = session.queue[0] ? cardInfo(session.queue[0])?.card : undefined;
  const nextCard = session.queue[1] ? cardInfo(session.queue[1])?.card : undefined;
  const finished = !card;

  const onSwiped = useCallback(
    (c: Card, side: Side) => {
      const correct = swipe(c, side);
      if (c.type === 'true_false' || c.type === 'this_or_that') setFeedback({ card: c, side, correct });
    },
    [swipe],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (askCard) return;
      if (feedback) {
        if (e.key === 'Enter' || e.key === ' ' || e.key.startsWith('Arrow')) {
          e.preventDefault();
          setFeedback(null);
        }
        return;
      }
      if (e.key === 'ArrowRight') top.current?.fling('right');
      else if (e.key === 'ArrowLeft') top.current?.fling('left');
      else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        top.current?.flip();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [feedback, askCard]);

  const progress = session.total ? session.done / Math.max(session.total, session.done + session.queue.length) : 0;

  return (
    <div className="flex flex-col h-[100dvh] px-4 pt-[max(.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-3 mb-3">
        <button aria-label="End session" onClick={endSession} className="grid place-items-center h-10 w-10 rounded-full glass-soft hover:bg-app-text/10">
          <X size={22} />
        </button>
        <div className="flex-1">
          <div className="font-display text-xs font-semibold text-app-muted mb-1.5 truncate">{session.title}</div>
          <Progress value={finished ? 1 : progress} />
        </div>
        <div className="text-xs font-semibold text-app-muted tabular-nums w-12 text-right">
          {session.done}/{session.done + session.queue.length}
        </div>
      </div>

      {finished ? (
        <Summary />
      ) : (
        <>
          <div className="relative flex-1 min-h-0">
            {nextCard && (
              <div className="absolute inset-0 scale-[.93] translate-y-4 opacity-55 pointer-events-none" aria-hidden>
                <div className="h-full rounded-[30px] glass-card" />
              </div>
            )}
            <SwipeCard key={`${card.id}-${session.done}`} ref={top} card={card} onSwiped={(side) => onSwiped(card, side)} onAsk={() => setAskCard(card)} />
          </div>
          <Controls card={card} onLeft={() => top.current?.fling('left')} onRight={() => top.current?.fling('right')} onFlip={() => top.current?.flip()} />
        </>
      )}

      <AnimatePresence>{feedback && <FeedbackPanel fb={feedback} onNext={() => setFeedback(null)} onAsk={() => setAskCard(feedback.card)} />}</AnimatePresence>
      <AskClaudeSheet card={askCard} onClose={() => setAskCard(null)} />
    </div>
  );
}

function Controls({ card, onLeft, onRight, onFlip }: { card: Card; onLeft: () => void; onRight: () => void; onFlip: () => void }) {
  const flippable = card.type === 'concept' || card.type === 'scenario';
  const left = card.type === 'true_false' ? 'False' : card.type === 'this_or_that' ? 'Left' : 'Again';
  const right = card.type === 'true_false' ? 'True' : card.type === 'this_or_that' ? 'Right' : 'Got it';
  return (
    <div className="flex items-center justify-center gap-7 pt-5">
      <button onClick={onLeft} aria-label={left} className="flex flex-col items-center gap-1 text-xs font-semibold text-app-muted">
        <span className="grid place-items-center h-[68px] w-[68px] rounded-full glass-strong glow-bad text-app-bad active:scale-90 hover:scale-105 transition">
          <X size={30} strokeWidth={3} />
        </span>
        {left}
      </button>
      <button onClick={onFlip} disabled={!flippable} aria-label="Flip card" className="flex flex-col items-center gap-1 text-xs font-semibold text-app-muted disabled:opacity-30">
        <span className="grid place-items-center h-12 w-12 rounded-full glass-strong active:scale-90 transition">
          <RotateCcw size={20} />
        </span>
        Flip
      </button>
      <button onClick={onRight} aria-label={right} className="flex flex-col items-center gap-1 text-xs font-semibold text-app-muted">
        <span className="grid place-items-center h-[68px] w-[68px] rounded-full glass-strong glow-good text-app-good active:scale-90 hover:scale-105 transition">
          <Check size={30} strokeWidth={3} />
        </span>
        {right}
      </button>
    </div>
  );
}

function FeedbackPanel({ fb, onNext, onAsk }: { fb: Feedback; onNext: () => void; onAsk: () => void }) {
  const { card, correct } = fb;
  const answer =
    card.type === 'true_false' ? (card.answer ? 'True' : 'False') : card.type === 'this_or_that' ? (card.correct === 'left' ? card.left : card.right) : '';
  return (
    <motion.div className="fixed inset-0 z-40 flex items-end justify-center">
      <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onNext} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div
        role="dialog"
        aria-label={correct ? 'Correct' : 'Not quite'}
        className="relative w-full max-w-[470px] max-h-[80dvh] overflow-y-auto no-scrollbar rounded-t-[32px] glass-strong p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-3"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 340 }}
      >
        <div className={`font-display flex items-center gap-2 text-2xl font-bold ${correct ? 'text-app-good [text-shadow:0_0_18px_rgb(var(--good)/.6)]' : 'text-app-bad [text-shadow:0_0_18px_rgb(var(--bad)/.6)]'}`}>
          {correct ? <CheckCircle2 size={26} /> : <XCircle size={26} />}
          {correct ? 'Correct!' : 'Not quite'}
        </div>
        <p className="text-sm text-app-muted">{card.front}</p>
        <p className="font-semibold">Answer: {answer}</p>
        <p className="text-[15px] leading-relaxed">{card.back}</p>
        <CardExtras card={card} />
        <div className="flex gap-2 pt-1">
          <Button variant="soft" onClick={onAsk} className="flex items-center gap-1.5">
            <Sparkles size={16} className="text-app-accent" /> Ask Claude
          </Button>
          <Button onClick={onNext} className="flex-1">
            Continue
          </Button>
        </div>
        {!correct && <p className="text-xs text-app-muted text-center">This card will come back later in the session and in your reviews.</p>}
      </motion.div>
    </motion.div>
  );
}

function Summary() {
  const s = useStore();
  const session = s.session!;
  const pct = session.done ? Math.round((session.correct / session.done) * 100) : 0;
  const more = () => {
    const ids = buildDailyDeck(s.cards, s.startModule, 10);
    if (ids.length) s.startSession('daily', 'Bonus round', ids);
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center text-center gap-5">
      <div className="text-6xl drop-shadow-[0_0_30px_rgb(var(--neon-b)/.7)]">{pct >= 80 ? '🏆' : pct >= 50 ? '💪' : '🌱'}</div>
      <div>
        <h2 className="font-display text-3xl font-bold neon-text">Session complete</h2>
        <p className="text-app-muted mt-1">{session.title}</p>
      </div>
      <div className="grid grid-cols-3 gap-3 w-full">
        <Stat label="Cards" value={session.done} />
        <Stat label="Correct" value={`${pct}%`} />
        <Stat label="Streak" value={`${streak(s.activity)}🔥`} />
      </div>
      <div className="w-full space-y-2 pt-2">
        <Button className="w-full" onClick={more}>
          Keep going: 10 more
        </Button>
        <Button variant="soft" className="w-full" onClick={s.endSession}>
          Done
        </Button>
      </div>
    </motion.div>
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl glass p-3">
      <div className="font-display text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[11px] text-app-muted font-semibold uppercase tracking-wider">{label}</div>
    </div>
  );
}
