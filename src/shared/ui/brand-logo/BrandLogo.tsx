import styles from './BrandLogo.module.css'

export function BrandLogo() {
  return (
    <svg
      aria-hidden="true"
      className={styles.root}
      fill="none"
      viewBox="0 0 80 72"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M60.8437 49.113C71.4432 46.2164 79.2366 36.5184 79.2366 25C79.2366 11.4325 68.428 0.389594 54.9541 0.0132066V0H16.1325H0L13.3902 16.6623H16.1325V16.6667H54.3621C58.9069 16.7327 62.5714 20.4372 62.5714 24.9978C62.5714 29.6003 58.8409 33.3312 54.2388 33.3312H48.1621H26.7827L57.8571 72H79.2344L60.8437 49.113Z"
        fill="currentColor"
      />
      <path
        d="M18 72C24.0751 72 29 67.0751 29 61C29 54.9249 24.0751 50 18 50C11.9249 50 7 54.9249 7 61C7 67.0751 11.9249 72 18 72Z"
        fill="currentColor"
      />
    </svg>
  )
}
