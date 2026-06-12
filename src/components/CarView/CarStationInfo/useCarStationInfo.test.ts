import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCarStationInfo } from './useCarStationInfo'
import type { Station } from '../../../types'

const makeStation = (slug: string, name: string): Station => ({
  name,
  audio: `http://stream/${slug}`,
  slug,
  logo: `${slug}.png`,
})

const stationA = makeStation('a', 'A')
const stationB = makeStation('b', 'B')
const stationC = makeStation('c', 'C')

const filteredList = [stationA, stationB, stationC]

describe('useCarStationInfo', () => {
  it('goNext plays and navigates to the next station in the list', () => {
    const handlePlay = vi.fn()
    const onNavigate = vi.fn()
    const { result } = renderHook(() =>
      useCarStationInfo({ station: stationA, filteredList, handlePlay, onNavigate })
    )

    result.current.goNext()

    expect(handlePlay).toHaveBeenCalledWith(stationB)
    expect(onNavigate).toHaveBeenCalledWith(stationB)
  })

  it('goPrev plays and navigates to the previous station in the list', () => {
    const handlePlay = vi.fn()
    const onNavigate = vi.fn()
    const { result } = renderHook(() =>
      useCarStationInfo({ station: stationA, filteredList, handlePlay, onNavigate })
    )

    result.current.goPrev()

    expect(handlePlay).toHaveBeenCalledWith(stationC)
    expect(onNavigate).toHaveBeenCalledWith(stationC)
  })

  it('wraps around when going next from the last station', () => {
    const handlePlay = vi.fn()
    const onNavigate = vi.fn()
    const { result } = renderHook(() =>
      useCarStationInfo({ station: stationC, filteredList, handlePlay, onNavigate })
    )

    result.current.goNext()

    expect(handlePlay).toHaveBeenCalledWith(stationA)
    expect(onNavigate).toHaveBeenCalledWith(stationA)
  })

  it('hasMultiple is false for a single-station list', () => {
    const { result } = renderHook(() =>
      useCarStationInfo({ station: stationA, filteredList: [stationA], handlePlay: vi.fn(), onNavigate: vi.fn() })
    )

    expect(result.current.hasMultiple).toBe(false)
  })

  it('hasMultiple is true for a multi-station list', () => {
    const { result } = renderHook(() =>
      useCarStationInfo({ station: stationA, filteredList, handlePlay: vi.fn(), onNavigate: vi.fn() })
    )

    expect(result.current.hasMultiple).toBe(true)
  })

  it('falls back to index 0 when the current station is not in the filtered list', () => {
    const handlePlay = vi.fn()
    const onNavigate = vi.fn()
    const stationD = makeStation('d', 'D')
    const { result } = renderHook(() =>
      useCarStationInfo({ station: stationD, filteredList, handlePlay, onNavigate })
    )

    result.current.goNext()

    expect(handlePlay).toHaveBeenCalledWith(stationA)
    expect(onNavigate).toHaveBeenCalledWith(stationA)
  })

  it('does nothing when the filtered list is empty', () => {
    const handlePlay = vi.fn()
    const onNavigate = vi.fn()
    const { result } = renderHook(() =>
      useCarStationInfo({ station: stationA, filteredList: [], handlePlay, onNavigate })
    )

    result.current.goNext()

    expect(handlePlay).not.toHaveBeenCalled()
    expect(onNavigate).not.toHaveBeenCalled()
  })
})
