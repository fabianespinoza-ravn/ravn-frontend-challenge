import { NavLink, Outlet } from 'react-router-dom'

const navigationItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'My Tasks', to: '/my-tasks' },
  { label: 'Settings', to: '/settings' },
]

export function AppLayout() {
  return (
    <div>
      <header>
        <nav aria-label="Primary navigation">
          {navigationItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
