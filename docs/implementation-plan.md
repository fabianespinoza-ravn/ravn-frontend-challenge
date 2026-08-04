# Implementation Plan and Decision Log

> **Status:** Planning — Initial Setup is ready to begin after architecture decisions are confirmed.  
> **Last updated:** 2026-08-04

## Documentation Rule

This file is the repository's source of truth for confirmed product decisions, implementation progress, scope changes, and technical rationale.

- Update it before starting a phase, when a decision changes, and when a phase is completed.
- Preserve previous decisions in the decision log; do not rewrite history.
- Keep repository content, issues, pull requests, commits, and user-facing application text in English.

## Repository and Delivery Workflow

- Repository: [ravn-frontend-challenge](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge)
- Default branch: `main`
- Development workflow: issue → dedicated branch → small Conventional Commits → pull request → automated checks and self-review → squash merge.
- GitHub Project: [Task Management Challenge](https://github.com/users/fabianespinoza-ravn/projects/1)
- Project workflow: `Backlog` → `Ready` → `In progress` → `In review` → `Done`.
- Issue [#1 Initial Setup](https://github.com/fabianespinoza-ravn/ravn-frontend-challenge/issues/1) is in `Ready` and must not move to `In progress` until the architecture discussion is complete.

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

## API Constraints and Confirmed Behavior

- A task has one optional `assignee`, not a list of assignees.
- `CreateTaskInput` and `UpdateTaskInput` accept one optional `assigneeId`.
- A task may be unassigned because `Task.assignee` can be `null`.
- The task `creator` is recorded by the backend from the authenticated request and cannot be selected or changed by the client.
- Task cards show only the assignee avatar. They do not display multiple participant avatars or present the creator as an assignee.
- `My Tasks` means `task.assignee.id === profile.id`; creator-owned tasks are not included unless they are also assigned to the authenticated user.

## Initial Setup: Current Scope

The following items are required before product functionality is implemented:

- React, TypeScript, and Vite application foundation.
- Initial folder structure with clear ownership boundaries.
- Routing with Dashboard, My Tasks, Team, Settings, Profile handling, Not Found, and route error states.
- Styling foundation, global styles, design tokens, and a reusable visual component approach for Figma replication.
- Linting, formatting, test baseline, and local quality scripts.
- Global Error Boundary.
- GitHub Actions for type checking, linting, tests, and production builds.
- README setup and running instructions.

## Architecture Decisions in Progress

The following topics are being discussed and are not final:

- Exact folder structure and ownership boundaries.
- Route paths and whether the profile page is served by `/settings`, `/profile`, or a redirect.
- Styling implementation details and CSS naming conventions.
- Error page and Error Boundary composition.

## Decision Log

| Date | Area | Decision | Rationale | Reference |
| --- | --- | --- | --- | --- |
| 2026-08-04 | Repository | The repository is public and owned by `fabianespinoza-ravn`. | Required by the challenge. | Repository setup |
| 2026-08-04 | Workflow | Issues, dedicated branches, pull requests, Conventional Commits, and squash merges are required for scoped work. | Provides a clear, incremental history for a solo project. | GitHub Project |
| 2026-08-04 | Documentation | Repository materials and application text are written in English. | Keeps the submission consistent and evaluator-friendly. | Working agreement |
| 2026-08-04 | Platforms | The application targets desktop and responsive mobile web for iOS and Android. | Confirmed product requirement. | Product baseline |
| 2026-08-04 | Platforms | The deliverable is a responsive web application, not native iOS or Android software. | The challenge targets React, CSS, Figma, and browser-based GraphQL integration. | Product baseline |
| 2026-08-04 | Task ownership | Task cards show only the optional assignee avatar. | The API supports one optional assignee, not multiple participants. | API contract |
| 2026-08-04 | My Tasks | My Tasks filters by authenticated user `assigneeId`. | Matches the API and gives a clear meaning to the route. | API contract |
| 2026-08-04 | Settings | The required “Position” value is represented by `profile.type`. | The API exposes `type` with `ADMIN` and `CANDIDATE` values, but no separate `position` field. | API contract |
| 2026-08-04 | Architecture | Architecture implementation is deferred until the folder, routing, styling, and error-handling decisions are reviewed. | Avoids rework and keeps Initial Setup intentional. | Issue #1 |
