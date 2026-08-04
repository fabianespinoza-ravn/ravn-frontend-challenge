# Ravn Frontend Challenge — Task Management

A task management web application built for the Ravn Frontend Challenge.

## Status

This repository is currently in the bootstrap phase. The application will be developed incrementally through GitHub issues, dedicated branches, pull requests, and descriptive commits.

## Goal

Build a task management interface based on the provided designs, including:

- Task browsing by status.
- Task creation, editing, and deletion.
- Search and combined filters.
- Authenticated user information.
- Integration with the provided GraphQL API.
- Documented user-experience bonus features.

## Project Principles

- Quality and clarity over quantity.
- Maintainable architecture and reusable components.
- Responsive and accessible design.
- Small commits following Conventional Commits.
- One GitHub issue and pull request per scoped change.
- Automated validation through GitHub Actions.

## Security

API credentials must be configured locally through environment variables.

Never commit `.env` files, tokens, secrets, or sensitive data.

Refer to `.env.example` for the required variables once it is available.

## Workflow

Every change follows this process:

1. Create or select a GitHub issue.
2. Create a dedicated branch.
3. Make small, descriptive commits.
4. Open a pull request with testing details and visual evidence when applicable.
5. Run automated checks and self-review the change.
6. Squash merge into `main`.

## Next Steps

The next phase will add the application setup, architecture, routing, quality tooling, and continuous integration.
