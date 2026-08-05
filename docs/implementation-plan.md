# Implementation Plan and Decision Log

> **Status:** In progress — Initial Setup implementation.  
> **Last updated:** 2026-08-04
> **Review status:** Initial Setup is in review through [PR #3](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge/pull/3).
> **Phase closure:** Initial Setup was merged through [PR #3](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge/pull/3); Issue #1 is closed.
> **Current phase:** Dashboard UI is ready to begin through [Issue #4](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge/issues/4) on `feat/dashboard-static-ui`.

## Documentation Rule

This file is the repository's source of truth for confirmed product decisions, implementation progress, scope changes, and technical rationale.

- Update it before starting a phase, when a decision changes, and when a phase is completed.
- Preserve previous decisions in the decision log; do not rewrite history.
- Keep repository content, issues, pull requests, commits, and user-facing application text in English.

## Repository and Delivery Workflow

- Repository: [ravn-frontend-challenge](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge)
- Default branch: `main`
- Development workflow: issue → dedicated branch → Conventional Commits → pull request → automated checks and self-review → merge.
- GitHub Project: [Task Management Challenge](https://github.com/users/fabianespinoza-ravn/projects/1)
- Project workflow: `Backlog` → `Ready` → `In progress` → `In review` → `Done`.
- Issue [#1 Initial Setup](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge/issues/1) is closed, was merged through [PR #3](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge/pull/3), and is in `Done` in the GitHub Project.
- Issue [#4 Dashboard UI](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge/issues/4) is in `In progress` in the GitHub Project. Its implementation branch is `feat/dashboard-static-ui`.

## Confirmed Folder Structure

```text
src/
|-- app/                    # Providers, router, application shell, and global styles
|-- pages/                  # Route-level pages
|-- widgets/                # Large Figma sections composed from entities and features
|-- features/               # User actions such as creating, editing, filtering, and moving tasks
|-- entities/               # Task and User domain types, API operations, and domain UI
|-- shared/                 # Reusable UI primitives, utilities, configuration, and assets
`-- test/                   # Shared test utilities and GraphQL mocks
```

```text
app/
|-- providers/
|-- router/
`-- styles/

pages/
|-- dashboard/
|-- my-tasks/
|-- settings/
|-- not-found/
`-- error/

widgets/
|-- app-header/
|-- app-sidebar/
|-- task-board/
`-- task-toolbar/

entities/
|-- task/
`-- user/

shared/
|-- api/
|-- assets/
|-- config/
|-- lib/
|-- types/
`-- ui/
```

- No generic `components` directory is used.
- New folders are created only when they have an active responsibility; empty placeholder folders are avoided.
- Shared UI primitives belong in `shared/ui`; task- and user-specific UI belongs in `entities`.
- Each feature owns its interaction logic and API mutation/query coordination.

## Product Baseline

The application is a responsive task management web application for desktop and mobile browsers on iOS and Android. It is not a native iOS or Android application and does not require platform-specific routes or codebases.

### Dashboard

- Shows every task available to the authenticated user, grouped by task status.
- Includes the authenticated user avatar, notification control, search control, Kanban/list view toggle, and an add-task button.
- Shows one vertical column per task status with a current task count.
- Displays tasks in chronological order within each column.
- Each task card shows its name, point estimate, due date, tags, options menu, assigned-user avatar when present, and bottom metadata icons.

### My Tasks

- Reuses the dashboard presentation and interactions.
- Shows only tasks assigned to the authenticated user.
- Uses the authenticated user's `profile.id` as the GraphQL `assigneeId` filter.
- Shows a dedicated empty state when no tasks are assigned to the authenticated user.

### Task Creation and Editing

- The add-task control opens a creation modal.
- The options control on a task card opens task actions, including editing.
- Creation and editing are modal-based interactions, not standalone routes.

### Settings

- The Settings route will display the authenticated user information from the `profile` query.
- The API field `profile.type` represents the challenge's required “Position” value.
- User type values will be presented in a human-readable format, such as `Admin` and `Candidate`.
- The `profile` query was verified against the API: `type` returns the expected enum value and `avatar` can be `null`.
- Settings and shared avatar UI must provide an accessible fallback when no avatar URL is available.

## API Constraints and Confirmed Behavior

- A task has one optional `assignee`, not a list of assignees.
- `CreateTaskInput` and `UpdateTaskInput` accept one optional `assigneeId`.
- A task may be unassigned because `Task.assignee` can be `null`.
- The task `creator` is recorded by the backend from the authenticated request and cannot be selected or changed by the client.
- Task cards show only the assignee avatar. They do not display multiple participant avatars or present the creator as an assignee.
- `My Tasks` means `task.assignee.id === profile.id`; creator-owned tasks are not included unless they are also assigned to the authenticated user.

## Confirmed Initial Routes

All routes are served by the same responsive web application. There are no desktop-only, mobile-only, iOS, Android, multi-assignee, or task-detail routes in the initial scope.

| Path         | Page            | Behavior                                                                              |
| ------------ | --------------- | ------------------------------------------------------------------------------------- |
| `/`          | Redirect        | Redirects to `/dashboard`.                                                            |
| `/dashboard` | `DashboardPage` | Shows all available tasks grouped by status. Each task has zero or one assignee.      |
| `/my-tasks`  | `MyTasksPage`   | Shows only tasks whose `assigneeId` matches `profile.id`.                             |
| `/settings`  | `SettingsPage`  | Shows authenticated user information from `profile`; `type` is presented as Position. |
| `*`          | `NotFoundPage`  | Handles unknown URLs.                                                                 |

- `AppLayout` provides the shared sidebar, header, and route outlet.
- `RouteErrorPage` is the router-level error fallback and does not require its own public URL.
- `AppErrorBoundary` wraps the application for unexpected React rendering errors and does not require its own public URL.
- The authenticated user avatar and the Settings navigation item link to `/settings`.

## Confirmed Route and Error Architecture

```text
AppErrorBoundary
`-- Router
    `-- AppLayout
        |-- AppSidebar
        |-- AppHeader
        `-- Outlet
            |-- DashboardPage
            |-- MyTasksPage
            |-- SettingsPage
            `-- NotFoundPage
```

- `AppLayout` is the shared shell for normal application routes.
- `NotFoundPage` is rendered only for an unmatched URL through the `*` route.
- `RouteErrorPage` is configured as the router's `errorElement` and handles route-level failures; it does not have a public URL.
- `AppErrorBoundary` wraps the router and handles unexpected React rendering failures; it does not have a public URL.
- The application uses one responsive router for desktop and mobile browsers.

## Confirmed Styling Architecture

- Component-specific styles use CSS Modules, colocated with their React component.
- CSS Module class names use `camelCase`: `root`, `header`, `isActive`, `variantPrimary`, and `statusDone`.
- Global CSS is limited to reset rules, document-level styles, and reusable design tokens.
- Design tokens centralize colors, spacing, typography, radii, shadows, and breakpoints.
- Responsive styles follow a mobile-first approach and progressively enhance for tablet and desktop layouts.
- The initial breakpoints are `768px` for tablet and `1024px` for desktop; flexible CSS layout primitives are preferred before adding media queries.
- The visual baseline uses system fonts and does not depend on externally loaded fonts.
- Interactive components must provide visible `focus-visible` states, adequate touch targets, and support `prefers-reduced-motion` where animation is used.

## Confirmed Quality Architecture

- TypeScript uses strict compiler settings, including `strict`, `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch`.
- TypeScript uses the compatible 6.0 release line required by the selected ESLint TypeScript integration.
- ESLint is the only code-quality linter and is configured for TypeScript, React Hooks, React Refresh, and JSX accessibility.
- Prettier is the only formatting tool and is integrated with ESLint through `eslint-config-prettier` to avoid overlapping formatting rules.
- Vitest and React Testing Library cover component behavior and integration flows.
- GraphQL operation tests use mocks when API integration begins.
- End-to-end testing, Git hooks, Commitlint, duplicate linters, and mandatory coverage thresholds are out of scope unless a concrete need emerges.
- GitHub Actions validates `format:check`, `typecheck`, `lint`, `test`, and `build` on pull requests and pushes to `main`.

### Quality Scripts

```text
npm run format        # Apply Prettier formatting
npm run format:check  # Verify formatting without writing changes
npm run typecheck     # Verify TypeScript types
npm run lint          # Run ESLint
npm run lint:fix      # Apply safe ESLint fixes
npm run test          # Run the test suite once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate a coverage report
npm run build         # Build the production application
```

## Confirmed Error Handling Policy

| Error source                       | User-facing behavior                                                               | Initial Setup scope                       |
| ---------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------- |
| Unknown URL                        | `NotFoundPage` with a return-to-dashboard action.                                  | Implemented.                              |
| Route failure                      | `RouteErrorPage` with retry and return-to-dashboard actions.                       | Implemented.                              |
| Unexpected React rendering failure | `AppErrorBoundary` fallback with retry and return-to-dashboard actions.            | Implemented.                              |
| GraphQL query failure              | Inline page-level error state with a retry action that refetches data.             | Implemented with GraphQL features.        |
| Mutation failure                   | Preserve form values or current confirmation state and show an error notification. | Implemented with each mutation feature.   |
| Form validation failure            | Field-level accessible validation messages; do not send an invalid mutation.       | Implemented with task forms.              |
| Drag and drop failure              | Restore or refetch the previous board state and show an error notification.        | Implemented with the drag-and-drop bonus. |

- Technical error details are logged with `console.error` in development and are not exposed to end users.
- The challenge does not include external error-monitoring services.
- User-visible query errors do not remove the application shell; navigation remains available.
- Error messages and action labels are written in English.

## Confirmed Project Configuration

- `npm` is the only package manager; `package-lock.json` is versioned.
- `.env.example` contains `VITE_GRAPHQL_ENDPOINT=https://syn-api-production-e95c.up.railway.app/graphql` and an empty `VITE_GRAPHQL_TOKEN`.
- `.env.local` contains local credentials and is ignored by Git.
- A `shared/config/env.ts` module centralizes access to `import.meta.env` and validates GraphQL configuration when API integration begins.
- No token, secret, or sensitive value is committed, documented, or injected into GitHub Actions.
- Vite configuration is limited to the official React plugin, the `@` source alias, and Vitest configuration.
- React Router uses version `7.18.2`, the latest stable version available during setup.
- npm audit currently reports React Router advisories for RSC or server-side modes; this application is a client-side Vite application and does not configure RSC, SSR, server actions, or server endpoints. No compatible unflagged router release is currently published.
- TypeScript, Vite, and Vitest share aliases for `@/app`, `@/pages`, `@/widgets`, `@/features`, `@/entities`, `@/shared`, and `@/test`.
- TypeScript uses separate project, application, and Node configuration files.
- `.editorconfig`, `.prettierrc.json`, `.prettierignore`, and `eslint.config.js` establish local formatting and linting consistency.
- Development proxies, fixed ports, deployment configuration, native mobile configuration, and extra build plugins are out of scope unless a concrete need emerges.

## Confirmed Code Conventions

- React components use PascalCase file names, such as `TaskCard.tsx`.
- Hooks use `useCamelCase` file names, such as `useTaskFilters.ts`.
- Utility files use camelCase names, such as `formatDueDate.ts`.
- Folders use kebab-case names, such as `task-board`.
- CSS Module class names use camelCase as defined in the styling architecture.
- Named exports are used by default.
- An `index.ts` file is used only to expose a deliberate public API for a folder; broad automatic barrel exports are avoided.
- Initial Setup dependencies are limited to routing, styling, quality tooling, and test infrastructure.
- Apollo Client, GraphQL operations, task modals, and drag-and-drop dependencies are introduced only in their respective feature phases.

## Initial Setup: Current Scope

**Implementation status:** Complete.

### Implementation Progress

- [x] Create the React, TypeScript, and Vite scaffold.
- [x] Configure the application entry point, `App`, Vite React plugin, and the `@` source alias.
- [x] Configure strict TypeScript project references and Node types for Vite configuration.
- [x] Verify the production build.
- [x] Configure ESLint, Prettier, EditorConfig, and local quality scripts.
- [x] Configure React Router, application layout, route placeholders, NotFoundPage, RouteErrorPage, and AppErrorBoundary.
- [x] Create reset rules, design tokens, global styles, a responsive application layout, and the reusable Button primitive.
- [x] Configure Vitest, Testing Library, JSDOM, coverage reporting, and baseline tests for NotFoundPage, RouteErrorPage, and AppErrorBoundary.
- [x] Configure GitHub Actions to run installation, formatting, typecheck, lint, tests, and build on pull requests and pushes to `main`.
- [x] Confirm the folder structure through active source folders; defer `widgets`, `features`, `entities`, and other empty folders until their corresponding phase gives them an active responsibility.
- [x] Update the README with local setup instructions, environment guidance, architecture rationale, quality commands, CI behavior, and visual-evidence follow-up.
- [x] Run final local validation: `format:check`, `typecheck`, `lint`, `test`, and `build`.
- [x] Open [PR #3](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge/pull/3) linked to Issue #1; its GitHub Actions quality checks passed.

The following items are required before product functionality is implemented:

- React, TypeScript, and Vite application foundation.
- Initial folder structure with clear ownership boundaries.
- Routing with Dashboard, My Tasks, Settings, Not Found, and route error states.
- Styling foundation, global styles, design tokens, and a reusable visual component approach for Figma replication.
- Linting, formatting, test baseline, and local quality scripts.
- Global Error Boundary.
- GitHub Actions for type checking, linting, tests, and production builds.
- README setup and running instructions.

## Dashboard UI: Current Scope

**Implementation status:** In progress.

### Implementation Progress

- [x] Install `lucide-react` and build the dashboard shell with AppSidebar, AppHeader, TaskToolbar, IconButton, and Avatar primitives.
- [x] Add focused shell coverage for active navigation, header controls, profile fallback, view controls, and the add-task action.
- [x] Build the static task board with typed local mock data, five chronological status columns, TaskCard metadata, and an unassigned-avatar fallback.
- [x] Add static board coverage for column counts, chronological card order, and the unassigned fallback.
- [x] Replace the My Tasks placeholder with a responsive static list filtered by the mock authenticated assignee; list view is visually selected and groups task rows into expandable status categories with counts.
- [ ] Refine the dashboard against Figma across mobile, tablet, and desktop layouts; add focused coverage and visual evidence.

- Dashboard shell controls are visual only in this phase. Navigation remains functional through the existing routes and NavLink active states.
- The shared Avatar supports an accessible initials fallback for a missing or failed image source.
- The dashboard shell uses the provided visual reference for its contained desktop canvas, compact sidebar and toolbar controls, search field, and official Ravn SVG mark. The planned five-column task-status model remains unchanged.
- My Tasks uses a static list during the dashboard phase. It filters local fixtures by the mock authenticated assignee ID; GraphQL will later replace this fixture source with `assigneeId: profile.id`.
- My Tasks rows use a left due-date accent: red for past tasks, yellow for tasks due today or tomorrow, and green for later due dates.
- The My Tasks list omits an assignee column because every row is already scoped to the authenticated user's assignment; it shows task name, tags, estimate, and due date instead.
- Each My Tasks row keeps a trailing, visual-only options control, aligned in its own action column.
- On desktop, My Tasks is presented as a table-like list with aligned column headers and visible row and cell separators. The header is a separate, same-width table row with a deliberate gap before task categories; the mobile layout remains stacked for readability.
- Empty My Tasks status categories are expanded by default and show the existing empty-state copy in a centered, full-width table row.

## Decision Log

### Current Decisions

### 1. Pre-Initial Setup: Repository and Workflow

| ID  | Decision                                                                                                | Rationale                                               |
| --- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1.1 | The repository is public and owned by `fabianespinoza-ravn`.                                            | Required by the challenge.                              |
| 1.2 | Scoped work uses issues, dedicated branches, Conventional Commits, pull requests, and automated checks. | Provides a clear, incremental project history.          |
| 1.3 | Repository materials and application text are written in English.                                       | Keeps the submission consistent and evaluator-friendly. |

### 2. Product and API Behavior

| ID  | Decision                                                                                                                        | Rationale                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 2.1 | The deliverable is a responsive web application for desktop and mobile browsers on iOS and Android, not native mobile software. | Matches the React, CSS, Figma, and browser-based GraphQL scope.                               |
| 2.2 | A task has zero or one assignee; task cards show only the optional assignee avatar.                                             | The API supports one optional assignee, not multiple participants.                            |
| 2.3 | My Tasks filters by authenticated user `assigneeId`.                                                                            | Matches the API and gives the route a clear meaning.                                          |
| 2.4 | The required "Position" value is represented by `profile.type`.                                                                 | The API exposes `type` with `ADMIN` and `CANDIDATE` values, but no separate `position` field. |
| 2.5 | Profile avatars may be `null`; shared avatar UI uses an accessible fallback rather than a broken image.                         | Confirmed by the profile API response.                                                        |

### 3. Initial Setup: Architecture and Experience

| ID  | Decision                                                                                                                                                                | Rationale                                                                                                   |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 3.1 | Use a simplified feature-sliced structure with `app`, `pages`, `widgets`, `features`, `entities`, `shared`, and `test`.                                                 | Separates Figma sections, domain components, interactions, and reusable primitives without overengineering. |
| 3.2 | Use `/dashboard`, `/my-tasks`, and `/settings`; `/` redirects to Dashboard.                                                                                             | Matches visible navigation and avoids duplicate or unsupported routes.                                      |
| 3.3 | Use NotFoundPage for unmatched URLs, RouteErrorPage for route failures, AppErrorBoundary for rendering failures, and localized recovery states for API and form errors. | Separates recovery behavior by error source.                                                                |
| 3.4 | Use CSS Modules, global design tokens, mobile-first responsive CSS, and camelCase CSS Module class names.                                                               | Keeps Figma implementation consistent, scoped, and adaptable.                                               |
| 3.5 | Use PascalCase components, `useCamelCase` hooks, camelCase utilities, kebab-case folders, named exports, and deliberate public APIs.                                    | Keeps the codebase predictable and avoids unnecessary export indirection.                                   |

### 4. Initial Setup: Quality and Configuration

| ID  | Decision                                                                                                                                                     | Rationale                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| 4.1 | Use strict TypeScript, ESLint, Prettier, Vitest, React Testing Library, and CI quality checks.                                                               | Provides useful correctness, accessibility, formatting, and regression checks without unnecessary tooling. |
| 4.2 | Use npm, local environment variables, shared source aliases, minimal Vite configuration, and editor consistency files.                                       | Keeps setup secure and consistent without unnecessary infrastructure.                                      |
| 4.3 | Add only foundation dependencies during Initial Setup; defer feature-specific dependencies to their matching phases.                                         | Avoids unused packages and keeps each phase focused.                                                       |
| 4.4 | Use React Router `7.18.2`; monitor its audit advisories because the current application is client-side only and does not use the affected server-side modes. | Uses the latest stable release available while documenting the residual audit signal.                      |
