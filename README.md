# Ravn Frontend Challenge — Task Management

A responsive task-management web application built for the Ravn Frontend Challenge. The project is developed incrementally, with decisions and progress recorded in the [implementation plan](docs/implementation-plan.md).

## Current status

Initial Setup is in progress. The application foundation, routing, styling system, quality tooling, tests, and continuous integration are available. The dashboard interface and GraphQL task functionality are implemented in subsequent phases.

## Planned capabilities

- Browse tasks grouped by status.
- View tasks assigned to the authenticated user.
- Create, edit, and delete tasks.
- Search and combine task filters.
- View authenticated-user information in Settings.
- Use the provided GraphQL API.

## Technology

- React and TypeScript
- Vite
- React Router
- CSS Modules with global design tokens
- ESLint and Prettier
- Vitest and React Testing Library
- GitHub Actions

## Prerequisites

- Node.js `>=22 <25`
- npm `>=10`

## Local setup

1. Clone the repository and enter its directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local environment file:

   ```bash
   cp .env.example .env.local
   ```

   On PowerShell, use:

   ```powershell
   Copy-Item .env.example .env.local
   ```

4. Add your GraphQL token to `VITE_GRAPHQL_TOKEN` in `.env.local`. Do not commit this file.
5. Start the development server:

   ```bash
   npm run dev
   ```

The application is available at the URL displayed by Vite, normally `http://localhost:5173`.

`VITE_GRAPHQL_ENDPOINT` is prefilled with the challenge API endpoint in `.env.example`. GraphQL requests are introduced in the dedicated API phase; the environment file is prepared in advance and contains no secret values.

## Available scripts

| Command                 | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `npm run dev`           | Start the local development server.                |
| `npm run build`         | Type-check and build the production application.   |
| `npm run preview`       | Preview the production build locally.              |
| `npm run typecheck`     | Check TypeScript types without generating a build. |
| `npm run lint`          | Run ESLint.                                        |
| `npm run lint:fix`      | Apply ESLint fixes where safe.                     |
| `npm run format`        | Format repository files with Prettier.             |
| `npm run format:check`  | Verify formatting without changing files.          |
| `npm run test`          | Run the test suite once.                           |
| `npm run test:watch`    | Run tests in watch mode.                           |
| `npm run test:coverage` | Generate the test coverage report.                 |

## Architecture and decisions

The codebase uses a simplified feature-sliced structure:

- `src/app`: application providers, routing, shell, and global styles.
- `src/pages`: route-level pages.
- `src/widgets`: larger composed Figma sections.
- `src/features`: user interactions and use cases.
- `src/entities`: task and user domain concerns.
- `src/shared`: reusable UI primitives, utilities, configuration, and assets.
- `src/test`: shared testing utilities and mocks.

Folders are created when they receive an active responsibility; placeholder folders are intentionally avoided. Component styles are colocated CSS Modules, while reset rules and design tokens are global. The responsive implementation is mobile-first for browser use on desktop, iOS, and Android.

For the complete route model, API constraints, delivery phases, and decision history, read the [implementation plan](docs/implementation-plan.md).

## Quality and continuous integration

The project uses strict TypeScript, ESLint, Prettier, Vitest, and React Testing Library. GitHub Actions runs formatting verification, type checking, linting, tests, and a production build for pull requests and pushes to `main`.

Run the same checks locally before opening a pull request:

```bash
npm run format:check
npm run typecheck
npm run lint
npm run test
npm run build
```

## Security

Environment files and credentials are ignored by Git. Never commit API tokens, secrets, or personal configuration. Use `.env.example` only as a template.

## Visual evidence

Screenshots and GIFs will be added as each user-interface phase is completed.
