import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePlayer } from './usePlayer'
import type { Station, Slider } from '../types'

// ---- HLS mock (hoisted so vi.mock factory can reference it) ----
type HlsEventHandler = (event: string, data?: unknown) => void

const { mockHlsInstance, MockHls } = vi.hoisted(() => {
  const mockHlsInstance = {
    loadSource: vi.fn(),
    attachMedia: vi.fn(),
    on: vi.fn() as ReturnType<typeof vi.fn>,
    destroy: vi.fn(),
  }
  // Must use a regular function (not arrow) so `new Hls()` works as a constructor.
  // Returning an object from a constructor causes JS to use that object as the instance.
  function MockHls() { return mockHlsInstance }
  MockHls.isSupported = vi.fn().mockReturnValue(false)
  MockHls.Events = { MANIFEST_PARSED: 'hlsManifestParsed', ERROR: 'hlsError' }
  return { mockHlsInstance, MockHls: MockHls as unknown as ReturnType<typeof vi.fn> & {
    isSupported: ReturnType<typeof vi.fn>
    Events: { MANIFEST_PARSED: string; ERROR: string }
  } }
})

vi.mock('hls.js', () => ({ default: MockHls }))

// ---- Audio mock ----
// Must be a real class so `new Audio()` inside the hook works.
// The latest instance is captured via `lastAudio` for test assertions.
let lastAudio: MockAudio

class MockAudio {
  src = ''
  volume = 0
  play = vi.fn().mockResolvedValue(undefined)
  pause = vi.fn()
  canPlayType = vi.fn().mockReturnValue('')
  _listeners: Record<string, Array<() => void>> = {}

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    lastAudio = this
  }

  addEventListener(event: string, handler: () => void) {
    this._listeners[event] ??= []
    this._listeners[event].push(handler)
  }

  removeEventListener(event: string, handler: () => void) {
    this._listeners[event] = (this._listeners[event] ?? []).filter((h) => h !== handler)
  }

  emit(event: string) {
    this._listeners[event]?.forEach((h) => h())
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  global.Audio = MockAudio as unknown as typeof Audio
  MockHls.isSupported.mockReturnValue(false)
  mockHlsInstance.on.mockReset()
})

const station: Station = { name: 'Rock FM', audio: 'http://stream.mp3', slug: 'rock-fm', logo: 'logo.png' }
const stationWithFallback: Station = { ...station, audioA: 'http://fallback.mp3' }
const stationHls: Station = { ...station, audio: 'http://stream.m3u8', audioA: 'http://fallback.mp3' }
const slider: Slider = { audio: 'http://slider.mp3' }

describe('usePlayer', () => {
  it('starts with no station, not playing, not loading', () => {
    const { result } = renderHook(() => usePlayer(0.8))
    expect(result.current.currentStation).toBeNull()
    expect(result.current.currentSlider).toBeNull()
    expect(result.current.isPlaying).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.volume).toBe(0.8)
  })

  it('play() sets current station and triggers load', async () => {
    const { result } = renderHook(() => usePlayer(0.8))
    await act(async () => { result.current.play(station) })
    expect(result.current.currentStation).toEqual(station)
    expect(result.current.currentSlider).toBeNull()
    expect(result.current.isLoading).toBe(true)
    expect(lastAudio.play).toHaveBeenCalled()
  })

  it('play() loads via HLS when supported and src is .m3u8', async () => {
    MockHls.isSupported.mockReturnValue(true)
    const { result } = renderHook(() => usePlayer(0.8))
    await act(async () => { result.current.play(stationHls) })
    expect(mockHlsInstance.loadSource).toHaveBeenCalledWith(stationHls.audio)
    expect(mockHlsInstance.attachMedia).toHaveBeenCalled()
  })

  it('HLS MANIFEST_PARSED handler calls audio.play()', async () => {
    MockHls.isSupported.mockReturnValue(true)
    let manifestHandler: (() => void) | undefined
    mockHlsInstance.on.mockImplementation((event: string, handler: HlsEventHandler) => {
      if (event === MockHls.Events.MANIFEST_PARSED) manifestHandler = handler as () => void
    })

    const { result } = renderHook(() => usePlayer(0.8))
    await act(async () => { result.current.play(stationHls) })
    await act(async () => { manifestHandler?.() })
    expect(lastAudio.play).toHaveBeenCalled()
  })

  it('HLS ERROR handler falls back to fallbackSrc on fatal error', async () => {
    MockHls.isSupported.mockReturnValue(true)
    let errorHandler: ((event: string, data: { fatal: boolean }) => void) | undefined
    mockHlsInstance.on.mockImplementation((event: string, handler: HlsEventHandler) => {
      if (event === MockHls.Events.ERROR) errorHandler = handler as (event: string, data: { fatal: boolean }) => void
    })

    const { result } = renderHook(() => usePlayer(0.8))
    await act(async () => { result.current.play(stationHls) })
    await act(async () => { errorHandler?.('hlsError', { fatal: true }) })
    expect(lastAudio.src).toBe(stationHls.audioA)
    expect(lastAudio.play).toHaveBeenCalled()
  })

  it('HLS ERROR with non-fatal error does nothing', async () => {
    MockHls.isSupported.mockReturnValue(true)
    let errorHandler: ((event: string, data: { fatal: boolean }) => void) | undefined
    mockHlsInstance.on.mockImplementation((event: string, handler: HlsEventHandler) => {
      if (event === MockHls.Events.ERROR) errorHandler = handler as (event: string, data: { fatal: boolean }) => void
    })

    const { result } = renderHook(() => usePlayer(0.8))
    await act(async () => { result.current.play(stationHls) })
    const playCallsBefore = lastAudio.play.mock.calls.length
    await act(async () => { errorHandler?.('hlsError', { fatal: false }) })
    expect(lastAudio.play.mock.calls.length).toBe(playCallsBefore)
  })

  it('play() loads via canPlayType when HLS not supported but browser supports m3u8', async () => {
    MockHls.isSupported.mockReturnValue(false)
    const { result } = renderHook(() => usePlayer(0.8))
    // lastAudio is now set after hook mounts; configure canPlayType before calling play
    lastAudio.canPlayType.mockReturnValue('maybe')
    await act(async () => { result.current.play(stationHls) })
    expect(lastAudio.src).toBe(stationHls.audio)
    expect(lastAudio.play).toHaveBeenCalled()
  })

  it('play() falls back to audioA for non-m3u8 src', async () => {
    const { result } = renderHook(() => usePlayer(0.8))
    await act(async () => { result.current.play(stationWithFallback) })
    expect(lastAudio.src).toBe(stationWithFallback.audioA)
  })

  it('play() uses src when no fallbackSrc', async () => {
    const { result } = renderHook(() => usePlayer(0.8))
    await act(async () => { result.current.play(station) })
    expect(lastAudio.src).toBe(station.audio)
  })

  it('stop() clears station and resets state', async () => {
    const { result } = renderHook(() => usePlayer(0.8))
    await act(async () => { result.current.play(station) })
    act(() => { result.current.stop() })
    expect(result.current.currentStation).toBeNull()
    expect(result.current.isPlaying).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(lastAudio.pause).toHaveBeenCalled()
  })

  it('pause() calls audio.pause()', async () => {
    const { result } = renderHook(() => usePlayer(0.8))
    await act(async () => { result.current.play(station) })
    act(() => { result.current.pause() })
    expect(lastAudio.pause).toHaveBeenCalled()
  })

  it('resume() calls audio.play()', async () => {
    const { result } = renderHook(() => usePlayer(0.8))
    await act(async () => { result.current.play(station) })
    act(() => { result.current.resume() })
    expect(lastAudio.play).toHaveBeenCalledTimes(2)
  })

  it('isPlaying becomes true on playing event', async () => {
    const { result } = renderHook(() => usePlayer(0.8))
    await act(async () => { result.current.play(station) })
    act(() => { lastAudio.emit('playing') })
    expect(result.current.isPlaying).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it('isPlaying becomes false on pause event', async () => {
    const { result } = renderHook(() => usePlayer(0.8))
    await act(async () => { result.current.play(station) })
    act(() => { lastAudio.emit('playing') })
    act(() => { lastAudio.emit('pause') })
    expect(result.current.isPlaying).toBe(false)
  })

  it('isLoading becomes true on waiting event', async () => {
    const { result } = renderHook(() => usePlayer(0.8))
    await act(async () => { result.current.play(station) })
    act(() => { lastAudio.emit('playing') })
    act(() => { lastAudio.emit('waiting') })
    expect(result.current.isLoading).toBe(true)
  })

  it('setVolume() updates volume and clamps to [0, 1]', async () => {
    const { result } = renderHook(() => usePlayer(0.8))
    await act(async () => { result.current.play(station) })

    act(() => { result.current.setVolume(0.5) })
    expect(result.current.volume).toBe(0.5)
    expect(lastAudio.volume).toBe(0.5)

    act(() => { result.current.setVolume(2) })
    expect(result.current.volume).toBe(1)

    act(() => { result.current.setVolume(-1) })
    expect(result.current.volume).toBe(0)
  })

  it('playSlider() sets station and slider', async () => {
    const { result } = renderHook(() => usePlayer(0.8))
    await act(async () => { result.current.playSlider(slider, station) })
    expect(result.current.currentStation).toEqual(station)
    expect(result.current.currentSlider).toEqual(slider)
  })

  it('playLive() clears currentSlider', async () => {
    const { result } = renderHook(() => usePlayer(0.8))
    await act(async () => { result.current.playSlider(slider, station) })
    await act(async () => { result.current.playLive(station) })
    expect(result.current.currentSlider).toBeNull()
  })

  it('stop() destroys existing HLS instance', async () => {
    MockHls.isSupported.mockReturnValue(true)
    const { result } = renderHook(() => usePlayer(0.8))
    await act(async () => { result.current.play(stationHls) })
    act(() => { result.current.stop() })
    expect(mockHlsInstance.destroy).toHaveBeenCalled()
  })
})
