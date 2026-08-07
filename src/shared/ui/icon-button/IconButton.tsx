import type { ComponentPropsWithRef } from 'react'
import styles from './IconButton.module.css'

/*
 * `ComponentPropsWithRef` rather than `ButtonHTMLAttributes` so a caller can
 * hold the element, which a control that opens something has to do in order to
 * take focus back when it closes.
 */
type IconButtonProps = ComponentPropsWithRef<'button'> & {
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
