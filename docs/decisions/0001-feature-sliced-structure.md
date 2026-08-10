# ADR 0001: Feature-sliced folder structure

- **Status:** Accepted
- **Date:** 2026-08-10

## Context

The application combines route screens, reusable UI, task workflows, GraphQL operations and domain models. A generic `components` directory would not communicate ownership or dependency direction.

## Decision

Use the layered `app`, `pages`, `widgets`, `features`, `entities` and `shared` structure. Co-locate CSS Modules and tests with their responsible component or feature. Avoid broad barrel exports.

## Consequences

Ownership is visible from paths and dependency direction remains clear. New contributors must choose the correct layer before adding code, which is a small cost that prevents feature and entity responsibilities from mixing.
