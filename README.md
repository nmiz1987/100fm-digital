# 100FM Digital

A Hebrew-language radio player for [100FM Digital](https://digital.100fm.co.il/app/) — 64 stations with live playback, now-playing info, favorites, and DVR timeshift.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS v4 (CSS-based `@theme` config)
- hls.js for HLS m3u8 playback with icecast fallback

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

## Features

- Stream 64 stations via HLS or icecast
- Live now-playing track info (polled every 30s)
- DVR timeshift: rewind up to 12 hours on supported stations
- Favorites and hidden station management
- Dark / light theme toggle
- Volume and mute controls (persisted in localStorage)

## API

| Endpoint | Description |
|---|---|
| `https://digital.100fm.co.il/app/` | Stations list |
| `https://digital.100fm.co.il/api/nowplaying/{slug}/{hours}` | Now-playing XML |

## Project Structure

```
src/
  api/           # fetchStations, fetchNowPlaying
  contexts/      # PlayerContext (audio engine), PreferencesContext (localStorage)
  hooks/         # useHls, useNowPlaying
  components/    # UI components
```
