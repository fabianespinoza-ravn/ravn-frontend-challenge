import { NavLink, Outlet } from 'react-router-dom'
import styles from './AppLayout.module.css'

const navigationItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'My Tasks', to: '/my-tasks' },
  { label: 'Settings', to: '/settings' },
]

export function AppLayout() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <nav className={styles.navigation} aria-label="Primary navigation">
          {navigationItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                isActive ? `${styles.navigationLink} ${styles.isActive}` : styles.navigationLink
              }
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
