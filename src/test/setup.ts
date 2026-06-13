import '@testing-library/jest-dom'

// jsdom doesn't implement media playback; component tests trigger the store's
// real audio engine (e.g. via handlePlay), so stub these to avoid console noise.
window.HTMLMediaElement.prototype.play = () => Promise.resolve()
window.HTMLMediaElement.prototype.pause = () => {}

// jsdom doesn't implement ResizeObserver, used by useElementHeight.
window.ResizeObserver ??= class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
