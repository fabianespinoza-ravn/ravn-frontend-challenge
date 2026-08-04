import { Bell, Search } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Avatar } from '@/shared/ui/avatar/Avatar'
import { IconButton } from '@/shared/ui/icon-button/IconButton'
import styles from './AppHeader.module.css'

export function AppHeader() {
  return (
    <header className={styles.root}>
      <div className={styles.search}>
        <Search aria-hidden="true" size={19} />
        <input aria-label="Search tasks" placeholder="Search" type="search" />
      </div>
      <div className={styles.actions}>
        <IconButton aria-label="View notifications" title="View notifications">
          <Bell aria-hidden="true" size={20} />
          <span className={styles.notificationIndicator} aria-hidden="true" />
        </IconButton>
        <NavLink aria-label="Open settings" className={styles.profileLink} to="/settings">
          <Avatar alt="Profile" initials="FE" />
        </NavLink>
      </div>
    </header>
  )
}
