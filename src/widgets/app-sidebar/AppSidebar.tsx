import { CheckSquare2, LayoutDashboard, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { BrandLogo } from '@/shared/ui/brand-logo/BrandLogo'
import styles from './AppSidebar.module.css'

const navigationItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: CheckSquare2, label: 'My Tasks', to: '/my-tasks' },
  { icon: Settings, label: 'Settings', to: '/settings' },
]

export function AppSidebar() {
  return (
    <aside className={styles.root}>
      <div className={styles.brand} aria-label="Ravn">
        <BrandLogo />
      </div>
      <nav className={styles.navigation} aria-label="Primary navigation">
        {navigationItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            className={({ isActive }) =>
              isActive ? `${styles.navigationLink} ${styles.isActive}` : styles.navigationLink
            }
            key={to}
            to={to}
          >
            <Icon aria-hidden="true" size={19} />
            <span className={styles.label}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
