import { Home, Map, RotateCcw, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Deck } from './components/Deck';
import { Learn } from './screens/Learn';
import { Me } from './screens/Me';
import { Onboarding } from './screens/Onboarding';
import { PathScreen } from './screens/PathScreen';
import { Review } from './screens/Review';
import { dueCards, useStore, type Tab } from './store';

function useTheme() {
  const theme = useStore((s) => s.theme);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      document.documentElement.classList.toggle('dark', dark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#080706' : '#f4f1ea');
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
}

const TABS: { id: Tab; label: string; Icon: typeof Home }[] = [
  { id: 'learn', label: 'Learn', Icon: Home },
  { id: 'path', label: 'Path', Icon: Map },
  { id: 'review', label: 'Review', Icon: RotateCcw },
  { id: 'me', label: 'Me', Icon: User },
];

export default function App() {
  useTheme();
  const onboarded = useStore((s) => s.onboarded);
  const tab = useStore((s) => s.tab);
  const setTab = useStore((s) => s.setTab);
  const inSession = useStore((s) => !!s.session);
  const due = useStore((s) => dueCards(s.cards).length);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab, inSession]);

  return (
    <div className="min-h-[100dvh] flex justify-center">
      <div className="aurora" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="w-full max-w-[470px] min-h-[100dvh] flex flex-col relative z-10">
        {!onboarded ? (
          <Onboarding />
        ) : inSession ? (
          <Deck />
        ) : (
          <>
            <main className="flex-1 pb-28">
              {tab === 'learn' && <Learn />}
              {tab === 'path' && <PathScreen />}
              {tab === 'review' && <Review />}
              {tab === 'me' && <Me />}
            </main>
            <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none">
              <div className="glass-strong pointer-events-auto w-full max-w-[400px] grid grid-cols-4 gap-1 rounded-[28px] p-1.5">
                {TABS.map(({ id, label, Icon }) => {
                  const active = tab === id;
                  return (
                    <button key={id} onClick={() => setTab(id)} aria-current={active ? 'page' : undefined} className={`relative flex flex-col items-center gap-0.5 rounded-[22px] py-2 text-[11px] font-semibold transition-colors ${active ? 'text-white' : 'text-app-muted hover:text-app-text'}`}>
                      {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-[22px] neon-btn" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                      <Icon size={21} strokeWidth={active ? 2.4 : 2} className="relative" />
                      <span className="relative">{label}</span>
                      {id === 'review' && due > 0 && <span className="absolute top-1 left-1/2 ml-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-app-bad text-white text-[10px] font-bold grid place-items-center shadow-[0_0_12px_rgb(var(--bad)/.8)]">{due}</span>}
                    </button>
                  );
                })}
              </div>
            </nav>
          </>
        )}
      </div>
    </div>
  );
}
