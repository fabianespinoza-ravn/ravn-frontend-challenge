import type { ButtonHTMLAttributes } from 'react'
import styles from './IconButton.module.css'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'small' | 'medium'
}

export function IconButton({
  className,
  size = 'medium',
  type = 'button',
  ...props
}: IconButtonProps) {
  const iconButtonClassName = [styles.root, styles[size], className].filter(Boolean).join(' ')

  return <button className={iconButtonClassName} type={type} {...props} />
}
