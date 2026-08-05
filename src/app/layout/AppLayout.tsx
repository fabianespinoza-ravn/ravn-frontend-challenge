import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { getMobilePlatform } from '@/shared/lib/platform/getMobilePlatform'
import { AddProjectPage } from '@/pages/add-project/AddProjectPage'
import { IconButton } from '@/shared/ui/icon-button/IconButton'
import { AppHeader } from '@/widgets/app-header/AppHeader'
import { AppSidebar } from '@/widgets/app-sidebar/AppSidebar'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const mobilePlatform = getMobilePlatform()
  const isAndroid = mobilePlatform === 'android'

  useEffect(() => {
    function closeAddProjectOnDesktop() {
      if (window.innerWidth >= 768) {
        setIsAddProjectOpen(false)
      }
    }

    window.addEventListener('resize', closeAddProjectOnDesktop)

    return () => window.removeEventListener('resize', closeAddProjectOnDesktop)
  }, [])

  return (
    <div
      className={styles.root}
      data-mobile-navigation={isAndroid ? 'drawer' : 'bottom'}
      data-mobile-platform={mobilePlatform}
    >
      <AppSidebar
        isAndroid={isAndroid}
        isAddProjectOpen={isAddProjectOpen}
        isDrawerOpen={isNavigationOpen}
        onNavigate={() => {
          setIsNavigationOpen(false)
          setIsAddProjectOpen(false)
        }}
        onRequestAddProject={() => setIsAddProjectOpen(true)}
        onRequestClose={() => setIsNavigationOpen(false)}
        onRequestOpen={() => setIsNavigationOpen(true)}
      />
      <div className={styles.workspace}>
        {isAddProjectOpen ? null : <AppHeader isAndroid={isAndroid} />}
        <main className={isAddProjectOpen ? styles.addProjectContent : styles.content}>
          {isAddProjectOpen ? (
            <AddProjectPage onClose={() => setIsAddProjectOpen(false)} />
          ) : (
            <Outlet />
          )}
        </main>
        {isAndroid && !isAddProjectOpen ? (
          <IconButton
            aria-label="Add Project"
            className={styles.androidAddTaskButton}
            onClick={() => setIsAddProjectOpen(true)}
          >
            <Plus aria-hidden="true" size={24} />
          </IconButton>
        ) : null}
      </div>
    </div>
  )
}
