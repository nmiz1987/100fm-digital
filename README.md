# 100FM Digital

A Hebrew-language radio player for [100FM Digital](https://digital.100fm.co.il/app/) — 64 stations with live playback, now-playing info, favorites, and DVR timeshift.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (CSS-based `@theme` config)
- hls.js for HLS m3u8 playback with icecast fallback
- Vitest + Testing Library for unit tests
- PWA support via vite-plugin-pwa

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | Lint with ESLint |

## Features

- Stream 64 stations via HLS or icecast
- Live now-playing track info (polled every 30s)
- DVR timeshift: rewind up to 12 hours on supported stations
- Favorites and hidden station management
- Dark / light theme toggle
- Volume and mute controls (persisted in localStorage)
- Loading timeout warning toast
- Installable as a PWA

## API

| Endpoint | Description |
|---|---|
| `https://digital.100fm.co.il/app/` | Stations list |
| `https://digital.100fm.co.il/api/nowplaying/{slug}/{hours}` | Now-playing XML/JSON |

## Project Structure

```
src/
  components/    # UI components (Header, PlayerBar, StationCard, StationGrid, LoadingTimeoutToast)
  hooks/         # Custom hooks (usePlayer, useStations, useNowPlaying, useLocalStorage, useSliderLabels, useLoadingTimeoutWarning)
  utils/         # Shared utilities (fetchNowPlayingJson, proxyUrl)
  types/         # TypeScript type definitions
  test/          # Test setup and globals
```
