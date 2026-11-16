import { ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { askClaude, claudeLink, QUICK_ASKS } from '../lib/claude';
import { useStore } from '../store';
import type { Card } from '../types';
import { Sheet } from './ui';

export function AskClaudeSheet({ card, onClose }: { card: Card | null; onClose: () => void }) {
  const apiKey = useStore((s) => s.apiKey);
  const [q, setQ] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setQ('');
    setAnswer('');
    setBusy(false);
  }, [card?.id]);

  const ask = async (question: string) => {
    if (!card || !question.trim()) return;
    if (!apiKey) {
      window.open(claudeLink(card, question), '_blank', 'noopener');
      return;
    }
    setBusy(true);
    setAnswer('');
    try {
      setAnswer(await askClaude(apiKey, card, question));
    } catch (e) {
      setAnswer(`Couldn't reach Claude: ${(e as Error).message}. Check your API key in Me → Settings, or use "Open in Claude".`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={!!card} onClose={onClose} title="Ask Claude">
      {card && (
        <div className="space-y-3">
          <p className="text-sm text-app-muted line-clamp-2">{card.front}</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ASKS.map((s) => (
              <button key={s} onClick={() => ask(s)} className="rounded-full border border-app-text/10 glass-soft px-3 py-1.5 text-sm hover:border-app-accent">
                {s}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              ask(q);
            }}
          >
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask your own question…" className="flex-1 rounded-2xl glass-soft border border-app-text/10 px-3 py-2.5 text-sm outline-none focus:border-app-accent" />
            <button className="rounded-2xl bg-app-accent text-white px-4 font-semibold" aria-label="Ask">
              <Sparkles size={18} />
            </button>
          </form>
          {busy && (
            <div className="flex items-center gap-2 text-sm text-app-muted">
              <Loader2 size={16} className="animate-spin" /> Claude is thinking…
            </div>
          )}
          {answer && <div className="rounded-2xl glass-soft p-4 text-[15px] leading-relaxed whitespace-pre-wrap">{answer}</div>}
          <a href={claudeLink(card, q || QUICK_ASKS[0])} target="_blank" rel="noopener" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-app-accent py-2">
            Open in Claude <ExternalLink size={14} />
          </a>
          {!apiKey && <p className="text-xs text-app-muted text-center">Questions open in claude.ai. Add an Anthropic API key in Me → Settings to get answers right here.</p>}
        </div>
      )}
    </Sheet>
  );
}
