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
npx vitest run src/store/__tests__/store.test.ts
```

CI runs `typecheck → lint → test → build` in that order.

## Architecture

All shared application state and logic lives in a single Zustand store (`src/store/store.ts`) — there are no custom React contexts or providers and no central app-state hook. Components read what they need directly via `useStore(selector)` and call store actions; only per-instance data (a `station` object, a DOM ref, a route `navigate` callback) is passed as props, and never more than a couple of levels deep. The one exception is `react-router-dom`'s `<BrowserRouter>`, wrapped around `<App />` in `main.tsx`. `App.tsx` itself is just `<Routes>` plus the one-time `useMediaSession()` call.

**Routing**
`App.tsx` renders a single `<Routes>`:
- `/` → `Main` (station grid + player bar)
- `/car` and `/car/:slug` → `CarApp` (Car Mode, station list / station detail)
- `*` → `NotFound` (404)

`CarApp` reads the optional `:slug` param via `useParams` and navigates via `useNavigate`.

**Audio engine (in the store)**
The store manages a single `HTMLAudioElement` and an `hls.js` instance via module-level variables (not React state — they're non-serializable singletons). Playback strategy per station:
1. `Hls.isSupported()` + `.m3u8` URL → hls.js (with `audioA` icecast as fatal-error fallback)
2. Native HLS (`canPlayType('application/vnd.apple.mpegurl')`) → native `<audio>`
3. Otherwise → icecast URL (`audioA ?? audio`)

DVR timeshift uses `sliders` on the `Station` object. `playSlider(slider)` loads `slider.audio` for `currentStation`; `playLive()` returns to the main stream. `handlePlay`/`handlePlayPause`/`handleSelectSlider`/`handleSelectLive` are the high-level actions components call.

**Data flow (all in the store)**
- `fetchStations()` fetches `https://digital.100fm.co.il/app/` once at module init, populating `stations`/`stationsLoading`/`stationsError`
- `nowPlaying` is polled every 30 s, (re)started by `play`/`playSlider`/`playLive` using `currentSlider?.info ?? currentStation?.info`
- `fetchNowPlayingJson` (utils) handles both XML (`<track>`) and JSON responses transparently
- `sliderLabels` are derived the same way, polled alongside `nowPlaying` whenever `play` sets a new `currentStation`
- `getFilteredStations(state)` wraps `filterStations` (utils) using `state.stations/tab/search/favorites/hidden` — used by `StationGrid`, the car-mode views, and `useMediaSession`
- `loadingTimeoutVisible`/`dismissLoadingTimeout` show a toast after the audio element stays in a loading state too long
- Persisted slice (`zustand/middleware` `persist`, key `100fm-digital-storage`): `isDarkMode`, `favorites`, `hidden`, `volume`, `viewMode`. A one-time migration seeds these from the old per-key `localStorage` entries (`100fm_dark_mode`, `100fm_favorites`, `100fm_hidden`, `100fm_volume`, `viewMode`) if the new combined key doesn't exist yet

**Media Session API**
`useMediaSession` (called once in `App`) registers `nexttrack`/`previoustrack` handlers that read `useStore.getState()` directly (always fresh, no re-registration needed) and subscribes to the store to update `navigator.mediaSession.metadata` when `currentStation`/`nowPlaying` change.

## Styling

Tailwind CSS v4 — configuration is CSS-based (`src/index.css` `@theme` block), no `tailwind.config.js`. Global RTL layout is set via `direction: rtl` on `html`. Dark mode is class-based — the store subscribes to `isDarkMode` at module scope and toggles `document.documentElement.classList` directly.

The React Compiler (`babel-plugin-react-compiler`) is enabled via Vite — avoid manual `useMemo`/`useCallback` unless there is a concrete measured reason.

## PWA / Service Worker

Workbox (via `vite-plugin-pwa`) caches the app shell with stale-while-revalidate. Live stream URLs (`.m3u8`, `.ts`) are `NetworkOnly` — never add caching for them. API JSON responses use `NetworkFirst` with a 1-hour fallback.

## Tests

jsdom environment, `@testing-library/react`, globals enabled. Setup file: `src/test/setup.ts` (imports `@testing-library/jest-dom`). `hls.js` and `HTMLAudioElement` need mocking in tests that exercise `usePlayer`.
