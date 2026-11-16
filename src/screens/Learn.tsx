import { ChevronRight, Flame, Play, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button, hueColor, Progress } from '../components/ui';
import { LEVEL_STYLE, MODULES } from '../data/curriculum';
import { buildDailyDeck, currentRank, dueCards, frontierIndex, masteredCount, seenCount, streak, todayKey, totalXp, useStore } from '../store';

export function Learn() {
  const s = useStore();
  const today = s.activity[todayKey()] ?? { cards: 0, xp: 0, correct: 0 };
  const due = dueCards(s.cards).length;
  const deck = buildDailyDeck(s.cards, s.startModule, s.dailyGoal);
  const fi = frontierIndex(s.cards, s.startModule);
  const front = MODULES[fi];
  const ids = front.module.cards.map((c) => c.id);
  const levelIds = front.level.modules.flatMap((m) => m.cards.map((c) => c.id));
  const goalPct = Math.min(1, today.cards / s.dailyGoal);

  return (
    <div className="px-4 pb-6 space-y-4">
      <header className="flex items-center justify-between pt-[max(1rem,env(safe-area-inset-top))]">
        <div>
          <h1 className="font-display text-[28px] font-bold">
            Swipe<span className="neon-text">AI</span>
          </h1>
          <div className="text-xs font-semibold text-app-muted">{currentRank(s.cards, s.startModule)} · AI Engineer Path</div>
        </div>
        <div className="flex gap-2">
          <Chip icon={<Flame size={16} className="text-orange-400" />} text={streak(s.activity)} label="day streak" />
          <Chip icon={<Zap size={16} className="text-yellow-400" />} text={totalXp(s.activity)} label="XP" />
        </div>
      </header>

      <section
        className="relative isolate overflow-hidden rounded-[30px] p-5 text-white border border-white/25 shadow-[0_30px_60px_-24px_rgb(var(--neon-b)/.8),inset_0_1px_0_rgb(255_255_255/.5)]"
        style={{ background: 'linear-gradient(135deg, rgb(var(--neon-a)), rgb(var(--neon-b)) 50%, rgb(var(--neon-c)))' }}
      >
        <div aria-hidden className="absolute -z-10 -right-16 -top-20 h-56 w-56 rounded-full bg-white/25 blur-2xl" />
        <div aria-hidden className="absolute -z-10 -left-10 -bottom-24 h-48 w-48 rounded-full blur-2xl" style={{ background: 'rgb(var(--neon-a) / .55)' }} />
        <div aria-hidden className="absolute -z-10 inset-0 bg-[radial-gradient(120%_60%_at_0%_0%,rgb(255_255_255/.35),transparent_55%)]" />
        <div className="text-xs font-semibold uppercase tracking-[.18em] opacity-90">Today's session</div>
        <div className="font-display text-[40px] leading-none font-bold mt-2">{deck.length} <span className="text-2xl font-semibold opacity-90">cards</span></div>
        <div className="text-sm opacity-90 mt-1">
          {Math.min(due, Math.ceil(s.dailyGoal / 2))} reviews · {deck.length - Math.min(due, Math.ceil(s.dailyGoal / 2))} new
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1">
            <div className="h-2 rounded-full bg-black/20 overflow-hidden ring-1 ring-white/20">
              <div className="h-full bg-white rounded-full transition-all shadow-[0_0_12px_white]" style={{ width: `${goalPct * 100}%` }} />
            </div>
            <div className="text-xs mt-1 opacity-90">
              {today.cards}/{s.dailyGoal} daily goal{goalPct >= 1 ? ' ✓' : ''}
            </div>
          </div>
          <button
            disabled={!deck.length}
            onClick={() => s.startSession('daily', "Today's session", deck)}
            className="flex items-center gap-2 rounded-2xl bg-white/90 backdrop-blur text-[#1f130c] px-5 py-3 font-bold shadow-[0_8px_24px_-6px_rgb(0_0_0/.35),inset_0_1px_0_white] active:scale-95 transition disabled:opacity-50"
          >
            <Play size={18} fill="currentColor" /> {today.cards ? 'Continue' : 'Start'}
          </button>
        </div>
      </section>

      <section className="rounded-3xl glass p-4">
        <div className="text-xs font-semibold text-app-muted uppercase tracking-wider">Up next</div>
        <div className="flex items-center gap-3 mt-2">
          <div className="grid place-items-center h-12 w-12 shrink-0 rounded-2xl text-2xl glass-soft" style={{ boxShadow: `0 0 24px -4px ${hueColor(front.level.number, 60, 0.7)}` }}>{LEVEL_STYLE[front.level.number].icon}</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs" style={{ color: hueColor(front.level.number, 65) }}>
              Level {front.level.number} · {front.level.title}
            </div>
            <div className="font-display font-semibold truncate">{front.module.title}</div>
            <div className="text-xs text-app-muted line-clamp-2">{front.module.summary}</div>
          </div>
        </div>
        <Progress className="mt-3" value={seenCount(s.cards, ids) / ids.length} color={hueColor(front.level.number)} />
        <div className="flex justify-between text-xs text-app-muted mt-1">
          <span>{seenCount(s.cards, ids)}/{ids.length} cards seen</span>
          <span>Level mastery {Math.round((masteredCount(s.cards, levelIds) / levelIds.length) * 100)}%</span>
        </div>
        <Button
          variant="soft"
          className="w-full mt-3 flex items-center justify-center gap-1"
          onClick={() => s.startSession('module', front.module.title, front.module.cards.filter((c) => !s.cards[c.id]?.seen).map((c) => c.id), front.module.id)}
        >
          Learn this module <ChevronRight size={18} />
        </Button>
      </section>

      {due > 0 && (
        <button onClick={() => s.startSession('review', 'Review due cards', dueCards(s.cards).slice(0, 30))} className="w-full flex items-center justify-between rounded-3xl glass p-4 text-left">
          <div>
            <div className="font-display font-semibold">{due} {due === 1 ? 'card' : 'cards'} due for review</div>
            <div className="text-xs text-app-muted">Spaced repetition keeps them in long-term memory</div>
          </div>
          <ChevronRight className="text-app-muted" />
        </button>
      )}
    </div>
  );
}

function Chip({ icon, text, label }: { icon: ReactNode; text: number; label: string }) {
  return (
    <div className="flex items-center gap-1 rounded-full glass-soft px-3 py-1.5 text-sm font-bold tabular-nums" aria-label={`${text} ${label}`}>
      {icon}
      {text}
    </div>
  );
}
