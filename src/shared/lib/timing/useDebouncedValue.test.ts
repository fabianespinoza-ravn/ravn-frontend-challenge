import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('holds the first value until the delay has passed', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 300))

    expect(result.current).toEqual('a')
  })

  /*
   * The point of the hook: a term typed a character at a time must not become a
   * request per character, so only the pause after the last one commits.
   */
  it('reports only the value that survived the delay', () => {
    const { rerender, result } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'S' },
    })

    rerender({ value: 'Sh' })
    rerender({ value: 'Shi' })
    rerender({ value: 'Ship' })

    expect(result.current).toEqual('S')

    act(() => vi.advanceTimersByTime(300))

    expect(result.current).toEqual('Ship')
  })

  it('starts the wait again each time the value changes', () => {
    const { rerender, result } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'first' },
    })

    rerender({ value: 'second' })
    act(() => vi.advanceTimersByTime(200))

    rerender({ value: 'third' })
    act(() => vi.advanceTimersByTime(200))

    // 400ms have passed, but only 200 of them since the last change.
    expect(result.current).toEqual('first')

    act(() => vi.advanceTimersByTime(100))

    expect(result.current).toEqual('third')
  })
})
