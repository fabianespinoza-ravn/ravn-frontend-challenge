import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/widgets/app-header/AppHeader'
import { AppSidebar } from '@/widgets/app-sidebar/AppSidebar'
import styles from './AppLayout.module.css'

export function AppLayout() {
  return (
    <div className={styles.root}>
      <AppSidebar />
      <div className={styles.workspace}>
        <AppHeader />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
