import { Bookmark, ChevronRight, RotateCcw, Shuffle, Target } from 'lucide-react';
import type { ReactNode } from 'react';
import { ALL_CARDS, cardInfo } from '../data/curriculum';
import { BOX_DAYS, dueCards, MASTERED_BOX, useStore } from '../store';

export function Review() {
  const s = useStore();
  const due = dueCards(s.cards);
  const saved = Object.entries(s.cards).filter(([, c]) => c.saved).map(([id]) => id);
  const tricky = Object.entries(s.cards)
    .filter(([, c]) => c.seen > 0 && c.wrong > 0 && c.box < MASTERED_BOX)
    .sort((a, b) => b[1].wrong - a[1].wrong)
    .map(([id]) => id);
  const seen = ALL_CARDS.filter((c) => s.cards[c.id]?.seen).map((c) => c.id);
  const boxes = [0, 1, 2, 3, 4, 5].map((b) => Object.values(s.cards).filter((c) => c.seen > 0 && c.box === b).length);
  const nextDue = Object.values(s.cards).filter((c) => c.seen > 0 && c.dueAt > Date.now()).sort((a, b) => a.dueAt - b.dueAt)[0];

  return (
    <div className="px-4 pb-6 space-y-4">
      <header className="pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="font-display text-[28px] font-bold">Review</h1>
        <p className="text-sm text-app-muted">Cards return just before you'd forget them: after 1, 3, 7, 16 and 35 days.</p>
      </header>

      <Deckline icon={<RotateCcw size={20} />} title="Due now" count={due.length} sub={due.length ? 'Start your spaced-repetition review' : nextDue ? `Next card due ${new Date(nextDue.dueAt).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })}` : 'Learn some cards first'} onClick={() => s.startSession('review', 'Review due cards', due.slice(0, 40))} />
      <Deckline icon={<Target size={20} />} title="Tricky cards" count={tricky.length} sub="Cards you've missed and haven't mastered yet" onClick={() => s.startSession('review', 'Tricky cards', tricky.slice(0, 30))} />
      <Deckline icon={<Bookmark size={20} />} title="Saved" count={saved.length} sub="Cards you bookmarked" onClick={() => s.startSession('saved', 'Saved cards', saved)} />
      <Deckline icon={<Shuffle size={20} />} title="Shuffle everything I've seen" count={seen.length} sub="A random mix of 20 cards" onClick={() => s.startSession('review', 'Shuffle', [...seen].sort(() => Math.random() - 0.5).slice(0, 20))} />

      <section className="rounded-3xl glass p-4">
        <div className="font-display font-semibold mb-3">Memory strength</div>
        <div className="flex items-end gap-2 h-28">
          {boxes.map((n, b) => {
            const max = Math.max(1, ...boxes);
            return (
              <div key={b} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs font-semibold tabular-nums">{n}</div>
                <div className="w-full rounded-t-lg" style={{ height: `${Math.max(4, (n / max) * 72)}px`, background: b >= MASTERED_BOX ? 'rgb(var(--good))' : b === 0 ? 'rgb(var(--bad))' : 'rgb(var(--accent))' }} />
                <div className="text-[10px] text-app-muted">{b === 0 ? 'relearn' : `${BOX_DAYS[b]}d`}</div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-app-muted mt-2">Green bars are mastered cards (reviewed successfully at 7+ day gaps).</p>
      </section>

      {tricky.length > 0 && (
        <section>
          <div className="font-display font-semibold mb-2">Most missed</div>
          <div className="space-y-2">
            {tricky.slice(0, 5).map((id) => {
              const info = cardInfo(id)!;
              return (
                <div key={id} className="rounded-2xl glass p-3">
                  <div className="text-xs text-app-muted">{info.module.title} · missed {s.cards[id].wrong}×</div>
                  <div className="text-sm font-semibold">{info.card.front}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function Deckline({ icon, title, count, sub, onClick }: { icon: ReactNode; title: string; count: number; sub: string; onClick: () => void }) {
  return (
    <button disabled={!count} onClick={onClick} className="w-full flex items-center gap-3 rounded-3xl glass p-4 text-left disabled:opacity-50">
      <div className="grid place-items-center h-11 w-11 rounded-2xl neon-btn">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-display font-semibold">{title} <span className="text-app-muted font-semibold tabular-nums">· {count}</span></div>
        <div className="text-xs text-app-muted truncate">{sub}</div>
      </div>
      <ChevronRight className="text-app-muted" />
    </button>
  );
}
