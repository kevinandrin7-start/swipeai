import type { CSSProperties } from 'react';
import { Bookmark, BookmarkCheck, RotateCcw, Sparkles } from 'lucide-react';
import { cardInfo, LEVEL_STYLE } from '../data/curriculum';
import { useStore } from '../store';
import type { Card } from '../types';
import { hueColor, TYPE_LABEL } from './ui';

// Every card glows in Claude orange; level colour stays on the label only.
const hueVar = (_level: number) => ({ '--hue': 15 }) as CSSProperties;

function Header({ card }: { card: Card }) {
  const info = cardInfo(card.id)!;
  const saved = useStore((s) => s.cards[card.id]?.saved);
  const toggleSave = useStore((s) => s.toggleSave);
  return (
    <div className="relative flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: hueColor(info.level.number, 70) }}>
          {LEVEL_STYLE[info.level.number].icon} Level {info.level.number} · {TYPE_LABEL[card.type]}
        </div>
        <div className="text-xs text-app-muted truncate">{info.module.title}</div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="flex gap-0.5" aria-label={`Difficulty ${card.difficulty} of 3`}>
          {[1, 2, 3].map((d) => (
            <span key={d} className={`h-1.5 w-1.5 rounded-full ${d <= card.difficulty ? 'bg-app-text/70' : 'bg-app-text/15'}`} />
          ))}
        </span>
        <button
          aria-label={saved ? 'Remove from saved' : 'Save card'}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            toggleSave(card.id);
          }}
          className="p-1.5 -m-1 rounded-full hover:bg-app-text/5"
        >
          {saved ? <BookmarkCheck size={18} className="text-app-accent" /> : <Bookmark size={18} className="text-app-muted" />}
        </button>
      </div>
    </div>
  );
}

/** Front of a card: the question, statement, or scenario. */
export function FrontFace({ card }: { card: Card }) {
  const info = cardInfo(card.id)!;
  const big = card.front.length < 110;
  return (
    <div className="face glass-card absolute inset-0 rounded-[30px] flex flex-col p-5 overflow-hidden" style={hueVar(info.level.number)}>
      <div className="hue-orb" aria-hidden />
      <Header card={card} />
      <div className="flex-1 flex flex-col justify-center py-4">
        <p className={`${big ? 'text-[27px] leading-[1.15]' : 'text-xl leading-snug'} font-display font-bold`}>{card.front}</p>
      </div>
      {card.type === 'this_or_that' ? (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-2xl glass-soft p-3 shadow-[inset_3px_0_0_rgb(var(--neon-a))]"><div className="text-[10px] font-bold tracking-wider text-app-muted mb-1">← SWIPE LEFT</div>{card.left}</div>
          <div className="rounded-2xl glass-soft p-3 text-right shadow-[inset_-3px_0_0_rgb(var(--neon-c))]"><div className="text-[10px] font-bold tracking-wider text-app-muted mb-1">SWIPE RIGHT →</div>{card.right}</div>
        </div>
      ) : card.type === 'true_false' ? (
        <div className="flex justify-between text-sm font-semibold">
          <span className="rounded-full glass-soft px-3 py-1 text-app-bad">← False</span>
          <span className="rounded-full glass-soft px-3 py-1 text-app-good">True →</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 text-sm text-app-muted">
          <RotateCcw size={14} /> Tap to flip{card.type === 'scenario' ? ' after you have thought it through' : ''}
        </div>
      )}
    </div>
  );
}

/** Back of a concept/scenario card: answer, example and code. */
export function BackFace({ card, onAsk }: { card: Card; onAsk: () => void }) {
  const info = cardInfo(card.id)!;
  return (
    <div className="face glass-card absolute inset-0 rounded-[30px] flex flex-col p-5 overflow-hidden [transform:rotateY(180deg)]" style={hueVar(info.level.number)}>
      <div className="hue-orb" aria-hidden />
      <Header card={card} />
      <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-3 [touch-action:pan-y]">
        <p className="text-sm text-app-muted font-medium">{card.front}</p>
        <p className="text-[17px] leading-relaxed font-medium">{card.back}</p>
        <CardExtras card={card} />
      </div>
      <div className="flex items-center justify-between pt-2 text-xs">
        <span className="text-app-bad font-semibold">← Again</span>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onAsk();
          }}
          className="flex items-center gap-1.5 rounded-full neon-btn px-3.5 py-1.5 font-semibold"
        >
          <Sparkles size={14} /> Ask Claude
        </button>
        <span className="text-app-good font-semibold">Got it →</span>
      </div>
    </div>
  );
}

export function CardExtras({ card }: { card: Card }) {
  return (
    <>
      {card.example && (
        <div className="rounded-2xl glass-soft p-3 text-sm leading-relaxed">
          <div className="text-[10px] font-bold uppercase tracking-wider neon-text mb-1">Example</div>
          {card.example}
        </div>
      )}
      {card.code && (
        <pre className="rounded-2xl bg-[#0c0a09]/90 ring-1 ring-white/10 text-orange-200 p-3 text-[11.5px] leading-relaxed font-mono overflow-x-auto whitespace-pre">{card.code}</pre>
      )}
    </>
  );
}
