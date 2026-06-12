# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server at localhost:5173
npm run build        # typecheck + production build
npm run typecheck    # tsc --noEmit only
npm run lint         # ESLint
npm test             # run all tests once
npm run test:watch   # watch mode
npm run test:coverage

# Run a single test file
npx vitest run src/hooks/usePlayer.test.ts
```

CI runs `typecheck → lint → test → build` in that order.

## Architecture

All application state lives in `App.tsx` — there are no custom React contexts or providers. Each concern is handled by a dedicated hook, and `App` wires them together. The one exception is `react-router-dom`'s `<BrowserRouter>`, wrapped around `<App />` in `main.tsx`.

**Routing**
`App.tsx` renders a single `<Routes>`:
- `/` → the main app (station grid + player bar)
- `/car` and `/car/:slug` → `CarApp` (Car Mode, station list / station detail)
- `*` → `NotFound` (404)

`CarApp` reads the optional `:slug` param via `useParams` and navigates via `useNavigate`.

**Audio engine — `usePlayer`**
Manages a single `HTMLAudioElement` and an `hls.js` instance via refs (not React state). Playback strategy per station:
1. `Hls.isSupported()` + `.m3u8` URL → hls.js (with `audioA` icecast as fatal-error fallback)
2. Native HLS (`canPlayType('application/vnd.apple.mpegurl')`) → native `<audio>`
3. Otherwise → icecast URL (`audioA ?? audio`)

DVR timeshift uses `sliders` on the `Station` object. `playSlider(slider, station)` loads `slider.audio` directly; `playLive(station)` returns to the main stream.

**Data flow**
- `useStations` fetches `https://digital.100fm.co.il/app/` once, returns `Station[]`
- `useNowPlaying(infoUrl)` polls every 30 s. The active URL is `currentSlider?.info ?? currentStation?.info`
- `fetchNowPlayingJson` (utils) handles both XML (`<track>`) and JSON responses transparently
- `useSliderLabels` derives human-readable DVR time labels from `station.sliders`
- `useLocalStorage` is a typed `useState` wrapper that syncs to `localStorage`. Keys: `100fm_dark_mode`, `100fm_favorites`, `100fm_hidden`, `100fm_volume`
- `useLoadingTimeoutWarning` shows a toast after the audio element stays in a loading state too long

**Media Session API**
Registered once in `App` using a `navigateRef` pattern: `next`/`prev` handlers always read the latest station list without needing to re-register when state changes.

## Styling

Tailwind CSS v4 — configuration is CSS-based (`src/index.css` `@theme` block), no `tailwind.config.js`. Global RTL layout is set via `direction: rtl` on `html`. Dark mode is class-based (`document.documentElement.classList` toggled in `App`).

The React Compiler (`babel-plugin-react-compiler`) is enabled via Vite — avoid manual `useMemo`/`useCallback` unless there is a concrete measured reason.

## PWA / Service Worker

Workbox (via `vite-plugin-pwa`) caches the app shell with stale-while-revalidate. Live stream URLs (`.m3u8`, `.ts`) are `NetworkOnly` — never add caching for them. API JSON responses use `NetworkFirst` with a 1-hour fallback.

## Tests

jsdom environment, `@testing-library/react`, globals enabled. Setup file: `src/test/setup.ts` (imports `@testing-library/jest-dom`). `hls.js` and `HTMLAudioElement` need mocking in tests that exercise `usePlayer`.
