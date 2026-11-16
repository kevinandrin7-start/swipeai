import { useState } from 'react';
import { Stat } from '../components/Deck';
import { Button, hueColor, Progress } from '../components/ui';
import { ALL_CARDS, CURRICULUM, LEVEL_STYLE, LEVELS } from '../data/curriculum';
import { currentRank, masteredCount, streak, todayKey, totalXp, useStore, type ThemePref } from '../store';

export function Me() {
  const s = useStore();
  const [key, setKey] = useState(s.apiKey);
  const [confirmReset, setConfirmReset] = useState(false);
  const all = ALL_CARDS.map((c) => c.id);
  const st = Object.values(s.cards).filter((c) => c.seen > 0);
  const right = st.reduce((a, c) => a + c.right, 0);
  const wrong = st.reduce((a, c) => a + c.wrong, 0);
  const rank = currentRank(s.cards, s.startModule);
  const days = Array.from({ length: 7 }, (_, i) => {
    const t = Date.now() - (6 - i) * 86400000;
    return { label: new Date(t).toLocaleDateString([], { weekday: 'narrow' }), n: s.activity[todayKey(t)]?.cards ?? 0 };
  });
  const maxDay = Math.max(s.dailyGoal, ...days.map((d) => d.n));

  return (
    <div className="px-4 pb-8 space-y-4">
      <header className="pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="font-display text-[28px] font-bold">Your progress</h1>
      </header>

      <section className="rounded-3xl glass p-4">
        <div className="text-xs font-semibold text-app-muted uppercase tracking-wider mb-2">Rank</div>
        <div className="flex gap-1.5">
          {CURRICULUM.ranks.map((r) => {
            const reached = CURRICULUM.ranks.indexOf(r) <= CURRICULUM.ranks.indexOf(rank);
            return (
              <div key={r} className="flex-1 text-center">
                <div className={`h-2 rounded-full ${reached ? 'neon-fill shadow-[0_0_10px_rgb(var(--neon-b)/.6)]' : 'bg-app-text/10'}`} />
                <div className={`text-[10px] mt-1 ${r === rank ? 'font-bold text-app-text' : 'text-app-muted'}`}>{r}</div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Total XP" value={totalXp(s.activity)} />
        <Stat label="Day streak" value={`${streak(s.activity)}🔥`} />
        <Stat label="Cards seen" value={`${st.length}/${all.length}`} />
        <Stat label="Mastered" value={masteredCount(s.cards, all)} />
        <Stat label="Accuracy" value={right + wrong ? `${Math.round((right / (right + wrong)) * 100)}%` : '–'} />
        <Stat label="Swipes" value={right + wrong} />
      </div>

      <section className="rounded-3xl glass p-4">
        <div className="font-display font-semibold mb-3">Last 7 days</div>
        <div className="flex items-end gap-2 h-24">
          {days.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-lg neon-fill shadow-[0_0_14px_rgb(var(--neon-b)/.5)]" style={{ height: `${Math.max(3, (d.n / maxDay) * 72)}px`, opacity: d.n >= s.dailyGoal ? 1 : 0.5 }} />
              <div className="text-[10px] text-app-muted">{d.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl glass p-4 space-y-3">
        <div className="font-display font-semibold">Mastery by level</div>
        {LEVELS.map((l) => {
          const ids = l.modules.flatMap((m) => m.cards.map((c) => c.id));
          const m = masteredCount(s.cards, ids);
          return (
            <div key={l.id}>
              <div className="flex justify-between text-xs mb-1">
                <span>{LEVEL_STYLE[l.number].icon} {l.number}. {l.title}</span>
                <span className="text-app-muted tabular-nums">{m}/{ids.length}</span>
              </div>
              <Progress value={m / ids.length} color={hueColor(l.number)} className="h-1.5" />
            </div>
          );
        })}
      </section>

      <section className="rounded-3xl glass p-4 space-y-4">
        <div className="font-display font-semibold">Settings</div>
        <div>
          <div className="text-sm font-semibold mb-1.5">Daily goal</div>
          <div className="grid grid-cols-4 gap-2">
            {[10, 15, 25, 40].map((g) => (
              <button key={g} onClick={() => s.setDailyGoal(g)} className={`rounded-xl border py-2 text-sm font-semibold ${s.dailyGoal === g ? 'border-transparent neon-ring bg-app-accent/15' : 'border-app-text/10 glass-soft'}`}>{g}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-1.5">Theme</div>
          <div className="grid grid-cols-3 gap-2">
            {(['system', 'light', 'dark'] as ThemePref[]).map((t) => (
              <button key={t} onClick={() => s.setTheme(t)} className={`rounded-xl border py-2 text-sm font-semibold capitalize ${s.theme === t ? 'border-transparent neon-ring bg-app-accent/15' : 'border-app-text/10 glass-soft'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-1">Anthropic API key (optional)</div>
          <p className="text-xs text-app-muted mb-2">Lets "Ask Claude" answer inside the app. Stored only in this browser. Without it, questions open in claude.ai.</p>
          <div className="flex gap-2">
            <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-ant-…" className="flex-1 min-w-0 rounded-xl glass-soft border border-app-text/10 px-3 py-2 text-sm outline-none focus:border-app-accent" />
            <Button variant="soft" className="!py-2" onClick={() => s.setApiKey(key)}>{s.apiKey && s.apiKey === key.trim() ? 'Saved' : 'Save'}</Button>
          </div>
        </div>
        <div>
          {confirmReset ? (
            <div className="flex gap-2">
              <Button variant="soft" className="flex-1" onClick={() => setConfirmReset(false)}>Cancel</Button>
              <Button className="flex-1 !bg-none !bg-app-bad !shadow-none" onClick={() => s.resetAll()}>Erase progress</Button>
            </div>
          ) : (
            <button onClick={() => setConfirmReset(true)} className="text-sm text-app-bad font-semibold">Reset all progress…</button>
          )}
        </div>
      </section>

      <p className="text-xs text-app-muted text-center px-4">
        Content: {all.length} cards, facts checked {CURRICULUM.factsCheckedAsOf}, {CURRICULUM.sources.length} sources. Model names and prices change; each module links its sources.
      </p>
    </div>
  );
}
