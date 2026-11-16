import { CheckCircle2, ExternalLink, Lock } from 'lucide-react';
import { useState } from 'react';
import { Button, hueColor, Progress, Ring, Sheet } from '../components/ui';
import { LEVEL_STYLE, LEVELS, moduleRef, MODULES, sourceById } from '../data/curriculum';
import { isUnlocked, masteredCount, seenCount, useStore } from '../store';

export function PathScreen() {
  const s = useStore();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="px-4 pb-6">
      <header className="pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <h1 className="font-display text-[28px] font-bold">Learning path</h1>
        <p className="text-sm text-app-muted">11 levels from Novice to Expert. Finish a module to open the next.</p>
      </header>
      <div className="space-y-6">
        {LEVELS.map((level) => {
          const ids = level.modules.flatMap((m) => m.cards.map((c) => c.id));
          const mastered = masteredCount(s.cards, ids);
          return (
            <section key={level.id} aria-label={`Level ${level.number}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="grid place-items-center h-11 w-11 rounded-2xl text-2xl glass-soft" style={{ background: hueColor(level.number, 55, 0.2), boxShadow: `0 0 22px -4px ${hueColor(level.number, 60, 0.75)}, inset 0 1px 0 rgb(255 255 255 / .4)` }}>
                  {LEVEL_STYLE[level.number].icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: hueColor(level.number, 65) }}>
                    Level {level.number} · {level.rank}
                  </div>
                  <div className="font-display font-semibold leading-tight">{level.title}</div>
                </div>
                <div className="text-xs text-app-muted tabular-nums">{Math.round((mastered / ids.length) * 100)}%</div>
              </div>
              <Progress value={mastered / ids.length} color={hueColor(level.number)} className="mb-2 h-1.5" />
              <div className="space-y-2">
                {level.modules.map((m) => {
                  const ref = moduleRef(m.id)!;
                  const open = isUnlocked(ref.index, s.cards, s.startModule);
                  const mids = m.cards.map((c) => c.id);
                  const seen = seenCount(s.cards, mids);
                  const done = seen === mids.length;
                  return (
                    <button key={m.id} onClick={() => setOpenId(m.id)} className={`w-full flex items-center gap-3 rounded-2xl glass p-3 text-left transition hover:-translate-y-0.5 hover:bg-app-text/5 ${open ? '' : 'opacity-60'}`}>
                      <Ring value={seen / mids.length} color={hueColor(level.number)}>
                        {open ? done ? <CheckCircle2 size={16} className="text-app-good" /> : `${seen}` : <Lock size={14} className="text-app-muted" />}
                      </Ring>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{m.title}</div>
                        <div className="text-xs text-app-muted truncate">{m.summary}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      <ModuleSheet id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

function ModuleSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const s = useStore();
  const ref = id ? moduleRef(id) : undefined;
  if (!ref) return <Sheet open={false} onClose={onClose}>{null}</Sheet>;
  const { module: m, level, index } = ref;
  const open = isUnlocked(index, s.cards, s.startModule);
  const ids = m.cards.map((c) => c.id);
  const unseen = m.cards.filter((c) => !s.cards[c.id]?.seen).map((c) => c.id);
  const prev = MODULES[index - 1];
  const start = (ids: string[], title: string) => {
    onClose();
    s.startSession('module', title, ids, m.id);
  };
  return (
    <Sheet open onClose={onClose} title={m.title}>
      <div className="space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: hueColor(level.number, 65) }}>
          {LEVEL_STYLE[level.number].icon} Level {level.number} · {level.title}
        </div>
        <p className="text-[15px]">{m.summary}</p>
        <div>
          <div className="text-sm font-bold mb-1">You'll be able to</div>
          <ul className="space-y-1 text-sm">
            {m.objectives.map((o) => (
              <li key={o} className="flex gap-2"><span className="text-app-accent">✓</span>{o}</li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-2xl glass-soft p-2"><b>{ids.length}</b><div className="text-xs text-app-muted">cards</div></div>
          <div className="rounded-2xl glass-soft p-2"><b>{seenCount(s.cards, ids)}</b><div className="text-xs text-app-muted">seen</div></div>
          <div className="rounded-2xl glass-soft p-2"><b>{masteredCount(s.cards, ids)}</b><div className="text-xs text-app-muted">mastered</div></div>
        </div>
        {open ? (
          <div className="space-y-2">
            {unseen.length > 0 && <Button className="w-full" onClick={() => start(unseen, m.title)}>Learn {unseen.length} new cards</Button>}
            <Button variant={unseen.length ? 'soft' : 'primary'} className="w-full" onClick={() => start([...ids].sort(() => Math.random() - 0.5), `Practice: ${m.title}`)}>
              Practice all {ids.length} cards
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl glass-soft p-4 text-sm space-y-3">
            <div className="flex items-center gap-2 font-semibold"><Lock size={16} /> Opens after "{prev?.module.title}"</div>
            <Button variant="soft" className="w-full" onClick={() => { useStore.setState({ startModule: index }); }}>
              I already know the earlier material: skip ahead to here
            </Button>
          </div>
        )}
        {m.sources.length > 0 && (
          <div>
            <div className="text-sm font-bold mb-1">Sources</div>
            <ul className="space-y-1">
              {m.sources.map((sid) => {
                const src = sourceById(sid);
                return src ? (
                  <li key={sid}>
                    <a href={src.url} target="_blank" rel="noopener" className="flex items-center gap-1 text-sm text-app-accent">
                      {src.title} <ExternalLink size={12} />
                    </a>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        )}
      </div>
    </Sheet>
  );
}
