import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'secondary'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const buttonClassName = [styles.root, styles[variant], className].filter(Boolean).join(' ')

  return <button className={buttonClassName} {...props} />
}
