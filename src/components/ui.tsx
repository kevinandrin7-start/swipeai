import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { LEVEL_STYLE } from '../data/curriculum';
import type { CardType } from '../types';

export const hueColor = (level: number, l = 62, a = 1) => `hsl(${LEVEL_STYLE[level]?.hue ?? 260} 85% ${l}% / ${a})`;

export const TYPE_LABEL: Record<CardType, string> = {
  concept: 'Concept',
  true_false: 'True or false',
  this_or_that: 'This or that',
  scenario: 'Scenario',
};

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            role="dialog"
            aria-label={title}
            className="relative w-full max-w-[470px] max-h-[88dvh] overflow-y-auto no-scrollbar rounded-t-[32px] glass-strong px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-app-text/20" />
            {title && (
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-bold">{title}</h2>
                <button aria-label="Close" onClick={onClose} className="p-1.5 rounded-full hover:bg-app-text/5">
                  <X size={20} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Progress({ value, color, className = '' }: { value: number; color?: string; className?: string }) {
  return (
    <div className={`h-2 rounded-full bg-app-text/10 overflow-hidden ${className}`}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`, background: color ?? 'linear-gradient(90deg, rgb(var(--neon-a)), rgb(var(--neon-b)), rgb(var(--neon-c)))', boxShadow: `0 0 12px ${color ?? 'rgb(var(--neon-b) / .7)'}` }} />
    </div>
  );
}

export function Ring({ value, size = 40, color, children }: { value: number; size?: number; color?: string; children?: ReactNode }) {
  const r = size / 2 - 3.5;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-neon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgb(var(--neon-a))" />
            <stop offset=".55" stopColor="rgb(var(--neon-b))" />
            <stop offset="1" stopColor="rgb(var(--neon-c))" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={4} className="stroke-app-text/10" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={4} stroke={color ?? 'url(#ring-neon)'} style={{ filter: `drop-shadow(0 0 4px ${color ?? 'rgb(var(--neon-b))'})` }} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, value))} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[11px] font-semibold">{children}</div>
    </div>
  );
}

export function Button({ children, onClick, variant = 'primary', className = '', disabled }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'soft'; className?: string; disabled?: boolean }) {
  const styles = {
    primary: 'neon-btn hover:brightness-110',
    soft: 'glass-soft text-app-text hover:bg-app-text/10',
    ghost: 'text-app-text hover:bg-app-text/5',
  }[variant];
  return (
    <button disabled={disabled} onClick={onClick} className={`rounded-2xl px-4 py-3 font-semibold transition active:scale-[.98] disabled:opacity-40 ${styles} ${className}`}>
      {children}
    </button>
  );
}
