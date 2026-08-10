# Architecture

## Overview

The application is a client-side React SPA. React Router owns navigation, Apollo Client owns remote GraphQL data, and `AppLayout` coordinates UI state shared by routes and responsive containers.

```text
main.tsx
  → App
    → AppErrorBoundary
    → ApolloAppProvider
    → RouterProvider
      → AppLayout
        → AppSidebar + AppHeader + route Outlet
        → task form and delete-dialog overlays
```

## Layers

| Layer      | Responsibility                                                        | Examples                                   |
| ---------- | --------------------------------------------------------------------- | ------------------------------------------ |
| `app`      | Application composition, providers, router, layout and global styles. | `AppLayout`, Apollo provider, router.      |
| `pages`    | Route-level screen state and rendering.                               | Dashboard, My Tasks, Settings.             |
| `widgets`  | Composed interface regions.                                           | Header, sidebar, toolbar, board, list.     |
| `features` | User workflows and interaction-specific state.                        | Task form, task actions, filters.          |
| `entities` | Task and user domain models, operations and entity UI.                | `Task`, `ApiTask`, mapper, `TaskCard`.     |
| `shared`   | Generic UI, configuration, API infrastructure and helpers.            | Modal, buttons, dates, viewport, platform. |

Dependencies point downward: pages compose widgets and features; features use entities and shared code; entities use shared code. Entity UI does not import a feature. For example, `TaskCard` receives its action menu as a prop instead of importing task actions directly.

## Routes

| Route        | Page            | Purpose                                   |
| ------------ | --------------- | ----------------------------------------- |
| `/`          | Redirect        | Redirects to `/dashboard`.                |
| `/dashboard` | `DashboardPage` | All available tasks, board or list view.  |
| `/my-tasks`  | `MyTasksPage`   | Tasks assigned to the authenticated user. |
| `/settings`  | `SettingsPage`  | Read-only authenticated-user profile.     |
| `*`          | `NotFoundPage`  | Unknown-path fallback.                    |

`RouteErrorPage` handles router failures and `AppErrorBoundary` handles unexpected rendering errors. Neither is a public route.

## Shared layout state

`AppLayout` owns state that must outlive a page, card or responsive container:

- Navigation drawer visibility.
- Task form visibility and draft state.
- The task currently being edited.
- The task awaiting delete confirmation.
- Shared filters and debounced search value.

It exposes focused contexts for opening the form, editing/deleting tasks and changing filters. This prevents prop drilling while avoiding a broad global client-state store.
