import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ALL_CARDS, MODULES, cardInfo } from './data/curriculum';
import type { Card, CardState, Side } from './types';

export type Tab = 'learn' | 'path' | 'review' | 'me';
export type ThemePref = 'system' | 'light' | 'dark';

const DAY = 24 * 60 * 60 * 1000;
/** Leitner ladder: days until a card comes back, by box (box 0 = relearn now). */
export const BOX_DAYS = [0, 1, 3, 7, 16, 35];
export const MASTERED_BOX = 3;
export const XP_CORRECT = 10;
export const XP_AGAIN = 2;

export const todayKey = (t = Date.now()) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export interface Session {
  kind: 'daily' | 'module' | 'review' | 'saved';
  title: string;
  queue: string[]; // card ids still to play
  done: number;
  correct: number;
  total: number;
  requeued: string[]; // ids already requeued once this session
  moduleId?: string;
}

interface Data {
  onboarded: boolean;
  theme: ThemePref;
  dailyGoal: number;
  startModule: number; // placement: modules before this index are open from day one
  cards: Record<string, CardState>;
  activity: Record<string, { cards: number; xp: number; correct: number }>;
  apiKey: string;
}

interface State extends Data {
  tab: Tab;
  session: Session | null;
  setTab: (t: Tab) => void;
  setTheme: (t: ThemePref) => void;
  setDailyGoal: (n: number) => void;
  setApiKey: (k: string) => void;
  completeOnboarding: (startModule: number, dailyGoal: number) => void;
  startSession: (kind: Session['kind'], title: string, ids: string[], moduleId?: string) => void;
  endSession: () => void;
  swipe: (card: Card, side: Side) => boolean; // returns whether the answer counts as correct
  toggleSave: (id: string) => void;
  resetAll: () => void;
}

const initialData = (): Data => ({
  onboarded: false,
  theme: 'dark',
  dailyGoal: 15,
  startModule: 0,
  cards: {},
  activity: {},
  apiKey: '',
});

/** Whether a swipe is "correct": quiz cards have a right answer, flip cards are self-graded. */
export function isCorrect(card: Card, side: Side): boolean {
  if (card.type === 'true_false') return (side === 'right') === card.answer;
  if (card.type === 'this_or_that') return side === card.correct;
  return side === 'right';
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initialData(),
      tab: 'learn',
      session: null,

      setTab: (tab) => set({ tab }),
      setTheme: (theme) => set({ theme }),
      setDailyGoal: (dailyGoal) => set({ dailyGoal }),
      setApiKey: (apiKey) => set({ apiKey: apiKey.trim() }),
      completeOnboarding: (startModule, dailyGoal) => set({ onboarded: true, startModule, dailyGoal, tab: 'learn' }),

      startSession: (kind, title, ids, moduleId) =>
        set({ session: { kind, title, queue: ids, done: 0, correct: 0, total: ids.length, requeued: [], moduleId } }),
      endSession: () => set({ session: null }),

      swipe: (card, side) => {
        const now = Date.now();
        const correct = isCorrect(card, side);
        const prev = get().cards[card.id];
        const isNew = !prev || prev.seen === 0;
        const box = correct ? Math.min(5, isNew ? 2 : (prev?.box ?? 0) + 1) : 0;
        const next: CardState = {
          box,
          dueAt: now + BOX_DAYS[box] * DAY,
          seen: (prev?.seen ?? 0) + 1,
          right: (prev?.right ?? 0) + (correct ? 1 : 0),
          wrong: (prev?.wrong ?? 0) + (correct ? 0 : 1),
          last: now,
          saved: prev?.saved,
        };
        const k = todayKey(now);
        const act = get().activity[k] ?? { cards: 0, xp: 0, correct: 0 };
        set((s) => {
          let session = s.session;
          if (session && session.queue[0] === card.id) {
            const rest = session.queue.slice(1);
            // A missed card comes back once near the end of the same session.
            const again = !correct && !session.requeued.includes(card.id);
            session = {
              ...session,
              queue: again ? [...rest, card.id] : rest,
              requeued: again ? [...session.requeued, card.id] : session.requeued,
              done: session.done + 1,
              correct: session.correct + (correct ? 1 : 0),
            };
          }
          return {
            cards: { ...s.cards, [card.id]: next },
            activity: { ...s.activity, [k]: { cards: act.cards + 1, xp: act.xp + (correct ? XP_CORRECT : XP_AGAIN), correct: act.correct + (correct ? 1 : 0) } },
            session,
          };
        });
        return correct;
      },

      toggleSave: (id) =>
        set((s) => {
          const prev = s.cards[id] ?? { box: 0, dueAt: 0, seen: 0, right: 0, wrong: 0 };
          return { cards: { ...s.cards, [id]: { ...prev, saved: !prev.saved } } };
        }),

      resetAll: () => set({ ...initialData(), session: null, tab: 'learn' }),
    }),
    {
      name: 'ai-path-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        onboarded: s.onboarded,
        theme: s.theme,
        dailyGoal: s.dailyGoal,
        startModule: s.startModule,
        cards: s.cards,
        activity: s.activity,
        apiKey: s.apiKey,
      }),
    },
  ),
);

/* ───────── Derived helpers ───────── */

export const seenCount = (cards: Record<string, CardState>, ids: string[]) => ids.filter((id) => (cards[id]?.seen ?? 0) > 0).length;
export const masteredCount = (cards: Record<string, CardState>, ids: string[]) => ids.filter((id) => (cards[id]?.box ?? 0) >= MASTERED_BOX).length;

/** Index of the first module (from the placement start) that still has unseen cards. */
export function frontierIndex(cards: Record<string, CardState>, startModule: number): number {
  for (let i = startModule; i < MODULES.length; i++) {
    const ids = MODULES[i].module.cards.map((c) => c.id);
    if (seenCount(cards, ids) < ids.length) return i;
  }
  return MODULES.length - 1;
}

export function isUnlocked(index: number, cards: Record<string, CardState>, startModule: number) {
  return index <= Math.max(frontierIndex(cards, startModule), startModule);
}

export function dueCards(cards: Record<string, CardState>, now = Date.now()): string[] {
  return Object.entries(cards)
    .filter(([id, st]) => st.seen > 0 && st.dueAt <= now && cardInfo(id))
    .sort((a, b) => a[1].box - b[1].box || a[1].dueAt - b[1].dueAt)
    .map(([id]) => id);
}

/** Today's mixed deck: due reviews interleaved with new cards from the learning frontier. */
export function buildDailyDeck(cards: Record<string, CardState>, startModule: number, goal: number): string[] {
  const due = dueCards(cards).slice(0, Math.ceil(goal / 2));
  const fresh: string[] = [];
  for (let i = frontierIndex(cards, startModule); i < MODULES.length && fresh.length < goal - due.length; i++) {
    for (const c of MODULES[i].module.cards) {
      if (!cards[c.id]?.seen && fresh.length < goal - due.length) fresh.push(c.id);
    }
  }
  const deck: string[] = [];
  while (due.length || fresh.length) {
    if (fresh.length) deck.push(fresh.shift()!);
    if (due.length) deck.push(due.shift()!);
  }
  return deck;
}

export function streak(activity: Record<string, { cards: number }>): number {
  let n = 0;
  let t = Date.now();
  if (!activity[todayKey(t)]?.cards) t -= DAY; // today not done yet doesn't break the streak
  while (activity[todayKey(t)]?.cards) {
    n++;
    t -= DAY;
  }
  return n;
}

export const totalXp = (activity: Record<string, { xp: number }>) => Object.values(activity).reduce((a, d) => a + d.xp, 0);

/** Learner's rank = rank of the level they are working through. */
export function currentRank(cards: Record<string, CardState>, startModule: number) {
  return MODULES[frontierIndex(cards, startModule)].level.rank;
}

export const ALL_IDS = ALL_CARDS.map((c) => c.id);
