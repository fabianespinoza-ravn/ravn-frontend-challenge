# Development

## Prerequisites

- Node.js `>=22 <25`
- npm `>=10`

## Local setup

```powershell
npm install
Copy-Item .env.example .env.local
```

Set `VITE_GRAPHQL_ENDPOINT` and `VITE_GRAPHQL_TOKEN` in `.env.local`, then start Vite:

```powershell
npm run dev
```

On PowerShell systems that block `npm.ps1`, use `npm.cmd`, for example `npm.cmd run test`.

## Quality checks

| Command                 | Purpose                                              |
| ----------------------- | ---------------------------------------------------- |
| `npm run format:check`  | Verify Prettier formatting.                          |
| `npm run typecheck`     | Run TypeScript project checks.                       |
| `npm run lint`          | Run ESLint with React Hooks and accessibility rules. |
| `npm run test`          | Run Vitest once.                                     |
| `npm run test:coverage` | Generate local coverage reports.                     |
| `npm run build`         | Type-check and build with Vite.                      |

GitHub Actions runs formatting, type checking, linting, tests and production build on pull requests and pushes to `main`.

## Delivery conventions

- Use a dedicated branch for each change.
- Use Conventional Commit messages.
- Keep pull requests focused and include relevant tests and documentation updates.
- Do not commit `.env.local`, access tokens, generated coverage reports or local machine configuration.
- Use CSS Modules for component styles; global styles are limited to reset, tokens and document-level rules.

## Testing guidance

Use React Testing Library for user-visible behavior and Apollo mocks for GraphQL flows. Do not make live API calls from automated tests: token validity and remote data must not control test results.
