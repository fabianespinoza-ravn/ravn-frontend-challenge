import { useState } from 'react'
import styles from './Avatar.module.css'

type AvatarProps = {
  alt: string
  initials: string
  size?: 'small' | 'medium' | 'large'
  src?: string | null
}

export function Avatar({ alt, initials, size = 'medium', src }: AvatarProps) {
  const [hasImageError, setHasImageError] = useState(false)
  const shouldShowImage = Boolean(src) && !hasImageError

  return (
    <span className={[styles.root, styles[size]].join(' ')} aria-label={alt} role="img">
      {shouldShowImage ? (
        <img
          alt=""
          className={styles.image}
          onError={() => setHasImageError(true)}
          src={src ?? undefined}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  )
}
