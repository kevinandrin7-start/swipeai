# SwipeAI

SwipeAI: Tinder-style swipe flashcards that take a learner from AI novice to AI engineer and AI solutions architect.
React + Vite + TypeScript + Tailwind + Framer Motion + Zustand. No accounts yet: progress lives in the browser's localStorage.

## Run
```
npm install
npm run dev      # http://localhost:5173
npm run build    # static build in dist/ (deploy anywhere: Vercel, Netlify, GitHub Pages)
```

## How it works
- **Learn**: today's session mixes due reviews with new cards from where you are on the path (daily goal 10/15/25/40).
- **Swipe**: concept and scenario cards flip on tap; swipe right = got it, left = again. True/false cards: right = true, left = false. This-or-that cards: swipe toward the correct option. Keyboard: ← → to swipe, space to flip.
- **Path**: 11 levels, 51 modules, 510 cards. Modules open in order; onboarding placement or "skip ahead" opens later ones.
- **Review**: Leitner spaced repetition (1, 3, 7, 16, 35 days). Missed cards also come back once later in the same session. Tricky, saved and shuffle decks.
- **Me**: rank ladder (Novice to Expert), XP, streak, mastery by level, settings.
- **Ask Claude** on any card: opens claude.ai with the card as context, or answers in-app if the learner saves an Anthropic API key (browser-only; move to a server route before a public launch).

## Where things live
- `src/data/curriculum.json`: the content (generated from `/ai-curriculum/build/*.py`; edit those and run `python3 build.py out.json`, then copy here).
- `src/data/curriculum.ts`: typed access and per-level colors/icons.
- `src/store.ts`: Zustand store, spaced repetition, unlocks, streak/XP, daily deck builder.
- `src/components/SwipeCard.tsx`, `CardFaces.tsx`, `Deck.tsx`: the swipe experience.
- `src/screens/*`: Onboarding, Learn, Path, Review, Me.
- `src/lib/claude.ts`: Ask Claude (claude.ai link + optional API call to claude-opus-5-5).
