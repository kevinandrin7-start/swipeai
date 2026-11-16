import type Anthropic from '@anthropic-ai/sdk';
import type { Card } from '../types';

/**
 * "Ask Claude" for a card. Two paths:
 * 1. No key: open claude.ai with a ready-made prompt (works for everyone).
 * 2. Learner-supplied API key (Settings): answer in-app. The key stays in this browser's
 *    localStorage; move this call to a server route before any public launch.
 */
const MODEL = 'claude-opus-5-5';

export function cardContext(card: Card): string {
  const parts = [`Card (${card.type.replace('_', ' ')}): ${card.front}`];
  if (card.type === 'this_or_that') parts.push(`Options: A) ${card.left}  B) ${card.right}. Correct: ${card.correct === 'left' ? card.left : card.right}`);
  if (card.type === 'true_false') parts.push(`Correct answer: ${card.answer ? 'True' : 'False'}`);
  parts.push(`Answer: ${card.back}`);
  if (card.example) parts.push(`Example: ${card.example}`);
  if (card.code) parts.push(`Code:\n${card.code}`);
  return parts.join('\n');
}

export const QUICK_ASKS = [
  'Give me another real-world example',
  'Explain it like I am new to this',
  'How would an enterprise architect use this?',
  'Quiz me with one harder question',
];

export function claudeLink(card: Card, question: string): string {
  const prompt = `I'm studying to become an AI engineer / AI solutions architect with flashcards.\n\n${cardContext(card)}\n\n${question}`;
  return `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;
}

async function client(apiKey: string) {
  const { default: SDK } = await import('@anthropic-ai/sdk');
  return new SDK({ apiKey, dangerouslyAllowBrowser: true });
}

/** Server-side refusal fallback: if the model declines, the API retries on a fallback model. */
const FALLBACK: { betas: Anthropic.Beta.AnthropicBeta[]; fallbacks: 'default' } = {
  betas: ['server-side-fallback-2026-07-01'],
  fallbacks: 'default',
};

export async function askClaude(apiKey: string, card: Card, question: string): Promise<string> {
  const res = await (await client(apiKey)).beta.messages.create({
    ...FALLBACK,
    model: MODEL,
    max_tokens: 4000,
    output_config: { effort: 'low' },
    system:
      'You are a concise tutor in a flashcard app that turns novices into AI engineers and AI solutions architects. ' +
      'Ground your answer in the card below, teach with one concrete example (prefer Claude and enterprise scenarios), ' +
      'stay under 150 words, and use plain language.\n<card>\n' + cardContext(card) + '\n</card>',
    messages: [{ role: 'user', content: question }],
  });
  if (res.stop_reason === 'refusal') return 'Claude could not answer that one. Try rephrasing the question.';
  return res.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');
}
