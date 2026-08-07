import { useEffect, useState } from 'react'

/**
 * The value as it was `delay` milliseconds after it last changed.
 *
 * A field has to follow every keystroke, but a request should not. Keeping the
 * two apart lets the control stay immediate while whatever reads this one waits
 * for the typing to settle.
 */
export function useDebouncedValue<TValue>(value: TValue, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay)

    // Each change cancels the pending one, so only a pause commits a value.
    return () => clearTimeout(timeout)
  }, [delay, value])

  return debouncedValue
}
