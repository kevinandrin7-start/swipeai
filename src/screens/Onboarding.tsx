import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui';
import { CURRICULUM, LEVELS, MODULES } from '../data/curriculum';
import { useStore } from '../store';

const PLACEMENTS = [
  { level: 1, label: "I'm new to AI", hint: 'Start at Level 1: AI Foundations' },
  { level: 3, label: 'I know the basics of AI and LLMs', hint: 'Start at Level 3: Working with Claude' },
  { level: 5, label: 'I already build with LLM APIs', hint: 'Start at Level 5: RAG & Knowledge Systems' },
  { level: 7, label: 'I build agents in production', hint: 'Start at Level 7: The Agentic Ecosystem' },
];
const GOALS = [10, 15, 25, 40];

export function Onboarding() {
  const complete = useStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState(1);
  const [goal, setGoal] = useState(15);
  const cards = MODULES.reduce((n, m) => n + m.module.cards.length, 0);

  const finish = () => complete(MODULES.findIndex((m) => m.level.number === level), goal);

  return (
    <div className="min-h-[100dvh] flex flex-col px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="flex gap-1.5 mb-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'neon-fill shadow-[0_0_10px_rgb(var(--neon-b)/.7)]' : 'bg-app-text/15'}`} />
        ))}
      </div>
      <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
        {step === 0 && (
          <>
            <img src="./icon.svg" alt="" className="h-16 w-16 rounded-2xl mb-3 shadow-[0_0_40px_-6px_rgb(var(--neon-b)/.9)]" />
            <div className="font-display text-lg font-bold mb-1">
              Swipe<span className="neon-text">AI</span>
            </div>
            <h1 className="font-display text-[32px] leading-tight font-bold">From AI novice to <span className="neon-text">AI architect</span></h1>
            <p className="text-app-muted mt-3 leading-relaxed">{CURRICULUM.description}</p>
            <div className="grid grid-cols-3 gap-3 mt-6 text-center">
              <Num n={LEVELS.length} l="levels" />
              <Num n={MODULES.length} l="modules" />
              <Num n={cards} l="cards" />
            </div>
            <ul className="mt-6 space-y-2 text-sm">
              {['Swipe through bite-size cards in a few minutes a day', 'Every concept comes with a real example, often using Claude', 'Missed cards come back on a spaced-repetition schedule', 'Ask Claude to explain any card in more depth'].map((t) => (
                <li key={t} className="flex gap-2"><span className="neon-text">✦</span>{t}</li>
              ))}
            </ul>
          </>
        )}
        {step === 1 && (
          <>
            <h1 className="font-display text-[28px] font-bold">How swiping works</h1>
            <div className="mt-6 space-y-3">
              <Row icon="🃏" title="Concept & scenario cards" text="Tap to flip. Swipe right if you knew it, left to see it again." />
              <Row icon="✅" title="True or false" text="Swipe right for true, left for false." />
              <Row icon="↔️" title="This or that" text="Two options, one on each side. Swipe toward the right one." />
              <Row icon="⌨️" title="On a computer" text="Use ← and → to swipe, space to flip." />
            </div>
            <div className="mt-6 flex justify-between text-sm font-semibold">
              <span className="flex items-center gap-1 text-app-bad"><X size={16} /> Left = again / false</span>
              <span className="flex items-center gap-1 text-app-good">Right = got it / true <Check size={16} /></span>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="font-display text-[28px] font-bold">Where should you start?</h1>
            <div className="mt-5 space-y-2">
              {PLACEMENTS.map((p) => (
                <button key={p.level} onClick={() => setLevel(p.level)} className={`w-full text-left rounded-2xl border p-4 transition ${level === p.level ? 'border-transparent neon-ring bg-app-accent/15' : 'border-app-text/10 glass-soft'}`}>
                  <div className="font-semibold">{p.label}</div>
                  <div className="text-xs text-app-muted mt-0.5">{p.hint}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-app-muted mt-2">Earlier levels stay open, so you can always go back.</p>
            <h2 className="font-bold mt-6 mb-2">Daily goal</h2>
            <div className="grid grid-cols-4 gap-2">
              {GOALS.map((g) => (
                <button key={g} onClick={() => setGoal(g)} className={`rounded-2xl border py-3 font-semibold ${goal === g ? 'border-transparent neon-ring bg-app-accent/15' : 'border-app-text/10 glass-soft'}`}>
                  {g}
                  <div className="text-[10px] text-app-muted font-normal">cards</div>
                </button>
              ))}
            </div>
          </>
        )}
      </motion.div>
      <div className="flex gap-2 pt-6">
        {step > 0 && (
          <Button variant="soft" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        <Button className="flex-1" onClick={() => (step < 2 ? setStep(step + 1) : finish())}>
          {step < 2 ? 'Continue' : 'Start learning'}
        </Button>
      </div>
    </div>
  );
}

const Num = ({ n, l }: { n: number; l: string }) => (
  <div className="rounded-2xl glass py-3">
    <div className="font-display text-2xl font-bold neon-text">{n}</div>
    <div className="text-xs text-app-muted">{l}</div>
  </div>
);
const Row = ({ icon, title, text }: { icon: string; title: string; text: string }) => (
  <div className="flex gap-3 rounded-2xl glass p-4">
    <div className="text-2xl">{icon}</div>
    <div>
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-app-muted">{text}</div>
    </div>
  </div>
);
