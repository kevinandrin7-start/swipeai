/** Content contract for the AI Engineer path (mirrors ai-curriculum/curriculum.json). */
export type CardType = 'concept' | 'true_false' | 'this_or_that' | 'scenario';
export type Side = 'left' | 'right';

interface CardBase {
  id: string;
  type: CardType;
  front: string;
  back: string;
  difficulty: 1 | 2 | 3;
  example?: string;
  code?: string;
  tags?: string[];
}
export interface ConceptCard extends CardBase { type: 'concept' | 'scenario' }
export interface TrueFalseCard extends CardBase { type: 'true_false'; answer: boolean }
export interface ThisOrThatCard extends CardBase { type: 'this_or_that'; left: string; right: string; correct: Side }
export type Card = ConceptCard | TrueFalseCard | ThisOrThatCard;

export interface Module {
  id: string;
  title: string;
  summary: string;
  objectives: string[];
  prerequisites: string[];
  sources: string[];
  cards: Card[];
}
export interface Level {
  number: number;
  id: string;
  title: string;
  rank: string;
  goal: string;
  modules: Module[];
}
export interface Source { id: string; title: string; url: string }
export interface Curriculum {
  schemaVersion: string;
  title: string;
  description: string;
  factsCheckedAsOf: string;
  ranks: string[];
  sources: Source[];
  levels: Level[];
}

/** Per-card spaced-repetition state (Leitner boxes). */
export interface CardState {
  box: number; // 0 = new/relearning, 5 = long-term
  dueAt: number; // epoch ms
  seen: number;
  right: number;
  wrong: number;
  last?: number;
  saved?: boolean;
}

/** Whether a swipe was a "got it" (right) or "again" (left), and, for quiz cards, if it was correct. */
export interface SwipeResult { cardId: string; side: Side; correct: boolean }
