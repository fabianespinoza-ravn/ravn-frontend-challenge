import { Circle } from 'lucide-react'
import styles from './StatusDot.module.css'

type StatusDotProps = {
  /** Absent means no status is chosen, which the outline says. */
  color?: string
}

/**
 * The marker a task status wears, in the colour its board column already
 * carries. It stays an outline until a status is chosen, so an empty control is
 * not mistaken for one holding a value.
 *
 * It lives here rather than inside a feature because the form and the filter
 * panel both show it, and neither may reach into the other.
 */
export function StatusDot({ color }: StatusDotProps) {
  return (
    <span className={styles.root} style={color ? { color } : undefined}>
      <Circle aria-hidden="true" fill={color ?? 'none'} size={12} />
    </span>
  )
}
