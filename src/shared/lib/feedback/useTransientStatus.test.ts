import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { transientStatusDuration, useTransientStatus } from './useTransientStatus'

describe('useTransientStatus', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('has nothing to say until something is announced', () => {
    const { result } = renderHook(() => useTransientStatus())

    expect(result.current.status.message).toBeNull()
  })

  it('clears the message once its time is up', () => {
    const { result } = renderHook(() => useTransientStatus())

    act(() => result.current.announce('Task created successfully.'))

    expect(result.current.status.message).toEqual('Task created successfully.')

    act(() => vi.advanceTimersByTime(transientStatusDuration))

    expect(result.current.status.message).toBeNull()
  })

  /*
   * The bug this prevents: the timer of a replaced message firing on the message
   * that replaced it, cutting the second announcement short.
   */
  it('gives a replacing message its own full time', () => {
    const { result } = renderHook(() => useTransientStatus())

    act(() => result.current.announce('Task created successfully.'))
    act(() => vi.advanceTimersByTime(transientStatusDuration - 500))
    act(() => result.current.announce('Task deleted successfully.'))

    // The first message's timer would have fired somewhere in here.
    act(() => vi.advanceTimersByTime(1000))

    expect(result.current.status.message).toEqual('Task deleted successfully.')

    act(() => vi.advanceTimersByTime(transientStatusDuration))

    expect(result.current.status.message).toBeNull()
  })

  /*
   * Deleting two tasks in a row announces the same sentence twice, and a live
   * region whose text did not change announces nothing. The key is what makes
   * the second one a new announcement rather than the first one still sitting
   * there.
   */
  it('counts a repeated message as a new announcement', () => {
    const { result } = renderHook(() => useTransientStatus())

    act(() => result.current.announce('Task deleted successfully.'))

    const firstKey = result.current.status.announcementKey

    act(() => result.current.announce('Task deleted successfully.'))

    expect(result.current.status.message).toEqual('Task deleted successfully.')
    expect(result.current.status.announcementKey).toBeGreaterThan(firstKey)
  })

  it('drops its pending timer when the tree it belongs to goes', () => {
    const { result, unmount } = renderHook(() => useTransientStatus())

    act(() => result.current.announce('Task updated successfully.'))
    unmount()

    // A timer outliving the hook would set state on a gone component here.
    expect(() => act(() => vi.advanceTimersByTime(transientStatusDuration))).not.toThrow()
  })
})
