# Implementation Plan and Decision Log

> **Status:** GraphQL Data and Creation is implemented and awaiting its pull request.
> **Last updated:** 2026-08-06
> **Phase closure:** Initial Setup was merged through [PR #3](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge/pull/3); Issue #1 is closed.
> **Phase closure:** Dashboard UI was merged through [PR #5](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge/pull/5); Issue #4 is closed.
> **Current phase:** GraphQL Data and Creation is tracked through [Issue #6](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge/issues/6) on `feat/graphql-task-data`.

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
- Issue [#4 Dashboard UI](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge/issues/4) is closed, was merged through [PR #5](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge/pull/5), and is in `Done` in the GitHub Project.
- Issue [#6 GraphQL Data and Creation](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge/issues/6) is closed, was merged through [PR #7](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge/pull/7), and is in `Done` in the GitHub Project.
- Issue [#8 Task Editing and Deletion](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge/issues/8) is the active implementation issue. Its branch is `feat/task-edit-delete`.

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
- `features/` became active during the GraphQL phase with `features/task-creation`, which owns the task-creation draft state, its context, and the shared form and modal UI.
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

- At desktop widths (`768px` and above), the add-task control opens a creation modal over the current task view.
- Below `768px`, iOS and Android keep the existing full-page Add Project composition as the task-creation experience.
- Both containers write to the same draft state, but they present it differently: the desktop modal uses one compact metadata row, and the iOS composition stacks the same fields as full-width rows.
- Task creation is one application state with two responsive containers. Crossing the `768px` breakpoint swaps the container and keeps the draft; only an explicit close, cancel, or navigation discards it.
- The desktop modal has no header. It shows a borderless task-title field, one row of metadata controls for estimate, assignee, label, due date, and status, a plain-text `Cancel`, and an accent `Create`.
- Each metadata control opens its options below itself and replaces its own generic label with the selected value once a choice is made. Assignee shows the chosen teammate's avatar and name; label shows one chip per selected tag.
- A task may carry several labels, so the label control is a multiple selection.
- Status is chosen explicitly; a task cannot be created without one and no status is preselected.
- Opening either composition places focus in the task title, and a container swap returns focus there.
- The options control on a task card opens task actions, including editing.
- Creation and editing are modal-based interactions, not standalone routes.

### Settings

- The Settings route will display the authenticated user information from the `profile` query.
- The API field `profile.type` represents the challenge's required “Position” value.
- User type values will be presented in a human-readable format, such as `Admin` and `Candidate`.
- The `profile` query was verified against the API: `type` returns the expected enum value and `avatar` can be `null`.
- Settings and shared avatar UI must provide an accessible fallback when no avatar URL is available.
- Settings is reached from the authenticated user's profile control, not from a dedicated sidebar or mobile-navigation tab.

## API Constraints and Confirmed Behavior

- A task has one optional `assignee`, not a list of assignees.
- `CreateTaskInput` and `UpdateTaskInput` accept one optional `assigneeId`.
- A task may be unassigned because `Task.assignee` can be `null`.
- The task `creator` is recorded by the backend from the authenticated request and cannot be selected or changed by the client.
- Task cards show only the assignee avatar. They do not display multiple participant avatars or present the creator as an assignee.
- `My Tasks` means `task.assignee.id === profile.id`; creator-owned tasks are not included unless they are also assigned to the authenticated user.

## Confirmed Initial Routes

All routes are served by the same responsive web application. Add Project is a layout-controlled screen state, not a public route: it is opened only from iOS bottom navigation or Android's floating action button. There are no multi-assignee or task-detail routes in the initial scope.

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
- The authenticated user avatar links to `/settings`; Settings is intentionally absent from sidebar and mobile navigation.

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

**Implementation status:** Complete.

### Implementation Progress

- [x] Install `lucide-react` and build the dashboard shell with AppSidebar, AppHeader, TaskToolbar, IconButton, and Avatar primitives.
- [x] Add focused shell coverage for active navigation, header controls, profile fallback, view controls, and the add-task action.
- [x] Build the static task board with typed local mock data, five chronological status columns, TaskCard metadata, and an unassigned-avatar fallback.
- [x] Add static board coverage for column counts, chronological card order, and the unassigned fallback.
- [x] Replace the My Tasks placeholder with a responsive static list filtered by the mock authenticated assignee; list view is visually selected and groups task rows into expandable status categories with counts.
- [x] Add platform-specific mobile navigation: iOS bottom actions and Android collapsible drawer navigation, with focused shell coverage.
- [x] Refine the dashboard against Figma across mobile, tablet, and desktop layouts; add focused coverage and visual evidence.

- Dashboard shell controls are visual only in this phase. Navigation remains functional through the existing routes and NavLink active states.
- The shared Avatar supports an accessible initials fallback for a missing or failed image source.
- The dashboard shell uses the provided visual reference for its contained desktop canvas, compact sidebar and toolbar controls, search field, and official Ravn SVG mark. The planned five-column task-status model remains unchanged.
- My Tasks uses a static list during the dashboard phase. It filters local fixtures by the mock authenticated assignee ID; GraphQL will later replace this fixture source with `assigneeId: profile.id`.
- My Tasks rows use a left due-date accent: red for past tasks, yellow for tasks due today or tomorrow, and green for later due dates.
- The My Tasks list omits an assignee column because every row is already scoped to the authenticated user's assignment; it shows task name, tags, estimate, and due date instead.
- Each My Tasks row keeps a trailing, visual-only options control, aligned in its own action column.
- On desktop, My Tasks is presented as a table-like list with aligned column headers and visible row and cell separators. The header is a separate, same-width table row with a deliberate gap before task categories; below the desktop breakpoint, every row reflows its title, tags, estimate, due date, and actions into a compact stacked layout.
- Empty My Tasks status categories are expanded by default and show the existing empty-state copy in a centered, full-width table row.
- Dashboard visual refinement preserves readable task-card dimensions by using an internal horizontal board scroll when all five status columns cannot fit. Header, toolbar, and card spacing are compacted to better match the reference composition.
- Platform-specific mobile navigation uses a fixed three-action iOS bottom bar (`Dashboard`, visual-only `Add Project`, and `My Tasks`) and an Android collapsible, desktop-style sidebar with the centered Ravn mark and primary task navigation. Settings remains profile-only on both platforms.
- At widths below `768px`, non-Android browsers use the iOS-style navigation pattern; its Add Project action opens the layout-controlled Create composition.
- Selecting Dashboard or My Tasks always closes the layout-controlled Add Project composition before rendering the selected route.
- Exactly one navigation item has the visual active state at a time: Add Project suppresses the underlying route's active styling while its composition is open.
- If Add Project is open and the viewport reaches the desktop breakpoint (`768px`), the composition closes automatically and restores the route that was visible before it opened. **Superseded during the GraphQL phase by decision 5.14:** the composition now becomes the desktop creation modal and keeps its draft instead of closing.
- The search placeholder is hidden while its input has focus, leaving the active text-entry area visually clear.
- On iOS-style mobile navigation, the search field is a bordered, rounded control and the toolbar becomes a full-width textual `Dashboard` / `Task` toggle. The separate add-task button is hidden in this presentation.
- Dashboard status-column headers do not expose options menus; only task cards have visual options controls. My Tasks preserves its desktop table columns on mobile inside a touch-scrollable horizontal viewport.
- The desktop My Tasks table omits the separate `My Tasks` task-count heading row; mobile retains it for its compact presentation.
- The iOS Add Project action and Android floating action button open the same layout-controlled static composition with close, create, task-title, estimate, label, assignee, and due-date controls. It cannot be reached directly by URL. Despite its navigation label, the reference uses task-oriented fields; no new project data model or backend request is inferred during the static dashboard phase.
- The iOS bottom navigation shows visible, compact `Dashboard`, `Add Project`, and `My Tasks` labels. Its Add Project icon is a plus symbol inside a circular background and does not show link underlining when active.
- Android mobile uses no bottom navigation. Its left-side drawer opens through a rightward edge swipe, closes through a leftward drawer swipe, backdrop tap, or destination selection, and the normal task views expose a floating red Add Task button in the lower-right corner. The toolbar's inline add button is hidden for this presentation.
- Android navigation opens with a rightward swipe from the left screen edge and closes with a leftward drawer swipe, backdrop tap, or destination selection; no visible drawer trigger is shown. The profile moves to the upper-left, while search and notification become icons on the upper-right. Android's toolbar uses full-width textual `Dashboard` / `Task` tabs with an accent underline for the active view.
- Android drawer navigation rows span the complete drawer width; labels and icons retain left inner padding while the active indicator is flush with the right edge.
- Active navigation rows in desktop and Android sidebars use a coral gradient that starts at the right-edge indicator and fades toward the left.
- Sidebar navigation is visually stable on pointer hover; active and inactive colors do not change until navigation state changes.
- Interactive visual mockups are delivered incrementally. Each commit groups one coherent user flow (for example, task creation modal or task-card options menu) with its route/UI state, close behavior, accessibility coverage, and plan update; unrelated mockups are not bundled into the same change.
- The `Add Project` control was visual-only during the Dashboard UI phase. The current GraphQL phase will connect that existing composition to task creation. On Android phones, the sidebar is a collapsible drawer so My Tasks remains readable on narrow screens.
- Final visual validation was completed at `390×844` (mobile), `768×900` (breakpoint/tablet), and `1440×900` (desktop). Each viewport kept page-level horizontal overflow at zero; internal task-board and task-table horizontal scrolling remains intentional where required.

## GraphQL Data and Creation: Current Scope

**Implementation status:** Complete.
**Tracking:** [Issue #6](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge/issues/6) on `feat/graphql-task-data`.

### Verified API Contracts

| ID   | Contract                                                                                                                                                                                                                                                               | Evidence                                                                                  | Implementation impact                                                                                                                                                                |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 5.1  | The GraphQL endpoint requires authentication for the `profile` query. An unauthenticated request returns `UNAUTHENTICATED` with HTTP status `401`.                                                                                                                     | Read-only verification on 2026-08-04 against the configured endpoint.                     | Apollo Client must send the local `VITE_GRAPHQL_TOKEN` as authentication; no token is committed or logged.                                                                           |
| 5.2  | An authenticated `profile` query returns the current user's `id`, `fullName`, `email`, nullable `avatar`, `type`, `createdAt`, and `updatedAt`.                                                                                                                        | Authenticated read-only verification on 2026-08-04.                                       | The authenticated `profile.id` is available for My Tasks filtering and the nullable avatar continues to require a visual fallback.                                                   |
| 5.3  | The local token was not accepted by subsequent `tasks` and `profile` requests when read with a simplistic local parser; the API returned `UNAUTHENTICATED` with HTTP status `401`.                                                                                     | Rechecks performed on 2026-08-04 after the successful authenticated profile request.      | This temporary result was resolved by the `.env`-compatible handling verified in 5.4. The client must still surface authentication failures through the established API error state. |
| 5.4  | The same local configuration succeeds when its value is interpreted with `.env`-compatible quote handling.                                                                                                                                                             | Authenticated profile and task query verification on 2026-08-04.                          | Application configuration must rely on Vite's environment loading rather than a custom parser; no token normalization logic is needed in application code.                           |
| 5.5  | `tasks(input: {})` returned eight task records in the verified account. The schema exposes a list response with no pagination fields or arguments.                                                                                                                     | Authenticated read-only verification on 2026-08-04.                                       | The initial data layer can model tasks as an array; API ordering is not assumed and board ordering remains client-controlled.                                                        |
| 5.6  | `tasks(input: { assigneeId: profile.id })` is valid and returned an empty list for the authenticated profile without an error.                                                                                                                                         | Authenticated read-only verification on 2026-08-04.                                       | My Tasks uses the API filter and must render its empty state when no task is assigned to the current profile.                                                                        |
| 5.7  | `Task` exposes `createdAt` but not `updatedAt`; requesting `updatedAt` fails GraphQL validation before a mutation is executed.                                                                                                                                         | Create-task verification on 2026-08-04.                                                   | Task fragments and TypeScript models must not include `updatedAt`.                                                                                                                   |
| 5.8  | `createTask` successfully created an unassigned task with the required `name`, `dueDate`, `pointEstimate`, `status`, and `tags` fields. The response contains the created task, nullable `assignee`, non-null `creator`, and `createdAt`.                              | Approved API mutation on 2026-08-04; its temporary audit record was subsequently deleted. | The creation feature can omit `assigneeId`, should request only confirmed Task fields, and can update the local task collection from the mutation result.                            |
| 5.9  | The `users` query successfully returns `User` records with all documented fields. A complete `tasks(input: {})` query returned every documented Task field, a nullable `assignee`, and a non-null `creator`; `position` is a numeric, non-null server value.           | Authenticated read-only verification on 2026-08-04.                                       | The application can use the listed profile, user, and task selection sets directly; Avatar continues to handle nullable values.                                                      |
| 5.10 | All valid `FilterTaskInput` fields were exercised. `assigneeId`, `dueDate`, `pointEstimate`, and `status` match exactly; `name` performs a partial, case-sensitive match; different filter fields combine with AND; `tags` matches when any supplied tag matches (OR). | Authenticated read-only verification on 2026-08-04.                                       | Search uses the API `name` filter and preserves case-sensitive API semantics. The future combined-filter UI can send all active fields in one input and treats multiple tags as OR.  |
| 5.11 | `ownerId` accepts a valid UUID but does not change the task result set. An invalid UUID returns `BAD_USER_INPUT` with HTTP status `400` and message `ownerId must be a UUID`.                                                                                          | Authenticated read-only verification on 2026-08-04.                                       | `ownerId` is not used by product filtering. API error handling must preserve useful validation feedback.                                                                             |
| 5.12 | `updateTask` successfully updates `name`, `dueDate`, `pointEstimate`, `status`, `tags`, and `assigneeId`; an explicit `assigneeId: null` clears the assignment.                                                                                                        | Controlled create/update/delete audit on 2026-08-04.                                      | The later edit feature can update these fields and clear an assignee through `null`.                                                                                                 |
| 5.13 | Updating `position` fails with GraphQL error code `422` and database message `incorrect binary data format in bind parameter 4`. A combined update containing `position` fails for the same reason.                                                                    | Controlled create/update/delete audit on 2026-08-04.                                      | Do not send `position` through `updateTask`; drag-and-drop reordering remains blocked by the current API implementation and is not included in the initial edit flow.                |
| 5.14 | `deleteTask` returns the deleted task and removes it from subsequent `tasks(input: {})` results. Temporary audit fixtures were deleted after verification.                                                                                                             | Controlled create/update/delete audit on 2026-08-04.                                      | The later deletion feature can remove the task from local state after a successful mutation.                                                                                         |

### Implementation Progress

- [x] Verify whether the configured endpoint allows unauthenticated API access.
- [x] Confirm the local token configuration and authenticated API access.
- [x] Inspect the schema-level task, user, status, query, and mutation contracts.
- [x] Verify task-query behavior with a currently valid token.
- [x] Verify the create-task mutation with approved test data.
- [x] Verify query, filter, update, and deletion behavior with controlled API tests; remove temporary test fixtures.
- [x] Install Apollo dependencies and configure typed environment access, Apollo Client, authorization headers, provider, GraphQL operations, API models, mappers, and reusable test mocks.
- [x] Replace Dashboard task fixtures with `GET_TASKS`, use `GET_PROFILE` for the authenticated header, and provide accessible loading, error-with-retry, and empty states.
- [x] Replace My Tasks fixtures with `GET_PROFILE` followed by `GET_TASKS(input: { assigneeId: profile.id })`; preserve categories, mobile table scrolling, and accessible loading, error-with-retry, and empty states.
- [x] Build the shared responsive task-creation form: desktop modal and existing mobile full-page composition, with layout-owned draft state, an accessible `Modal` primitive, and the confirmed status, tag, and estimate enums.
- [x] Load users with `GET_USERS` and pass them to the assignee control, which already renders and selects from a supplied list.
- [x] Connect creation to the confirmed create-task mutation.
- [x] Add GraphQL operation and state coverage.
- [x] Open [PR #7](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge/pull/7) linked to Issue #6; its GitHub Actions quality checks passed after a rerun, the first attempt having been cancelled by a GitHub Actions incident that never acquired a runner.

### Deferred From This Phase

Each of these was reached, judged, and left on purpose rather than missed.

- The Android composition wears the iOS palette apart from its Material date dialog. Only the picker was in scope; aligning the whole screen to Material is its own piece of work (5.40).
- The desktop tag control stacks its selected tags downwards, so it grows taller than the four controls beside it now that the row cannot wrap (5.42).
- A due date is stored as an instant, so a reader across the date line sees the neighbouring calendar day. This is the limit of the representation rather than a defect in the arithmetic (5.45).
- The design system has no error colour; the accent carries invalid controls and failure messages until it gains one (5.44).

## Task Editing and Deletion: Current Scope

**Implementation status:** In progress.
**Tracking:** [Issue #8](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge/issues/8) on `feat/task-edit-delete`.

No API verification is required before implementation. Every contract this phase needs was confirmed during the previous one and is recorded above: 5.12 for the fields `updateTask` accepts and for clearing an assignee with an explicit `null`, 5.13 for the `position` limitation that keeps reordering out of scope, and 5.14 for deletion.

### Implementation Progress

- [ ] Rename `features/task-creation` to `features/task-form` and add `features/task-actions`, so no feature has to import a sibling.
- [ ] Add `toUpdateTaskInput` beside `toCreateTaskInput`, translating an empty assignee to an explicit `null` instead of omitting it.
- [ ] Open task actions from the existing task-card options control.
- [ ] Prefill the shared responsive composition from the selected task and connect it to `updateTask`.
- [ ] Connect deletion to `deleteTask` behind an accessible confirmation step.
- [ ] Keep Dashboard and My Tasks consistent after a successful mutation.
- [ ] Add coverage for edit prefill, a successful update, a cleared assignee, a successful deletion, and failure states.
- [ ] Run final local validation: `format:check`, `typecheck`, `lint`, `test`, and `build`.
- [ ] Open the pull request linked to Issue #8 and confirm its GitHub Actions quality checks pass.

## Decision Log

### Current Decisions

### 1. Pre-Initial Setup: Repository and Workflow

| ID  | Decision                                                                                                | Rationale                                               |
| --- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1.1 | The repository is public and owned by `fabianespinoza-ravn`.                                            | Required by the challenge.                              |
| 1.2 | Scoped work uses issues, dedicated branches, Conventional Commits, pull requests, and automated checks. | Provides a clear, incremental project history.          |
| 1.3 | Repository materials and application text are written in English.                                       | Keeps the submission consistent and evaluator-friendly. |

### 2. Product and API Behavior

| ID  | Decision                                                                                                                        | Rationale                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 2.1 | The deliverable is a responsive web application for desktop and mobile browsers on iOS and Android, not native mobile software. | Matches the React, CSS, Figma, and browser-based GraphQL scope.                                |
| 2.2 | A task has zero or one assignee; task cards show only the optional assignee avatar.                                             | The API supports one optional assignee, not multiple participants.                             |
| 2.3 | My Tasks filters by authenticated user `assigneeId`.                                                                            | Matches the API and gives the route a clear meaning.                                           |
| 2.4 | The required "Position" value is represented by `profile.type`.                                                                 | The API exposes `type` with `ADMIN` and `CANDIDATE` values, but no separate `position` field.  |
| 2.5 | Profile avatars may be `null`; shared avatar UI uses an accessible fallback rather than a broken image.                         | Confirmed by the profile API response.                                                         |
| 2.6 | Settings remains available at `/settings` but is accessed exclusively from the profile control.                                 | Keeps primary navigation focused on task work and applies consistently on desktop and mobile.  |
| 2.7 | Mobile navigation differs by platform: iOS has a three-action bottom bar; Android uses a desktop-style sidebar.                 | Requested visual navigation model; it remains one responsive web application, not native apps. |

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

### 5. GraphQL Data and Creation: Foundation

Dashboard data decisions:

- **5.9:** Resolve `profile.id` before requesting My Tasks and send it as `tasks(input: { assigneeId })`; do not filter the complete collection in the client. This applies the verified API contract directly and avoids downloading irrelevant tasks.
- **5.10:** Keep the My Tasks table and all five expandable categories visible when the assigned-task query returns an empty array. This preserves the established responsive table and makes the empty result understandable without a layout change.

Task creation decisions:

- **5.11:** Use one shared task form in two responsive containers: a modal at desktop widths and the existing Add Project full-page composition below the breakpoint. The route remains layout-controlled, not public. **Refined by 5.21 and 5.30.**
- **5.12:** Deliver the visual/form interaction and its responsive containers in one commit before connecting users and `createTask` in the next. This keeps UI review independent from backend behavior while preserving one coherent user flow per commit.
- **5.13:** `AppLayout` owns the single task-creation state and exposes its trigger through `TaskCreationContext`. `TaskToolbar` consumes that context instead of receiving a callback drilled through every page, and `useTaskCreation` throws outside a provider so a disconnected control fails loudly rather than silently doing nothing.
- **5.14:** Task creation survives a breakpoint change: crossing the modal breakpoint swaps the container between the desktop modal and the full-page composition while preserving the draft. This supersedes the Dashboard UI rule that closed Add Project on reaching desktop width, because a shared form that silently empties itself is worse than either container alone.
- **5.15:** Because the draft must outlive the container that unmounts during that swap, the form state is owned by `useTaskCreationForm` in `AppLayout` and `TaskForm` is a fully controlled presentational component. This moves controlled fields into the responsive-form commit rather than the mutation commit, and leaves the mutation commit to add validation, users, and `useMutation` to the same hook.
- **5.16:** Closing, cancelling, or navigating away discards the draft; the breakpoint swap does not. Discarding on an explicit dismissal keeps the next creation predictable, while the swap is an involuntary viewport event the user did not request.
- **5.17:** The form exposes `status` even though the static Figma composition does not show it, because `createTask` requires it. Assignee is rendered as a disabled control with an accessible hint instead of being omitted, so the four-field composition is reviewed once and the mobile experience does not regress mid-branch.
- **5.18:** Add an accessible `Modal` primitive in `shared/ui` with `role="dialog"`, `aria-modal`, `aria-labelledby`, initial focus, focus restoration, a `Tab` focus trap, `Escape`, and backdrop dismissal. Task editing and task-card actions will reuse it.
- **5.19:** Both containers place their `Create` control outside the `<form>` element and target it through the HTML `form` attribute. One shared form element then serves the mobile action bar and the desktop modal footer without duplicating submit logic.
- **5.20:** Point-estimate and tag labels move from private constants in `taskMapper` to `entities/task/model/taskLabels.ts`. The creation form and the board presentation now read the same source instead of maintaining parallel copies.
- **5.21:** The desktop modal follows the reference composition instead of reusing the mobile stacked form, so **5.11 now applies to the draft state, not to a single form component**. `TaskMetadataForm` renders the desktop presentation and `TaskForm` the mobile one; both are controlled by the same `useTaskCreationForm` state, which is what keeps the breakpoint swap in 5.14 lossless.
- **5.22:** Each metadata control is a `FieldDropdown`: a trigger that reports its value through `aria-label`, `aria-expanded`, and `aria-haspopup`, and a panel that closes on selection, outside click, or `Escape`. `Escape` is handled in the capture phase so it closes the open dropdown before the modal sees it; the first `Escape` never discards the draft.
- **5.23:** The `Label` dropdown stays open while tags are toggled, unlike the other three. `Task.tags` is a list in the API, so closing after each choice would force the user to reopen the control for every tag. Its trigger renders one chip per selected tag rather than a `+N` counter, so the full selection stays readable. The chips stack in a single column, which grows the control downwards and keeps the metadata row from widening.
- **5.24:** Status is an explicit, required choice with no preselected value, even though the reference compositions do not show it: `createTask` requires it, and silently filing every new task in one column would hide a decision the user is entitled to make. The desktop row carries a fifth control for it, whose options reuse the colour each status already has on the board, and the mobile composition keeps its status select. A `BACKLOG` default was implemented first and rejected for that reason.
- **5.25:** The assignee control lists teammates as avatar-and-name rows, and once one is chosen its trigger replaces the default icon and label with that avatar and name. The list arrives through an `assignees` prop rather than a query inside the field, so the mutation commit only has to supply `GET_USERS` data. Until it does, the dropdown reports an accessible empty state instead of rendering placeholder users. This refines 5.17, which had made assignee a disabled select. Avatars are `aria-hidden` because the name is already rendered beside them.
- **5.26:** The due-date control is a self-contained month calendar with month and year navigation, dimmed adjacent-month days, an accent-highlighted selection, and a `Today` action. Its panel opts out of the shared dropdown height cap so the calendar never shows a scrollbar. Its dates are formatted from local date parts rather than `toISOString`, which would shift the stored day west of UTC.
- **5.27:** The modal has no header. The reference composition titles it with a project name, but the API exposes no project entity, so there is nothing truthful to render there. The dialog is named for assistive technology through `aria-label`, and the task-title field is the first thing the user sees.
- **5.29:** The borderless task title suppresses the shared accent focus ring and shows no focus rule of its own. A text field matches `:focus-visible` even when clicked, so any ring or underline appeared on every pointer interaction and read as an error state. The text caret is its focus indicator, matching the reference composition. This is a deliberate, documented exception to the project-wide `focus-visible` rule and applies only to this field; every other control in the feature keeps its visible focus ring.
- **5.30:** The task-creation modal starts at the shared `768px` layout breakpoint, which is exactly where the toolbar add-task control becomes visible and where the sidebar `Add Project` control is hidden. Each creation control therefore always leads to the same container: the add-task control to the modal, and `Add Project` or the Android action button to the full-page composition. A `1024px` variant was evaluated so that tablets would get the touch-friendlier full-page form, and rejected: it made the add-task control open a different container between `768px` and `1023px`, and left that band with no highlighted navigation item while the full-page composition was open. Measurement also showed the concern behind it was overstated — the `34rem` panel fits at `768px` with roughly `96px` of margin on each side.
- **5.31:** Every option in the label dropdown reflects its own selection state through its icon: a filled, accent-tinted diamond on desktop and a checked box on iOS. Selection is therefore conveyed by shape as well as by colour and by `aria-pressed`.
- **5.34:** The iOS composition follows the reference screen rather than the stacked, labelled form it first shipped with. Its task title is the prominent element, its fields are full-width rows carrying an icon and their own value, and each opens an anchored popover headed by the field name, except the due-date wheel, whose three columns already name themselves. `FieldDropdown` gained a `row` variant for the layout difference; every colour comes from custom properties the composition sets, so the same field components serve both presentations without a second implementation. Its popovers are centred over the screen behind a dimmed backdrop rather than anchored to the row, because an anchored panel opened from a lower field would run off a phone viewport. Desktop keeps its anchored placement.
- **5.35:** The iOS palette is defined on the composition root rather than in the global token file: `#2c2c2e` for the field rows, `#3a3a3c` for the popovers, white text, and `#8e8e93` for secondary text. Those values belong to that one screen, and promoting them to global tokens would imply the rest of the application shares them. The screen tone `#1c1c1e` is the one exception and is applied by the layout instead, because only the layout root spans the viewport: painted on the composition, it left the page colour showing through the content padding and below the last field, which read as two backgrounds rather than one screen. The wheel keeps its own black surface, since removing it costs the receding values the contrast their depth fade depends on.
- **5.36:** The iOS due-date field uses a three-column month, day, and year wheel instead of the desktop calendar, and its popover stays open while all three are chosen. Each column scrolls with `scroll-snap`. What the wheel highlights and what the form holds are separate: the value under the centre line is white and full size while its neighbours recede in scale and opacity, and it follows the scroll immediately, but it is committed only after the column settles. A column therefore never re-scrolls a value it just committed, which would fight the momentum still resolving under the finger; only a change arriving from outside the column, such as the day clamped by a shorter month, moves it back to the centre. Items remain buttons, so the same wheel also answers to a click and to the keyboard, which a drag-only control would not. Blank rows at either end let the first and last values reach the centre, and the scroll handler measures the rendered item height rather than assuming one. Choosing a shorter month clamps the day instead of rolling into the next month. The wheel sits on its own black surface, larger than the other popovers, so the three columns stay legible while centred over the screen. That surface carries a definite width rather than a maximum, and its labels never wrap: the overlay centres a content-sized panel, so the wheel would otherwise change width as a longer month scrolled past, and a wrapped label would corrupt the item height the scroll handler measures.
- **5.37:** The iOS `Create` control turns from secondary to solid once every required field carries a value. It stays an affordance rather than a gate: pressing an incomplete draft is how that draft names what it is missing, so the control is disabled only while a request is already in flight. See 5.44.
- **5.38:** The iOS composition names itself through a visually hidden heading so the task title can be the prominent element on screen, as in the reference, without leaving the screen unnamed for assistive technology.
- **5.39:** The layout fetches the assignable teammates, because it already owns the draft both containers write to and either one may be the container on screen. The query is skipped until a draft is open, so a list only task creation needs does not load on every page view, and the Apollo cache answers every later open. The assignee control keeps receiving its list through a prop and issues no query of its own, so it stays usable in isolation and in tests.
- **5.45:** Task cards name the days a reader thinks in: `Today`, `Tomorrow`, `Past due`, and `10 Aug, 2026` beyond that. That order is the reference composition's, and its parts come from `Intl` so month abbreviations stay its business and only their arrangement is ours. The static phase's fixtures already read this way, but the mapper that replaced them with API data produced only `Past due` or a date, which lost the two labels a board is scanned for. Yesterday stays `Past due` rather than returning to the fixtures' `Yesterday`, because overdue is the more useful thing to say about it. Both sides are reduced to a local calendar day before they are compared: the API stores an instant, so a task due today is only today once it is read in the viewer's own timezone, and comparing instants would call it yesterday's for a reader west of the stored moment. Noon UTC carries a calendar day intact from `UTC-11` to `UTC+11`; beyond that a reader across the date line would see the neighbouring day, which is the limit of representing a calendar day as an instant and is accepted.
- **5.44:** Validation follows the confirmed policy without disabling the submit control. Nothing is reported missing until the draft has been submitted once, so an untouched form does not open covered in complaints, and the list of missing fields is derived from the values rather than stored beside them, so filling a field clears its own message. `Create` is therefore never disabled for being incomplete — pressing it is what names the gaps — and is taken away only while a request is in flight. The controls point at that message with `aria-describedby` rather than carrying `aria-invalid`, which ARIA does not support on `role="button"`; the title, a real text input, carries both. The accent doubles as the error colour until the design system gains one of its own.
- **5.43:** Creation submits through `createTask` and refetches `GET_TASKS` by document, which refreshes the board and My Tasks together without this feature deciding whether a new task belongs in a filter the server owns. That costs a round trip and avoids duplicating a server rule that would drift. One function builds the request and answers whether the draft can be sent, so the control and the request can never disagree. The due date leaves as noon UTC, because the draft holds a local calendar day and midnight would name the neighbouring one east or west of the meridian. A failure keeps the draft open and reports it, per the error policy. The contracts confirmed `createTask` accepts a `dueDate` but not its literal format; ISO 8601 was inferred from the timestamps the API returns elsewhere, and two real creations on 2026-08-06 confirmed it, both appearing on the board under the status they were given.
- **5.42:** The desktop metadata controls hold one centred row at every fill state. The modal widens to `44rem`, which still fits at the `768px` breakpoint where it first appears, and the row no longer wraps: the controls share the width and truncate, which is what the trigger label's ellipsis was always styled for but could never reach while each control sized itself freely to its content. Truncating beats wrapping here because each control swaps its generic label for the chosen value, so a wrapping row grew as the draft filled and changed the modal's height under the user. `safe center` keeps a row that somehow could not shrink far enough from centring its own overflow past an edge nothing can reach.
- **5.41:** Platform detection prefers the User-Agent Client Hint and keeps the user agent string as its fallback. Chromium retains the hint as it trims that string, and device emulation sets both, so an emulated Pixel and a physical one answer alike. A hint naming the host instead, which is what a user-agent override alone produces, falls through to the string rather than deciding.
- **5.40:** Android opens Material's date dialog where iOS opens the wheel. The choice is made inside the field through `getMobilePlatform()`, because the `row` variant describes the layout both phones share rather than the system whose convention the picker follows. The dialog holds a pending day and writes to the draft only on `OK`; the desktop calendar and the wheel both commit as soon as a value is chosen, but this one's own `Cancel` promises otherwise, and Escape closes it the same way. Its coral is `--color-accent` rather than a second near-identical hex. The rest of the Android composition still wears the iOS palette; that mismatch is accepted for now, since only the picker was in scope.
- **5.33:** Both compositions place focus in the task title when they mount, so a container swap returns the caret to the draft instead of leaving it on an empty dialog. The modal focuses its first control rather than its panel, and the full-page composition focuses through a ref because it replaces the whole route and behaves like a modal surface.
- **5.32:** Only the full-page composition takes the active navigation state away from the current route, because only it hides that route. The desktop modal leaves the route highlighted, since the board stays visible behind it. Combined with 5.30, the full-page composition now only appears below `768px`, which is exactly where the `Add Project` control exists to receive that highlight; there is no width at which the route gives up its active state and no control takes it.
- **5.28:** `Modal` gains an optional `label` and `panelClassName` so a feature can name its dialog and size its panel without the shared primitive learning about task creation. The modal surface uses new `--color-surface-overlay` and `--color-surface-overlay-raised` tokens.

| ID  | Decision                                                                                                                                                                       | Rationale                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 5.1 | Use Apollo Client with an `HttpLink`, normalized in-memory cache, and an `Authorization: Bearer <token>` header sourced from typed Vite environment configuration.             | Centralizes authentication and transport configuration without exposing or committing the token.                                    |
| 5.2 | Keep GraphQL operation documents alongside their domain entities: user operations in `entities/user/api` and task operations in `entities/task/api`.                           | Makes the verified API contract discoverable where its types and UI consumers live.                                                 |
| 5.3 | Keep API task models separate from the existing presentation task model and convert them through a mapper.                                                                     | Preserves the static dashboard's visual contract while allowing API enums, nullable fields, and server data to enter incrementally. |
| 5.4 | Default unavailable visual-only task metadata (attachments, checklist items, and comments) to zero in the mapper.                                                              | Those values are displayed in the static reference but are not supplied by the verified API contract.                               |
| 5.5 | Use reusable Apollo `MockedResponse` factories for query tests; do not call the live API from automated tests.                                                                 | Keeps tests deterministic, private, and independent of token validity or remote data changes.                                       |
| 5.6 | Fetch Dashboard tasks with Apollo `useQuery` and derive mapped, chronological presentation data with `useMemo`; do not use `useEffect` or component state for remote fetching. | Apollo owns request, cache, loading, error, and refetch lifecycles, while the component retains only render responsibility.         |
| 5.7 | Make `TaskBoard` receive presentation tasks through props instead of importing fixtures.                                                                                       | Removes its data-source coupling and allows the static visual component to render API, test, or future filtered data.               |
| 5.8 | Keep profile retrieval in the shared header and preserve initials fallback until profile data is available or if the query fails.                                              | The authenticated identity is relevant throughout the app and should not block task-board rendering.                                |

### 6. Task Editing and Deletion

- **6.1:** An empty assignee means different things to the two mutations, so each operation gets its own translation from the draft: `toCreateTaskInput` omits `assigneeId` when it is empty, per contract 5.8, and `toUpdateTaskInput` sends an explicit `null`, per contract 5.12. Reusing the creation mapper for an update would let a user clear an assignee, receive a successful response, and find the assignment intact, with nothing anywhere to explain it; the request succeeds, and only the arguments it carried reveal the mistake, which is why the tests assert those arguments rather than that a mutation was called. Two alternatives were rejected. Widening the draft's `assigneeId` to `string | null | undefined` models `updateTask` fully, but it adds a "leave this field alone" state that the composition can never produce, because it edits a complete task rather than a patch; it would touch every field component and the verified creation path in order to represent a case that does not exist. Diffing the current values against the prefilled original computes what changed in order to infer what the API should do, when the draft already states how the task should end up; it cannot diff blindly either, since `position` has to be excluded per 5.13, and it would add a second piece of state that must survive the container swap in 5.14 alongside the draft it is meant to describe. Keeping the difference in the mappers leaves the form, its fields, and the creation path untouched, and puts each rule beside the contract that causes it. **This assumes the composition always submits every field.** A later partial update, such as changing status straight from the task-card menu without opening the form, would break that assumption and reopen the rejected tri-state.
- **6.2:** `features/task-creation` becomes `features/task-form`, which serves creation and editing alike, and deletion goes to a new `features/task-actions` with the task-card options menu. Naming the whole folder for the form would have misdescribed deletion, which has no form at all. The folder structure already describes `features/` as "user actions such as creating, editing, filtering, and moving tasks", so both belong there as siblings. Neither imports the other: the options menu reports that an edit was requested and `AppLayout` opens the composition, extending the ownership 5.13 already gave it over the single creation state. The rename lands in its own `refactor:` commit before any behavior changes, so the feature diff can be read without import churn; only five files outside the folder refer to it, because everything inside it imports relatively.
