import { useRef, type TouchEvent } from 'react'
import { CheckSquare2, LayoutDashboard, Plus } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { BrandLogo } from '@/shared/ui/brand-logo/BrandLogo'
import styles from './AppSidebar.module.css'

const navigationItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: CheckSquare2, label: 'My Tasks', to: '/my-tasks' },
]

type AppSidebarProps = {
  isAndroid?: boolean
  isAddProjectOpen?: boolean
  isDrawerOpen?: boolean
  onNavigate?: () => void
  onRequestAddProject?: () => void
  onRequestClose?: () => void
  onRequestOpen?: () => void
}

export function AppSidebar({
  isAndroid = false,
  isAddProjectOpen = false,
  isDrawerOpen = false,
  onNavigate,
  onRequestAddProject,
  onRequestClose,
  onRequestOpen,
}: AppSidebarProps) {
  const touchStartX = useRef<number | null>(null)

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  function handleDrawerTouchEnd(event: TouchEvent<HTMLElement>) {
    const touchEndX = event.changedTouches[0]?.clientX

    if (
      touchStartX.current !== null &&
      touchEndX !== undefined &&
      touchEndX - touchStartX.current < -56
    ) {
      onRequestClose?.()
    }

    touchStartX.current = null
  }

  function handleEdgeTouchEnd(event: TouchEvent<HTMLElement>) {
    const touchEndX = event.changedTouches[0]?.clientX

    if (
      touchStartX.current !== null &&
      touchEndX !== undefined &&
      touchEndX - touchStartX.current > 56
    ) {
      onRequestOpen?.()
    }

    touchStartX.current = null
  }

  return (
    <>
      <aside
        aria-label={isAndroid ? 'Android navigation drawer' : undefined}
        className={`${styles.root} ${isAndroid ? styles.isAndroid : ''} ${
          isDrawerOpen ? styles.isDrawerOpen : ''
        }`}
        onTouchEnd={isAndroid ? handleDrawerTouchEnd : undefined}
        onTouchStart={isAndroid ? handleTouchStart : undefined}
      >
        <div className={styles.brand}>
          <BrandLogo />
        </div>
        <nav className={styles.navigation} aria-label="Primary navigation">
          {navigationItems.map(({ icon: Icon, label, to }, index) => (
            <div className={styles.navigationItem} key={to}>
              <NavLink
                className={({ isActive }) =>
                  isActive && !isAddProjectOpen
                    ? `${styles.navigationLink} ${styles.isActive}`
                    : styles.navigationLink
                }
                onClick={onNavigate}
                to={to}
              >
                <Icon aria-hidden="true" size={19} />
                <span className={styles.label}>{label}</span>
              </NavLink>
              {!isAndroid && index === 0 ? (
                <button
                  className={
                    isAddProjectOpen
                      ? `${styles.addProjectButton} ${styles.isActive}`
                      : styles.addProjectButton
                  }
                  onClick={onRequestAddProject}
                  type="button"
                >
                  <span aria-hidden="true" className={styles.addProjectIcon}>
                    <Plus size={14} />
                  </span>
                  <span className={styles.label}>Add Project</span>
                </button>
              ) : null}
            </div>
          ))}
        </nav>
      </aside>
      {isAndroid ? (
        <>
          <div
            aria-hidden="true"
            className={styles.edgeSwipeArea}
            data-testid="android-drawer-swipe-area"
            onTouchEnd={handleEdgeTouchEnd}
            onTouchStart={handleTouchStart}
          />
          <button
            aria-label="Close navigation"
            className={`${styles.backdrop} ${isDrawerOpen ? styles.isBackdropVisible : ''}`}
            onClick={onRequestClose}
            tabIndex={isDrawerOpen ? 0 : -1}
            type="button"
          />
        </>
      ) : null}
    </>
  )
}
