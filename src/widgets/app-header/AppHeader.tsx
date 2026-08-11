import { Search } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Avatar } from '@/shared/ui/avatar/Avatar'
import { getUserInitials } from '@/entities/user/model/user'
import { useProfile } from '@/entities/user/model/useProfile'
import { useTaskFilters } from '@/features/task-filters/model/useTaskFilters'
import styles from './AppHeader.module.css'

type AppHeaderProps = {
  /*
   * The field says what it searches, and it is tasks, so a route without any
   * has no use for it. The layout decides that, since it is the one that knows
   * which route is showing; the header defaults to the task views it was built
   * for.
   */
  hasTaskSearch?: boolean
  isAndroid?: boolean
}

export function AppHeader({ hasTaskSearch = true, isAndroid = false }: AppHeaderProps) {
  const { data } = useProfile()
  const { filters, setFilter } = useTaskFilters()
  const profile = data?.profile
  const initials = profile ? getUserInitials(profile.fullName) : 'FE'

  return (
    <header className={`${styles.root} ${isAndroid ? styles.isAndroid : ''}`}>
      {isAndroid ? (
        <NavLink aria-label="Open settings" className={styles.androidProfileLink} to="/settings">
          <Avatar alt="Profile" initials={initials} src={profile?.avatar} />
        </NavLink>
      ) : null}
      {hasTaskSearch ? (
        <div className={styles.search}>
          <Search aria-hidden="true" size={19} />
          <input
            aria-label="Search tasks"
            onChange={(event) => setFilter('name', event.target.value)}
            placeholder="Search"
            type="search"
            value={filters.name}
          />
        </div>
      ) : (
        /* Holds the space the search left, so the profile control stays at the edge. */
        <span className={styles.searchSpacer} />
      )}
      {!isAndroid ? (
        <NavLink aria-label="Open settings" className={styles.profileLink} to="/settings">
          <Avatar alt="Profile" initials={initials} src={profile?.avatar} />
        </NavLink>
      ) : null}
    </header>
  )
}
