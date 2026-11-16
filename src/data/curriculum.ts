import raw from './curriculum.json';
import type { Card, Curriculum, Level, Module } from '../types';

export const CURRICULUM = raw as unknown as Curriculum;
export const LEVELS: Level[] = CURRICULUM.levels;

export interface ModuleRef { module: Module; level: Level; index: number }

/** Modules in learning order, with their level. */
export const MODULES: ModuleRef[] = LEVELS.flatMap((level) => level.modules.map((module) => ({ module, level, index: 0 }))).map(
  (m, index) => ({ ...m, index }),
);

const cardIndex = new Map<string, { card: Card; module: Module; level: Level }>();
for (const { module, level } of MODULES) for (const card of module.cards) cardIndex.set(card.id, { card, module, level });

export const ALL_CARDS: Card[] = MODULES.flatMap((m) => m.module.cards);
export const cardInfo = (id: string) => cardIndex.get(id);
export const moduleRef = (id: string) => MODULES.find((m) => m.module.id === id);
export const sourceById = (id: string) => CURRICULUM.sources.find((s) => s.id === id);

/** Visual identity per level (emoji + accent hue). */
export const LEVEL_STYLE: Record<number, { icon: string; hue: number }> = {
  1: { icon: '🌱', hue: 152 },
  2: { icon: '🧠', hue: 200 },
  3: { icon: '💬', hue: 24 },
  4: { icon: '🧩', hue: 262 },
  5: { icon: '📚', hue: 190 },
  6: { icon: '🤖', hue: 330 },
  7: { icon: '🔌', hue: 45 },
  8: { icon: '📏', hue: 170 },
  9: { icon: '🛡️', hue: 0 },
  10: { icon: '🏛️', hue: 220 },
  11: { icon: '🏆', hue: 48 },
};
