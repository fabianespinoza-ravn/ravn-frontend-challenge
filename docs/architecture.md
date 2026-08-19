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
        → StatusToast, the standing region all three mutations announce into
```

## Layers

| Layer      | Responsibility                                                        | Examples                                                                                       |
| ---------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `app`      | Application composition, providers, router, layout and global styles. | `AppLayout`, Apollo provider, router.                                                          |
| `pages`    | Route-level screen state and rendering.                               | Dashboard, My Tasks, Settings.                                                                 |
| `widgets`  | Composed interface regions.                                           | Header, sidebar, toolbar, board, list.                                                         |
| `features` | User workflows and interaction-specific state.                        | `useTaskFormWorkflow`, `useTaskDeletionWorkflow`, `useTaskFiltersState`.                       |
| `entities` | Task and user domain models, operations and entity UI.                | `Task`, `ApiTask`, mapper, `TaskCard`, `TaskTags`.                                             |
| `shared`   | Generic UI, configuration, API infrastructure and helpers.            | Modal, buttons, dates, viewport, platform, `useDisclosure`, `StatusToast`, `LiveAnnouncement`. |

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

State that must outlive a page, card or responsive container is held above the routes, but it
belongs to the feature that owns it rather than to the shell. `AppLayout` composes three
workflow hooks and keeps only what a shell is for:

| Owner                                               | State                                                                                                 |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `AppLayout`                                         | Navigation drawer visibility, and the transient region the three mutations announce into.             |
| `useTaskFormWorkflow` (`features/task-form`)        | Whether the form is open, which task it is editing, which container renders it, and the draft itself. |
| `useTaskDeletionWorkflow` (`features/task-actions`) | The task awaiting a delete confirmation.                                                              |
| `useTaskFiltersState` (`features/task-filters`)     | The active filters and the debounced search value.                                                    |

The layout exposes focused contexts for opening the form, editing and deleting tasks, and
changing filters. This prevents prop drilling while avoiding a broad global client-state store.

The announcement region stays with the layout because all three workflows report into one region
and a deletion succeeds when no form is mounted, so no single feature can own it. Each workflow
receives an `announce` function, which keeps the dependency visible at the call site.
